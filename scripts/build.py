#!/usr/bin/env python3
"""Star.Academy static site builder.
Wraps every page body in src/pages with the shared layout (interest bar, AdSense,
navigation, footer, consent, SEO). Output goes to the repository root for GitHub Pages.
Usage: python3 scripts/build.py
"""
import json, os, re, datetime, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src', 'pages')
SITE = 'https://star.academy'
ADSENSE = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>'
TODAY = datetime.date.today().isoformat()

# (output path, source fragment, title, description, page key, extra scripts, nav key)
PAGES = [
  ('index.html', 'home.html', 'Star.Academy — Learn the Night Sky Tonight, Free', 'Free astronomy academy: what’s in your sky tonight, moon phase, visible planets, meteor showers, eclipses, ISS tracker, live launches and beginner stargazing lessons.', 'home', ['sky', 'pages'], 'home'),
  ('tonight.html', 'tonight.html', 'Tonight’s Sky — Visible Planets, Moon Phase & Live Sky Chart', 'See what’s visible in the night sky tonight from your location: planets, moon phase, moonrise, twilight times and an interactive sky chart.', 'tonight', ['sky', 'pages'], 'tonight'),
  ('calendar.html', 'calendar.html', 'Sky Events Calendar — Meteor Showers, Eclipses, Full Moons & Planets', 'Rolling 12-month astronomy calendar: full moons and supermoons, meteor shower peaks, solar and lunar eclipses, planet oppositions and elongations. Add any event to your calendar.', 'calendar', ['sky', 'pages'], 'calendar'),
  ('academy.html', 'academy.html', 'Night Sky 101 — Free Online Stargazing Course with Certificate', 'A free 12-lesson stargazing course for beginners with tasks, quizzes and a downloadable certificate. Learn constellations, planets, telescopes and astrophotography.', 'academy', ['course', 'sky', 'pages'], 'academy'),
  ('learn/index.html', 'learn-index.html', 'Astronomy Guides for Beginners — Star.Academy Learn', 'In-depth, beginner-friendly astronomy guides: moon phases, first telescope, finding planets, meteor showers, the ISS, aurora, phone astrophotography and more.', 'learn', [], 'learn'),
  ('tools.html', 'tools.html', 'Astronomy Tools — Telescope Finder, Magnification Calculator & More', 'Free astronomy tools: telescope finder quiz, magnification & field-of-view calculator, birthday moon, your age on other planets, Bortle sky test and unit converter.', 'tools', ['sky', 'pages'], 'tools'),
  ('live.html', 'live.html', 'Live Space — ISS Tracker, Rocket Launches, Aurora Forecast & News', 'Live ISS position, upcoming rocket launches with countdowns, NOAA aurora Kp forecast, NASA picture of the day and the latest space news.', 'live', ['sky', 'pages'], 'live'),
  ('videos.html', 'videos.html', 'Astronomy Video Library — Auto-Updated Space & Stargazing Videos', 'An auto-updating library of the latest astronomy and space videos from NASA, ESA and leading science educators.', 'videos', ['pages'], 'videos'),
  ('get-started.html', 'get-started.html', 'Get Your Free Personalized Stargazing Plan — Star.Academy', 'Answer 5 quick questions and get a free personalized stargazing plan: the right gear for your budget, what to see tonight and the best sky events ahead. Plus telescope buying help and stargazing events.', 'get-started', ['sky', 'pages'], 'start'),
  ('contests.html', 'contests.html', 'Monthly Night Sky Challenge — Astrophotography & Sketch Contest', 'Enter Star.Academy’s monthly Night Sky Challenge: Moon by phone, deep-sky, sky sketch and Young Astronomer categories. Free to enter, sponsor-funded prizes.', 'contests', [], 'contests'),
  ('support.html', 'support.html', 'Support Star.Academy — Keep Astronomy Free for Everyone', 'Donate or become a monthly supporter to keep Star.Academy free: funds operations, promotion, hiring astronomy educators and monthly contest prizes.', 'support', [], 'support'),
  ('sponsor.html', 'sponsor.html', 'Advertise & Sponsor — Reach Stargazers and Space Fans', 'Sponsorship and advertising opportunities on Star.Academy: contest title sponsor, sky calendar, lessons, newsletter and gear guides.', 'sponsor', [], ''),
  ('careers.html', 'careers.html', 'Careers & Volunteers — Join Star.Academy', 'Join Star.Academy: astronomy writers, video creators, community moderators, outreach ambassadors and volunteer astronomers.', 'careers', [], ''),
  ('about.html', 'about.html', 'About Star.Academy — Free Astronomy Education', 'Star.Academy is an independent, free astronomy education project. Our mission, editorial standards and data sources.', 'about', [], ''),
  ('contact.html', 'contact.html', 'Contact Star.Academy', 'Contact Star.Academy for questions, partnerships, sponsorship, advertising, corrections or press.', 'contact', [], ''),
  ('privacy.html', 'privacy.html', 'Privacy Policy — Star.Academy', 'How Star.Academy collects, uses and protects information, including Google AdSense advertising cookies and your choices.', 'privacy', [], ''),
  ('terms.html', 'terms.html', 'Terms of Use — Star.Academy', 'Terms of use for Star.Academy, including contests, donations, user submissions and content.', 'terms', [], ''),
  ('disclaimer.html', 'disclaimer.html', 'Disclaimer, Trademark & Copyright Notice — Star.Academy', 'Trademark and copyright disclosures for Star.Academy, including non-affiliation with any "Star Academy" television format, NASA, ESA, NOAA or brands mentioned.', 'disclaimer', [], ''),
  ('404.html', '404.html', 'Lost in Space — Page Not Found | Star.Academy', 'This page drifted out of orbit.', '404', [], ''),
]
ARTICLES = [
  ('moon-phases-explained', 'Moon Phases Explained: A Complete Beginner’s Guide', 'Why the Moon has phases, how to tell waxing from waning, moonrise times, supermoons, blue moons and the best phase for observing craters.'),
  ('how-to-choose-your-first-telescope', 'How to Choose Your First Telescope (Without Wasting Money)', 'Aperture, mounts, Dobsonians vs refractors vs smart telescopes, budgets from $0 to $1,500+, and the mistakes beginners make.'),
  ('how-to-find-planets', 'How to Find Planets in the Night Sky Tonight', 'Spot Venus, Jupiter, Saturn and Mars with the naked eye: the ecliptic, twinkling test, best times, and what each planet looks like in a telescope.'),
  ('meteor-shower-guide', 'Meteor Shower Guide: When, Where and How to Watch', 'Every major meteor shower of the year, how to watch, ZHR explained, moonlight, and tips to see more shooting stars.'),
  ('how-to-see-the-iss', 'How to See the International Space Station From Your Backyard', 'When and why the ISS is visible, how to read pass predictions, what it looks like, and how to photograph it.'),
  ('aurora-northern-lights-guide', 'Northern & Southern Lights: How to See the Aurora', 'What causes aurora, the Kp index, how far south the northern lights reach, forecasts, and how to photograph them with a phone.'),
  ('phone-astrophotography', 'Phone Astrophotography: Shoot the Moon, Stars & Milky Way', 'Step-by-step settings for night mode and pro mode, tripods, focusing, stacking apps and photographing through a telescope.'),
  ('light-pollution-dark-skies', 'Light Pollution & Dark Skies: How to Find Truly Dark Places', 'The Bortle scale, light-pollution maps, International Dark Sky Places, and how to see more stars even from the city.'),
  ('constellations-for-beginners', 'Constellations for Beginners: Learn the Sky Season by Season', 'The easiest constellations and asterisms for each season in both hemispheres, star-hopping, and how to use a planisphere.'),
  ('eclipse-safety-guide', 'Solar & Lunar Eclipses: Types, Safety and How to Watch', 'Total, annular, partial and penumbral eclipses explained, certified eclipse glasses, and safe ways to view and photograph eclipses.'),
]
for slug, title, desc in ARTICLES:
    PAGES.append(('learn/%s.html' % slug, 'learn/%s.html' % slug, title + ' | Star.Academy', desc, 'article', [], 'learn'))

NAV = [('home', 'index.html', 'Home'), ('tonight', 'tonight.html', 'Tonight'), ('calendar', 'calendar.html', 'Calendar'),
       ('academy', 'academy.html', 'Academy'), ('learn', 'learn/index.html', 'Learn'), ('tools', 'tools.html', 'Tools'),
       ('live', 'live.html', 'Live'), ('videos', 'videos.html', 'Videos'), ('contests', 'contests.html', 'Contests'),
       ('support', 'support.html', 'Support')]

LOGO = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffdf9e"/><stop offset="1" stop-color="#ff9f43"/></linearGradient></defs><circle cx="32" cy="32" r="30" fill="#0b1230" stroke="url(#lg)" stroke-width="3"/><path d="M32 12l5.6 13.2 14.4 1.2-11 9.4 3.4 14L32 42.4 19.6 49.8l3.4-14-11-9.4 14.4-1.2z" fill="url(#lg)"/><circle cx="48" cy="16" r="2" fill="#6ee7ff"/></svg>'


def layout(out, frag, title, desc, key, scripts, navkey, body, extra_head=''):
    depth = out.count('/')
    R = '../' * depth
    url = SITE + '/' + ('' if out == 'index.html' else out.replace('index.html', ''))
    nav = ''.join('<a href="%s%s"%s>%s</a>' % (R, h, ' class="active" aria-current="page"' if k == navkey else '', t) for k, h, t in NAV)
    js = ''
    if 'sky' in scripts or 'pages' in scripts:
        js += '<script src="%sassets/vendor/astronomy.browser.min.js" defer></script>\n' % R
    if 'course' in scripts:
        js += '<script src="%sassets/js/course.js" defer></script>\n' % R
    if 'sky' in scripts or 'pages' in scripts:
        js += '<script src="%sassets/js/sky.js" defer></script>\n' % R
    if 'pages' in scripts:
        js += '<script src="%sassets/js/pages.js" defer></script>\n' % R
    ld = {"@context": "https://schema.org", "@type": "WebPage", "name": title, "description": desc, "url": url,
          "isPartOf": {"@type": "WebSite", "name": "Star.Academy", "url": SITE + '/'}}
    if key == 'home':
        ld = [{"@context": "https://schema.org", "@type": "WebSite", "name": "Star.Academy", "url": SITE + '/',
               "description": desc},
              {"@context": "https://schema.org", "@type": "EducationalOrganization", "name": "Star.Academy", "url": SITE + '/',
               "logo": SITE + '/assets/img/icon-512.png'}]
    if key == 'article':
        ld = {"@context": "https://schema.org", "@type": "Article", "headline": title.split(' | ')[0], "description": desc,
              "mainEntityOfPage": url, "datePublished": TODAY, "dateModified": TODAY,
              "author": {"@type": "Organization", "name": "Star.Academy Editorial Team"},
              "publisher": {"@type": "Organization", "name": "Star.Academy", "logo": {"@type": "ImageObject", "url": SITE + '/assets/img/icon-512.png'}},
              "image": SITE + '/assets/img/og.png'}
    if key == 'academy':
        ld = {"@context": "https://schema.org", "@type": "Course", "name": "Night Sky 101", "description": desc,
              "provider": {"@type": "Organization", "name": "Star.Academy", "sameAs": SITE},
              "isAccessibleForFree": True, "offers": {"@type": "Offer", "price": 0, "priceCurrency": "USD", "category": "Free"},
              "hasCourseInstance": {"@type": "CourseInstance", "courseMode": "online", "courseWorkload": "PT2H"}}
    body = body.replace('{R}', R)
    robots = 'noindex' if key == '404' else 'index,follow,max-image-preview:large'
    return f'''<!doctype html>
<html lang="en" data-root="{R}">
<head>
<meta charset="utf-8">
{extra_head}
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<meta name="robots" content="{robots}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#060a18">
<meta property="og:type" content="{'article' if key == 'article' else 'website'}">
<meta property="og:site_name" content="Star.Academy">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{R}assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="{R}assets/img/icon-192.png">
<link rel="manifest" href="{R}manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{R}assets/css/style.css">
{ADSENSE}
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body data-page="{key}">
<a class="skip" href="#main">Skip to content</a>
<canvas id="starfield" aria-hidden="true"></canvas>
<div id="interest"><a href="https://web.works/contact" target="_blank" rel="noopener">Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership</a></div>
<header class="site"><div class="wrap nav">
<a class="brand" href="{R}index.html" aria-label="Star.Academy home">{LOGO}<span>Star<b>.</b>Academy</span></a>
<nav class="menu" id="menu" aria-label="Main">{nav}<a href="{R}get-started.html" class="btn btn-gold btn-sm" style="margin-left:6px;color:#1b1200">Free Sky Plan</a></nav>
<div class="navbtns"><button class="iconbtn" data-redmode title="Night-vision (red) mode" aria-label="Toggle night-vision red mode">🔴</button><button class="iconbtn" id="menuToggle" aria-label="Open menu" aria-expanded="false" aria-controls="menu">☰</button></div>
</div></header>
<main id="main">
{body}
</main>
<footer class="site"><div class="wrap">
<div class="fgrid">
<div><a class="brand" href="{R}index.html">{LOGO}<span>Star<b>.</b>Academy</span></a><p class="small muted" style="margin-top:12px">Free astronomy education for everyone on Earth. Look up tonight — we’ll show you where.</p>
<form data-sa-form="newsletter" data-subject="Sky Alerts signup" data-ok="You’re in! Watch for eclipse, meteor and aurora alerts." style="margin-top:10px"><label for="nlEmail{depth}">Free Sky Alerts (eclipses, meteors, aurora)</label><input id="nlEmail{depth}" type="email" name="email" placeholder="you@example.com" required autocomplete="email"><input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off"><button class="btn btn-cyan btn-sm" type="submit">Get alerts</button><div class="form-msg" role="status"></div></form></div>
<div><h4>Explore</h4><ul><li><a href="{R}tonight.html">Tonight’s Sky</a></li><li><a href="{R}calendar.html">Sky Calendar</a></li><li><a href="{R}live.html">Live Space</a></li><li><a href="{R}videos.html">Video Library</a></li><li><a href="{R}tools.html">Tools</a></li><li><a href="{R}learn/index.html">Guides</a></li></ul></div>
<div><h4>Get involved</h4><ul><li><a href="{R}get-started.html">Free Stargazing Plan</a></li><li><a href="{R}academy.html">Night Sky 101 Course</a></li><li><a href="{R}contests.html">Monthly Contest</a></li><li><a href="{R}support.html">Donate / Support</a></li><li><a href="{R}sponsor.html">Advertise & Sponsor</a></li><li><a href="{R}careers.html">Careers & Volunteers</a></li></ul></div>
<div><h4>Company</h4><ul><li><a href="{R}about.html">About</a></li><li><a href="{R}contact.html">Contact</a></li><li><a href="{R}privacy.html">Privacy Policy</a></li><li><a href="{R}terms.html">Terms of Use</a></li><li><a href="{R}disclaimer.html">Disclaimer & Trademarks</a></li><li><a href="https://web.works/contact" target="_blank" rel="noopener">Buy / partner on this domain</a></li></ul></div>
</div>
<div class="legal">© <span data-year>{datetime.date.today().year}</span> Star.Academy. All rights reserved. Star.Academy is an independent astronomy-education website. It is <strong>not affiliated with, endorsed by, or connected to</strong> the "Star Academy" television format or its owners (Banijay / Endemol Shine), nor NASA, ESA, NOAA or any brand mentioned; the word "star" is used in its ordinary astronomical sense. Sky data computed with astronomy-engine (MIT). Live data courtesy of public NASA, NOAA SWPC, The Space Devs, RocketLaunch.Live and Spaceflight News APIs. See <a href="{R}disclaimer.html">Disclaimer & Trademarks</a>.</div>
</div></footer>
<div id="cookie" role="dialog" aria-label="Cookie notice"><strong>Cookies & ads.</strong> We use cookies, including Google AdSense advertising cookies, to show ads that keep Star.Academy free and to remember your settings. <a href="{R}privacy.html">Privacy Policy</a>.<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn btn-gold btn-sm" data-cookie="all">Accept</button><button class="btn btn-ghost btn-sm" data-cookie="essential">Essential only</button></div></div>
<div class="modal" id="leadModal" role="dialog" aria-modal="true" aria-labelledby="lmTitle"><div class="box"><button class="x" aria-label="Close">×</button><span class="eyebrow">Before you go ✨</span><h3 id="lmTitle">Get your free personalized stargazing plan</h3><p class="muted small">Tell us your goals and budget — we’ll show you what to see tonight, the right gear, and the best sky events ahead. Takes 60 seconds.</p><a class="btn btn-gold" href="{R}get-started.html">Build my free plan →</a></div></div>
<div id="stickycta"><span class="small"><strong>New to stargazing?</strong> Free plan in 60s</span><a class="btn btn-gold btn-sm" href="{R}get-started.html">Start</a></div>
<script src="{R}assets/js/main.js" defer></script>
{js}</body>
</html>
'''


def build():
    count = 0
    for out, frag, title, desc, key, scripts, navkey in PAGES:
        p = os.path.join(SRC, frag)
        with open(p, encoding='utf-8') as f:
            body = f.read()
        extra = ''
        m = re.match(r'<!--HEAD\n(.*?)\nHEAD-->\n', body, re.S)
        if m:
            extra, body = m.group(1), body[m.end():]
        doc = layout(out, frag, title, desc, key, scripts, navkey, body, extra)
        dest = os.path.join(ROOT, out)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, 'w', encoding='utf-8') as f:
            f.write(doc)
        count += 1
    # sitemap
    urls = [o for o, *_ in PAGES if o != '404.html']
    pri = {'index.html': '1.0', 'tonight.html': '0.9', 'calendar.html': '0.9', 'get-started.html': '0.9', 'live.html': '0.8', 'academy.html': '0.8'}
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        loc = SITE + '/' + ('' if u == 'index.html' else u.replace('index.html', ''))
        freq = 'daily' if u in ('index.html', 'tonight.html', 'live.html', 'videos.html') else 'weekly'
        sm.append('<url><loc>%s</loc><lastmod>%s</lastmod><changefreq>%s</changefreq><priority>%s</priority></url>' % (loc, TODAY, freq, pri.get(u, '0.7')))
    sm.append('</urlset>')
    with open(os.path.join(ROOT, 'sitemap.xml'), 'w') as f:
        f.write('\n'.join(sm) + '\n')
    print('Built %d pages' % count)


if __name__ == '__main__':
    build()
