import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KataListComponent } from './kata-list.component';

describe('KataListComponent', () => {
  let component: KataListComponent;
  let fixture: ComponentFixture<KataListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KataListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KataListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
