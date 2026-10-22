import Link from "next/link";

const FEATURES = [
  { href: "/chat", title: "Ask Brahman", text: "Questions on dharma, scripture, philosophy, rituals and life — answered with references to the texts, in your language." },
  { href: "/panchang", title: "Daily Panchang", text: "Tithi, nakshatra, yoga, karana, sunrise, Rahu Kaal and auspicious muhurtas, computed for your city." },
  { href: "/kundli", title: "Janma Kundli", text: "Your sidereal birth chart with lagna, grahas, nakshatras and Vimshottari dasha — and a reading from Brahman." },
  { href: "/kriyas", title: "Puja Vidhi", text: "Step-by-step guides for daily puja, Ganesha puja, Satyanarayan katha, Ekadashi, griha pravesha, tarpana and more." },
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
            Your purohit for every day — learned in the Vedas, Upanishads, Puranas, Itihasas, kriyas and Jyotisha,
            and here to guide you with warmth and the wisdom of the shastras.
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
