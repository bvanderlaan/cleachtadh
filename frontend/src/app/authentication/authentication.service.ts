import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Response } from '@angular/http';

import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AppSettings } from '../app.settings';

interface User {
  displayName: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public token: string;
  public displayName: string;

  public userLogInStateSignal = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  setCurrentUser(displayName: string, token: string) {
    const bearer = token.startsWith('Bearer ')
      ? ''
      : 'Bearer ';

    this.token = `${bearer}${token}`;
    this.displayName = displayName;
    localStorage.setItem('currentUser', JSON.stringify({ displayName, token: this.token }));
    this.announceUserLogInStateChanged()
  }

  login(body: Object) : Observable<User> {
    const bodyString = JSON.stringify(body);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = { headers };

    return this.http.post<User>(`${AppSettings.API_ENDPOINT}/v1/authenticate`, bodyString, options)
      .pipe(
        tap(user => this.setCurrentUser(user.displayName, user.token)),
        catchError((error: Response) => {
          return throwError(`Failed to login: ${error.statusText}`);
        }),
      );
  }

  isLoggedIn() {
    return !!this.userLogInStateSignal.value;
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

    if (displayName && token) {
      this.setCurrentUser(displayName, token);
    }
  }
}
