import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-kata',
  templateUrl: './add-kata.component.html',
  styleUrls: ['./add-kata.component.scss']
})
export class AddKataComponent implements OnInit {
  public model;
  constructor() { }

  ngOnInit() {
    this.model = {
      name: '',
      description: '',
    };
  }

  public addKata() {
    console.log('sup', this.model)
  }

}
