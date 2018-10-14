import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AppSettings } from '../app.settings';

interface User {
  id: string;
  displayName: string;
  token: string;
  admin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private currentUser: User;
  public userLogInStateSignal = new BehaviorSubject<User>({
    id: '',
    displayName: '',
    token: '',
    admin: false,
  });

  constructor(private http: HttpClient) {
    this.currentUser = {
      id: '',
      displayName: '',
      token: '',
      admin: false,
    };
    this.loadCurrentUser();
  }

  setCurrentUser(id: string, displayName: string, token: string, admin: boolean) {
    const bearer = token.startsWith('Bearer ')
      ? ''
      : 'Bearer ';

    this.currentUser.token = `${bearer}${token}`;
    this.currentUser.id = id;
    this.currentUser.displayName = displayName;
    this.currentUser.admin = admin;
    localStorage.setItem('currentUser', JSON.stringify({
      id,
      displayName,
      admin,
      token: this.currentUser.token
    }));
    this.announceUserLogInStateChanged()
  }

  login(body: Object) : Observable<User> {
    const bodyString = JSON.stringify(body);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = { headers };

    return this.http.post<User>(`${AppSettings.API_ENDPOINT}/v1/authenticate`, bodyString, options)
      .pipe(
        tap(user => this.setCurrentUser(user.id, user.displayName, user.token, user.admin)),
        catchError((res: HttpErrorResponse) => {
          return throwError(`Failed to login: ${res.error.message || res.statusText}`);
        }),
      );
  }

  isLoggedIn() {
    return !!this.userLogInStateSignal.value;
  }

  isAdmin() {
    return this.currentUser.admin;
  }

  get token() {
    return this.currentUser.token;
  }

  logout() {
    this.currentUser.displayName = '';
    this.currentUser.token = '';
    this.currentUser.id = '';
    localStorage.removeItem('currentUser');
    this.announceUserLogInStateChanged();
  }

  private announceUserLogInStateChanged() {
    this.userLogInStateSignal.next(this.currentUser);
  }

  private loadCurrentUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const displayName = currentUser && currentUser.displayName || '';
    const token = currentUser && currentUser.token || '';
    const admin = !!(currentUser && currentUser.admin);
    const id = currentUser && currentUser.id;

    if (id && displayName && token) {
      this.setCurrentUser(id, displayName, token, admin);
    }
  }
}
