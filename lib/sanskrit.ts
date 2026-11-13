// Script helpers for personal sankalpas: exact Devanagari → IAST, and a best-guess Latin → Devanagari for
// names typed in English (always shown to the person to confirm or correct).

const IAST_CONSONANTS: Record<string, string> = {
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "ṅ", च: "c", छ: "ch", ज: "j", झ: "jh", ञ: "ñ",
  ट: "ṭ", ठ: "ṭh", ड: "ḍ", ढ: "ḍh", ण: "ṇ", त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m", य: "y", र: "r", ल: "l", व: "v", श: "ś",
  ष: "ṣ", स: "s", ह: "h", ळ: "ḷ",
};
const IAST_VOWELS: Record<string, string> = {
  अ: "a", आ: "ā", इ: "i", ई: "ī", उ: "u", ऊ: "ū", ऋ: "ṛ", ॠ: "ṝ", ऌ: "ḷ", ए: "e", ऐ: "ai", ओ: "o", औ: "au",
};
const IAST_MATRAS: Record<string, string> = {
  "ा": "ā", "ि": "i", "ी": "ī", "ु": "u", "ू": "ū", "ृ": "ṛ", "ॄ": "ṝ", "े": "e", "ै": "ai", "ो": "o", "ौ": "au",
};
const IAST_SIGNS: Record<string, string> = { "ं": "ṃ", "ँ": "ṃ", "ः": "ḥ", "ऽ": "'", "ॐ": "oṃ", "।": "|", "॥": "||" };

/** Exact Sanskrit transliteration (IAST) of Devanagari text. */
export function toIast(text: string): string {
  const chars = [...text.normalize("NFC")];
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (IAST_CONSONANTS[c] !== undefined) {
      out += IAST_CONSONANTS[c];
      const next = chars[i + 1];
      if (next === "्") i++;
      else if (next && IAST_MATRAS[next] !== undefined) {
        out += IAST_MATRAS[next];
        i++;
      } else out += "a";
    } else if (IAST_VOWELS[c] !== undefined) out += IAST_VOWELS[c];
    else if (IAST_SIGNS[c] !== undefined) out += IAST_SIGNS[c];
    else if (c >= "०" && c <= "९") out += String(c.charCodeAt(0) - "०".charCodeAt(0));
    else out += c;
  }
  return out;
}

export function toDevanagariDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => String.fromCharCode("०".charCodeAt(0) + Number(d)));
}

// Latin → Devanagari, tuned for Indian names as people usually spell them ("Ramesh", "Sharma", "Priya").
const L_CONS: [string, string][] = [
  ["chh", "छ"], ["ksh", "क्ष"], ["gya", "ज्ञ"], ["shr", "श्र"], ["tr", "त्र"],
  ["kh", "ख"], ["gh", "घ"], ["ch", "च"], ["jh", "झ"], ["th", "थ"], ["dh", "ध"], ["ph", "फ"], ["bh", "भ"], ["sh", "श"],
  ["k", "क"], ["g", "ग"], ["c", "क"], ["j", "ज"], ["t", "त"], ["d", "द"], ["n", "न"], ["p", "प"], ["f", "फ़"], ["b", "ब"],
  ["m", "म"], ["y", "य"], ["r", "र"], ["l", "ल"], ["v", "व"], ["w", "व"], ["s", "स"], ["h", "ह"], ["z", "ज़"], ["q", "क"], ["x", "क्स"],
];
const L_VOWELS: [string, string, string][] = [
  // latin, independent, matra
  ["aa", "आ", "ा"], ["ai", "ऐ", "ै"], ["au", "औ", "ौ"], ["ee", "ई", "ी"], ["ii", "ई", "ी"], ["oo", "ऊ", "ू"], ["uu", "ऊ", "ू"],
  ["ri", "रि", "ृ"], ["a", "अ", ""], ["i", "इ", "ि"], ["u", "उ", "ु"], ["e", "ए", "े"], ["o", "ओ", "ो"],
];

function wordToDevanagari(word: string): string {
  const w = word.toLowerCase();
  let out = "";
  let i = 0;
  let afterConsonant = false;
  while (i < w.length) {
    // "n"/"m" closing a syllable before a stop is usually written as anusvara in Hindi (Ankit → अंकित, Sanjay → संजय).
    if ((w[i] === "n" || (w[i] === "m" && "pb".includes(w[i + 1] ?? ""))) && i > 0 && /[kgcjtdpb]/.test(w[i + 1] ?? "") && !afterConsonant) {
      out += "ं";
      i++;
      afterConsonant = false;
      continue;
    }
    const cons = L_CONS.find(([l]) => w.startsWith(l, i));
    if (cons) {
      if (afterConsonant) out += "्";
      out += cons[1];
      i += cons[0].length;
      afterConsonant = true;
      continue;
    }
    const vow = L_VOWELS.find(([l]) => w.startsWith(l, i));
    if (vow) {
      const [l, ind, matra] = vow;
      const atEnd = i + l.length === w.length;
      if (afterConsonant) {
        // Word-final "a" in names is usually long (Sharma → शर्मा, Priya → प्रिया).
        out += l === "a" && atEnd && w.length > 2 ? "ा" : matra;
      } else out += ind;
      i += l.length;
      afterConsonant = false;
      continue;
    }
    out += w[i];
    i++;
    afterConsonant = false;
  }
  return out;
}

// Common names and surnames whose Hindi spelling the rules below would get wrong.
const NAME_LEXICON: Record<string, string> = {
  ram: "राम",
  ramprasad: "रामप्रसाद",
  kamlesh: "कमलेश",
  bhupendra: "भूपेन्द्र",
  shivprasad: "शिवप्रसाद",
  ramkumar: "रामकुमार",
  raam: "राम",
  raj: "राज",
  shriram: "श्रीराम",
  sriram: "श्रीराम",
  krishna: "कृष्ण",
  krishan: "कृष्ण",
  kumar: "कुमार",
  rajesh: "राजेश",
  rakesh: "राकेश",
  mahesh: "महेश",
  dinesh: "दिनेश",
  suresh: "सुरेश",
  ramesh: "रमेश",
  ganesh: "गणेश",
  naresh: "नरेश",
  umesh: "उमेश",
  vijay: "विजय",
  ajay: "अजय",
  sanjay: "संजय",
  amit: "अमित",
  sumit: "सुमित",
  rahul: "राहुल",
  rohit: "रोहित",
  mohit: "मोहित",
  vikas: "विकास",
  prakash: "प्रकाश",
  ashok: "अशोक",
  anand: "आनन्द",
  arun: "अरुण",
  varun: "वरुण",
  karan: "करण",
  arjun: "अर्जुन",
  aditya: "आदित्य",
  vivek: "विवेक",
  manoj: "मनोज",
  pankaj: "पंकज",
  neeraj: "नीरज",
  deepak: "दीपक",
  ravi: "रवि",
  gopal: "गोपाल",
  mohan: "मोहन",
  shyam: "श्याम",
  hari: "हरि",
  narayan: "नारायण",
  narayana: "नारायण",
  lakshmi: "लक्ष्मी",
  laxmi: "लक्ष्मी",
  sunita: "सुनीता",
  anita: "अनीता",
  geeta: "गीता",
  gita: "गीता",
  seema: "सीमा",
  rekha: "रेखा",
  neha: "नेहा",
  priya: "प्रिया",
  pooja: "पूजा",
  puja: "पूजा",
  anjali: "अंजलि",
  kavita: "कविता",
  savita: "सविता",
  meena: "मीना",
  radha: "राधा",
  parvati: "पार्वती",
  durga: "दुर्गा",
  shanti: "शान्ति",
  sita: "सीता",
  rajendra: "राजेन्द्र",
  surendra: "सुरेन्द्र",
  mahendra: "महेन्द्र",
  narendra: "नरेन्द्र",
  devendra: "देवेन्द्र",
  virendra: "वीरेन्द्र",
  ramchandra: "रामचन्द्र",
  shiv: "शिव",
  shiva: "शिव",
  om: "ओम",
  prem: "प्रेम",
  ankit: "अंकित",
  ankita: "अंकिता",
  sachin: "सचिन",
  nikhil: "निखिल",
  akash: "आकाश",
  aakash: "आकाश",
  sharma: "शर्मा",
  verma: "वर्मा",
  gupta: "गुप्ता",
  mishra: "मिश्रा",
  pandey: "पाण्डेय",
  tiwari: "तिवारी",
  dubey: "दुबे",
  shukla: "शुक्ला",
  tripathi: "त्रिपाठी",
  chaturvedi: "चतुर्वेदी",
  dwivedi: "द्विवेदी",
  trivedi: "त्रिवेदी",
  joshi: "जोशी",
  agarwal: "अग्रवाल",
  aggarwal: "अग्रवाल",
  singh: "सिंह",
  yadav: "यादव",
  patel: "पटेल",
  shah: "शाह",
  mehta: "मेहता",
  iyer: "अय्यर",
  iyengar: "अय्यंगार",
  rao: "राव",
  reddy: "रेड्डी",
  nair: "नायर",
  menon: "मेनन",
  pillai: "पिल्लै",
  das: "दास",
  bose: "बोस",
  banerjee: "बनर्जी",
  chatterjee: "चटर्जी",
  mukherjee: "मुखर्जी",
  ghosh: "घोष",
  kulkarni: "कुलकर्णी",
  deshpande: "देशपांडे",
  patil: "पाटिल",
  jain: "जैन",
  kapoor: "कपूर",
  khanna: "खन्ना",
  malhotra: "मल्होत्रा",
  chopra: "चोपड़ा",
  bhatt: "भट्ट",
  bhat: "भट",
  prasad: "प्रसाद",
  nath: "नाथ",
  lal: "लाल",
  chand: "चन्द",
  devi: "देवी",
  kumari: "कुमारी",
  rani: "रानी",
  pandit: "पण्डित",
  upadhyay: "उपाध्याय",
  dixit: "दीक्षित",
  dikshit: "दीक्षित",
  saxena: "सक्सेना",
  srivastava: "श्रीवास्तव",
  shrivastava: "श्रीवास्तव",
  sinha: "सिन्हा",
};

/** Best-guess Devanagari spelling for a name typed in Latin script. Devanagari input is returned as is. */
export function nameToDevanagari(name: string): string {
  if (/[ऀ-ॿ]/.test(name)) return name.trim();
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => NAME_LEXICON[w.toLowerCase()] ?? wordToDevanagari(w))
    .join(" ");
}
