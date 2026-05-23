import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { apiErrorMessage } from '../../core/error/api-error';
import { QuoteResponse } from '../../core/quote/quote.models';
import { QuoteService } from '../../core/quote/quote.service';
import { StoryCreateRequest, StoryResponse } from '../../core/story/story.models';
import { StoryService } from '../../core/story/story.service';

@Component({
  selector: 'app-story-form-page',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  template: `
    <section class="form-panel">
      <div class="page-heading compact">
        <div>
          <p class="eyebrow">Story</p>
          <h1>{{ pageTitle() }}</h1>
        </div>
        <a routerLink="/my-stories">My Stories</a>
      </div>

      @if (errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
      }

      <aside class="prompt-panel">
        <p class="eyebrow">{{ isEdit ? 'Story prompt' : 'Quote of the Day' }}</p>

        @if (quoteLoading()) {
          <p class="muted">Loading quote...</p>
        } @else if (inspirationQuote()) {
          <blockquote>{{ inspirationQuote()?.text }}</blockquote>
          <p class="meta">
            {{ inspirationQuote()?.author }}
            @if (promptDate()) {
              - {{ promptDate() | date: 'mediumDate' }}
            }
          </p>
          <p class="muted">Your story must include today's quote.</p>
        }
      </aside>

      <form [formGroup]="form" (ngSubmit)="submit()" class="story-form">
        <label>
          Title
          <input type="text" formControlName="title">
        </label>

        <label>
          Content
          <textarea rows="12" formControlName="content"></textarea>
          <span class="field-hint" [class.over-limit]="wordCount() > maxWords">
            {{ wordCount() }} / {{ maxWords }} words
          </span>
          @if (quoteMissing()) {
            <span class="field-hint over-limit">Today's quote is missing from your story.</span>
          }
        </label>

        <button type="submit" [disabled]="form.invalid || submitting()">
          {{ submitting() ? 'Saving...' : 'Save Story' }}
        </button>
      </form>
    </section>
  `,
  styleUrl: './story-page.css'
})
export class StoryFormPageComponent {
  readonly maxWords = 500;

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly quoteService = inject(QuoteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storyService = inject(StoryService);

  private readonly storyId = Number(this.route.snapshot.paramMap.get('id'));

  readonly isEdit = Number.isFinite(this.storyId) && this.storyId > 0;
  readonly pageTitle = computed(() => this.isEdit ? 'Edit Story' : 'New Story');
  readonly inspirationQuote = signal<QuoteResponse | null>(null);
  readonly promptDate = signal<string | null>(null);
  readonly quoteLoading = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    content: ['', [Validators.required, Validators.maxLength(8000), wordLimitValidator(this.maxWords)]]
  });

  constructor() {
    if (this.isEdit) {
      this.loadStory();
    } else {
      this.loadQuoteOfDay();
    }
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const request: StoryCreateRequest = this.form.getRawValue();
    const save$ = this.isEdit
      ? this.storyService.update(this.storyId, request)
      : this.storyService.create(request);

    save$.subscribe({
      next: (story) => {
        void this.router.navigate(['/stories', story.id]);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error, 'Could not save story'));
        this.submitting.set(false);
      },
      complete: () => this.submitting.set(false)
    });
  }

  wordCount(): number {
    return countWords(this.form.controls.content.value);
  }

  private loadQuoteOfDay(): void {
    this.quoteLoading.set(true);

    this.quoteService.today().subscribe({
      next: (quote) => {
        this.applyQuoteRequirement(quote);
        this.promptDate.set(todayIsoDate());
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error, 'Could not load quote of the day'));
        this.quoteLoading.set(false);
      },
      complete: () => this.quoteLoading.set(false)
    });
  }

  private loadStory(): void {
    this.quoteLoading.set(true);

    this.storyService.findById(this.storyId).subscribe({
      next: (story) => this.patchForm(story),
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error, 'Could not load story'));
        this.quoteLoading.set(false);
      },
      complete: () => this.quoteLoading.set(false)
    });
  }

  private patchForm(story: StoryResponse): void {
    this.applyQuoteRequirement(story.quote);
    this.promptDate.set(story.promptDate);

    this.form.patchValue({
      title: story.title,
      content: story.content
    });
  }

  quoteMissing(): boolean {
    const quote = this.inspirationQuote();
    const content = this.form.controls.content.value;
    return Boolean(quote && content.trim() && !includesQuote(content, quote.text));
  }

  private applyQuoteRequirement(quote: QuoteResponse): void {
    this.inspirationQuote.set(quote);
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
