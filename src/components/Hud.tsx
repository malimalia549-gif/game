import { Backpack, Coins, Map, Sprout, Store, User, Zap } from "lucide-react";
import { shortAddress } from "../game/format";
import { useGame } from "../game/store";
import type { View } from "./feedback";

const NAV: { id: View; label: string; icon: typeof Map }[] = [
  { id: "village", label: "Desa", icon: Map },
  { id: "farm", label: "Kebun", icon: Sprout },
  { id: "market", label: "Pasar", icon: Store },
  { id: "bag", label: "Tas", icon: Backpack },
  { id: "hero", label: "Karakter", icon: User },
];

export function Hud({ view, onView }: { view: View; onView: (view: View) => void }) {
  const name = useGame((state) => state.name);
  const level = useGame((state) => state.level);
  const energy = useGame((state) => state.energy);
  const maxEnergy = useGame((state) => state.maxEnergy);
  const coins = useGame((state) => state.coins);
  const address = useGame((state) => state.address);
  const characterId = useGame((state) => state.characterId);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 px-3 py-2.5 md:px-5">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2.5">
        {/* Left Floating Game Plaque: Avatar, Player Info, Energy & Leaf Coins */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2.5 rounded-2xl border-3 border-[#140e0a] bg-gradient-to-b from-[#3c2718]/95 to-[#25170e]/95 p-1.5 pr-3 text-[#f6ecd8] shadow-[0_5px_0_#140e0a] backdrop-blur-xs">
          <button
            type="button"
            className="group flex items-center gap-2.5 rounded-xl px-1 py-0.5 text-left transition-transform hover:scale-[1.02]"
            onClick={() => onView("hero")}
          >
            {characterId ? (
              <div className="relative shrink-0">
                <img
                  src={`/avatars/${characterId}.png`}
                  alt=""
                  className="h-11 w-11 rounded-xl border-2 border-[#e7a02d] bg-[#d8efb0] object-contain shadow-[0_2px_0_#140e0a]"
                />
                <span className="absolute -right-1 -bottom-1 rounded-md border border-[#140e0a] bg-[#e7a02d] px-1 text-[10px] leading-tight font-extrabold text-[#24180f]">
                  Lv.{level}
                </span>
              </div>
            ) : null}
            <span className="pr-1">
              <span className="screen-title block text-lg leading-none text-[#f6ecd8] group-hover:text-[#ffd98e]">
                {name}
              </span>
              <span className="mt-0.5 block text-[11px] font-extrabold text-[#e7c9a0]">
                {address ? shortAddress(address) : `Petani Lv.${level}`}
              </span>
            </span>
          </button>

          <div className="hidden h-8 w-[2px] rounded-full bg-[#523722] sm:block" />

          {/* Energy Meter */}
          <div className="min-w-32 rounded-xl border-2 border-[#140e0a] bg-[#1a110b] px-2.5 py-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
            <div className="mb-1 flex items-center justify-between gap-2 text-[11px] leading-none font-extrabold text-[#f6ecd8]">
              <span className="inline-flex items-center gap-1 text-[#f5c451]">
                <Zap size={12} /> Energi
              </span>
              <span>
                {energy}/{maxEnergy}
              </span>
            </div>
            <div className="meter">
              <span style={{ width: `${Math.round((energy / maxEnergy) * 100)}%` }} />
            </div>
          </div>

          {/* Leaf Coin Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#140e0a] bg-gradient-to-b from-[#f5b942] to-[#e0941b] px-3 py-1.5 text-sm font-extrabold text-[#24180f] shadow-[0_2px_0_#140e0a,inset_0_1px_0_rgba(255,255,255,0.55)]">
            <Coins size={15} /> {coins} Leaf
          </div>
        </div>

        {/* Right Floating Game Navigation Dock */}
        <nav className="pointer-events-auto flex items-center gap-1 overflow-x-auto rounded-2xl border-3 border-[#140e0a] bg-gradient-to-b from-[#3c2718]/95 to-[#25170e]/95 p-1.5 shadow-[0_5px_0_#140e0a] backdrop-blur-xs">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className="nav-btn inline-flex items-center gap-1.5"
                data-active={view === item.id}
                onClick={() => onView(item.id)}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
