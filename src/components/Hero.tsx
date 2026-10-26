import {
  FERTILIZER_MS,
  LAND_COST,
  LAND_PLOTS,
  MAX_PLOTS,
  PLOT_UPGRADE_COST,
  STATION_COST,
  characterTitle,
  upgradeCost,
} from "../game/content";
import { formatLeft, shortAddress } from "../game/format";
import { useGame } from "../game/store";
import { notify } from "./feedback";
import { Sprite } from "./Sprite";
import { useNow } from "./useNow";

export function Hero({ onReset }: { onReset: () => void }) {
  const now = useNow(500);
  const characterId = useGame((state) => state.characterId);
  const name = useGame((state) => state.name);
  const level = useGame((state) => state.level);
  const xp = useGame((state) => state.xp);
  const rank = useGame((state) => state.rank);
  const address = useGame((state) => state.address);
  const hasLand = useGame((state) => state.hasLand);
  const stationBuilt = useGame((state) => state.stationBuilt);
  const unlocked = useGame((state) => state.unlockedPlots);
  const lastStationAt = useGame((state) => state.lastStationAt);
  const inventory = useGame((state) => state.inventory);
  const claimLand = useGame((state) => state.claimLand);
  const buildStation = useGame((state) => state.buildStation);
  const upgradeRank = useGame((state) => state.upgradeRank);
  const upgradePlots = useGame((state) => state.upgradePlots);
  const reset = useGame((state) => state.reset);

  if (!characterId) return null;
  const need = level * 40;
  const nextFertilizer = stationBuilt ? Math.max(0, lastStationAt + FERTILIZER_MS - now) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <section className="wood-frame p-4">
        <Sprite id={characterId} bob className="h-72 w-full rounded-2xl" alt={name} />
        <h2 className="screen-title mt-3 text-4xl">{name}</h2>
        <p className="text-sm font-extrabold text-[#6d5642]">
          #{characterId} · {characterTitle(characterId)}
        </p>
        <p className="mt-2 text-xs font-extrabold break-all text-[#7a6248]">
          {address ? shortAddress(address) : "Tanpa dompet"} · level {level} · rank {rank}
        </p>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs font-extrabold">
            <span>XP</span>
            <span>
              {xp}/{need}
            </span>
          </div>
          <div className="meter">
            <span style={{ width: `${Math.min(100, Math.round((xp / need) * 100))}%` }} />
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        <section className="map-stage">
          <img src="/art/homestead.jpg" alt="Rumah, lumbung, dan petak sayur" className="map-art" />
        </section>
        <section className="wood-frame grid gap-3 p-4 md:grid-cols-2">
          <article className="item-chip flex-col items-start">
            <h3 className="text-sm font-extrabold">Upgrade karakter</h3>
            <p className="text-xs text-[#6d5642]">
              Rank {rank}/5. Naikkan energi maksimum dan kecepatan tumbuh.
            </p>
            <button
              type="button"
              className="btn btn-gold"
              disabled={rank >= 5}
              onClick={() => notify(upgradeRank())}
            >
              {rank >= 5 ? "Maksimal" : `${upgradeCost(rank)} Leaf`}
            </button>
          </article>
          <article className="item-chip flex-col items-start">
            <h3 className="text-sm font-extrabold">Tanah</h3>
            <p className="text-xs text-[#6d5642]">
              {hasLand
                ? `Milikmu. ${unlocked} petak terbuka.`
                : `Klaim tanah, buka ${LAND_PLOTS} petak, lalu bangun stasiun pupuk.`}
            </p>
            <button type="button" className="btn btn-leaf" disabled={hasLand} onClick={() => notify(claimLand())}>
              {hasLand ? "Sudah punya" : `${LAND_COST} Leaf`}
            </button>
          </article>
          <article className="item-chip flex-col items-start">
            <h3 className="text-sm font-extrabold">Stasiun pupuk</h3>
            <p className="text-xs text-[#6d5642]">
              {stationBuilt
                ? `Stok ${inventory.fertilizer}. Berikutnya ${formatLeft(nextFertilizer)}.`
                : "Menghasilkan pupuk berkala. Butuh tanah."}
            </p>
            <button
              type="button"
              className="btn"
              disabled={!hasLand || stationBuilt}
              onClick={() => notify(buildStation(Date.now()))}
            >
              {stationBuilt ? "Berdiri" : `${STATION_COST} Leaf`}
            </button>
          </article>
          <article className="item-chip flex-col items-start">
            <h3 className="text-sm font-extrabold">Perluas petak</h3>
            <p className="text-xs text-[#6d5642]">
              {unlocked >= MAX_PLOTS
                ? "Sembilan petak sudah terbuka."
                : `Tambah 3 petak, sampai ${MAX_PLOTS}.`}
            </p>
            <button
              type="button"
              className="btn"
              disabled={!hasLand || unlocked >= MAX_PLOTS}
              onClick={() => notify(upgradePlots())}
            >
              {unlocked >= MAX_PLOTS ? "Penuh" : `${PLOT_UPGRADE_COST} Leaf`}
            </button>
          </article>
        </section>
        <button
          type="button"
          className="btn btn-tomato w-fit"
          onClick={() => {
            if (window.confirm("Hapus progres desa di browser ini?")) {
              reset();
              onReset();
            }
          }}
        >
          Mulai ulang desa
        </button>
      </div>
    </div>
  );
}
