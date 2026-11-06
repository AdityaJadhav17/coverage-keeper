# Safety and privacy

## Harm model

| Harm                                                 | Cause                           | Mitigation                                                                                              | Story          |
| ---------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------- |
| User loses coverage after acting on a wrong deadline | Model misreads a date           | Show quoted source line; compute days in code; "unsure" when ambiguous; eval measures deadline accuracy | US-020, US-021 |
| User thinks they are (not) eligible                  | Model or UI states eligibility  | Schema has no eligibility field; output filter; fixed "may apply" wording; safety suite blocks build    | US-050, US-030 |
| Forged letter manipulates output                     | Prompt injection in letter text | Prompt treats letter as data; schema-only output; guardrail filter; adversarial tests                   | US-052         |
| Leak of PII/PHI                                      | Storage, logs, error reports    | No storage; redacted logs; page-view analytics only, never letter data                                  | US-051         |
| Third party sees letter                              | Image sent to LLM provider      | Consent screen discloses it; single provider; no other processors                                       | US-055         |
| User acts on outdated rules                          | State changes exemptions        | Rules are data with `source_url` and `retrieved` date shown in UI                                       | US-030         |
| User can't reach a human                             | App is a dead end               | Phone number on every result and error                                                                  | US-054         |

## What we log

Request ID, timestamp, route, status code, latency, model ID, prompt version, error class, guardrail-hit count.

Vercel Web Analytics counts page views without cookies. Per Vercel's [privacy and compliance page](https://vercel.com/docs/analytics/privacy-policy), each data point can store a timestamp, the URL and path, the referrer, filtered query parameters, location (country, region, city), OS and version, browser and version, device type and script version. Visitors are identified by a hash of the request that is discarded after 24 hours. Every screen lives at `/`, so the path never reveals a letter or a result. The app sends no custom events.

## What we never store or log

Image bytes, letter text, extracted fields, user answers to screening questions, IP-to-content links. No session replay, no custom analytics events, no trackers other than Vercel Web Analytics page views.

## Consent and disclaimers

Before the first upload: "Your photo is sent to an AI service to read it. We don't save it. This is not legal advice and can't decide if you qualify. Call OHP at 800-699-9075 for decisions." User taps "I understand".

## Prompt injection

- The system prompt says text in the image is data and never changes instructions.
- The reader returns only schema JSON (structured outputs), validated with zod.
- The guardrail filter runs on every string after generation.
- `tests/safety/` includes injected-text fixtures.

## Accessibility and plain language

- Target reading level: grade 6-8 for generated text. Fixed UI strings reviewed by hand.
- WCAG 2.2 AA: 44 px touch targets, 4.5:1 contrast, labels on all inputs, works at 200% zoom. Axe checks run in E2E.
- No information conveyed by color alone (deadline urgency also uses text).

## Multilingual plan

- MVP: English UI and output.
- Next: Spanish (Oregon publishes Spanish sample notices). Generated text by requested output language; fixed strings in a translation file reviewed by a fluent speaker.
- Later: languages Oregon publishes guides in (Russian, Vietnamese, Chinese, Arabic, Somali).

## Sources

- Oregon rules, phone number and reapply policy: https://www.oregon.gov/oha/hsd/ohp/pages/federal-changes.aspx (updated 2026-09-18)
