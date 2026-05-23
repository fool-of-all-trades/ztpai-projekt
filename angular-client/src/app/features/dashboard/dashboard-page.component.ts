import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { apiErrorMessage } from '../../core/error/api-error';
import { QuoteResponse } from '../../core/quote/quote.models';
import { QuoteService } from '../../core/quote/quote.service';
import { StoryCreateRequest } from '../../core/story/story.models';
import { StoryService } from '../../core/story/story.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  template: `
    <section class="dashboard">
      <header class="daily-header">
        <p class="eyebrow">Storyline School</p>
        <h1>{{ today | date: 'fullDate' }}</h1>
      </header>

      <section class="quote-panel">
        <p class="eyebrow">Quote of the Day</p>

        @if (loading()) {
          <p class="muted">Loading quote...</p>
        } @else if (quote()) {
          <blockquote>{{ quote()?.text }}</blockquote>
          <p class="quote-author">
            {{ quote()?.author }}
            @if (quote()?.source) {
              <span> - {{ quote()?.source }}</span>
            }
          </p>
        } @else if (errorMessage()) {
          <p class="error">{{ errorMessage() }}</p>
        }
      </section>

      <section class="writer-panel">
        <div class="writer-heading">
          <div>
            <p class="eyebrow">Today's story</p>
            <h2>Write for the quote above</h2>
          </div>
          <a routerLink="/stories">Read Stories</a>
        </div>

        <p class="muted">Your story must include today's quote.</p>

        @if (submitMessage()) {
          <p class="error">{{ submitMessage() }}</p>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" class="story-form">
          <label>
            Title
            <input type="text" formControlName="title" maxlength="100">
          </label>

          <label>
            Story
            <textarea rows="12" formControlName="content"></textarea>
            <span class="field-hint" [class.over-limit]="wordCount() > maxWords">
              {{ wordCount() }} / {{ maxWords }} words
            </span>
            @if (quoteMissing()) {
              <span class="field-hint over-limit">Today's quote is missing from your story.</span>
            }
          </label>

          @if (!isAuthenticated()) {
            <p class="muted">
              <a routerLink="/login">Log in</a> or <a routerLink="/register">register</a> to share your story.
            </p>
          }

          <button type="submit" [disabled]="form.invalid || submitting() || loading() || !quote()">
            {{ submitting() ? 'Sharing...' : 'Share' }}
          </button>
        </form>
      </section>
    </section>
  `,
  styles: [`
    .dashboard {
      display: grid;
      gap: 18px;
    }

    .daily-header,
    .quote-panel,
    .writer-panel {
      border: 1px solid #dde3ee;
      border-radius: 8px;
      background: #ffffff;
      padding: 28px;
    }

    .daily-header {
      padding-bottom: 22px;
    }

    .eyebrow {
      margin: 0 0 8px;
      color: #64748b;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    h1,
    h2 {
      margin: 0;
      color: #172033;
      line-height: 1.15;
    }

    h1 {
      font-size: 2rem;
    }

    h2 {
      font-size: 1.35rem;
    }

    .writer-heading {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 14px;
    }

    a {
      color: #315a89;
      font-weight: 700;
    }

    blockquote {
      border-left: 4px solid #6b8fb5;
      color: #334155;
      line-height: 1.65;
      margin: 18px 0 0;
      padding-left: 14px;
    }

    .story-form {
      display: grid;
      gap: 16px;
      margin-top: 18px;
    }

    .story-form label {
      display: grid;
      gap: 7px;
      color: #334155;
      font-weight: 700;
    }

    input,
    textarea {
      width: 100%;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      color: #172033;
      padding: 11px 12px;
    }

    input:focus,
    textarea:focus {
      border-color: #315a89;
      outline: 3px solid #d8e7f7;
    }

    .story-form button {
      border: 0;
      border-radius: 6px;
      background: #315a89;
      color: #ffffff;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      min-height: 42px;
      padding: 10px 16px;
      width: fit-content;
    }

    .story-form button:disabled {
      background: #94a3b8;
      cursor: not-allowed;
    }

    .field-hint {
      color: #64748b;
      font-size: 0.86rem;
      font-weight: 600;
    }

    .field-hint.over-limit {
      color: #be123c;
    }

    .quote-author,
    .muted {
      color: #64748b;
      margin: 14px 0 0;
    }

    .quote-author {
      font-weight: 700;
    }

    .error {
      border-radius: 6px;
      background: #fff1f2;
      color: #be123c;
      margin: 14px 0 0;
      padding: 10px 12px;
    }

    @media (max-width: 820px) {
      .writer-heading {
        align-items: stretch;
        flex-direction: column;
      }
    }
  `]
})
export class DashboardPageComponent {
  readonly maxWords = 500;
  readonly today = todayIsoDate();

  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly quoteService = inject(QuoteService);
  private readonly router = inject(Router);
  private readonly storyService = inject(StoryService);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly quote = signal<QuoteResponse | null>(null);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly submitMessage = signal('');

  readonly form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    content: ['', [Validators.required, Validators.maxLength(8000), wordLimitValidator(this.maxWords)]]
  });

  constructor() {
    this.loadQuote();
  }

  private loadQuote(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.quoteService.today().subscribe({
      next: (quote) => this.applyQuoteRequirement(quote),
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error, 'Could not load quote'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  submit(): void {
    this.submitMessage.set('');

    if (!this.isAuthenticated()) {
      this.submitMessage.set('Log in or register to share your story.');
      return;
    }

    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const request: StoryCreateRequest = this.form.getRawValue();
    this.storyService.create(request).subscribe({
      next: (story) => {
        this.form.reset();
        void this.router.navigate(['/stories', story.id]);
      },
      error: (error: unknown) => {
        this.submitMessage.set(apiErrorMessage(error, 'Could not share story'));
        this.submitting.set(false);
      },
      complete: () => this.submitting.set(false)
    });
  }

  wordCount(): number {
    return countWords(this.form.controls.content.value);
  }

  quoteMissing(): boolean {
    const quote = this.quote();
    const content = this.form.controls.content.value;
    return Boolean(quote && content.trim() && !includesQuote(content, quote.text));
  }

  private applyQuoteRequirement(quote: QuoteResponse): void {
    this.quote.set(quote);
    this.form.controls.content.addValidators(quoteInclusionValidator(quote.text));
    this.form.controls.content.updateValueAndValidity();
  }
}

function wordLimitValidator(maxWords: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return countWords(control.value) > maxWords ? { wordLimit: true } : null;
  };
}

function quoteInclusionValidator(quoteText: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return includesQuote(control.value, quoteText) ? null : { quoteMissing: true };
  };
}

function countWords(content: string | null | undefined): number {
  const normalizedContent = content?.trim() ?? '';
  return normalizedContent ? normalizedContent.split(/\s+/).length : 0;
}

function includesQuote(content: string | null | undefined, quoteText: string): boolean {
  return normalizeForQuoteMatch(content).includes(normalizeForQuoteMatch(quoteText));
}

function normalizeForQuoteMatch(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function todayIsoDate(): string {
  const date = new Date();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
