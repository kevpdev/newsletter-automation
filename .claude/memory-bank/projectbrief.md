# Newsletter Automation System

## What
Automated newsletter processing system that fetches emails from Gmail Input/* labels, summarizes them with AI (Llama 3.3 via OpenRouter), and sends ADHD-friendly structured summaries to Output/* labels. Runs weekly via GitHub Actions.

## For whom
Personal use - processing technical newsletters (Java, Angular, DevOps, AI, Architecture, Security, Frontend, Vue) into digestible, actionable summaries.

## Key features
- **1-to-1 processing**: Each input email generates one structured output email (no aggregation)
- **AI-structured summaries**: Title + Impact + 3 Key Points + Concrete Action (parsed from JSON)
- **Domain-specific styling**: Color-coded HTML by topic (Java #FF6B6B, Angular #DD0031, etc.)
- **Auto-labeling**: Marks processed emails with "Processed" label, sends to Output/* labels
- **ADHD-friendly format**: Clear sections, emoji markers, action-oriented layout

## Constraints
- Gmail API OAuth2 authentication (scopes: readonly + modify)
- OpenRouter API (free tier: meta-llama/llama-3.3-70b-instruct-free)
- GitHub Actions cron: Mondays 08:00 UTC
- No personal data sent to AI (content cleaned before prompting)
- Graceful error handling (continue on individual email failures)

## Success criteria
- Batch processes 5+ emails per domain per week without failures
- AI responses parse successfully 95%+ of the time
- Output emails are readable and actionable within 30 seconds
- Zero manual intervention required for weekly runs
