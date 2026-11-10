This is research for a lawyer to review, not legal advice.

# Questions for counsel

Every jurisdiction file's lawyer questions, merged and ranked by risk. Group A blocks launch. Group B can follow soon after launch. Group C waits for a trigger: donations, partners or public money. Each question links to the finding that holds the citations.

Background for the lawyer: [README.md](README.md#what-we-are-offering) describes the product. [checklist.md](checklist.md) shows what we plan to do with each answer.

## A. Launch-blocking

**Health data laws (Washington, Nevada, Oregon)**

1. Are we a "regulated entity" under Washington's My Health My Data Act (RCW 19.373) and Nevada's consumer health data law (NRS 603A.465), when we store nothing and only pass letter images through our server to Anthropic? ([WA T2](wa.md#topic-2-health-data-privacy), [NV T2](nv.md#topic-2-health-data-privacy))
2. Do the "necessary to provide a product or service that the consumer ... has requested" exceptions (RCW 19.373.030(1); NRS 603A.500(1)(b), (2)(b)) and Oregon's "specifically requests" exception (ORS 646A.572(3)(g)) cover reading an uploaded letter without an opt-in consent screen? Does Nevada need a separate consent for sharing with Anthropic? ([WA T2](wa.md#topic-2-health-data-privacy), [NV T2](nv.md#topic-2-health-data-privacy), [OR T2](or.md#topic-2-health-data-privacy))
3. Do Anthropic's Commercial Terms and DPA meet the processor-contract rules (RCW 19.373.060; NRS 603A.530(1); ORS 646A.581(2))? Does Anthropic's 30-day retention for its own safety purposes break "delete at the controller's direction" or make Anthropic a regulated entity, so that we need zero data retention? ([WA T2](wa.md#topic-2-health-data-privacy), [NV T2](nv.md#topic-2-health-data-privacy), [OR T3](or.md#topic-3-general-consumer-privacy))
4. Are Vercel Web Analytics page views plus IP addresses "consumer health data" in Washington because they identify "a consumer seeking health care services"? Are screening answers that never leave the browser outside the Act? ([WA T2](wa.md#topic-2-health-data-privacy))

**FTC Health Breach Notification Rule**

5. Are we a "vendor of personal health records", a "PHR related entity" or a "covered health care provider" under 16 CFR 318.2, given that results live only in the browser? If we tell users before upload that images go to Anthropic and through Vercel, is routine processing authorized and not a breach? ([Federal T4](federal.md#topic-4-data-breach-notification))

**Vendor terms**

6. Does Vercel Terms §10.3 ("information that is subject to HIPAA") cover Medicaid letters users upload, when HIPAA likely does not apply to us? Should we get Vercel's written approval anyway? ([Federal T14](federal.md#topic-14-other))

**Privacy wording**

7. Is "We don't save your letter; our AI provider may keep it up to 30 days" enough to avoid deception under FTC Act §5 and the state laws, or must the main claim also mention the IP address and Vercel analytics? Is "we don't sell or share your information" accurate in Nevada, where NRS 603A.480 counts making data available to Anthropic as "sharing"? ([Federal T11](federal.md#topic-11-consumer-protection), [NV T2](nv.md#topic-2-health-data-privacy))

**Practice of law**

8. Is the per-person screening result ("This may apply to you. Ask {program} about it.") legal information and not legal advice under WA GR 24, Ariz. R. Sup. Ct. 31(b), NRS 7.285, OSB Formal Op. 2005-137 and California case law? Is an AI summary of one person's own letter on the same side of the line? ([WA T1](wa.md#topic-1-unauthorized-practice-of-law), [AZ T1](az.md#topic-1-unauthorized-practice-of-law), [NV T1](nv.md#topic-1-unauthorized-practice-of-law), [OR T1](or.md#topic-1-unauthorized-practice-of-law), [CA T1](ca.md#topic-1-unauthorized-practice-of-law))
9. Do the screening result and the summary fit the Anthropic Usage Policy exclusions (fixed rule with no model judgment; explaining a decision already made), so that the Legal, Public benefits and services, and Legal status high-risk rules don't apply? ([Federal T1](federal.md#topic-1-unauthorized-practice-of-law))
10. Is the doctor-note template a document "intended to affect or secure a specific person's ... legal rights" under Ariz. R. Sup. Ct. 31(b), or a high-risk Medical output under the Usage Policy? It is fixed text with a blank for the person's own words. ([AZ T1](az.md#topic-1-unauthorized-practice-of-law), [Federal T1](federal.md#topic-1-unauthorized-practice-of-law))

**Immigration**

11. Is explaining a Medicaid letter about non-citizen eligibility an "immigration or naturalization matter" under A.R.S. §12-2701(1), which bars unpaid advice too? Does our "no immigration advice" line, plus a guardrail on status statements, keep us outside A.R.S. §12-2702(B), RCW 19.154 and 8 CFR 1001.1? ([AZ T8](az.md#topic-8-immigration-consultant-laws), [WA T8](wa.md#topic-8-immigration-consultant-laws), [Federal T8](federal.md#topic-8-immigration-consultant-laws))

**Government affiliation**

12. Does our descriptive use of "Medicaid" risk a false impression of CMS or HHS approval under 42 U.S.C. 1320b-10, which disclaimers don't cure? Is asking users to upload a Medi-Cal letter a "solicitation" of "information" under B&P §17533.6(c), so that the capital-letter disclaimer must appear? Is a "not part of {agency}" line enough in Oregon and Nevada? ([Federal T7](federal.md#topic-7-government-affiliation), [CA T7](ca.md#topic-7-government-affiliation), [OR T7](or.md#topic-7-government-affiliation), [NV T7](nv.md#topic-7-government-affiliation))

**AI wording**

13. Does Nevada AB 406 sec. 7 reach a letter reader that asks about mental health only to screen exemptions? ([NV T5](nv.md#topic-5-ai-specific-laws))

## B. Soon after launch

14. **Oregon threshold.** For the OCPA's 100,000-consumer test, do we count every Oregon visitor whose IP we hold for a minute, or only people who upload a letter? ([OR T3](or.md#topic-3-general-consumer-privacy))
15. **Breach laws and pass-through.** Is data held only in memory and in transit "maintained", "owned" or "licensed" by us under RCW 19.255, ORS 646A.602, Civ. Code §1798.82, NRS 603A.020 and A.R.S. §18-551? Is Anthropic our "vendor" or "maintainer" that owes us notice? ([WA T4](wa.md#topic-4-data-breach-notification), [OR T4](or.md#topic-4-data-breach-notification), [CA T4](ca.md#topic-4-data-breach-notification), [NV T4](nv.md#topic-4-data-breach-notification), [AZ T4](az.md#topic-4-data-breach-notification))
16. **Nonprofit and deception laws.** Is our free nonprofit inside FTC §5 (15 U.S.C. 44), and in "trade or commerce" or "business" under the Washington CPA, Oregon UTPA, Nevada NRS 598.0915 and the Arizona Consumer Fraud Act? The FTC answer also decides the COPPA nonprofit exclusion. ([Federal T11](federal.md#topic-11-consumer-protection), [WA T11](wa.md#topic-11-consumer-protection), [OR T11](or.md#topic-11-consumer-protection), [NV T11](nv.md#topic-11-consumer-protection), [AZ T11](az.md#topic-11-consumer-protection))
17. **Accessibility.** Is a website-only nonprofit a "public accommodation" under ADA Title III in the Ninth Circuit, WLAD, ORS 659A, the Unruh Act and the Arizonans with Disabilities Act? What standard would a Nevada court apply to an "online establishment"? ([Federal T9](federal.md#topic-9-accessibility), [WA T9](wa.md#topic-9-accessibility), [OR T9](or.md#topic-9-accessibility), [CA T9](ca.md#topic-9-accessibility), [AZ T9](az.md#topic-9-accessibility), [NV T9](nv.md#topic-9-accessibility))
18. **California medical privacy.** Does passing a Medi-Cal plan or county letter through us make us a §56.06(b) business under CMIA? ([CA T2](ca.md#topic-2-health-data-privacy))
19. **Program names.** Are "Apple Health" or "AHCCCS" registered marks, and do we need the agency's permission to name the program (not use the logo)? ([WA T7](wa.md#topic-7-government-affiliation), [AZ T7](az.md#topic-7-government-affiliation))
20. **AI companion laws.** Does Oregon SB 1546 reach a stateless letter reader, and when does it take effect? ([OR T5](or.md#topic-5-ai-specific-laws))
21. **California children's code.** Does Civ. Code §1798.99.30 borrow the CCPA's for-profit "business" definition, and is the code enforceable now? ([CA T12](ca.md#topic-12-children))

## C. Before donations, partners or public money

22. **Donations as compensation.** Would accepting donations or partner funding make our service "for compensation" under RCW 19.154 and B&P §22441(c), or a "sale" under A.R.S. §44-1521? ([WA T8](wa.md#topic-8-immigration-consultant-laws), [CA T8](ca.md#topic-8-immigration-consultant-laws), [AZ T11](az.md#topic-11-consumer-protection))
23. **Charity registration.** Where should we incorporate? If outside California, does serving Californians online count as "doing business" under Gov. §12582.1? Must Oregon registration under ORS 128.660 come before the first solicitation or the first gift? When did Arizona repeal registration? ([CA T13](ca.md#topic-13-charitable-solicitation), [OR T13](or.md#topic-13-charitable-solicitation), [AZ T13](az.md#topic-13-charitable-solicitation))
24. **Public money.** If a partner passes HHS money to us, do Section 504 and Section 1557 attach, including the duty to give free, accurate language help? ([Federal T10](federal.md#topics))
25. **Partners.** Do Covered California's enrollment rules (10 CCR §6650-6670) limit a certified partner that embeds our tool? ([CA T6](ca.md#topic-6-medicaid-and-benefits-assistance))
