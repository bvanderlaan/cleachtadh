import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Kata } from '../kata.model';
import { AppSettings } from '../../app.settings';

@Injectable({
  providedIn: 'root'
})
export class KataListService {

  constructor(private http: HttpClient) { }

  getKatas(limit: Number, page: Number) : Observable<Katas> {
    const params = new HttpParams()
      .append('limit', String(limit))
      .append('page', String(page));

    return this.http.get<Katas>(`${AppSettings.API_ENDPOINT}/v1/katas`, { params })
      .pipe(catchError((res: HttpErrorResponse) => {
          console.error(`GET Katas Failed: ${res.error.message || res.statusText}`);
          return of({ katas: [], total: 0 });
        }));
  }
}

interface Katas {
  katas: Kata[],
  total: Number,
}
