import { AxiosRequestConfig } from 'axios';
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
export declare class Request {
    private axios;
    private response?;
    constructor(config: Config);
    addHeaders(headers: {
        key: string;
        value: string;
    }[]): void;
    get<R>(url: string, opts?: AxiosRequestConfig, errCb?: Function): CancellablePromise<[R, any]>;
    post<R>(url: string, data: KeyValuePair<any>, opts?: AxiosRequestConfig, errCb?: Function): CancellablePromise<[R, any]>;
    put<R>(url: string, data: KeyValuePair<any>, opts?: AxiosRequestConfig, errCb?: Function): CancellablePromise<[R, any]>;
    del<R>(url: string, opts?: AxiosRequestConfig, errCb?: Function): CancellablePromise<[R, any]>;
    private res;
    private generalError;
    private makePromise;
}
export {};
