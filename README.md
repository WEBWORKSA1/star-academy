# Star.Academy — Learn the Night Sky Tonight

A free, self-updating astronomy academy built as a fast static site for **GitHub Pages (free plan, `main` branch)**.

**Concept:** live "what's in my sky tonight" data computed in the browser + a rolling 12-month sky-events calendar + live space data (ISS, launches, aurora, APOD, news, videos) + a free 12-lesson course with certificate + interactive tools + a high-converting lead funnel. Monetized with Google AdSense (Auto ads), lead generation, sponsorships, contests and donations.

See **[PROMPT.md](PROMPT.md)** for the phase-wise build prompt and **[RESEARCH.md](RESEARCH.md)** for the 38-site competitive research.

## Structure
```
index.html, tonight.html, calendar.html, academy.html, tools.html, live.html, videos.html,
get-started.html (lead funnel), contests.html, support.html, sponsor.html, careers.html,
about.html, contact.html, privacy.html, terms.html, disclaimer.html, 404.html, learn/*.html
assets/css/style.css            design system (incl. night-vision red mode)
assets/js/main.js               nav, consent, forms (hidden recipient), donations, video, CTAs
assets/js/sky.js                sky engine: tonight, events calendar, sky chart, moon renderer
assets/js/pages.js              page controllers (tonight, calendar, live, tools, academy, funnel)
assets/js/course.js             Night Sky 101 lesson content
assets/vendor/astronomy.browser.min.js   astronomy-engine 2.1.19 (MIT)
data/*.json                     auto-refreshed live data (APOD, launches, Kp, news, videos)
scripts/build.py                wraps src/pages/* in the shared layout → root HTML + sitemap
scripts/refresh.py              stdlib-only data refresher used by the workflow
.github/workflows/refresh-data.yml   runs every 6 h, commits only when data changes
src/pages/                      page bodies (edit these, then run the build)
```

## Edit & rebuild
```bash
python3 scripts/build.py      # regenerates all HTML pages + sitemap.xml
python3 scripts/refresh.py    # optional: refresh /data locally
```

## Built-in requirements
- AdSense script (`ca-pub-6620975821265271`) in the `<head>` of every page + `ads.txt`.
- Top bar on every page → "Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership" linked to the web.works contact page (domain text never visible).
- All forms post via AJAX to a single recipient that is assembled in JavaScript at send time — the address never appears as visible text or plain HTML.
- Privacy Policy (AdSense cookie disclosures), Terms, Disclaimer & Trademark notice (no affiliation with any "Star Academy" TV format), About, Contact.

## One-time setup checklist
1. **GitHub Pages:** Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
2. **Forms:** the very first form submission triggers a one-time FormSubmit activation email to the site inbox — click **Activate**. All later submissions arrive automatically.
3. **Custom domain (optional):** Settings → Pages → Custom domain `star.academy`, then point DNS (`A` records to GitHub Pages IPs, or `CNAME` to `webworksa1.github.io`). Enable *Enforce HTTPS*.
4. **AdSense:** add the site in AdSense, and enable Google's certified consent message (Privacy & messaging) for EEA/UK visitors.
5. **Optional:** add a `NASA_API_KEY` repository secret (free at api.nasa.gov) for higher APOD rate limits.

## Data sources
NASA APOD · NOAA SWPC · The Space Devs Launch Library 2 · RocketLaunch.Live · Spaceflight News API · Where the ISS at? · YouTube channel RSS · OpenStreetMap tiles. Sky computations: astronomy-engine (MIT).

© Star.Academy. Not affiliated with any "Star Academy" television format, NASA, ESA or NOAA.
