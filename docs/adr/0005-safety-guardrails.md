# ADR-0005: Safety guardrails

- Status: Accepted
- Date: 2026-10-28

## Context and problem statement

Hard rule: the app must never tell a user they are or are not eligible. A wrong deadline can cost someone their coverage. Letter text is untrusted input and may contain injected instructions.

## Decision outcome

Three layers:

1. **Prompt.** The system prompt (`src/prompts/letter-reader.ts`) forbids eligibility statements and states that letter text is data, never instructions.
2. **Schema.** The model can only return fields in `LetterExtraction`. There is no eligibility field to fill.
3. **Output filter.** Every user-facing string passes `findForbiddenClaims()` in `src/lib/guardrails.ts`. On a hit the summary is replaced with the safe fallback; a quote or action is left out and a paper becomes "check your letter", so the fallback is never shown as the letter's own words (changed 2026-11-21), and the event is counted (no content logged).

Every result screen shows who to call (US-054). Deadlines are computed in code from the extracted date. If the date is missing or ambiguous, the UI says so and shows the quoted text (US-021).

The guardrail suite (`npm run test:safety`) fails the build on any forbidden phrase across all fixtures and adversarial cases.

### Consequences

- Good: the rule is enforced by code and CI, not only by prompt wording.
- Bad: the phrase list over-blocks legitimate letter text, such as "send proof that you are exempt". Acceptable: the check fails closed, the blocked quote or action is hidden, and the screen says to check the letter or call. Two attempts to excuse "asked to prove" wording by pattern each let real claims through (2026-11-21), so only questions ("if you qualify", "unless you qualify") and a loss with its reason in the same sentence ("if you do not renew, you will lose your coverage") are excused. A classifier pass is the way to recover the over-blocked text.
