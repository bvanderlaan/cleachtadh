import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { KataService } from './kata.service';
import { Kata } from '../kata.model';

@Component({
  selector: 'app-kata',
  templateUrl: './kata.component.html',
  styleUrls: ['./kata.component.scss']
})
export class KataComponent implements OnInit, OnDestroy {
  private routeParamsSubscription
  private kata: Kata;

  constructor(private route: ActivatedRoute, private service: KataService) {
    this.kata = new Kata('', '');
  }

  ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe((params) => {
      this.service.getKata(params['id'])
        .subscribe(kata => (this.kata = kata));
    });
  }

  ngOnDestroy() {
    this.routeParamsSubscription.unsubscribe();
  }

}
