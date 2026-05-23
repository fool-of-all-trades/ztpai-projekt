import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { apiErrorMessage } from '../../core/error/api-error';
import { QuoteResponse } from '../../core/quote/quote.models';
import { QuoteService } from '../../core/quote/quote.service';
import { StoryResponse } from '../../core/story/story.models';
import { StoryService } from '../../core/story/story.service';

@Component({
  selector: 'app-stories-page',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Stories of the Day</p>
        <h1>Stories &mdash; {{ selectedDateLabel() }}</h1>
      </div>
      <a routerLink="/dashboard" fragment="write">Write today's story</a>
    </section>

    <form class="search-row" (ngSubmit)="loadStories()">
      <input type="search" [formControl]="searchControl" placeholder="Search title or content">
      <input type="date" [formControl]="dateControl" [attr.max]="today" aria-label="Story date">
      <button type="submit">Search</button>
      <button type="button" class="secondary-action" (click)="showToday()">Today</button>
    </form>

    @if (errorMessage()) {
      <p class="error">{{ errorMessage() }}</p>
    }

    <section class="day-summary">
      <p class="meta">
        Stories added this day: <strong>{{ stories().length }}</strong>
      </p>
    </section>

    @if (quote()) {
      <aside class="prompt-panel">
        <p class="eyebrow">Quote for {{ dateControl.value | date: 'mediumDate' }}</p>
        <blockquote>{{ quote()?.text }}</blockquote>
        <p class="meta">
          {{ quote()?.author }}
          @if (quote()?.source) {
            <span> - {{ quote()?.source }}</span>
          }
        </p>
      </aside>
    }

    @if (loading()) {
      <p class="muted">Loading stories...</p>
    } @else {
      <section class="story-grid">
        @for (story of stories(); track story.id) {
          <article class="story-card">
            <div>
              <p class="meta">{{ story.author.username }} - prompt {{ story.promptDate | date: 'mediumDate' }}</p>
              <h2><a [routerLink]="['/stories', story.id]">{{ story.title }}</a></h2>
              <p>{{ preview(story.content) }}</p>
            </div>
            <blockquote>{{ story.quote.text }}</blockquote>
          </article>
        } @empty {
          <p class="muted">No stories found.</p>
        }
      </section>
    }
  `,
  styleUrl: './story-page.css'
})
export class StoriesPageComponent {
  private readonly storyService = inject(StoryService);
  private readonly quoteService = inject(QuoteService);

  readonly today = todayIsoDate();
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly dateControl = new FormControl(this.today, { nonNullable: true });
  readonly stories = signal<StoryResponse[]>([]);
  readonly quote = signal<QuoteResponse | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  constructor() {
    this.loadStories();
  }

  loadStories(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    if (!this.dateControl.value) {
      this.dateControl.setValue(this.today);
    }

    this.loadQuote();

    this.storyService.findAll(this.searchControl.value, this.dateControl.value).subscribe({
      next: (stories) => this.stories.set(stories),
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error, 'Could not load stories'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  showToday(): void {
    this.dateControl.setValue(this.today);
    this.loadStories();
  }

  selectedDateLabel(): string {
    return this.dateControl.value === this.today ? 'Today' : this.dateControl.value;
  }

  preview(content: string): string {
    return content.length > 180 ? `${content.slice(0, 180)}...` : content;
  }

  private loadQuote(): void {
    if (!this.dateControl.value) {
      this.quote.set(null);
      return;
    }

    this.quoteService.today(this.dateControl.value).subscribe({
      next: (quote) => this.quote.set(quote),
      error: () => this.quote.set(null)
    });
  }
}

function todayIsoDate(): string {
  const date = new Date();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
