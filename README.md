# Brahman ॐ

**Brahman** is a Sanatan Dharma purohit (priest) app. Tell it the puja or hawan you want to perform and it tells you
what you need, walks you through every step and recites the mantras; give it your birth details and it makes your
kundli and reads it — like a family pandit, entirely offline.

## Features

Brahman works **entirely from its built-in knowledge** — no account, no API key and no internet connection to an AI
service is needed. Ask it the way you would ask your pandit-ji:

| You say | Brahman does |
| --- | --- |
| "I wanna perform greh shanti hawan" | Opens the Graha Shanti (Navagraha) Hawan: when to do it, duration, a samagri checklist, all 26 steps of the vidhi with every mantra (Devanagari, IAST, meaning), and **▶ Perform with me** — a step-by-step guided mode. |
| tap 🔊 Recite / 🔁 Japa ×11 / 📿 ×108 | Recites the mantra aloud with the device's speech voice (Hindi/Sanskrit), counting repetitions. |
| "My DOB is 15 Jan 1990, 6:30 am, Delhi" (or "kundli banao", then the details one by one) | Prepares the janma kundli and a full reading: lagna, rashi, nakshatra, naam akshar, gana and nadi, grahas by house with dignity, yogas (Gajakesari, Budhaditya, Mahapurusha, Raja, Dhana, Kemadruma…), Mangal dosh with cancellations, Kaal Sarp, Sade Sati and Dhaiya with dates, mahadasha and antardasha, favourable deity/day/gems, and remedies with the right graha mantras and rites. |
| "shani mantra", "gayatri mantra" | Shows the mantra or the graha's beej mantra, Navagraha stotra verse, day, daan, grain, samidha and gem. |
| "aaj ka panchang" | Today's panchang for any city. |

The finder understands English, Hindi and Hinglish phrasing and common spelling variants (greh/grah/graha,
hawan/havan, pooja/puja, laxmi/lakshmi, kundali/kundli…), and Indian date and time styles ("3-8-1995, shaam 7 baje").

### Sections

| Section | What it does |
| --- | --- |
| **Ask Brahman** (`/chat`) | The finder described above. |
| **Panchang** (`/panchang`) | Vara, tithi, nakshatra, yoga, karana with end times; amanta/purnimanta masa with adhik masa detection; Vikram and Shaka samvat; sunrise, sunset, moonrise; Brahma and Abhijit muhurta, Rahu Kaal, Yamaganda, Gulika; monthly vratas linked to their guides. |
| **Kundli** (`/kundli`) | Birth chart (Lahiri ayanamsa, whole-sign houses, South Indian style) with the full reading, remedies, and Vimshottari maha/antardasha tables. |
| **Puja & Hawan** (`/kriyas`) | 22 guides: general havan, Graha Shanti, Vastu Shanti, Mahamrityunjaya, Mangal dosh, Kaal Sarp, Shani shanti, daily and shodashopachara puja, Ganesha, Rudrabhishek, Lakshmi puja, Navratri, Hanuman/Sundarkand, Satyanarayan, Sandhya, Griha Pravesh, tarpan/shraddha, Ekadashi, Janmashtami, Karwa Chauth and the 16 samskaras. |
| **Scriptures** (`/library`) | A map of the canon (Vedas, Upanishads, Itihasa, Puranas, Darshanas, Dharmashastra, Agamas, Vedangas). |

Everything — panchang, kundli, readings and search — runs on the user's device, so birth details never leave it.

### Optional AI answers

If the person hosting the app sets `ANTHROPIC_API_KEY` on the server, Brahman also offers "✨ Ask AI in depth" for
questions outside its built-in knowledge, and a conversational kundli reading. Users never need a key, and without
one the app works exactly the same, minus that button.

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev                  # http://localhost:3000
# optional: cp .env.example .env.local and set ANTHROPIC_API_KEY to enable "Ask AI in depth"
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | Type-check |
| `npm test` | Tests for the panchang and kundli maths (known dates), the reading engine, the birth-details parser and the finder |

## Project layout

```
app/
  api/chat/route.ts   Optional AI endpoint (only used when the server has a key)
  chat/               Ask Brahman (offline finder UI)
  panchang/  kundli/  Client-side astronomy views
  kriyas/  library/   Static content pages
lib/
  finder.ts           Understands a question and picks the answer from the knowledge base
  parse.ts            Extracts date, time and place of birth from free text
  kriyas.ts           Puja and samskara guides (+ hawans.ts: hawan and shanti rites, mantras)
  grahas.ts           Navagraha mantras, stotra verses, daan, samidha, gems
  reading.ts          Rule-based Parashari kundli reading: yogas, doshas, dashas, remedies
  jyotish.ts          Sidereal positions, panchang, kundli, Vimshottari dasha
  time.ts             Places, gazetteer and time-zone helpers
  speech.ts           Mantra recitation with the browser's speech synthesis
  library.ts          Scripture catalogue
  priest.ts           System prompt for the optional AI answers
components/           RitualGuide, MantraBlock, KundliReport, GrahaCard, …
tests/                node:test suites
```

## Notes on accuracy

- The ayanamsa is a linear Lahiri approximation (well under an arcminute for 1900–2100); the lunar nodes are mean nodes.
- Panchang elements are taken at local sunrise. Published panchangas differ slightly by tradition (drik vs.
  Surya Siddhanta, amanta vs. purnimanta, vrata-day rules), so the app tells users to follow their sampradaya for vrata dates.
- The kundli reading applies classical Parashari rules mechanically; it describes tendencies and recommends gentle
  remedies (japa, daan, worship), never fear-based predictions.
- Mantras are given as traditionally recited; rites follow common North Indian household practice and note where
  regional customs differ or a purohit is traditionally needed.
