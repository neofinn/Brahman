// The nine grahas: mantras, offerings and remedies used by the Navagraha shanti and kundli readings.
import type { Mantra } from "./ritual-common.ts";

export interface Graha {
  name: string; // English name as used in lib/jyotish.ts
  sanskrit: string;
  devanagari: string;
  day: string;
  color: string;
  grain: string;
  samidha: string; // sacred wood for its ahutis (Yajnavalkya Smriti)
  gem: string;
  deity: string;
  daan: string;
  japaCount: number;
  beej: Mantra;
  stotra: Mantra; // verse from the Navagraha Stotra attributed to Vyasa
  signifies: string;
}

export const GRAHAS: Graha[] = [
  {
    name: "Sun", sanskrit: "Surya", devanagari: "सूर्य", day: "Sunday", color: "red / saffron", grain: "wheat",
    samidha: "Arka (madar)", gem: "ruby (manikya)", deity: "Surya Narayana; also Shri Rama", daan: "wheat, jaggery, copper, red cloth",
    japaCount: 7000,
    beej: { devanagari: "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः", iast: "oṃ hrāṃ hrīṃ hrauṃ saḥ sūryāya namaḥ", meaning: "Beej mantra of Surya." },
    stotra: {
      devanagari: "जपाकुसुमसंकाशं काश्यपेयं महाद्युतिम्। तमोऽरिं सर्वपापघ्नं प्रणतोऽस्मि दिवाकरम्॥",
      iast: "japākusumasaṃkāśaṃ kāśyapeyaṃ mahādyutim | tamo'riṃ sarvapāpaghnaṃ praṇato'smi divākaram ||",
      meaning: "I bow to Divakara, red as the hibiscus, son of Kashyapa, of great radiance, enemy of darkness, destroyer of all sins.",
      source: "Navagraha Stotra (Vyasa)",
    },
    signifies: "soul, father, authority, vitality, government and self-confidence",
  },
  {
    name: "Moon", sanskrit: "Chandra", devanagari: "चन्द्र", day: "Monday", color: "white", grain: "rice",
    samidha: "Palasha", gem: "pearl (moti)", deity: "Shiva and Parvati", daan: "rice, milk, white cloth, silver",
    japaCount: 11000,
    beej: { devanagari: "ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः", iast: "oṃ śrāṃ śrīṃ śrauṃ saḥ candramase namaḥ", meaning: "Beej mantra of Chandra." },
    stotra: {
      devanagari: "दधिशङ्खतुषाराभं क्षीरोदार्णवसम्भवम्। नमामि शशिनं सोमं शम्भोर्मुकुटभूषणम्॥",
      iast: "dadhiśaṅkhatuṣārābhaṃ kṣīrodārṇavasambhavam | namāmi śaśinaṃ somaṃ śambhor mukuṭabhūṣaṇam ||",
      meaning: "I bow to Soma, white as curd, conch and snow, born of the ocean of milk, the ornament on Shambhu's crown.",
      source: "Navagraha Stotra (Vyasa)",
    },
    signifies: "mind, mother, emotions, peace, nourishment and public life",
  },
  {
    name: "Mars", sanskrit: "Mangala", devanagari: "मङ्गल", day: "Tuesday", color: "red", grain: "toor (arhar) dal",
    samidha: "Khadira (khair)", gem: "red coral (moonga)", deity: "Hanuman; Kartikeya", daan: "masoor dal, red cloth, jaggery, copper",
    japaCount: 10000,
    beej: { devanagari: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः", iast: "oṃ krāṃ krīṃ krauṃ saḥ bhaumāya namaḥ", meaning: "Beej mantra of Mangala (Bhauma)." },
    stotra: {
      devanagari: "धरणीगर्भसम्भूतं विद्युत्कान्तिसमप्रभम्। कुमारं शक्तिहस्तं तं मङ्गलं प्रणमाम्यहम्॥",
      iast: "dharaṇīgarbhasambhūtaṃ vidyutkāntisamaprabham | kumāraṃ śaktihastaṃ taṃ maṅgalaṃ praṇamāmy aham ||",
      meaning: "I bow to Mangala, born of the Earth, shining like lightning, the youth who holds the spear.",
      source: "Navagraha Stotra (Vyasa)",
    },
    signifies: "courage, energy, siblings, land, property, discipline and conflict",
  },
  {
    name: "Mercury", sanskrit: "Budha", devanagari: "बुध", day: "Wednesday", color: "green", grain: "moong dal",
    samidha: "Apamarga (chirchita)", gem: "emerald (panna)", deity: "Vishnu; Ganesha", daan: "moong dal, green cloth, green vegetables",
    japaCount: 9000,
    beej: { devanagari: "ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः", iast: "oṃ brāṃ brīṃ brauṃ saḥ budhāya namaḥ", meaning: "Beej mantra of Budha." },
    stotra: {
      devanagari: "प्रियङ्गुकलिकाश्यामं रूपेणाप्रतिमं बुधम्। सौम्यं सौम्यगुणोपेतं तं बुधं प्रणमाम्यहम्॥",
      iast: "priyaṅgukalikāśyāmaṃ rūpeṇāpratimaṃ budham | saumyaṃ saumyaguṇopetaṃ taṃ budhaṃ praṇamāmy aham ||",
      meaning: "I bow to Budha, dark as the priyangu bud, of matchless form, gentle and full of gentle virtues.",
      source: "Navagraha Stotra (Vyasa)",
    },
    signifies: "intellect, speech, learning, trade, communication and friends",
  },
  {
    name: "Jupiter", sanskrit: "Guru (Brihaspati)", devanagari: "गुरु", day: "Thursday", color: "yellow", grain: "chana dal",
    samidha: "Ashvattha (peepal)", gem: "yellow sapphire (pukhraj)", deity: "Vishnu; Dakshinamurti", daan: "chana dal, turmeric, yellow cloth, bananas, books",
    japaCount: 19000,
    beej: { devanagari: "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः", iast: "oṃ grāṃ grīṃ grauṃ saḥ gurave namaḥ", meaning: "Beej mantra of Guru." },
    stotra: {
      devanagari: "देवानां च ऋषीणां च गुरुं काञ्चनसन्निभम्। बुद्धिभूतं त्रिलोकेशं तं नमामि बृहस्पतिम्॥",
      iast: "devānāṃ ca ṛṣīṇāṃ ca guruṃ kāñcanasannibham | buddhibhūtaṃ trilokeśaṃ taṃ namāmi bṛhaspatim ||",
      meaning: "I bow to Brihaspati, teacher of the devas and rishis, golden in hue, wisdom embodied, lord of the three worlds.",
      source: "Navagraha Stotra (Vyasa)",
    },
    signifies: "wisdom, dharma, teachers, children, wealth, marriage (for women) and good fortune",
  },
  {
    name: "Venus", sanskrit: "Shukra", devanagari: "शुक्र", day: "Friday", color: "white / pastel", grain: "white beans (lobia)",
    samidha: "Udumbara (gular)", gem: "diamond (heera)", deity: "Lakshmi", daan: "rice, sugar, curd, white cloth, perfume",
    japaCount: 16000,
    beej: { devanagari: "ॐ द्रां द्रीं द्रौं सः शुक्राय नमः", iast: "oṃ drāṃ drīṃ drauṃ saḥ śukrāya namaḥ", meaning: "Beej mantra of Shukra." },
    stotra: {
      devanagari: "हिमकुन्दमृणालाभं दैत्यानां परमं गुरुम्। सर्वशास्त्रप्रवक्तारं भार्गवं प्रणमाम्यहम्॥",
      iast: "himakundamṛṇālābhaṃ daityānāṃ paramaṃ gurum | sarvaśāstrapravaktāraṃ bhārgavaṃ praṇamāmy aham ||",
      meaning: "I bow to Bhargava, white as snow, jasmine and lotus fibre, supreme teacher of the daityas, expounder of all shastras.",
      source: "Navagraha Stotra (Vyasa)",
    },
    signifies: "love, marriage, beauty, arts, comforts, vehicles and luxury",
  },
  {
    name: "Saturn", sanskrit: "Shani", devanagari: "शनि", day: "Saturday", color: "black / dark blue", grain: "black sesame (til)",
    samidha: "Shami", gem: "blue sapphire (neelam)", deity: "Shani Dev; Hanuman; Shiva",
    daan: "black sesame, mustard oil, urad dal, black cloth, iron, footwear to the needy",
    japaCount: 23000,
    beej: { devanagari: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः", iast: "oṃ prāṃ prīṃ prauṃ saḥ śanaiścarāya namaḥ", meaning: "Beej mantra of Shani." },
    stotra: {
      devanagari: "नीलाञ्जनसमाभासं रविपुत्रं यमाग्रजम्। छायामार्तण्डसम्भूतं तं नमामि शनैश्चरम्॥",
      iast: "nīlāñjanasamābhāsaṃ raviputraṃ yamāgrajam | chāyāmārtaṇḍasambhūtaṃ taṃ namāmi śanaiścaram ||",
      meaning: "I bow to Shanaishchara, dark as blue collyrium, son of the Sun, elder brother of Yama, born of Chhaya and Martanda.",
      source: "Navagraha Stotra (Vyasa)",
    },
    signifies: "discipline, hard work, longevity, service, delays, justice and detachment",
  },
  {
    name: "Rahu", sanskrit: "Rahu", devanagari: "राहु", day: "Saturday", color: "smoky / dark blue", grain: "urad dal",
    samidha: "Durva grass", gem: "hessonite (gomed)", deity: "Durga; Bhairava", daan: "black urad, blanket, coconut, mustard",
    japaCount: 18000,
    beej: { devanagari: "ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः", iast: "oṃ bhrāṃ bhrīṃ bhrauṃ saḥ rāhave namaḥ", meaning: "Beej mantra of Rahu." },
    stotra: {
      devanagari: "अर्धकायं महावीर्यं चन्द्रादित्यविमर्दनम्। सिंहिकागर्भसम्भूतं तं राहुं प्रणमाम्यहम्॥",
      iast: "ardhakāyaṃ mahāvīryaṃ candrādityavimardanam | siṃhikāgarbhasambhūtaṃ taṃ rāhuṃ praṇamāmy aham ||",
      meaning: "I bow to Rahu, of half a body and great valour, who eclipses the Moon and Sun, born of Simhika.",
      source: "Navagraha Stotra (Vyasa)",
    },
    signifies: "ambition, foreign lands, technology, sudden events, illusion and obsession",
  },
  {
    name: "Ketu", sanskrit: "Ketu", devanagari: "केतु", day: "Tuesday", color: "multicoloured / grey", grain: "horse gram (kulthi)",
    samidha: "Kusha grass", gem: "cat's eye (lehsunia)", deity: "Ganesha", daan: "sesame, blanket, multicoloured cloth, food for dogs",
    japaCount: 17000,
    beej: { devanagari: "ॐ स्रां स्रीं स्रौं सः केतवे नमः", iast: "oṃ srāṃ srīṃ srauṃ saḥ ketave namaḥ", meaning: "Beej mantra of Ketu." },
    stotra: {
      devanagari: "पलाशपुष्पसंकाशं तारकाग्रहमस्तकम्। रौद्रं रौद्रात्मकं घोरं तं केतुं प्रणमाम्यहम्॥",
      iast: "palāśapuṣpasaṃkāśaṃ tārakāgrahamastakam | raudraṃ raudrātmakaṃ ghoraṃ taṃ ketuṃ praṇamāmy aham ||",
      meaning: "I bow to Ketu, coloured like the palasha flower, head of the stars and planets, fierce and awe-inspiring.",
      source: "Navagraha Stotra (Vyasa)",
    },
    signifies: "spirituality, detachment, past karma, intuition and moksha",
  },
];

export function getGraha(name: string): Graha {
  const g = GRAHAS.find((x) => x.name === name);
  if (!g) throw new Error(`Unknown graha ${name}`);
  return g;
}
