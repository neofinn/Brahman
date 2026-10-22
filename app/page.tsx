import Link from "next/link";

const FEATURES = [
  { href: "/chat", title: "Ask Brahman", text: "Say \"I want to perform Graha Shanti hawan\" or share your birth details — get the samagri, every step, the mantras recited aloud, or your kundli with a full reading." },
  { href: "/panchang", title: "Daily Panchang", text: "Tithi, nakshatra, yoga, karana, sunrise, Rahu Kaal and auspicious muhurtas, computed for your city." },
  { href: "/kundli", title: "Janma Kundli", text: "Your birth chart with a complete reading: lagna, rashi, nakshatra and naam akshar, yogas, Mangal dosh, Kaal Sarp, Sade Sati, dashas and remedies." },
  { href: "/kriyas", title: "Puja, Hawan & Vidhi", text: "Graha shanti, havan, Vastu shanti, Rudrabhishek, Satyanarayan, Lakshmi puja, Navratri, Sundarkand, Shani shanti and more — perform them step by step." },
  { href: "/library", title: "Scripture Library", text: "Explore the Vedas, Upanishads, Itihasas, Puranas, Darshanas and Agamas, and ask about any text." },
];

export default function Home() {
  return (
    <main>
      <div className="container">
        <section className="hero">
          <div className="om-big deva" aria-hidden>ॐ</div>
          <h1>Brahman</h1>
          <p>
            Your purohit for every day — learned in puja, hawan, kriyas and Jyotisha. Tell Brahman what you wish to
            perform and it guides you like a pandit: samagri, every step and every mantra. Free, private, no account needed.
          </p>
          <div className="actions">
            <Link href="/chat" className="btn">🙏 Ask Brahman</Link>
            <Link href="/panchang" className="btn secondary">Today&apos;s Panchang</Link>
          </div>
        </section>

        <div className="grid">
          {FEATURES.map((f) => (
            <Link key={f.href} href={f.href} className="card">
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </Link>
          ))}
        </div>

        <blockquote className="shloka">
          <div className="deva">ॐ असतो मा सद्गमय। तमसो मा ज्योतिर्गमय। मृत्योर्मा अमृतं गमय॥</div>
          <div className="iast">oṃ asato mā sad gamaya | tamaso mā jyotir gamaya | mṛtyor mā amṛtaṃ gamaya ||</div>
          <div>Lead me from the unreal to the real, from darkness to light, from death to immortality.</div>
          <div className="iast">— Brihadaranyaka Upanishad 1.3.28</div>
        </blockquote>
      </div>
      <footer className="footer">
        Brahman offers spiritual and educational guidance. For samskaras and major rites, involve your family purohit;
        for health, legal or financial matters, consult a qualified professional.
      </footer>
    </main>
  );
}
