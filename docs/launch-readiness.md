# Public launch readiness

Checklist for opening Coverage Keeper to the public as an NGO project on Vercel. Real people will upload photos of their Medicaid letters, and later PDFs ([#17](https://github.com/AdityaJadhav17/coverage-keeper/issues/17)). Those letters carry names, case numbers and sometimes health information.

Researched 2026-11-03 from each provider's official pages. Prices and terms change, so re-check the linked pages before launch. **Unconfirmed** marks anything we could not verify on an official page.

This is not legal advice. Items marked **Lawyer** need review by a lawyer or a pro bono legal clinic before launch.

## Launch blockers

- [ ] Move hosting off the Hobby plan, or get Vercel's written OK for Hobby ([Vercel](#2-vercel)).
- [ ] Decide the data arrangement with Anthropic: standard retention, ZDR or HIPAA readiness ([Anthropic API](#1-anthropic-api)).
- [ ] Set an Anthropic monthly spend limit and add a Vercel WAF rate-limit rule on `/api/read` ([Cost and guards](#3-cost-model-and-guards)).
- [ ] Publish a privacy notice and terms of use, and link them from the consent screen and footer ([Legal pages](#4-legal-pages)).
- [ ] Get a lawyer's read on HIPAA, the FTC Health Breach Notification Rule and Washington's My Health My Data Act (**Lawyer**).
- [ ] Open a support channel that never asks for letter photos ([Support](#5-support-and-feedback)).
- [ ] Run the accessibility checks ([Accessibility](#accessibility-checks-before-launch)).
- [ ] Update the consent text and the "Third party sees letter" row in [safety-and-privacy.md](safety-and-privacy.md): Vercel processes the upload in transit.

## 1. Anthropic API

| Question                               | Answer                                                                                                                                                                                                                                                                                                                                                                                                                                     | Source                                                                                                                                                                                                                                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Is API data used for training?         | No, by default. Anthropic does not train on API inputs or outputs unless the customer sends feedback or opts in.                                                                                                                                                                                                                                                                                                                           | [Is my data used for model training?](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training), [API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)                                                                             |
| How long are prompts and outputs kept? | **Sources disagree.** The API docs say conversation content "is not retained by default", except for Covered Models (30 days). The Privacy Center article says API inputs and outputs are deleted within 30 days. Plan for up to 30 days.                                                                                                                                                                                                  | [API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention#how-anthropic-approaches-data-retention), [How long do you store my organization's data?](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data)                 |
| Exceptions to any arrangement          | Content flagged by trust and safety systems may be kept up to 2 years. Data may also be kept where the law requires.                                                                                                                                                                                                                                                                                                                       | [Retention regardless of arrangement](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention#retention-regardless-of-arrangement)                                                                                                                                                      |
| Is `claude-opus-5-5` a Covered Model?  | No. The Covered Models are Fable 5.1, Mythos 5.1, Fable 5 and Mythos 5. So `claude-opus-5-5` works under ZDR.                                                                                                                                                                                                                                                                                                                              | [Model-specific requirements](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention#model-specific-data-retention-requirements)                                                                                                                                                       |
| Zero data retention (ZDR)              | Available per organization on request through [Anthropic sales](https://claude.com/contact-sales). Under ZDR, prompts and responses are not stored after the response returns. The Messages API, effort and structured outputs are all eligible. Structured outputs cache the JSON schema (not the letter) for up to 24 hours. Price or plan requirements for ZDR: **unconfirmed**.                                                        | [ZDR scope](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention#zero-data-retention-zdr-scope), [Feature eligibility](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention#feature-eligibility)                                                                 |
| BAA for health data                    | Yes, for the first-party API ("HIPAA readiness"). Eligible orgs can sign Anthropic's standard BAA themselves on the Console [Data retention](https://platform.claude.com/settings/privacy) page. Custom BAAs go through sales. Once enabled, it cannot be turned off. The BAA does not cover the Batch API, Files API, Code Execution or the Console UI. It is not tied to a named paid plan; who counts as "eligible" is **unconfirmed**. | [Getting started with HIPAA readiness](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention#getting-started-with-hipaa-readiness), [BAA article](https://privacy.claude.com/en/articles/8114513-will-anthropic-sign-a-business-associate-agreement-baa-and-if-so-for-which-products) |
| HIPAA rule that affects our code       | Do not put PHI in JSON schema definitions. Our `LetterExtraction` schema has field names only, so we already comply.                                                                                                                                                                                                                                                                                                                       | [PHI handling guidelines](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention#phi-handling-guidelines)                                                                                                                                                                              |

**Recommendation:** ask Anthropic sales for ZDR on the production organization, and run evals in a separate organization. ZDR matches ADR-0004 ("nothing to breach") better than a BAA. A BAA only matters if we turn out to be a HIPAA business associate, which we probably are not (see [Legal pages](#4-legal-pages)).

## 2. Vercel

| Question                       | Answer                                                                                                                                                                                                                                                                                                                                                                                                                   | Source                                                                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Can Hobby host an NGO project? | **Unclear; assume no.** Hobby is "restricted to non-commercial personal use only". An NGO's public service is not clearly "personal". Commercial use covers any deployment that brings financial gain to anyone in its production, including a paid staff member or contractor who writes the code. Asking for donations is allowed. Ask [Vercel support](https://vercel.com/help) in writing before launching on Hobby. | [Fair use guidelines: Commercial usage](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage)                                                                          |
| Which plan is needed?          | Pro if anyone is paid, or if Vercel says no to Hobby. Pro is also needed for the HIPAA BAA add-on and gives 40 WAF rate-limit rules (Hobby gets 1). Check the current Pro price on [vercel.com/pricing](https://vercel.com/pricing).                                                                                                                                                                                     | [Fair use](https://vercel.com/docs/limits/fair-use-guidelines), [WAF rate limiting limits](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting#limits)                   |
| Nonprofit discount             | **Unconfirmed.** We found no official Vercel nonprofit program. Ask support.                                                                                                                                                                                                                                                                                                                                             | —                                                                                                                                                                                     |
| HIPAA / BAA                    | Not on Hobby. Pro teams can buy a HIPAA BAA add-on in Billing settings. Enterprise teams request it from sales. Add-on price is **unconfirmed** (third-party sites quote $350/month).                                                                                                                                                                                                                                    | [Is Vercel HIPAA compliant?](https://vercel.com/kb/guide/is-vercel-hipaa-compliant), [Changelog: BAAs on Pro](https://vercel.com/changelog/hipaa-baas-are-now-available-to-pro-teams) |
| What Web Analytics collects    | No cookies. Each data point can store: timestamp, URL and dynamic path, referrer, filtered query params, location (country, region, city), OS and version, browser and version, device type, and script version. Visitors are identified by a hash of the request that is discarded after 24 hours.                                                                                                                      | [Web Analytics privacy and compliance](https://vercel.com/docs/analytics/privacy-policy)                                                                                              |

Two fixes for our docs:

- Done: [safety-and-privacy.md](safety-and-privacy.md) now lists every Web Analytics field Vercel documents (timestamp, query params, region and city were missing). The privacy notice still needs the same list.
- The upload passes through a Vercel Function. We do not store it, but Vercel processes it in transit. The privacy notice should name Vercel as the host.

## 3. Cost model and guards

### Per-read cost with `claude-opus-5-5`

Inputs from the code: one image, the system prompt in `src/prompts/letter-reader.ts`, the structured output schema, effort `medium`, `max_tokens` 16000, and one retry on 429 or 5xx (`src/lib/letter-reader.ts`).

| Item                                | Tokens          | Basis                                                                                                                                                                                                                                                          |
| ----------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Letter photo                        | up to ~4,800    | Opus 5.5 uses the high-resolution tier: images are resized to a 2,576 px long edge and at most 4,784 visual tokens. A phone photo of a page hits that cap. ([Vision: resolution and token cost](https://platform.claude.com/docs/en/build-with-claude/vision)) |
| System prompt, schema, request text | ~1,000          | Estimate; the prompt file is about 1.7 KB.                                                                                                                                                                                                                     |
| **Input total**                     | **~5,800**      |                                                                                                                                                                                                                                                                |
| Output: thinking plus JSON answer   | ~1,000 to 4,000 | **Estimate, not measured.** Thinking is always on for Opus 5.5 and counts toward `max_tokens`; we assume it is billed at the output rate (not stated on the pricing page, **unconfirmed**).                                                                    |
| Worst case output                   | 16,000          | Capped by `max_tokens`.                                                                                                                                                                                                                                        |

Prices: $4 per million input tokens and $20 per million output tokens ([pricing](https://platform.claude.com/docs/en/about-claude/pricing)).

|                                              | Per read | 1,000 reads/month | 10,000 reads/month |
| -------------------------------------------- | -------- | ----------------- | ------------------ |
| Low (1,000 output tokens)                    | ~$0.04   | ~$43              | ~$430              |
| Typical estimate (2,500 output tokens)       | ~$0.07   | ~$73              | ~$730              |
| High (4,000 output tokens)                   | ~$0.10   | ~$103             | ~$1,030            |
| Worst case (16,000 output tokens every read) | ~$0.34   | ~$343             | ~$3,430            |

Notes:

- Upload size does not change the price. A 4 MB photo and a 1 MB photo both land near the 4,784-token cap after resizing.
- Prompt caching will not help much: the prefix before the image is small, and cache minimums apply.
- PDFs ([#17](https://github.com/AdityaJadhav17/coverage-keeper/issues/17)) cost more: each page is billed as text plus an image of the page. Multi-page letters multiply the image cost.
- **To do before launch:** measure real token use. Run the eval set and record `usage.input_tokens` and `usage.output_tokens` per letter. Then replace the estimates above.

### Guards that exist today

| Guard                                                                            | What it does                                                                | Limit                                                                                                                |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| In-app rate limit (`src/lib/rate-limit.ts`, used in `src/app/api/read/route.ts`) | 10 reads per minute per IP, fixed window.                                   | Per server instance only, so it resets on cold starts and does not add up across instances. A speed bump, not a cap. |
| Upload checks (`route.ts`)                                                       | JPEG, PNG or WebP only; 4 MB max; rejects large bodies before reading them. | Does not limit how many reads happen.                                                                                |
| Timeout and retry (`letter-reader.ts`)                                           | 30 s timeout, one retry on 429 or 5xx only.                                 | A retry can double the cost of a failing read.                                                                       |

### Guards to turn on before launch

- [ ] **Anthropic spend limit.** Set a monthly limit below the tier cap on the Console [Billing](https://platform.claude.com/settings/billing) page. Over the limit, the API returns errors and our app shows the "call your state" fallback. Tier caps: Start $500, Build $1,000, Scale $200,000 a month. A busy month at 10,000 reads can pass the Start cap. ([Rate limits: spend limits](https://platform.claude.com/docs/en/api/rate-limits#spend-limits))
- [ ] **Separate workspace.** Put the production key in its own workspace with its own spend and rate limits. The default workspace cannot have a spend limit. ([Workspace limits](https://platform.claude.com/docs/en/api/rate-limits#setting-lower-limits-for-workspaces))
- [ ] **Vercel WAF rate limit** on `/api/read`, keyed on IP. Available on all plans; Hobby gets 1 rule with 1,000,000 allowed requests included, Pro gets 40 rules. Counters are per region. ([WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting))
- [ ] **Billing alerts** in both the Anthropic Console and Vercel, so someone hears about a spike before the cap hits.
- [ ] Decide what users see when the monthly limit is reached. Today they get the generic 502 message with the phone number, which is safe.

## 4. Legal pages

### Is HIPAA the right frame? (Lawyer)

HIPAA covers health plans, providers, clearinghouses and their business associates. Coverage Keeper is a free tool people use for themselves, not a service run for a state Medicaid agency or a health plan. So HIPAA probably does not apply. Two other laws probably do:

- **FTC Health Breach Notification Rule.** Covers non-HIPAA health apps that hold health records. Since 2024 an "unauthorized disclosure" counts as a breach. We keep no record, which may put us outside the rule, but a lawyer should confirm. ([Federal Register, 2024 final rule](https://www.govinfo.gov/content/pkg/FR-2024-05-30/pdf/2024-10855.pdf))
- **Washington My Health My Data Act.** Covers "consumer health data" of Washington residents. Law firm summaries say it has no nonprofit exemption and no revenue threshold. It requires a published consumer health data privacy policy and consent before collecting or sharing that data. We are adding Washington ([#18](https://github.com/AdityaJadhav17/coverage-keeper/issues/18)), so treat this as in scope. ([Cooley FAQ](https://cdp.cooley.com/washington-states-my-health-my-data-act-faq-part-one-applicability-and-scope/); statute text not checked, **unconfirmed**)
- Nevada has a similar consumer health data law, and California has its own medical privacy law. Not researched; **Lawyer**.

### Pages to publish

| Page                                                                                      | Must say                                                                                                                                                                                                                                                                                                                                            | Already covered in our docs                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Privacy notice** (plus a WA consumer health data policy, or one notice that meets both) | What we collect (the photo, screening answers); that we do not store it; who processes it (Anthropic for reading, Vercel for hosting and page-view analytics); Anthropic's retention (up to 30 days, or none under ZDR; flagged content up to 2 years); no training on the data; no sale or sharing; no cookies; how to contact us; effective date. | ADR-0004 and [safety-and-privacy.md](safety-and-privacy.md) cover no storage, redacted logs, React-state-only results, one model provider, and the analytics scope. **Missing:** Vercel as processor, Anthropic retention period and the flagged-content exception, contact details, WA-specific rights, an effective date. |
| **Terms of use**                                                                          | Free informational tool; no guarantee the reading is right; always check the letter itself and call the state; the user must have the right to upload the letter; no misuse; limits of liability; governing law.                                                                                                                                    | Not covered anywhere.                                                                                                                                                                                                                                                                                                       |
| **"Not legal advice / not a government agency" notice**                                   | Not legal advice. Cannot decide eligibility. Not affiliated with any state Medicaid agency, CMS or Anthropic. Who runs it (NGO name). The state phone number for decisions.                                                                                                                                                                         | The consent screen covers "not legal advice" and "can't decide if you qualify", and every result has the phone number. **Missing:** "not a government agency" and "not affiliated" wording, and the operator's name.                                                                                                        |
| **Accessibility statement**                                                               | Target (WCAG 2.2 AA), known gaps, how to report a barrier.                                                                                                                                                                                                                                                                                          | Target is in safety-and-privacy.md; no public statement.                                                                                                                                                                                                                                                                    |

All pages need Spanish versions once [#16](https://github.com/AdityaJadhav17/coverage-keeper/issues/16) lands, and state-specific phone numbers once [#18](https://github.com/AdityaJadhav17/coverage-keeper/issues/18) lands. The consent screen text in safety-and-privacy.md still names only OHP.

## 5. Support and feedback

Rule for every channel: **never ask for, or accept, a photo of a letter.** Every channel says so up front and points to the state phone number for coverage questions.

| Option                                                                                         | Good for                             | Watch out for                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dedicated email address (for example on the NGO's domain)                                      | Users and partner caseworkers        | Users will attach letters anyway. Set an auto-reply asking them not to, and delete attachments.                                                                        |
| Short feedback form with no file upload (for example "Was this helpful?" plus a free-text box) | Quality signal                       | Free text can still hold personal details. Tell users not to include their name or case number. Choose a form tool with clear data terms. Needs a privacy notice line. |
| GitHub issues                                                                                  | Developers and partner organizations | Public. Not for end users. Link it only from the repo.                                                                                                                 |
| Partner organizations (legal aid, navigators, community health workers)                        | Real human help                      | Keep a list of partners per state as states are added.                                                                                                                 |

We recommend email plus a no-upload feedback form at launch, and adding the partner list as states go live.

## Accessibility checks before launch

Automated axe checks already run in E2E (`tests/e2e/*.spec.ts`). They catch about a third of issues. Before launch, also do these by hand:

- [ ] Screen readers: VoiceOver on iPhone and TalkBack on Android, through the whole flow: consent, photo, result, screening, doctor draft.
- [ ] Keyboard only on desktop: every control reachable, visible focus, no traps, logical order.
- [ ] Zoom to 200% and reflow at 320 px wide with no sideways scrolling.
- [ ] Contrast at least 4.5:1 for text and 3:1 for controls, including the deadline urgency states.
- [ ] Touch targets at least 44 px (our own target; WCAG 2.2 AA minimum is 24 px).
- [ ] Errors and loading states are announced (live region) and say what to do next.
- [ ] Respects `prefers-reduced-motion`.
- [ ] `lang` attribute is right on every page, including Spanish pages after #16.
- [ ] Generated text reads at grade 6 to 8; fixed strings reviewed by hand.
- [ ] Works on a low-end Android phone on a slow mobile connection.
- [ ] Test with a few real users who use assistive technology, through a partner organization.

Reference: [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## Sources

Anthropic

- [API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)
- [Is my data used for model training?](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training)
- [How long do you store my organization's data?](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data)
- [Business Associate Agreements](https://privacy.claude.com/en/articles/8114513-will-anthropic-sign-a-business-associate-agreement-baa-and-if-so-for-which-products)
- [Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Vision](https://platform.claude.com/docs/en/build-with-claude/vision)
- [Rate limits and spend limits](https://platform.claude.com/docs/en/api/rate-limits)

Vercel

- [Fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
- [Is Vercel HIPAA compliant?](https://vercel.com/kb/guide/is-vercel-hipaa-compliant)
- [HIPAA BAAs on Pro (changelog)](https://vercel.com/changelog/hipaa-baas-are-now-available-to-pro-teams)
- [Web Analytics privacy and compliance](https://vercel.com/docs/analytics/privacy-policy)
- [WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)

Law

- [FTC Health Breach Notification Rule, 2024 final rule](https://www.govinfo.gov/content/pkg/FR-2024-05-30/pdf/2024-10855.pdf)
- [Washington My Health My Data Act FAQ (Cooley)](https://cdp.cooley.com/washington-states-my-health-my-data-act-faq-part-one-applicability-and-scope/)
