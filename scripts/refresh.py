#!/usr/bin/env python3
"""Star.Academy data refresher (stdlib only).

Fetches public, free data sources and writes normalized JSON into /data.
Each source fails independently: on error the previous file is kept untouched.
Files are only rewritten when their content actually changes (no commit churn).

Sources:
  - NASA APOD (api.nasa.gov, DEMO_KEY or NASA_API_KEY env) with apod.nasa.gov HTML fallback
  - Launch Library 2 (The Space Devs) with RocketLaunch.Live fallback
  - NOAA SWPC planetary K-index forecast
  - Spaceflight News API v4
  - YouTube channel RSS feeds (no API key)
"""
import json, os, re, sys, time, urllib.request, urllib.error, datetime, html
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')
UA = 'Mozilla/5.0 (compatible; StarAcademyBot/1.0; +https://star.academy/about.html)'
NOW = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat()

CHANNELS = [
    # (display name, channel id or None, handle used to resolve the id if needed)
    ('NASA', 'UCLA_DiR1FfKNvjuUpBHmylQ', '@NASA'),
    ('PBS Space Time', 'UC7_gcs09iThXybpVgjHZ_7g', '@pbsspacetime'),
    ('ESA', None, '@EuropeanSpaceAgency'),
    ('NASA JPL', None, '@NASAJPL'),
    ('ESO', None, '@ESOobservatory'),
    ('Dr. Becky', None, '@DrBecky'),
    ('Astrum', None, '@astrumspace'),
    ('Anton Petrov', None, '@whatdamath'),
    ('Cool Worlds', None, '@CoolWorldsLab'),
    ('Scott Manley', None, '@scottmanley'),
    ('Fraser Cain', None, '@frasercain'),
]


def get(url, timeout=25, accept='application/json'):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': accept})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def get_json(url):
    return json.loads(get(url).decode('utf-8'))


def save(name, payload):
    """Write data/<name>.json only if the meaningful content changed."""
    path = os.path.join(DATA, name + '.json')
    old = None
    if os.path.exists(path):
        try:
            with open(path, encoding='utf-8') as f:
                old = json.load(f)
        except Exception:
            old = None
    strip = lambda d: {k: v for k, v in (d or {}).items() if k != 'updated'} if isinstance(d, dict) else d
    if old is not None and strip(old) == strip(payload):
        print('  = %s unchanged' % name)
        return False
    payload = dict(payload)
    payload['updated'] = NOW
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=1)
    print('  + %s updated' % name)
    return True


def step(label, fn):
    print('-> ' + label)
    try:
        fn()
    except Exception as e:  # keep previous data on any failure
        print('  ! %s failed: %r' % (label, e))


# ---------------- APOD ----------------
def apod():
    key = os.environ.get('NASA_API_KEY') or 'DEMO_KEY'
    out, err = None, None
    for attempt in range(3):
        try:
            j = get_json('https://api.nasa.gov/planetary/apod?api_key=' + key)
            if os.environ.get('APOD_DEBUG'):
                print('  [debug] api', json.dumps({k: (str(v)[:140] if v else v) for k, v in j.items()}))
            bad = (not j.get('title') or not j.get('url') or '/themes/' in j.get('url', '')
                   or j.get('title', '').strip().lower() in ('nasa science', 'astronomy picture of the day'))
            if not bad:
                out = {k: j.get(k) for k in ('date', 'title', 'explanation', 'url', 'hdurl', 'media_type', 'copyright')}
                break
        except Exception as e:
            err = e
            time.sleep(4 * (attempt + 1))
    if out is None:
        print('  api failed (%r), reading apod.nasa.gov page' % err)
        out = apod_page()
    if (not out.get('title') or not out.get('url') or '/themes/' in (out.get('url') or '')
            or out['title'].strip().lower() in ('nasa science', 'astronomy picture of the day')):
        raise ValueError('invalid APOD data')
    save('apod', out)


def apod_page():
    page = get('https://apod.nasa.gov/apod/astropix.html', accept='text/html').decode('utf-8', 'replace')
    if os.environ.get('APOD_DEBUG'):
        print('  [debug] page length', len(page))
        for pat in (r'<h[1-3][^>]*>.{0,160}', r'<img[^>]+>', r'Explanation.{0,200}', r'Credit.{0,200}', r'<title>.{0,120}'):
            for m in re.findall(pat, page, re.I | re.S)[:8]:
                print('  [debug]', re.sub(r'\s+', ' ', m)[:260])
    clean = lambda s: html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', s or ''))).strip()
    def meta(prop):
        m = (re.search(r'<meta[^>]+(?:property|name)=["\']%s["\'][^>]+content=["\']([^"\']+)' % re.escape(prop), page, re.I)
             or re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']%s["\']' % re.escape(prop), page, re.I))
        return html.unescape(m.group(1)).strip() if m else ''
    title = meta('og:title') or meta('twitter:title')
    title = re.sub(r'^\s*APOD:\s*\d{4}\s+\w+\s+\d{1,2}\s*[\u2013\u2014-]\s*', '', title)
    title = re.sub(r'\s*[|\u2013\u2014-]\s*NASA Science\s*$', '', title).strip()
    img = meta('og:image') or meta('twitter:image')
    expl = meta('og:description') or meta('description')
    m = re.search(r'Explanation:\s*</b>(.*?)(?:<p>|</p>)', page, re.I | re.S)
    if m and len(clean(m.group(1))) > len(expl):
        expl = clean(m.group(1))
    if not title or title.lower() in ('nasa science', 'apod'):
        t = re.search(r'<center>\s*<b>\s*(.*?)\s*</b>', page, re.I | re.S) or re.search(r'<h1[^>]*>(.*?)</h1>', page, re.I | re.S)
        title = clean(t.group(1)) if t else ''
    if not img or '/themes/' in img:
        i = re.search(r'<IMG\s+SRC="([^"]+)"', page, re.I) or re.search(r'<img[^>]+src="([^"]+/wp-content/uploads/[^"]+)"', page, re.I)
        img = i.group(1) if i else ''
        if img and not img.startswith('http'):
            img = 'https://apod.nasa.gov/apod/' + img
    cr = re.search(r'(?:Image\s+)?Credit(?:\s*&amp;\s*Copyright|\s*&\s*Copyright)?\s*:\s*</b>(.*?)</', page, re.I | re.S)
    return {'date': datetime.date.today().isoformat(), 'title': title, 'explanation': expl, 'url': img,
            'hdurl': None, 'media_type': 'image', 'copyright': clean(cr.group(1)) if cr else None}


# ---------------- Launches ----------------
def launches():
    items = []
    try:
        j = get_json('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=12&hide_recent_previous=true')
        for l in j.get('results', []):
            items.append({
                'name': l.get('name'), 'net': l.get('net') or l.get('window_start'),
                'provider': (l.get('launch_service_provider') or {}).get('name', ''),
                'location': ((l.get('pad') or {}).get('location') or {}).get('name', ''),
                'status': (l.get('status') or {}).get('abbrev', ''),
                'image': l.get('image') or ''})
    except Exception as e:
        print('  LL2 failed (%r), trying RocketLaunch.Live' % e)
        j = get_json('https://fdo.rocketlaunch.live/json/launches/next/5')
        for l in j.get('result', []):
            net = l.get('win_open') or l.get('t0')
            if not net and l.get('sort_date'):
                net = datetime.datetime.fromtimestamp(int(l['sort_date']), datetime.timezone.utc).isoformat()
            items.append({'name': '%s | %s' % ((l.get('vehicle') or {}).get('name', ''), l.get('name', '')),
                          'net': net, 'provider': (l.get('provider') or {}).get('name', ''),
                          'location': ((l.get('pad') or {}).get('location') or {}).get('name', ''),
                          'status': '', 'image': ''})
    items = [i for i in items if i.get('net')]
    if not items:
        raise ValueError('no launches')
    save('launches', {'launches': items})


# ---------------- Space weather ----------------
def spaceweather():
    j = get_json('https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json')
    rows = []
    if j and isinstance(j[0], list):
        for r in j[1:]:
            rows.append({'t': r[0], 'kp': float(r[1]), 'obs': r[2]})
    else:
        for r in j:
            rows.append({'t': r.get('time_tag'), 'kp': float(r.get('kp', r.get('Kp', 0))), 'obs': r.get('observed')})
    if not rows:
        raise ValueError('empty kp')
    save('spaceweather', {'forecast': rows})


# ---------------- News ----------------
def news():
    j = get_json('https://api.spaceflightnewsapi.net/v4/articles/?limit=12')
    arts = [{'title': a.get('title'), 'url': a.get('url'), 'image': a.get('image_url'), 'site': a.get('news_site'),
             'summary': (a.get('summary') or '')[:400], 'published': a.get('published_at')} for a in j.get('results', [])]
    if not arts:
        raise ValueError('no news')
    save('news', {'articles': arts})


# ---------------- Videos ----------------
NS = {'a': 'http://www.w3.org/2005/Atom', 'yt': 'http://www.youtube.com/xml/schemas/2015', 'media': 'http://search.yahoo.com/mrss/'}


def resolve_channel(handle, cache):
    if handle in cache:
        return cache[handle]
    page = get('https://www.youtube.com/' + handle, accept='text/html').decode('utf-8', 'replace')
    m = (re.search(r'"externalId":"(UC[\w-]{22})"', page) or re.search(r'<meta itemprop="identifier" content="(UC[\w-]{22})"', page)
         or re.search(r'"channelId":"(UC[\w-]{22})"', page) or re.search(r'channel_id=(UC[\w-]{22})', page))
    if not m:
        raise ValueError('channel id not found for ' + handle)
    cache[handle] = m.group(1)
    return cache[handle]


def videos():
    cache_path = os.path.join(DATA, 'channels.json')
    try:
        cache = json.load(open(cache_path)) if os.path.exists(cache_path) else {}
    except Exception:
        cache = {}
    all_v = []
    for name, cid, handle in CHANNELS:
        try:
            cid = cid or resolve_channel(handle, cache)
            xml = get('https://www.youtube.com/feeds/videos.xml?channel_id=' + cid, accept='application/atom+xml')
            root = ET.fromstring(xml)
            n = 0
            for e in root.findall('a:entry', NS):
                link = e.find('a:link', NS)
                href = link.get('href') if link is not None else ''
                if '/shorts/' in href:
                    continue
                vid = e.findtext('yt:videoId', default='', namespaces=NS)
                if not vid:
                    continue
                all_v.append({'id': vid, 'title': e.findtext('a:title', default='', namespaces=NS),
                              'channel': name, 'published': e.findtext('a:published', default='', namespaces=NS)})
                n += 1
                if n >= 8:
                    break
            print('  %s: %d videos' % (name, n))
            time.sleep(0.5)
        except Exception as ex:
            print('  ! %s skipped: %r' % (name, ex))
    with open(cache_path, 'w') as f:
        json.dump(cache, f, indent=1, sort_keys=True)
    if not all_v:
        raise ValueError('no videos fetched')
    all_v.sort(key=lambda v: v['published'], reverse=True)
    save('videos', {'videos': all_v[:96]})


if __name__ == '__main__':
    os.makedirs(DATA, exist_ok=True)
    only = set(sys.argv[1:])
    for label, fn in [('apod', apod), ('launches', launches), ('spaceweather', spaceweather), ('news', news), ('videos', videos)]:
        if not only or label in only:
            step(label, fn)
    print('done', NOW)
