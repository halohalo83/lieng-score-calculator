import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLast5RoundsComponent } from './view-last-5-rounds.component';

describe('ViewLast5RoundsComponent', () => {
  let component: ViewLast5RoundsComponent;
  let fixture: ComponentFixture<ViewLast5RoundsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewLast5RoundsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewLast5RoundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
