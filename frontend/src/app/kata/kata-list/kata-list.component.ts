import { Component, OnInit } from '@angular/core';

import { Kata } from '../kata.model';
import { KataListService } from './kata-list.service';
import { AuthenticationService } from '../../authentication';

@Component({
  selector: 'kata-list',
  templateUrl: './kata-list.component.html',
  styleUrls: ['./kata-list.component.scss']
})
export class KataListComponent implements OnInit {
  private katas: Kata[];
  public loggedIn: boolean;
  public currentPage: Number;
  public itemsPerPage: Number;
  public total: Number;
  public loading: boolean;

  constructor(private service: KataListService, private authService: AuthenticationService) {
    this.katas = [];
    this.loggedIn = false;
    this.loading = false;
    this.currentPage = 1;
    this.itemsPerPage = 19;
    this.total = 0;
  }

  ngOnInit() {
    this.getPage(1);

    this.authService.userLogInStateSignal.subscribe((currentUser) => {
      this.loggedIn = !!currentUser.displayName;
    });
  }

  getPage(page: Number) {
    this.loading = true;

    this.service.getKatas(this.itemsPerPage, page)
      .subscribe((data) => {
        this.katas = data.katas;
        this.currentPage = page;
        this.total = data.total;
        this.loading = false;
      });
  }

}
