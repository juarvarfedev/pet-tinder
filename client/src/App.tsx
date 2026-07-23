import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, RefreshCcw } from "lucide-react";

export type Pet = {
  id: string;
  name: string;
  species: string;
};

const BASE_IMAGE_URL = "https://pets-images.dev-apis.com/pets";

const buildImageUrl = (species: string, index: number) => {
  return `${BASE_IMAGE_URL}/${species}${index}.jpg`;
};

const mapSpeciesToCount: Record<string, number> = {
  dog: 39,
  cat: 14,
  bird: 9,
  rabbit: 3,
  reptile: 2,
};

function getPetImage(pet: Pet, position: number) {
  const imageSpecies = pet.species in mapSpeciesToCount ? pet.species : "dog";
  const count = mapSpeciesToCount[imageSpecies];
  const index = (((position % count) + count) % count) + 1;
  return buildImageUrl(imageSpecies, index);
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function App() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPets = useCallback(() => {
    setIsLoading(true);
    setError(null);

    fetch("/api/pets")
      .then((res) => res.json())
      .then((data) => {
        setPets(shuffle(data));
        setCurrentIndex(0);
        setHistory([]);
      })
      .catch(() => setError("Failed to load pets."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const currentPet = pets[currentIndex];
  const nextPet = pets[currentIndex + 1];

  const handleDecision = useCallback((pet: Pet) => {
    setHistory((prev) => [pet, ...prev]);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length === 0) {
      return;
    }

    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    setHistory((prev) => prev.slice(1));
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentPet) return;

      const key = event.key.toLowerCase();
      if (key === "l") {
        handleDecision(currentPet);
      } else if (key === "p") {
        handleDecision(currentPet);
      } else if (key === "u") {
        handleUndo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPet, handleDecision, handleUndo]);

  const cards = useMemo(() => {
    return [currentPet, nextPet].filter(Boolean);
  }, [currentPet, nextPet]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white px-4 py-8">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-soft backdrop-blur-xl">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-pink-300">
              Pet Tinder
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              Swipe through the pack
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Like, pass, or undo your last decision. Works on desktop and touch
              devices with drag and arrow keys.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-right text-sm text-slate-400">
            <p>Keyboard</p>
            <p className="mt-1">L = Like · P = Pass · U = Undo</p>
          </div>
        </header>

        <main className="relative h-[640px] overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/90 p-4 shadow-soft">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              Loading pets…
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-red-300">
              {error}
            </div>
          ) : !currentPet ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-slate-300">
              <p className="text-xl font-semibold">No more pets for now</p>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-400"
                onClick={() => window.location.reload()}
              >
                <RefreshCcw size={18} /> Refresh deck
              </button>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {cards.map((pet, index) => {
                const position = currentIndex + index;
                const rotation = index === 0 ? 0 : -4;
                const translate = index === 0 ? "0" : "-10px";
                return (
                  <motion.div
                    key={pet.id}
                    className="absolute inset-x-0 mx-auto w-[92%] max-w-lg rounded-[32px] border border-white/10 bg-slate-950/95 shadow-soft"
                    drag={index === 0 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.18}
                    onDragEnd={(_, info) => {
                      if (index !== 0) return;
                      if (info.offset.x > 140) {
                        handleDecision(pet);
                      } else if (info.offset.x < -140) {
                        handleDecision(pet);
                      }
                    }}
                    whileTap={{ scale: 0.98 }}
                    initial={{
                      y: index === 0 ? 0 : 16,
                      opacity: index === 0 ? 1 : 0.8,
                    }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      rotate: rotation,
                      x: translate,
                    }}
                    transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  >
                    <img
                      src={getPetImage(pet, position)}
                      alt={`${pet.name} the ${pet.species}`}
                      className="h-[420px] w-full rounded-t-[32px] object-cover"
                    />
                    <div className="space-y-4 p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-3xl font-semibold">{pet.name}</p>
                          <p className="mt-1 text-sm uppercase tracking-[0.26em] text-slate-400">
                            {pet.species}
                          </p>
                        </div>
                        <span className="rounded-full bg-pink-500/15 px-3 py-1 text-xs uppercase tracking-[0.24em] text-pink-300">
                          {index === 0 ? "Now" : "Next"}
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                            Swipe action
                          </p>
                          <p className="mt-2 text-lg font-semibold">
                            {index === 0 ? "Drag left or right" : "Preview"}
                          </p>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                            Deck position
                          </p>
                          <p className="mt-2 text-lg font-semibold">
                            {currentIndex + 1} / {pets.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>

        <footer className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <button
              type="button"
              disabled={history.length === 0}
              onClick={handleUndo}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-800"
            >
              <ArrowLeft size={16} /> Undo
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => currentPet && handleDecision(currentPet)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/15"
            >
              <span className="text-pink-300">←</span> Pass
            </button>
            <button
              type="button"
              onClick={() => currentPet && handleDecision(currentPet)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-pink-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-400"
            >
              Like <Heart size={16} />
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              <RefreshCcw size={16} /> Shuffle
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
