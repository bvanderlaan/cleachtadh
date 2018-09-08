import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
  public error: string;

  constructor(private route: ActivatedRoute, private router: Router, private service: KataService) {
    this.error = '';
    this.kata = new Kata('', '');
  }

  public clearError() {
    this.error = '';
  }

  delete() {
    this.service.deleteKata(this.kata.id)
      .subscribe(() => {
        this.router.navigate(['/katas']);
      }, (err) => (this.error = err))
  }

  ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe((params) => {
      this.service.getKata(params['id'])
        .subscribe(kata => (this.kata = kata), (err) => (this.error = err));
    });
  }

  ngOnDestroy() {
    this.routeParamsSubscription.unsubscribe();
  }

}
