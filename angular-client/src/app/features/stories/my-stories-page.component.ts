import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { apiErrorMessage } from '../../core/error/api-error';
import { StoryResponse } from '../../core/story/story.models';
import { StoryService } from '../../core/story/story.service';

@Component({
  selector: 'app-my-stories-page',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Workspace</p>
        <h1>My Stories</h1>
      </div>
      <a class="primary-action" routerLink="/stories/new">New Story</a>
    </section>

    @if (errorMessage()) {
      <p class="error">{{ errorMessage() }}</p>
    }

    @if (loading()) {
      <p class="muted">Loading your stories...</p>
    } @else {
      <section class="story-list">
        @for (story of stories(); track story.id) {
          <article class="story-row">
            <div>
              <p class="meta">Prompt {{ story.promptDate | date: 'mediumDate' }} - updated {{ story.updatedAt | date: 'medium' }}</p>
              <h2><a [routerLink]="['/stories', story.id]">{{ story.title }}</a></h2>
              <p>{{ preview(story.content) }}</p>
            </div>
            <div class="row-actions">
              <a [routerLink]="['/stories', story.id, 'edit']">Edit</a>
              <button type="button" (click)="deleteStory(story)">Delete</button>
            </div>
          </article>
        } @empty {
          <p class="muted">You have not written any stories yet.</p>
        }
      </section>
    }
  `,
  styleUrl: './story-page.css'
})
export class MyStoriesPageComponent {
  private readonly storyService = inject(StoryService);

  readonly stories = signal<StoryResponse[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  constructor() {
    this.loadStories();
  }

  loadStories(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.storyService.findMine().subscribe({
      next: (stories) => this.stories.set(stories),
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error, 'Could not load your stories'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  deleteStory(story: StoryResponse): void {
    this.storyService.delete(story.id).subscribe({
      next: () => this.stories.update((stories) => stories.filter((item) => item.id !== story.id)),
      error: (error: unknown) => this.errorMessage.set(apiErrorMessage(error, 'Could not delete story'))
    });
  }

  preview(content: string): string {
    return content.length > 140 ? `${content.slice(0, 140)}...` : content;
  }
}
