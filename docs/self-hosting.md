# Self-Hosting Creed

This is the shortest path for running your own Creed instance on a hosted
Supabase project and Vercel project.

## 1. Create the backing services

Create:

- A Supabase project for Postgres, Auth, and RLS.
- A Vercel project connected to your fork of this repository.
- Optional service accounts for Stripe, OpenRouter, GitHub OAuth, and Median.

For a private self-host, Stripe is not required. Set `CREED_SELF_HOSTED=1` in
the Vercel environment and every signed-in user on that deployment gets product
access without a `creed_entitlements` row. Leave that variable unset if you are
running a hosted/commercial deployment where Stripe should control access.

## 2. Apply the Supabase schema

Install the Supabase CLI, link the project, and push the migrations:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

The migrations in `supabase/migrations/` create the Creed tables, OAuth server
tables, RLS policies, audit log, MCP read counters, entitlements, and AI credit
tables. Do not open a production instance to real users until these migrations
have applied cleanly.

## 3. Configure Supabase Auth

In Supabase Dashboard, open Authentication > URL Configuration.

Set Site URL to your deployed origin:

```text
https://your-domain.example
```

Add redirect URLs for the app callback:

```text
https://your-domain.example/auth/callback
https://your-domain.example/auth/callback?*
```

For local development, also add:

```text
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?*
```

Creed supports email/password auth out of the box. If you enable Google or X in
Supabase, configure those providers in Supabase Auth and keep their provider
callback URLs in the provider dashboard exactly as Supabase shows them.

Optional: copy the HTML in `supabase/email-templates/` into Supabase
Authentication > Emails for the confirm-signup and reset-password templates.

## 4. Set Vercel environment variables

Minimum private self-host configuration:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-publishable-key>
SUPABASE_SECRET_KEY=<your-supabase-service-role-key>
CREED_ENCRYPTION_SECRET=<base64-encoded-32-byte-secret>
CREED_SELF_HOSTED=1
```

Generate the encryption secret with:

```bash
openssl rand -base64 32
```

Optional variables:

- `OPENROUTER_PLATFORM_KEY`: enables platform-managed AI credits mode.
- User BYOK OpenRouter keys: no server env required. Users add them in Settings.
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
  `STRIPE_WEBHOOK_SECRET`: required only if Stripe controls access or credit
  top-ups.
- `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`: required only for the
  GitHub version-control integration.
- `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_TWITTER_URL`,
  `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_GITHUB_URL`: public branding.
- `MEDIAN_API_KEY`: enables the feedback endpoint.
- `CREED_CSP_ENFORCE=1`: switch CSP from report-only to enforcing after one
  successful production deploy cycle.

## 5. Deploy

Deploy from Vercel after the environment variables are present. The default
build command is:

```bash
npm run build
```

If you use the checked-in `vercel.json`, the deployment region is `lhr1` and
Stripe/feedback API routes get longer function timeouts. Change the region if a
different Vercel region is better for your users and Supabase project.

## 6. Verify the instance

After deployment:

1. Open `/api/health`. It should report configured Supabase and reachable
   database tables.
2. Sign up or sign in.
3. Complete onboarding and claim the generated Creed.
4. Visit `/file` and confirm the editor loads.
5. Visit `/connections`, copy the MCP server URL, and connect one agent.
6. If you use Stripe, complete a test checkout and confirm
   `/api/stripe/status` returns `paid: true`.

For a self-hosted deployment using `CREED_SELF_HOSTED=1`, `/api/stripe/status`
returns `billingMode: "self-hosted"` for signed-in users and the Billing dialog
shows that no Stripe billing is attached.

## Operational notes

- Keep `SUPABASE_SECRET_KEY` server-only. Never expose it with a
  `NEXT_PUBLIC_` prefix.
- Use separate Supabase projects and env vars for preview/staging and
  production.
- Re-run `supabase db push` after pulling new migrations from upstream.
- Keep `NEXT_PUBLIC_SITE_URL` exact. OAuth callbacks, Stripe redirects, sitemap
  URLs, and MCP connection URLs are derived from it.
- Run behind HTTPS for production. Auth and MCP OAuth flows assume a secure
  origin.
