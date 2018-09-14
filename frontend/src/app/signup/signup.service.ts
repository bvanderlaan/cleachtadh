import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Response } from '@angular/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AppSettings } from '../app.settings';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  constructor(private http: HttpClient) { }

  signup(body : Object) : Observable<any> {
    const bodyString = JSON.stringify(body);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = { headers };

    return this.http.post(`${AppSettings.API_ENDPOINT}/v1/signup`, bodyString, options)
      .pipe(
        catchError((error: Response) => {
          return throwError(`Failed to sign up: ${error.statusText}`);
        }),
      );
  }
}
