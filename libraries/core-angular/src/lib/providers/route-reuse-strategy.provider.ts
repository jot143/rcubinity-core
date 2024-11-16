import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
    handlers: { [key: string]: DetachedRouteHandle } = {};

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return true;  // Determine if this route should be stored
    }

    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
      if(route?.routeConfig?.path) {
        this.handlers[route.routeConfig.path] = handle;
      }
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
      if(route?.routeConfig?.path) {
        return !!route.routeConfig && !!this.handlers[route.routeConfig.path];
      }
      return false;
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
      if(route?.routeConfig?.path) {
        return this.handlers[route.routeConfig.path];
      }

      return null;
    }

    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === curr.routeConfig;
    }
}
