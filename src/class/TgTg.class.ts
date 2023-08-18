import axios, { AxiosError } from 'axios';

const BASE_URL = "https://apptoogoodtogo.com/api/";
const AUTH_BY_EMAIL_ENDPOINT = "auth/v4/authByEmail"
const AUTH_POLLING_ENDPOINT = "auth/v3/authByRequestPollingId"
const SIGNUP_BY_EMAIL_ENDPOINT = "auth/v3/signUpByEmail"
const REFRESH_ENDPOINT = "auth/v3/token/refresh"
const ACTIVE_ORDER_ENDPOINT = "order/v6/active"
const INACTIVE_ORDER_ENDPOINT = "order/v6/inactive"
const CREATE_ORDER_ENDPOINT = "order/v7/create/"
const ABORT_ORDER_ENDPOINT = "order/v7/{}/abort"
const ORDER_STATUS_ENDPOINT = "order/v7/{}/status"
const API_BUCKET_ENDPOINT = "discover/v1/bucket"
const DEFAULT_ACCESS_TOKEN_LIFETIME = 14400000 // 4 hours in ms
const MAX_POLLING_TRIES = 24
const POLLING_WAIT_TIME = 10

class TGTG {
  private email: string;
  private accessToken: string;
  private refreshToken: string;
  userId: string;
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

  constructor(email: string, apkVersion: string = '23.5.10') {
    this.email = email,
      this.accessToken = '',
      this.refreshToken = '',
      this.userId = '',
      this.tokenAge = 0,
      this.headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "Accept-language": "en-GB",
        "Content-type": "application/json; charset=utf-8",
        "User-agent": `TGTG/${apkVersion} Dalvik/2.1.0 (Linux; U; Android 13; sdk_gphone_x86_64 Build/TE1A.220922.028)`,
        "Cookie": '',
        "Authorization": ''
      }
  }

  private LoggedIn() {
    return this.accessToken !== '' && this.refreshToken !== '' && this.userId !== '';
  }
  private async TokenRefresh() {
    if (Date.now() - this.tokenAge <= DEFAULT_ACCESS_TOKEN_LIFETIME) {
      console.log("Token still OK");
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
  protected async Login(): Promise<string | null> {
    if (this.LoggedIn()) {
      await this.TokenRefresh();
      return null; // Indicates that no further action is required from the user
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
  protected async Polling(pollingId: string): Promise<string> {

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
        console.log("Success");
        this.accessToken = resp.data.access_token;
        this.refreshToken = resp.data.refresh_token;
        this.tokenAge = Date.now();
        this.userId = resp.data.startup_data.user.user_id;
        this.headers['Cookie'] = resp.headers['set-cookie'] ? resp.headers['set-cookie'].join('; ') : '';
        this.headers['Authorization'] = `Bearer ${this.accessToken}`;
        return "Logged in";
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

  protected async GetFavorites(): Promise<any> {
    await this.Login()

    try {
      const resp = await axios({
        method: 'post',
        url: BASE_URL + API_BUCKET_ENDPOINT,
        headers: this.headers,
        data: {
          origin: {
            latitude: 48.9115967,
            longitude: 2.2939717
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

}

export { TGTG }