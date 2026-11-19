# Star.Academy — Phase-Wise Build Prompt

> Use these prompts in order. Each phase is self-contained, ends with a testable deliverable, and builds on the previous one. This is the exact blueprint the live repository was built from.

---

## The concept (why this idea wins)

**Star.Academy = a free, self-updating Astronomy & Night-Sky Academy.** "Learn the night sky tonight — free."

| Option evaluated | Traffic potential | RPM / lead value | Automation | Trademark / UDRP risk | Verdict |
|---|---|---|---|---|---|
| A. Talent / performing-arts academy | Medium (auditions, singing, acting) | High CPC, strong leads | Low — casting feeds are proprietary | **High** — "Star Academy" is Banijay's registered talent-show format, adapted in 20+ territories; same class of services | Rejected |
| B. Creator / influencer academy | Medium | High | Low | Medium-High (same "make you a star" framing) | Rejected |
| **C. Astronomy & night-sky academy** | **Very high and recurring** (moon phase, meteor showers, eclipses, aurora, ISS, planets tonight, launches — searched every month, spikes on events) | Medium RPM + strong commercial intent (telescopes, binoculars, smart telescopes, dark-sky travel, space camps, school events) | **Very high** — sky data is computable forever + free public APIs | **Lowest** — "star" used in its generic, dictionary sense | **Chosen** |

Revenue stack: Google AdSense (Auto ads) → lead generation (telescope buyers, school/event stargazing nights, dark-sky travel, astrophotography coaching — sold/referred to retailers, planetariums, tour operators, educators) → sponsorships (contests, calendar, newsletter, lessons) → donations (memberships, one-time) → affiliate-ready gear guides (phase 9).

---

## PHASE 0 — Brand, guardrails, and compliance foundation
**Prompt:**
"Set up a static website for the domain Star.Academy (astronomy & night-sky academy). Brand voice: friendly expert, beginner-first. Create the global layout: a thin top bar on EVERY page reading 'Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership' linked to https://web.works/contact (the text 'web.works' must never be visible). Include the AdSense script `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>` in the `<head>` of every page, an `ads.txt` with `google.com, pub-6620975821265271, DIRECT, f08c47fec0942fa0`, a cookie notice, Privacy Policy (Google advertising cookies, third-party processors, GDPR/CCPA), Terms, and a Disclaimer & Trademark page stating Star.Academy is independent and not affiliated with Banijay/Endemol Shine or any 'Star Academy' TV format, NASA/ESA/NOAA, or any brand mentioned. Never expose the owner’s contact email in visible text or plain HTML — assemble it in JavaScript at submit time only."

**Deliverable:** layout, header/nav, footer, legal pages, ads.txt, robots.txt, sitemap.xml, manifest, 404.

## PHASE 1 — Design system & performance
**Prompt:**
"Build a dark 'deep-space' design system: navy background, glass cards, gold star accent, cyan secondary, Space Grotesk headings + Inter body, animated low-cost starfield canvas (disabled for prefers-reduced-motion), fully responsive grid (mobile-first), accessible focus states and contrast, and a site-wide **Night-Vision (red) mode** toggle that astronomers use outdoors (persist in localStorage). No frameworks; vanilla HTML/CSS/JS so it runs on GitHub Pages free tier."

## PHASE 2 — The live sky engine (the traffic magnet)
**Prompt:**
"Vendor the MIT-licensed astronomy-engine library. Build `Tonight's Sky`: location from geolocation, saved preference, or 40 preset cities; compute sunset, civil/nautical/astronomical twilight, sunrise, moon phase/illumination/rise/set, and for Mercury–Neptune: rise/set, magnitude, constellation, and an automatic verdict (evening / morning / all night / not visible). Draw an interactive stereographic sky chart (horizon, cardinal points, ~85 bright stars with names, major constellation lines, planets and Moon) for any time; add a time slider. Add a compact version to the home page."

## PHASE 3 — Self-computing Sky Events Calendar
**Prompt:**
"Generate a rolling 12-month calendar fully in the browser: Moon quarters with traditional full-moon names, supermoons (perigee distance), lunar and solar eclipses (type + peak + where), equinoxes/solstices, outer-planet oppositions, Mercury/Venus greatest elongations, and major meteor showers with peak dates, ZHR and moonlight interference score. Filters by type and month; one-click 'Add to calendar' (.ics) per event; 'Next big event' countdown on the home page."

## PHASE 4 — Live space data + automation (self-updating)
**Prompt:**
"Create a Python (stdlib only) script `scripts/refresh.py` and a GitHub Actions workflow (cron every 6 h + manual + on push) that fetches and normalizes: NASA APOD, upcoming launches (RocketLaunch.Live free endpoint + Launch Library 2), NOAA SWPC Kp forecast (aurora outlook), Spaceflight News API headlines, and the latest videos from curated YouTube channel RSS feeds (NASA, ESA, PBS Space Time, etc.) into `/data/*.json`, committing only when changed. On the client, try the live API first (with timeout) and fall back to the cached JSON so the site is always current even between builds. Add a live ISS tracker with day/night terminator."

## PHASE 5 — The Academy (content depth for AdSense approval)
**Prompt:**
"Write 10 original, long-form beginner guides (moon phases, first telescope, finding planets, meteor showers, seeing the ISS, aurora, phone astrophotography, light pollution & dark skies, constellations, eclipse safety) with FAQs, internal links, and inline lead CTAs. Build a 12-lesson 'Night Sky 101' course with progress tracking (localStorage), lesson tasks, quizzes, embedded videos from the live feed, and a downloadable completion certificate (canvas → PNG) that users share — a free viral loop."

## PHASE 6 — Interactive tools (engagement + leads)
**Prompt:**
"Build: Telescope Finder quiz (5 questions → telescope type + reasoning → 'send me a shortlist' lead form), Magnification/FOV/exit-pupil/limiting-magnitude calculator, Birthday Moon (moon phase for any date), Your Age & Weight on Other Planets, Bortle-scale sky darkness self-test, and Astronomy unit converter."

## PHASE 7 — Lead generation engine (highest-value section)
**Prompt:**
"Create `/get-started` — a 5-step, progress-barred 'Free Personalized Stargazing Plan' funnel (goal → experience → budget → location → contact with optional partner-consent checkbox). On submit, send the lead (AJAX, no page reload) and instantly render a personalized plan: gear tier, three targets visible tonight (computed), and the next big sky events. Add three B2B/B2C forms: Book a Stargazing Night (schools, events, corporate), Telescope Buying Help, Dark-Sky Trip Planning. Add inline CTAs on every content page, a sticky mobile CTA, and a once-per-week exit-intent offer. Every form uses one hidden recipient assembled in JS, a honeypot, and a clear consent line."

## PHASE 8 — Community, contests, donations, sponsors, hiring
**Prompt:**
"Build: `/contests` (monthly Night Sky Challenge — Moon by phone, Deep-sky, Sky sketch, Young Astronomer with guardian consent; rules, judging, no purchase necessary, sponsor-funded prizes, submission form with image link), `/support` (donation tiers via PayPal link built in JS + transparent allocation: operations, promotions & marketing, hiring, contests & prizes; other ways to help), `/sponsor` (advertising & sponsorship packages + inquiry form), `/careers` (paid roles + volunteer astronomers + application form), `/about`, `/contact`."

## PHASE 9 — SEO, launch, growth
**Prompt:**
"Add per-page titles/descriptions, canonical URLs, Open Graph, JSON-LD (WebSite, Organization, Article, FAQPage, Course), sitemap, robots, fast loading (no blocking JS), and lazy YouTube embeds via youtube-nocookie. Publish on GitHub Pages from `main`. Post-launch: apply to AdSense after ~2–4 weeks of indexed content, enable Google's certified CMP in AdSense for EEA/UK, connect the custom domain, submit the sitemap to Search Console, then add affiliate links to gear guides and a monthly email digest to the leads list."

---

## Acceptance checklist
- [ ] Top interest bar on every page → web.works/contact (domain text not visible)
- [ ] AdSense script on every page + ads.txt
- [ ] Email never visible in text or plain source
- [ ] Privacy, Terms, Disclaimer & Trademark, About, Contact present
- [ ] Lead funnel + 3 secondary lead forms work and show success state
- [ ] Donations, contests, sponsors, careers pages present
- [ ] Workflow refreshes `/data` on schedule; client falls back gracefully
- [ ] Mobile layout verified; no console errors
