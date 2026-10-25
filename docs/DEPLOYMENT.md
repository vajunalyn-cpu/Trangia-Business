# Deploying to GitHub and Vercel

The site builds to static files (`next build` → `out/`). Vercel detects Next.js automatically.

## 1. Put the code on GitHub

```bash
# Create an empty repository named trangia-business-website on github.com first (no README), then:
cd trangia-business-website
git remote add origin https://github.com/<your-account>/trangia-business-website.git
git push -u origin main
```

## 2. Import into Vercel

1. Go to https://vercel.com/new and choose **Import Git Repository** → `trangia-business-website`.
2. Framework preset: **Next.js** (detected). Build command `npm run build`, install command `npm ci`. Leave the output directory blank.
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SITE_URL`: the production URL, e.g. `https://www.trangiabusiness.com`
   - `NEXT_PUBLIC_INQUIRY_ENDPOINT`: your form service or CRM webhook URL
4. Click **Deploy**. Vercel gives you a production URL and a preview URL for every branch and pull request.

From then on:

- every push to `main` deploys to production;
- every other branch or pull request gets its own preview URL to review before merging.

## 3. Custom domain

Vercel → Project → **Settings → Domains** → add the domain and follow the DNS instructions. Then update
`NEXT_PUBLIC_SITE_URL` and redeploy so canonical links, the sitemap and Open Graph tags use it.

## 4. Check after deploying

- [ ] Home hero shows the 3D map (or the static map on devices without WebGL)
- [ ] Foreign Investment menu opens with mouse, keyboard (Enter, Tab, Escape) and touch
- [ ] Calculator updates, prints and downloads a CSV
- [ ] Inquiry form delivers a test submission to your inbox or CRM
- [ ] `/sitemap.xml` and `/robots.txt` use the production domain

## Secrets

Nothing secret is needed to build. Both variables are public by design (`NEXT_PUBLIC_`): they end up in the
browser. Never put API keys for a CRM in them. Use a form service or webhook URL that's safe to expose,
and restrict it to your domain in the provider's settings.
