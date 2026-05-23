import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { apiErrorMessage } from '../../core/error/api-error';
import { StoryResponse } from '../../core/story/story.models';
import { StoryService } from '../../core/story/story.service';

@Component({
  selector: 'app-story-detail-page',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    @if (errorMessage()) {
      <p class="error">{{ errorMessage() }}</p>
    }

    @if (loading()) {
      <p class="muted">Loading story...</p>
    } @else if (story()) {
      <article class="detail">
        <header class="detail-header">
          <div>
            <p class="eyebrow">Story</p>
            <h1>{{ story()?.title }}</h1>
            <p class="meta">
              {{ story()?.author?.username }} - prompt {{ story()?.promptDate | date: 'mediumDate' }}
            </p>
          </div>

          @if (canEdit()) {
            <div class="row-actions">
              <a [routerLink]="['/stories', story()?.id, 'edit']">Edit</a>
              <button type="button" (click)="deleteStory()">Delete</button>
            </div>
          }
        </header>

        <blockquote>{{ story()?.quote?.text }}</blockquote>
        <p class="story-content">{{ story()?.content }}</p>
      </article>
    }
  `,
  styleUrl: './story-page.css'
})
export class StoryDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storyService = inject(StoryService);
  private readonly authService = inject(AuthService);

  readonly story = signal<StoryResponse | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly canEdit = computed(() => this.story()?.author.username === this.authService.currentUser()?.username);

  constructor() {
    this.loadStory();
  }

  deleteStory(): void {
    const currentStory = this.story();
    if (!currentStory) {
      return;
    }

    this.storyService.delete(currentStory.id).subscribe({
      next: () => {
        void this.router.navigateByUrl('/my-stories');
      },
      error: (error: unknown) => this.errorMessage.set(apiErrorMessage(error, 'Could not delete story'))
    });
  }

  private loadStory(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.errorMessage.set('');

    this.storyService.findById(id).subscribe({
      next: (story) => this.story.set(story),
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error, 'Could not load story'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }
}
