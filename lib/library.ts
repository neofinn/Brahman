// A map of the Sanatan Dharma canon. Each text links into the chat with a starter question.
export interface Text {
  name: string;
  devanagari?: string;
  description: string;
  /** The Katha library entry for this text, if there is one. */
  kathaId?: string;
}

export interface Category {
  id: string;
  title: string;
  devanagari: string;
  summary: string;
  texts: Text[];
}

export const LIBRARY: Category[] = [
  {
    id: "vedas",
    title: "Vedas",
    devanagari: "वेद",
    summary:
      "Shruti — 'that which is heard'. The four Vedas are the root of the tradition, each with Samhita (hymns), Brahmana (ritual exegesis), Aranyaka (forest teachings) and Upanishad layers.",
    texts: [
      { name: "Rigveda", devanagari: "ऋग्वेद", description: "1,028 hymns in ten mandalas to Agni, Indra, Soma, Varuna, Ushas and others; source of the Gayatri mantra (3.62.10) and the Purusha Sukta (10.90)." },
      { name: "Yajurveda", devanagari: "यजुर्वेद", description: "Formulas for the yajna, in the Shukla (Vajasaneyi) and Krishna (Taittiriya and others) recensions; contains the Sri Rudram." },
      { name: "Samaveda", devanagari: "सामवेद", description: "Rigvedic verses set to melody for chanting by the udgatri priest; the root of Indian classical music." },
      { name: "Atharvaveda", devanagari: "अथर्ववेद", description: "Hymns for healing, protection, household life, kingship and philosophy, including the Prithvi Sukta." },
    ],
  },
  {
    id: "upanishads",
    title: "Upanishads",
    devanagari: "उपनिषद्",
    summary:
      "Vedanta — the culmination of the Vedas. They inquire into Brahman, Atman and liberation. Eleven principal Upanishads were commented on by Adi Shankaracharya.",
    texts: [
      { name: "Isha Upanishad", devanagari: "ईशोपनिषद्", description: "Eighteen verses opening 'ईशा वास्यमिदं सर्वम्' — all this is pervaded by the Lord." },
      { name: "Kena Upanishad", devanagari: "केनोपनिषद्", description: "By whom is the mind directed? The parable of Uma Haimavati and the devas." },
      { name: "Katha Upanishad", kathaId: "nachiketa", devanagari: "कठोपनिषद्", description: "Nachiketa's dialogue with Yama on death and the immortal Self; the chariot analogy." },
      { name: "Prashna Upanishad", devanagari: "प्रश्नोपनिषद्", description: "Six seekers put six questions to the sage Pippalada." },
      { name: "Mundaka Upanishad", devanagari: "मुण्डकोपनिषद्", description: "Higher and lower knowledge; source of 'सत्यमेव जयते' (3.1.6)." },
      { name: "Mandukya Upanishad", devanagari: "माण्डूक्योपनिषद्", description: "Twelve verses on Om and the four states of consciousness, with Gaudapada's Karika." },
      { name: "Taittiriya Upanishad", devanagari: "तैत्तिरीयोपनिषद्", description: "The five koshas, 'सत्यं वद धर्मं चर', and the graduated bliss of Brahman." },
      { name: "Aitareya Upanishad", devanagari: "ऐतरेयोपनिषद्", description: "Creation and the mahavakya 'प्रज्ञानं ब्रह्म'." },
      { name: "Chandogya Upanishad", devanagari: "छान्दोग्योपनिषद्", description: "Uddalaka teaches Shvetaketu 'तत्त्वमसि' — you are That." },
      { name: "Brihadaranyaka Upanishad", devanagari: "बृहदारण्यकोपनिषद्", description: "Yajnavalkya, Maitreyi and Gargi; 'अहं ब्रह्मास्मि' and 'नेति नेति'." },
      { name: "Shvetashvatara Upanishad", devanagari: "श्वेताश्वतरोपनिषद्", description: "Theistic Upanishad on Rudra-Shiva as the supreme Lord, and on yoga." },
    ],
  },
  {
    id: "itihasa",
    title: "Itihasa — the Epics",
    devanagari: "इतिहास",
    summary: "'Thus indeed it happened.' The two great epics carry dharma to every home through story.",
    texts: [
      { name: "Valmiki Ramayana", kathaId: "valmiki-ramayana", devanagari: "वाल्मीकि रामायण", description: "The adikavya in seven kandas: the life of Shri Rama, Sita, Lakshmana and Hanuman." },
      { name: "Mahabharata", kathaId: "mahabharata", devanagari: "महाभारत", description: "Vyasa's epic of about 100,000 shlokas in eighteen parvas — the Kurukshetra war and the whole of dharma." },
      { name: "Bhagavad Gita", kathaId: "bhagavad-gita", devanagari: "भगवद्गीता", description: "Krishna's teaching to Arjuna in 18 chapters and 700 verses (Bhishma Parva 25–42): karma, jnana and bhakti yoga." },
      { name: "Vishnu Sahasranama", devanagari: "विष्णुसहस्रनाम", description: "The thousand names of Vishnu taught by Bhishma (Anushasana Parva)." },
      { name: "Ramcharitmanas", kathaId: "ramcharitmanas", devanagari: "रामचरितमानस", description: "Goswami Tulsidas's Awadhi retelling of the Ramayana, sung in homes across North India." },
    ],
  },
  {
    id: "puranas",
    title: "Puranas",
    devanagari: "पुराण",
    summary:
      "The eighteen Mahapuranas teach cosmology, genealogy, avataras, tirthas, vratas and devotion. Traditionally grouped as Sattvika (Vishnu), Rajasika (Brahma) and Tamasika (Shiva).",
    texts: [
      { name: "Bhagavata Purana", kathaId: "bhagavata-purana", devanagari: "श्रीमद्भागवतम्", description: "Twelve skandhas; the lila of Shri Krishna in the tenth. Central to Vaishnava bhakti." },
      { name: "Vishnu Purana", devanagari: "विष्णु पुराण", description: "Parashara's teaching to Maitreya on creation, the avataras and the yugas." },
      { name: "Shiva Purana", kathaId: "shiv-purana", devanagari: "शिव पुराण", description: "The glory of Shiva, the jyotirlingas, and Shiva–Parvati stories." },
      { name: "Devi Bhagavata Purana", devanagari: "देवी भागवत पुराण", description: "The supremacy of the Divine Mother; Shakta theology." },
      { name: "Markandeya Purana", kathaId: "durga-saptashati", devanagari: "मार्कण्डेय पुराण", description: "Contains the Devi Mahatmya (Durga Saptashati), recited at Navaratri." },
      { name: "Skanda Purana", devanagari: "स्कन्द पुराण", description: "The largest Purana: tirthas, vratas, and the Satyanarayan katha (Reva Khanda)." },
      { name: "Garuda Purana", kathaId: "garuda-purana", devanagari: "गरुड पुराण", description: "Vishnu's teaching to Garuda; its Preta Khanda is read during the days after a death." },
      { name: "Padma, Agni, Matsya, Kurma, Varaha, Vamana, Linga, Narada, Brahma, Brahmanda, Brahmavaivarta and Bhavishya Puranas", description: "The remaining Mahapuranas, each with distinctive cosmology, vratas and mahatmyas." },
    ],
  },
  {
    id: "darshanas",
    title: "Darshanas — Philosophy",
    devanagari: "दर्शन",
    summary: "The six orthodox schools (shad-darshana), each with a root sutra text and commentaries.",
    texts: [
      { name: "Vedanta — Brahma Sutras", devanagari: "ब्रह्मसूत्र", description: "Badarayana's sutras, read through Advaita (Shankara), Vishishtadvaita (Ramanuja), Dvaita (Madhva) and other schools." },
      { name: "Yoga Sutras of Patanjali", devanagari: "योगसूत्र", description: "196 sutras on ashtanga yoga: 'योगश्चित्तवृत्तिनिरोधः' (1.2)." },
      { name: "Sankhya Karika", devanagari: "सांख्यकारिका", description: "Ishvarakrishna's account of purusha, prakriti and the 25 tattvas." },
      { name: "Nyaya Sutras", devanagari: "न्यायसूत्र", description: "Gautama's logic and epistemology — the pramanas." },
      { name: "Vaisheshika Sutras", devanagari: "वैशेषिकसूत्र", description: "Kanada's atomism and categories of reality." },
      { name: "Mimamsa Sutras", devanagari: "मीमांसासूत्र", description: "Jaimini's hermeneutics of Vedic ritual and dharma." },
    ],
  },
  {
    id: "dharmashastra",
    title: "Dharmashastra & Sutras",
    devanagari: "धर्मशास्त्र",
    summary: "Texts on conduct, samskaras, household rites and law. Read today with historical context.",
    texts: [
      { name: "Grihya Sutras", devanagari: "गृह्यसूत्र", description: "Ashvalayana, Apastamba, Paraskara and others — the basis of the samskaras and home rites." },
      { name: "Manusmriti", devanagari: "मनुस्मृति", description: "Influential Dharmashastra; parts are contested and read critically by modern teachers." },
      { name: "Yajnavalkya Smriti", devanagari: "याज्ञवल्क्य स्मृति", description: "Concise Dharmashastra on achara, vyavahara and prayashchitta, with the Mitakshara commentary." },
      { name: "Parashara Smriti", devanagari: "पराशर स्मृति", description: "Traditionally held to be the smriti for Kali Yuga." },
    ],
  },
  {
    id: "agama",
    title: "Agamas, Tantras & Bhakti",
    devanagari: "आगम",
    summary: "Temple worship, initiation and devotion in the Shaiva, Vaishnava and Shakta streams.",
    texts: [
      { name: "Shaiva Agamas", devanagari: "शैवागम", description: "The 28 Agamas of Shaiva Siddhanta governing temple ritual, especially in South India." },
      { name: "Pancharatra Samhitas", devanagari: "पाञ्चरात्र", description: "Vaishnava Agamas guiding worship in Sri Vaishnava temples." },
      { name: "Lalita Sahasranama", devanagari: "ललिता सहस्रनाम", description: "The thousand names of the Divine Mother from the Brahmanda Purana." },
      { name: "Divya Prabandham & Tirumurai", description: "Tamil hymns of the Alvars (Vaishnava) and Nayanars (Shaiva)." },
    ],
  },
  {
    id: "jyotisha",
    title: "Jyotisha & Vedangas",
    devanagari: "ज्योतिष",
    summary: "The six Vedangas — Shiksha, Kalpa, Vyakarana, Nirukta, Chandas and Jyotisha — support the study of the Veda.",
    texts: [
      { name: "Brihat Parashara Hora Shastra", devanagari: "बृहत्पाराशरहोराशास्त्र", description: "The foundational text of Parashari natal astrology, including the Vimshottari dasha." },
      { name: "Brihat Jataka", devanagari: "बृहज्जातक", description: "Varahamihira's classic on natal astrology." },
      { name: "Muhurta Chintamani", devanagari: "मुहूर्त चिन्तामणि", description: "Rules for choosing auspicious times for samskaras, travel and undertakings." },
      { name: "Surya Siddhanta", devanagari: "सूर्य सिद्धान्त", description: "Classical astronomical treatise underlying traditional panchangas." },
      { name: "Ashtadhyayi", devanagari: "अष्टाध्यायी", description: "Panini's grammar of Sanskrit in about 4,000 sutras." },
    ],
  },
];
