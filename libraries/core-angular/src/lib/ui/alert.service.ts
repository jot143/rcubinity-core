import { Injectable } from '@angular/core';

@Injectable()
export class AlertService {

  constructor() { }

  success(message: string) {
    alert(message);
  }

  error(message: string) {
    alert(message);
  }

  warn(message: string) {
    alert(message);
  }

  info(message: string) {
    alert(message);
  }
}
