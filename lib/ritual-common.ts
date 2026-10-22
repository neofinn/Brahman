// Types and steps shared by every ritual guide.
export interface Mantra {
  devanagari: string;
  iast: string;
  meaning: string;
  source?: string;
  /** How many times it is traditionally recited or offered, e.g. "108 times". */
  count?: string;
}

export interface Step {
  title: string;
  detail: string;
  mantra?: Mantra;
}

export type KriyaCategory = "puja" | "hawan" | "shanti" | "vrat" | "samskara" | "path";

export interface Kriya {
  id: string;
  title: string;
  devanagari: string;
  category: KriyaCategory;
  /** Words and spellings people use when asking for this rite (Hinglish included). */
  keywords: string[];
  /** Approximate duration, for planning. */
  duration?: string;
  /** Whether a qualified purohit is traditionally needed. */
  purohit?: string;
  /** Learned through an AI search rather than part of the built-in granth. */
  learned?: boolean;
  summary: string;
  when: string;
  samagri: string[];
  steps: Step[];
  notes?: string[];
}

export const ACHAMANA: Step = {
  title: "Achamana (sipping water for purification)",
  detail: "Take a little water in the right palm and sip three times, saying one name each time. Then wash the right hand.",
  mantra: {
    devanagari: "ॐ केशवाय नमः। ॐ नारायणाय नमः। ॐ माधवाय नमः॥",
    iast: "oṃ keśavāya namaḥ | oṃ nārāyaṇāya namaḥ | oṃ mādhavāya namaḥ ||",
    meaning: "Salutations to Keshava, Narayana and Madhava (names of Vishnu).",
  },
};

export const PAVITRIKARANA: Step = {
  title: "Pavitrikarana (purifying self and space)",
  detail: "Sprinkle water over yourself, the puja items and the space with a flower or tulsi leaf.",
  mantra: {
    devanagari: "ॐ अपवित्रः पवित्रो वा सर्वावस्थां गतोऽपि वा। यः स्मरेत् पुण्डरीकाक्षं स बाह्याभ्यन्तरः शुचिः॥",
    iast: "oṃ apavitraḥ pavitro vā sarvāvasthāṃ gato'pi vā | yaḥ smaret puṇḍarīkākṣaṃ sa bāhyābhyantaraḥ śuciḥ ||",
    meaning: "Whether pure or impure, in whatever state one may be, whoever remembers the lotus-eyed Lord becomes pure within and without.",
  },
};

export const GANESHA_DHYANA: Mantra = {
  devanagari: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
  iast: "vakratuṇḍa mahākāya sūryakoṭi samaprabha | nirvighnaṃ kuru me deva sarvakāryeṣu sarvadā ||",
  meaning: "O Lord of the curved trunk and mighty form, radiant as a million suns, make all my undertakings free of obstacles, always.",
};

export const DEEPA: Mantra = {
  devanagari: "शुभं करोति कल्याणम् आरोग्यं धनसम्पदा। शत्रुबुद्धिविनाशाय दीपज्योतिर्नमोऽस्तु ते॥",
  iast: "śubhaṃ karoti kalyāṇam ārogyaṃ dhanasampadā | śatrubuddhivināśāya dīpajyotir namo'stu te ||",
  meaning: "Salutations to the light of the lamp, which brings auspiciousness, well-being, health and prosperity, and destroys hostile thoughts.",
};

export const KSHAMA: Step = {
  title: "Kshama prarthana (asking forgiveness)",
  detail: "With folded hands, ask forgiveness for any error or omission in the worship.",
  mantra: {
    devanagari: "आवाहनं न जानामि न जानामि विसर्जनम्। पूजां चैव न जानामि क्षमस्व परमेश्वर॥",
    iast: "āvāhanaṃ na jānāmi na jānāmi visarjanam | pūjāṃ caiva na jānāmi kṣamasva parameśvara ||",
    meaning: "I do not know how to invoke you, nor how to bid you farewell, nor how to worship. Forgive me, O Supreme Lord.",
  },
};
