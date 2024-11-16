import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreVisTimelineComponent } from './core-vis-timeline.component';

describe('CoreVisTimelineComponent', () => {
  let component: CoreVisTimelineComponent;
  let fixture: ComponentFixture<CoreVisTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoreVisTimelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreVisTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
