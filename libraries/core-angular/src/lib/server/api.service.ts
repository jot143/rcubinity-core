import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { CORE_ANGULAR_CONFIG } from '../config';
import { ApiCall, ApiObject } from './ApiCall';

@Injectable()
export class ApiService {
  cache = new Map<string, {data: any, time: moment.Moment}>();
  // pendingRequests = new Map<string, Subject<any>>();
  // offlineQueue: { key: string; observable: Observable<any> }[] = [];
  isOnline = new BehaviorSubject(true);
  // requestHistory: ApiCall[] = [];

  // requestStatus = new Subject<ApiCall[]>();

  // inject dependencies
  public http = inject(HttpClient);
  public config = inject(CORE_ANGULAR_CONFIG);

  constructor() {
    window.addEventListener('online', this.onOnline.bind(this));
    window.addEventListener('offline', this.onOffline.bind(this));
  }

  private onOnline() {
    this.isOnline.next(true);
    // this.retryOfflineRequests();
  }

  private onOffline() {
    this.isOnline.next(false);
  }

  // private retryOfflineRequests() {
  //   while (this.offlineQueue.length > 0) {
  //     const request = this.offlineQueue.shift();
  //     if (request) {
  //       this.http.request(request.observable as unknown as HttpRequest<any>).subscribe(
  //         data => this.cache.set(request.key, { data, time: moment()}),
  //         error => console.error('Request failed:', error)
  //       );
  //     }
  //   }
  // }

  getCacheKey(url: string, params?: HttpParams): string {
    return url + (params ? params.toString() : '');
  }

  // trackRequest(apiRequest: ApiCall) {
  //   this.requestHistory.push(apiRequest);
  //   this.requestStatus.next(this.requestHistory);
  // }

  invalidateCache(url: string, params?: HttpParams) {
    const cacheKey = this.getCacheKey(url, params);
    this.cache.delete(cacheKey);
  }

  // getRequestHistory(): ApiCall[] {
  //   return this.requestHistory;
  // }

  // clearRequestHistory() {
  //   this.requestHistory = [];
  //   this.requestStatus.next(this.requestHistory);
  // }

  apiCall(apiObject: ApiObject) {
    const apiCall =  new ApiCall(apiObject);
    if(!apiCall.domain) {
      apiCall.domain = this.config.baseUrl;
    }

    apiCall.apiService = this;
    return apiCall;
  }

  //
}
