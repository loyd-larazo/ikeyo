import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface KeyValuePair<T = any> {
  [key: string]: T;
}

export interface CancellablePromise<T> extends Promise<T> {
  cancel: () => void;
}

interface Header {
  header: string;
  value: string;
}

interface Response {
  success?: string;
  error?: string;
}

interface Config {
  baseURL: string;
  hideAPI?: boolean;
  headers?: Header[];
  response?: Response;
}

export class Request {
  private axios: AxiosInstance;
  private response?: Response = undefined;

  // constructor(baseUrl?: string, noApi?: boolean, customHeaders?: {header: string, value: string}[], noDataRes?: boolean) {
  constructor(config: Config) {

    this.axios = axios.create({
      baseURL: config.baseURL ? (config.hideAPI ? config.baseURL : `${config.baseURL}/api/`) : ''
    });

    if (config.headers) {
      config.headers.map(header => {
        this.axios.defaults.headers.common[header.header] = header.value;
      });
    }

    if (config.response) {
      this.response = config.response;
    }

    // this.axios.defaults.headers.common['Authorization'] = `Bearer ${window.localStorage.getItem('API_TOKEN')}`;
    this.axios.defaults.headers.common['Content-Type'] = `application/json`;
    this.axios.defaults.headers.common['Accept'] = `application/json`;
  }

  public addHeaders(headers: { key: string, value: string }[]) {
    if (headers) {
      headers.map(header => {
        this.axios.defaults.headers.common[header.key] = header.value;
      });
    }
  }

  public get<R>(url: string, opts?: AxiosRequestConfig, errCb?: Function) {
    return this.res<R>('get', url, opts, undefined, errCb);
  }

  public post<R>(url: string, data: KeyValuePair<any>, opts?: AxiosRequestConfig, errCb?: Function) {
    return this.res<R>('post', url, data, opts, errCb);
  }

  public put<R>(url: string, data: KeyValuePair<any>, opts?: AxiosRequestConfig, errCb?: Function) {
    return this.res<R>('put', url, data, opts, errCb);
  }

  public del<R>(url: string, opts?: AxiosRequestConfig, errCb?: Function) {
    return this.res<R>('delete', url, opts, undefined, errCb);
  }

  private res<R>(method: 'get' | 'post' | 'put' | 'delete', url: string, payload?: any, config?: AxiosRequestConfig, errCb?: Function): CancellablePromise<[R, any]> {
    let _cancelRequest: any;
    return this.makePromise<[R, any]>(async (resolve: any, reject: any) => {
      let data, error, resp;
      try {

        if (config) {
          config.cancelToken = new axios.CancelToken(function executor(c) { _cancelRequest = c })
        }

        resp = await (this.axios[method] as any)(url, payload, config);
        if (resp && resp.data) {
          data = this.response && this.response.success ? resp.data[this.response.success] : resp.data;
          error = this.response && this.response.error ? resp.data[this.response.error] : resp.data.error;
        }
      } catch (e: any) {
        if (e && e.response) {
          error = e.response.data.error;
          if (!error) {
            error = e.response.data.message;
          }
        } else {
          if (errCb) {
            errCb(e);
          } else {
            this.generalError();
          }
          console.log(e);
          reject(e);
        }
      }
      return resolve([data, error]);
    }, () => _cancelRequest && _cancelRequest());
  }

  private generalError() {
    return console.log('error', 'Network Error!');
  }

  private makePromise<T>(cb: any, cancel?: () => void): CancellablePromise<T> {

    let _promiseReject: any;
  
    let nativePromise = new Promise<T>((resolve, reject) => {
      _promiseReject = reject;
      return cb(resolve, _promiseReject);
    }) as CancellablePromise<T>;
  
    nativePromise.cancel = () => {
      if (cancel) {
        cancel();
      }
      _promiseReject();
    };
    return nativePromise;
  }
  
}
