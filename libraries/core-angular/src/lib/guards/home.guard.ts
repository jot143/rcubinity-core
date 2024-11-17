import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";

import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../auth/auth.service";

@Injectable({
	providedIn: "root",
})
export class HomeGuard implements CanActivate {
	constructor(
		private authService: AuthService,
		private router: Router
	) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		const loggedInCall = this.authService.isLoggedIn.getValue();
		return Promise.all([loggedInCall]).then((values) => {
			const loggedIn = values[0];
			if (!loggedIn) {
				this.router.navigateByUrl("/auth");
			}
			return true;
		});
	}
}
