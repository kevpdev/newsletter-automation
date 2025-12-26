export interface FreshRSSItem {
  id: string;
  title: string;
  summary?: { content: string };
  canonical?: Array<{ href: string }>;
  alternate?: Array<{ href: string }>;
  published: number;
  origin?: { title: string };
}

export interface FreshRSSResponse {
  items: FreshRSSItem[];
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
