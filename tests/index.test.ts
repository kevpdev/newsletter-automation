import { describe, it, expect } from 'vitest';
import { greet } from '../src/index.js';

describe('greet', () => {
  it('should return a greeting message', () => {
    const result = greet('World');
    expect(result).toBe('Hello, World!');
  });

  it('should handle different names', () => {
    const result = greet('Newsletter Automation');
    expect(result).toBe('Hello, Newsletter Automation!');
  });
});
