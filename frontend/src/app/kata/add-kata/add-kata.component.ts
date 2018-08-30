import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AddKataService } from './add-kata.service';
import { Kata } from '../kata.model';

@Component({
  selector: 'app-add-kata',
  templateUrl: './add-kata.component.html',
  styleUrls: ['./add-kata.component.scss']
})
export class AddKataComponent {
  public model: Kata;
  public error: string;

  constructor(private service: AddKataService, private router: Router) {
    this.error = '';
    this.model = {
      name: '',
      description: '',
    };
  }

  public clearError() {
    this.error = '';
  }

  public addKata() {
    this.service.add(this.model)
      .subscribe(kata => {
        this.clearError();
        // TODO: go to newly added Kata page
        console.log('a', kata)
        this.router.navigate(['/']);
      }, (err) => (this.error = err));
  }
}
