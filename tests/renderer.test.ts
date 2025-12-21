import { describe, it, expect } from 'vitest';
import { renderDigest } from '../src/renderer.js';
import type { Digest } from '../src/aggregator.js';
import type { ScoredArticle } from '../src/ai/scoring.js';
import type { DomainConfig } from '../src/types.js';

const javaDomain: DomainConfig = {
  label: 'Java',
  color: '#FF6B6B',
  outputLabel: 'Output/Java',
  feedlyCollectionId: 'test',
};

const createMockArticle = (id: string, score: number, title: string): ScoredArticle => ({
  id,
  title,
  summary: 'Test summary',
  url: `https://example.com/${id}`,
  publishedAt: new Date(),
  source: 'example.com',
  score,
  reason: `Reason for ${title}`,
});

describe('renderDigest', () => {
  const validDigest: Digest = {
    critical: [
      createMockArticle('1', 9, 'Critical Update'),
      createMockArticle('2', 8, 'Breaking Change'),
    ],
    important: [createMockArticle('3', 7, 'Important Release')],
    bonus: [createMockArticle('4', 5, 'Nice to Know')],
    total: 4,
  };

  describe('HTML structure', () => {
    it('should generate valid HTML document', () => {
      const html = renderDigest(validDigest, javaDomain);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="fr">');
      expect(html).toContain('</html>');
      expect(html).toContain('<head>');
      expect(html).toContain('<body');
      expect(html).toContain('</body>');
    });

    it('should include meta charset UTF-8', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('<meta charset="UTF-8">');
    });

    it('should include viewport meta tag', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('<meta name="viewport"');
    });

    it('should set page title from domain label', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('<title>Java Tech Digest</title>');
    });
  });

  describe('Domain header', () => {
    it('should display domain label', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('Java Tech Digest');
    });

    it('should use correct domain color for border', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('border-left: 8px solid #FF6B6B');
    });

    it('should display total articles count', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('4 articles scored and curated');
    });
  });

  describe('Critical section', () => {
    it('should display Critical heading with emoji', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('🔥 Critical Updates (Must Read)');
    });

    it('should render all critical articles', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('Critical Update');
      expect(html).toContain('Breaking Change');
    });

    it('should display score in [9/10] format', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('[9/10]');
      expect(html).toContain('[8/10]');
    });

    it('should include article title as link', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('href="https://example.com/1"');
      expect(html).toContain('Critical Update');
      expect(html).toContain('</a>');
    });

    it('should display reason text', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('Reason for Critical Update');
    });

    it('should display source', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('Source: example.com');
    });
  });

  describe('Important section', () => {
    it('should display Important heading with emoji', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('📌 Important Updates');
    });

    it('should render important articles', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('Important Release');
      expect(html).toContain('[7/10]');
    });
  });

  describe('Bonus section', () => {
    it('should display Bonus heading with emoji', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('💡 Bonus Reads');
    });

    it('should render bonus articles', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('Nice to Know');
      expect(html).toContain('[5/10]');
    });
  });

  describe('Empty sections', () => {
    it('should not render section if empty', () => {
      const emptyDigest: Digest = {
        critical: [],
        important: [createMockArticle('1', 7, 'Test')],
        bonus: [],
        total: 1,
      };

      const html = renderDigest(emptyDigest, javaDomain);

      expect(html).not.toContain('🔥 Critical Updates');
      expect(html).toContain('📌 Important Updates');
      expect(html).not.toContain('💡 Bonus Reads');
    });
  });

  describe('Empty digest', () => {
    it('should render empty state when no articles', () => {
      const emptyDigest: Digest = {
        critical: [],
        important: [],
        bonus: [],
        total: 0,
      };

      const html = renderDigest(emptyDigest, javaDomain);

      expect(html).toContain('No articles this week');
      expect(html).toContain('Check back next week for updates!');
    });
  });

  describe('HTML escaping', () => {
    it('should escape HTML in article titles', () => {
      const digest: Digest = {
        critical: [
          createMockArticle('1', 9, '<script>alert("XSS")</script>'),
        ],
        important: [],
        bonus: [],
        total: 1,
      };

      const html = renderDigest(digest, javaDomain);

      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should escape HTML in reasons', () => {
      const article = createMockArticle('1', 9, 'Test');
      article.reason = '<img src=x onerror=alert(1)>';

      const digest: Digest = {
        critical: [article],
        important: [],
        bonus: [],
        total: 1,
      };

      const html = renderDigest(digest, javaDomain);

      expect(html).not.toContain('<img');
      expect(html).toContain('&lt;img');
    });

    it('should escape HTML in URLs', () => {
      const article = createMockArticle('1', 9, 'Test');
      article.url = 'https://example.com/" onclick="alert(1)';

      const digest: Digest = {
        critical: [article],
        important: [],
        bonus: [],
        total: 1,
      };

      const html = renderDigest(digest, javaDomain);

      expect(html).toContain('&quot;');
    });
  });

  describe('Footer', () => {
    it('should include footer text with Feedly + Haiku', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('Powered by Feedly + Claude 3.5 Haiku');
    });

    it('should have footer styling', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('border-top: 1px solid #ddd');
    });
  });

  describe('Styling', () => {
    it('should use inline styles (no external CSS)', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).not.toContain('<link rel="stylesheet"');
      expect(html).not.toContain('<style>');
      expect(html).toContain('style="');
    });

    it('should use correct accent colors', () => {
      const html = renderDigest(validDigest, javaDomain);
      expect(html).toContain('#FF6B6B'); // Critical - red
      expect(html).toContain('#3A86FF'); // Important - blue
      expect(html).toContain('#06D6A0'); // Bonus - green
    });
  });
});
