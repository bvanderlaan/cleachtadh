import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KataCardComponent } from './kata-card.component';

describe('KataCardComponent', () => {
  let component: KataCardComponent;
  let fixture: ComponentFixture<KataCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KataCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KataCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
