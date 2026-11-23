# eval

Scores the letter reader against labeled public sample notices and writes a results file.

## Contents

| Path                 | Description                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `letters/`           | Public sample notices (PNG, JPG, PDF) from state and federal .gov sites; `synthetic/` test letters |
| `labels.json`        | One entry per image: expected fields, split, source and retrieval date                             |
| `labels.schema.json` | JSON Schema for `labels.json` (all fields required, no extra fields)                               |
| `COVERAGE.md`        | Letters per state and category against the targets, and every URL searched for samples             |
| `LABEL_CHANGES.md`   | Every change to an existing label, with the reason                                                 |
| `run.ts`             | Reads each letter with `readLetter`, compares to the label, writes results                         |
| `score.ts`           | Scoring helpers: text, deadline, quote, phone and page matchers, document scores, group counts     |
| `score.test.ts`      | Unit tests for the scoring helpers                                                                 |
| `results/`           | Output of each run, git-ignored                                                                    |

## Labels and splits

Fields and labeling rules: [../docs/eval-labeling.md](../docs/eval-labeling.md). Use `dev` while changing the prompt and `test` for the final check.

## Run

```bash
npm run eval -- --split dev
npm run eval -- --split test
npm run eval              # all letters
```

This calls the real model (`claude-opus-5-5`), needs `ANTHROPIC_API_KEY` set, and costs money. It is not part of CI. Each run writes a timestamped JSON file and `latest.md` to `results/`, with the model id and prompt version recorded.

## Data rule

Every public sample in `letters/` must come from an agency: a .gov `source_url`, or an agency site that a .gov page links to (`source_linked_from`). Synthetic test letters live in `letters/synthetic/`, each rendered from a template in `synthetic/` by `../scripts/render-synthetic.ts` and carrying the SYNTHETIC banner. No real person's letter goes in this folder. `../scripts/check-hygiene.mjs` (`npm run check:hygiene`) fails on unlisted files, non-.gov sources, and personal-data patterns in `eval/` text files.

## Adding a letter

1. Save page 1 as PNG (`pdftoppm -r 145 -png -f 1 -l 1 -singlefile`) in `letters/`, and the whole PDF as `<id>-full.pdf` when it has more pages. Check by eye that it holds no real personal data.
2. Label it per the guide, before any model run, and add the entry to `labels.json`.
3. Run `npm run check:hygiene` and `npm run test:integration`.

## Results

Scores are not kept in this file. See the Evaluation section of the root README ([../README.md#evaluation](../README.md#evaluation)) and the method in [../docs/eval.md](../docs/eval.md).
