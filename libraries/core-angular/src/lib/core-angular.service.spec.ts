import { TestBed } from '@angular/core/testing';

import { CoreAngularService } from './core-angular.service';

describe('CoreAngularService', () => {
  let service: CoreAngularService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreAngularService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
