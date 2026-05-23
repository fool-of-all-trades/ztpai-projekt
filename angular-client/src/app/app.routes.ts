import { Routes } from '@angular/router';

import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { LoginPageComponent } from './features/auth/login-page.component';
import { MyStoriesPageComponent } from './features/stories/my-stories-page.component';
import { RegisterPageComponent } from './features/auth/register-page.component';
import { StoryDetailPageComponent } from './features/stories/story-detail-page.component';
import { StoryFormPageComponent } from './features/stories/story-form-page.component';
import { StoriesPageComponent } from './features/stories/stories-page.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardPageComponent,
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardPageComponent
  },
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: 'register',
    component: RegisterPageComponent
  },
  {
    path: 'stories',
    component: StoriesPageComponent
  },
  {
    path: 'stories/new',
    component: StoryFormPageComponent
  },
  {
    path: 'stories/:id/edit',
    component: StoryFormPageComponent
  },
  {
    path: 'stories/:id',
    component: StoryDetailPageComponent
  },
  {
    path: 'my-stories',
    component: MyStoriesPageComponent
  },
  {
    path: '**',
    redirectTo: 'stories'
  }
];
