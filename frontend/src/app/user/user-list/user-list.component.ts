import { Component, OnInit } from '@angular/core';

import { User } from '../user.model';
import { UserListService } from './user-list.service';

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  private users: User[];
  public error: string;

  constructor(private service: UserListService) {
    this.users = [];
    this.error = '';
  }

  ngOnInit() {
    this.service.getUsers().subscribe(users => (this.users = users));
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
