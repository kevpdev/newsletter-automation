import { describe, it, expect } from 'vitest';
import { parseAIResponse } from '../../src/ai/parser.js';
import type { AISummary } from '../../src/types.js';

describe('parseAIResponse', () => {
  const validJson = JSON.stringify({
    title: 'Test Title',
    impact: 'This is important for the business.',
    keyPoints: ['First point', 'Second point', 'Third point'],
    action: 'Review the documentation',
  });

  describe('Valid responses', () => {
    it('should parse valid JSON response', () => {
      const result = parseAIResponse(validJson);

      expect(result).toEqual({
        title: 'Test Title',
        impact: 'This is important for the business.',
        keyPoints: ['First point', 'Second point', 'Third point'],
        action: 'Review the documentation',
      });
    });

    it('should parse response with maximum length title (50 chars)', () => {
      const fiftyCharTitle = 'a'.repeat(50);
      const json = JSON.stringify({
        title: fiftyCharTitle,
        impact: 'Impact text',
        keyPoints: ['A', 'B', 'C'],
        action: 'Action text',
      });

      const result = parseAIResponse(json);
      expect(result.title).toBe(fiftyCharTitle);
      expect(result.title.length).toBe(50);
    });

    it('should parse response with short title', () => {
      const json = JSON.stringify({
        title: 'A',
        impact: 'Impact text',
        keyPoints: ['A', 'B', 'C'],
        action: 'Action text',
      });

      const result = parseAIResponse(json);
      expect(result.title).toBe('A');
    });

    it('should parse response with special characters in fields', () => {
      const json = JSON.stringify({
        title: 'Test: "Quoted" & <special>',
        impact: 'Impact with "quotes" and <tags>',
        keyPoints: ["Point with 'apostrophe'", 'Point with "quotes"', 'Point with `backticks`'],
        action: 'Action: do something & fix it',
      });

      const result = parseAIResponse(json);
      expect(result.title).toContain('Quoted');
      expect(result.impact).toContain('tags');
      expect(result.keyPoints[0]).toContain('apostrophe');
    });

    it('should parse response with newlines in text fields', () => {
      const json = JSON.stringify({
        title: 'Title with\nnewline',
        impact: 'Impact with\nmultiple\nlines',
        keyPoints: ['Point A', 'Point B', 'Point C'],
        action: 'Action\nwith\nnewlines',
      });

      const result = parseAIResponse(json);
      expect(result.title).toContain('\n');
      expect(result.impact).toContain('\n');
    });

    it('should return object with correct type', () => {
      const result = parseAIResponse(validJson);
      expect(result).toMatchObject<AISummary>({
        title: expect.any(String),
        impact: expect.any(String),
        keyPoints: expect.any(Array),
        action: expect.any(String),
      });
    });
  });

  describe('Invalid JSON', () => {
    it('should throw error for malformed JSON', () => {
      const invalidJson = '{invalid json}';
      expect(() => parseAIResponse(invalidJson)).toThrow('Invalid JSON');
    });

    it('should throw error for JSON array instead of object', () => {
      const json = '["not", "an", "object"]';
      expect(() => parseAIResponse(json)).toThrow('Response must be a JSON object');
    });

    it('should throw error for JSON null', () => {
      const json = 'null';
      expect(() => parseAIResponse(json)).toThrow('Response must be a JSON object');
    });

    it('should throw error for JSON primitive', () => {
      const json = '"just a string"';
      expect(() => parseAIResponse(json)).toThrow('Response must be a JSON object');
    });
  });

  describe('Missing required fields', () => {
    it('should throw error when title is missing', () => {
      const json = JSON.stringify({
        impact: 'Impact',
        keyPoints: ['A', 'B', 'C'],
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('Missing required field: title');
    });

    it('should throw error when impact is missing', () => {
      const json = JSON.stringify({
        title: 'Title',
        keyPoints: ['A', 'B', 'C'],
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('Missing required field: impact');
    });

    it('should throw error when keyPoints is missing', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('Missing required field: keyPoints');
    });

    it('should throw error when action is missing', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        keyPoints: ['A', 'B', 'C'],
      });
      expect(() => parseAIResponse(json)).toThrow('Missing required field: action');
    });
  });

  describe('Title validation', () => {
    it('should throw error when title is not a string', () => {
      const json = JSON.stringify({
        title: 123,
        impact: 'Impact',
        keyPoints: ['A', 'B', 'C'],
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('Field "title" must be a string');
    });

    it('should throw error when title is empty', () => {
      const json = JSON.stringify({
        title: '',
        impact: 'Impact',
        keyPoints: ['A', 'B', 'C'],
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('Field "title" cannot be empty');
    });

    it('should throw error when title exceeds 50 characters', () => {
      const fiftyOneCharTitle = 'a'.repeat(51);
      const json = JSON.stringify({
        title: fiftyOneCharTitle,
        impact: 'Impact',
        keyPoints: ['A', 'B', 'C'],
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('exceeds maximum length of 50 characters');
    });

    it('should throw error when title is null', () => {
      const json = JSON.stringify({
        title: null,
        impact: 'Impact',
        keyPoints: ['A', 'B', 'C'],
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('Field "title" must be a string');
    });
  });

  describe('Impact validation', () => {
    it('should throw error when impact is not a string', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: { nested: 'object' },
        keyPoints: ['A', 'B', 'C'],
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('Field "impact" must be a string');
    });

    it('should throw error when impact is empty', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: '',
        keyPoints: ['A', 'B', 'C'],
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('Field "impact" cannot be empty');
    });

    it('should accept long impact text', () => {
      const longImpact = 'a'.repeat(1000);
      const json = JSON.stringify({
        title: 'Title',
        impact: longImpact,
        keyPoints: ['A', 'B', 'C'],
        action: 'Action',
      });
      const result = parseAIResponse(json);
      expect(result.impact.length).toBe(1000);
    });
  });

  describe('KeyPoints validation', () => {
    it('should throw error when keyPoints is not an array', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        keyPoints: 'not an array',
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('Field "keyPoints" must be an array');
    });

    it('should throw error when keyPoints has fewer than 3 items', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        keyPoints: ['A', 'B'],
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('must have exactly 3 items (got 2)');
    });

    it('should throw error when keyPoints has more than 3 items', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        keyPoints: ['A', 'B', 'C', 'D'],
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('must have exactly 3 items (got 4)');
    });

    it('should throw error when keyPoints contains non-string', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        keyPoints: ['A', 123, 'C'],
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('Field "keyPoints[1]" must be a string');
    });

    it('should throw error when any keyPoint is empty', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        keyPoints: ['A', '', 'C'],
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('Field "keyPoints[1]" cannot be empty');
    });

    it('should throw error when keyPoints is empty array', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        keyPoints: [],
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('must have exactly 3 items (got 0)');
    });

    it('should throw error when keyPoints contains null', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        keyPoints: ['A', null, 'C'],
        action: 'Action',
      });
      expect(() => parseAIResponse(json)).toThrow('Field "keyPoints[1]" must be a string');
    });
  });

  describe('Action validation', () => {
    it('should throw error when action is not a string', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        keyPoints: ['A', 'B', 'C'],
        action: 42,
      });
      expect(() => parseAIResponse(json)).toThrow('Field "action" must be a string');
    });

    it('should throw error when action is empty', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        keyPoints: ['A', 'B', 'C'],
        action: '',
      });
      expect(() => parseAIResponse(json)).toThrow('Field "action" cannot be empty');
    });

    it('should accept action starting with verb', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        keyPoints: ['A', 'B', 'C'],
        action: 'Review the documentation immediately',
      });
      const result = parseAIResponse(json);
      expect(result.action).toBe('Review the documentation immediately');
    });

    it('should accept action not starting with verb', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        keyPoints: ['A', 'B', 'C'],
        action: 'Check out the new feature',
      });
      const result = parseAIResponse(json);
      expect(result.action).toBe('Check out the new feature');
    });
  });

  describe('Extra fields in response', () => {
    it('should ignore extra fields in response', () => {
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        keyPoints: ['A', 'B', 'C'],
        action: 'Action',
        extraField: 'should be ignored',
        nested: { object: 'also ignored' },
      });
      const result = parseAIResponse(json);
      expect(result).toEqual({
        title: 'Title',
        impact: 'Impact',
        keyPoints: ['A', 'B', 'C'],
        action: 'Action',
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle unicode characters in fields', () => {
      const json = JSON.stringify({
        title: 'Java™ & Kotlin 🚀',
        impact: 'Important pour les développeurs 🇫🇷',
        keyPoints: ['Point 1️⃣', 'Point 2️⃣', 'Point 3️⃣'],
        action: 'Vérifier la documentation 📚',
      });
      const result = parseAIResponse(json);
      expect(result.title).toContain('™');
      expect(result.impact).toContain('🇫🇷');
      expect(result.keyPoints[0]).toContain('1️⃣');
    });

    it('should handle escaped characters in JSON', () => {
      const json =
        '{"title":"Test\\"Title","impact":"Impact\\nwith\\nnewlines","keyPoints":["A","B","C"],"action":"Action\\ttab"}';
      const result = parseAIResponse(json);
      expect(result.title).toContain('"');
      expect(result.impact).toContain('\n');
    });

    it('should handle very long strings in keyPoints', () => {
      const longString = 'a'.repeat(500);
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        keyPoints: [longString, longString, longString],
        action: 'Action',
      });
      const result = parseAIResponse(json);
      expect(result.keyPoints[0].length).toBe(500);
    });

    it('should parse response with whitespace-only fields (not allowed)', () => {
      // Whitespace-only strings are technically non-empty strings, so they should parse
      // but business logic may reject them later
      const json = JSON.stringify({
        title: 'Title',
        impact: 'Impact',
        keyPoints: ['   ', 'B', 'C'],
        action: 'Action',
      });
      const result = parseAIResponse(json);
      expect(result.keyPoints[0]).toBe('   ');
    });
  });
});
