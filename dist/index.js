"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const axios_1 = __importDefault(require("axios"));
class Request {
    // constructor(baseUrl?: string, noApi?: boolean, customHeaders?: {header: string, value: string}[], noDataRes?: boolean) {
    constructor(config) {
        this.response = undefined;
        this.axios = axios_1.default.create({
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
    addHeaders(headers) {
        if (headers) {
            headers.map(header => {
                this.axios.defaults.headers.common[header.key] = header.value;
            });
        }
    }
    get(url, opts, errCb) {
        return this.res('get', url, opts, undefined, errCb);
    }
    post(url, data, opts, errCb) {
        return this.res('post', url, data, opts, errCb);
    }
    put(url, data, opts, errCb) {
        return this.res('put', url, data, opts, errCb);
    }
    del(url, opts, errCb) {
        return this.res('delete', url, opts, undefined, errCb);
    }
    res(method, url, payload, config, errCb) {
        let _cancelRequest;
        return this.makePromise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let data, error, resp;
            try {
                if (config) {
                    config.cancelToken = new axios_1.default.CancelToken(function executor(c) { _cancelRequest = c; });
                }
                resp = yield this.axios[method](url, payload, config);
                if (resp && resp.data) {
                    data = this.response && this.response.success ? resp.data[this.response.success] : resp.data;
                    error = this.response && this.response.error ? resp.data[this.response.error] : resp.data.error;
                }
            }
            catch (e) {
                if (e && e.response) {
                    error = e.response.data.error;
                    if (!error) {
                        error = e.response.data.message;
                    }
                }
                else {
                    if (errCb) {
                        errCb(e);
                    }
                    else {
                        this.generalError();
                    }
                    console.log(e);
                    reject(e);
                }
            }
            return resolve([data, error]);
        }), () => _cancelRequest && _cancelRequest());
    }
    generalError() {
        return console.log('error', 'Network Error!');
    }
    makePromise(cb, cancel) {
        let _promiseReject;
        let nativePromise = new Promise((resolve, reject) => {
            _promiseReject = reject;
            return cb(resolve, _promiseReject);
        });
        nativePromise.cancel = () => {
            if (cancel) {
                cancel();
            }
            _promiseReject();
        };
        return nativePromise;
    }
}
exports.Request = Request;
