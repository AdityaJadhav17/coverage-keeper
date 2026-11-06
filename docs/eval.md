# Evaluation plan

This backs the stage claim ("deadline correct on N of M real letters"). Report what the script prints, including failures.

## Dataset

- Location: `eval/letters/` (PNG, JPEG, WebP or PDF) and `eval/labels.json` (one entry per letter).
- A PDF is read whole, as the app reads an uploaded PDF. A letter photographed page by page lists its photos in page order under `files` instead of `file`.
- Full letters: each multi-page sample also has a `<id>-full` entry with its whole PDF, in the same split and with the same `state` as its page-1 entry. Its labels are checked against every page, since some deadlines, actions and papers are only on later pages.
- Source: **only public sample notices published by a state agency** (`.gov` domains), for example Oregon Health Authority notice guides and sample notices, or the Vermont DVHA notice page. Never a real person's letter, even with permission.
- Each label entry (schema in `eval/labels.schema.json`):
  - `id`, `file` (one image or PDF) or `files` (2-10 page photos, in order), `split` (`dev` or `test`)
  - `state` (`WA`, `OR`, `CA`, `NV`, `AZ`, or `other` for any other state)
  - `notice_type`, `deadline` (ISO date or `null`), `required_action`, `documents` (list)
  - `source_url`, `retrieved` (date), `usage_note` (e.g. "Public government sample notice, used for evaluation")
- Size: 10-15 sample letters, plus a full-PDF entry for each multi-page sample. At least 3 must be phone photos of a printed sample (taken by the team) so the score reflects real use.
- Sample notices often show placeholder dates such as `MM/DD/YYYY`. Label those as `deadline: null` and expect the reader to say "unsure".

CI rejects any file in `eval/` that is not listed in `labels.json` with a `.gov` source, and any file matching personal-data patterns (see [ci.md](ci.md)).

## Splits

- `dev`: about one third. Use these freely while writing the prompt.
- `test`: the rest. **Never look at failures on the test split to tune the prompt.** The stage number comes from `test` only.
- If the prompt changes after a test run, record it in `eval/results/` and say so.

## Metrics (per field)

| Field             | Metric                                                                                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deadline`        | Exact match on ISO date. `null` label matches only `null` output.                                                                                                           |
| `state`           | Exact match on enum. `other` matches only `other`; a `null` output (can't tell) never matches.                                                                              |
| `notice_type`     | Exact match on enum.                                                                                                                                                        |
| `required_action` | Match if normalized label tokens (lowercase, stopwords removed) are a subset of the output's tokens. Reported separately from deadline so the stricter metric isn't hidden. |
| `documents`       | Set precision and recall after normalization. Headline: recall.                                                                                                             |
| Guardrail         | Count of outputs with a forbidden phrase. Must be 0.                                                                                                                        |

## Running it

```bash
npm run eval                            # all splits, real model, reads ANTHROPIC_API_KEY from .env.local
npm run eval -- --split test            # stage number
npm run eval -- --split test --lang es  # Spanish output
npm run eval -- --match -es             # only letters whose id contains "-es" (written in Spanish)
```

- Letters written in Spanish have ids ending in `-es`. Each is an agency's Spanish version of an English sample and copies its labels and split, so an English-answer run scores every field.
- `--lang es` asks for Spanish output. Labels are English, so a Spanish run scores deadline, state, notice type and guardrail only; required action and documents are reported as not scored.
- One run can swing by ±2 on required action. Report the mean and range of 3 runs.

- Model and prompt are pinned: the script records `MODEL_ID` from `src/lib/letter-reader.ts` and `PROMPT_VERSION` from `src/prompts/letter-reader.ts` in every result.
- Output: `eval/results/<timestamp>.json` and `eval/results/latest.md` (score table + per-letter pass/fail). `eval/results/` is git-ignored; CI uploads it as an artifact.
- Scoring code (`eval/score.ts`) is unit-tested and runs without the model.

## Reporting rules

- Always show N of M, not only a percentage.
- List every failed letter with the expected and actual value.
- State which split and which model/prompt version produced the number.
