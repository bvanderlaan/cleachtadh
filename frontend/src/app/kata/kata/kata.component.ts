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
  private cachedKata: Kata;
  public isEditing: boolean;
  public error: string;
  public message: string;

  constructor(private route: ActivatedRoute, private router: Router, private service: KataService) {
    this.error = '';
    this.message = '';
    this.kata = new Kata('', '');
    this.isEditing = false;
  }

  clearError() {
    this.error = '';
  }

  clearMessage() {
    this.message = '';
  }

  edit() {
    this.cachedKata = { ...this.kata };
    this.clearError();
    this.clearMessage();
    this.isEditing = true;
  }

  cancelEdit() {
    this.kata = { ...this.cachedKata };
    this.isEditing = false;
  }

  public updateKata() {
    this.service.updateKata(this.kata)
      .subscribe((kata) => {
        this.clearError();
        this.isEditing = false;
        this.message = 'Kata successfully updated';
      }, (err) => (this.error = err));
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
