import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { apiErrorMessage } from '../../core/error/api-error';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-panel">
      <div>
        <p class="eyebrow">Account</p>
        <h1>Login</h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form">
        <label>
          Username
          <input type="text" formControlName="username" autocomplete="username">
        </label>

        <label>
          Password
          <input type="password" formControlName="password" autocomplete="current-password">
        </label>

        @if (errorMessage) {
          <p class="error">{{ errorMessage }}</p>
        }

        <button type="submit" [disabled]="form.invalid || submitting">
          {{ submitting ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="switch-link">
        Need an account? <a routerLink="/register">Register</a>
      </p>
    </section>
  `,
  styleUrl: './auth-page.css'
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(120)]]
  });

  submitting = false;
  errorMessage = '';

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        void this.router.navigateByUrl('/stories');
      },
      error: (error: unknown) => {
        this.errorMessage = apiErrorMessage(error, 'Login failed');
        this.submitting = false;
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }
}
