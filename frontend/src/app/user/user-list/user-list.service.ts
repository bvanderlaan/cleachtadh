import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';

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

  getUsers(limit: Number, page: Number) : Observable<Users> {
    const params = new HttpParams()
      .append('limit', String(limit))
      .append('page', String(page));

    const httpOptions = {
      params,
      headers: new HttpHeaders({
        'Authorization': this.authService.token,
      }),
    };

    return this.http.get<Users>(`${AppSettings.API_ENDPOINT}/v1/users`, httpOptions)
      .pipe(catchError((res: HttpErrorResponse) => {
          console.error(`GET Users Failed: ${res.error.message || res.statusText}`);
          return of({ users: [], total: 0 });
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
        return throwError(`Failed to update User: ${res.error.message || res.statusText}`);
      }));
  }
}

interface Users {
  users: User[],
  total: Number,
}
