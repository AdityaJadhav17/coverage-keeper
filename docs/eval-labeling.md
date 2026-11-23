# Labeling guide

Rules for every field in `eval/labels.json`. Label from the letter file only: never copy a field from a model's output. Write every label before the reader runs on that letter.

Each rule applies to what the file shows. A page-1 PNG is labeled from page 1; a `-full` PDF from every page.

## Fields

**`notice_type`**: one value from `NoticeType` in `src/lib/schema.ts`. Pick what the letter mainly does. `ca-mc020-1095b` tells beneficiaries a tax form is coming, so it is `other_medicaid`.

**`deadline`**: the date the person must act by, as `YYYY-MM-DD`.

- An effective date is `null` unless the letter tells the person to act by it. `or-outreach-work-rules` says "New OHP Rules Begin 01/01/2027" and asks for nothing by then: `null`.
- A placeholder (`MM/DD/YYYY`, `<End Date>`, `EndDate`) is `null`.
- Two different act-by dates for the same step are `null`. `vt-205ifar-renew` prints "Respond by: December 12, 2026" and "return it by September 12, 2022": `null`.
- `vt-201p-review-reminder`: "Please return your completed form by January 1, 2020" gives `2020-01-01`.

**`deadline_quote`**: the printed sentence that gives the deadline, copied word for word with the date as printed. `null` when `deadline` is `null`. `wa-ee009-renewal-action`: "If you do not complete your renewal by 05/31/2019, the health care coverage for the individuals listed above will end on 05/31/2019."

**`deadline_page`**: the 1-based page that sentence is on. `null` when `deadline` is `null`. A page-1 image is always `1`.

**`required_action`**: 2 to 5 lowercase key words that any correct answer must contain, or `null` when the letter asks for nothing. `vt-ee307-renewal-ending`: "return renewal form". `or-med005-eligibility` page 1 only reports a decision: `null`.

**`documents`**: each paper the letter asks the person to send or return, in plain words. Papers the letter only says it _may_ ask for later are not listed. `vt-ee307-renewal-ending`: `["renewal form"]`.

**`contact_phone`**: the first number the letter tells the person to call about this letter, as printed. Not a TTY, relay or fax number. `or-outreach-work-rules`: "1-800-699-9075". When the number runs off the page or the file shows none, `null` (`nv-ep10322-noncitizen` page 1 ends at "(800)").

**`state`**: the state that sent the letter, or `other` for any state we don't serve (Vermont letters are `other`).

## Categories

List every category that fits. At least one.

| Category                                                                               | Use when                                                          |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `renewal`, `work_requirements`, `coverage_ending`, `approval_or_change`, `immigration` | the letter is about that topic                                    |
| `request_for_information`                                                              | it asks for proof or papers                                       |
| `not_medicaid`                                                                         | it is not about Medicaid at all                                   |
| `multi_page`                                                                           | the file has more than one page                                   |
| `deadline_on_later_page`                                                               | `deadline_page` is 2 or more                                      |
| `no_deadline`                                                                          | `deadline` is `null`                                              |
| `placeholder_date`                                                                     | a date the person must act on is a placeholder                    |
| `effective_date_trap`                                                                  | a printed start or change date could be mistaken for the deadline |
| `phone_photo`, `low_quality_image`                                                     | a phone photo of a printed page; a blurred, rotated or dark image |
| `spanish_letter`                                                                       | the letter is written in Spanish                                  |
| `prompt_injection`                                                                     | the letter contains text addressed to an AI                       |

## Changing a label

A label changes only for a labeling error: the label disagrees with the letter or with this guide. "The model said something else" is not a labeling error. Each change gets one line in `eval/LABEL_CHANGES.md`: id, field, old → new, reason.
