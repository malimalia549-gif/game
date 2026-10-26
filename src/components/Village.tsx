import { useState } from "react";
import { CheckCircle2, ScrollText, Sparkles, X } from "lucide-react";
import { QUESTS } from "../game/content";
import { useGame } from "../game/store";
import { notify, type View } from "./feedback";
import { VillageGround } from "./VillageGround";

export function Village({ onView: _onView }: { onView: (view: View) => void }) {
  const stats = useGame((state) => state.stats);
  const claimed = useGame((state) => state.claimed);
  const claimQuest = useGame((state) => state.claimQuest);
  const [questOpen, setQuestOpen] = useState(false);

  const claimableCount = QUESTS.filter((q) => stats[q.stat] >= 1 && !claimed[q.id]).length;
  const completedCount = QUESTS.filter((q) => Boolean(claimed[q.id])).length;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#5a8f29] select-none">
      <VillageGround />

      {/* Subtle floating controls hint pill in bottom-center */}
      <div className="pointer-events-none fixed bottom-3 left-1/2 -translate-x-1/2 z-20 hidden md:block">
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#2a1c12]/80 bg-[#24180f]/80 px-3.5 py-1 text-[11px] font-extrabold text-[#f6ecd8] shadow-[0_2px_0_#140e0a] backdrop-blur-xs">
          WASD / Klik Tanah: Jalan · Drag Mouse: Geser Kamera · Scroll: Zoom · Spasi: Fokus Petani
        </span>
      </div>

      {/* Floating Papan Bantuan (Quests) trigger button in bottom-right */}
      <div className="fixed right-4 bottom-4 z-30">
        <button
          type="button"
          onClick={() => setQuestOpen(true)}
          className="group relative inline-flex items-center gap-2.5 rounded-2xl border-3 border-[#140e0a] bg-gradient-to-b from-[#3c2718] to-[#26180f] px-4 py-2.5 text-[#f6ecd8] shadow-[0_5px_0_#140e0a] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl border-2 border-[#140e0a] bg-[#e7a02d] text-[#24180f] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            <ScrollText size={17} />
          </span>
          <span className="text-left">
            <span className="block text-sm leading-tight font-extrabold text-[#f6ecd8]">
              Papan Bantuan
            </span>
            <span className="block text-[11px] font-bold text-[#e7c9a0]">
              {completedCount}/{QUESTS.length} selesai
            </span>
          </span>
          {claimableCount > 0 ? (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full border-2 border-[#140e0a] bg-[#46b852] px-2 py-0.5 text-[11px] font-extrabold text-[#fffef8] shadow-[0_2px_0_#140e0a] animate-bounce">
              <Sparkles size={11} /> {claimableCount}
            </span>
          ) : null}
        </button>
      </div>

      {/* Floating Modal Popup for Papan Bantuan */}
      {questOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setQuestOpen(false)}
        >
          <section
            className="wood-frame relative w-full max-w-xl p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="screen-title text-3xl text-[#24180f]">Papan Bantuan Desa</h2>
                <p className="mt-1 text-xs font-bold text-[#5c4632]">
                  Selesaikan tugas harian petani untuk mendapatkan hadiah koin Leaf.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuestOpen(false)}
                className="btn px-2.5 py-2"
                aria-label="Tutup Papan Bantuan"
              >
                <X size={16} />
              </button>
            </div>

            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {QUESTS.map((quest) => {
                const done = stats[quest.stat] >= 1;
                const taken = Boolean(claimed[quest.id]);
                return (
                  <li key={quest.id} className="item-chip justify-between">
                    <span>
                      <span className="flex items-center gap-1.5 text-sm font-extrabold text-[#24180f]">
                        {taken ? <CheckCircle2 size={14} className="text-[#2f8a45]" /> : null}
                        {quest.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-[#6d5642]">{quest.detail}</span>
                    </span>
                    <button
                      type="button"
                      className="btn btn-gold shrink-0"
                      disabled={!done || taken}
                      onClick={() => notify(claimQuest(quest.id))}
                    >
                      {taken ? "Diambil" : `+${quest.reward}`}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      ) : null}
    </div>
  );
}
