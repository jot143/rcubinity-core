import { Component, DoCheck, inject } from '@angular/core';
import { onDestroy } from '../helpers/onDestroy';
import { CORE_ANGULAR_CONFIG } from '../config';

@Component({ template: `` })
export abstract  class BaseComponent implements DoCheck {
  private config = inject(CORE_ANGULAR_CONFIG);

  // Abstract property
  abstract title: string;

  destroy$ = onDestroy();

  constructor() {}

  ngDoCheck() {
    if (this.config.debugMode) {
      console.debug(`${this.title} ngDoCheck`);
    }
  }
}
