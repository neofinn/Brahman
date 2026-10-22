# Brahman ॐ

**Brahman** is a Sanatan Dharma purohit (priest) app. It answers questions on the Vedas, Upanishads, Puranas,
Itihasas, Darshanas, Agamas, kriyas and Jyotisha, computes the daily panchang and janma kundli, and guides families
through puja step by step.

## Features

| Section | What it does |
| --- | --- |
| **Ask Brahman** (`/chat`) | Streaming chat with an AI priest powered by Claude. Answers cite scripture (Devanagari, IAST and translation), respect sampradaya and regional differences, and reply in the user's language (English, Hindi, Hinglish, Tamil and others). |
| **Panchang** (`/panchang`) | Vara, tithi, nakshatra, yoga, karana with end times; amanta/purnimanta masa with adhik masa detection; Vikram and Shaka samvat; sunrise, sunset, moonrise; Brahma and Abhijit muhurta, Rahu Kaal, Yamaganda, Gulika; monthly vratas. Works for 20+ preset cities or the device's location. |
| **Kundli** (`/kundli`) | Sidereal birth chart (Lahiri ayanamsa, whole-sign houses) in South Indian style, graha positions with nakshatra and pada, retrogression, and Vimshottari mahadashas. One tap sends the chart to Brahman for a classical Parashari reading. |
| **Puja Vidhi** (`/kriyas`) | Guides with samagri and mantras: daily panchopachara puja, shodashopachara puja, Ganesha puja, Satyanarayan katha, Ekadashi vrat, Sandhya and Gayatri japa, griha pravesha, pitru tarpana and shraddha, and the sixteen samskaras. |
| **Scriptures** (`/library`) | A map of the canon (Vedas, Upanishads, Itihasa, Puranas, Darshanas, Dharmashastra, Agamas, Vedangas). Each text opens a conversation about it. |

Panchang and kundli are computed in the browser with [astronomy-engine](https://github.com/cosinekitty/astronomy),
so birth details are only sent to the server if the user asks Brahman for a reading.

## Getting started

Requires Node.js 20+ and an [Anthropic API key](https://console.anthropic.com/).

```bash
npm install
cp .env.example .env.local   # then set ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | Type-check |
| `npm test` | Panchang and kundli tests against known dates (Ram Mandir pran pratishtha, Maha Shivaratri 2025, Diwali 2024, Adhik Shravana 2023) |

## Project layout

```
app/
  api/chat/route.ts   Streaming chat endpoint (Claude, with server-side refusal fallback)
  chat/               Chat UI
  panchang/  kundli/  Client-side astronomy views
  kriyas/  library/   Static content pages
lib/
  priest.ts           Brahman's persona and knowledge charter (system prompt)
  jyotish.ts          Sidereal positions, panchang, kundli, Vimshottari dasha
  time.ts             Places and time-zone helpers
  kriyas.ts           Puja vidhi content
  library.ts          Scripture catalogue
tests/                node:test suite for lib/jyotish.ts
```

## Notes on accuracy

- The ayanamsa is a linear Lahiri approximation (well under an arcminute for 1900–2100); the lunar nodes are mean nodes.
- Panchang elements are taken at local sunrise. Published panchangas differ slightly by tradition (drik vs.
  Surya Siddhanta, amanta vs. purnimanta, vrata-day rules), so the app tells users to follow their sampradaya for vrata dates.
- Brahman is an AI and can make mistakes; the UI reminds users to verify important verses and muhurtas with their
  family purohit.
