import { useState } from "react";
import { CROPS, FOOD, ITEMS, RECIPES, type CropId, type ItemId } from "../game/content";
import { formatLeft, stageFromFraction } from "../game/format";
import { growthLeft, plotFraction, plotReady, useGame } from "../game/store";
import { CropArt } from "./CropArt";
import { notify } from "./feedback";
import { Sprite } from "./Sprite";
import { useNow } from "./useNow";

export function Farm() {
  const now = useNow(250);
  const characterId = useGame((state) => state.characterId);
  const name = useGame((state) => state.name);
  const plots = useGame((state) => state.plots);
  const unlocked = useGame((state) => state.unlockedPlots);
  const rank = useGame((state) => state.rank);
  const inventory = useGame((state) => state.inventory);
  const processing = useGame((state) => state.processing);
  const stationBuilt = useGame((state) => state.stationBuilt);
  const hasLand = useGame((state) => state.hasLand);
  const plant = useGame((state) => state.plant);
  const harvest = useGame((state) => state.harvest);
  const fertilize = useGame((state) => state.fertilize);
  const eat = useGame((state) => state.eat);
  const startProcess = useGame((state) => state.startProcess);
  const claimProcess = useGame((state) => state.claimProcess);
  const [selected, setSelected] = useState(0);

  const plot = plots[selected];
  const foods = (Object.keys(FOOD) as ItemId[]).filter((id) => inventory[id] > 0);

  return (
    <div className="grid gap-4">
      <section className="map-stage">
        <img
          src="/art/farm.jpg"
          alt="Kebun dengan rumah, petak sayur, dan papan pupuk"
          className="map-art max-h-64 w-full object-cover object-center"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr_280px]">
        <section className="wood-frame p-3">
          <div className="map-stage h-40">
            <img
              src="/art/cottage.jpg"
              alt="Rumah kayu beratap biru"
              className="map-art h-full w-full object-cover object-[center_35%]"
            />
          </div>
          {characterId ? (
            <Sprite id={characterId} bob className="-mt-10 h-40 w-full rounded-xl" alt={name} />
          ) : null}
          <p className="mt-2 text-center text-sm font-extrabold">
            {hasLand ? "Tanahmu" : "Petak pinjaman"}
          </p>
        </section>

        <section className="plot-grass p-3 md:p-4">
          <div className="grid grid-cols-3 gap-3">
            {plots.map((cell, index) => {
              const locked = index >= unlocked;
              const ready = !locked && plotReady(cell, rank, now);
              const fraction = cell.crop ? plotFraction(cell, rank, now) : 0;
              return (
                <button
                  key={index}
                  type="button"
                  className="plot"
                  data-selected={selected === index}
                  data-locked={locked}
                  onClick={() => {
                    if (locked) {
                      notify({
                        ok: false,
                        message: hasLand
                          ? "Upgrade tanah di lembar karakter untuk membuka petak."
                          : "Klaim tanah dulu supaya petak ini terbuka.",
                      });
                      return;
                    }
                    setSelected(index);
                    if (ready) notify(harvest(index, Date.now()));
                  }}
                >
                  {locked ? (
                    <span className="absolute inset-0 grid place-items-center text-xs font-extrabold text-[#f6ecd8]">
                      Terkunci
                    </span>
                  ) : null}
                  {!locked && !cell.crop ? (
                    <span className="absolute inset-0 grid place-items-center text-xs font-extrabold text-[#f6e2c4]">
                      Tanam
                    </span>
                  ) : null}
                  {cell.crop ? <CropArt id={cell.crop} stage={stageFromFraction(fraction)} /> : null}
                  {ready ? <span className="ready-flag">Siap</span> : null}
                  {cell.fertilized && cell.crop && !ready ? (
                    <span className="absolute bottom-1 left-1 text-[10px] font-extrabold text-[#d8f5a8]">
                      Pupuk
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className="wood-frame grid content-start gap-3 p-4">
          <h2 className="screen-title text-3xl">Petak {selected + 1}</h2>
          {plot?.crop ? (
            <>
              <p className="text-sm font-extrabold">
                {CROPS.find((crop) => crop.id === plot.crop)?.name} ·{" "}
                {plotReady(plot, rank, now) ? "siap panen" : formatLeft(growthLeft(plot, rank, now))}
              </p>
              <div className="meter">
                <span style={{ width: `${Math.round(plotFraction(plot, rank, now) * 100)}%` }} />
              </div>
              <button
                type="button"
                className="btn btn-leaf"
                disabled={!plotReady(plot, rank, now)}
                onClick={() => notify(harvest(selected, Date.now()))}
              >
                Panen
              </button>
              <button
                type="button"
                className="btn"
                disabled={plot.fertilized || inventory.fertilizer < 1 || plotReady(plot, rank, now)}
                onClick={() => notify(fertilize(selected))}
              >
                Pupuk ({inventory.fertilizer})
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-[#5c4632]">Pilih benih yang ada di tas.</p>
              <div className="grid gap-2">
                {CROPS.map((crop) => (
                  <button
                    key={crop.id}
                    type="button"
                    className="btn justify-between"
                    disabled={inventory[crop.seed] < 1 || selected >= unlocked}
                    onClick={() => notify(plant(selected, crop.id as CropId))}
                  >
                    <span>{crop.name}</span>
                    <span className="text-xs">
                      {inventory[crop.seed]} benih · {Math.round(crop.growMs / 1000)} dtk
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="border-t-2 border-[#ead9b8] pt-3">
            <h3 className="text-sm font-extrabold">Makan</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {foods.length === 0 ? (
                <span className="text-xs text-[#6d5642]">Tas makanan kosong.</span>
              ) : (
                foods.map((id) => (
                  <button key={id} type="button" className="btn" onClick={() => notify(eat(id))}>
                    {ITEMS[id].name} +{FOOD[id]} ({inventory[id]})
                  </button>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="wood-frame p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="screen-title text-3xl">Dapur olahan</h2>
          <p className="text-xs font-extrabold text-[#6d5642]">
            {stationBuilt
              ? `Stasiun pupuk aktif · stok ${inventory.fertilizer}`
              : "Stasiun pupuk belum dibangun"}
          </p>
        </div>
        {processing ? (
          <div className="mt-3">
            <p className="text-sm font-extrabold">
              {RECIPES.find((recipe) => recipe.id === processing.recipeId)?.name} ·{" "}
              {formatLeft(processing.readyAt - now)}
            </p>
            <button
              type="button"
              className="btn btn-leaf mt-2"
              disabled={now < processing.readyAt}
              onClick={() => notify(claimProcess(Date.now()))}
            >
              Ambil hasil
            </button>
          </div>
        ) : (
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {RECIPES.map((recipe) => {
              const needs = Object.entries(recipe.inputs)
                .map(([id, qty]) => `${qty} ${ITEMS[id as ItemId].name.toLowerCase()}`)
                .join(", ");
              return (
                <button
                  key={recipe.id}
                  type="button"
                  className="item-chip text-left"
                  onClick={() => notify(startProcess(recipe.id, Date.now()))}
                >
                  <span>
                    <span className="block text-sm font-extrabold">{recipe.name}</span>
                    <span className="text-xs text-[#6d5642]">
                      {needs} · {Math.round(recipe.ms / 1000)} dtk · energi {recipe.energy}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
