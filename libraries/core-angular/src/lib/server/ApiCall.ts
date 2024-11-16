import * as Joi from 'joi';

import { EMPTY, Observable, Subject, catchError, filter, of, share, tap, throwError } from 'rxjs';
import { HttpEvent, HttpEventType, HttpHeaders, HttpParams } from '@angular/common/http';

import { ApiService } from './api.service';
import moment from 'moment';

export enum RequestMethod {
  GET = 'get',
  POST = 'post',
  DELETE = 'delete',
  PUT = 'put',
}

export interface ApiObject {
  name: string;
  method: RequestMethod;
  url: string;
  paramsValidator?: null | Joi.ObjectSchema<any>;
  dataValidator?: null | Joi.ObjectSchema<any>;
}

export class RequestLoader {
  isLoading = false;

  start() {
    this.isLoading = true;
    return this;
  }

  stop() {
    this.isLoading = false;
  }
}

export class ApiCall {
  name = '';
  method: RequestMethod = RequestMethod.GET;
  url: string = '';
  paramsValidator: null | Joi.ObjectSchema<any> = null;
  dataValidator: null | Joi.ObjectSchema<any> = null;

  status: 'pending' | 'completed' | 'failed' = 'pending';
  timestamp = new Date();

  domain: string = '';

  cached = false;
  silent = false;

  params: {
    [key: string]: any;
  } = {};

  data: any = {};
  headerData: any = {};

  formData = false;
  force = false;

  invalidMessage = '';

  response: any;

  apiService!: ApiService;

  progress = new Subject();
  subject = this.progress.pipe(
    filter((event: any) => event?.type === HttpEventType.Response || event?.name == 'HttpErrorResponse'),
    share()
  );

  constructor(endpoint: ApiObject | null = null) {
    if (endpoint) {
      for (const i in endpoint) {
        (this as any)[i] = (endpoint as any)[i];
      }
    }
  }

  // Loader
  loader = new RequestLoader();

  setParams(key: string, value: any) {
    this.params[key] = value;
  }

  get httpParams() {
    const params = new HttpParams();
    for (let key in this.params) {
      params.append(key, this.params[key]);
    }

    return params;
  }

  get fullUrl() {
    const data: any = { ...this.params, ...this.data };
    for (const i in data) {
      if ((typeof data[i] === 'string' || typeof data[i] === 'number') && this.url.includes(`:${i}`)) {
        this.url = this.url.replaceAll(`:${i}`, data[i] as any);
      }
    }
    return this.domain + this.url;
  }

  get cacheKey(): string {
    return this.url + (this.httpParams ? this.httpParams.toString() : '');
  }

  isValid() {
    if (this.paramsValidator) {
      const paramsValidateResult = this.paramsValidator?.validate(this.params);
      if (paramsValidateResult.error) {
        this.invalidMessage = paramsValidateResult.error.message;
        return false;
      }
    }

    if (this.dataValidator) {
      const dataValidatorResult = this.dataValidator?.validate(this.data);
      if (dataValidatorResult.error) {
        this.invalidMessage = dataValidatorResult.error.message;
        return false;
      }
    }

    return true;
  }

  onSuccess: ((value: any) => void) | null = null;
  onError: ((value: any) => void) | null = null;

  exe<T>(): Observable<T> {
    // this.apiService.trackRequest(apiCall);
    let observable = new Observable();
    if (!this.isValid()) {
      console.error(`Api named "${this.name}" is not valid`);
      observable = throwError(() => new Error('Request is not valid'));
      this.progress.error(new Error('Request is not valid'))
    } else {
      if (this.force) {
        this.apiService.cache.delete(this.cacheKey);
      }


      const tapFn = (event: HttpEvent<T>) => {

        this.loader.stop();


        if (event.type === HttpEventType.Response) {
          this.apiService.cache.set(this.cacheKey, { data: event.body, time: moment() });
          this.status = 'completed';
          this.response = event.body;

          this.onSuccess && this.onSuccess(event.body);
          this.progress.next(event);
          this.progress.complete();
          // this.apiService.trackRequest(this);
          // subject.complete();
          // this.apiService.pendingRequests.delete(this.cacheKey);
          //
        } else {
          this.progress.next(event);
        }
      };

      const catchErrorFn = (error: any) => {

        this.loader.stop();

        if (error.name == "HttpErrorResponse") {

          this.status = 'completed';
          this.status = 'completed';
          this.response = error.error;

          this.onSuccess && this.onSuccess(error);
          this.progress.next(error);
          this.progress.complete();
          // Return an observable that emits a fallback value
          // return of({ fallback: true, error: error });
          return EMPTY;
        }

        this.status = 'failed';
        if (this.onError) {
          this.onError(error);
        }
        this.progress.error(error);
        this.progress.complete();

        // Return an observable that emits an error
        return throwError(() => new Error(error));

        // this.apiService.trackRequest(this);
        // this.apiService.pendingRequests.delete(this.cacheKey);
      };

      if (this.apiService.cache.has(this.cacheKey) && moment().diff(this.apiService.cache.get(this.cacheKey)?.time, 'minutes') < (this.apiService.config.cacheTimeLimit ?? 10)) {
        observable = of(this.apiService.cache.get(this.cacheKey)?.data).pipe(tap(tapFn as any), catchError(catchErrorFn), share());
      } else {
        // if (this.apiService.pendingRequests.has(this.cacheKey)) {
        //   return this.apiService.pendingRequests.get(this.cacheKey)?.asObservable() ?? of(null);
        // }
        // else {

        // const subject = new Subject<T>();
        // this.apiService.pendingRequests.set(this.cacheKey, subject);

        this.loader.start();
        this.apiService.cache.delete(this.cacheKey);


        const headers = new HttpHeaders({ requestName: this.name, silent: this.silent ? 'Yes' : 'No', ...this.headerData });

        if (this.method === RequestMethod.POST || this.method === RequestMethod.PUT) {
          if (this.formData === true) {
            const tempData = new FormData();
            for (const key in this.data) {
              tempData.append(key, this.data[key]);
            }
            this.data = tempData;
          }

          observable = this.apiService.http[this.method](this.fullUrl, this.data, { headers, params: this.params, observe: 'events', reportProgress: true }).pipe(tap(tapFn as any), catchError(catchErrorFn), share());
        } else if (this.method === RequestMethod.DELETE) {
          observable = this.apiService.http[this.method](this.fullUrl, { headers, params: this.params, body: this.data, observe: 'events', reportProgress: true }).pipe(tap(tapFn as any), catchError(catchErrorFn), share());
        } else if (this.method == RequestMethod.GET) {
          observable = this.apiService.http[this.method](this.fullUrl, { headers, params: this.params, observe: 'events', reportProgress: true }).pipe(tap(tapFn as any), catchError(catchErrorFn), share());
        }

        // if (!this.apiService.isOnline.value) {
        //   this.apiService.offlineQueue.push({ key: this.cacheKey, observable });
        // }
      }
    }
    return observable as Observable<T>;
  }
}
