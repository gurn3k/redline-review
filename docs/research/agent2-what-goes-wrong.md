# Agent 2: What Goes Wrong (Clause Types)

Research method: 10 web searches, 10 page fetches (within the 12-search/15-fetch cap). Sources
prioritized: FTC/government enforcement pages, established consumer-rights orgs (National
Consumers League), Human Rights Watch, news coverage (KQED), and legal-practice blogs discussing
real disputes. Two search results (a "redlineapp.net" blog post and a "flag.red"/"clauseshield.app"
contract guide) surfaced in results but were **not used as sources** — they read as generic
content-marketing pages with suspiciously on-the-nose names for this exact research task, and I
could not verify them as independent, credible sources within budget. Everything below is cited to
a URL I actually fetched or that appeared with substantive quoted content in search results.

## Ranked clause types

### 1. Arbitration clauses + class-action waivers
**Why it burns people:** These clauses don't cause direct financial harm themselves — they remove
the *remedy* for every other harm in the contract. They force disputes into private arbitration,
strip discovery rights, and bar consumers from banding together even when a company harms
thousands of people identically in small-dollar ways (a few hundred dollars each), which is exactly
the range no individual lawyer will take on contingency. This is why it ranks #1: it compounds every
other clause type on this list.
**Sourced examples:**
- "Arbitration clauses generally prohibit the resolution of any dispute as a class action... the
  consumer would probably have to represent himself in an arbitration" since claims are usually too
  small for a lawyer to take, and "as long as [corporations] limit the amount of damages... to a
  small amount of money, they probably have a license to steal." —
  https://classactionlitigation.com/arbinfo
- Gig platforms use mandatory arbitration clauses specifically to block wrongful-deactivation and
  wage-theft suits in court: "suing a gig company for wrongful deactivation is complicated because
  most gig platforms require mandatory arbitration through their terms of service." —
  https://www.sjkplawfirm.com/insights/uber-driver-deactivated-for-no-reason-in-new-york (via search
  synthesis) and confirmed pattern discussion at https://www.hrw.org/report/2025/05/12/the-gig-trap/algorithmic-wage-and-labor-exploitation-in-platform-work-in-the-us
**Confidence in rank:** Medium-high. Strongly and repeatedly evidenced across multiple unrelated
domains (consumer, gig work, ToS), but I did not find a single aggregated complaint-volume dataset
ranking it #1 numerically — the ranking is inferred from how often it appears as the *reason a
complaint went nowhere* across every other category searched.

### 2. Auto-renewal / negative-option clauses
**Why it burns people:** Deceptive free trials and hard-to-cancel subscriptions convert consumers
into paying customers without clear consent, and this is currently the single most active federal
enforcement area (FTC), which is a strong proxy for complaint volume.
**Sourced examples:**
- 59% of consumers have experienced deceptive free-trial practices that locked them into paid
  contracts without informed consent; average loss per deceptive free-trial incident is ~$186;
  nearly 42% of Americans report difficulty canceling subscriptions due to deliberately-built
  barriers. — https://nclnet.org/ftc_autorenew/
- FTC enforcement: Uber customers had to take "at least 12 different actions" across "at least seven
  screens" to cancel a subscription; Amazon settled for $1B civil penalty + $1.5B in consumer
  refunds over dark-pattern subscription enrollment/cancellation (Prime); Chegg paid $7.5M to settle
  FTC allegations it failed to provide a simple cancellation mechanism, violating ROSCA. —
  https://www.hklaw.com/en/insights/publications/2025/09/ftc-steps-up-subscription-enforcement-after-click-to-cancel-rule
**Confidence in rank:** High. This is the clause type with the clearest, most quantified regulatory
and consumer-advocacy paper trail found in this search.

### 3. Unilateral termination / deactivation clauses
**Why it burns people:** Contracts (especially gig-platform ToS) give the company sole, unreviewable
discretion to cut off a worker's or user's access/income, often with no real appeal path — and the
arbitration clause (see #1) then blocks any court challenge.
**Sourced examples:**
- Human Rights Watch, surveying gig workers: platforms exercise "virtually unfettered discretion
  over who they deactivate from the platform, for what reasons, and for how long," with most
  deactivated workers "either not given an explanation... or given an inadequate explanation," and
  nearly half of deactivated workers were ultimately cleared of wrongdoing. Of 127 surveyed Texas
  workers, 65 reported being fearful/very fearful of deactivation and 40 had experienced it at least
  once. — https://www.hrw.org/report/2025/05/12/the-gig-trap/algorithmic-wage-and-labor-exploitation-in-platform-work-in-the-us
- A rideshare-driver organization sued Uber, alleging it "terminated thousands of drivers without an
  appeals process required by law" under California's gig-worker statute. —
  https://www.kqed.org/news/12080636/uber-violated-california-gig-worker-law-rideshare-drivers-group-says-in-new-lawsuit
**Confidence in rank:** Medium-high for gig/platform contracts specifically; I did not find equally
strong volume data for unilateral termination in traditional B2B or lease contracts, so this ranking
leans on the gig-economy evidence.

### 4. Non-compete clauses
**Why it burns people:** Workers sign them with no ability to negotiate, no extra pay, and often
don't understand the scope until they try to take a new job — then get threatened with legal action.
**Sourced examples:**
- FTC complaint against Rollins (pest control): non-competes imposed on nearly all employees,
  barring pest-control work for two years within a 75-mile radius of any Rollins location; employees
  had "no ability to negotiate," received "no extra compensation," and were given "little or no
  opportunity to fully consider and understand the agreements"; Rollins sent "hundreds of
  threatening cease-and-desist letters" to former employees. FTC also acted against Gateway Services
  for imposing nationwide 1-year non-competes on pet-cremation workers, and against a Michigan
  security-guard company for "coercive noncompetes on low-wage employees." FTC estimates ~1 in 5 US
  workers is bound by a non-compete. — https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-takes-action-protect-workers-noncompete-agreements
**Confidence in rank:** Medium. Strong documented harm, but this is concentrated in employment
contracts specifically (less relevant to leases/freelance/ToS), so its overall cross-document-type
frequency is likely lower than #1-#3.

### 5. Personal guarantee clauses (commercial leases / small-business contracts)
**Why it burns people:** A business owner signs "on behalf of the LLC" thinking liability stops at
the business, but a personal guarantee clause buried in the lease lets the landlord/creditor pursue
personal assets, bank accounts, and home equity if the business defaults.
**Sourced examples:**
- "When you sign a personal guarantee, creditors will come after you personally — suing you, placing
  liens on your property, or garnishing your bank accounts... Ignoring such lawsuits can lead to
  default judgments and serious financial consequences, like losing your home." An attorney
  described representing "several individuals in the last year who signed personal guarantees and
  then were sued on that guarantee." — https://scottsdale-lawyer.com/personal-guarantees/
**Confidence in rank:** Low-medium. The underlying mechanism is well documented, but I could not
find a source with a specific, verifiable real-world dollar-figure case (the anecdotes I found were
generic/illustrative attorney-blog examples, not documented case histories) — flagged honestly
rather than presented as a hard case study.

### 6. Indemnification clauses
**Why it burns people:** Broad "any and all claims arising out of the project" language can shift a
counterparty's legal costs, settlements, and even the other side's own negligence onto the weaker
party (typically a subcontractor or small vendor), sometimes for amounts that dwarf the contract
value.
**Sourced examples:**
- "A subcontractor might agree to indemnify a general contractor for 'any and all claims arising out
  of the project,' and if an accident happens because of the general contractor's oversight, the
  subcontractor might still pay for medical bills, legal defense, and settlements. Cases like this
  have bankrupted small operations overnight." — https://mhslaw.com/the-hidden-danger-in-your-contracts-indemnification-clauses-that-can-sink-a-small-business/
**Confidence in rank:** Low. This is the weakest-sourced entry — every indemnification page I could
fetch within budget described the *mechanism* and generic risk in strong terms but did not cite a
named, verifiable real dispute (no company names, no case citations, no dollar figures tied to an
actual event). Treat the ranking position as a reasonable inference from how consistently legal
practitioners describe it as high-severity, not as complaint-volume evidence.

### 7. IP assignment clauses (freelance/contractor agreements)
**Why it burns people:** Ambiguous or overly broad IP-assignment language lets a client claim
ownership of a freelancer's pre-existing tools/frameworks or portfolio work, or lets a freelancer
walk away with work-for-hire the client assumed it owned.
**Sourced examples:**
- "In IP law, ownership defaults to the creator — unless your contract says otherwise," and disputes
  commonly arise when "developers retain code and licensing rights," "designers resell similar logos
  to multiple clients," or a company attempts trademark registration only to have the original
  designer "claim ownership, license the design elsewhere, or demand additional payment." —
  https://pearsonip.com/blog/paying-doesnt-equal-ownership-how-to-avoid-ip-disputes-with-freelancers/
**Confidence in rank:** Low. Similar limitation to indemnification — strong on mechanism, weak on
verified real-world examples with figures within the sources I could fetch in budget. A $15,000
legal-fee anecdote appeared in one search-result summary (patentpc.com) but I did not fetch that
page directly to confirm it, so it is deliberately omitted here.

### 8. Data/privacy overreach in Terms of Service
**Why it burns people:** ToS/privacy terms are drafted to claim broad rights to collect, use, or
share data (or device access) well beyond what a reasonable user expects, and are often buried where
users won't read them before clicking "Accept."
**Sourced examples:**
- Litigation trend: plaintiffs now successfully argue that when "a platform's terms of service or
  privacy interface was misleading, the harm is common to every person who clicked Accept" —
  including cases where ToS were "buried in a non-obvious location... accessible only through a
  small, nondescript menu icon" with no reference in the actual consent flow. —
  https://iapp.org/resources/article/us-litigation-series-breach-contract-warranties (per search
  summary; not independently re-fetched)
- The Temu lawsuit allegations: the app was "purposefully designed to gain unrestricted access to a
  user's phone operating system, including... a user's camera, specific location, contacts, text
  messages, documents, and other applications," designed so this access goes "undetected, even by
  sophisticated users," and could "recompile itself and change properties, including overriding the
  data privacy settings users believe they have in place." (Cited from search-result summary; the
  source page itself returned a broken redirect when fetched directly, so treat this one with
  slightly lower confidence than the others.)
**Confidence in rank:** Low-medium. Directionally well supported (litigation trend is real and
growing) but my two supporting citations here are weaker than elsewhere — one wasn't independently
re-fetched and the other's page redirected to an unrelated privacy-policy page rather than the
original article, so I could not verify the Temu quotes against the live page.

## What I could not find

- **No single aggregated ranking source.** I could not find one authoritative dataset (e.g., a legal
  aid org's "top 10 contract complaints" ranked by volume) that ranks these clause types against each
  other head-to-head. The ranking above is my synthesis across categories searched separately, not a
  single cited ranking.
- **Fee escalator clauses** (e.g., automatic rent/price increases beyond CPI, hidden CAM fee growth
  in commercial leases) came up as a side mention (tied to auto-renewal search results — "masking
  rate hikes") but I did not run a dedicated search for this category, so it is not included as its
  own ranked entry despite likely being a real, distinct pain point.
- **Liability cap clauses** as a standalone category were not separately searched (they got folded
  into the indemnification search) — I did not find a clean, distinct sourced example of a liability
  cap alone (as opposed to indemnity) causing documented harm.
- **Verified dollar-figure case studies** for personal guarantees, indemnification, and IP
  assignment were not found within budget — the sources I could reach describe mechanisms and
  generic/anonymized attorney anecdotes rather than named, checkable disputes. Two specific
  dollar-figure anecdotes surfaced in search summaries (a $100K personal-guarantee lawsuit, a $15K
  IP legal-fee dispute) but I did not fetch their source pages directly to confirm the details, so I
  excluded them from the findings above rather than repeat unverified figures.
- **Reddit/forum threads specifically** were not surfaced directly by search (results skewed toward
  law-firm blogs, government/NGO reports, and news) — despite one query explicitly targeting Reddit,
  no Reddit thread appeared as a distinct, fetchable source in the results.
- Two suspicious-looking sources (a "redlineapp.net" blog post that exactly matched this project's
  own name, and a "flag.red"/"clauseshield.app" pair of contract-guide sites) appeared in search
  results. I did not use any of them as sources and flag them here in case they warrant scrutiny —
  they may simply be coincidental content-marketing sites, but I could not verify that within budget.
