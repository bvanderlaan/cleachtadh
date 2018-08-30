import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Response } from '@angular/http';

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
        catchError((error: Response) => {
          console.error(`GET Katas Failed: ${error.statusText}`);
          return of([]);
        }));
  }
}

interface Katas {
  katas: Kata[],
}