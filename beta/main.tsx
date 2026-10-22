// Single-file beta: the browser-side app (finder, voice, kathas, kundli, panchang, sankalpa) without the server.
import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import Link from "next/link";
import { initRouter, useLocation } from "./router";
import { Nav } from "@/components/Nav";
import Home from "@/app/page";
import { Chat } from "@/app/chat/Chat";
import { PanchangView } from "@/app/panchang/PanchangView";
import { KundliView } from "@/app/kundli/KundliView";
import KriyasPage from "@/app/kriyas/page";
import KathaLibrary from "@/app/katha/page";
import LibraryPage from "@/app/library/page";
import { ProfileView } from "@/app/profile/ProfileView";
import { RitualGuide } from "@/components/RitualGuide";
import { KathaView } from "@/components/KathaView";
import { getKriya } from "@/lib/kriyas";
import { getKatha } from "@/lib/kathas";

(window as unknown as { __BRAHMAN_STATIC__: boolean }).__BRAHMAN_STATIC__ = true;

function NotFoundPage() {
  return (
    <main>
      <div className="container">
        <h1>Page not found</h1>
        <p><Link href="/">Go to the home page</Link></p>
      </div>
    </main>
  );
}

function KriyaPage({ id }: { id: string }) {
  const kriya = getKriya(id);
  if (!kriya) return <NotFoundPage />;
  return (
    <main>
      <div className="container">
        <p><Link href="/kriyas">← All puja and hawan</Link></p>
        <span className="deva tag">{kriya.devanagari}</span>
        <h1 style={{ marginTop: 8 }}>{kriya.title}</h1>
        <p className="lede">{kriya.summary}</p>
        <div className="card"><RitualGuide kriya={kriya} /></div>
      </div>
    </main>
  );
}

function KathaPage({ id }: { id: string }) {
  const k = getKatha(id);
  if (!k) return <NotFoundPage />;
  return (
    <main>
      <div className="container">
        <p><Link href="/katha">← Katha library</Link></p>
        <h1>{k.title}</h1>
        <div className="card"><KathaView id={k.id} /></div>
      </div>
    </main>
  );
}

function Route() {
  const { path } = useLocation();
  const [, section, id] = path.split("/");
  switch (section) {
    case "":
    case undefined:
      return <Home />;
    case "chat":
      return <Chat />;
    case "panchang":
      return <PanchangView />;
    case "kundli":
      return <KundliView />;
    case "kriyas":
      return id ? <KriyaPage id={id} /> : <KriyasPage />;
    case "katha":
      return id ? <KathaPage id={id} /> : <KathaLibrary />;
    case "library":
      return <LibraryPage />;
    case "profile":
      return <ProfileView />;
    default:
      return <NotFoundPage />;
  }
}

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main><div className="container"><h1>Something went wrong</h1><p>Please reload the page.</p></div></main>
    ) : this.props.children;
  }
}

function App() {
  const { path } = useLocation();
  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="brand">
            <span className="om deva" aria-hidden>ॐ</span>
            Brahman
            <span className="beta-badge" title="Beta version — feedback welcome">Beta</span>
          </Link>
          <Nav />
        </div>
      </header>
      <Boundary key={path}>
        <Route />
      </Boundary>
    </>
  );
}

initRouter();
createRoot(document.getElementById("brahman-root")!).render(<App />);
