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

  constructor(private service: UserListService, private authService: AuthenticationService) {
    this.users = [];
    this.error = '';
    this.currentUserId = '';
  }

  ngOnInit() {
    this.service.getUsers().subscribe(users => (this.users = users));
    this.authService.userLogInStateSignal.subscribe((currentUser) => {
      this.currentUserId = currentUser.id;
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
