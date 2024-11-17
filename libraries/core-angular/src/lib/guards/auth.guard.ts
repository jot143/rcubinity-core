import { CanLoad, Route, Router, UrlSegment, UrlTree } from "@angular/router";

import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../auth/auth.service";

@Injectable({
	providedIn: "root",
})
export class AuthGuard implements CanLoad {
	constructor(
		private authService: AuthService,
		private router: Router
	) {}

	canLoad(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		const loggedInCall = this.authService.isLoggedIn.getValue();
		return Promise.all([loggedInCall]).then((values) => {
			const loggedIn = values[0];
			if (loggedIn) {
				this.router.navigateByUrl("/home");
				return false;
			}
			return true;
		});
	}
}
