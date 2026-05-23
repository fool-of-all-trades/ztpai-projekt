import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import { QuoteResponse } from './quote.models';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<QuoteResponse[]> {
    return this.http.get<QuoteResponse[]>(`${API_BASE_URL}/quotes`);
  }

  random(): Observable<QuoteResponse> {
    return this.http.get<QuoteResponse>(`${API_BASE_URL}/quotes/random`);
  }

  today(date?: string): Observable<QuoteResponse> {
    const url = date?.trim()
      ? `${API_BASE_URL}/quotes/today?date=${encodeURIComponent(date.trim())}`
      : `${API_BASE_URL}/quotes/today`;

    return this.http.get<QuoteResponse>(url);
  }
}
