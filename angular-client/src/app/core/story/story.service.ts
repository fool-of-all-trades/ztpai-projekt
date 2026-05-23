import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import { StoryCreateRequest, StoryResponse, StoryUpdateRequest } from './story.models';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private readonly http = inject(HttpClient);

  findAll(query = '', date = ''): Observable<StoryResponse[]> {
    let params = new HttpParams();

    if (query.trim()) {
      params = params.set('query', query.trim());
    }

    if (date.trim()) {
      params = params.set('date', date.trim());
    }

    return this.http.get<StoryResponse[]>(`${API_BASE_URL}/stories`, { params });
  }

  findMine(): Observable<StoryResponse[]> {
    return this.http.get<StoryResponse[]>(`${API_BASE_URL}/stories/me`);
  }

  findById(id: number): Observable<StoryResponse> {
    return this.http.get<StoryResponse>(`${API_BASE_URL}/stories/${id}`);
  }

  create(request: StoryCreateRequest): Observable<StoryResponse> {
    return this.http.post<StoryResponse>(`${API_BASE_URL}/stories`, request);
  }

  update(id: number, request: StoryUpdateRequest): Observable<StoryResponse> {
    return this.http.put<StoryResponse>(`${API_BASE_URL}/stories/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/stories/${id}`);
  }
}
