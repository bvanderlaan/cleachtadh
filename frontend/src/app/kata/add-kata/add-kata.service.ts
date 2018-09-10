import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Response } from '@angular/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Kata } from '../kata.model';
import { AppSettings } from '../../app.settings';

@Injectable({
  providedIn: 'root'
})
export class AddKataService {

  constructor(private http: HttpClient) { }

  add(kata: Kata) : Observable<Kata> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      }),
    };

    return this.http.post<Kata>(`${AppSettings.API_ENDPOINT}/v1/katas`, kata, httpOptions)
      .pipe(catchError((error: Response) => {
        return throwError(`Failed to add Kata: ${error.statusText}`);
      }));
  }
}
