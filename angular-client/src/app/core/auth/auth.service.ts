import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly token = signal<string | null>(null);

  readonly currentUser = signal<UserResponse | null>(null);
  readonly isAuthenticated = computed(() => this.token() !== null && this.currentUser() !== null);

  get accessToken(): string | null {
    return this.token();
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/register`, request).pipe(
      tap((response) => this.applyAuthResponse(response))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, request).pipe(
      tap((response) => this.applyAuthResponse(response))
    );
  }

  loadCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${API_BASE_URL}/auth/me`).pipe(
      tap((user) => this.currentUser.set(user))
    );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
  }

  private applyAuthResponse(response: AuthResponse): void {
    this.token.set(response.accessToken);
    this.currentUser.set(response.user);
  }
}
