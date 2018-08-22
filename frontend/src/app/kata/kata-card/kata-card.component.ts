import { Component, Input } from '@angular/core';

import { Kata } from '../kata.model';

@Component({
  selector: 'kata-card',
  templateUrl: './kata-card.component.html',
  styleUrls: ['./kata-card.component.scss']
})
export class KataCardComponent {
  @Input() kata: Kata;

  constructor() { }

}
