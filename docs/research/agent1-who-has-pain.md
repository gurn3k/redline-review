# Agent 1: Who Has This Pain

## Findings

### 1. Lease paperwork signed without reading closely — led to a roommate liability dispute

> "I didn't read them well, I signed them and left them with a note for her to sign them."

> "I really don't remember.. I think I just wrote 'please sign the paper on the table' or something like that"

Source: https://forums.anandtech.com/threads/serious-lease-problems-w-roommate.1251214/post-10367779

Context: Lease/roommate release paperwork. The poster signed and passed along lease-related documents without reading them carefully or explaining their actual legal effect. The document only released the poster from liability on the lease — it did not release the roommate, as she had believed — creating a dispute over who was still on the hook for rent. Platform: AnandTech Forums (general consumer/tech forum, off-topic/legal section).

### 2. Non-compete clause signed under time pressure, without understanding its full scope

> "Yes, you'll say I should've asked before signing. I couldn't - had no time and had to secure the job."

> "Non-compete (12 months, yeah I know), is with the Company: per the contract, that's the parent company."

> "Avoiding the diet industry for 1 year? No problem. Having to avoid beauty, social media, this, that, all their apps, harder.."

Source: https://www.teamblind.com/post/how-do-i-ask-about-awkward-non-compete-ykerwv4y

Context: Employment contract, non-compete clause. Poster (username "bublepet") signed a job offer with a 12-month non-compete without time to review it or ask questions, and only afterward realized the clause was written against the entire parent company (not just their own division/product area), meaning it would block them from a much wider swath of future jobs (beauty, social media, and other apps under the same parent company) than they understood at signing. Platform: Blind (anonymous professional/workplace forum).

## What I could not find

I hit both hard caps (12 web searches, 15 page reads) before assembling anywhere near 8 solid, sourced findings, so I'm reporting only the two above rather than padding the list with weaker matches. Specific gaps and reasons:

- **Reddit was effectively unreachable.** WebSearch queries scoped to reddit.com (r/legaladvice, r/personalfinance, r/freelance, r/AskHR, r/Landlord) consistently returned law-reference sites (LawInsider, Rocket Lawyer, JD Supra) instead of actual Reddit threads, and direct WebFetch of reddit.com URLs was blocked outright ("Claude Code is unable to fetch from www.reddit.com"). Given Reddit is one of the richest sources for this kind of first-person account, this is the single biggest gap.
- **Quora was blocked.** Multiple promising Quora questions turned up in search (e.g., "Have you ever not read a contract before signing it and regret not reading it?", "Have you ever signed or been given a contract and realized something wasn't right?") but WebFetch returned HTTP 403 on all Quora URLs attempted.
- **JustAnswer consumer-protection-law pages** (real first-person questions about gym membership cancellation contracts) mostly returned HTTP 403 when fetched directly, so I could not extract the underlying verbatim question text even though the search snippets suggested relevant content existed.
- **CFPB complaint database**: I confirmed via search that the CFPB's own study found 75% of consumers did not know whether they were subject to an arbitration clause, and consumer-advocate groups have analyzed thousands of arbitration-related complaint narratives in the CFPB database — but the one PDF I fetched (National Association of Consumer Advocates fact sheet) came back as unreadable encoded/compressed text, so I could not pull an individual verbatim complaint quote with a working source link.
- **No coverage obtained for:** freelance/independent-contractor contracts (IP assignment, "work made for hire," kill fees, non-solicitation), residential lease early-termination or junk-fee stories with a named/quoted tenant, terms-of-service/EULA horror stories, timeshare contracts, Better Business Bureau or Trustpilot complaint pages (searches surfaced only aggregate stats, not individual quoted complaints I could verify by fetching), and small-business vendor/SaaS contract disputes. These are all plausible strong sources for Redline's target pain but I did not reach usable, sourced verbatim quotes for any of them within budget.
- A few near-misses were found but excluded because they don't cleanly satisfy "harm from a term they didn't understand or notice": an FTC lawsuit against Greystar cited a tenant paying ~$1,400 vs. a $1,000 quote, but the tenant was anonymous and the quote wasn't verbatim from the person; a law professor (Cathy Mansfield) described her kids being charged mandatory garbage-pickup fees, but that's a secondhand account, not the harmed party's own words; and Fitness World/Steve Nash gym members (Bev Ulmer, Dan Holloway, via Global News) described being unable to reach anyone to cancel, which is more a customer-service breakdown than evidence they missed or misunderstood a specific contract clause.
