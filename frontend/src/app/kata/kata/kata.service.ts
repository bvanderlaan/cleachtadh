import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Response } from '@angular/http';

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
      .pipe(catchError((error: Response) => {
        console.error(`GET Kata Failed: ${error.statusText}`);
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
      .pipe(catchError((error: Response) => {
        console.error(`DELETE Kata Failed: ${error.statusText}`);
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
      .pipe(catchError((error: Response) => {
        return throwError(`Failed to update Kata: ${error.statusText}`);
      }));
  }
}
