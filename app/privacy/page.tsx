import type { Metadata } from "next";
import { SiteHeader } from "@/app/components/site-header";

export const metadata: Metadata = {
  title: "Privacy · Redline",
  description: "What Redline stores, who processes it, and how to have it deleted.",
};

// Public page. Google's OAuth consent screen links here, so it has to stay
// reachable without a session (see isPublicRoute) and stay accurate: update
// it whenever storage, model routing or sign-in providers change.
export default function PrivacyPage() {
  return (
    <div className="page">
      <SiteHeader />
      <main className="container app-main">
        <div className="page-section narrow legal">
          <h1 className="page-title">Privacy</h1>
          <p className="page-intro">Last updated October 12, 2026.</p>

          <h2>What Redline stores</h2>
          <p>
            Your email address and sign-in details. If you sign in with Google or LinkedIn, Redline
            also receives the name and profile photo on that account. It gets no access to your
            contacts or posts, and it can&rsquo;t post for you.
          </p>
          <p>
            For each document you upload, Redline keeps the file name, the text pulled from it and
            the review it produced. It also keeps the red lines you write. The original file
            isn&rsquo;t kept.
          </p>

          <h2>Who handles it</h2>
          <p>
            Accounts, documents and red lines are stored in Supabase. The site runs on Vercel. To
            review a document or answer a question about it, Redline sends the document text to
            OpenRouter, which passes it to Fireworks to run the model. Their own privacy policies
            cover what they do with it.
          </p>

          <h2>What Redline doesn&rsquo;t do</h2>
          <p>
            No ads, no analytics trackers, and no selling or sharing your data with anyone else.
            The only cookies are the ones that keep you signed in.
          </p>

          <h2>Deleting your data</h2>
          <p>
            Email <a href="mailto:info@gurn3k.com">info@gurn3k.com</a> from the address on your
            account. Your account, documents and red lines will be deleted within 30 days.
          </p>
        </div>
      </main>
    </div>
  );
}
