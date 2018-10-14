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
  public token: string;
  public displayName: string;
  public id: string;
  private admin: boolean;

  public userLogInStateSignal = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  setCurrentUser(id: string, displayName: string, token: string, admin: boolean) {
    const bearer = token.startsWith('Bearer ')
      ? ''
      : 'Bearer ';

    this.token = `${bearer}${token}`;
    this.id = id;
    this.displayName = displayName;
    this.admin = admin;
    localStorage.setItem('currentUser', JSON.stringify({ id, displayName, token: this.token, admin }));
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
    return this.admin;
  }

  logout() {
    this.displayName = '';
    this.token = '';
    localStorage.removeItem('currentUser');
    this.announceUserLogInStateChanged();
  }

  private announceUserLogInStateChanged() {
    this.userLogInStateSignal.next(this.displayName);
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
