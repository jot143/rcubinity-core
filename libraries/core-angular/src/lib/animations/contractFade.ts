import { trigger, state, style, transition, animate } from "@angular/animations";

export const contractFade = trigger('contractFade', [
  state('in', style({
    opacity: 1,
    transform: 'scale(1)'
  })),
  state('out', style({
    opacity: 0,
    transform: 'scale(0.8)'
  })),
  transition('in => out', [
    animate('0.5s ease-in')
  ])
])
