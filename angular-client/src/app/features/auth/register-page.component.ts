import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { apiErrorMessage } from '../../core/error/api-error';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-panel">
      <div>
        <p class="eyebrow">Account</p>
        <h1>Register</h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form">
        <label>
          Username
          <input type="text" formControlName="username" autocomplete="username">
        </label>

        <label>
          Password
          <input type="password" formControlName="password" autocomplete="new-password">
        </label>

        @if (errorMessage) {
          <p class="error">{{ errorMessage }}</p>
        }

        <button type="submit" [disabled]="form.invalid || submitting">
          {{ submitting ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p class="switch-link">
        Already have an account? <a routerLink="/login">Login</a>
      </p>
    </section>
  `,
  styleUrl: './auth-page.css'
})
export class RegisterPageComponent {
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

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        void this.router.navigateByUrl('/stories');
      },
      error: (error: unknown) => {
        this.errorMessage = apiErrorMessage(error, 'Registration failed');
        this.submitting = false;
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }
}
