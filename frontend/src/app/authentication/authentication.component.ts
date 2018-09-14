import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { finalize } from 'rxjs/operators';

import { AuthenticationService } from './authentication.service';

interface LoginFormData {
  email: string,
  password: string,
}

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit, OnDestroy {
  public error: string;
  public user: LoginFormData;
  private loginSubscription;

  constructor(private authService: AuthenticationService, private router: Router) {
    this.error = '';
    this.user = {
      email: '',
      password: '',
    };
  }

  ngOnInit() {
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  clearError() {
    this.error = '';
  }

  login() {
    this.loginSubscription = this.authService.login(this.user)
      .pipe(finalize(() => this.loginSubscription.unsubscribe()))
      .subscribe((user) => {
        this.clearError();
        this.router.navigate(['/']);
      }, (err) => {
        if ((err === 404) || (err === 401)) {
          this.error = "Your email and password does not match what we have on record";
        } else {
          this.error = err;
        }
      });
  }

}
