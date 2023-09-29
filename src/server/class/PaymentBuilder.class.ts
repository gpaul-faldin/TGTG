import * as forge from 'node-forge';
import * as crypto from 'crypto';
import { randomBytes, createCipheriv, publicEncrypt } from 'crypto';

class PaymentBuilder {
  private readonly PREFIX = 'adyenan';
  private readonly VERSION = '0_1_1';
  private readonly SEPARATOR = '$';
  private readonly keySize = 32; // bytes
  private readonly ivSize = 12; // bytes
  private readonly publicKey = "10001|AD7CF1A2F6B8DF1D62391AA66947324E5E425CFCE7336077F1680970660C1752B4E1253679E792FC3EB3B84C40CB376534DD514BE651C449470858FB09B7039A80BFB387140350BAB05FC31075AF3E3675EAD70B8662206BD80D571EEFF03267202A01FD03DA7B75E29EDCDDABCE898D7FA01893FE8C1D4B9AA3BF95AD897D4BA801FC12DEAA46D4830DAAA3EF8EAE70E9AE9DFF489FF428CCABE5D48A24F819FA7A017C94567C5637374ED627F6B4FE932EC9AB69A2F207CA71F89EB73D862A7DE923006B23E496D6AC778573B2D2B55962454AD328D9C0053C2C9997512258A4DBBA56D8810C8547CFFFDB11556016EB182357DAC802183DD57D4AB512D2FD"
  private cvc: string;
  private storedPaymentMethodId: string;

  constructor(cvc: string = '', storedPaymentMethodId: string = '') {
    this.cvc = cvc;
    this.storedPaymentMethodId = storedPaymentMethodId;

  }

  public async buildFullEncryptedObject(
    number: string,
    month: string,
    year: string,
    cvc: string,
    build: boolean = true
  ): Promise<object | string> {
    if (build) {
      return JSON.stringify(this.buildFullBody({
        "type": "scheme",
        "encryptedCardNumber": await this.encrypt('number', number),
        "encryptedExpiryMonth": await this.encrypt('number', month),
        "encryptedExpiryYear": await this.encrypt('number', year),
        "encryptedSecurityCode": await this.encrypt('number', cvc),
        "threeDS2SdkVersion": "2.2.10"
      }))
    } else {
      return {
        "type": "scheme",
        "encryptedCardNumber": await this.encrypt('number', number),
        "encryptedExpiryMonth": await this.encrypt('number', month),
        "encryptedExpiryYear": await this.encrypt('number', year),
        "encryptedSecurityCode": await this.encrypt('number', cvc),
        "threeDS2SdkVersion": "2.2.10"
      }

    }
  }
  public async buildCvCEncryptedObject(
    build: boolean = true
  ): Promise<object | string | null> {
    if (this.cvc === '' || this.storedPaymentMethodId === '') {
      return (null);
    }
    if (build) {
      return JSON.stringify(this.buildFullBody({
        "type": "scheme",
        "encryptedSecurityCode": await this.encrypt('cvc', this.cvc),
        "storedPaymentMethodId": this.storedPaymentMethodId,
        "threeDS2SdkVersion": "2.2.10"
      }))
    } else {
      return {
        "type": "scheme",
        "encryptedSecurityCode": await this.encrypt('cvc', this.cvc),
        "storedPaymentMethodId": this.storedPaymentMethodId,
        "threeDS2SdkVersion": "2.2.10"
      }

    }
  }

  private convertToPem(publicKeyString: string): string {
    const parts = publicKeyString.split('|');
    const modulus = new forge.jsbn.BigInteger(parts[1], 16);
    const exponent = new forge.jsbn.BigInteger(parts[0], 16);

    const key = forge.pki.setRsaPublicKey(modulus, exponent);
    return forge.pki.publicKeyToPem(key);
  }
  private isPublicKeyValid(publicKeyString: string): boolean {
    const PUBLIC_KEY_PATTERN = /^([A-F0-9]{5})\|([A-F0-9]{512})$/;
    const PUBLIC_KEY_SIZE = 518;
    return publicKeyString.match(PUBLIC_KEY_PATTERN) !== null && publicKeyString.length === PUBLIC_KEY_SIZE;
  }
  private async encrypt(fieldName: string, field: string,): Promise<string> {
    if (!this.isPublicKeyValid(this.publicKey)) {
      throw new Error('Invalid public key: ' + this.publicKey);
    }

    const pem = this.convertToPem(this.publicKey);
    const aesKeyBytes = randomBytes(this.keySize);
    const ivBytes = randomBytes(this.ivSize);

    const obj = {
      "generationtime": new Date().toISOString(),
      [fieldName]: field
    };
    const plainText = JSON.stringify(obj);
    const cipher = createCipheriv('aes-256-ccm', aesKeyBytes, ivBytes, {
      authTagLength: 8
    });
    let encrypted = cipher.update(plainText, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();
    encrypted = Buffer.concat([encrypted, authTag]);
    const combined = Buffer.concat([ivBytes, encrypted]);

    const encryptedAesKey = publicEncrypt({
      key: pem,
      padding: crypto.constants.RSA_PKCS1_PADDING
    }, aesKeyBytes);

    return `${this.PREFIX}${this.VERSION}${this.SEPARATOR}${encryptedAesKey.toString('base64')}${this.SEPARATOR}${combined.toString('base64')}`;
  }
  private buildFullBody(object: any) {
    return {
      "authorization": {
        "authorization_payload": {
          "save_payment_method": true,
          "payment_type": "CREDITCARD",
          "type": "adyenAuthorizationPayload",
          "payload": JSON.stringify(object)
        },
        "payment_provider": "ADYEN",
        "return_url": "adyencheckout://com.app.tgtg.itemview"
      }
    }
  }
}

export { PaymentBuilder }