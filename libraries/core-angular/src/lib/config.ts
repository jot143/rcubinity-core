import { InjectionToken } from "@angular/core";

export const Constant = {
	HAS_LOGGED_IN: "hasLoggedIn",
	DISCLAIMER: "disclaimer",
	TOKEN: "token",
	USER_ID: "user_id",
	USER: "User",
	USER_ADDRESS: "userAddress",
};


export interface CoreAngularConfig {
  baseUrl: string;
  cacheTimeLimit: number;
  debugMode: boolean;
}

export const CORE_ANGULAR_CONFIG = new InjectionToken<CoreAngularConfig>('Configuration');
