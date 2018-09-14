import { Component, OnInit, OnDestroy } from '@angular/core';

import { Router } from '@angular/router';

import { finalize } from 'rxjs/operators';

import { SignupService } from './signup.service';

interface SignUpFormData {
  displayName: string,
  email: string,
  password: string,
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {
  public user: SignUpFormData;
  public error: string;
  private signupSubscription;

  constructor(private service: SignupService, private router: Router) {
    this.error = '';
    this.user = {
      displayName: '',
      email: '',
      password: '',
    };
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.signupSubscription) {
      this.signupSubscription.unsubscribe();
    }
  }

  clearError() {
    this.error = '';
  }

  createUser() {
    this.signupSubscription = this.service.signup(this.user)
    .pipe(finalize(() => this.signupSubscription.unsubscribe()))
    .subscribe((user) => {
      this.clearError();
      this.router.navigate(['/login']);
    }, (err) => {
      this.error = err;
    });
  }

}
