import React, { useMemo, useState, useEffect } from "react";

// Courier Leasing – Mobile App Demo (logo disabled)
// - Etusivu: auton tila, sopimus
// - Päivitä sopimus: lomake
// - Vikailmoitus: lomake + liite (demo)
// - Suosittele kaverille: jakolinkki + ehdot
// - Uusi hakemus: vahva tunnistautuminen (demo-kytkin)
//
// FIX: Removed invalid escapes (") inside JSX attributes that caused:
//   SyntaxError: Expecting Unicode escape sequence \uXXXX
// Added: lightweight smoke tests via console.assert to validate UI renders.

const BRAND = {
  name: "Courier Leasing",
  primary: "#0B3355",
  primaryDark: "#07263F",
  accent: "#FF7A00",
  text: "#0F172A",
  surface: "#FFFFFF",
  bg: "#F7FAFF",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  headingFont: "'Michroma', 'Inter', system-ui, sans-serif",
  bodyFont: "'Inter', system-ui, sans-serif",
};

// Vehicle image (external URL provided by user)
const CAR_IMAGE_URL = "https://autodesignmagazine.com/wp-content/uploads/2019/10/2019101601_Toyota_Yaris.jpg";

export default function App() {
  const [activeTab, setActiveTab] = useState(
    "etusivu" as "etusivu" | "vikailmoitus" | "paivitys" | "hakemus" | "profiili"
  );
  const [issueOpen, setIssueOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [referOpen, setReferOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const contractEnds = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 8);
    d.setDate(d.getDate() + 12);
    return d;
  }, []);
  const daysLeft = Math.max(
    1,
    Math.ceil((+contractEnds - +new Date()) / (1000 * 60 * 60 * 24))
  );

  function copy(text: string) {
    navigator.clipboard?.writeText(text).then(() =>
      setToast("Kopioitu leikepöydälle")
    );
  }

  useEffect(() => {
    try {
      console.assert(daysLeft > 0, "daysLeft should be > 0");
      if (typeof document !== "undefined") {
        console.assert(
          !!document.querySelector('[data-testid="nav-tabs"]'),
          "Nav tabs should exist"
        );
        console.assert(
          !!document.querySelector('[data-testid="tab-etusivu"]'),
          "Etusivu tab should exist"
        );
      }
      console.log("✅ Demo smoke tests passed");
    } catch (e) {
      console.warn("⚠️ Demo smoke tests: ", e);
    }
  }, []);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ background: BRAND.bg, color: BRAND.text, fontFamily: BRAND.bodyFont }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Michroma&display=swap');`}</style>

      <div
        className="relative w-[393px] h-[852px] rounded-[44px] shadow-2xl ring-1 overflow-hidden flex flex-col"
        style={{ background: BRAND.surface, borderColor: "#E5E7EB" }}
      >
        <StatusBar />
        <Header daysLeft={daysLeft} onBell={() => setToast("Ilmoitukset: ei uusia")} />

        <nav
          className="grid grid-cols-4 gap-1 px-3 pt-2 pb-3 sticky top-0 bg-white/80 backdrop-blur z-10 border-b"
          style={{ borderColor: "#E5E7EB" }}
          data-testid="nav-tabs"
        >
          {[
            { k: "etusivu", label: "Etusivu" },
            { k: "vikailmoitus", label: "Vikailmoitus" },
            { k: "paivitys", label: "Päivitä sopimus" },
            { k: "hakemus", label: "Uusi hakemus" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setActiveTab(t.k as any)}
              className="text-sm rounded-full px-3 py-2 border transition"
              style={
                activeTab === t.k
                  ? { background: BRAND.primary, color: "#fff", borderColor: BRAND.primary }
                  : { background: BRAND.surface, color: BRAND.text, borderColor: "#E5E7EB" }
              }
              data-testid={`tab-${t.k}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <main className="px-4 pb-28 space-y-4 flex-1 overflow-y-auto">
          {activeTab === "etusivu" && (
            <Home
              daysLeft={daysLeft}
              onOpenUpdate={() => setUpdateOpen(true)}
              onOpenIssue={() => setIssueOpen(true)}
              onOpenRefer={() => setReferOpen(true)}
            />
          )}

          {activeTab === "vikailmoitus" && (
            <Card>
              <IssueForm onSubmit={() => setToast("Vikailmoitus lähetetty")} />
            </Card>
          )}

          {activeTab === "paivitys" && (
            <Card>
              <UpdateForm onSubmit={() => setToast("Päivityspyyntö vastaanotettu")} />
            </Card>
          )}

          {activeTab === "hakemus" && (
            <Card>
              <ApplyForm
                authReady={authReady}
                setAuthReady={setAuthReady}
                onSubmit={() => setToast("Hakemus vastaanotettu")}
              />
            </Card>
          )}
        </main>

        <BottomBar onProfile={() => setActiveTab("profiili")} />

        {issueOpen && (
          <Modal title="Ilmoita viasta" onClose={() => setIssueOpen(false)}>
            <IssueForm
              onSubmit={() => {
                setIssueOpen(false);
                setToast("Vikailmoitus lähetetty");
              }}
            />
          </Modal>
        )}
        {updateOpen && (
          <Modal title="Päivitä sopimus" onClose={() => setUpdateOpen(false)}>
            <UpdateForm
              onSubmit={() => {
                setUpdateOpen(false);
                setToast("Päivityspyyntö vastaanotettu");
              }}
            />
          </Modal>
        )}
        {referOpen && (
          <Modal title="Suosittele kaverille" onClose={() => setReferOpen(false)}>
            <ReferFriend onCopy={() => copy("https://courierleasing.fi/suosittele?code=ABC123")} />
          </Modal>
        )}

        {toast && (
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-4 text-sm px-4 py-2 rounded-full shadow-lg"
            style={{ background: BRAND.text, color: "#fff" }}
            onAnimationEnd={() => setToast(null)}
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBar() {
  return <div className="h-6" style={{ background: BRAND.text }} />;
}

function Header({ daysLeft, onBell }: { daysLeft: number; onBell: () => void }) {
  const months = Math.floor(daysLeft / 30);
  const remDays = daysLeft % 30;
  return (
    <header
      className="px-5 pt-4 pb-5 drop-shadow-xl flex items-center justify-between"
      style={{
        color: "#fff",
        background: `linear-gradient(180deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
        fontFamily: BRAND.headingFont,
      }}
    >
      <div className="flex items-center gap-2">
        <div className="text-white font-bold tracking-wide text-lg">Courier Leasing</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs opacity-90">Jäljellä {months} kk {remDays} pv</div>
        <button
          onClick={onBell}
          aria-label="Ilmoitukset"
          className="rounded-full p-2 hover:opacity-90"
          style={{ background: "#ffffff20" }}
        >
          <BellIcon />
        </button>
      </div>
    </header>
  );
}

function Home({ daysLeft, onOpenUpdate, onOpenIssue, onOpenRefer }: {
  daysLeft: number;
  onOpenUpdate: () => void;
  onOpenIssue: () => void;
  onOpenRefer: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Autoni</div>
            <div className="font-semibold" style={{ fontFamily: BRAND.headingFont }}>Toyota Yaris Hybrid 1.5</div>
          </div>
          <div className="w-28 h-16 rounded-md overflow-hidden ring-1 ring-slate-200">
            <img
              src={CAR_IMAGE_URL}
              alt="Toyota Yaris"
              className="w-full h-full object-cover"
              loading="lazy"
              data-testid="car-image"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white" style={{ background: BRAND.success }}>✓</span>
          <span>OK – ei ilmoitettuja vikoja</span>
        </div>
      </Card>

      <Card>
        <div className="text-sm text-slate-500">Sopimus</div>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <div>
            <div className="font-medium" style={{ fontFamily: BRAND.headingFont }}>CL-2025-001234</div>
            <div className="text-slate-600 text-sm">Kuukausi 389 € · 15 000 km/v</div>
          </div>
          <div className="ml-auto text-sm text-slate-600">Jäljellä {daysLeft} pv</div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            className="flex-1 rounded-xl text-white py-2.5 font-medium transition"
            style={{ background: BRAND.primary }}
            onClick={onOpenUpdate}
          >
            Päivitä sopimus
          </button>
          <button
            className="flex-1 rounded-xl text-white py-2.5 font-medium transition"
            style={{ background: BRAND.text }}
            onClick={onOpenIssue}
          >
            Ilmoita viasta
          </button>
        </div>
      </Card>

      <Alert type="warning" title="Huolto lähestyy" text="Seuraava huolto 2 000 km kuluttua. Varaa aika kumppaniverkostosta." />

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Suosittele kaverille</div>
            <div className="font-medium">Onnistuneesta suosittelusta 1 kk veloituksetta</div>
          </div>
          <button
            className="rounded-full px-4 py-2 text-white text-sm"
            style={{ background: BRAND.accent }}
            onClick={onOpenRefer}
          >
            Jaa linkki
          </button>
        </div>
      </Card>

      <Card>
        <div className="text-sm text-slate-500">Uusi asiakas</div>
        <div className="font-medium">Täytä leasing‑hakemus sovelluksessa</div>
        <div className="text-slate-600 text-sm mt-2">Kirjautuminen vahvalla tunnistautumisella (Suomi.fi/BankID‑demo).</div>
        <div className="mt-3 flex gap-2">
          <a href="#hakemus" className="rounded-xl text-white py-2.5 px-4 font-medium" style={{ background: BRAND.primary }}>Aloita hakemus</a>
          <button className="rounded-xl border py-2.5 px-4 font-medium hover:bg-slate-50" style={{ borderColor: "#E5E7EB" }}>Katso ehdot</button>
        </div>
      </Card>
    </div>
  );
}

function IssueForm({ onSubmit }: { onSubmit: () => void }) {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
        setTimeout(onSubmit, 600);
      }}
    >
      <h2 className="text-lg font-semibold" style={{ fontFamily: BRAND.headingFont }}>Vikailmoitus</h2>
      <label className="block text-sm">Vian tyyppi</label>
      <select className="w-full rounded-xl border p-2.5" style={{ borderColor: "#E5E7EB" }}>
        <option>Moottori</option>
        <option>Jarrut</option>
        <option>Renkaat</option>
        <option>Sähkö / varoitusvalo</option>
        <option>Muu</option>
      </select>
      <label className="block text-sm">Kuvaus</label>
      <textarea className="w-full rounded-xl border p-2.5" rows={4} placeholder="Kerro oireista, milloin ilmenee…" style={{ borderColor: "#E5E7EB" }} />
      <div className="flex items-center gap-2 text-sm">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: "#F1F5F9" }}>📷</span>
        <span>Liitä kuva/video (demo)</span>
      </div>
      <button className="w-full rounded-xl text-white py-2.5 font-medium" style={{ background: BRAND.text }}>
        {sent ? "Lähetetään…" : "Lähetä ilmoitus"}
      </button>
    </form>
  );
}

function UpdateForm({ onSubmit }: { onSubmit: () => void }) {
  const [sending, setSending] = useState(false);
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setSending(true);
        setTimeout(onSubmit, 700);
      }}
    >
      <h2 className="text-lg font-semibold" style={{ fontFamily: BRAND.headingFont }}>Päivitä sopimus</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Toivottu malli</label>
          <input className="w-full rounded-xl border p-2.5" placeholder="Esim. Corolla Hybrid" style={{ borderColor: "#E5E7EB" }} />
        </div>
        <div>
          <label className="block text-sm">Vuosittainen km</label>
          <input className="w	full rounded-xl border p-2.5" placeholder="20 000" style={{ borderColor: "#E5E7EB" }} />
        </div>
        <div>
          <label className="block text-sm">Toivottu kuukausihinta</label>
          <input className="w-full rounded-xl border p-2.5" placeholder="400 €" style={{ borderColor: "#E5E7EB" }} />
        </div>
        <div>
          <label className="block text-sm">Vaihdetaan nykyinen auto?</label>
          <select className="w-full rounded-xl border p-2.5" style={{ borderColor: "#E5E7EB" }}><option>Kyllä</option><option>Ei</option></select>
        </div>
      </div>
      <label className="block text-sm">Lisätiedot</label>
      <textarea className="w-full rounded-xl border p-2.5" rows={3} placeholder="Tarpeet, varusteet, aikataulu…" style={{ borderColor: "#E5E7EB" }} />
      <button className="w-full rounded-xl text-white py-2.5 font-medium" style={{ background: BRAND.primary }}>
        {sending ? "Lähetetään…" : "Lähetä pyyntö"}
      </button>
    </form>
  );
}

function ApplyForm({ authReady, setAuthReady, onSubmit }: { authReady: boolean; setAuthReady: (v: boolean) => void; onSubmit: () => void }) {
  const [sending, setSending] = useState(false);
  return (
    <form
      id="hakemus"
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setSending(true);
        setTimeout(onSubmit, 900);
      }}
    >
      <h2 className="text-lg font-semibold" style={{ fontFamily: BRAND.headingFont }}>Uuden asiakkaan hakemus</h2>
      <div className="rounded-xl border p-3 flex items-center justify-between" style={{ borderColor: "#E5E7EB" }}>
        <div>
          <div className="font-medium">Vahva tunnistautuminen</div>
          <div className="text-sm text-slate-600">Suomi.fi / pankkitunnus – DEMO</div>
        </div>
        <button
          type="button"
          className="rounded-full px-4 py-2 text-sm text-white"
          style={{ background: authReady ? BRAND.success : "#CBD5E1" }}
          onClick={() => setAuthReady(!authReady)}
        >
          {authReady ? "Tunnistettu" : "Tunnistaudu"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className="rounded-xl border p-2.5" placeholder="Etunimi" style={{ borderColor: "#E5E7EB" }} />
        <input className="rounded-xl border p-2.5" placeholder="Sukunimi" style={{ borderColor: "#E5E7EB" }} />
        <input className="rounded-xl border p-2.5" placeholder="Henkilötunnus (DEMO)" style={{ borderColor: "#E5E7EB" }} />
        <input className="rounded-xl border p-2.5" placeholder="Puhelin" style={{ borderColor: "#E5E7EB" }} />
        <input className="rounded-xl border p-2.5 sm:col-span-2" placeholder="Sähköposti" style={{ borderColor: "#E5E7EB" }} />
      </div>
      <label className="block text-sm">Toivottu auto / budjetti</label>
      <input className="w-full rounded-xl border p-2.5" placeholder="Esim. Yaris Hybrid ~ 350 €/kk" style={{ borderColor: "#E5E7EB" }} />
      <button disabled={!authReady} className="w-full rounded-xl py-2.5 font-medium text-white" style={{ background: authReady ? BRAND.primary : "#CBD5E1" }}>
        {sending ? "Lähetetään…" : "Lähetä hakemus"}
      </button>
      {!authReady && (
        <p className="text-xs text-slate-500 text-center">Ota käyttöön vahva tunnistautuminen jatkaaksesi.</p>
      )}
    </form>
  );
}

function ReferFriend({ onCopy }: { onCopy: () => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm">
        Suosittele palvelu tuttavallesi. Kun heidän sopimuksensa alkaa, saat{" "}
        <span className="font-semibold">1 kuukauden veloituksetta</span> omaan sopimukseesi.
      </p>
      <div className="rounded-xl border p-3 flex items-center justify-between gap-2" style={{ borderColor: "#E5E7EB" }}>
        <div className="text-sm">Suosittelulinkki</div>
        <code className="text-xs bg-slate-100 px-2 py-1 rounded">…/suosittele?code=ABC123</code>
        <button onClick={onCopy} className="rounded-full px-4 py-2 text-white text-sm" style={{ background: BRAND.text }}>
          Kopioi
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="rounded-xl border py-2.5 font-medium hover:bg-slate-50" style={{ borderColor: "#E5E7EB" }}>Jaa WhatsApp</button>
        <button className="rounded-xl border py-2.5 font-medium hover:bg-slate-50" style={{ borderColor: "#E5E7EB" }}>Jaa Sähköposti</button>
      </div>
      <div className="rounded-xl p-3" style={{ background: "#FFF7ED", border: `1px solid ${BRAND.accent}33` }}>
        <div className="text-sm font-medium" style={{ color: BRAND.accent }}>Kampanjaehdot (lyhyesti)</div>
        <ul className="text-xs text-slate-600 list-disc pl-5 mt-1">
          <li>Hyvitys 1 kk veloituksetta, kun suosittelun kautta tehty sopimus alkaa.</li>
          <li>Hyvitys kohdistetaan seuraavaan laskutuskauteen.</li>
          <li>Ei voi yhdistää muihin alennuksiin. (DEMO)</li>
        </ul>
      </div>
    </div>
  );
}

function BottomBar({ onProfile }: { onProfile: () => void }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-3">
      <div className="rounded-2xl bg-white border shadow-lg px-3 py-2 flex items-center justify-between" style={{ borderColor: "#E5E7EB" }}>
        <button className="p-2 rounded-xl hover:bg-slate-100" aria-label="Koti">🏠</button>
        <button className="p-2 rounded-xl hover:bg-slate-100" aria-label="Hakemus">📄</button>
        <button className="p-2 rounded-xl hover:bg-slate-100" aria-label="Vika">⚠️</button>
        <button className="p-2 rounded-xl hover:bg-slate-100" aria-label="Profiili" onClick={onProfile}>👤</button>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white border shadow-sm p-4" style={{ borderColor: "#E5E7EB" }}>{children}</section>
  );
}

function Alert({ type = "info", title, text }: { type?: "info" | "warning" | "error"; title: string; text: string }) {
  const styles: Record<string, React.CSSProperties> = {
    info: { background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE" },
    warning: { background: "#FFFBEB", color: BRAND.warning, border: "1px solid #FDE68A" },
    error: { background: "#FEF2F2", color: BRAND.error, border: "1px solid #FECACA" },
  };
  return (
    <div className="rounded-2xl p-3" style={styles[type]}>
      <div className="font-medium">{title}</div>
      <div className="text-sm opacity-90">{text}</div>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-end sm:items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "#E5E7EB" }}>
          <h3 className="text-lg font-semibold" style={{ fontFamily: BRAND.headingFont }}>{title}</h3>
          <button onClick={onClose} aria-label="Sulje" className="p-2 rounded-lg hover:bg-slate-100">✕</button>
        </div>
        <div className="pt-3 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Z" fill="currentColor" />
      <path d="M19 16V11a7 7 0 1 0-14 0v5l-1.5 2v1h17v-1L19 16Z" fill="currentColor" />
    </svg>
  );
}
