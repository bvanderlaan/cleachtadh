import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Kata } from '../kata.model';
import { AppSettings } from '../../app.settings';
import { AuthenticationService } from '../../authentication';

@Injectable({
  providedIn: 'root'
})
export class AddKataService {

  constructor(private http: HttpClient, private authService: AuthenticationService) { }

  add(kata: Kata) : Observable<Kata> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': this.authService.token,
      }),
    };

    return this.http.post<Kata>(`${AppSettings.API_ENDPOINT}/v1/katas`, kata, httpOptions)
      .pipe(catchError((res: HttpErrorResponse) => {
        return throwError(`Failed to add Kata: ${res.error.message || res.statusText}`);
      }));
  }
}
