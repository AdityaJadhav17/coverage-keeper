This is research for a lawyer to review, not legal advice.

# Federal law and vendor terms

Last reviewed: 2026-11-08. All sources retrieved 2026-11-08.

How we read the sources:

- **CFR:** eCFR text in effect on 2026-11-05, read through the official eCFR versioner API. Links point to the same dated text at `https://www.ecfr.gov/on/2026-11-05/...`.
- **U.S. Code:** uscode.house.gov returned 404 for every section page, and its banner said it was "currently operating in a temporary format". We used the official GPO 2024 edition on govinfo.gov instead. We did not check for amendments after 2024.
- **Anthropic Usage Policy and Vercel Terms:** read directly on 2026-11-08. The Usage Policy version we read takes effect Nov 12, 2026. We did not read the version in force before that date.

## Summary

- **Vercel's Hobby plan blocks launch.** Hobby is for "personal or non-commercial use" only (§4). On Hobby, Vercel may train AI models on content that passes through our functions (§3). §10.3 bars Protected Health Information without Vercel's written approval. The Vercel DPA covers only Pro and Enterprise. We need a paid plan and a signed DPA, and a lawyer should say whether letter images count as PHI under §10.3. See [Topic 14](#topic-14-other).
- **The FTC Health Breach Notification Rule is the biggest open federal question.** It covers nonprofits. Medicaid letter content likely counts as "PHR identifiable health information". Whether a tool that stores nothing is a "personal health record" vendor is for a lawyer. See [Topic 4](#topic-4-data-breach-notification).
- **The Anthropic Usage Policy treats Legal, Public benefits and services, and Legal status and adjudication as high-risk areas.** Those need a qualified human reviewer and an AI disclosure. Exclusions cover general information, explaining a decision a qualified person already made, and fixed rules where the model uses no judgment. A lawyer should confirm we fit the exclusions. We add an AI-use disclosure either way. See [Topic 1](#topic-1-unauthorized-practice-of-law) and [Topic 5](#topic-5-ai-specific-laws).
- **42 U.S.C. 1320b-10 applies.** It covers the words "Medicaid" and "CMS". A disclaimer does not cure a misleading design. See [Topic 7](#topic-7-government-affiliation).
- **"We store nothing" is not exactly true today.** Anthropic keeps API inputs and outputs up to 30 days, Vercel Hobby allows model training, and our server holds the IP address for about a minute. Our privacy wording must match. See [Topic 11](#topic-11-consumer-protection).
- **HIPAA likely does not apply.** We are not a health plan, clearinghouse or billing provider, and we do not act for one. See [Topic 2](#topic-2-health-data-privacy).

## Topics

| #   | Topic                             | Law and citation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Status                | Why (tied to our facts)                                                                                                                                                                                                     | What we must do                                                                                                                                                              | Confidence |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | Unauthorized practice of law      | [Anthropic Usage Policy](https://www.anthropic.com/legal/aup), high-risk areas and Exclusions. No federal UPL statute found (**Unconfirmed**).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | unclear (lawyer)      | Our screening result applies a state list to one person's answers. The Usage Policy excludes general information, explaining a decision already made, and fixed rules with no model judgment. A lawyer must confirm we fit. | Keep screening rules in browser code, not the model. Add an AI-use disclosure. Never tell users what they "should" do legally.                                               | medium     |
| 2   | Health data privacy               | HIPAA, [45 CFR 160.103](https://www.ecfr.gov/on/2026-11-05/title-45/section-160.103)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | likely does not apply | We are not a health plan, clearinghouse or billing provider. We act for the letter's recipient, not for the state agency, so we are not a business associate.                                                               | Never claim "HIPAA compliant". Re-check if a covered-entity partner sends us letters.                                                                                        | high       |
| 3   | General consumer privacy          | No federal statute found (**Unconfirmed**). Vendor terms: [Vercel DPA](https://vercel.com/legal/dpa), [Anthropic DPA](https://www.anthropic.com/legal/data-processing-addendum), [Anthropic Commercial Terms §C](https://www.anthropic.com/legal/commercial-terms)                                                                                                                                                                                                                                                                                                                                                                                                              | likely does not apply | No comprehensive federal privacy law found. The Vercel DPA covers only Pro and Enterprise, so on Hobby we have none. The Anthropic DPA applies through Commercial Terms §C.                                                 | Move to Vercel Pro. Name Anthropic and Vercel as processors in the privacy notice.                                                                                           | medium     |
| 4   | Data breach notification          | FTC Health Breach Notification Rule, [16 CFR Part 318](https://www.ecfr.gov/on/2026-11-05/title-16/part-318); [FTC compliance guide](https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0)                                                                                                                                                                                                                                                                                                                                                                                                                                          | unclear (lawyer)      | The Rule covers nonprofits. Letter content likely counts as covered health information. We keep no record, so we may not be a "personal health record" vendor.                                                              | Disclose Anthropic and Vercel before upload. Turn off Vercel model training. Write a breach plan.                                                                            | low        |
| 5   | AI-specific laws                  | [Anthropic Usage Policy](https://www.anthropic.com/legal/aup), consumer-facing AI disclosure and high-risk rules; [FTC AI enforcement release](https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-announces-crackdown-deceptive-ai-claims-schemes)                                                                                                                                                                                                                                                                                                                                                                                                                 | applies               | The Usage Policy binds us through Commercial Terms §D.2. It requires consumer-facing AI to say it is AI. No federal AI disclosure statute found.                                                                            | Show "Written by AI. It can make mistakes." on every result, in English and Spanish. Keep the eligibility guardrail. Keep the doctor note a fixed template.                  | medium     |
| 6   | Medicaid and benefits assistance  | [42 CFR 435.908](https://www.ecfr.gov/on/2026-11-05/title-42/section-435.908); [45 CFR 155.210](https://www.ecfr.gov/on/2026-11-05/title-45/section-155.210); [45 CFR 155.225](https://www.ecfr.gov/on/2026-11-05/title-45/section-155.225)                                                                                                                                                                                                                                                                                                                                                                                                                                     | likely does not apply | These rules bind states and the groups they certify. We are not certified and we submit nothing.                                                                                                                            | Never call ourselves an assister, navigator or certified application counselor. Stay free.                                                                                   | high       |
| 7   | Government affiliation            | [42 U.S.C. 1320b-10](https://www.govinfo.gov/content/pkg/USCODE-2024-title42/html/USCODE-2024-title42-chap7-subchapXI-partA-sec1320b-10.htm); [18 U.S.C. 709](https://www.govinfo.gov/content/pkg/USCODE-2024-title18/html/USCODE-2024-title18-partI-chap33-sec709.htm)                                                                                                                                                                                                                                                                                                                                                                                                         | applies               | §1320b-10 covers "Medicaid" and "CMS" on websites, and a disclaimer does not cure a false impression. §709 does not apply: its word list has no Medicaid, CMS or HHS terms.                                                 | Use "Medicaid" only to describe. No CMS, HHS or Medicaid logos, seals or `.gov` look-alike design. Keep the "not affiliated" line.                                           | high       |
| 8   | Immigration consultant laws       | [8 CFR 292.1](https://www.ecfr.gov/on/2026-11-05/title-8/section-292.1); [8 CFR 1001.1](https://www.ecfr.gov/on/2026-11-05/title-8/section-1001.1); [8 CFR 1003.102](https://www.ecfr.gov/on/2026-11-05/title-8/section-1003.102)                                                                                                                                                                                                                                                                                                                                                                                                                                               | likely does not apply | These rules cover representation before DHS and EOIR. A state Medicaid letter is not such a matter, and we fill no immigration forms.                                                                                       | Never state a user's immigration status or what to file. Refer to an immigration lawyer or DOJ-accredited representative.                                                    | medium     |
| 9   | Accessibility                     | ADA Title III, [42 U.S.C. 12181](https://www.govinfo.gov/content/pkg/USCODE-2024-title42/html/USCODE-2024-title42-chap126-subchapIII-sec12181.htm), [12182](https://www.govinfo.gov/content/pkg/USCODE-2024-title42/html/USCODE-2024-title42-chap126-subchapIII-sec12182.htm); [DOJ web guidance](https://www.ada.gov/resources/web-guidance/); [28 CFR 35.200](https://www.ecfr.gov/on/2026-11-05/title-28/section-35.200); [29 U.S.C. 794](https://www.govinfo.gov/content/pkg/USCODE-2024-title29/html/USCODE-2024-title29-chap16-subchapV-sec794.htm), [794d](https://www.govinfo.gov/content/pkg/USCODE-2024-title29/html/USCODE-2024-title29-chap16-subchapV-sec794d.htm) | unclear (lawyer)      | The Title III text names physical places. Whether a website-only nonprofit is covered is unsettled. Title II, Section 504 and Section 508 do not apply: we are not a public entity and take no federal funds.               | Meet WCAG 2.1 AA and audit before launch.                                                                                                                                    | medium     |
| 10  | Language access                   | ACA §1557, [42 U.S.C. 18116](https://www.govinfo.gov/content/pkg/USCODE-2024-title42/html/USCODE-2024-title42-chap157-subchapVI-sec18116.htm); [45 CFR 92.2](https://www.ecfr.gov/on/2026-11-05/title-45/section-92.2), [92.4](https://www.ecfr.gov/on/2026-11-05/title-45/section-92.4), [92.201](https://www.ecfr.gov/on/2026-11-05/title-45/section-92.201)                                                                                                                                                                                                                                                                                                                  | does not apply        | §1557 covers recipients of HHS funds. We get none.                                                                                                                                                                          | Get a fluent Spanish review anyway. Re-check before taking any HHS-linked money.                                                                                             | high       |
| 11  | Consumer protection               | FTC Act §5, [15 U.S.C. 45](https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap2-subchapI-sec45.htm), [15 U.S.C. 44](https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap2-subchapI-sec44.htm); [FTC health-data guidance](https://www.ftc.gov/business-guidance/resources/collecting-using-or-sharing-consumer-health-information-look-hipaa-ftc-act-health-breach)                                                                                                                                                                                                                                          | unclear (lawyer)      | The FTC reaches a "corporation" run for profit or for its members. A true charity is likely outside, but that turns on facts. Our "nothing stored" claim is not fully true.                                                 | Reword privacy claims so they are exactly true. Add "AI can make mistakes." Make no accuracy claims we can't back up.                                                        | medium     |
| 12  | Children                          | COPPA, [15 U.S.C. 6502](https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap91-sec6502.htm); [16 CFR 312.2](https://www.ecfr.gov/on/2026-11-05/title-16/section-312.2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | likely does not apply | We aim at adults. A parent uploading a child's letter is an adult giving information, not collection from a child. The nonprofit exclusion depends on Topic 11.                                                             | Keep design adult-oriented. Say the site is for adults. Don't process an upload if we learn the user is under 13.                                                            | medium     |
| 13  | Charitable solicitation           | [IRS, Charitable contributions: written acknowledgments](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | applies               | If we take donations, gifts of $250 or more need a written acknowledgment. State registration is in the state files.                                                                                                        | Before donations: confirm 501(c)(3) status, set up receipts, and don't say "tax-deductible" until IRS recognition is confirmed.                                              | medium     |
| 14  | Other: Vercel and Anthropic terms | [Vercel Terms](https://vercel.com/legal/terms) §3, §4, §10.3; [Vercel DPA](https://vercel.com/legal/dpa); [Anthropic Commercial Terms](https://www.anthropic.com/legal/commercial-terms); [Anthropic Usage Policy](https://www.anthropic.com/legal/aup); Anthropic [retention](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data) and [ZDR](https://privacy.claude.com/en/articles/8956058-i-have-a-zero-data-retention-agreement-with-anthropic-what-products-does-it-apply-to) articles                                                                                                                                             | applies               | These contracts bind us as operator. Hobby is non-commercial only, allows training on our content and has no DPA. §10.3 bars PHI without approval. Anthropic keeps inputs up to 30 days.                                    | Move to a paid Vercel plan, sign the DPA, turn off training. Ask a lawyer whether letter images are PHI under §10.3. State Anthropic retention in the notice. Decide on ZDR. | high       |

## Details

### Topic 1: Unauthorized practice of law

No federal statute governs the practice of law in general. Each state does. We opened no source proving that negative, so treat it as **Unconfirmed**. See the state files for each state's rule.

The federal layer that binds us is the [Anthropic Usage Policy](https://www.anthropic.com/legal/aup) (effective Nov 12, 2026). It names high-risk use cases that require a qualified human in the loop and an AI disclosure. Three touch us:

- **Legal:** advising someone on their legal rights or what to do in a legal matter, or preparing legal documents for them.
- **Public benefits and services:** determining eligibility for, or the amount of, government benefits.
- **Legal status and adjudication.**

The Exclusions cover:

- general information and educational content, including explaining what a law says
- explaining a decision that a qualified person has already made
- applying a fixed rule where the model exercises no judgment about the individual

The letter summary fits the second exclusion: the state already made the decision. The exemption screening fits the third only if its yes/no logic runs as fixed code in the browser and not through the model. Today the screening answers stay in the browser ([privacy notice](privacy-notice.md)). A lawyer should confirm the exclusions fit.

**What we must do:**

1. Keep screening logic deterministic and outside the model.
2. Add an AI-use disclosure on every result, whatever the lawyer decides.
3. Never tell users what they "should" do legally. Keep the "Ask {program}" framing.
4. Check each state's UPL rule (state files).

### Topic 2: Health data privacy

[45 CFR 160.103](https://www.ecfr.gov/on/2026-11-05/title-45/section-160.103) defines a covered entity as "(1) A health plan. (2) A health care clearinghouse." or a provider that bills electronically. We are none of these. A business associate acts "on behalf of" a covered entity. We act for the person holding the letter, not for the state agency.

The [FTC health-data guidance](https://www.ftc.gov/business-guidance/resources/collecting-using-or-sharing-consumer-health-information-look-hipaa-ftc-act-health-breach) (Aug 2024) says the FTC Act reaches firms HIPAA does not. It also warns against claiming to be "HIPAA compliant" when that is untrue. We opened it with a browser fetch after the FTC bot filter returned 404 to a plain download.

**What we must do:** never claim "HIPAA compliant". If a partner that is a clinic or health plan sends letters through us, re-check business-associate status first.

**Confidence:** high with no partners; low once partners exist.

### Topic 3: General consumer privacy

We found no comprehensive federal consumer privacy statute (**Unconfirmed**: we did not open a source proving the negative). FTC Act §5 is the backstop (Topic 11).

Two vendor contracts carry privacy terms:

- The [Vercel DPA](https://vercel.com/legal/dpa) (effective March 31, 2026) "applies to Vercel's Processing of Personal Data as a Processor ... for Customers who are on Enterprise and Pro plans." On Hobby we have no DPA.
- [Anthropic Commercial Terms](https://www.anthropic.com/legal/commercial-terms) §C applies the [Anthropic DPA](https://www.anthropic.com/legal/data-processing-addendum) to API data. §D.1 makes each party comply with applicable privacy laws.

**What we must do:** move to Vercel Pro or Enterprise so the DPA covers us. Name both vendors as processors in the privacy notice.

### Topic 4: Data breach notification

The FTC Health Breach Notification Rule, [16 CFR Part 318](https://www.ecfr.gov/on/2026-11-05/title-16/part-318), as amended in 2024:

- **Who it covers.** §318.1 reaches personal health record (PHR) vendors, PHR related entities and their service providers "irrespective of any jurisdictional tests in the FTC Act". The [FTC compliance guide](https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0) says it covers "both businesses and nonprofits". Being a nonprofit does not exempt us.
- **The data.** "PHR identifiable health information" relates to payment for health care and comes from a health plan or covered provider. Medicaid letters likely qualify. That Medicaid is a "health plan" under 42 U.S.C. 1320d(5) is **Unconfirmed**; we did not open that section.
- **Our own status.** "Covered health care provider" now includes a website that "provides other health-related services or tools". We may fall in it.
- **The open question.** A "personal health record" is an electronic record that can "draw information from multiple sources" and is managed by or for the person. We keep no record. Results and screening answers live only in the browser. A lawyer must say whether a transient summary in the browser is a "record", and whether combining a letter photo with model output draws "from multiple sources".
- **What a breach is.** §318.2 counts "an unauthorized acquisition ... that occurs as a result of a data breach or an unauthorized disclosure". Sending images to Anthropic without telling users, or Vercel training on them, are the risk points.
- **Penalties.** §318.7 treats violations as violations of an FTC trade regulation rule, with civil penalties.

**What we must do:**

1. Get a lawyer's answer on whether we are a PHR vendor.
2. Tell users before upload that images go to Anthropic and through Vercel, so the sharing is authorized.
3. Turn off Vercel model training (Topic 14).
4. Write a short breach-response plan for notice to people, the FTC and, at 500+ residents of a state, the media. We did not open the §318.4 timing rules, so the plan must take them from the regulation.

### Topic 5: AI-specific laws

The [Anthropic Usage Policy](https://www.anthropic.com/legal/aup) says consumer-facing "chatbots or AI agents that communicate directly with external users must disclose to users that they are interacting with AI rather than a human." The disclosure goes at the start of each session or in the product interface. Our reader is not a chat, but its output reaches consumers, so we disclose. The Policy binds us through [Commercial Terms](https://www.anthropic.com/legal/commercial-terms) §D.2.

If any output counts as a high-risk recommendation (Topic 1), the Policy also requires qualified human review before delivery and a notice that AI produced it. The eligibility guardrail keeps us away from the "Public benefits and services" area.

The [FTC press release of Sept 25, 2024](https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-announces-crackdown-deceptive-ai-claims-schemes) quotes the Chair: "Using AI tools to trick, mislead, or defraud people is illegal." The FTC blog post "Keep your AI claims in check" (Feb 2023) returned 404, so its content is **Unconfirmed**.

We found no federal AI disclosure statute. That is a gap in the search, not a confirmed absence.

**What we must do:**

1. Show "This summary was written by AI and may have mistakes" on every result, in English and Spanish.
2. Keep the eligibility guardrail.
3. Keep the doctor-note template fixed text, not model output.

### Topic 6: Medicaid and benefits assistance

- [42 CFR 435.908(c)](https://www.ecfr.gov/on/2026-11-05/title-42/section-435.908) lets a state, "at State option", certify staff and volunteers of state-designated organizations as application assisters. It does not license every helper. §435.908(b) makes the agency allow helpers "of the applicant or beneficiary's choice".
- The payment ban in §435.908(c)(4) binds certified assisters. We are free anyway.
- [45 CFR 155.210](https://www.ecfr.gov/on/2026-11-05/title-45/section-155.210) and [155.225](https://www.ecfr.gov/on/2026-11-05/title-45/section-155.225) cover Marketplace navigators and certified application counselors. We are neither.

**What we must do:** never call ourselves an "assister", "navigator" or "certified application counselor". Submit nothing to an agency for a user. Re-check before charging fees or partnering with a certified assister.

### Topic 7: Government affiliation

[42 U.S.C. 1320b-10](https://www.govinfo.gov/content/pkg/USCODE-2024-title42/html/USCODE-2024-title42-chap7-subchapXI-partA-sec1320b-10.htm) bars any person from using "Medicaid", "Centers for Medicare & Medicaid Services", "CMS", "HHS" and similar words or symbols, "including any Internet or other electronic communication", in a way that could give a false impression of SSA, CMS or HHS approval. §1320b-10(a)(3) judges a violation "without regard to any inclusion ... of a disclaimer of affiliation". We use "Medicaid" on every page.

[18 U.S.C. 709](https://www.govinfo.gov/content/pkg/USCODE-2024-title18/html/USCODE-2024-title18-partI-chap33-sec709.htm) does not apply. Its word list ("national", "Federal", "United States" and banking, loan and housing names) has no Medicaid, CMS or HHS terms. We searched the full text but did not read every clause, so confidence on §709 is medium.

State program names (Apple Health, OHP, Medi-Cal, AHCCCS) are in the state files.

**What we must do:**

1. Use "Medicaid" only to describe the program.
2. No CMS, HHS or Medicaid logos or seals, no Medicare-card look-alikes, no `.gov`-style design.
3. Keep the "not affiliated with any state or CMS" line, and don't rely on it alone.
4. Keep "Federal", "United States" and "National" out of the organization and site name.

### Topic 8: Immigration consultant laws

[8 CFR 1001.1(i)](https://www.ecfr.gov/on/2026-11-05/title-8/section-1001.1) defines practice as "exercising professional judgment to provide legal advice or legal services related to any matter before EOIR." [8 CFR 292.1](https://www.ecfr.gov/on/2026-11-05/title-8/section-292.1) lists who may represent others before DHS. [8 CFR 1003.102](https://www.ecfr.gov/on/2026-11-05/title-8/section-1003.102) disciplines attorneys and accredited representatives. A state Medicaid letter about non-citizen eligibility is not a matter before DHS or EOIR. We prepare no immigration forms.

The Anthropic Usage Policy separately treats legal status as a high-risk area (Topic 1).

We did not open the accredited-representative rules (8 CFR 1292.11 onward).

**What we must do:** never tell users their immigration status or category, or what to file. Refer immigration questions to a licensed attorney or a DOJ-accredited representative. State notario laws are stricter (state files).

### Topic 9: Accessibility

- **ADA Title III (unclear).** [42 U.S.C. 12181(7)](https://www.govinfo.gov/content/pkg/USCODE-2024-title42/html/USCODE-2024-title42-chap126-subchapIII-sec12181.htm) lists public accommodations as physical places. The text does not settle whether a website-only nonprofit is one. The [DOJ web guidance](https://www.ada.gov/resources/web-guidance/) (March 2022) says businesses open to the public must make websites accessible, but also says it has "no legally binding effect".
- **ADA Title II (does not apply now).** [28 CFR 35.200](https://www.ecfr.gov/on/2026-11-05/title-28/section-35.200) binds public entities, including web content they provide "through contractual, licensing, or other arrangements". The current text sets WCAG 2.1 AA from April 26, 2027 for large entities and April 26, 2028 for smaller ones. Why the dates moved from the 2024 rule is **Unconfirmed**. A state partnership could pull us in.
- **Section 504 and 508 (do not apply).** [29 U.S.C. 794](https://www.govinfo.gov/content/pkg/USCODE-2024-title29/html/USCODE-2024-title29-chap16-subchapV-sec794.htm) covers programs with federal funds. [29 U.S.C. 794d](https://www.govinfo.gov/content/pkg/USCODE-2024-title29/html/USCODE-2024-title29-chap16-subchapV-sec794d.htm) binds federal agencies.

**What we must do:** meet WCAG 2.1 AA. Audit image upload, screen-reader output of results, contrast and the Spanish pages before launch. Re-check 504 before any federal grant.

### Topic 11: Consumer protection

[15 U.S.C. 45(a)](https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap2-subchapI-sec45.htm) bans unfair or deceptive acts. [15 U.S.C. 44](https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap2-subchapI-sec44.htm) limits "Corporation" to entities "organized to carry on business for its own profit or that of its members". A true charity is likely outside FTC §5, but that depends on how the entity is organized. State deception laws may apply anyway (state files).

Claims at risk:

- **"Nothing stored by us."** True of our database. But Anthropic keeps API inputs and outputs up to 30 days, and up to 2 years if flagged (Topic 14). Vercel Hobby allows training on our content. Our server holds the IP address about a minute.
- **Accuracy.** AI summaries can be wrong. The Spanish has not had a fluent review.

The [FTC health-data guidance](https://www.ftc.gov/business-guidance/resources/collecting-using-or-sharing-consumer-health-information-look-hipaa-ftc-act-health-breach) says statements about health data must match practice.

**What we must do:**

1. Reword "we don't store" to something exactly true, for example: "We don't save your letter. To read it, we send it to our AI provider, Anthropic, which may keep it for up to 30 days."
2. Add "AI can make mistakes. Check the letter itself and call {program}."
3. Make no claims like "accurate" or "never wrong" without test evidence.
4. Never claim "HIPAA compliant".

### Topic 12: Children

COPPA ([15 U.S.C. 6502](https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap91-sec6502.htm)) binds operators of sites directed to children, or with actual knowledge of collecting from a child under 13. [16 CFR 312.2](https://www.ecfr.gov/on/2026-11-05/title-16/section-312.2) excludes "any nonprofit entity that would otherwise be exempt from coverage under Section 5 of the Federal Trade Commission Act". That ties back to Topic 11. "Personal information" includes an IP address and a photograph.

We did not open later COPPA amendments or the Anthropic guidance on products serving minors.

**What we must do:** keep design and outreach adult-oriented. Say in the privacy notice that the site is for adults (the draft already does). If we learn a user is under 13, don't process their upload.

### Topic 13: Charitable solicitation

We take no donations today. Once we do, the [IRS acknowledgment rules](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments) require a written acknowledgment for gifts of $250 or more. We did not open 26 U.S.C. 170(f)(8) or the Form 990 pages.

**What we must do before taking donations:** confirm 501(c)(3) status (entity name still TBD), set up automatic receipts, register in each state that requires it (state files), and don't call gifts "tax-deductible" until IRS recognition is confirmed.

### Topic 14: Other

**Vercel Terms** ([vercel.com/legal/terms](https://vercel.com/legal/terms), last updated Oct 19, 2026):

- **§4:** the Hobby plan is for personal or non-commercial use only. Vercel may remove Hobby deployments without notice.
- **§3:** on Hobby or a trial Pro plan, Vercel may use "Your Content" to train AI models and share it with third parties for their training. Data we "transmit" counts as Your Content, and letter images pass through our Vercel functions. Paid Pro has training off by default.
- **§10.3:** "You shall not use the Services to host any Protected Health Information or information that is subject to the Health Insurance Portability and Accountability Act (HIPAA), unless you first obtain Vercel's prior written approval." HIPAA likely does not bind us (Topic 2), but the letters come from a HIPAA health plan. A lawyer should say whether §10.3 reaches them.
- **DPA:** covers Pro and Enterprise only (Topic 3).

**Anthropic Commercial Terms and DPA** ([commercial terms](https://www.anthropic.com/legal/commercial-terms), effective Jun 17, 2025; [DPA](https://www.anthropic.com/legal/data-processing-addendum), effective Feb 24, 2025):

- §A.1 allows us to power products for our own end users.
- §D.1 makes us comply with applicable privacy laws.
- §D.2 brings in the Usage Policy.
- §C applies the DPA to API data.

**Anthropic Usage Policy** ([aup](https://www.anthropic.com/legal/aup), effective Nov 12, 2026): see Topics 1 and 5.

**Anthropic retention and ZDR:**

- [Retention article](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data) (dated July 1, 2026): API inputs and outputs are deleted "within 30 days of receipt or generation". Flagged content may be kept up to 2 years and classifier scores up to 7 years.
- [ZDR article](https://privacy.claude.com/en/articles/8956058-i-have-a-zero-data-retention-agreement-with-anthropic-what-products-does-it-apply-to): ZDR is "subject to Anthropic's approval". Anthropic still keeps safety classifier results under ZDR.
- [Covered Models article](https://privacy.claude.com/en/articles/15425996-data-retention-practices-for-covered-models): some model classes keep prompts and outputs 30 days on every platform, even under ZDR. The article does not say whether `claude-opus-5-5` is one.
- [BAA article](https://privacy.claude.com/en/articles/8114513-business-associate-agreements-baa-for-commercial-customers): a BAA exists for HIPAA-ready services. We don't need one if HIPAA doesn't apply.

**What we must do:**

1. Move to a paid Vercel plan before launch, confirm model training is off, and sign the DPA.
2. Ask a lawyer whether §10.3 reaches letter images. If unsure, ask Vercel for written approval.
3. Sign up with Anthropic as an organization, since the terms bind the entity.
4. State the 30-day retention and the flagged-content exception in the privacy notice.
5. If we get ZDR, describe it accurately: classifier results are still kept.
6. Confirm with Anthropic whether our model is a Covered Model.

## Questions for a lawyer

1. **HBNR scope.** Is Coverage Keeper a "vendor of personal health records" or a "PHR related entity" under 16 CFR 318.2, given that it stores nothing and results live only in the browser?
2. **HBNR, our own status.** Is our website a "covered health care provider" because it offers "health-related services or tools"? If so, are our summaries "PHR identifiable health information"?
3. **HBNR, authorization.** If we tell users before upload that images go to Anthropic and through Vercel, is routine processing an authorized disclosure and not a breach?
4. **FTC jurisdiction.** Under 15 U.S.C. 44, is our nonprofit outside FTC §5? This also decides the COPPA nonprofit exclusion.
5. **Privacy wording.** Is "We don't save your letter; our AI provider may keep it up to 30 days" enough to avoid deception, or must the main claim also mention the in-memory IP address and Vercel analytics?
6. **Vercel §10.3.** Does the bar on "information that is subject to HIPAA" cover Medicaid letters users upload, when we are not a covered entity or business associate? Should we get Vercel's written approval anyway?
7. **Vercel §4.** Is a free nonprofit public service "personal or non-commercial use"? (We plan to move to Pro regardless.)
8. **42 U.S.C. 1320b-10.** Does our descriptive use of "Medicaid" in headings and Spanish text risk a false impression of CMS or HHS approval, given that disclaimers don't cure it?
9. **ADA Title III.** Is a website-only nonprofit a "public accommodation" in the Ninth Circuit, which covers all five of our states?
10. **Anthropic Usage Policy.** Does the screening result ("This may apply to you. Ask {program} about it.") fall under the fixed-rule exclusion? Does the letter summary fall under the "decision already made" exclusion? Does anything we do count as "determining eligibility" under "Public benefits and services"?
11. **Doctor note.** Is a fixed, non-AI template that asks a doctor whether they can write a statement outside the Usage Policy's high-risk areas?
12. **Immigration.** If we never characterize a user's immigration status, does explaining a non-citizen Medicaid notice stay outside "practice" and "preparation" in 8 CFR 1001.1?
13. **Federal funds.** If a partner passes HHS money to us, do Section 504 and Section 1557 attach, including §92.201's free, accurate language-help duty?

## Sources

All retrieved 2026-11-08.

**eCFR, current through 2026-11-05 (versioner API)**

- 45 CFR 160.103: https://www.ecfr.gov/on/2026-11-05/title-45/section-160.103
- 16 CFR Part 318: https://www.ecfr.gov/on/2026-11-05/title-16/part-318
- 16 CFR 312.2: https://www.ecfr.gov/on/2026-11-05/title-16/section-312.2
- 42 CFR 435.908: https://www.ecfr.gov/on/2026-11-05/title-42/section-435.908
- 45 CFR 155.210: https://www.ecfr.gov/on/2026-11-05/title-45/section-155.210
- 45 CFR 155.225: https://www.ecfr.gov/on/2026-11-05/title-45/section-155.225
- 45 CFR 92.2: https://www.ecfr.gov/on/2026-11-05/title-45/section-92.2
- 45 CFR 92.4: https://www.ecfr.gov/on/2026-11-05/title-45/section-92.4
- 45 CFR 92.201: https://www.ecfr.gov/on/2026-11-05/title-45/section-92.201
- 8 CFR 292.1: https://www.ecfr.gov/on/2026-11-05/title-8/section-292.1
- 8 CFR 1292.1: https://www.ecfr.gov/on/2026-11-05/title-8/section-1292.1
- 8 CFR 1001.1: https://www.ecfr.gov/on/2026-11-05/title-8/section-1001.1
- 8 CFR 1003.102: https://www.ecfr.gov/on/2026-11-05/title-8/section-1003.102
- 28 CFR 35.200: https://www.ecfr.gov/on/2026-11-05/title-28/section-35.200

**U.S. Code, GPO 2024 edition**

- 15 U.S.C. 44: https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap2-subchapI-sec44.htm
- 15 U.S.C. 45: https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap2-subchapI-sec45.htm
- 15 U.S.C. 6502: https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap91-sec6502.htm
- 18 U.S.C. 709: https://www.govinfo.gov/content/pkg/USCODE-2024-title18/html/USCODE-2024-title18-partI-chap33-sec709.htm
- 42 U.S.C. 1320b-10: https://www.govinfo.gov/content/pkg/USCODE-2024-title42/html/USCODE-2024-title42-chap7-subchapXI-partA-sec1320b-10.htm
- 42 U.S.C. 18116: https://www.govinfo.gov/content/pkg/USCODE-2024-title42/html/USCODE-2024-title42-chap157-subchapVI-sec18116.htm
- 29 U.S.C. 794: https://www.govinfo.gov/content/pkg/USCODE-2024-title29/html/USCODE-2024-title29-chap16-subchapV-sec794.htm
- 29 U.S.C. 794d: https://www.govinfo.gov/content/pkg/USCODE-2024-title29/html/USCODE-2024-title29-chap16-subchapV-sec794d.htm
- 42 U.S.C. 12181: https://www.govinfo.gov/content/pkg/USCODE-2024-title42/html/USCODE-2024-title42-chap126-subchapIII-sec12181.htm
- 42 U.S.C. 12182: https://www.govinfo.gov/content/pkg/USCODE-2024-title42/html/USCODE-2024-title42-chap126-subchapIII-sec12182.htm

**Agency guidance**

- DOJ, Guidance on Web Accessibility and the ADA (Mar 18, 2022): https://www.ada.gov/resources/web-guidance/
- FTC, Collecting, Using, or Sharing Consumer Health Information? (Aug 2024): https://www.ftc.gov/business-guidance/resources/collecting-using-or-sharing-consumer-health-information-look-hipaa-ftc-act-health-breach
- FTC, Complying with FTC's Health Breach Notification Rule (Jul 2024): https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0
- FTC press release, FTC Announces Crackdown on Deceptive AI Claims and Schemes (Sept 25, 2024): https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-announces-crackdown-deceptive-ai-claims-schemes
- IRS, Charitable contributions: Written acknowledgments (reviewed 28-Jun-2026): https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments

**Vendor terms**

- Anthropic Usage Policy (effective Nov 12, 2026): https://www.anthropic.com/legal/aup
- Anthropic Commercial Terms (effective Jun 17, 2025): https://www.anthropic.com/legal/commercial-terms
- Anthropic DPA (effective Feb 24, 2025): https://www.anthropic.com/legal/data-processing-addendum
- Anthropic data retention (July 1, 2026): https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data
- Anthropic ZDR: https://privacy.claude.com/en/articles/8956058-i-have-a-zero-data-retention-agreement-with-anthropic-what-products-does-it-apply-to
- Anthropic Covered Models: https://privacy.claude.com/en/articles/15425996-data-retention-practices-for-covered-models
- Anthropic BAA: https://privacy.claude.com/en/articles/8114513-business-associate-agreements-baa-for-commercial-customers
- Vercel Terms (last updated Oct 19, 2026): https://vercel.com/legal/terms
- Vercel DPA (last updated Mar 17, 2026; effective Mar 31, 2026): https://vercel.com/legal/dpa

**Blocked or not opened** (nothing here supports a conclusion)

- uscode.house.gov: every section returned 404. We used govinfo instead.
- FTC, "Keep your AI claims in check" (Feb 2023), https://www.ftc.gov/business-guidance/blog/2023/02/keep-your-ai-claims-check: 404. **Unconfirmed.**
- Not opened: 42 U.S.C. 1320d(5); 16 CFR 318.4 to 318.6; 28 CFR Part 36; the rule that moved the 28 CFR 35.200 dates; 26 U.S.C. 170(f)(8); 8 CFR 1292.11 onward; the Usage Policy version in force before Nov 12, 2026; Anthropic guidance for products serving minors.
