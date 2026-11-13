// Rough Devanagari → Latin transliteration, so Hindi typed or spoken ("ग्रह शांति हवन") reaches the finder
// in the same form as Hinglish ("grah shanti havan").

const CONSONANTS: Record<string, string> = {
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "n", च: "ch", छ: "chh", ज: "j", झ: "jh", ञ: "n",
  ट: "t", ठ: "th", ड: "d", ढ: "dh", ण: "n", त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m", य: "y", र: "r", ल: "l", व: "v", श: "sh",
  ष: "sh", स: "s", ह: "h", ळ: "l", क़: "q", ख़: "kh", ग़: "g", ज़: "z", ड़: "r", ढ़: "rh", फ़: "f",
};
const VOWELS: Record<string, string> = {
  अ: "a", आ: "a", इ: "i", ई: "i", उ: "u", ऊ: "u", ऋ: "ri", ए: "e", ऐ: "ai", ओ: "o", औ: "au", ऑ: "o",
};
const MATRAS: Record<string, string> = {
  "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u", "ृ": "ri", "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ॉ": "o",
};
const SIGNS: Record<string, string> = { "ं": "n", "ँ": "n", "ः": "h", "ॐ": "om", "।": ".", "॥": "." };
const VIRAMA = "्";
const NUKTA = "़";

export function hasDevanagari(text: string): boolean {
  return /[ऀ-ॿ]/.test(text);
}

export function transliterate(text: string): string {
  if (!hasDevanagari(text)) return text;
  const chars = [...text.normalize("NFC")];
  let out = "";
  let inherentAtEnd = false; // the last letter written is an implicit schwa
  let syllables = 0; // syllables in the current word
  const endWord = () => {
    // Schwa deletion: "हवन" is havan, not havana — but keep it in one-syllable words like "न".
    if (inherentAtEnd && syllables > 1) out = out.slice(0, -1);
    inherentAtEnd = false;
    syllables = 0;
  };
  for (let i = 0; i < chars.length; i++) {
    let c = chars[i];
    if (chars[i + 1] === NUKTA) {
      c += NUKTA;
      i++;
    }
    if (CONSONANTS[c] !== undefined) {
      out += CONSONANTS[c];
      const next = chars[i + 1];
      if (next === VIRAMA) {
        i++;
        inherentAtEnd = false;
      } else if (next && MATRAS[next] !== undefined) {
        out += MATRAS[next];
        i++;
        inherentAtEnd = false;
        syllables++;
      } else {
        out += "a";
        inherentAtEnd = true;
        syllables++;
      }
    } else if (VOWELS[c] !== undefined) {
      out += VOWELS[c];
      inherentAtEnd = false;
      syllables++;
    } else if (SIGNS[c] !== undefined) {
      if (SIGNS[c] === ".") endWord();
      out += SIGNS[c];
      if (c === "ं" || c === "ँ" || c === "ः") inherentAtEnd = false;
    } else if (c >= "०" && c <= "९") {
      endWord();
      out += String(c.charCodeAt(0) - "०".charCodeAt(0));
    } else {
      if (/[\s.,!?;:()\-/]/.test(c)) endWord();
      out += c;
    }
  }
  endWord();
  return out;
}
