# Evaluation plan

This backs the stage claim ("deadline correct on N of M real letters"). Report what the script prints, including failures.

## Dataset

- Location: `eval/letters/` (PNG, JPEG, WebP or PDF) and `eval/labels.json` (one entry per letter).
- A PDF is read whole, as the app reads an uploaded PDF. A letter photographed page by page lists its photos in page order under `files` instead of `file`.
- Full letters: each multi-page sample also has a `<id>-full` entry with its whole PDF, in the same split and with the same `state` as its page-1 entry. Its labels are checked against every page, since some deadlines, actions and papers are only on later pages.
- Source: **only public sample notices published by a state agency** (`.gov` domains), for example Oregon Health Authority notice guides and sample notices, or the Vermont DVHA notice page. Never a real person's letter, even with permission.
- Each label entry (schema in `eval/labels.schema.json`, rules in [eval-labeling.md](eval-labeling.md)):
  - `id`, `file` (one image or PDF) or `files` (2-10 page photos, in order), `split` (`dev` or `test`)
  - `state` (`WA`, `OR`, `CA`, `NV`, `AZ`, or `other` for any other state)
  - `notice_type`, `deadline` (ISO date or `null`), `deadline_quote`, `deadline_page`, `required_action`, `documents` (list), `contact_phone`
  - `category` (one or more from the list in the guide), `source_kind` (`gov_sample` or `synthetic`)
  - `source_url` (and `source_linked_from` when the sample sits on an agency site that its `.gov` page links to), `retrieved` (date), `usage_note`
  - `labeled_by` (GitHub handles) and `label_version: 2`
- A label changes only for a labeling error, logged in `eval/LABEL_CHANGES.md`.
- Size: 10-15 sample letters, plus a full-PDF entry for each multi-page sample. At least 3 must be phone photos of a printed sample (taken by the team) so the score reflects real use.
- Sample notices often show placeholder dates such as `MM/DD/YYYY`. Label those as `deadline: null` and expect the reader to say "unsure".

CI rejects any file in `eval/` that is not listed in `labels.json` with a `.gov` source, and any file matching personal-data patterns (see [ci.md](ci.md)).

## Splits

- `dev`: about one third. Use these freely while writing the prompt.
- `test`: the rest. **Never look at failures on the test split to tune the prompt.** The stage number comes from `test` only.
- If the prompt changes after a test run, record it in `eval/results/` and say so.

## Metrics (per field)

| Field             | Metric                                                                                                                                                                                                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deadline`        | Exact match on ISO date. `null` label matches only `null` output.                                                                                                                                                                                                                                                                                          |
| `state`           | Exact match on enum. `other` matches only `other`; a `null` output (can't tell) never matches.                                                                                                                                                                                                                                                             |
| `notice_type`     | Exact match on enum.                                                                                                                                                                                                                                                                                                                                       |
| `required_action` | Match if normalized label tokens (lowercase, stopwords removed, plurals folded, "exception" read as "exemption") are a subset of the output's tokens. A `null` label ("no action") matches `null`, or an answer that says the letter asks for nothing (phrases in `eval/score.ts`). Reported separately from deadline so the stricter metric isn't hidden. |
| `documents`       | Set precision and recall after normalization. Headline: recall.                                                                                                                                                                                                                                                                                            |
| `contact_phone`   | Same number: the first 10-digit US number in label and output match (`phoneMatches`, via `phoneHref`). Formats, `1-` prefixes and a trailing TTY number don't matter. `null` matches only an output with no number.                                                                                                                                        |
| `deadline_quote`  | Every label word (after the `required_action` normalization) is in the output, and the label's date is in the output in any common format: `February 15, 2027`, `Feb 15, 2027`, `02/15/2027`, `2027-02-15` or `15 de febrero de 2027` (`quoteMatches`). Line breaks and spacing don't matter. Not scored on `--lang es` runs.                              |
| `deadline_page`   | Exact match; `null` matches only `null`.                                                                                                                                                                                                                                                                                                                   |
| Guardrail         | Count of outputs with a forbidden phrase. Must be 0.                                                                                                                                                                                                                                                                                                       |

## Running it

```bash
npm run eval                            # all splits, real model, reads ANTHROPIC_API_KEY from .env.local
npm run eval -- --split test            # stage number
npm run eval -- --split test --lang es  # Spanish output
npm run eval -- --match -es             # only letters whose id contains "-es" (written in Spanish)
npm run eval -- --category phone_photo  # only letters with that category
```

- Letters written in Spanish have ids ending in `-es`. Each is an agency's Spanish version of an English sample and copies its labels and split, so an English-answer run scores every field.
- `--lang es` asks for Spanish output. Labels are English, so a Spanish run scores deadline, state, notice type and guardrail only; required action and documents are reported as not scored.
- One run can swing by ±2 on required action. Report the mean and range of 3 runs.

- Model and prompt are pinned: the script records `MODEL_ID` from `src/lib/letter-reader.ts` and `PROMPT_VERSION` from `src/prompts/letter-reader.ts` in every result.
- Output: `eval/results/<timestamp>.json` and `eval/results/latest.md`: the score table, deadline / notice type / required action as N of M per category and per state, and per-letter pass/fail.
- The runner stops before any model call if a file a label lists is missing, so a letter is never scored on part of its pages. `eval/results/` is git-ignored; CI uploads it as an artifact.
- Scoring code (`eval/score.ts`) is unit-tested and runs without the model.

## Reporting rules

- Always show N of M, not only a percentage.
- List every failed letter with the expected and actual value.
- State which split and which model/prompt version produced the number.
