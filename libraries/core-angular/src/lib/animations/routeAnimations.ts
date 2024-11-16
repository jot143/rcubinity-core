import { trigger, transition, style, query, animate, group } from '@angular/animations';

export const routeAnimations =  trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', style({ position: 'absolute', width: '100%', height: '100%' }), { optional: true }),
    group([
      query(':leave', [
        animate('0.2s ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ], { optional: true }),
      query(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.2s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ], { optional: true })
    ])
  ])
]);
