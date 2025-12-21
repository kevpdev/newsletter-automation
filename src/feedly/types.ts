export interface FeedlyArticle {
  id: string;
  title: string;
  summary?: { content: string };
  originId: string;
  published: number;
  alternate?: Array<{ href: string }>;
}

export interface FeedlyResponse {
  items: FeedlyArticle[];
  continuation?: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: Date;
  source?: string;
}
