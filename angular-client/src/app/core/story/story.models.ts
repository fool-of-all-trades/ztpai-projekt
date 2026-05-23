import { QuoteResponse } from '../quote/quote.models';
import { UserResponse } from '../auth/auth.models';

export interface StoryResponse {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  promptDate: string;
  author: UserResponse;
  quote: QuoteResponse;
}

export interface StoryCreateRequest {
  title: string;
  content: string;
}

export type StoryUpdateRequest = StoryCreateRequest;
