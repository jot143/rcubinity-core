
import { Injectable } from "@angular/core";
import { Constant } from "../config";
import { LocalStorageService } from "./local-storage.service";

@Injectable()
export class StateService {
	default = {
		disclaimer: false,
		token: null,
		hasLoggedIn: false,
		user_id: null,
		user: null,
	};

	get userID() {
		return LocalStorageService.get(Constant.USER_ID) ?? this.default.user_id;
	}

	set userID(val) {
		LocalStorageService.set(Constant.USER_ID, val);
	}

	get hasLoggedIn() {
		return LocalStorageService.get(Constant.HAS_LOGGED_IN) ?? this.default.hasLoggedIn;
	}

	set hasLoggedIn(val) {
		LocalStorageService.set(Constant.HAS_LOGGED_IN, val);
	}

	get token() {
		return LocalStorageService.get(Constant.TOKEN) ?? this.default.token;
	}

	set token(val) {
		LocalStorageService.set(Constant.TOKEN, val);
	}

	get user() {
		return LocalStorageService.get(Constant.USER) ?? this.default.token;
	}

	set user(val) {
		LocalStorageService.set(Constant.USER, val);
	}
}
