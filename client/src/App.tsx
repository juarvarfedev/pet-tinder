import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  ArrowLeft,
  Bone,
  Heart,
  LogOut,
  MapPin,
  PawPrint,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  ageMonths: number;
  gender: string;
  bio: string;
  traits: string[];
  city: string;
  state: string;
  photo: string;
  adoptionFee: number;
};

type Session = {
  user: { id: string; name: string; email: string };
};

type AuthMode = "sign-in" | "sign-up";
type Decision = "like" | "pass";

const formatAge = (months: number) => {
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  return remainder ? `${years} yr ${remainder} mo` : `${years} yr`;
};

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const readResponse = async (response: Response) => {
  const data = (await response.json().catch(() => null)) as
    | { message?: string; error?: string }
    | null;
  if (!response.ok) {
    throw new Error(data?.message ?? data?.error ?? "Something went wrong. Please try again.");
  }
  return data;
};

function AuthScreen({ onAuthenticated }: { onAuthenticated: (session: Session) => void }) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const endpoint = mode === "sign-in" ? "sign-in/email" : "sign-up/email";
      await readResponse(
        await fetch(`/api/auth/${endpoint}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "sign-in" ? { email, password } : { name, email, password },
          ),
        }),
      );

      const session = await readResponse(
        await fetch("/api/me", { credentials: "include" }),
      );
      if (!session || !("user" in session) || !session.user) {
        throw new Error("We couldn't start your session. Please try again.");
      }
      onAuthenticated(session as Session);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to continue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <div className="auth-brand"><PawPrint size={21} fill="currentColor" /> Paws &amp; Paths</div>
        <div className="auth-copy">
          <span className="eyebrow"><Sparkles size={14} /> Make a match that matters</span>
          <h1>Meet your<br /><em>new best friend.</em></h1>
          <p>Swipe through local pets looking for a forever home. One small yes can change two lives.</p>
        </div>
        <div className="hero-card hero-card-back"><img src="https://pets-images.dev-apis.com/pets/dog39.jpg" alt="Happy dog" /></div>
        <div className="hero-card hero-card-front">
          <img src="https://pets-images.dev-apis.com/pets/cat14.jpg" alt="Adoptable cat" />
          <div><strong>Milo</strong><span>Rescue ready</span></div>
          <Heart className="hero-heart" fill="currentColor" size={28} />
        </div>
      </section>

      <section className="auth-panel">
        <div className="mobile-brand"><PawPrint size={21} fill="currentColor" /> Paws &amp; Paths</div>
        <div className="auth-panel-heading">
          <span className="eyebrow dark"><Bone size={14} /> Your adoption journey</span>
          <h2>{mode === "sign-in" ? "Welcome back" : "Start matching"}</h2>
          <p>{mode === "sign-in" ? "Sign in to continue meeting pets." : "Create an account to save the pets you love."}</p>
        </div>
        <form onSubmit={submit} className="auth-form">
          {mode === "sign-up" && <label>First name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex" /></label>}
          <label>Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
          <label>Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="auth-submit" disabled={isSubmitting}>{isSubmitting ? "Just a moment…" : mode === "sign-in" ? "Sign in" : "Create my account"}<ArrowLeft size={18} /></button>
        </form>
        <p className="auth-switch">{mode === "sign-in" ? "New around here?" : "Already have an account?"} <button onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setError(null); }}>{mode === "sign-in" ? "Create an account" : "Sign in"}</button></p>
        <p className="auth-fineprint">By continuing, you agree to approach every adoption with care, patience, and a whole lot of love.</p>
      </section>
    </main>
  );
}

function PetCard({ pet, onDecision }: { pet: Pet; onDecision: (decision: Decision) => void }) {
  const x = useMotionValue(0);
  const likeOpacity = useTransform(x, [0, 55, 125], [0, 0.65, 1]);
  const passOpacity = useTransform(x, [-125, -55, 0], [1, 0.65, 0]);
  const rotate = useTransform(x, [-220, 0, 220], [-10, 0, 10]);

  return (
    <motion.article
      className="pet-card active-card"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      dragMomentum={false}
      style={{ x, rotate, touchAction: "pan-y" }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 110) onDecision("like");
        if (info.offset.x < -110) onDecision("pass");
      }}
      whileTap={{ cursor: "grabbing" }}
    >
      <img src={pet.photo} alt={`${pet.name}, a ${pet.breed}`} />
      <motion.div className="swipe-badge like" style={{ opacity: likeOpacity }}>ADOPT <Heart fill="currentColor" size={19} /></motion.div>
      <motion.div className="swipe-badge pass" style={{ opacity: passOpacity }}>PASS <X size={21} /></motion.div>
      <div className="pet-gradient" />
      <div className="pet-details">
        <div className="pet-title"><h2>{pet.name}<span>{formatAge(pet.ageMonths)}</span></h2><p><MapPin size={15} /> {pet.city}, {pet.state}</p></div>
        <p className="pet-bio">{pet.bio}</p>
        <div className="trait-row">{pet.traits.slice(0, 3).map((trait) => <span key={trait}>{trait}</span>)}</div>
      </div>
    </motion.article>
  );
}

function AdoptionDeck({ session, onSignOut }: { session: Session; onSignOut: () => void }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<Decision[]>([]);
  const [liked, setLiked] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exit, setExit] = useState<Decision | null>(null);

  const loadPets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pets", { credentials: "include" });
      if (!response.ok) throw new Error("We couldn't fetch pets right now.");
      setPets(shuffle((await response.json()) as Pet[]));
      setIndex(0);
      setHistory([]);
      setLiked([]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load pets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadPets(); }, [loadPets]);

  const currentPet = pets[index];
  const nextPet = pets[index + 1];
  const decide = useCallback((decision: Decision) => {
    if (!currentPet || exit) return;
    setExit(decision);
    setHistory((previous) => [decision, ...previous]);
    if (decision === "like") setLiked((previous) => [currentPet, ...previous]);
    window.setTimeout(() => {
      setIndex((previous) => previous + 1);
      setExit(null);
    }, 230);
  }, [currentPet, exit]);

  const undo = useCallback(() => {
    if (!history.length || exit) return;
    const previousDecision = history[0];
    setIndex((previous) => Math.max(0, previous - 1));
    setHistory((previous) => previous.slice(1));
    if (previousDecision === "like") setLiked((previous) => previous.slice(1));
  }, [exit, history]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).tagName === "INPUT") return;
      if (event.key.toLowerCase() === "l") decide("like");
      if (event.key.toLowerCase() === "p") decide("pass");
      if (event.key.toLowerCase() === "u") undo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [decide, undo]);

  const deckStats = useMemo(() => `${Math.max(pets.length - index, 0)} pets nearby`, [index, pets.length]);
  const signOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
    onSignOut();
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="/"><PawPrint size={22} fill="currentColor" /> Paws &amp; Paths</a>
        <div className="nearby"><span /> {deckStats}</div>
        <div className="profile-menu"><div className="avatar">{session.user.name.slice(0, 1).toUpperCase()}</div><span>{session.user.name.split(" ")[0]}</span><button onClick={() => void signOut()} aria-label="Sign out"><LogOut size={17} /></button></div>
      </header>

      <section className="deck-layout">
        <aside className="intro-copy"><span className="eyebrow dark"><Sparkles size={14} /> Adopt, don&apos;t shop</span><h1>Find the one<br />who finds <em>you.</em></h1><p>Every right swipe is a step toward a new beginning.</p><div className="keyboard-tip"><kbd>←</kbd><span>Pass</span><kbd>→</kbd><span>Save</span></div></aside>

        <section className="deck-area" aria-label="Pet adoption cards">
          {loading && <div className="deck-message"><PawPrint className="loading-paw" /> Finding pets near you…</div>}
          {error && <div className="deck-message error"><p>{error}</p><button onClick={() => void loadPets()}>Try again</button></div>}
          {!loading && !error && !currentPet && <div className="deck-message"><Heart size={34} fill="currentColor" /><h2>That&apos;s everyone for now.</h2><p>You made {liked.length} potential {liked.length === 1 ? "match" : "matches"} today.</p><button onClick={() => void loadPets()}><RefreshCcw size={16} /> Refresh the deck</button></div>}
          {!loading && !error && currentPet && <>
            {nextPet && <article className="pet-card next-card"><img src={nextPet.photo} alt="Next pet" /></article>}
            <AnimatePresence initial={false}>
              {!exit ? <PetCard key={currentPet.id} pet={currentPet} onDecision={decide} /> : <motion.article key={currentPet.id} className="pet-card active-card" initial={{ x: 0, opacity: 1 }} animate={{ x: exit === "like" ? 520 : -520, rotate: exit === "like" ? 18 : -18, opacity: 0 }} transition={{ duration: 0.22 }}><img src={currentPet.photo} alt="" /></motion.article>}
            </AnimatePresence>
          </>}
        </section>

        <aside className="match-panel"><span className="eyebrow dark"><Heart size={14} fill="currentColor" /> Saved today</span><strong>{liked.length}</strong><p>{liked.length === 1 ? "potential match" : "potential matches"}</p><div className="saved-avatars">{liked.slice(0, 3).map((pet) => <img key={pet.id} src={pet.photo} alt={pet.name} />)}</div></aside>
      </section>

      <nav className="action-bar" aria-label="Pet actions">
        <button className="undo" disabled={!history.length || Boolean(exit)} onClick={undo} aria-label="Undo"><RotateCcw size={21} /></button>
        <button className="pass" disabled={!currentPet || Boolean(exit)} onClick={() => decide("pass")} aria-label="Pass"><X size={31} /></button>
        <button className="like" disabled={!currentPet || Boolean(exit)} onClick={() => decide("like")} aria-label="Save pet"><Heart size={29} fill="currentColor" /></button>
      </nav>
      <p className="mobile-hint">Swipe right to save · left to pass</p>
    </main>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setSession(data?.user ? data as Session : null))
      .catch(() => setSession(null))
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) return <div className="page-loader"><PawPrint className="loading-paw" /> Loading Paws &amp; Paths…</div>;
  return session ? <AdoptionDeck session={session} onSignOut={() => setSession(null)} /> : <AuthScreen onAuthenticated={setSession} />;
}

export default App;
