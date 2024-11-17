/*
 * Public API Surface of core-angular
 */


export * from './lib/core-angular.service';
export * from './lib/core-angular.component';

export * from './lib/config';

// Provider
export * from './lib/providers/route-reuse-strategy.provider';

// Animation
export * from './lib/animations/routeAnimations';
export * from './lib/animations/contractFade';

// ui
export * from './lib/ui/alert.service';

//auth
export * from './lib/auth/auth.service';
export * from './lib/auth/auth.api';

// server
export * from './lib/server/api.service';
export * from './lib/server/ApiCall';

// service
export * from './lib/services/hook.service';
export * from './lib/services/local-storage.service';
export * from './lib/services/state.service';

// helper
export * from './lib/helpers/onDestroy';

// models
export * from './lib/models/Model';
export * from './lib/models/User';

// components
export * from './lib/components/base.component';

// guard
export * from './lib/guards/auth.guard';
export * from './lib/guards/home.guard';

