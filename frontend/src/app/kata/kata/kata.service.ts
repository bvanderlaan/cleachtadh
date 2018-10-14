import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Kata } from '../kata.model';
import { AppSettings } from '../../app.settings';
import { AuthenticationService } from '../../authentication';

@Injectable({
  providedIn: 'root'
})
export class KataService {

  constructor(private http: HttpClient, private authService: AuthenticationService) { }

  getKata(id: string) : Observable<Kata> {
    return this.http.get<Kata>(`${AppSettings.API_ENDPOINT}/v1/katas/${id}`)
      .pipe(catchError((res: HttpErrorResponse) => {
        console.error(`GET Kata Failed: ${res.error.message || res.statusText}`);
        return of(new Kata('',''));
      }));
  }

  deleteKata(id: string) : Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': this.authService.token,
      }),
    };

    return this.http.delete(`${AppSettings.API_ENDPOINT}/v1/katas/${id}`, httpOptions)
      .pipe(catchError((res: HttpErrorResponse) => {
        console.error(`DELETE Kata Failed: ${res.error.message || res.statusText}`);
        return of(null);
      }));
  }

  updateKata(kata: Kata) : Observable<{}|Kata> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': this.authService.token,
      }),
    };

    return this.http.put<Kata>(`${AppSettings.API_ENDPOINT}/v1/katas/${kata.id}`, kata, httpOptions)
      .pipe(catchError((res: HttpErrorResponse) => {
        return throwError(`Failed to update Kata: ${res.error.message || res.statusText}`);
      }));
  }
}
