This is research for a lawyer to review, not legal advice.

# Nevada (Nevada Medicaid)

Last reviewed: 2026-11-08. All sources retrieved 2026-11-08 unless marked blocked. NRS pages show "[Rev. 4/15/2026 ...--2025]", so they include the 2025 session.

## Summary

- **The consumer health data law (NRS 603A.400 to 603A.550) likely covers us now.** It has no nonprofit exemption, and "collect" includes "receive" and "otherwise process". Letter photos and inferred health status are consumer health data. We need a separate Nevada consumer health data privacy policy, a processor contract with Anthropic, a request and appeal process, and written security policies. Sending images to Anthropic is "sharing", which needs separate consent unless the "necessary to provide a requested service" exception covers it. Only the AG enforces. See [Topic 2](#topic-2-health-data-privacy).
- **The breach law likely covers us while a letter is in transit.** A name plus a Medicaid ID is personal information, and our nonprofit "handles" it. Whether pass-through counts as data we "own or license" is for a lawyer. See [Topic 4](#topic-4-data-breach-notification).
- **NRS 651.050 makes any "online establishment", for profit or not, a place of public accommodation.** State disability law reaches our website, with a private right of action. See [Topic 9](#topic-9-accessibility).
- **AB 406 (2025) bans AI that claims to give mental health care or calls itself a counselor or therapist.** Fines run up to $15,000 per violation. Our screening asks about mental health, so wording matters. See [Topic 5](#topic-5-ai-specific-laws).
- **Unauthorized practice of law is a crime (NRS 7.285),** and no Nevada source we opened defines it. The court self-help pages were blocked. See [Topic 1](#topic-1-unauthorized-practice-of-law).
- **Our Nevada rules data cites the wrong page for the hotline.** 702-631-3310 appears on the state's get-help page, not on the page `data/rules/nv.json` cites. See [nv.json check](#nvjson-check).

## Topics

| #   | Topic                            | Law and citation                                                                                                                                                                                                                                     | Status                | Why (tied to our facts)                                                                                                                                                      | What we must do                                                                                                                                                 | Confidence |
| --- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | Unauthorized practice of law     | [NRS 7.285](https://www.leg.state.nv.us/NRS/NRS-007.html); [State Bar UPL page](https://nvbar.org/for-the-public/unauthorized-practice-of-law/); [Supreme Court Rules](https://www.leg.state.nv.us/CourtRules/SCR.html)                              | unclear (lawyer)      | Explaining letters and asking the state's own yes/no questions looks like information. But no statute or rule defines "practice of law", and the court pages were blocked.   | Add "Not legal advice. We are not lawyers." Route every result to "Ask Nevada Medicaid". Suggest no legal strategy.                                             | medium     |
| 2   | Health data privacy              | [NRS 603A.400 to 603A.550](https://www.leg.state.nv.us/NRS/NRS-603A.html); [SB 370 (2023)](https://archive.leg.state.nv.us/Session/82nd2023/Bills/SB/SB370_EN.pdf)                                                                                   | likely applies        | No nonprofit or size threshold. Passing images to Anthropic is collecting and sharing consumer health data.                                                                  | Separate Nevada consumer health data policy. Consent, or a lawyer sign-off on the exception. Processor contract. Request and appeal process. Security policies. | medium     |
| 3   | General consumer privacy         | [NRS 603A.300 to 603A.360](https://www.leg.state.nv.us/NRS/NRS-603A.html)                                                                                                                                                                            | likely does not apply | An "operator" runs a site "for commercial purposes" and maintains covered information. We are free and keep nothing. Health data is carved out.                              | Make sure our notice still covers the five 603A.340 items.                                                                                                      | medium     |
| 4   | Data breach notification         | [NRS 603A.020, .030, .040, .210, .220](https://www.leg.state.nv.us/NRS/NRS-603A.html)                                                                                                                                                                | likely applies        | A name plus a Medicaid ID is personal information. Any "business entity or association" that "handles" it is a data collector.                                               | Reasonable security. Security clauses in vendor contracts. Breach plan with substitute notice.                                                                  | medium     |
| 5   | AI-specific laws                 | [AB 406 (2025)](https://archive.leg.state.nv.us/Session/83rd2025/Bills/AB/AB406_EN.pdf), secs. 7-8                                                                                                                                                   | likely applies        | We are an "artificial intelligence provider" in Nevada. We ask about mental health and draft a note to a doctor. The law limits wording, not the product.                    | Never call the reader a counselor, therapist or doctor ("consejero" is risky). Block mental health advice. Point crisis questions to 988.                       | medium     |
| 6   | Medicaid and benefits assistance | [NRS 695J](https://www.leg.state.nv.us/NRS/NRS-695J.html)                                                                                                                                                                                            | likely does not apply | NRS 695J covers enrollment in Nevada Health Link plans. We explain Medicaid letters and enroll no one.                                                                       | Never call ourselves a navigator, assister or enrollment facilitator. Take no insurer money.                                                                    | medium     |
| 7   | Government affiliation           | [NRS 598.0915, 598.0923](https://www.leg.state.nv.us/NRS/NRS-598.html); [NRS 422.009, 422.041](https://www.leg.state.nv.us/NRS/NRS-422.html); [Web Announcement 3661](https://medicaid.nv.gov/Downloads/provider/web_announcement_3661_20250701.pdf) | likely applies        | False claims of affiliation are deceptive. We use "Nevada Medicaid", agency names and official numbers. No statute requires a specific disclaimer.                           | "Not part of Nevada Medicaid, the Nevada Health Authority or the State of Nevada" on every page. No logos or seals.                                             | medium     |
| 8   | Immigration consultant laws      | Document preparation services, [NRS 240A](https://www.leg.state.nv.us/NRS/NRS-240A.html); notaries, [NRS 240.085](https://www.leg.state.nv.us/NRS/NRS-240.html)                                                                                      | likely does not apply | Nevada folds immigration help into NRS 240A, which needs pay and exempts software. We are free.                                                                              | Explain only what the letter says. Never use "notario", "licenciado", "legal aid", "legal services" or "abogado".                                               | medium     |
| 9   | Accessibility                    | [NRS 651.050, 651.070, 651.090](https://www.leg.state.nv.us/NRS/NRS-651.html); [AB 266 (2025)](https://archive.leg.state.nv.us/Session/83rd2025/Bills/AB/AB266_EN.pdf)                                                                               | likely applies        | An "online establishment", "whether or not conducted for profit", with no public physical location is a place of public accommodation. That is us.                           | Meet WCAG 2.1 AA. Test with screen readers. Post an accessibility statement with a way to report barriers.                                                      | medium     |
| 10  | Language access                  | [NRS 232.0081](https://www.leg.state.nv.us/NRS/NRS-232.html)                                                                                                                                                                                         | does not apply        | The duty binds Executive Department agencies. It reaches contractors and grantees only through their contracts.                                                              | Label Spanish as machine-assisted. Never change quoted text or numbers in translation.                                                                          | high       |
| 11  | Consumer protection              | [NRS 598.0915, 598.0923](https://www.leg.state.nv.us/NRS/NRS-598.html); [NRS 603A.550](https://www.leg.state.nv.us/NRS/NRS-603A.html)                                                                                                                | likely applies        | Privacy and accuracy claims describe our service. Hiding Anthropic's retention could be omitting a material fact. Health data violations are deceptive practices regardless. | Make privacy claims exact. Say the summary can be wrong. Tie `nv.json` facts to official pages.                                                                 | medium     |
| 12  | Children                         | [NRS 603A](https://www.leg.state.nv.us/NRS/NRS-603A.html)                                                                                                                                                                                            | likely does not apply | No Nevada child-specific consent rule found. Minors' health data is covered like anyone's.                                                                                   | Say the site is for adults. Keep the age answer in the browser.                                                                                                 | low        |
| 13  | Charitable solicitation          | [NRS 82A](https://www.leg.state.nv.us/NRS/NRS-082A.html)                                                                                                                                                                                             | applies               | If we take donations, an online request to Nevada residents is soliciting "in this State" and needs registration.                                                            | Before donations: register or file an exemption. Add name, address and contact to each solicitation.                                                            | high       |
| 14  | Other                            | Document preparation, [NRS 240A](https://www.leg.state.nv.us/NRS/NRS-240A.html); practice of medicine, [NRS 630.020](https://www.leg.state.nv.us/NRS/NRS-630.html); agency names, [NRS 422](https://www.leg.state.nv.us/NRS/NRS-422.html)            | applies               | The agency-name point applies: Nevada Medicaid now sits in the Nevada Health Authority. NRS 240A and the doctor note likely do not apply.                                    | Use "Nevada Medicaid (Nevada Health Authority)". Keep the doctor note neutral. Stay free.                                                                       | high       |

## Details

### Topic 1: Unauthorized practice of law

[NRS 7.285(1)](https://www.leg.state.nv.us/NRS/NRS-007.html) bars practicing law without active State Bar membership or other authority. A first offense is a misdemeanor, and the State Bar can sue for an injunction (7.285(3)). The [State Bar page](https://nvbar.org/for-the-public/unauthorized-practice-of-law/) says: "The unauthorized practice of law in this state is a crime." The [Supreme Court Rules](https://www.leg.state.nv.us/CourtRules/SCR.html) define "practice of law" only for bar admission.

Nevada case law on the definition turned up only on unofficial sites. **Unconfirmed.** The nvcourts.gov self-help pages returned 403. **Unconfirmed.**

**What we must do:**

- Keep the guardrail: no "you qualify" statements. Route every result to "Ask Nevada Medicaid".
- Add: "Not legal advice. We are not lawyers."
- Don't suggest legal strategy, such as whether to appeal or which form to file.
- Have a lawyer confirm the line under Nevada case law.

### Topic 2: Health data privacy

SB 370 (2023) is codified at [NRS 603A.400 to 603A.550](https://www.leg.state.nv.us/NRS/NRS-603A.html). [SB 370 sec. 36](https://archive.leg.state.nv.us/Session/82nd2023/Bills/SB/SB370_EN.pdf) made it effective March 31, 2024.

**Why it covers us:**

- A "regulated entity" (603A.465) is anyone targeting Nevada consumers who "determines the purpose and means of processing, sharing or selling consumer health data". There is no nonprofit or size threshold.
- The exemptions in 603A.490(1)(a)-(n) (HIPAA entities, GLBA, governmental purposes and others) have no nonprofit carve-out.
- "Collect means to buy, rent, access, retain, receive, acquire, infer, derive or otherwise process consumer health data in any manner" (603A.420).
- Screening answers stay in the browser. Letter photos go through our server to Anthropic, and the model may infer health status. Inferred data counts (603A.430(1)(d)).
- Sending images to Anthropic is "sharing": 603A.480 covers "make available, provide access to".

**"We store nothing"** helps with deletion requests. It does not take us out of scope.

**Enforcement.** A violation is a deceptive trade practice under NRS 598.0903 to 598.0999 (603A.550(1)). The law does "not create a private right of action" (603A.550(2)(a)).

We found no AG guidance on SB 370. The guessed AG page redirected to an error. **Unconfirmed.**

**What we must do:**

1. Publish a separate Nevada consumer health data privacy policy with every 603A.495(1)(a)-(k) item. Link it conspicuously from the main site (603A.495(2)).
2. Get consent before collecting, or rely on "necessary to provide a product or service that the consumer ... has requested" (603A.500(1)(b)). For sharing with Anthropic, rely on the same exception (603A.500(2)(b)), or get a consent that is "separate and distinct" from the collection consent. Any consent request must list data categories, purpose, recipients and how to withdraw (603A.500(3)).
3. Sign a processor contract with Anthropic, and with Vercel if it handles images, that sets processing instructions (603A.530(1)) and matches our policy (603A.495(3)(d)).
4. Set up a secure request channel to confirm, list third parties, stop and delete (603A.505). Answer within 45 days (603A.510). Delete within 30 days and tell processors (603A.515). Post an appeal process that gives AG contact details on denial (603A.520). Anthropic's 30-day retention is subject to deletion notices (603A.515(1)(b)).
5. Keep written security policies and limit access (603A.525).
6. Never sell data (603A.535). Don't geofence (603A.540).

**Confidence:** high on scope; medium on whether the exception removes the need for a consent screen.

### Topic 3: General consumer privacy

[NRS 603A.330(1)(a)](https://www.leg.state.nv.us/NRS/NRS-603A.html) defines an operator as one who "Owns or operates an Internet website or online service for commercial purposes" and collects and maintains covered information. 603A.330(2)(d) excludes a person who does not collect, maintain or sell covered information. A "consumer" seeks goods or services "by purchase or lease" (603A.310). Consumer health data is carved out (603A.338(6)). The AG enforces with up to $5,000 per violation and no private right of action (603A.360). A 30-day cure applies to a first notice failure (603A.348).

**What we must do:** nothing required if the lawyer agrees. Make sure our privacy notice covers the 603A.340(1)(a)-(e) items: data categories, third parties, review process, how changes are announced, whether third parties track users across sites, and the effective date.

### Topic 4: Data breach notification

- "Data collector" (603A.030) covers any "business entity or association" that "handles, collects, disseminates or otherwise deals with nonpublic personal information". It is not limited to for-profits or to storage.
- "A medical identification number or a health insurance identification number" plus a name is personal information when unencrypted (603A.040(1)(d)).
- A breach is "unauthorized acquisition of computerized data that materially compromises" personal information "maintained by the data collector" (603A.020). "Maintained" is the hook for the no-storage argument.
- Anthropic may keep data up to 30 days.

**What we must do:**

1. Keep "reasonable security measures" (603A.210(1)): encrypt in transit, keep no logs of image content.
2. Put a security clause in the Anthropic and Vercel contracts (603A.210(3)).
3. Write a breach plan. Notify affected Nevada residents "in the most expedient time possible". Above 1,000 people, notify the nationwide credit bureaus (603A.220(1), (6)).
4. We keep no contact details, so plan for substitute notice: website posting plus statewide media (603A.220(4)(c)).

### Topic 5: AI-specific laws

[AB 406 (2025)](https://archive.leg.state.nv.us/Session/83rd2025/Bills/AB/AB406_EN.pdf), sec. 7 (new section in NRS ch. 433) and sec. 8 (NRS ch. 629). We did not check the NRS section numbers; we cite the enrolled bill.

- We operate an AI system available in Nevada, so we are an "artificial intelligence provider".
- Sec. 7 bans saying, or programming the AI to say, that it can provide "professional mental or behavioral health care", or calling it a "counselor", "therapist" or "doctor". Sec. 7(2) bans an AI "specifically programmed" to provide such care.
- Sec. 7(5): a violator "is subject to a civil penalty not to exceed $15,000 per violation."
- Sec. 7(6)(a) allows self-help materials that don't claim to offer such care.

We found no general Nevada chatbot or AI disclosure law. That is a gap in the search, not a confirmed absence.

**What we must do:**

- Never call the reader a "counselor", "therapist" or "doctor", in English or Spanish ("consejero" is risky).
- Add a guardrail so the model gives no mental health advice or crisis counseling.
- Point mental health questions to a licensed provider, or to 988 in a crisis.

### Topic 6: Medicaid and benefits assistance

[NRS 695J](https://www.leg.state.nv.us/NRS/NRS-695J.html) covers people "engaged in the business of facilitating enrollment in qualified health plans offered by the Exchange" (Nevada Health Link). 695J.280(1) requires a certificate. "Navigator" borrows the federal definition (695J.060). We don't enroll anyone. We did not research Nevada Medicaid's own assister or community-partner rules. See [federal.md](federal.md#topic-6-medicaid-and-benefits-assistance) for CMS rules.

**What we must do:** never call ourselves a "navigator", "assister" or "enrollment facilitator". If we add "if you lose Medicaid, go to Nevada Health Link", link the official site and don't help pick plans. Never take insurer money (695J.210(2)(b)).

### Topic 7: Government affiliation

[NRS 598.0915(3)](https://www.leg.state.nv.us/NRS/NRS-598.html) makes it deceptive to knowingly make "a false representation as to affiliation, connection, association with or certification by another person". The 598.0915 items apply "in the course of his or her business or occupation", and several need goods or services "for sale or lease". A free nonprofit may fall partly outside. We found no Nevada statute requiring a specific "not affiliated" disclaimer.

[Web Announcement 3661](https://medicaid.nv.gov/Downloads/provider/web_announcement_3661_20250701.pdf) says SB 494 (2025) let the Division of Health Care Financing and Policy "officially go by its common name Nevada Medicaid". [NRS 422.009 and 422.041](https://www.leg.state.nv.us/NRS/NRS-422.html) name the Nevada Health Authority and its Medicaid Division. We did not open SB 494 or check a state trademark registry. **Unconfirmed.**

**What we must do:**

- On every page and result: "Coverage Keeper is run by [nonprofit]. We are not part of Nevada Medicaid, the Nevada Health Authority or the State of Nevada."
- No state logos or seals.
- Use the current names.
- Copy the state's own disclaimer style. Its guide says "This is not a determination or an application."

### Topic 8: Immigration consultant laws

Nevada folds immigration help into [NRS 240A](https://www.leg.state.nv.us/NRS/NRS-240A.html). Immigration filings are a "legal matter" (240A.040(2)).

- A document preparation service acts "For compensation and at the direction of a client" (240A.030(1)(a)). We are free.
- 240A.030(3)(k) excludes "A person who provides legal forms or computer programs that enable another person to create legal documents."
- The free-nonprofit exemption (240A.030(3)(e)) covers only a nonprofit formed under title 7 of NRS that provides legal services. It may not fit us, and we don't describe ourselves as giving legal services.
- 240A.240(1)(c) and (g) ban certain terms and legal advice. [NRS 240.085(2)](https://www.leg.state.nv.us/NRS/NRS-240.html) bars non-attorney notaries from "notario, notario publico, licenciado". We have no notaries.

**What we must do:**

- For non-citizen letters, explain only what the letter says and who to call.
- Don't advise on immigration status, forms or strategy. Refer people to an attorney or a DOJ-accredited representative.
- Never describe ourselves as "notario", "notario público", "licenciado", "legal aid", "legal services", "paralegal" or "lawyer/abogado", in either language.

### Topic 9: Accessibility

[NRS 651.050(2)](https://www.leg.state.nv.us/NRS/NRS-651.html) defines an "online establishment" as "a business, whether or not conducted for profit", that offers goods or services in Nevada online and has no physical location open to the public. 651.050(3)(p) makes it a place of public accommodation. 651.070 bars disability discrimination there. 651.090 gives a private action for damages, injunctions and attorney fees.

The 2025 change to 651.050 came from [AB 266](https://archive.leg.state.nv.us/Session/83rd2025/Bills/AB/AB266_EN.pdf), a breastfeeding bill. The online-establishment wording predates it (NRS history shows 2021). We did not open the 2021 bill. **Unconfirmed** as to origin; the term is current law either way.

**What we must do:** meet WCAG 2.1 AA (or 2.2), since the statute names no standard. Test with screen readers and keyboard-only use, including photo upload. Post an accessibility statement with a way to report barriers.

**Confidence:** high that we are an online establishment; the required technical standard is unclear.

### Topic 11: Consumer protection

- Privacy and accuracy claims describe the "characteristics" (598.0915(5)) or "quality" (598.0915(7)) of our service ([NRS 598](https://www.leg.state.nv.us/NRS/NRS-598.html)).
- Not disclosing Anthropic's 30-day retention could be failing "to disclose a material fact" (598.0923(1)(b)).
- Many 598.0915 items need a sale or lease. [603A.550](https://www.leg.state.nv.us/NRS/NRS-603A.html) makes any health data violation a deceptive trade practice regardless.

**What we must do:**

- Say "we don't save your letter, but our AI provider Anthropic may keep it up to 30 days" until ZDR is settled.
- Say the summary can be wrong. Tell people to check the letter and call the program.
- Keep `nv.json` facts tied to official pages, with dates.

### Topic 12: Children

[NRS 603A](https://www.leg.state.nv.us/NRS/NRS-603A.html) has no child-specific consent rule. The tool targets adults 19 to 64. Teens could still upload a letter, and Topic 2 covers their data. We did not search 2025 Nevada bills on minors online.

**What we must do:** say the site is for adults. Follow COPPA ([federal.md](federal.md#topic-12-children)). Collect no age beyond the "under 19" screening answer, which stays in the browser.

### Topic 13: Charitable solicitation

[NRS 82A.100(1)](https://www.leg.state.nv.us/NRS/NRS-082A.html) bars soliciting contributions in Nevada unless registered with the Secretary of State. "Solicit" includes requests "from a location outside of this State to persons located in this State" (82A.070). A donate button reaching Nevada users counts. We take no donations today.

**What we must do before taking donations:** register with the Secretary of State or file a declaration of exemption (82A.100, 82A.110(2)). Put our full legal name, a physical address and a phone number or website on every solicitation (82A.200).

### Topic 14: Other

- **Document preparation, non-immigration ([NRS 240A](https://www.leg.state.nv.us/NRS/NRS-240A.html)), likely does not apply.** A Medicaid renewal or exemption may be a "legal matter" (240A.040(3)), but we charge nothing and fit the software exemption (240A.030(3)(k)). Registration (240A.100) is for paid services. Stay free, don't fill out or submit forms, and re-check if we or partners ever charge.
- **Doctor note ([NRS 630.020](https://www.leg.state.nv.us/NRS/NRS-630.html)), likely does not apply.** Practicing medicine means "To diagnose, treat, correct, prevent or prescribe". The template only asks a doctor whether they can write a statement. The state's page lists a "Medically Frail Definition". The note must not state or suggest a diagnosis or tell the doctor what to certify. Label it a request and link the state's medically frail definition.
- **Agency names, applies.** Since July 1, 2025, Nevada Medicaid sits within the Nevada Health Authority ([NRS 422.009, 422.041](https://www.leg.state.nv.us/NRS/NRS-422.html); [Announcement 3661](https://medicaid.nv.gov/Downloads/provider/web_announcement_3661_20250701.pdf)). Eligibility moved from DWSS to the Authority. The state's [get-help page](https://www.nevadamedicaid.nv.gov/WorkRequirements/get-help/) refers to the "Division of Social Services". Use "Nevada Medicaid (Nevada Health Authority)". Don't say "DHCFP" or "DWSS" in new copy unless quoting a letter.

### nv.json check

We compared `data/rules/nv.json` with the official pages on 2026-11-08.

| Field            | Value in file                                                                              | What the official page shows                                                                                                                                                                                                                       | Result                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `program`        | Nevada Medicaid                                                                            | Site and Announcement 3661 use "Nevada Medicaid"                                                                                                                                                                                                   | OK                                                                                                          |
| `agency`         | Nevada Health Authority                                                                    | NRS 422.009; Announcement 3661                                                                                                                                                                                                                     | OK                                                                                                          |
| `source_url`     | [DoesThisApplytoMe](https://www.nevadamedicaid.nv.gov/WorkRequirements/DoesThisApplytoMe/) | Loads                                                                                                                                                                                                                                              | OK                                                                                                          |
| `source_updated` | 2026-10-14                                                                                 | Footer: "Last updated 10/14/2026"                                                                                                                                                                                                                  | OK                                                                                                          |
| `contact.phone`  | 702-631-3310                                                                               | Not on the cited page. It appears on the [Work Requirements page](https://www.nevadamedicaid.nv.gov/WorkRequirements/) and the [get-help page](https://www.nevadamedicaid.nv.gov/WorkRequirements/get-help/) with 775-824-7410 as a second number. | **Fix the citation.** Point `contact` at the get-help page. Consider adding 775-824-7410 (northern Nevada). |
| `applies_to`     | 19-64 expansion group, next renewal in 2027                                                | Landing page and cited page agree                                                                                                                                                                                                                  | OK                                                                                                          |
| `ways_to_meet`   | 80 hours; $580 income; part-time school; seasonal $580 average                             | [New Requirements page](https://www.nevadamedicaid.nv.gov/WorkRequirements/new-requirements/) agrees                                                                                                                                               | OK (source is that page, not `source_url`)                                                                  |
| Exemptions (12)  | under_19 through medical_travel                                                            | All 12 match the cited page                                                                                                                                                                                                                        | OK                                                                                                          |

Notes: the page calls inpatient stays and medical travel "Temporary Hardships" and says you may need to tell the state about them. Consider adding that hint. The state's guide says "This is not a determination or an application", which is worth copying in spirit.

### Start-point corrections

- **Consumer health data law:** codified at NRS 603A.400 to 603A.550, effective March 31, 2024.
- **NRS 603A.340:** right section, but likely does not apply (Topic 3).
- **NRS 240A:** also Nevada's immigration-consultant law (240A.040(2)).
- **NRS 7.285:** a crime with State Bar injunction power; no definition in the statute or rules.
- **Breach law:** definitions at 603A.020 to 603A.040.
- **NRS 651.050:** the 2025 amendment was AB 266 (breastfeeding). The online-establishment wording is older.
- **Agency names:** DHCFP is now "Nevada Medicaid", the Medicaid Division of the Nevada Health Authority. DWSS is now the "Division of Social Services" in NRS 422.

## Questions for a lawyer

1. Is our nonprofit a "regulated entity" under NRS 603A.465 even though we keep nothing and only pass images to Anthropic?
2. Does "necessary to provide a product or service that the consumer ... has requested" (603A.500(1)(b), (2)(b)) cover sending letter images to Anthropic, or do we need a separate Nevada sharing consent?
3. Is Anthropic a "processor" (603A.460) under its API terms? Do those terms satisfy 603A.530(1), or do we need an addendum? Does its 30-day retention trigger deletion-notice duties (603A.515)?
4. Is a pass-through relay that keeps no copy a data collector that "owns or licenses" or "maintains" personal information under NRS 603A.220 and 603A.020?
5. Does a free nonprofit tool act in "business or occupation" and offer services "for sale or lease" under NRS 598.0915?
6. Under Nevada case law, is explaining a Medicaid letter and asking the state's yes/no questions "legal information" outside NRS 7.285?
7. Does our free tool fit NRS 240A.030(3)(k), so that 240A never applies, even for non-citizen eligibility letters?
8. Does AB 406 sec. 7 reach a letter-reading AI that asks about mental health only to screen exemptions?
9. What accessibility standard would a Nevada court apply to an "online establishment" under NRS 651.070?
10. Is a "not affiliated with the State of Nevada" line enough when we use "Nevada Medicaid" and official phone numbers?
11. Our privacy notice says "we don't sell or share your information". Is that accurate in Nevada, where 603A.480 counts making data available to Anthropic as "sharing"?

## Sources

All retrieved 2026-11-08.

- NRS ch. 603A: https://www.leg.state.nv.us/NRS/NRS-603A.html
- NRS ch. 240A: https://www.leg.state.nv.us/NRS/NRS-240A.html
- NRS ch. 240 (240.085): https://www.leg.state.nv.us/NRS/NRS-240.html
- NRS ch. 7 (7.285): https://www.leg.state.nv.us/NRS/NRS-007.html
- NRS ch. 598: https://www.leg.state.nv.us/NRS/NRS-598.html
- NRS ch. 695J: https://www.leg.state.nv.us/NRS/NRS-695J.html
- NRS ch. 630 (630.020): https://www.leg.state.nv.us/NRS/NRS-630.html
- NRS ch. 82A: https://www.leg.state.nv.us/NRS/NRS-082A.html
- NRS ch. 651: https://www.leg.state.nv.us/NRS/NRS-651.html
- NRS ch. 232 (232.0081): https://www.leg.state.nv.us/NRS/NRS-232.html
- NRS ch. 422: https://www.leg.state.nv.us/NRS/NRS-422.html
- Nevada Supreme Court Rules: https://www.leg.state.nv.us/CourtRules/SCR.html
- SB 370 (2023) enrolled: https://archive.leg.state.nv.us/Session/82nd2023/Bills/SB/SB370_EN.pdf
- AB 406 (2025) enrolled: https://archive.leg.state.nv.us/Session/83rd2025/Bills/AB/AB406_EN.pdf
- AB 266 (2025) enrolled: https://archive.leg.state.nv.us/Session/83rd2025/Bills/AB/AB266_EN.pdf
- Nevada Medicaid Web Announcement 3661: https://medicaid.nv.gov/Downloads/provider/web_announcement_3661_20250701.pdf
- Nevada Medicaid, Does This Apply to Me?: https://www.nevadamedicaid.nv.gov/WorkRequirements/DoesThisApplytoMe/
- Nevada Medicaid, Work Requirements: https://www.nevadamedicaid.nv.gov/WorkRequirements/
- Nevada Medicaid, New Requirements: https://www.nevadamedicaid.nv.gov/WorkRequirements/new-requirements/
- Nevada Medicaid, Get Help: https://www.nevadamedicaid.nv.gov/WorkRequirements/get-help/
- State Bar of Nevada, UPL: https://nvbar.org/for-the-public/unauthorized-practice-of-law/

**Blocked or not opened** (nothing here supports a conclusion)

- Blocked (HTTP 403): https://nvcourts.gov/aoc/programs_and_services/self-help and https://www.nvcourts.gov/self-help. The courts' information-vs-advice line is **Unconfirmed**.
- https://nvbar.org/for-the-public/unlicensed-practice-of-law/ returned 404.
- The guessed AG consumer health data page redirected to an error. AG guidance on SB 370 is **Unconfirmed**.
- Not opened: SB 494 (2025); AB 207 (2021); the State Bar notario flier; Nevada Supreme Court UPL opinions; Nevada Medicaid assister rules; 2025 bills on minors online; the NRS sections AB 406 was codified at.
