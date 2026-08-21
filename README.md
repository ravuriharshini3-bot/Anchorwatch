# AnchorWatch — setup guide

This is the complete code for your app. You don't need to understand it —
you just need to follow the steps below in order. Budget about 45–60
minutes for the first setup. Everything used here is free to start.

## What you'll create accounts on
1. GitHub (holds your code)
2. Vercel (hosts your website, runs it for free)
3. Supabase (your database + login system, free)
4. Resend (sends your alert emails, free up to 3,000/month)
5. Stripe (collects payments — only needed when you're ready to charge)

---

## Step 1 — Put the code on GitHub
1. Go to github.com and create a free account if you don't have one.
2. Click the "+" in the top right → "New repository". Name it `anchorwatch`. Keep it Private. Click "Create repository".
3. On the new repo's page, click "uploading an existing file".
4. Drag the entire unzipped `anchorwatch` folder (all the files inside it) into the browser window and click "Commit changes".

## Step 2 — Create your Supabase project
1. Go to supabase.com → sign up free → "New project".
2. Give it any name, set a database password (save it somewhere), pick a region close to you.
3. Once it's created, go to the "SQL Editor" tab on the left.
4. Open the file `supabase/schema.sql` from your code (view it on GitHub or in the zip), copy all of it, paste it into the SQL Editor, and click "Run".
5. Go to Settings → API. You'll need three values from this page in Step 4:
   - Project URL
   - anon / public key
   - service_role key (click "reveal" — keep this one secret)
6. Go to Authentication → URL Configuration. Set "Site URL" to your future Vercel address (you'll come back and fix this after Step 3 once you know it).

## Step 3 — Deploy to Vercel
1. Go to vercel.com → sign up free using your GitHub account.
2. Click "Add New" → "Project" → find and import your `anchorwatch` repo.
3. Before clicking Deploy, open "Environment Variables" and add each of these (values from Step 2 and later steps):

   | Name | Where to get it |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
   | `NEXT_PUBLIC_SITE_URL` | leave blank for now, you'll add it after deploying |
   | `RESEND_API_KEY` | from Step 4 below |
   | `ALERT_FROM_EMAIL` | from Step 4 below |
   | `STRIPE_SECRET_KEY` | from Step 6 below (can add later) |
   | `STRIPE_WEBHOOK_SECRET` | from Step 6 below (can add later) |
   | `STRIPE_PRO_PRICE_ID` | from Step 6 below (can add later) |
   | `CRON_SECRET` | make up any long random password yourself, e.g. `aw_9f2k4m8x...` |

4. Click "Deploy". After a minute or two you'll get a live URL like `anchorwatch-yourname.vercel.app`.
5. Go back to Vercel → your project → Settings → Environment Variables, and fill in `NEXT_PUBLIC_SITE_URL` with that URL (include `https://`). Redeploy (Deployments tab → "..." on the latest → Redeploy) so it picks up the change.
6. Go back to Supabase → Authentication → URL Configuration, and set the Site URL and Redirect URL to that same Vercel address (add `/api/auth/callback` to the redirect URL).

## Step 4 — Connect email alerts (Resend)
1. Go to resend.com → sign up free.
2. Go to "API Keys" → "Create API Key" → copy it.
3. Add it to Vercel as `RESEND_API_KEY` (Settings → Environment Variables → redeploy).
4. For `ALERT_FROM_EMAIL`: Resend requires you to verify a domain to send from it. If you own a domain already, add it under "Domains" in Resend and follow their DNS instructions. If not, you can start by using Resend's own test sending address shown in their dashboard, and switch to your own domain later.

## Step 5 — Turn on the daily checks
Nothing to do here — `vercel.json` in your code already tells Vercel to run
the check automatically once a day. Vercel adds the correct
`Authorization` header itself using your `CRON_SECRET`, so as long as that
variable is set (Step 3), it just works.

To test it manually before waiting a full day: visit
`https://YOUR-SITE.vercel.app/api/cron/check` in a browser — you'll get an
"Unauthorized" message, which is expected (browsers can't send the secret
header). To really test it, wait for the first scheduled run, or ask
someone technical to trigger it once with the secret header for you.

## Step 6 — Turn on payments (Stripe) — do this when you're ready to charge
1. Go to stripe.com → sign up (start in "Test mode" — a toggle top-right).
2. Go to Products → "Add product". Name it "AnchorWatch Pro", set price to $9/month, recurring. Save, then copy the **Price ID** (starts with `price_...`).
3. Go to Developers → API keys → copy the **Secret key** (starts with `sk_`).
4. Add both to Vercel: `STRIPE_PRO_PRICE_ID` and `STRIPE_SECRET_KEY`. Redeploy.
5. Go to Developers → Webhooks → "Add endpoint". Endpoint URL: `https://YOUR-SITE.vercel.app/api/stripe/webhook`. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Save, then copy the **Signing secret** (starts with `whsec_`) and add it to Vercel as `STRIPE_WEBHOOK_SECRET`. Redeploy.
6. When you're ready to accept real money, switch Stripe out of Test mode (top-right toggle) and repeat steps 2–5 using the live keys.

## You're live
Visit your Vercel URL. You should see the landing page. Click "Start
watching free", enter your email, click the link that arrives, and you'll
land on your dashboard. Add a domain to see it check in real time.

## If something doesn't work
- Blank page or error after deploy → check Vercel → your project →
  Deployments → click the failed one → "View Function Logs" for the
  actual error message.
- Magic link email never arrives → check Supabase → Authentication →
  Logs, and check your spam folder.
- Domain check always fails → some registrars format WHOIS data
  unusually; the app is built to show "check manually" for those instead
  of crashing, which is expected for a small number of domains.

## Ongoing maintenance
This is designed to mostly run itself. The only thing worth checking
every so often:
- Vercel → your project → Cron Jobs tab, to confirm the daily check is
  still running.
- Resend's dashboard, to confirm you're under the free 3,000 email/month
  limit as you grow (upgrade if you pass it).
