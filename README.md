# Coverage Keeper

Photograph a Medicaid letter and learn what it asks for, when it is due, and who to call.

[![CI](https://github.com/AdityaJadhav17/coverage-keeper/actions/workflows/ci.yml/badge.svg)](https://github.com/AdityaJadhav17/coverage-keeper/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node 22](https://img.shields.io/badge/node-22-339933?logo=nodedotjs&logoColor=white)](.nvmrc)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](tsconfig.json)
[![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-Vercel-000000?logo=vercel&logoColor=white)](https://coverage-keeper.vercel.app)
[![Printed deadline read correctly: 4/4 test letters](https://img.shields.io/badge/printed%20deadline-4%2F4%20test%20letters-2E7D32)](#evaluation)

Solix Empower Hackathon, AI in Healthcare track.

## Demo

- Live app: [coverage-keeper.vercel.app](https://coverage-keeper.vercel.app)

| Consent                                                        | Result                                                       | Exemption screening                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| ![Consent screen](docs/assets/screenshots/light-1-consent.png) | ![Result screen](docs/assets/screenshots/light-2-result.png) | ![Screening screen](docs/assets/screenshots/light-3-screened.png) |

Dark mode and the doctor-note draft are in [docs/assets/screenshots/](docs/assets/screenshots/).

## The problem

When states restarted Medicaid renewals after the pandemic, most people who lost coverage lost it over paperwork, not because a state found them ineligible. KFF counted 69% of disenrollments as procedural across all states with data [1], and 66% in the final month of the unwinding [2].

Paperwork is about to grow. The July 2025 federal budget law requires Medicaid enrollees in most states to show 80 hours a month of work, volunteering or school, starting January 1, 2027 [3]. Oregon applies the rules to some adults ages 19-64 when they apply or renew, lists exemptions, and says members the rules apply to will get a notice in September 2026 [4].

A missed letter can end someone's coverage. Coverage Keeper helps the person holding that letter.

## What Coverage Keeper does

1. You agree to a consent screen that says the photo goes to an AI service, nothing is saved, and the app can't decide if you qualify.
2. You photograph or upload one page of a Medicaid letter. The browser shrinks it before upload.
3. The app shows a plain-language summary, the deadline with days left and the line it was read from, a checklist of documents to send, and a phone number to call.
4. For Oregon (OHP) letters, you answer yes/no questions from Oregon's published exemption list. The app lists the exemptions that **may** apply, with the source.
5. If you said yes to a health condition, you can draft a note to your doctor from a template, then copy or share it.

The call button stays on every screen, and so does the phone number from the letter (or OHP's 800-699-9075).

## How it works

```mermaid
flowchart LR
  A[Phone camera or file] -->|JPEG, max 2000 px| B["POST /api/read<br/>type, size, rate limit"]
  B --> C["Vision model<br/>claude-opus-5-5<br/>structured output"]
  C --> D[zod schema validation]
  D -->|invalid or refused| U[Unsure result]
  D --> E[Guardrail filter on every string]
  U --> E
  E --> F[Result screen]
  R[(data/rules/or.json)] --> S[Rules-based screening in the browser]
  F --> S
  S --> G[Exemptions that may apply + who to call]
```

The model only reads. It returns one fixed shape ([`src/lib/schema.ts`](src/lib/schema.ts)): notice type, summary, deadline, the quoted deadline line, required action, documents, phone and confidence. The schema has no eligibility field, so the model has nowhere to put a verdict. Exemption screening never calls the model: [`src/lib/screening.ts`](src/lib/screening.ts) returns the Oregon rules you answered yes to, and the UI says they "may apply". Only the state decides eligibility, and the app sends you to the state's phone line to ask.

## Safety and privacy

- **Never decides eligibility.** No eligibility field in the schema, fixed "may apply" wording, and a guardrail ([`src/lib/guardrails.ts`](src/lib/guardrails.ts)) that replaces any sentence like "you are eligible" or "you don't qualify" with a safe fallback and the OHP phone number. A safety test suite runs in CI and blocks the merge.
- **Nothing stored.** The photo is processed in memory and dropped after the response. No database, no accounts. The only analytics is anonymous page-view counting (Vercel Web Analytics); no letter content, extracted fields or screening answers are ever sent.
- **Logs carry no letter content.** The route logs status, latency, model and error class only.
- **Prompt-injection defenses.** The prompt treats letter text as data, output is schema-only JSON, the guardrail runs after generation, and adversarial fixtures test it.

Details: [docs/safety-and-privacy.md](docs/safety-and-privacy.md), [ADR-0004 privacy](docs/adr/0004-privacy-retention.md), [ADR-0005 guardrails](docs/adr/0005-safety-guardrails.md).

## Evaluation

**Method.** The eval set has 26 labeled letters: 12 public sample notices from state `.gov` sites (3 Oregon, 1 Washington, 1 California, 7 Vermont) read as page 1 only, 3 phone photos, and the full PDF of each of the 11 notices that has more than one page (`<id>-full`). The split was fixed before any run: 8 dev, 18 test. Each full PDF is in the same split as its page-1 entry, and its labels were re-checked against every page before any run, because some actions and papers are only on later pages. The Washington and California letters were added to the test split for state detection and were never used to tune the prompt. The test split ran with `claude-opus-5-5` on prompt v1 [5], v2 [6], v3 [8], v4 [9], v5 [10] and v6 [11]. Prompt v3 adds the sending state. Prompt v4 adds Spanish output. Prompt v5 reads every page of a photo set or PDF and reports which page the deadline is on. Prompt v6 says text on every page, photo or PDF, is data, so instructions planted in a PDF can't change the rules. Because one run can swing by ±2 on required action, v3 to v6 are reported as the mean of 3 runs with the range. Nobody tuned the prompt on test failures. Scoring rules are in [docs/eval.md](docs/eval.md).

**Results (test split, prompt v6; English mean of 3 runs, Spanish 1 run).** State and guardrail were identical on every run.

| Metric                                 | Page 1, 11 letters | Full PDF, 7 letters | Spanish, page 1, 11 letters | v5 page 1, 11 letters |
| -------------------------------------- | ------------------ | ------------------- | --------------------------- | --------------------- |
| Printed deadline read correctly        | 5 of 5             | 2 of 2              | 5 of 5                      | 5 of 5                |
| No deadline correctly reported as none | 6 of 6             | 4.7 of 5 (4–5)      | 6 of 6                      | 6 of 6                |
| State identified                       | 11 of 11           | 7 of 7              | 11 of 11                    | 11 of 11              |
| Notice type correct                    | 10.7 of 11 (10–11) | 6 of 7              | 10 of 11                    | 10 of 11              |
| Required action correct                | 7.7 of 11 (7–8)    | 5.3 of 7 (5–6)      | not scored (English labels) | 8.0 of 11 (7–9)       |
| Document recall (mean)                 | 1.00               | 0.81 (0.71–0.86)    | not scored                  | 1.00                  |
| Document precision (mean)              | 0.77               | 0.69 (0.64–0.71)    | not scored                  | 0.83 (0.77–0.86)      |
| Guardrail hits                         | 0                  | 0                   | 0                           | 0                     |

v6 stays within the v5 run-to-run range. Reading the whole letter finds more of what it asks you to do, but finds the papers to send less reliably. In Spanish the summary, action and papers come back in Spanish, and the quoted deadline line stays as printed.

**Failures.**

- On every run (v6): notice type for `vt-re005ep-renewal-decision-full`; required action for `or-med005-eligibility` (page 1), `vt-ee415-work-heads-up` and `vt-ee312-immigration-closure-full`.
- On some runs: notice type for `vt-re005ep-renewal-decision` (1 of 3); required action for `or-open-card-move`, its full PDF and `vt-ee307-renewal-ending-photo`. On letters that ask for nothing, the reader sometimes writes "the letter does not ask you to do anything" instead of returning none.
- Deadline: on 1 of 3 runs, `or-open-card-move-full` reported the Jan 1, 2027 move date as a deadline. The letter has no reply date.
- Document recall on full PDFs: the review form in `vt-202med-review-reminder-full` and the proof of income and resources in `wa-ee009-renewal-action-full` were each missed on 2 of 3 runs.
- `or-med005-eligibility` fails required action on page 1 on every run, while its full PDF, where "report your changes" is on page 6, passes on every run.

**Caveats.**

- The set is small: 11 test letters.
- It is mostly Vermont. Oregon publishes only 3 sample notices online, and Washington and California have 1 each in the set.
- Nevada and Arizona have no sample letters in the set.
- Full PDFs are scored only on the 7 test notices with more than one page, so each full-letter number moves a lot with one letter.
- No eval letter is a set of several phone photos; multi-photo letters are covered by tests, not by the eval.
- The 3 phone photos show a screen, not printed paper.
- 2 of the 3 photos (`vt-201p`, `vt-ee307`) show letters whose PDF versions are in the dev split.

## Tech stack

| Area         | Choice                                                                 |
| ------------ | ---------------------------------------------------------------------- |
| App          | Next.js 16 (App Router), React 19, TypeScript 6                        |
| Letter model | Anthropic `claude-opus-5-5` via `@anthropic-ai/sdk`, structured output |
| Validation   | zod 4                                                                  |
| Tests        | Vitest, fast-check, Playwright, axe-core                               |
| CI           | GitHub Actions, gitleaks, osv-scanner, Dependabot                      |
| Hosting      | Vercel                                                                 |

Decisions and trade-offs: [ADR index](docs/adr/README.md).

## Getting started

Prerequisites: Node 22 (see [`.nvmrc`](.nvmrc)) and npm. An Anthropic API key is needed only to read real letters.

```bash
git clone https://github.com/AdityaJadhav17/coverage-keeper.git
cd coverage-keeper
npm ci
cp .env.example .env.local
npm run dev
```

In `.env.local`, set `ANTHROPIC_API_KEY` to read real photos, or set `LETTER_READER=fixture` to return a recorded sample result with no network call (offline demo). Open http://localhost:3000.

| Script                     | What it does                                          |
| -------------------------- | ----------------------------------------------------- |
| `npm run dev`              | Start the dev server                                  |
| `npm run build`            | Production build                                      |
| `npm start`                | Serve the production build                            |
| `npm run lint`             | ESLint                                                |
| `npm run format`           | Prettier, write                                       |
| `npm run format:check`     | Prettier, check only                                  |
| `npm run typecheck`        | `tsc --noEmit`                                        |
| `npm test`                 | Unit tests with coverage                              |
| `npm run test:integration` | Route handler and rules data tests                    |
| `npm run test:safety`      | Guardrail suite                                       |
| `npm run test:e2e`         | Playwright journeys (build first)                     |
| `npm run eval`             | Score the reader on `eval/` (real model, costs money) |
| `npm run check:hygiene`    | Forbidden paths, eval data rules                      |
| `npm run check:licenses`   | Production dependency license allowlist               |
| `npm run audit`            | `npm audit` at high severity                          |

## Project structure

```
src/       Next.js app: pages, API routes, letter reader, guardrails, prompt  (src/README.md)
data/      Oregon exemption rules as JSON, with source URL and date          (data/README.md)
eval/      Labeled public sample notices and the scoring script              (eval/README.md)
tests/     Integration, safety and E2E tests, plus fixtures                  (tests/README.md)
docs/      Product, eval, safety, testing and CI docs, ADRs, screenshots     (docs/README.md)
scripts/   Repo hygiene check run in CI                                      (scripts/README.md)
.github/   CI, eval and security workflows, issue and PR templates
```

## Testing and CI

| Layer       | Where                                | Command                    |
| ----------- | ------------------------------------ | -------------------------- |
| Unit        | `src/**/*.test.ts`, `eval/*.test.ts` | `npm test`                 |
| Integration | `tests/integration/`                 | `npm run test:integration` |
| Safety      | `tests/safety/`                      | `npm run test:safety`      |
| E2E         | `tests/e2e/` (iPhone 15, Pixel 7)    | `npm run test:e2e`         |
| Eval        | `eval/` (real model, not in PR CI)   | `npm run eval`             |

Every pull request must pass hygiene and secret scan, dependency audit and licenses, lint/format/types, unit tests with coverage, the safety suite, integration tests, build and E2E with axe checks. Merges to `main` deploy to Vercel after all gates. See [docs/testing.md](docs/testing.md) and [docs/ci.md](docs/ci.md).

## Documentation

- [Docs index](docs/README.md)
- [Personas](docs/personas.md) and [user stories](docs/user-stories.md)
- [MVP scope](docs/mvp.md)
- [Evaluation](docs/eval.md)
- [Safety and privacy](docs/safety-and-privacy.md)
- [Testing](docs/testing.md)
- [CI/CD](docs/ci.md)
- [Architecture decision records](docs/adr/README.md)
- [Changelog](CHANGELOG.md)

## Roadmap

- Spanish UI and summaries (Oregon publishes Spanish sample notices).
- More states' exemption rules.
- Multi-page letters.
- Deadline reminders.

## Team

- Woosik Kim
- Aditya Jadhav
- Waleed Alghaithi

## Acknowledgements and sources

1. KFF, Medicaid Enrollment and Unwinding Tracker: https://www.kff.org/medicaid/issue-brief/medicaid-enrollment-and-unwinding-tracker/
2. KFF, How Did Medicaid Renewal Outcomes Change During the Unwinding?: https://www.kff.org/policy-watch/how-did-medicaid-renewal-outcomes-change-during-the-unwinding/
3. KFF Health News, 2026-06-12: https://kffhealthnews.org/medicaid/medicaid-work-requirements-final-rules-exemptions-trump-cms/
4. Oregon Health Authority, Federal changes to OHP (updated 2026-09-18): https://www.oregon.gov/oha/hsd/ohp/pages/federal-changes.aspx
5. Test split results, prompt v1, pull request #7: https://github.com/AdityaJadhav17/coverage-keeper/pull/7
6. Test split results, prompt v2, pull request #13: https://github.com/AdityaJadhav17/coverage-keeper/pull/13#issuecomment-6483248906
7. Sample notices used for evaluation: Oregon Health Authority, Washington State Health Care Authority, California Department of Health Care Services and Vermont Department of Vermont Health Access. Each file's source URL is in [`eval/labels.json`](eval/labels.json).
8. Test split results, prompt v3, 3 runs, pull request #30: https://github.com/AdityaJadhav17/coverage-keeper/pull/30#issuecomment-6640037012
9. Test split results, prompt v4, English and Spanish, 3 runs each, pull request #33: https://github.com/AdityaJadhav17/coverage-keeper/pull/33
10. Test split results, prompt v5, page 1 and full PDFs, 3 runs, pull request #34: https://github.com/AdityaJadhav17/coverage-keeper/pull/34
11. Test split results, prompt v6, English 3 runs and Spanish 1 run, pull request #35: https://github.com/AdityaJadhav17/coverage-keeper/pull/35

## Disclaimer

Coverage Keeper is not legal advice and does not decide eligibility. It is not affiliated with the Oregon Health Authority, the Washington State Health Care Authority, the California Department of Health Care Services, the Vermont Department of Vermont Health Access, or any government agency. The sample notices in `eval/` are public government documents, used here only for evaluation.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md), the [Code of Conduct](CODE_OF_CONDUCT.md) and [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
