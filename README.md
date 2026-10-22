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
| "I have exam tomorrow, pray for me", "I'm feeling scared", "interview hai kal", "my mother is in hospital", "motivate me" | Answers like a caring pandit: warm words, a prayer offered for the person (🔊 prays aloud), the right mantras (Saraswati for exams, Ganesha for interviews and new beginnings, Hanuman for fear, Mahamrityunjaya for illness…), a Gita verse for strength, practical steps, and a related katha and rite. Recognises 14 situations, including grief, travel, money, marriage, anger, loneliness, sleep and good news. Notices who it is for ("my son…") and when ("tomorrow"). |
| Words about self-harm, or a medical emergency | **Safety first:** a compassionate message with India's Tele-MANAS helpline (14416 / 1-800-891-4416) and 112 (or 108 for an ambulance), with tap-to-call buttons — before anything else. |
| "bhagwat katha", "gita adhyay 2", "garud puran", "dhruv ki kahani", "हनुमान चालीसा" | Opens the Katha library: the granth chapter by chapter with key verses, the story told aloud with 🔊, the full path recited line by line, and how to hold the path or katha. |

The finder understands English, Hindi and Hinglish phrasing and common spelling variants (greh/grah/graha,
hawan/havan, pooja/puja, laxmi/lakshmi, kundali/kundli…), and Indian date and time styles ("3-8-1995, shaam 7 baje").

### Sections

| Section | What it does |
| --- | --- |
| **Ask Brahman** (`/chat`) | The finder described above. |
| **Panchang** (`/panchang`) | Vara, tithi, nakshatra, yoga, karana with end times; amanta/purnimanta masa with adhik masa detection; Vikram and Shaka samvat; sunrise, sunset, moonrise; Brahma and Abhijit muhurta, Rahu Kaal, Yamaganda, Gulika; monthly vratas linked to their guides. |
| **Kundli** (`/kundli`) | Birth chart (Lahiri ayanamsa, whole-sign houses, South Indian style) with the full reading, remedies, and Vimshottari maha/antardasha tables. |
| **Puja & Hawan** (`/kriyas`) | 26 guides (including the four path guides): general havan, Graha Shanti, Vastu Shanti, Mahamrityunjaya, Mangal dosh, Kaal Sarp, Shani shanti, daily and shodashopachara puja, Ganesha, Rudrabhishek, Lakshmi puja, Navratri, Hanuman/Sundarkand, Satyanarayan, Sandhya, Griha Pravesh, tarpan/shraddha, Ekadashi, Janmashtami, Karwa Chauth and the 16 samskaras. |
| **Katha** (`/katha`) | 30 entries:<br>• **Granths:** Bhagavad Gita (18 adhyayas, a key verse each), Shrimad Bhagavat (12 skandhas), Ramcharitmanas and Valmiki Ramayana (7 kandas), Sundarkand (episode by episode), Garuda Purana, Mahabharata (18 parvas), Shiv Mahapuran (7 samhitas), Durga Saptashati.<br>• **Full text:** Hanuman Chalisa, all 40 chaupais with meaning, recitable in full.<br>• **Kathas:** Dhruva, Prahlad and Narasimha, Gajendra Moksha, Samudra Manthan, Vamana, Krishna Janma, Govardhan, Sudama, Ajamila, Nachiketa, Harishchandra, Shravan Kumar, Ganga Avataran, Markandeya.<br>• **Vrat kathas:** Savitri–Satyavan, Shivaratri, Ganesh Chaturthi, Ekadashi, Karwa Chauth, Hartalika Teej.<br>• **Path guides:** Gita path, Bhagavat Saptah, Akhand Ramayan, Sundarkand and Garuda Purana path. |
| **Scriptures** (`/library`) | A map of the canon (Vedas, Upanishads, Itihasa, Puranas, Darshanas, Dharmashastra, Agamas, Vedangas). |

Everything — panchang, kundli, readings and search — runs on the user's device, so birth details never leave it.

### Brahman's voice

- **Speak to Brahman.** Tap 🎙️ and ask in Hindi, Hinglish or English. Hindi heard in Devanagari is understood too, because the finder transliterates it ("ग्रह शांति हवन" → "grah shanti havan").
- **Brahman speaks back** when "Brahman's voice" is on, and it turns on by itself when you speak. It uses a calm, slower, deeper delivery and prefers Indian male voices where the device has them. Sanskrit and Hindi are read by a Hindi voice, English by an Indian-English voice.
- **Narrated rituals.** In "Perform with me", each step is read out and then its mantra is recited. Every answer also has a 🔊 Listen button.
- **No server needed.** All of this uses the browser's built-in speech engine. Voice quality depends on the voices installed on the device.

### Knowledge that grows

If the server has an `ANTHROPIC_API_KEY`, questions the built-in granth cannot answer are **searched with AI and added to Brahman's knowledge**:

1. The answer is generated in the same structured form as the built-in rites: samagri, steps and mantras for a vidhi, or a written article for other questions.
2. It is checked and saved to a shared JSON store on the server (`KNOWLEDGE_FILE`, default `data/learned-knowledge.json`).
3. From then on, every user who asks something similar gets it instantly from Brahman's own knowledge, with no AI call. Learned entries are marked ✨.

To keep this under control:
- **Review:** `/knowledge` lists everything learned. Removing an entry needs `BRAHMAN_ADMIN_TOKEN`.
- **Cost guards:** 10 searches per hour per visitor, and `LEARN_DAILY_LIMIT` (default 200) per day across all users.
- **Safety:** personal details are never stored, and off-topic or harmful questions are declined.
- **Hosting:** host on a server with a persistent disk, or point `KNOWLEDGE_FILE` at one. Serverless filesystems are wiped between deploys.

Users never need a key. Without one, the app works fully from its built-in knowledge, just without learning.

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev                  # http://localhost:3000
# optional: cp .env.example .env.local and set ANTHROPIC_API_KEY so new questions are searched and learned
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | Type-check |
| `npm test` | Tests for the panchang and kundli maths (known dates), the reading engine, the birth-details parser, the finder (English, Hinglish and Devanagari), support and crisis detection, learned knowledge and the store, and voice segmentation |

## Project layout

```
app/
  api/learn/route.ts  Searches a new question with AI and saves the answer (only with a server key)
  api/knowledge/      Lists learned knowledge; removes entries with the admin token
  api/chat/route.ts   Optional conversational kundli reading
  knowledge/          Review page for learned knowledge
  chat/               Ask Brahman (offline finder UI)
  panchang/  kundli/  Client-side astronomy views
  kriyas/  library/   Static content pages
lib/
  finder.ts           Understands a question and picks the answer from the knowledge base
  parse.ts            Extracts date, time and place of birth from free text
  kriyas.ts           Puja and samskara guides (+ hawans.ts: hawan and shanti rites, mantras; paths.ts: path/katha guides)
  kathas/             Katha library: granths.ts (granths, Hanuman Chalisa) and stories.ts (kathas, vrat kathas)
  grahas.ts           Navagraha mantras, stotra verses, daan, samidha, gems
  reading.ts          Rule-based Parashari kundli reading: yogas, doshas, dashas, remedies
  jyotish.ts          Sidereal positions, panchang, kundli, Vimshottari dasha
  time.ts             Places, gazetteer and time-zone helpers
  speech.ts           Brahman's voice (speech synthesis) and listening (speech recognition)
  voice.ts            What Brahman says aloud for each kind of answer
  devanagari.ts       Devanagari → Latin transliteration for Hindi input
  learned.ts          Learned-knowledge types and registry (+ knowledge-store.ts on the server)
  support.ts          Feelings and life moments: comfort, prayers, mantras, steps; crisis and emergency detection
  library.ts          Scripture catalogue
  priest.ts           System prompts for AI search and the optional conversational reading
components/           RitualGuide, MantraBlock, KundliReport, GrahaCard, …
tests/                node:test suites
```

## Notes on accuracy

- The ayanamsa is a linear Lahiri approximation (well under an arcminute for 1900–2100); the lunar nodes are mean nodes.
- Panchang elements are taken at local sunrise. Published panchangas differ slightly by tradition (drik vs.
  Surya Siddhanta, amanta vs. purnimanta, vrata-day rules), so the app tells users to follow their sampradaya for vrata dates.
- The kundli reading applies classical Parashari rules mechanically; it describes tendencies and recommends gentle
  remedies (japa, daan, worship), never fear-based predictions.
- Long granths are given as chapter summaries with selected verses rather than full text, to avoid misquoting
  scripture; full texts are included only where they are short and well established (Hanuman Chalisa).
- Mantras are given as traditionally recited; rites follow common North Indian household practice and note where
  regional customs differ or a purohit is traditionally needed.
