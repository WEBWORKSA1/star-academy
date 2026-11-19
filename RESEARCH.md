# Competitive research — 38 world-class sites in the astronomy / night-sky niche

Method: each site was read through its own pages (site-restricted searches returning the sites' own page content, Nov 2026). For each: what it actually does → what Star.Academy adopts.

| # | Site | What it actually does | Adopted on Star.Academy |
|---|---|---|---|
| 1 | skyandtelescope.org | Weekly "Sky at a Glance" observing update every Friday with simple sky maps; interactive sky chart for any location/date (1600–2400); newsletter capture | Day-by-day "Tonight" guidance + interactive chart; newsletter "Sky Alerts" |
| 2 | earthsky.org | Daily "Tonight" posts, monthly visible-planets guide, meteor shower guide, community photos, store, recurring donation campaign banner | "Visible planets tonight" verdicts, meteor guide, donation banner |
| 3 | timeanddate.com/astronomy | Moon phases for your city, moonrise/set calculator, eclipse lookup 1900–2199, night-sky map, astronomical events list | City presets, moon rise/set, eclipse computation, events list |
| 4 | in-the-sky.org | Night-sky guide auto-tailored to your location; event feeds (occultations, appulses, moon); planetarium, orrery, rise/set tables | Location-tailored planet table + event feed |
| 5 | stellarium-web.org / stellarium.org | Browser planetarium with constellations, grids, DSO; desktop app with 600k+ stars | Lightweight in-browser sky chart (bright stars + lines) |
| 6 | heavens-above.com | Satellite & ISS pass predictions for any location; star charts per pass; 3D ISS | Live ISS tracker + "how to see the ISS" guide |
| 7 | spotthestation.nasa.gov | ISS sightings for 6,700+ locations, alerts, embeddable widget | Links + guide; alerts via our Sky Alerts list |
| 8 | apod.nasa.gov | Astronomy Picture of the Day since 1995, archive, explanations by astronomers | Daily APOD panel (auto-refreshed, credited) |
| 9 | science.nasa.gov (What's Up) | Monthly skywatching video + highlights list (meteors, conjunctions, supermoons) | Monthly highlights in calendar; NASA video feed |
| 10 | space.com | News + skywatching + heavy gear-deal/affiliate content (telescopes, binoculars) | Gear guide structure (affiliate-ready, Phase 9) |
| 11 | universetoday.com | Daily space & astronomy news, trending list | Auto-refreshed news feed |
| 12 | astronomy.com | Beginner guides, free downloadable PDF for new skygazers, telescope buying Q&A | Long-form beginner guides + lead magnet |
| 13 | skyatnightmagazine.com | Beginner hub, buyers' guides, coverage of the world's biggest astrophotography competition (APY) | Monthly contest page modeled on category-based competitions |
| 14 | darksky.org | Membership/donations, monthly giving, gift memberships, Dark Sky Places, chapters | Donation tiers, gift option, dark-sky guide |
| 15 | lightpollutionmap.info | Interactive world light-pollution map, SQM overlays, "find closest dark site" | Bortle self-test tool + link |
| 16 | cleardarksky.com | 96-hour astronomer's forecast (cloud, transparency, seeing) for 6,000+ sites | "Observing conditions" tips + link |
| 17 | swpc.noaa.gov | Aurora 30-minute forecast (OVATION), Kp index, aurora dashboard, JSON products | Live Kp/aurora outlook from NOAA JSON |
| 18 | spaceweatherlive.com | Real-time aurora & solar activity, Kp forecast tables, alerts, app | Aurora outlook card + aurora guide |
| 19 | nextspaceflight.com | Upcoming launch list with countdowns, providers, pads, events | Launch list with countdown |
| 20 | rocketlaunch.live | Launch schedule; free JSON for next 5 launches | Data source in automation |
| 21 | thespacedevs.com (LL2) | Free Launch Library 2 API (15 req/h non-auth) | Live client fetch + cached fallback |
| 22 | planetary.org | Member-funded nonprofit; monthly tiers ($4–$40), gift memberships, kids "Planetary Academy" $99/yr | Tiered memberships, kids track, gift support |
| 23 | seti.org | "SETI Stars" monthly donors, education programs, internships | Monthly supporter program; careers/volunteer page |
| 24 | zooniverse.org | People-powered research (Galaxy Zoo, etc.) | Citizen-science links in lessons |
| 25 | globeatnight.org | Citizen campaign measuring sky brightness; 6 easy star-hunting steps; data map | Bortle test + light-pollution guide |
| 26 | aavso.org | Variable-star org; membership benefits, mentor program, observing manuals | Mentorship framing in Academy |
| 27 | astrobin.com | Astrophotography hosting + Image of the Day + community groups | Contest gallery concept / "photo of the month" |
| 28 | cloudynights.com | Huge forum + classifieds; beginners forum | Community CTA (newsletter now, forum later) |
| 29 | highpointscientific.com | Retailer with strong buying guides ("best telescopes", "under $500", "for beginners") | Telescope Finder quiz + buying-help lead form |
| 30 | celestron.com | Product pages; "How to buy your first telescope"; app-enabled StarSense telescopes | Beginner telescope guide |
| 31 | theskylive.com | "Planets visible tonight" table, comets tonight, NEO approaches | Planet visibility table format |
| 32 | imo.net | Meteor shower calendar, weekly activity outlook, moonlight conditions on peak night | Shower list with moonlight score |
| 33 | astroleague.org | Observing programs by experience (novice → advanced), club directory | Course levels + badges |
| 34 | spacecamp.com | Paid camps for kids/families/adults; heavy registration funnels & FAQs | B2B "Book a Stargazing Night" lead form |
| 35 | starwalk.space | Monthly & weekly sky-event articles, "what's next to the Moon tonight" | Calendar + Moon-near-planet insights |
| 36 | esa.int (Kids/Education) | Classroom tools, posters, kids content, ESASky | Kids/teacher sections, ESA video feed |
| 37 | greatamericaneclipse.com | Eclipse maps, field guide, certified glasses shop, safety | Eclipse safety guide + calendar |
| 38 | unistellar.com | Smart telescopes + citizen-science network with SETI | Smart-telescope option in Telescope Finder |

## Patterns that matter most (and how we used them)
1. **Location-personalized "tonight" data** is the #1 recurring-traffic feature (timeanddate, in-the-sky, theskylive) → built in-browser, free forever.
2. **Event calendars** drive seasonal spikes (meteors, eclipses, supermoons) → computed for 12 months rolling, with .ics export.
3. **Donor-funded models** convert with tiers + transparency + "free to use, not free to make" messaging (planetary.org, darksky.org, Khan-style) → Support page.
4. **Buying guides + quizzes** are where the money is (High Point, Space.com) → Telescope Finder + lead funnel.
5. **Competitions** drive UGC and sponsor money (APY, AstroBin IOTD) → monthly Night Sky Challenge.
6. **Free public APIs** (NOAA, LL2, RocketLaunch.Live, APOD, SNAPI) make automation cheap → GitHub Actions refresher.
