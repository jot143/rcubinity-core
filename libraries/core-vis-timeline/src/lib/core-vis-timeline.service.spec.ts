import { TestBed } from '@angular/core/testing';

import { CoreVisTimelineService } from './core-vis-timeline.service';

describe('CoreVisTimelineService', () => {
  let service: CoreVisTimelineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreVisTimelineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
