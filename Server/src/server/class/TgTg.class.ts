import axios, { AxiosError } from 'axios';
import User from '@schema/Users.schema';

const BASE_URL = "https://apptoogoodtogo.com/api/";
const AUTH_BY_EMAIL_ENDPOINT = "auth/v4/authByEmail"
const AUTH_POLLING_ENDPOINT = "auth/v3/authByRequestPollingId"
const AUTH_BY_REQUEST_PIN_ENDPOINT = "auth/v4/authByRequestPin"
const PAYMENT_METHODS_ENDPOINT = "paymentMethod/v1"
const REFRESH_ENDPOINT = "auth/v3/token/refresh"
const ACTIVE_ORDER_ENDPOINT = "order/v6/active"
const INACTIVE_ORDER_ENDPOINT = "order/v6/inactive"
const CREATE_ORDER_ENDPOINT = "order/v7/create/"
const ABORT_ORDER_ENDPOINT = "order/v7/<ID>/abort"
const ORDER_STATUS_ENDPOINT = "order/v7/<ID>/status"
const ORDER_PAY_ENDPOINT = "order/v7/<ID>/pay"
const ORDER_PAY_BIOMETRICS = "payment/v3/<ID>/biometrics"
const ORDER_PAY_STATUS = "payment/v3/<ID>"
const API_BUCKET_ENDPOINT = "discover/v1/bucket"
const DEFAULT_ACCESS_TOKEN_LIFETIME = 14400000 // 4 hours in ms
const MAX_POLLING_TRIES = 24
const POLLING_WAIT_TIME = 10

class TGTG {
  private readonly email: string;
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

  protected async GetFavorites(): Promise<any> {
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
            page: 0,
            size: 50
          },
          bucket: {
            filler_type: "Favorites"
          }
        }
      });
      return resp.data.mobile_bucket.items;
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