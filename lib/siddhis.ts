// Siddhis in Sanatan Dharma: the yogic powers of the Bhagavata Purana and the Yoga Sutra, the ashta siddhi and nava
// nidhi, mantra and tantric siddhis, and the rajasic and tamasic practices the tradition warns against — classified by
// the three gunas as the Bhagavad Gita (ch. 17) classifies tapas and worship.
//
// Sattvic siddhis come with the traditional path to them. Rajasic and tamasic practices meant to control or harm others
// are described with their sources and dangers only; their mantras and procedures are deliberately not given.
import type { Mantra } from "./ritual-common.ts";

export type Guna = "sattvic" | "rajasic" | "tamasic";

export type SiddhiGroup = "ashta" | "bhagavata" | "yoga-sutra" | "mantra" | "hatha" | "shatkarma" | "sadhana" | "nidhi";

export interface Siddhi {
  id: string;
  name: string;
  devanagari: string;
  guna: Guna;
  group: SiddhiGroup;
  /** What the siddhi is said to give. */
  meaning: string;
  sources: string[];
  /** How tradition says it arises — given only for practices that harm no one. */
  path?: string;
  /** The tradition's own caution. */
  caution?: string;
  /** For a practice Brahman will not teach: what to do instead for the same need. */
  instead?: string;
  /** Ritual guides (lib/kriyas.ts) for the sattvic alternative. */
  rituals?: string[];
  keywords: string[];
}

export const GROUP_TITLES: Record<SiddhiGroup, string> = {
  ashta: "Ashta Siddhi — the eight great siddhis",
  nidhi: "Nava Nidhi — the nine treasures",
  bhagavata: "Siddhis taught by Shri Krishna (Bhagavata Purana 11.15)",
  "yoga-sutra": "Siddhis of samyama (Yoga Sutra, Vibhuti Pada)",
  mantra: "Mantra and sadhana siddhis",
  hatha: "Siddhis of Hatha Yoga, Swara and the Siddha tradition",
  shatkarma: "Shatkarma — the six tantric acts",
  sadhana: "Sadhanas of spirits and the cremation ground",
};

export const GUNA_INFO: Record<Guna, { title: string; devanagari: string; text: string }> = {
  sattvic: {
    title: "Sattvic",
    devanagari: "सात्त्विक",
    text: "Arise from devotion, japa, tapas and meditation done for God and the good of all. They come as by-products on the path to moksha and harm no one.",
  },
  rajasic: {
    title: "Rajasic",
    devanagari: "राजस",
    text: "Sought for power, wealth, fame, pleasure or influence over others. The Gita calls tapas done for respect and show rajasic — unstable and short-lived (17.18).",
  },
  tamasic: {
    title: "Tamasic",
    devanagari: "तामस",
    text: "Practices of spirits, the cremation ground or harm to others. The Gita calls tapas done to injure another tamasic (17.19), and tamasic people worship pretas and bhutas (17.4).",
  },
};

export const SIDDHI_VERSES: (Mantra & { title: string })[] = [
  {
    title: "The five sources of siddhi",
    devanagari: "जन्मौषधिमन्त्रतपःसमाधिजाः सिद्धयः॥",
    iast: "janmauṣadhi-mantra-tapaḥ-samādhijāḥ siddhayaḥ ||",
    meaning: "Siddhis arise from birth, from herbs, from mantra, from tapas and from samadhi.",
    source: "Yoga Sutra 4.1",
  },
  {
    title: "Patanjali's warning",
    devanagari: "ते समाधावुपसर्गा व्युत्थाने सिद्धयः॥",
    iast: "te samādhāv upasargā vyutthāne siddhayaḥ ||",
    meaning: "These are obstacles to samadhi; only to the outgoing mind do they seem to be powers.",
    source: "Yoga Sutra 3.37 (3.38 in some editions)",
  },
  {
    title: "Shri Krishna's warning",
    devanagari: "अन्तरायान् वदन्त्येता युञ्जतो योगमुत्तमम्। मया सम्पद्यमानस्य कालक्षपणहेतवः॥",
    iast: "antarāyān vadanty etā yuñjato yogam uttamam | mayā sampadyamānasya kāla-kṣapaṇa-hetavaḥ ||",
    meaning: "The wise call these siddhis obstacles for one practising the highest yoga, and a waste of time for one who would attain Me.",
    source: "Shrimad Bhagavatam 11.15.33",
  },
  {
    title: "Whom each guna worships",
    devanagari: "यजन्ते सात्त्विका देवान्यक्षरक्षांसि राजसाः। प्रेतान्भूतगणांश्चान्ये यजन्ते तामसा जनाः॥",
    iast: "yajante sāttvikā devān yakṣa-rakṣāṁsi rājasāḥ | pretān bhūta-gaṇāṁś cānye yajante tāmasā janāḥ ||",
    meaning: "Sattvic people worship the devas, rajasic people the yakshas and rakshasas, and tamasic people worship pretas and hosts of bhutas.",
    source: "Bhagavad Gita 17.4",
  },
  {
    title: "Tamasic tapas",
    devanagari: "मूढग्राहेणात्मनो यत्पीडया क्रियते तपः। परस्योत्सादनार्थं वा तत्तामसमुदाहृतम्॥",
    iast: "mūḍha-grāheṇātmano yat pīḍayā kriyate tapaḥ | parasyotsādanārthaṁ vā tat tāmasam udāhṛtam ||",
    meaning: "Tapas done out of foolish obstinacy, by torturing oneself, or to destroy another, is called tamasic.",
    source: "Bhagavad Gita 17.19",
  },
  {
    title: "Ashta siddhi in the Hanuman Chalisa",
    devanagari: "अष्ट सिद्धि नौ निधि के दाता। अस बर दीन जानकी माता॥",
    iast: "aṣṭa siddhi nau nidhi ke dātā | asa bara dīna jānakī mātā ||",
    meaning: "Mother Janaki blessed Hanuman to be the giver of the eight siddhis and the nine treasures.",
    source: "Hanuman Chalisa (Goswami Tulsidas)",
  },
];

const NO_PROCEDURE = "Brahman does not give the mantras or procedures for this practice.";

export const SIDDHIS: Siddhi[] = [
  // --- Ashta Siddhi -------------------------------------------------------------------
  { id: "anima", name: "Anima", devanagari: "अणिमा", guna: "sattvic", group: "ashta", meaning: "Becoming as small as an atom; the yogi's body or awareness enters the subtlest things.", sources: ["Bhagavata Purana 11.15.4", "Markandeya Purana", "Yoga Sutra 3.45 (Vyasa bhashya)"], path: "Said to come from mastery of the elements (bhuta-jaya) through samyama, or as a grace of the Lord to one absorbed in Him.", caution: "Krishna and Patanjali both call such powers obstacles on the way to moksha.", keywords: ["anima", "atom", "small", "ashta siddhi", "asht siddhi"] },
  { id: "mahima", name: "Mahima", devanagari: "महिमा", guna: "sattvic", group: "ashta", meaning: "Becoming infinitely large — as Hanuman grew before Surasa and in Lanka.", sources: ["Bhagavata Purana 11.15.4", "Ramcharitmanas, Sundarkand"], path: "Mastery of the elements in yoga, or divine grace.", caution: "A by-product, not a goal.", keywords: ["mahima", "large", "big", "ashta siddhi"] },
  { id: "garima", name: "Garima", devanagari: "गरिमा", guna: "sattvic", group: "ashta", meaning: "Becoming immovably heavy.", sources: ["Hanuman Chalisa tradition", "Markandeya Purana"], path: "Mastery of the earth element in yoga.", keywords: ["garima", "heavy", "ashta siddhi"] },
  { id: "laghima", name: "Laghima", devanagari: "लघिमा", guna: "sattvic", group: "ashta", meaning: "Becoming weightless, light as a feather; related to levitation.", sources: ["Bhagavata Purana 11.15.4", "Yoga Sutra 3.42"], path: "Samyama on the relation of the body and space (akasha), with absorption in lightness, says Patanjali.", keywords: ["laghima", "light", "weightless", "levitation", "ashta siddhi"] },
  { id: "prapti", name: "Prapti", devanagari: "प्राप्ति", guna: "sattvic", group: "ashta", meaning: "Reaching anything anywhere — the senses extend to any object, however distant.", sources: ["Bhagavata Purana 11.15.4"], path: "Mastery of the senses through yoga.", keywords: ["prapti", "reach", "ashta siddhi"] },
  { id: "prakamya", name: "Prakamya", devanagari: "प्राकाम्य", guna: "sattvic", group: "ashta", meaning: "Fulfilment of every wish — whatever is seen or heard of can be experienced.", sources: ["Bhagavata Purana 11.15.5"], path: "Grace that comes when desires are surrendered.", caution: "Tradition notes the irony: it comes to those who no longer want it.", keywords: ["prakamya", "wish", "ashta siddhi"] },
  { id: "ishitva", name: "Ishitva", devanagari: "ईशित्व", guna: "sattvic", group: "ashta", meaning: "Lordship — power to set the forces of nature in motion.", sources: ["Bhagavata Purana 11.15.5"], path: "A divine attribute shared in part with the perfected yogi.", keywords: ["ishitva", "ishita", "lordship", "ashta siddhi"] },
  { id: "vashitva", name: "Vashitva", devanagari: "वशित्व", guna: "sattvic", group: "ashta", meaning: "Mastery — in the Bhagavata, freedom from being bound by the gunas; in later lists, control over the elements.", sources: ["Bhagavata Purana 11.15.5"], path: "Non-attachment to the gunas through devotion and yoga.", caution: "Not to be confused with vashikaran, the rajasic attempt to control another person.", keywords: ["vashitva", "vashita", "mastery", "ashta siddhi"] },
  { id: "kamavasayita", name: "Kamavasayita", devanagari: "कामावसायिता", guna: "sattvic", group: "ashta", meaning: "Whatever one resolves is accomplished — the eighth siddhi in Shri Krishna's list, in place of garima.", sources: ["Bhagavata Purana 11.15.5"], keywords: ["kamavasayita", "resolve", "ashta siddhi"] },

  // --- Nava Nidhi ---------------------------------------------------------------------
  { id: "nava-nidhi", name: "Nava Nidhi", devanagari: "नव निधि", guna: "sattvic", group: "nidhi", meaning: "The nine treasures of Kubera — Padma, Mahapadma, Shankha, Makara, Kachchhapa, Mukunda, Kunda, Nila and Kharva — each a kind of wealth. Hanuman is their giver along with the eight siddhis.", sources: ["Hanuman Chalisa", "Markandeya Purana (Padmini vidya)", "Amarakosha"], path: "Worship of Lakshmi and Kubera with dharmic earning and charity; Hanuman's grace.", rituals: ["lakshmi-puja", "hanuman-sundarkand"], keywords: ["nidhi", "nau nidhi", "nav nidhi", "nine treasures", "kuber", "kubera"] },

  // --- Bhagavata Purana 11.15: ten secondary siddhis ----------------------------------
  { id: "anurmimattva", name: "Anurmimattva", devanagari: "अनूर्मिमत्त्व", guna: "sattvic", group: "bhagavata", meaning: "Freedom from the six waves — hunger, thirst, grief, delusion, old age and death — disturbing the body and mind.", sources: ["Bhagavata Purana 11.15.6", "Yoga Sutra, Vibhuti Pada (cessation of hunger and thirst by samyama on the pit of the throat)"], path: "Meditation on the Lord, says Krishna, or samyama on the pit of the throat (Patanjali).", keywords: ["hunger", "thirst", "bhook pyaas", "anurmi"] },
  { id: "dura-shravana", name: "Dura-shravana", devanagari: "दूरश्रवण", guna: "sattvic", group: "bhagavata", meaning: "Hearing at any distance — divine hearing.", sources: ["Bhagavata Purana 11.15.6", "Yoga Sutra 3.41"], path: "Samyama on the relation of the ear and space.", keywords: ["divine hearing", "door shravan", "hearing far"] },
  { id: "dura-darshana", name: "Dura-darshana (Divya drishti)", devanagari: "दूरदर्शन / दिव्य दृष्टि", guna: "sattvic", group: "bhagavata", meaning: "Seeing at any distance — as Sanjaya, given divine sight by Vyasa, saw the war at Kurukshetra and Arjuna was given divya chakshu to see the cosmic form.", sources: ["Bhagavata Purana 11.15.6", "Mahabharata, Bhishma Parva", "Bhagavad Gita 11.8"], path: "Grace of the guru or the Lord.", keywords: ["divya drishti", "divine sight", "door darshan", "third eye", "clairvoyance"] },
  { id: "manojava", name: "Manojava", devanagari: "मनोजव", guna: "sattvic", group: "bhagavata", meaning: "Moving the body at the speed of the mind.", sources: ["Bhagavata Purana 11.15.6", "Yoga Sutra 3.48 (manojavitvam)"], path: "Mastery of the senses (indriya-jaya) in yoga.", keywords: ["manojava", "speed of mind"] },
  { id: "kamarupa", name: "Kamarupa", devanagari: "कामरूप", guna: "sattvic", group: "bhagavata", meaning: "Assuming any form at will — as Hanuman took a tiny form to enter Lanka.", sources: ["Bhagavata Purana 11.15.6"], keywords: ["kamarupa", "shape shifting", "any form", "roop badalna"] },
  { id: "parakaya-pravesha", name: "Parakaya-pravesha", devanagari: "परकायप्रवेश", guna: "sattvic", group: "bhagavata", meaning: "Entering another body — tradition tells that Adi Shankaracharya entered the body of King Amaruka.", sources: ["Bhagavata Purana 11.15.7", "Yoga Sutra 3.38", "Madhaviya Shankara Digvijaya"], path: "Loosening the cause of bondage and knowing the passages of the mind, says Patanjali.", caution: "Only the perfected yogi; used to possess another living being, it becomes tamasic.", keywords: ["parakaya", "parkaya pravesh", "enter another body"] },
  { id: "svachchhanda-mrityu", name: "Svachchhanda-mrityu (Ichchha-mrityu)", devanagari: "स्वच्छन्दमृत्यु / इच्छामृत्यु", guna: "sattvic", group: "bhagavata", meaning: "Dying only when one chooses — as Bhishma waited on the bed of arrows for Uttarayana.", sources: ["Bhagavata Purana 11.15.7", "Mahabharata, Bhishma and Anushasana Parvas"], path: "A boon earned by tapas and dharma (Bhishma received it from his father Shantanu).", keywords: ["ichha mrityu", "icchha mrityu", "will death", "bhishma"] },
  { id: "deva-krida-darshana", name: "Devanam saha-krida-anudarshana", devanagari: "देवानां सहक्रीडानुदर्शन", guna: "sattvic", group: "bhagavata", meaning: "Witnessing the sports of the devas and celestials.", sources: ["Bhagavata Purana 11.15.7"], keywords: ["see devas", "celestials", "apsaras dance"] },
  { id: "yatha-sankalpa", name: "Yatha-sankalpa-samsiddhi", devanagari: "यथासङ्कल्पसंसिद्धि", guna: "sattvic", group: "bhagavata", meaning: "Accomplishing whatever one resolves — satya-sankalpa.", sources: ["Bhagavata Purana 11.15.7", "Chhandogya Upanishad 8.1.5 (satya-sankalpa of the Self)"], path: "Truthfulness practised without break; Patanjali says to one established in truth, actions bear fruit (Yoga Sutra 2.36).", keywords: ["sankalpa siddhi", "resolve", "satya sankalpa"] },
  { id: "ajna-apratihata", name: "Ajna-apratihata gati", devanagari: "आज्ञाप्रतिहतगति", guna: "sattvic", group: "bhagavata", meaning: "Commands and movement that nothing can obstruct.", sources: ["Bhagavata Purana 11.15.7"], keywords: ["command", "unobstructed"] },

  // --- Bhagavata Purana 11.15: five lesser siddhis ------------------------------------
  { id: "trikala-jnana", name: "Trikala-jnana", devanagari: "त्रिकालज्ञान", guna: "sattvic", group: "bhagavata", meaning: "Knowing past, present and future.", sources: ["Bhagavata Purana 11.15.8", "Yoga Sutra 3.16"], path: "Samyama on the three transformations (of dharma, time and state), says Patanjali.", keywords: ["trikal", "trikaal gyan", "future knowledge", "past present future", "bhavishya gyan"] },
  { id: "advandva", name: "Advandva", devanagari: "अद्वन्द्व", guna: "sattvic", group: "bhagavata", meaning: "Being beyond the pairs of opposites — heat and cold, pleasure and pain, honour and dishonour.", sources: ["Bhagavata Purana 11.15.8", "Bhagavad Gita 2.14, 2.45"], path: "Equanimity (samatva) practised as the Gita teaches.", keywords: ["dvandva", "equanimity", "beyond opposites"] },
  { id: "para-chitta-jnana", name: "Para-chitta-jnana", devanagari: "परचित्तज्ञान", guna: "sattvic", group: "bhagavata", meaning: "Knowing the minds of others.", sources: ["Bhagavata Purana 11.15.8", "Yoga Sutra 3.19"], path: "Samyama on the ideas of another's mind.", caution: "Tradition holds it must never be used to pry into or exploit others.", keywords: ["mind reading", "telepathy", "man ki baat jaanna", "para chitta"] },
  { id: "pratishtambha", name: "Pratishtambha", devanagari: "प्रतिष्टम्भ", guna: "sattvic", group: "bhagavata", meaning: "Checking the force of fire, sun, water, poison and the like — as Prahlada was unharmed by fire, poison and the ocean.", sources: ["Bhagavata Purana 11.15.8", "Bhagavata Purana 7.5 (Prahlada)"], path: "Total surrender to the Lord, as Prahlada's.", caution: "Never to be tested by putting oneself in danger.", keywords: ["agni stambhan", "jal stambhan", "fire", "poison", "water"] },
  { id: "aparajaya", name: "Aparajaya", devanagari: "अपराजय", guna: "sattvic", group: "bhagavata", meaning: "Being unconquerable by others.", sources: ["Bhagavata Purana 11.15.8"], keywords: ["unconquerable", "victory", "vijay"] },

  // --- Yoga Sutra, Vibhuti Pada -------------------------------------------------------
  { id: "sarva-bhuta-ruta", name: "Sarva-bhuta-ruta-jnana", devanagari: "सर्वभूतरुतज्ञान", guna: "sattvic", group: "yoga-sutra", meaning: "Understanding the sounds and speech of all creatures.", sources: ["Yoga Sutra 3.17"], path: "Samyama on the distinction of word, meaning and idea.", keywords: ["language of animals", "birds", "animal speech"] },
  { id: "purva-janma-jnana", name: "Purva-janma-jnana", devanagari: "पूर्वजन्मज्ञान", guna: "sattvic", group: "yoga-sutra", meaning: "Knowledge of previous births.", sources: ["Yoga Sutra 3.18"], path: "Direct perception of one's samskaras through samyama.", keywords: ["past life", "pichla janam", "purva janm", "previous birth"] },
  { id: "antardhana", name: "Antardhana", devanagari: "अन्तर्धान", guna: "sattvic", group: "yoga-sutra", meaning: "Invisibility — the body's form is no longer perceived.", sources: ["Yoga Sutra 3.21"], path: "Samyama on the form of the body, suspending its power to be seen.", keywords: ["invisible", "invisibility", "gayab"] },
  { id: "aparanta-jnana", name: "Aparanta-jnana", devanagari: "अपरान्तज्ञान", guna: "sattvic", group: "yoga-sutra", meaning: "Knowing the time of one's death, through samyama on karma or through omens.", sources: ["Yoga Sutra, Vibhuti Pada (3.22)"], keywords: ["time of death", "death knowledge", "mrityu gyan"] },
  { id: "bala", name: "Bala (strength)", devanagari: "बल", guna: "sattvic", group: "yoga-sutra", meaning: "The strength of friendliness and compassion in the mind, and the strength of an elephant in the body.", sources: ["Yoga Sutra, Vibhuti Pada (3.23–3.24)"], path: "Samyama on maitri, karuna and mudita; on the strength of the elephant.", keywords: ["strength", "power", "bal"] },
  { id: "bhuvana-jnana", name: "Bhuvana-jnana", devanagari: "भुवनज्ञान", guna: "sattvic", group: "yoga-sutra", meaning: "Knowledge of the worlds (samyama on the sun), of the arrangement of stars (on the moon), and of their motions (on the pole star).", sources: ["Yoga Sutra, Vibhuti Pada (3.26–3.28)"], keywords: ["cosmos", "worlds", "lokas", "stars"] },
  { id: "kaya-vyuha-jnana", name: "Kaya-vyuha-jnana", devanagari: "कायव्यूहज्ञान", guna: "sattvic", group: "yoga-sutra", meaning: "Knowledge of the body's whole arrangement, through samyama on the navel chakra; steadiness through the kurma nadi.", sources: ["Yoga Sutra, Vibhuti Pada (3.29–3.31)"], keywords: ["body knowledge", "navel", "manipura"] },
  { id: "siddha-darshana", name: "Siddha-darshana", devanagari: "सिद्धदर्शन", guna: "sattvic", group: "yoga-sutra", meaning: "Vision of the perfected beings (siddhas), through samyama on the light in the crown of the head.", sources: ["Yoga Sutra, Vibhuti Pada (3.32)"], keywords: ["siddhas", "vision", "darshan"] },
  { id: "pratibha", name: "Pratibha", devanagari: "प्रातिभ", guna: "sattvic", group: "yoga-sutra", meaning: "Spontaneous intuitive illumination in which everything is known; and knowledge of the mind itself through samyama on the heart.", sources: ["Yoga Sutra, Vibhuti Pada (3.33–3.34)"], keywords: ["intuition", "pratibha", "illumination"] },
  { id: "akasha-gamana", name: "Udana-jaya and Akasha-gamana", devanagari: "उदानजय / आकाशगमन", guna: "sattvic", group: "yoga-sutra", meaning: "Not touching water, mud or thorns and rising upward (mastery of udana vayu); travelling through space (samyama on body and akasha); radiance through mastery of samana vayu.", sources: ["Yoga Sutra, Vibhuti Pada (3.39–3.42)"], keywords: ["levitation", "flying", "walk on water", "akash gaman", "udana"] },
  { id: "bhuta-jaya", name: "Bhuta-jaya and Indriya-jaya", devanagari: "भूतजय / इन्द्रियजय", guna: "sattvic", group: "yoga-sutra", meaning: "Mastery of the five elements, from which arise anima and the other siddhis and a perfect, indestructible body; and mastery of the senses.", sources: ["Yoga Sutra, Vibhuti Pada (3.44–3.47)"], keywords: ["mastery of elements", "bhuta jaya", "panch tatva"] },
  { id: "sarvajnatva", name: "Sarvajnatva", devanagari: "सर्वज्ञत्व", guna: "sattvic", group: "yoga-sutra", meaning: "Omniscience and supremacy over all states, arising from discernment of sattva and Purusha — which the yogi must also renounce to attain kaivalya.", sources: ["Yoga Sutra 3.49–3.50"], caution: "Patanjali's culmination: freedom comes only from non-attachment even to this.", keywords: ["omniscience", "sarvagya", "all knowing", "kaivalya"] },

  // --- Mantra and sadhana siddhis -----------------------------------------------------
  { id: "mantra-siddhi", name: "Mantra Siddhi", devanagari: "मन्त्र सिद्धि", guna: "sattvic", group: "mantra", meaning: "A mantra becomes 'awakened' and bears fruit for the sadhaka.", sources: ["Mantra Mahodadhi", "Sharada Tilaka", "Kularnava Tantra"], path: "Diksha from a guru, then purascharana: japa of as many lakhs as the mantra has syllables (by the common rule), followed by homa of one-tenth of the japa, tarpana of one-tenth of the homa, marjana of one-tenth of the tarpana, and feeding brahmins one-tenth of that — with purity, a fixed seat, time and count, and a sankalpa.", caution: "Tradition is clear that bija and tantric mantras should be taken from a guru; for household practice, nama-japa and well-known mantras like Gayatri and Om Namah Shivaya need no special siddhi.", rituals: ["mahamrityunjaya", "havan"], keywords: ["mantra siddhi", "mantra jagrat", "purascharan", "purashcharan", "anushthan", "siddh mantra"] },
  { id: "gayatri-siddhi", name: "Gayatri Siddhi", devanagari: "गायत्री सिद्धि", guna: "sattvic", group: "mantra", meaning: "Brahma-tejas — radiance, clear intellect and purity of mind; Vishvamitra's mantra, the mother of the Vedas.", sources: ["Rigveda 3.62.10", "Devi Bhagavata Purana, Book 11"], path: "Gayatri purascharana of 24 lakh japa (one lakh per syllable), traditionally done over months with sandhya and a sattvic life; even 108 japa at each sandhya is praised.", rituals: ["sandhya"], keywords: ["gayatri siddhi", "gayatri anushthan", "gayatri purascharan", "brahm tej"] },
  { id: "vak-siddhi", name: "Vak Siddhi", devanagari: "वाक् सिद्धि", guna: "sattvic", group: "mantra", meaning: "Whatever one says comes true; blessings and words carry power.", sources: ["Yoga Sutra 2.36 (to one established in truth, actions and their fruits follow)"], path: "Unbroken satya (truthfulness), mauna (silence) and Saraswati upasana.", caution: "Tradition warns that a curse spoken in anger exhausts the tapas that gave this power.", keywords: ["vak siddhi", "vachan siddhi", "words come true", "speech"] },
  { id: "ishta-darshana", name: "Ishta Sakshatkara", devanagari: "इष्ट साक्षात्कार", guna: "sattvic", group: "mantra", meaning: "Darshan of one's chosen deity — the true siddhi of bhakti, as Dhruva saw Vishnu and Tulsidas saw Shri Rama.", sources: ["Bhagavata Purana 4.9 (Dhruva)", "Narada Bhakti Sutra"], path: "Japa, prayer and longing, with humility; the grace of the deity is the only cause.", keywords: ["darshan", "bhagwan ke darshan", "god realization", "sakshatkar", "ishta"] },
  { id: "hanuman-siddhi", name: "Hanuman Upasana", devanagari: "हनुमान उपासना", guna: "sattvic", group: "mantra", meaning: "Courage, protection from fear and negative forces, strength and success; Hanuman himself gives the ashta siddhi and nava nidhi.", sources: ["Hanuman Chalisa", "Ramcharitmanas, Sundarkand"], path: "Brahmacharya and purity for the period, daily Hanuman Chalisa or Sundarkand, Tuesday and Saturday worship, with devotion to Shri Rama.", rituals: ["hanuman-sundarkand"], keywords: ["hanuman siddhi", "hanuman sadhana", "bajrang"] },
  { id: "shanti-karma", name: "Shanti Karma", devanagari: "शान्ति कर्म", guna: "sattvic", group: "shatkarma", meaning: "Pacifying rites — removing illness, graha affliction, fear and calamity. The first and noblest of the six tantric acts.", sources: ["Atharvaveda (shantika hymns)", "Sharada Tilaka", "Mantra Mahodadhi"], path: "Navagraha shanti, Mahamrityunjaya japa and homa, Rudrabhishek and Durga Saptashati path, done for the welfare of all.", rituals: ["navagraha-shanti", "mahamrityunjaya", "rudrabhishek"], keywords: ["shanti karma", "shantikarm", "pacify", "shanti"] },
  { id: "pushti-karma", name: "Pushti Karma", devanagari: "पुष्टि कर्म", guna: "sattvic", group: "shatkarma", meaning: "Nourishing rites for health, wealth, progeny and growth.", sources: ["Atharvaveda (paushtika hymns)", "Sharada Tilaka"], path: "Lakshmi and Ganesha worship, Satyanarayan katha, Shri Sukta, daan.", rituals: ["lakshmi-puja", "satyanarayan"], keywords: ["pushti", "paushtik", "prosperity"] },

  // --- Hatha, Swara and Siddha tradition ----------------------------------------------
  { id: "kundalini-siddhi", name: "Kundalini Jagaran", devanagari: "कुण्डलिनी जागरण", guna: "sattvic", group: "hatha", meaning: "Awakening of the coiled shakti and her rise through the chakras to Sahasrara — union of Shakti and Shiva, from which, it is said, all siddhis flow.", sources: ["Hatha Yoga Pradipika, ch. 3", "Shat Chakra Nirupana", "Saundarya Lahari"], path: "Under a qualified guru only: yama-niyama, asana, pranayama, mudra and bandha, japa and meditation; or shaktipat from a realised guru.", caution: "Forcing it without guidance is warned against in every text — it can unsettle body and mind.", keywords: ["kundalini", "chakra", "shaktipat", "sushumna"] },
  { id: "khechari", name: "Khechari Siddhi", devanagari: "खेचरी सिद्धि", guna: "sattvic", group: "hatha", meaning: "Moving in the sky of consciousness; the yogi who perfects khechari mudra is said to be free of hunger, thirst, disease and death's grip.", sources: ["Hatha Yoga Pradipika 3.32–3.54", "Khecharividya"], path: "Khechari mudra, learned only from a guru.", caution: "The physical practice is risky without a teacher.", keywords: ["khechari", "khechri", "sky walking"] },
  { id: "nada-siddhi", name: "Nada Siddhi", devanagari: "नाद सिद्धि", guna: "sattvic", group: "hatha", meaning: "Absorption in the inner sound (anahata nada), leading the mind to laya.", sources: ["Hatha Yoga Pradipika, ch. 4", "Nada Bindu Upanishad"], path: "Listening inwardly in meditation, from gross sounds to the subtle.", keywords: ["nada", "anahat", "inner sound", "nad yoga"] },
  { id: "swara-siddhi", name: "Swara Siddhi", devanagari: "स्वर सिद्धि", guna: "sattvic", group: "hatha", meaning: "Knowing the flow of breath in the left (Ida), right (Pingala) and both nostrils (Sushumna), and acting in harmony with it — said to give success in every undertaking and foreknowledge.", sources: ["Shiva Swarodaya"], path: "Observation of the breath through the day, and beginning actions in the suitable swara.", keywords: ["swara", "swar yoga", "swarodaya", "breath nostril"] },
  { id: "kaya-siddhi", name: "Kaya Siddhi (Kayakalpa)", devanagari: "काय सिद्धि / कायकल्प", guna: "sattvic", group: "hatha", meaning: "A perfected, long-lived body; the Siddha tradition's kayakalpa rejuvenation.", sources: ["Tirumantiram (Tirumular)", "Yoga Sutra 3.46 (kaya-sampat)"], path: "Yoga, pranayama, a disciplined diet and Ayurvedic rasayana under qualified guidance.", keywords: ["kayakalpa", "kaya siddhi", "immortal body", "long life", "rejuvenation"] },
  { id: "sanjivani", name: "Mrita Sanjivani Vidya", devanagari: "मृतसञ्जीवनी विद्या", guna: "sattvic", group: "mantra", meaning: "The knowledge of reviving the dead, held by Shukracharya and learned by Kacha.", sources: ["Mahabharata, Adi Parva (Kacha–Devayani)"], caution: "A story of the Itihasa; in practice the Mahamrityunjaya mantra (called 'mrita sanjivani') is chanted for healing and protection.", rituals: ["mahamrityunjaya"], keywords: ["sanjivani", "sanjeevani", "revive dead", "mrit sanjivani"] },

  // --- Rajasic ------------------------------------------------------------------------
  { id: "chamatkar", name: "Chamatkar (displays of power)", devanagari: "चमत्कार", guna: "rajasic", group: "hatha", meaning: "Using yogic or mantra powers to impress — walking on fire, stopping water, materialising objects.", sources: ["Bhagavad Gita 17.18 (tapas for honour and show is rajasic)", "Yoga Sutra 3.51 (do not be proud when invited by the celestials)"], caution: "Tradition holds that displays drain tapas and feed ego; many 'miracles' are simply tricks.", keywords: ["chamatkar", "miracle", "magic", "jadoo"] },
  { id: "rasa-siddhi", name: "Rasa Siddhi (alchemy)", devanagari: "रस सिद्धि", guna: "rajasic", group: "hatha", meaning: "Medieval rasa-shastra: processed mercury to turn base metals into gold and to make the body immortal.", sources: ["Rasarnava", "Rasaratna Samuccaya"], caution: "Mercury and other metals are poisonous unless processed by qualified Ayurvedic physicians. Never attempt it.", keywords: ["rasa siddhi", "alchemy", "mercury", "paras", "sona banana", "gold"] },
  { id: "folk-tantric-siddhis", name: "Gutika, Anjana, Paduka and Khadga Siddhis", devanagari: "गुटिका, अञ्जन, पादुका, खड्ग सिद्धि", guna: "rajasic", group: "hatha", meaning: "Powers described in medieval tantric and folk literature: a pill that grants flight or invisibility, a collyrium that reveals hidden treasure, sandals that carry one anywhere, an invincible sword.", sources: ["Medieval tantric and folk literature (e.g. Kathasaritsagara tales)"], caution: "These belong to story and legend; anyone selling them is selling a fraud.", keywords: ["gutika", "anjan", "paduka", "khadga", "hidden treasure", "gada dhan"] },
  { id: "vashikarana", name: "Vashikarana", devanagari: "वशीकरण", guna: "rajasic", group: "shatkarma", meaning: "One of the six tantric acts (shatkarma): bringing another person under one's will.", sources: ["Sharada Tilaka", "Mantra Mahodadhi (shatkarma section)"], caution: "Overriding another person's free will is adharma, and its karma returns to the doer. Most 'vashikaran specialists' prey on people in pain.", instead: `${NO_PROCEDURE} For love or a troubled marriage, tradition offers sattvic paths: Katyayani and Gauri worship, the Uma-Maheshwara puja, Shiva–Parvati devotion, and honest conversation. For a lost relationship, the support Brahman offers for grief and loneliness.`, rituals: ["karwa-chauth", "rudrabhishek"], keywords: ["vashikaran", "vashikarana", "vasikaran", "control someone", "love spell", "pyar wapas", "ex back", "kisi ko vash"] },
  { id: "akarshana", name: "Akarshana and Mohana", devanagari: "आकर्षण / मोहन", guna: "rajasic", group: "shatkarma", meaning: "Rites to attract (akarshana) or infatuate (mohana, sammohana) a person, counted with the shatkarma in some lists.", sources: ["Sharada Tilaka", "Mantra Mahodadhi"], caution: "Like vashikarana, it seeks to bend another's will — rajasic, and binding on the doer.", instead: `${NO_PROCEDURE} For natural charm and harmony, worship Shri Krishna and Lakshmi, and cultivate the qualities you wish to attract.`, rituals: ["lakshmi-puja"], keywords: ["akarshan", "mohan", "sammohan", "attraction mantra", "hypnotism"] },
  { id: "stambhana", name: "Stambhana", devanagari: "स्तम्भन", guna: "rajasic", group: "shatkarma", meaning: "Immobilising — stopping an opponent's speech, movement or hostile actions; associated with Devi Bagalamukhi, one of the Dasha Mahavidyas.", sources: ["Sharada Tilaka", "Mantra Mahodadhi", "Bagalamukhi upasana texts"], caution: "Bagalamukhi upasana is a serious tantric practice requiring diksha; using it to harm is adharma.", instead: `${NO_PROCEDURE} For protection from enemies or court cases, do Hanuman Chalisa and Sundarkand, Durga Saptashati path, and act truthfully; a qualified guru can guide Bagalamukhi worship for protection.`, rituals: ["hanuman-sundarkand", "navratri"], keywords: ["stambhan", "bagalamukhi", "baglamukhi", "enemy", "shatru", "court case"] },
  { id: "yakshini-sadhana", name: "Yakshini and Apsara Sadhana", devanagari: "यक्षिणी / अप्सरा साधना", guna: "rajasic", group: "sadhana", meaning: "Propitiating yakshinis (such as the 36 of the Uddamareshvara Tantra) or apsaras as mother, sister or consort, for wealth, pleasure and favours.", sources: ["Uddamareshvara Tantra", "Bhuta Damara Tantra", "Bhagavad Gita 17.4 (rajasic people worship yakshas)"], caution: "Tradition tells of sadhakas ruined by such bargains; the Gita places this worship below that of the devas.", instead: `${NO_PROCEDURE} For wealth, Lakshmi and Kubera worship with honest effort; for companionship, the devotion to Shiva and Parvati.`, rituals: ["lakshmi-puja"], keywords: ["yakshini", "apsara", "yakshi", "sundari sadhana"] },

  // --- Tamasic ------------------------------------------------------------------------
  { id: "vidveshana", name: "Vidveshana", devanagari: "विद्वेषण", guna: "tamasic", group: "shatkarma", meaning: "Creating enmity between people who love each other.", sources: ["Sharada Tilaka", "Mantra Mahodadhi (shatkarma section)"], caution: "Breaking bonds of love is grave adharma; the Gita calls tapas aimed at another's harm tamasic (17.19).", instead: `${NO_PROCEDURE} If someone has wronged you, the support Brahman offers for anger, and the Gita's teaching on forgiveness (16.3).`, keywords: ["vidveshan", "vidweshan", "separate couple", "dushmani"] },
  { id: "uchchatana", name: "Uchchatana", devanagari: "उच्चाटन", guna: "tamasic", group: "shatkarma", meaning: "Driving a person away from home or place, or unsettling their mind.", sources: ["Sharada Tilaka", "Mantra Mahodadhi (shatkarma section)"], caution: "Disturbing another's mind and home is tamasic; its karma returns to the doer.", instead: `${NO_PROCEDURE} For peace from a troublesome person, Hanuman Chalisa, firm boundaries and, where needed, the law.`, rituals: ["hanuman-sundarkand"], keywords: ["uchchatan", "uchatan", "drive away"] },
  { id: "marana", name: "Marana and Abhichara", devanagari: "मारण / अभिचार", guna: "tamasic", group: "shatkarma", meaning: "Rites intended to harm or kill (marana); abhichara and kritya — hostile sorcery — mentioned in the Atharvaveda chiefly in order to repel it.", sources: ["Atharvaveda (protective hymns against kritya and abhichara)", "Sharada Tilaka", "Bhagavad Gita 17.19"], caution: "The gravest adharma; the scriptures say it rebounds on the doer and his family.", instead: `${NO_PROCEDURE} If you fear someone has done black magic against you: Hanuman Chalisa, Durga Saptashati, Mahamrityunjaya japa and Narasimha worship protect, and most troubles have ordinary causes worth checking. If you are thinking of harming someone, please speak to someone you trust or call 112.`, rituals: ["hanuman-sundarkand", "mahamrityunjaya"], keywords: ["maran", "marana", "abhichar", "kritya", "black magic", "kala jadu", "kala jaadu", "tantra mantra to kill", "jadu tona", "totka"] },
  { id: "karna-pishachini", name: "Karna Pishachini", devanagari: "कर्ण पिशाचिनी", guna: "tamasic", group: "sadhana", meaning: "Propitiating a spirit said to whisper past and present details into the sadhaka's ear, used by some to impress clients.", sources: ["Medieval tantric texts", "Bhagavad Gita 17.4 (tamasic worship of pretas and bhutas)"], caution: "Tradition warns the spirit eventually takes the sadhaka's health, family and peace. It shows only the past and present, never the truth of the future.", instead: `${NO_PROCEDURE} For guidance, honest jyotisha, the Gita, and the grace of Saraswati and Ganesha.`, keywords: ["karna pishachini", "karn pishachini", "karna pisachini"] },
  { id: "bhuta-preta-sadhana", name: "Bhuta, Preta and Vetala Sadhana", devanagari: "भूत, प्रेत, वेताल साधना", guna: "tamasic", group: "sadhana", meaning: "Commanding ghosts, departed spirits or vetalas to do one's bidding.", sources: ["Bhagavad Gita 17.4", "Bhagavad Gita 9.25 (those who worship bhutas go to the bhutas)", "Vetala Panchavimshati (tales)"], caution: "The Gita says those who worship spirits go to the spirits; tradition counts it among the most binding of practices.", instead: `${NO_PROCEDURE} For peace for the departed, tarpan, shraddha and Garuda Purana path; for fear of spirits, Hanuman Chalisa — 'bhoot pishach nikat nahi aavai'.`, rituals: ["tarpan", "garuda-puran-path", "hanuman-sundarkand"], keywords: ["bhoot pret", "bhoot pret sadhana", "bhoot sadhana", "bhut", "pret", "preta", "vetal", "betal", "ghost", "spirit control", "jinn"] },
  { id: "shmashana-sadhana", name: "Shmashana and Shava Sadhana", devanagari: "श्मशान / शव साधना", guna: "tamasic", group: "sadhana", meaning: "Sadhana in the cremation ground or upon a corpse. In the Aghora and Kaula traditions it is undertaken under a guru to burn away fear and disgust and see Shiva in everything; done for powers, it is tamasic.", sources: ["Kaula and Aghora traditions", "Tantric texts on vira-sadhana"], caution: "Tamasic in form and dangerous to the mind; never without an authentic guru, and never for powers.", instead: `${NO_PROCEDURE} For fearlessness and detachment, contemplation of impermanence (the Gita, chapter 2), Shiva and Kali worship, and Mahamrityunjaya japa.`, rituals: ["mahamrityunjaya", "rudrabhishek"], keywords: ["shmashan", "smashan", "shav sadhana", "aghori", "aghor", "cremation ground"] },
  { id: "tamasic-tapas", name: "Tamasic Tapas (self-torture)", devanagari: "तामस तप", guna: "tamasic", group: "sadhana", meaning: "Fierce austerities that torture the body — starving, piercing, standing for years — out of obstinacy or to gain power over others.", sources: ["Bhagavad Gita 17.5–17.6", "Bhagavad Gita 17.19"], caution: "Krishna says those who torment the body torment Him who dwells within (17.6).", instead: "The Gita's tapas of body, speech and mind (17.14–17.16): purity, non-violence, truthful and kind words, serenity and self-control.", keywords: ["tamasic tapas", "self torture", "hath yog extreme", "kathor tap"] },
];

export function getSiddhi(id: string): Siddhi | undefined {
  return SIDDHIS.find((s) => s.id === id);
}

export function siddhisByGuna(guna: Guna): Siddhi[] {
  return SIDDHIS.filter((s) => s.guna === guna);
}
