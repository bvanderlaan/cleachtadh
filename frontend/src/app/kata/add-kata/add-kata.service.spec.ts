import { TestBed, inject } from '@angular/core/testing';

import { AddKataService } from './add-kata.service';

describe('AddKataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddKataService]
    });
  });

  it('should be created', inject([AddKataService], (service: AddKataService) => {
    expect(service).toBeTruthy();
  }));
});
