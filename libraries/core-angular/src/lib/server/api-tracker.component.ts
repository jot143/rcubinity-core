import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ApiCall } from 'core-angular';

@Component({
  selector: 'app-api-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2>API Request Tracker</h2>
      <button (click)="clearHistory()">Clear History</button>
      <div *ngFor="let request of requestHistory">
        <div>
          <strong>{{ request.method }} {{ request.url }}</strong>
          <span [ngClass]="{
            'text-success': request.status === 'completed',
            'text-danger': request.status === 'failed',
            'text-warning': request.status === 'pending'
          }">
            {{ request.status }}
          </span>
          <span>{{ request.timestamp | date: 'short' }}</span>
        </div>
        <pre *ngIf="request.response">{{ request.response | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .text-success { color: green; }
    .text-danger { color: red; }
    .text-warning { color: orange; }
  `]
})
export class ApiTrackerComponent implements OnInit, OnDestroy {
  requestHistory: ApiCall[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.requestHistory = this.apiService.getRequestHistory();
    this.subscription = this.apiService.requestStatus.subscribe(history => {
      this.requestHistory = history;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  clearHistory() {
    this.apiService.clearRequestHistory();
  }
}
