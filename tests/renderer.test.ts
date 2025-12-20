import { describe, it, expect } from 'vitest';
import { renderHTML } from '../src/renderer.js';
import type { AISummary } from '../src/types.js';
import { javaConfig, angularConfig, aiConfig } from '../src/config.js';

describe('renderHTML', () => {
  const validSummary: AISummary = {
    title: 'Java 21 Virtual Threads Released',
    impact: 'Simplifies concurrent programming and improves performance.',
    keyPoints: [
      'Lightweight threads that scale to millions',
      'No need for async/await complexity',
      'Better resource utilization',
    ],
    action: 'Explore the migration guide and try virtual threads in your project',
  };

  describe('HTML structure', () => {
    it('should generate valid HTML document', () => {
      const html = renderHTML(validSummary, javaConfig);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('</html>');
      expect(html).toContain('<head>');
      expect(html).toContain('<body');
      expect(html).toContain('</body>');
    });

    it('should include meta charset UTF-8', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toContain('<meta charset="UTF-8">');
    });

    it('should include viewport meta tag', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toContain('<meta name="viewport"');
    });

    it('should set page title from summary title', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toContain('<title>Java 21 Virtual Threads Released</title>');
    });
  });

  describe('Domain header', () => {
    it('should display domain label', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toContain('Java Newsletter');
    });

    it('should use correct domain color for border', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toContain('border-left: 8px solid #FF6B6B');
    });

    it('should use 20% opacity background color', () => {
      const html = renderHTML(validSummary, javaConfig);
      // Java color #FF6B6B = rgb(255, 107, 107)
      expect(html).toContain('rgba(255, 107, 107, 0.2)');
    });

    it('should display correct label for different domains', () => {
      const angularHtml = renderHTML(validSummary, angularConfig);
      expect(angularHtml).toContain('Angular Newsletter');

      const aiHtml = renderHTML(validSummary, aiConfig);
      expect(aiHtml).toContain('AI Newsletter');
    });
  });

  describe('Title section', () => {
    it('should render title in h1 tag', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toMatch(/<h1[^>]*>\s*Java 21 Virtual Threads Released\s*<\/h1>/);
    });

    it('should include domain color in bottom border', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toMatch(/border-bottom: 4px solid #FF6B6B/);
    });

    it('should escape HTML in title', () => {
      const summaryWithHtml: AISummary = {
        ...validSummary,
        title: 'Test <script>alert("xss")</script> Title',
      };
      const html = renderHTML(summaryWithHtml, javaConfig);
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });

  describe('Impact section', () => {
    it('should display "Why This Matters" heading with emoji', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toContain('💡 Why This Matters');
    });

    it('should render impact text', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toContain('Simplifies concurrent programming and improves performance.');
    });

    it('should escape HTML in impact text', () => {
      const summaryWithHtml: AISummary = {
        ...validSummary,
        impact: 'Important <b>feature</b> & improvement',
      };
      const html = renderHTML(summaryWithHtml, javaConfig);
      expect(html).toContain('&lt;b&gt;');
      expect(html).toContain('&amp;');
    });
  });

  describe('Key Points section', () => {
    it('should display "Key Takeaways" heading with emoji', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toContain('📌 Key Takeaways');
    });

    it('should render all 3 key points in list', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toContain('Lightweight threads that scale to millions');
      expect(html).toContain('No need for async/await complexity');
      expect(html).toContain('Better resource utilization');
    });

    it('should render key points in ul/li tags', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toMatch(/<ul[^>]*>/);
      expect(html).toMatch(/<li[^>]*>.*<\/li>/);
      // Count li tags (should be exactly 3)
      const liMatches = html.match(/<li[^>]*>/g);
      expect(liMatches).toHaveLength(3);
    });

    it('should escape HTML in key points', () => {
      const summaryWithHtml: AISummary = {
        ...validSummary,
        keyPoints: [
          'Point with <em>emphasis</em>',
          'Point with "quotes"',
          "Point with 'apostrophes'",
        ],
      };
      const html = renderHTML(summaryWithHtml, javaConfig);
      expect(html).toContain('&lt;em&gt;');
      expect(html).toContain('&quot;');
      expect(html).toContain('&#39;');
    });
  });

  describe('Action section', () => {
    it('should display "Next Step" heading with emoji', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toContain('🎯 Next Step');
    });

    it('should render action text', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toContain('Explore the migration guide and try virtual threads in your project');
    });

    it('should have yellow background (#fffacd)', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toMatch(/background-color: #fffacd/);
    });

    it('should have red left border (#FF6B6B)', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toMatch(/border-left: 4px solid #FF6B6B/);
    });

    it('should escape HTML in action text', () => {
      const summaryWithHtml: AISummary = {
        ...validSummary,
        action: 'Check <a href="evil.com">this link</a>',
      };
      const html = renderHTML(summaryWithHtml, javaConfig);
      expect(html).not.toContain('<a href');
      expect(html).toContain('&lt;a href');
    });
  });

  describe('Inline styles', () => {
    it('should use inline styles (no external CSS)', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).not.toContain('<link rel="stylesheet"');
      expect(html).not.toContain('<style>');
      expect(html).toMatch(/style="/);
    });

    it('should include body styles', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toMatch(/<body[^>]*style="[^"]*font-family:/);
      expect(html).toMatch(/max-width: 800px/);
    });
  });

  describe('Domain color injection', () => {
    it('should use Java color (#FF6B6B) for Java domain', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toContain('#FF6B6B');
      expect(html).toContain('rgba(255, 107, 107, 0.2)');
    });

    it('should use Angular color (#DD0031) for Angular domain', () => {
      const html = renderHTML(validSummary, angularConfig);
      expect(html).toContain('#DD0031');
      // Angular color #DD0031 = rgb(221, 0, 49)
      expect(html).toContain('rgba(221, 0, 49, 0.2)');
    });

    it('should use AI color (#9D4EDD) for AI domain', () => {
      const html = renderHTML(validSummary, aiConfig);
      expect(html).toContain('#9D4EDD');
      // AI color #9D4EDD = rgb(157, 78, 221)
      expect(html).toContain('rgba(157, 78, 221, 0.2)');
    });
  });

  describe('Footer', () => {
    it('should include footer text', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toContain('Newsletter Summary');
      expect(html).toContain('Generated by AI');
    });

    it('should have footer styling', () => {
      const html = renderHTML(validSummary, javaConfig);
      expect(html).toMatch(/border-top: 1px solid #ddd/);
    });
  });

  describe('XSS protection', () => {
    it('should escape all HTML special characters', () => {
      const maliciousSummary: AISummary = {
        title: '<script>alert("xss")</script>',
        impact: 'Test & <b>bold</b> "quote" \'apostrophe\'',
        keyPoints: [
          '<img src=x onerror=alert(1)>',
          'Test > less < than',
          'Quote: "test" and \'test\'',
        ],
        action: '<a href="javascript:alert()">Click me</a>',
      };

      const html = renderHTML(maliciousSummary, javaConfig);

      // Check that actual HTML tags are not present (only in escaped form)
      expect(html).not.toMatch(/<script[^>]*>/);
      expect(html).not.toMatch(/<img[^>]*onerror=/);
      expect(html).not.toMatch(/href="javascript:/);

      // Check that dangerous content is properly escaped
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&amp;');
      expect(html).toContain('&quot;');
      expect(html).toContain('&#39;');
      expect(html).toContain('&lt;img');
      expect(html).toContain('&lt;a href');
    });
  });

  describe('Special characters handling', () => {
    it('should handle unicode characters', () => {
      const summaryWithUnicode: AISummary = {
        title: 'Java™ & Kotlin 🚀',
        impact: 'Important pour les développeurs 🇫🇷',
        keyPoints: ['Point 1️⃣', 'Point 2️⃣', 'Point 3️⃣'],
        action: 'Vérifier la documentation 📚',
      };

      const html = renderHTML(summaryWithUnicode, javaConfig);
      expect(html).toContain('™');
      expect(html).toContain('🚀');
      expect(html).toContain('🇫🇷');
      expect(html).toContain('1️⃣');
    });

    it('should handle newlines in text', () => {
      const summaryWithNewlines: AISummary = {
        title: 'Title with\nnewline',
        impact: 'Impact with\nmultiple\nlines',
        keyPoints: ['Point A', 'Point B', 'Point C'],
        action: 'Action\nwith\nnewlines',
      };

      const html = renderHTML(summaryWithNewlines, javaConfig);
      expect(html).toBeTruthy();
      // Newlines should be preserved in HTML
      expect(html).toContain('Title with\nnewline');
    });
  });

  describe('Edge cases', () => {
    it('should handle single character strings gracefully', () => {
      const summarywithShortText: AISummary = {
        title: 'X',
        impact: 'Y',
        keyPoints: ['Q', 'W', 'Z'],
        action: 'K',
      };

      const html = renderHTML(summarywithShortText, javaConfig);
      // Check title in h1
      expect(html).toMatch(/<h1[^>]*>\s*X\s*<\/h1>/);
      // Check impact in p
      expect(html).toMatch(/<p[^>]*>\s*Y\s*<\/p>/);
      // Check key points in li
      expect(html).toMatch(/<li[^>]*>\s*Q\s*<\/li>/);
      expect(html).toMatch(/<li[^>]*>\s*W\s*<\/li>/);
      expect(html).toMatch(/<li[^>]*>\s*Z\s*<\/li>/);
      // Check action in div
      expect(html).toMatch(/<p[^>]*>\s*K\s*<\/p>/);
    });

    it('should handle very long text', () => {
      const longText = 'a'.repeat(1000);
      const summaryWithLongText: AISummary = {
        title: longText.slice(0, 50),
        impact: longText,
        keyPoints: [longText, longText, longText],
        action: longText,
      };

      const html = renderHTML(summaryWithLongText, javaConfig);
      expect(html.length).toBeGreaterThan(3000);
      expect(html).toContain(longText);
    });
  });
});
