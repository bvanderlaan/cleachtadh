import { Component } from '@angular/core';

@Component({
  selector: 'app-add-kata',
  templateUrl: './add-kata.component.html',
  styleUrls: ['./add-kata.component.scss']
})
export class AddKataComponent {
  public model: KataFormData;
  public error: string;

  constructor() {
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
    console.log('sup', this.model)
  }

}

interface KataFormData {
  name: string,
  description: string,
}
