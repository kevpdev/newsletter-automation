import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../../src/ai/prompt.js';
import type { EmailMetadata } from '../../src/types.js';

describe('buildPrompt', () => {
  it('should include system message with JSON requirements', () => {
    const metadata: EmailMetadata = {
      sender: 'test@example.com',
      subject: 'Test Subject',
      htmlContent: '<p>Test content</p>',
      domain: 'java',
    };

    const prompt = buildPrompt(metadata);

    expect(prompt).toContain('technical newsletter summarizer');
    expect(prompt).toContain('ADHD');
    expect(prompt).toContain('Output ONLY valid JSON');
    expect(prompt).toContain('no markdown code blocks');
    expect(prompt).toContain('"title"');
    expect(prompt).toContain('"impact"');
    expect(prompt).toContain('"keyPoints"');
    expect(prompt).toContain('"action"');
  });

  it('should specify title constraint of 50 characters', () => {
    const metadata: EmailMetadata = {
      sender: 'test@example.com',
      subject: 'Test',
      htmlContent: 'Content',
      domain: 'angular',
    };

    const prompt = buildPrompt(metadata);

    expect(prompt).toContain('Maximum 50 characters');
    expect(prompt).toContain('title');
  });

  it('should specify exactly 3 keyPoints requirement', () => {
    const metadata: EmailMetadata = {
      sender: 'test@example.com',
      subject: 'Test',
      htmlContent: 'Content',
      domain: 'devops',
    };

    const prompt = buildPrompt(metadata);

    expect(prompt).toContain('Exactly 3');
    expect(prompt).toContain('keyPoints');
  });

  it('should include metadata sender in user message', () => {
    const metadata: EmailMetadata = {
      sender: 'newsletter@techweek.com',
      subject: 'Weekly Update',
      htmlContent: '<p>Update content</p>',
      domain: 'ai',
    };

    const prompt = buildPrompt(metadata);

    expect(prompt).toContain('From: newsletter@techweek.com');
  });

  it('should include metadata subject in user message', () => {
    const metadata: EmailMetadata = {
      sender: 'info@example.com',
      subject: 'Spring Boot 3.2 Released',
      htmlContent: '<p>Spring Boot news</p>',
      domain: 'java',
    };

    const prompt = buildPrompt(metadata);

    expect(prompt).toContain('Subject: Spring Boot 3.2 Released');
  });

  it('should include metadata domain in user message', () => {
    const metadata: EmailMetadata = {
      sender: 'test@example.com',
      subject: 'Test',
      htmlContent: 'Content',
      domain: 'architecture',
    };

    const prompt = buildPrompt(metadata);

    expect(prompt).toContain('Domain: architecture');
  });

  it('should include HTML content in user message', () => {
    const metadata: EmailMetadata = {
      sender: 'test@example.com',
      subject: 'Test',
      htmlContent: '<h1>Important News</h1><p>Details about the announcement</p>',
      domain: 'security',
    };

    const prompt = buildPrompt(metadata);

    expect(prompt).toContain('<h1>Important News</h1>');
    expect(prompt).toContain('<p>Details about the announcement</p>');
  });

  it('should separate system and user messages', () => {
    const metadata: EmailMetadata = {
      sender: 'test@example.com',
      subject: 'Test',
      htmlContent: 'Content',
      domain: 'frontend',
    };

    const prompt = buildPrompt(metadata);

    expect(prompt).toContain('Summarize this newsletter:');
    const systemEndIndex = prompt.indexOf('Summarize this newsletter:');
    expect(systemEndIndex).toBeGreaterThan(0);
  });

  it('should emphasize action must start with verb', () => {
    const metadata: EmailMetadata = {
      sender: 'test@example.com',
      subject: 'Test',
      htmlContent: 'Content',
      domain: 'vue',
    };

    const prompt = buildPrompt(metadata);

    expect(prompt).toContain('start with a verb');
    expect(prompt).toContain('action');
  });

  it('should handle special characters in metadata', () => {
    const metadata: EmailMetadata = {
      sender: 'test@example.com',
      subject: 'Test: "Quotes" & <Tags>',
      htmlContent: '<p>Content with "quotes" and <tags></p>',
      domain: 'java',
    };

    const prompt = buildPrompt(metadata);

    expect(prompt).toContain('Test: "Quotes" & <Tags>');
    expect(prompt).toContain('<p>Content with "quotes" and <tags></p>');
  });

  it('should return non-empty prompt for valid metadata', () => {
    const metadata: EmailMetadata = {
      sender: 'test@example.com',
      subject: 'Test',
      htmlContent: 'Content',
      domain: 'java',
    };

    const prompt = buildPrompt(metadata);

    expect(prompt).toBeTruthy();
    expect(prompt.length).toBeGreaterThan(100);
  });
});
