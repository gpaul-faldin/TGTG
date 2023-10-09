import axios, { AxiosError } from 'axios';
import QueryString from 'qs';
import User from '@schema/Users.schema';

const BASE_URL = "https://apptoogoodtogo.com/api/";
const AUTH_BY_EMAIL_ENDPOINT = "auth/v4/authByEmail"
const AUTH_POLLING_ENDPOINT = "auth/v3/authByRequestPollingId"
const AUTH_BY_REQUEST_PIN_ENDPOINT = "auth/v4/authByRequestPin"
const PAYMENT_METHODS_ENDPOINT = "paymentMethod/v1"
const REFRESH_ENDPOINT = "auth/v3/token/refresh"
const CREATE_ORDER_ENDPOINT = "order/v7/create/"
const ABORT_ORDER_ENDPOINT = "order/v7/<ID>/abort"
const ORDER_STATUS_ENDPOINT = "order/v7/<ID>/status"
const ORDER_PAY_ENDPOINT = "order/v7/<ID>/pay"
const ORDER_PAY_BIOMETRICS = "payment/v3/<ID>/biometrics"
const ORDER_PAY_STATUS = "payment/v3/<ID>"
const API_BUCKET_ENDPOINT = "discover/v1/bucket"
const DEFAULT_ACCESS_TOKEN_LIFETIME = 14400000 // 4 hours in ms

class TGTG {
  public readonly email: string;
  private accessToken: string;
  private refreshToken: string;
  private userId: string;
  private tokenAge: number;
  headers: {
    Accept: string;
    "Accept-Encoding": string;
    "Accept-language": string;
    "Content-type": string;
    "User-agent": string;
    "Cookie": string;
    Authorization: string;
  };

  constructor(email: string, apkVersion: string = '23.5.10', accessToken: string = '', refreshToken: string = '', userId: string = '', tokenAge: number = 0, cookie: string = '') {
    this.email = email,
      this.accessToken = accessToken,
      this.refreshToken = refreshToken,
      this.userId = userId,
      this.tokenAge = tokenAge,
      this.headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "Accept-language": "en-GB",
        "Content-type": "application/json; charset=utf-8",
        "User-agent": `TGTG/${apkVersion} Dalvik/2.1.0 (Linux; U; Android 13; sdk_gphone_x86_64 Build/TE1A.220922.028)`,
        "Cookie": cookie,
        "Authorization": accessToken !== '' ? `Bearer ${accessToken}` : ''
      }
  }

  /*
    UTILS
  */
  private LoggedIn() {
    return this.accessToken !== '' && this.refreshToken !== '' && this.userId !== '';
  }
  private async TokenRefresh() {
    if (Date.now() - this.tokenAge <= DEFAULT_ACCESS_TOKEN_LIFETIME) {
      return 0;
    }

    try {
      const resp = await axios({
        method: 'post',
        url: BASE_URL + REFRESH_ENDPOINT,
        headers: this.headers,
        data: {
          refresh_token: this.refreshToken
        }
      });
      if (resp.status === 200) {
        this.accessToken = resp.data.access_token;
        this.refreshToken = resp.data.refresh_token;
        this.tokenAge = Date.now();
        this.headers['Cookie'] = resp.headers['set-cookie'] ? resp.headers['set-cookie'].join('; ') : '';
        this.headers['Authorization'] = `Bearer ${this.accessToken}`;

        await User.findOneAndUpdate({ email: this.email }, {
          login: {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            tokenAge: this.tokenAge,
            userId: this.userId,
            cookie: this.headers['Cookie']
          }
        })
      }
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        throw new Error(JSON.stringify({
          message: err.response?.data.message || err.message,
          code: err.response?.status || 500
        }));
      } else {
        throw err;
      }
    }
  }
  private async DatadomeRefresh() {
    const QS = QueryString.stringify({
      'ddv': '4.6.0',
      'eventCounters': [],
      'jsType': 'ch',
      'ddk': 'A55FBF4311ED6F1BF9911EB71931D5',
      'events': [],
      'request': '%2F',
      'responsePage': 'origin',
      'cid': 'null',
      'dddomain': "https://apptoogoodtogo.com",
      'Referer': '',
      'jsData': JSON.stringify({
        "ttst": `${Math.floor(Math.random() * 90 + 10)}.${Math.floor(Math.random() * (9999999999999 - 1000000000000 + 1)) + 1000000000000}`,
        "ifov": false,
        "tagpu": `${Math.floor(Math.random() * 90 + 10)}.${Math.floor(Math.random() * (9999999999999 - 1000000000000 + 1)) + 1000000000000}`,
        "glvd": "Google Inc. (NVIDIA)",
        "glrd": "ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)",
        "hc": 16,
        "br_oh": 1040,
        "br_ow": 1920,
        "ua": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        "wbd": false,
        "wdif": false,
        "wdifrm": false,
        "npmtm": false,
        "br_h": 969,
        "br_w": 963,
        "nddc": 1,
        "rs_h": 1080,
        "rs_w": 1920,
        "rs_cd": 24,
        "phe": false,
        "nm": false,
        "jsf": false,
        "lg": "en-US",
        "pr": 1,
        "ars_h": 1040,
        "ars_w": 1920,
        "tz": 480,
        "str_ss": true,
        "str_ls": true,
        "str_idb": true,
        "str_odb": true,
        "plgod": false,
        "plg": Math.floor(Math.random() * 10) + 5,
        "plgne": true,
        "plgre": true,
        "plgof": false,
        "plggt": false,
        "pltod": false,
        "hcovdr": false,
        "hcovdr2": false,
        "plovdr": false,
        "plovdr2": false,
        "ftsovdr": false,
        "ftsovdr2": false,
        "lb": false,
        "eva": 33,
        "lo": false,
        "ts_mtp": 0,
        "ts_tec": false,
        "ts_tsa": false,
        "vnd": "Google Inc.",
        "bid": "NA",
        "mmt": "application/pdf,text/pdf",
        "plu": "PDF Viewer,Chrome PDF Viewer,Chromium PDF Viewer,Microsoft Edge PDF Viewer,WebKit built-in PDF",
        "hdn": false,
        "awe": false,
        "geb": false,
        "dat": false,
        "med": "defined",
        "aco": "probably",
        "acots": false,
        "acmp": "probably",
        "acmpts": true,
        "acw": "probably",
        "acwts": false,
        "acma": "maybe",
        "acmats": false,
        "acaa": "probably",
        "acaats": true,
        "ac3": "",
        "ac3ts": false,
        "acf": "probably",
        "acfts": false,
        "acmp4": "maybe",
        "acmp4ts": false,
        "acmp3": "probably",
        "acmp3ts": false,
        "acwm": "maybe",
        "acwmts": false,
        "ocpt": false,
        "vco": "probably",
        "vcots": false,
        "vch": "probably",
        "vchts": true,
        "vcw": "probably",
        "vcwts": true,
        "vc3": "maybe",
        "vc3ts": false,
        "vcmp": "",
        "vcmpts": false,
        "vcq": "",
        "vcqts": false,
        "vc1": "probably",
        "vc1ts": true,
        "dvm": 8,
        "sqt": false,
        "so": "landscape-primary",
        "wdw": true,
        "cokys": "bG9hZFRpbWVzY3NpYXBwL=",
        "ecpc": false,
        "lgs": true,
        "lgsod": false,
        "psn": true,
        "edp": true,
        "addt": true,
        "wsdc": true,
        "ccsr": true,
        "nuad": true,
        "bcda": false,
        "idn": true,
        "capi": false,
        "svde": false,
        "vpbq": true,
        "ucdv": false,
        "spwn": false,
        "emt": false,
        "bfr": false,
        "dbov": false,
        "prm": true,
        "tzp": "America/Los_Angeles",
        "cvs": true,
        "usb": "defined",
        "jset": Math.floor(1000000000 + Math.random() * 9000000000)
      })
    })

    try {

      const resp = await axios({
        method: 'post',
        url: 'https://api-js.datadome.co/js/',
        headers: {
          'x-forwarded-for': '123.456.789.101',
          'Content-type': 'application/x-www-form-urlencoded',
          'Host': 'api-js.datadome.co',
          'Origin': 'https://apptoogoodtogo.com',
          'Referer': 'https://apptoogoodtogo.com',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
        },
        data: QS,
      })
      if (resp.data.cookie) {
        return resp.data.cookie;
      }

    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        throw new Error(JSON.stringify({
          message: err.response?.data.message || err.message,
          code: err.response?.status || 500
        }));
      } else {
        throw err;
      }
    }
  }



  protected async UpdateUser() {
    await User.findOneAndUpdate({ email: this.email }, {
      login: {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        tokenAge: this.tokenAge,
        userId: this.userId,
        cookie: this.headers['Cookie']
      }
    })
  }

  /*
    AUTHENTIFICATION
  */
  public async Login(): Promise<string | null> {
    if (this.LoggedIn()) {
      await this.TokenRefresh();
      return null;
    }

    try {
      const resp = await axios({
        method: 'post',
        url: BASE_URL + AUTH_BY_EMAIL_ENDPOINT,
        headers: this.headers,
        data: {
          device_type: "ANDROID",
          email: this.email
        }
      });
      if (resp.status === 200 && resp.data.state === "WAIT") {
        const pollingId: string = resp.data.polling_id;
        return pollingId;
      } else {
        throw new Error(JSON.stringify({
          message: resp.data.message,
          code: resp.status
        }));
      }
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        throw new Error(JSON.stringify({
          message: err.response?.data.message || err.message,
          code: err.response?.status || 500
        }));
      } else {
        throw err;
      }
    }
  }
  public async Polling(pollingId: string): Promise<any> {

    try {
      const resp = await axios({
        method: 'post',
        url: BASE_URL + AUTH_POLLING_ENDPOINT,
        headers: this.headers,
        data: {
          request_polling_id: pollingId,
          device_type: "ANDROID",
          email: this.email
        }
      });

      if (resp.status === 202) {
        console.log("Check Mail");
        return "Check Mail";
      } else if (resp.status === 200) {
        return {
          accessToken: resp.data.access_token,
          refreshToken: resp.data.refresh_token,
          userId: resp.data.startup_data.user.user_id,
          tokenAge: Date.now(),
          cookie: resp.headers['set-cookie'] ? resp.headers['set-cookie'].join('; ') : ''
        };
      }

    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        console.log("Error", JSON.stringify({
          message: err.message,
          code: err.response?.status
        }));
      } else {
        console.log("Error", err.message);
      }

      return "Error";
    }
    return "Error";
  }
  public async AuthByRequestPin(pin: string, pollingId: string): Promise<string> {
    try {
      const resp = await axios({
        method: 'post',
        url: BASE_URL + AUTH_BY_REQUEST_PIN_ENDPOINT,
        headers: this.headers,
        data: {
          device_type: "ANDROID",
          email: this.email,
          request_pin: pin,
          request_polling_id: pollingId
        }
      });
      if (resp.status === 200) {
        return "Logged in";
      }
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        throw new Error(JSON.stringify({
          message: err.response?.data.message || err.message,
          code: err.response?.status || 500
        }));
      } else {
        throw err;
      }
    }
    return "Error"
  }

  /*
    FAVORITES
  */
  protected async GetFavorites(page: Number = 0): Promise<any> {
    await this.Login()

    try {
      const resp = await axios({
        method: 'post',
        url: BASE_URL + API_BUCKET_ENDPOINT,
        headers: this.headers,
        data: {
          origin: {
            latitude: 0.0,
            longitude: 0.0
          },
          radius: 10.0,
          user_id: this.userId,
          paging: {
            page: page,
            size: 50
          },
          bucket: {
            filler_type: "Favorites"
          }
        }
      });
      this.headers['Cookie'] = resp.headers['set-cookie'] ? resp.headers['set-cookie'].join('; ') : '';;
      return resp.data.mobile_bucket.items;
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          this.headers['Cookie'] = await this.DatadomeRefresh();
        } else {
          console.log(JSON.stringify({
            message: err.response?.data.message || err.message,
            code: err.response?.status || 500,
            page: page
          }));
        }
      } else {
        throw err;
      }
    }
  }
  protected async GetFavorite(item_id: string): Promise<any> {
    await this.Login()

    try {
      const resp = await axios({
        method: 'post',
        url: BASE_URL + `item/v7/${item_id}`,
        headers: this.headers,
        data: {
          "user_id": this.userId,
          "origin": {
            "latitude": 0.0,
            "longitude": 0.0
          }
        }
      })
      return resp.data;
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        throw new Error(JSON.stringify({
          message: err.response?.data.message || err.message,
          code: err.response?.status || 500
        }));
      } else {
        throw err;
      }
    }
  }
  protected async AddFavorite(store_id: string): Promise<any> {
    await this.Login()

    try {
      const resp = await axios({
        method: 'post',
        url: BASE_URL + `item/v7/${store_id}/setFavorite`,
        headers: this.headers,
        data: { "is_favorite": true }
      })
      return resp.data;
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        throw new Error(JSON.stringify({
          message: err.response?.data.message || err.message,
          code: err.response?.status || 500
        }));
      } else {
        throw err;
      }
    }
  }

  /*
    ORDERS
  */
  protected async CreateOrder(itemId: string, itemCount: number) {
    await this.Login()

    try {
      const resp = await axios({
        method: 'post',
        url: BASE_URL + CREATE_ORDER_ENDPOINT + itemId,
        headers: this.headers,
        data: {
          item_count: itemCount,
        }
      });
      return resp.data;
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        throw new Error(JSON.stringify({
          message: err.response?.data.message || err.message,
          code: err.response?.status || 500
        }));
      } else {
        throw err;
      }
    }
  }
  protected async AbortOrder(orderId: string) {
    await this.Login()

    try {
      const resp = await axios({
        method: 'post',
        url: BASE_URL + ABORT_ORDER_ENDPOINT.replace("<ID>", orderId),
        headers: this.headers,
        data: {
          cancel_reason_id: "1",
        }
      });
      return resp.data;
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        throw new Error(JSON.stringify({
          message: err.response?.data.message || err.message,
          code: err.response?.status || 500
        }));
      } else {
        throw err;
      }
    }
  }

  /*
    PAYMENT
  */
  protected async FetchPaymentMethods() {
    await this.Login()

    try {
      const resp = await axios({
        method: 'post',
        url: BASE_URL + PAYMENT_METHODS_ENDPOINT,
        headers: this.headers,
        data: {
          "supported_types": [{
            "provider": "ADYEN",
            "payment_types": ["CREDITCARD", "SOFORT", "IDEAL", "PAYPAL", "BCMCMOBILE", "BCMCCARD", "VIPPS", "TWINT", "MBWAY", "SWISH", "BLIK", "GOOGLEPAY"]
          }]
        }
      });

      let preferredIdentifier: string | null = null;

      for (const element of resp.data.payment_methods) {
        if (element.preferred === true) {
          preferredIdentifier = element.identifier;
          break;
        }
      }

      return preferredIdentifier;
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        throw new Error(JSON.stringify({
          message: err.response?.data.message || err.message,
          code: err.response?.status || 500
        }));
      } else {
        throw err;
      }
    }
  }
  protected async Pay(orderId: string, payload: object) {
    await this.Login()

    try {
      const resp = await axios({
        method: 'post',
        url: BASE_URL + ORDER_PAY_ENDPOINT.replace("<ID>", orderId),
        headers: this.headers,
        data: payload
      });
      return resp.data;
    } catch (err: any | AxiosError) {
      console.log(err.message)
      if (axios.isAxiosError(err)) {
        throw new Error(JSON.stringify({
          message: err.response?.data.message || err.message,
          code: err.response?.status || 500
        }));
      } else {
        throw err;
      }
    }
  }
  protected async StatusOrder(orderId: string) {
    await this.Login()

    try {
      const resp = await axios({
        method: 'post',
        url: BASE_URL + ORDER_STATUS_ENDPOINT.replace("<ID>", orderId),
        headers: this.headers,
      });
      return resp.data;
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        throw new Error(JSON.stringify({
          message: err.response?.data.message || err.message,
          code: err.response?.status || 500
        }));
      } else {
        throw err;
      }
    }
  }
  protected async PaymentStatus(paymentId: string): Promise<string> {
    await this.Login()

    try {
      const resp = await axios({
        method: 'post',
        url: BASE_URL + ORDER_PAY_STATUS.replace("<ID>", paymentId),
        headers: this.headers,
      });
      return resp.data.state;

    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        throw new Error(JSON.stringify({
          message: err.response?.data.message || err.message,
          code: err.response?.status || 500
        }));
      } else {
        throw err;
      }
    }
  }
  protected async PaymentBiometrics(paymentId: string) {
    await this.Login()

    try {
      const resp = await axios({
        method: 'post',
        url: BASE_URL + ORDER_PAY_BIOMETRICS.replace("<ID>", paymentId),
        headers: this.headers,
      });
      return resp.data;
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        throw new Error(JSON.stringify({
          message: err.response?.data.message || err.message,
          code: err.response?.status || 500
        }));
      } else {
        throw err;
      }
    }
  }

}

export { TGTG }