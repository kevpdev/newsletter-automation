# PHASE-5: HTML Digest Renderer

**Status**: ✅ Completed
**Effort**: 1h30 actual
**Dependencies**: PHASE-4 (aggregation)

---

## Overview

Generate ADHD-friendly HTML emails with score-based sections, emoji markers, and domain-specific colors.

---

## Acceptance Criteria

- [x] Create `renderDigest(digest, domain)` function
- [x] Complete HTML document (DOCTYPE, head, body)
- [x] Domain header with color border (8px solid, 20% opacity background)
- [x] Three sections: Critical (🔥 red), Important (📌 blue), Bonus (💡 green)
- [x] Article format: `[9/10] Title` with link, reason, source
- [x] Empty section handling (don't render if no articles)
- [x] Empty state: "No articles this week" message
- [x] XSS protection: Escape HTML in title, reason, URL
- [x] Preserve anchor tags while escaping content
- [x] Footer: "Powered by Feedly + Claude 3.5 Haiku"
- [x] Inline styles only (no external CSS)
- [x] Unit tests: structure, sections, escaping, colors, empty state

---

## Technical Details

### HTML Structure

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Java Tech Digest</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">

  <!-- Domain Header -->
  <div style="background-color: rgba(255, 107, 107, 0.2); border-left: 8px solid #FF6B6B; padding: 20px; margin-bottom: 30px;">
    <h1>Java Tech Digest</h1>
    <p>4 articles scored and curated</p>
  </div>

  <!-- Critical Section -->
  <div style="margin-bottom: 30px;">
    <h2 style="color: #FF6B6B; border-left: 4px solid #FF6B6B; padding-left: 10px;">
      🔥 Critical Updates (Must Read)
    </h2>

    <div style="background: white; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
      <p style="font-weight: bold; color: #FF6B6B;">[9/10]</p>
      <h3><a href="https://spring.io/blog/release">Spring Boot 3.3 Released</a></h3>
      <p>Major observability improvements with Micrometer</p>
      <p style="color: #666; font-size: 0.9em;">Source: spring.io</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
    Powered by Feedly + Claude 3.5 Haiku
  </div>

</body>
</html>
```

### Section Colors

```typescript
Critical:  #FF6B6B (red)    - Breaking changes, security
Important: #3A86FF (blue)   - Framework updates
Bonus:     #06D6A0 (green)  - Tutorials, opinions
```

### XSS Protection

**Before HTML escaping**:
```typescript
const escapedTitle = convertMarkdownLinks(article.title);
const escapedReason = convertMarkdownLinks(article.reason);
```

**Markdown link conversion**:
```typescript
Input:  "Check [Spring Docs](https://spring.io) for details"
Output: "Check <a href=\"https://spring.io\">Spring Docs</a> for details"
```

**Then escape remaining HTML**:
```typescript
Input:  "<script>alert('XSS')</script>"
Output: "&lt;script&gt;alert('XSS')&lt;/script&gt;"
```

---

## Files Modified

**`src/renderer.ts`** (135 lines):
- Complete rewrite from Markdown → Digest format
- `renderDigest(digest, domain)` - Main function
- `renderSection(title, articles, color)` - Section renderer
- `escapeHtml(text)` - XSS protection
- `convertMarkdownLinks(text)` - Markdown link parser

---

## Testing

**`tests/renderer.test.ts`** (26 tests):

**HTML Structure**:
1. ✅ Generate valid HTML document
2. ✅ Include meta charset UTF-8
3. ✅ Include viewport meta tag
4. ✅ Set page title from domain label

**Domain Header**:
5. ✅ Display domain label
6. ✅ Use correct domain color for border
7. ✅ Display total articles count

**Critical Section**:
8. ✅ Display Critical heading with emoji
9. ✅ Render all critical articles
10. ✅ Display score in [9/10] format
11. ✅ Include article title as link
12. ✅ Display reason text
13. ✅ Display source

**Important Section**:
14. ✅ Display Important heading with emoji
15. ✅ Render important articles

**Bonus Section**:
16. ✅ Display Bonus heading with emoji
17. ✅ Render bonus articles

**Empty Sections**:
18. ✅ Not render section if empty

**Empty Digest**:
19. ✅ Render empty state when no articles

**HTML Escaping**:
20. ✅ Escape HTML in article titles
21. ✅ Escape HTML in reasons
22. ✅ Escape HTML in URLs

**Footer**:
23. ✅ Include footer text with Feedly + Haiku
24. ✅ Have footer styling

**Styling**:
25. ✅ Use inline styles (no external CSS)
26. ✅ Use correct accent colors

---

## ADHD-Friendly Design

### Visual Hierarchy

1. **Color coding**: Red = urgent, Blue = important, Green = optional
2. **Emoji markers**: 🔥 🔥 💡 for instant section recognition
3. **Score badges**: [9/10] format for priority scanning
4. **Whitespace**: Clear separation between articles
5. **Bold scores**: Red-colored, bold font for critical

### Layout Principles

- **Max-width 800px**: Narrow column for easier reading
- **Background contrast**: White cards on light gray (#f5f5f5)
- **Border accents**: Color-coded left borders for section headers
- **Rounded corners**: Softer, less harsh visual
- **Generous padding**: 20px around content, 15px in cards

---

## Implementation Notes

1. **Inline styles**: Gmail-compatible (no external CSS support)
2. **Link conversion**: Markdown links preserved before HTML escaping
3. **Empty state**: Shows when `total === 0` (all tiers empty)
4. **Section conditional**: Sections only render if tier has articles
5. **Security-first**: All user content escaped (titles, reasons, URLs)

---

## Security Validation

**XSS Test Cases**:
```typescript
Title: "<script>alert('XSS')</script>"
  → Output: "&lt;script&gt;alert('XSS')&lt;/script&gt;"

URL: "https://example.com/\" onclick=\"alert(1)"
  → Output: "https://example.com/&quot; onclick=&quot;alert(1)"

Reason: "<img src=x onerror=alert(1)>"
  → Output: "&lt;img src=x onerror=alert(1)&gt;"
```

All 3 XSS tests pass in unit tests.

---

## Related Files

- Uses: `src/aggregator.ts` (Digest interface)
- Uses: `src/types.ts` (DomainConfig)
- Used by: `src/index.ts` (orchestration)
- Tests: `tests/renderer.test.ts`
