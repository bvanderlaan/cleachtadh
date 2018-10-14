import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { User } from '../user.model';
import { AppSettings } from '../../app.settings';
import { AuthenticationService } from '../../authentication';
import { throwError } from '../../../../node_modules/rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserListService {

  constructor(private http: HttpClient, private authService: AuthenticationService) { }

  getUsers() : Observable<User[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': this.authService.token,
      }),
    };

    return this.http.get<Users>(`${AppSettings.API_ENDPOINT}/v1/users`, httpOptions)
      .pipe(map(data => data.users),
        catchError((res: HttpErrorResponse) => {
          console.error(`GET Users Failed: ${res.error.message}`);
          return of([]);
        }));
  }

  updateUser(user : User) : Observable<{}|User> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': this.authService.token,
      }),
    };

    return this.http.put<User>(`${AppSettings.API_ENDPOINT}/v1/users/${user.id}`, user, httpOptions)
      .pipe(catchError((res: HttpErrorResponse) => {
        return throwError(`Failed to update User: ${res.error.message}`);
      }));
  }
}

interface Users {
  users: User[],
}
