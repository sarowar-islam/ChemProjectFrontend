# SEO, GEO & AEO Launch Checklist for BCER Lab (bcerlab.com)

This document outlines the manual steps required post-deployment to ensure full search engine indexing, monitoring, and AI/Answer Engine Optimization (GEO/AEO).

---

## 1. Domain & DNS Configuration
- [ ] Ensure your custom domain **`https://bcerlab.com`** is correctly connected to your hosting provider (Vercel or Netlify).
- [ ] Verify that SSL certificate (`https://`) is active and working properly.
- [ ] Confirm that `www.bcerlab.com` redirects permanently (`301`) to `https://bcerlab.com` (or vice versa according to your preferred canonical domain).
- [ ] Verify that old URLs on `https://prof-dr-yunus-researchgroup.netlify.app/*` correctly return a `301` redirect to `https://bcerlab.com/*`.

---

## 2. Google Search Console Setup
1. Go to [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property** and choose **Domain property**: `bcerlab.com`.
3. Verify domain ownership via DNS TXT record (provided by Google Search Console).
4. Add the property URL prefix variants if needed (`https://bcerlab.com`).

---

## 3. Sitemap & Crawl Verification
- [ ] Submit your sitemap URL in Google Search Console:
  `https://bcerlab.com/sitemap.xml`
- [ ] Use the **URL Inspection** tool in Search Console to test:
  - Homepage (`https://bcerlab.com/`)
  - Team page (`https://bcerlab.com/team`)
  - A sample team member profile (`https://bcerlab.com/team/yunus`)
  - Alumni directory (`https://bcerlab.com/alumni`)
  - Publications page (`https://bcerlab.com/publications`)
- [ ] Click **Request Indexing** for the homepage and key landing pages.

---

## 4. Bing Webmaster Tools Setup
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Add `https://bcerlab.com` and import your site from Google Search Console.
3. Submit your sitemap: `https://bcerlab.com/sitemap.xml`.

---

## 5. Social Sharing Preview Testing
Test how links share across platforms using official debuggers:
- **Facebook / WhatsApp / LinkedIn Sharing Debugger**:
  - Paste `https://bcerlab.com` and individual profile URLs to verify `bcerlab-og-image.png` and dynamic titles/descriptions load correctly.
- **X (Twitter) Card Validator**:
  - Test sharing cards.

---

## 6. Ongoing Monitoring
- [ ] Check Search Console Coverage and Performance reports after 1–2 weeks to inspect indexed pages, click-through rates, and organic keyword impressions.
- [ ] Monitor AI search engine citation performance (ChatGPT, Claude, Google SGE / Gemini search) for queries related to "Biochemical and Environmental Research Lab", "BCER Lab", and "Professor Dr. Yunus Ahmed".
