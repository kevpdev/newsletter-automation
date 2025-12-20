import type { AISummary } from '../types.js';

/**
 * Parses and validates AI response JSON against AISummary schema.
 *
 * Validation rules:
 * - All fields (title, impact, keyPoints, action) required
 * - title: string, max 50 characters, non-empty
 * - impact: string, non-empty
 * - keyPoints: exactly 3 non-empty strings
 * - action: string, non-empty
 *
 * @param responseText - Raw JSON string from OpenRouter API
 * @returns Valid AISummary object
 * @throws Error if JSON invalid, missing fields, or validation fails
 *
 * @example
 * const json = '{"title":"Test","impact":"...","keyPoints":["A","B","C"],"action":"..."}';
 * const summary = parseAIResponse(json);
 */
export function parseAIResponse(responseText: string): AISummary {
  // Step 1: Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Step 2: Validate structure and types
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Response must be a JSON object');
  }

  const data = parsed as Record<string, unknown>;

  // Step 3: Validate required fields exist
  const requiredFields = ['title', 'impact', 'keyPoints', 'action'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Step 4: Validate and extract title
  if (typeof data.title !== 'string') {
    throw new Error('Field "title" must be a string');
  }
  if (data.title.length === 0) {
    throw new Error('Field "title" cannot be empty');
  }
  if (data.title.length > 50) {
    throw new Error(`Field "title" exceeds maximum length of 50 characters (got ${data.title.length})`);
  }

  // Step 5: Validate and extract impact
  if (typeof data.impact !== 'string') {
    throw new Error('Field "impact" must be a string');
  }
  if (data.impact.length === 0) {
    throw new Error('Field "impact" cannot be empty');
  }

  // Step 6: Validate and extract keyPoints
  if (!Array.isArray(data.keyPoints)) {
    throw new Error('Field "keyPoints" must be an array');
  }
  if (data.keyPoints.length !== 3) {
    throw new Error(
      `Field "keyPoints" must have exactly 3 items (got ${data.keyPoints.length})`
    );
  }
  for (let i = 0; i < data.keyPoints.length; i++) {
    if (typeof data.keyPoints[i] !== 'string') {
      throw new Error(`Field "keyPoints[${i}]" must be a string`);
    }
    if ((data.keyPoints[i] as string).length === 0) {
      throw new Error(`Field "keyPoints[${i}]" cannot be empty`);
    }
  }

  // Step 7: Validate and extract action
  if (typeof data.action !== 'string') {
    throw new Error('Field "action" must be a string');
  }
  if (data.action.length === 0) {
    throw new Error('Field "action" cannot be empty');
  }

  // Step 8: Return valid AISummary
  return {
    title: data.title,
    impact: data.impact,
    keyPoints: data.keyPoints as string[],
    action: data.action,
  };
}
