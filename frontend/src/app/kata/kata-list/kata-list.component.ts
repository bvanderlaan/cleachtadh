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

  constructor(private service: KataListService, private authService: AuthenticationService) {
    this.katas = [];
    this.loggedIn = false;
  }

  ngOnInit() {
    this.service.getKatas().subscribe(katas => (this.katas = katas));

    this.authService.userLogInStateSignal.subscribe((currentUserDisplayName) => {
      this.loggedIn = !!currentUserDisplayName;
    });
  }

}
