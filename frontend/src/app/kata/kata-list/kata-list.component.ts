import { Component, OnInit } from '@angular/core';

import { Kata } from '../kata.model';
import { KataListService } from './kata-list.service';

@Component({
  selector: 'kata-list',
  templateUrl: './kata-list.component.html',
  styleUrls: ['./kata-list.component.scss']
})
export class KataListComponent implements OnInit {
  private katas: Kata[];

  constructor(private service: KataListService) {
    this.katas = [];
  }

  ngOnInit() {
    this.service.getKatas().subscribe(katas => (this.katas = katas));
  }

}
