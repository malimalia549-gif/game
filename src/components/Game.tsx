import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useGame, type Persisted } from "../game/store";
import { Bag } from "./Bag";
import { Farm } from "./Farm";
import { type View } from "./feedback";
import { Hero } from "./Hero";
import { Hud } from "./Hud";
import { Market } from "./Market";
import { Mint } from "./Mint";
import { Village } from "./Village";

export function Game() {
  const characterId = useGame((state) => state.characterId);
  const passiveTick = useGame((state) => state.passiveTick);
  const [booted, setBooted] = useState(false);
  const [view, setView] = useState<View>("village");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("kebun-robin-v1");
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: Partial<Persisted> };
        if (parsed.state) useGame.getState().applySave(parsed.state);
      }
    } catch {
      // A broken save should not block a new farmer.
    }
    setBooted(true);
  }, []);

  useEffect(() => {
    if (!booted) return;
    const id = window.setInterval(() => passiveTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [booted, passiveTick]);

  if (!booted) {
    return (
      <main className="grid min-h-screen place-items-center text-[#f6ecd8]">
        <p className="screen-title text-4xl">Kebun Robin</p>
      </main>
    );
  }

  if (!characterId) return (
    <>
      <Mint />
      <Toaster position="top-center" />
    </>
  );

  return (
    <div className="min-h-screen">
      <Hud view={view} onView={setView} />
      {view === "village" ? (
        <Village onView={setView} />
      ) : (
        <main className="mx-auto grid max-w-6xl gap-4 px-3 pt-20 pb-6 md:px-5">
          {view === "farm" ? <Farm /> : null}
          {view === "market" ? <Market /> : null}
          {view === "bag" ? <Bag /> : null}
          {view === "hero" ? <Hero onReset={() => setView("village")} /> : null}
          <p className="text-center text-[11px] font-extrabold text-[#d7e7c4]/80">
            Sandbox di browser. Ekonomi mengikuti desain Kebun Robin; kontrak Robinhood Chain belum
            dipasang di build ini.
          </p>
        </main>
      )}
      <Toaster position="top-center" />
    </div>
  );
}
