// For families abroad or on a tight budget: what to use when an item cannot be found, and how to keep the rite valid.
// The guiding principle is the Gita's "patram pushpam phalam toyam" (9.26) — devotion offered with what one has is accepted.
import type { Mantra } from "./ritual-common.ts";

export interface Substitute {
  match: string[]; // lower-case words looked for in a samagri line
  item: string;
  use: string;
}

export const SUBSTITUTES: Substitute[] = [
  { match: ["ganga jal", "gangajal"], item: "Ganga jal", use: "Clean water in a clean vessel; invoke the holy rivers into it with the \"Gange cha Yamune\" mantra below. A few drops of real Ganga jal (sold online) mixed in is enough." },
  { match: ["mango leaves", "mango-wood", "mango wood", "toran of mango"], item: "Mango leaves / mango wood", use: "Indian groceries often stock frozen mango leaves; otherwise use five fresh leaves of ashoka, peepal, banyan or any clean non-thorny tree. For samidha, any dry untreated hardwood (never painted or chemically treated wood)." },
  { match: ["samidha", "arka", "palasha", "khair", "khadira"], item: "Special samidha", use: "Packets of havan samidha are sold online. If a graha's wood is unavailable, use dry untreated hardwood and offer its mantra with ghee and sesame — the mantra carries the offering." },
  { match: ["cow ghee", "ghee"], item: "Cow ghee", use: "Any pure ghee from a supermarket, or make it by simmering unsalted butter until clear. Use sesame oil for lamps if needed." },
  { match: ["havan samagri"], item: "Havan samagri", use: "Mix what you can find: barley, black sesame, rice, a little sugar or jaggery, ghee, and dried fragrant herbs (bay leaf, cloves, cardamom, dried rose petals). Ready mixes are sold online." },
  { match: ["kusha"], item: "Kusha grass", use: "Dried kusha is sold online. Tradition permits durva or another clean dry grass in its place; a ring of gold or a twisted thread can serve as the pavitri." },
  { match: ["durva"], item: "Durva grass", use: "Durva is Bermuda grass (Cynodon dactylon), which grows in lawns worldwide — pick from ground that has not been sprayed." },
  { match: ["betel", "tambula", "paan"], item: "Betel leaves and nuts", use: "Asian groceries stock them (often frozen). Otherwise offer a whole nut or akshata in their place, saying \"tambulam samarpayami\"." },
  { match: ["tulsi"], item: "Tulsi", use: "Grow holy basil (Ocimum tenuiflorum) from seed indoors. Dried tulsi leaves are acceptable — tulsi is held never to become impure." },
  { match: ["bel", "bilva"], item: "Bel (bilva) leaves", use: "Dried bilva leaves are sold online and, by tradition, do not become stale. Otherwise offer white flowers, or water alone with \"Om Namah Shivaya\"." },
  { match: ["dhatura", "aak"], item: "Dhatura / aak flowers", use: "Optional — offer white flowers instead. Dhatura is poisonous; do not handle it near children." },
  { match: ["lotus"], item: "Lotus", use: "A pink or red rose, or any fresh fragrant flower." },
  { match: ["flowers", "garland", "hibiscus", "marigold"], item: "Flowers", use: "Any fresh, fragrant flowers from a supermarket or garden. Avoid offering tulsi to Ganesha and ketaki to Shiva." },
  { match: ["kalash", "copper vessel", "lota"], item: "Kalash / copper lota", use: "Any clean metal pot (steel, brass, silver) or a clean glass jar. A steel lota is perfectly acceptable." },
  { match: ["havan kund"], item: "Havan kund", use: "A small steel or copper kund (sold online), or a heavy metal bowl or baking tray lined with a layer of sand or bricks." },
  { match: ["coconut"], item: "Coconut", use: "Supermarket whole coconut; for purnahuti a dry coconut half (or a few dry coconut pieces) is enough." },
  { match: ["kumkum", "roli", "sindoor"], item: "Kumkum / roli / sindoor", use: "Indian groceries or online. In a pinch, turmeric mixed with a drop of lime juice turns red and is traditional kumkum." },
  { match: ["chandan", "sandalwood"], item: "Chandan", use: "Sandalwood powder (online) mixed with water, or turmeric paste." },
  { match: ["mauli", "sacred thread", "janeu", "yajnopavita"], item: "Mauli / sacred thread", use: "Red (or red-and-yellow) cotton thread from any craft store." },
  { match: ["camphor"], item: "Camphor", use: "Pure edible-grade camphor tablets (online). Use very little indoors, or wave a ghee lamp for aarti instead." },
  { match: ["guggul", "loban"], item: "Guggul / loban", use: "Frankincense resin (widely sold) or good incense sticks." },
  { match: ["barley", "jau"], item: "Barley (jau)", use: "Pearl barley from any supermarket." },
  { match: ["sesame", "til"], item: "Sesame (til)", use: "Black or white sesame from Asian groceries or supermarkets." },
  { match: ["urad", "toor", "moong", "chana", "masoor", "horse gram"], item: "Lentils and grains", use: "Asian groceries; for the Navagraha mandal, any nine grains or lentils in the graha colours will do." },
  { match: ["banana leaves", "banana leaf"], item: "Banana leaves", use: "Frozen banana leaves from Asian groceries, or a clean cloth for the mandap." },
  { match: ["earthen", "clay", "diya", "diyas"], item: "Earthen diyas / pots", use: "Metal diyas, tea-light holders with a ghee wick, or any clean pot." },
  { match: ["murti", "picture", "shivling", "shaligram"], item: "Murti, picture or shivling", use: "A printed picture on a clean cloth is fully acceptable. For Shiva, a smooth oval stone (washed) may be worshipped as a lingam, or worship mentally." },
  { match: ["peepal tree"], item: "Peepal tree", use: "If none is nearby, light the lamp at home facing west and pray to Shani Dev; offer service to the needy instead." },
  { match: ["brahmin", "brahmin bhojan", "feeding brahmins"], item: "Brahmin bhojan", use: "Feed a learned or needy person, donate a meal to a temple or food bank, or send dakshina to a gaushala or temple in India online." },
  { match: ["cows, crows", "cows", "crows"], item: "Feeding cows and crows", use: "Feed birds outdoors and donate to a gaushala online." },
  { match: ["dakshina"], item: "Dakshina", use: "Keep it aside during the rite and give it later to a temple, a priest or a charity." },
];

export const RIVERS_INVOCATION: Mantra = {
  devanagari: "गङ्गे च यमुने चैव गोदावरि सरस्वति। नर्मदे सिन्धु कावेरि जलेऽस्मिन् सन्निधिं कुरु॥",
  iast: "gaṅge ca yamune caiva godāvari sarasvati | narmade sindhu kāveri jale'smin sannidhiṃ kuru ||",
  meaning: "O Ganga, Yamuna, Godavari, Saraswati, Narmada, Sindhu and Kaveri — be present in this water. Recited over the kalash or any clean water to make it fit for puja.",
  source: "Traditional kalash/jal-shuddhi verse recited in puja vidhis",
};

// Panchopachara manasa puja: each element of the five-fold worship offered mentally, with its bija.
export const MANASA_PUJA: Mantra = {
  devanagari: "ॐ लं पृथिव्यात्मकं गन्धं परिकल्पयामि। ॐ हं आकाशात्मकं पुष्पं परिकल्पयामि। ॐ यं वाय्वात्मकं धूपं परिकल्पयामि। ॐ रं वह्न्यात्मकं दीपं दर्शयामि। ॐ वं अमृतात्मकं नैवेद्यं निवेदयामि। ॐ सं सर्वात्मकं सर्वोपचारान् समर्पयामि॥",
  iast: "oṃ laṃ pṛthivyātmakaṃ gandhaṃ parikalpayāmi | oṃ haṃ ākāśātmakaṃ puṣpaṃ parikalpayāmi | oṃ yaṃ vāyvātmakaṃ dhūpaṃ parikalpayāmi | oṃ raṃ vahnyātmakaṃ dīpaṃ darśayāmi | oṃ vaṃ amṛtātmakaṃ naivedyaṃ nivedayāmi | oṃ saṃ sarvātmakaṃ sarvopacārān samarpayāmi ||",
  meaning: "I offer sandal paste (earth), flowers (space), incense (air), the lamp (fire) and food (nectar), and all offerings — in the mind. Use it when an item, or the whole puja setup, is not available.",
  source: "Panchopachara manasa puja, as taught in the Agamic tradition",
};

export const GITA_9_26: Mantra = {
  devanagari: "पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति। तदहं भक्त्युपहृतमश्नामि प्रयतात्मनः॥",
  iast: "patraṃ puṣpaṃ phalaṃ toyaṃ yo me bhaktyā prayacchati | tad ahaṃ bhaktyupahṛtam aśnāmi prayatātmanaḥ ||",
  meaning: "Whoever offers Me with devotion a leaf, a flower, a fruit or water — that loving offering of the pure-hearted I accept.",
  source: "Bhagavad Gita 9.26",
};

export const FIRE_SAFETY = [
  "Perform the hawan outdoors, on a balcony or patio if your building allows it; indoors, keep the fire small and open the windows.",
  "Place the kund on a metal tray with a layer of sand or bricks beneath it — never directly on carpet, wood or a stone countertop that can crack.",
  "Do not disable smoke alarms. Tell your landlord or neighbours beforehand; in apartments, a lamp-and-mantra hawan (ahutis offered into a large ghee diya, or offered mentally) is an accepted alternative.",
  "Use dry wood and little samagri — wet or excess samagri makes heavy smoke. Avoid cow-dung cakes indoors.",
  "Keep a bucket of water or sand and a fire extinguisher close; keep children, pets, hair and loose clothing (dupatta, dhoti ends) away from the flame.",
  "Let the fire die down on its own after purnahuti; once the ash is cold, immerse it in a plant pot or garden rather than a drain.",
];

export const ABROAD_PRINCIPLES = [
  "Bhava (devotion) matters more than material — Krishna accepts even a leaf or water offered with love (Gita 9.26).",
  "When an item is missing, say its name with \"…sthane akshatan samarpayami\" (\"in place of …, I offer akshata\") and offer rice, or offer it mentally.",
  "Time the puja by your local sunrise and panchang (Brahman computes it for any city). For the sankalpa abroad, name your city instead of Bharatavarsha — Brahman does this automatically.",
  "Join a local temple or online satsang for the big festivals; the family doing it together is what keeps the sanskar alive.",
];

/** The substitutes relevant to a rite's samagri list. */
export function substitutesFor(samagri: string[]): Substitute[] {
  const text = samagri.join(" | ").toLowerCase();
  return SUBSTITUTES.filter((s) => s.match.some((m) => new RegExp(`\\b${m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text)));
}
