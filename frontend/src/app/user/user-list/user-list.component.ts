import { Component, OnInit } from '@angular/core';

import { User } from '../user.model';
import { UserListService } from './user-list.service';

import { AuthenticationService } from '../../authentication';

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  private users: User[];
  public error: string;
  public currentUserId: string;
  public currentPage: Number;
  public itemsPerPage: Number;
  public total: Number;
  public loading: boolean;

  constructor(private service: UserListService, private authService: AuthenticationService) {
    this.users = [];
    this.error = '';
    this.currentUserId = '';
    this.loading = false;
    this.currentPage = 1;
    this.itemsPerPage = 19;
    this.total = 0;
  }

  ngOnInit() {
    this.getPage(1);

    this.authService.userLogInStateSignal.subscribe((currentUser) => {
      this.currentUserId = currentUser.id;
    });
  }

  getPage(page: Number) {
    this.loading = true;

    this.service.getUsers(this.itemsPerPage, page)
      .subscribe((data) => {
        this.users = data.users;
        this.currentPage = page;
        this.total = data.total;
        this.loading = false;
      });
  }

  clearError() {
    this.error = '';
  }

  changeState(user: User) {
    // The state is bounded to a switch which excepts boolean
    // it ends up changing the state from an Enum to a boolean
    // this line here converts it back to an Enum
    user.state = +user.state;

    this.service.updateUser(user)
      .subscribe(() => {
        this.clearError();
      }, (err) => {
        this.error = err;
        user.state = +!user.state;
      })
  }

}
