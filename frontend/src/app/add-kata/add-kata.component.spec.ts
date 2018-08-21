import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddKataComponent } from './add-kata.component';

describe('AddKataComponent', () => {
  let component: AddKataComponent;
  let fixture: ComponentFixture<AddKataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddKataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddKataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
