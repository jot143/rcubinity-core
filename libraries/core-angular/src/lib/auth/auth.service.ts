import { Injectable, inject } from '@angular/core';

import { ApiCall } from '../server/ApiCall';
import { ApiService } from '../server/api.service';
import { BehaviorSubject } from 'rxjs';
import { HookService } from '../services/hook.service';
import { Router } from '@angular/router';
import { StateService } from '../services/state.service';
import { User } from '../models/User';
import { authApi } from './auth.api';

export const AUTH_HOOK = {
  BEFORE_PREPARE_LOGIN_CALL: 'before-prepare-login-call',
  AFTER_PREPARE_LOGIN_CALL: 'after-prepare-login-call',
  ON_LOGIN_SUCCESS: 'on-login-success',
  ON_LOGIN_ERROR: 'on-login-error',
  BEFORE_LOGOUT: 'before-logout',
  ON_LOGOUT: 'on-logout',
}

@Injectable()
export class AuthService {
  isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // inject dependencies
  protected hookService = inject(HookService);
  protected apiService = inject(ApiService);
  protected router = inject(Router);
  protected stateService = inject(StateService);

  async login(loginCredential: unknown): Promise<ApiCall> {

    await this.hookService.applyFilter(AUTH_HOOK.BEFORE_PREPARE_LOGIN_CALL, loginCredential);

    let apiCall = this.prepareLoginCall(loginCredential);

    await this.hookService.applyFilter(AUTH_HOOK.AFTER_PREPARE_LOGIN_CALL, apiCall);

    apiCall.subject.subscribe({
      next: async value => {
        if(this.checkForLoginSuccess(apiCall)) {
          this.hookService.doAction(AUTH_HOOK.ON_LOGIN_SUCCESS, apiCall.response);
          this.onSuccess(apiCall.response);
        } else {
          await this.hookService.doAction(AUTH_HOOK.ON_LOGIN_ERROR, apiCall);
          this.onError(apiCall.response);
        }
      },
      error: async error => {
        await this.hookService.applyFilter(AUTH_HOOK.ON_LOGIN_ERROR, apiCall);
        this.onError(error);
      },
    });

    apiCall.exe().subscribe();
    return apiCall;
  }

  async logout() {
    await this.hookService.doAction(AUTH_HOOK.BEFORE_LOGOUT);
    await this.beforeLogout();

    document.cookie.split(';').forEach(function (c) {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    localStorage.clear();

    await this.hookService.doAction(AUTH_HOOK.ON_LOGOUT);
    await this.afterLogout();

    this.router.navigateByUrl('/');
  }

  protected checkForLoginSuccess(apiCall: ApiCall) {
    return true
  }

  onSuccess(value: any) {
    this.setLoggedIn(value);
  }

  onError(error: any) {

  }


  protected prepareLoginCall(loginCredential: any) {
    const apiCall = this.apiService.apiCall(authApi.login);
    apiCall.data = loginCredential;
    return apiCall;
  }

  protected beforeLogout() {}

  protected afterLogout() {}

  protected setLoggedIn(value: any) {
    const user = new User();
    user.set(value, true);
    this.stateService.user = user;
    this.stateService.hasLoggedIn = true;
  }

}
