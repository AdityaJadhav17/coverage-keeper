This is research for a lawyer to review, not legal advice.

# Legal research

This folder lists the laws that could apply to Coverage Keeper in each place we serve, what they require, and what we must change or confirm before a public launch. A lawyer or pro bono clinic should review it before anyone relies on it.

## How to read these files

1. Start with [checklist.md](checklist.md). It lists every action, with launch blockers first.
2. Take [questions-for-counsel.md](questions-for-counsel.md) to the lawyer. It merges every file's questions, ranked by risk.
3. Open a jurisdiction file when you need the reasoning. Each one uses [\_template.md](_template.md): a summary, a 14-row topics table, details for every topic that may apply, questions for a lawyer, and sources.

| File                                                 | Covers                                                        | Last reviewed |
| ---------------------------------------------------- | ------------------------------------------------------------- | ------------- |
| [federal.md](federal.md)                             | Federal law, plus the Anthropic and Vercel terms that bind us | 2026-11-08    |
| [wa.md](wa.md)                                       | Washington (Apple Health)                                     | 2026-11-08    |
| [or.md](or.md)                                       | Oregon (OHP)                                                  | 2026-11-08    |
| [ca.md](ca.md)                                       | California (Medi-Cal)                                         | 2026-11-09    |
| [nv.md](nv.md)                                       | Nevada (Nevada Medicaid)                                      | 2026-11-08    |
| [az.md](az.md)                                       | Arizona (AHCCCS)                                              | 2026-11-08    |
| [checklist.md](checklist.md)                         | Every required action, merged across jurisdictions            | 2026-11-09    |
| [questions-for-counsel.md](questions-for-counsel.md) | Questions for a lawyer, ranked                                | 2026-11-09    |
| [privacy-notice.md](privacy-notice.md)               | Draft privacy notice (not published)                          | 2026-11-09    |

## What we are offering

The research covers this product and nothing else. Keep this list in sync with the code and with issue #43.

- **Who runs it:** a free website run by a nonprofit (name TBD), not affiliated with any state or CMS. It is hosted on Vercel and is public, with no accounts.
- **What it does:** a person photographs a letter about their Medicaid coverage (up to 10 photos or one PDF). The images go through our server to Anthropic's API (`claude-opus-5-5`). The reader returns a plain-language summary, the deadline and the line it came from, what the letter asks, papers to send, the phone number, and the sending state.
- **It never says whether someone is eligible.** A guardrail blocks such claims in English and Spanish.
- **Exemption screening:** yes/no questions taken from each state's published exemption list, a "This may apply to you. Ask {program} about it." result, "ways to meet the work rule", and a template note to your doctor asking whether they can write a statement about a health condition.
- **States:** WA (Apple Health), OR (OHP), CA (Medi-Cal), NV (Nevada Medicaid), AZ (AHCCCS). We use program names, phone numbers and official links.
- **Immigration:** some letters cover non-citizen eligibility, and we explain them.
- **Languages:** English and Spanish. The Spanish is machine-assisted and has not had a fluent review.
- **Data:** we store nothing; no cookies; screening answers stay in the browser; the IP address sits in memory about a minute for rate limiting; Vercel Web Analytics counts page views; Anthropic may keep inputs up to 30 days (none under zero data retention, which is not decided).
- **Possible later:** donations, partner organizations, more states.

## Source rules

- **Primary sources only for conclusions:** statute or regulation text on an official site, agency guidance or rules, state bar or court text, official attorney general pages, and the vendor's own terms. Law-firm and news articles were used only to find a primary source and are never cited.
- **Every claim has a citation** with a section number, an official URL and the date we retrieved it. We cite only pages we opened.
- **Unconfirmed** marks anything we could not check on a primary source: a page blocked by a bot check, a page we did not open, or text read only on an unofficial mirror. We did not guess blocked text.
- **Quotes** are at most one short sentence per source. The rest is summarized.
- **Retrieval dates:** research ran 2026-11-08 into 2026-11-09. Each file's Sources section gives the date for every URL. Laws and terms change, so re-check before launch.

## Status meanings

Every topic row has exactly one status, with a one-line reason tied to the product facts above.

| Status                  | Meaning                                                                |
| ----------------------- | ---------------------------------------------------------------------- |
| `applies`               | The text clearly reaches us. We must act.                              |
| `likely applies`        | The text probably reaches us. Act as if it does.                       |
| `unclear (lawyer)`      | The answer turns on a point a lawyer must decide. The file says which. |
| `likely does not apply` | The text probably misses us. The file says what would change that.     |
| `does not apply`        | The text clearly misses us today.                                      |

Topic 13 (charitable solicitation) is judged as if we start taking donations. We take none today.

Confidence is `high`, `medium` or `low`: how sure we are of the status, given what we could open.
