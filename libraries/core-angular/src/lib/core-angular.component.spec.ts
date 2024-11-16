import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreAngularComponent } from './core-angular.component';

describe('CoreAngularComponent', () => {
  let component: CoreAngularComponent;
  let fixture: ComponentFixture<CoreAngularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoreAngularComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreAngularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
