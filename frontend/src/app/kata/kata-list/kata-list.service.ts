import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Kata } from '../kata.model';
import { AppSettings } from '../../app.settings';

@Injectable({
  providedIn: 'root'
})
export class KataListService {

  constructor(private http: HttpClient) { }

  getKatas() : Observable<Kata[]> {
    return this.http.get<Katas>(`${AppSettings.API_ENDPOINT}/v1/katas`)
      .pipe(map(data => data.katas),
        catchError((res: HttpErrorResponse) => {
          console.error(`GET Katas Failed: ${res.error.message || res.statusText}`);
          return of([]);
        }));
  }
}

interface Katas {
  katas: Kata[],
}
