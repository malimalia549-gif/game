import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CROP_BY_ID,
  CHARACTER_COUNT,
  ENERGY_REGEN_MS,
  FERTILIZER_CAP,
  FERTILIZER_MS,
  FOOD,
  ITEMS,
  LAND_COST,
  LAND_PLOTS,
  MARKET_FEE,
  MAX_ENERGY_CAP,
  MAX_PLOTS,
  PLOT_UPGRADE_COST,
  QUESTS,
  RECIPE_BY_ID,
  START_PLOTS,
  STATION_COST,
  emptyInventory,
  growthMs,
  harvestYield,
  upgradeCost,
  type CropId,
  type ItemId,
} from "./content";
import { fail, makeAddress, ok, type ActionResult } from "./format";

export type PlotState = {
  crop: CropId | null;
  plantedAt: number | null;
  fertilized: boolean;
};

export type ProcessingJob = {
  recipeId: string;
  readyAt: number;
};

export type Stats = {
  planted: number;
  harvested: number;
  eaten: number;
  sold: number;
  processed: number;
  land: number;
};

export type Persisted = {
  address: string | null;
  characterId: number | null;
  name: string;
  level: number;
  xp: number;
  energy: number;
  maxEnergy: number;
  coins: number;
  rank: number;
  hasLand: boolean;
  stationBuilt: boolean;
  lastStationAt: number;
  lastEnergyAt: number;
  unlockedPlots: number;
  plots: PlotState[];
  inventory: Record<ItemId, number>;
  processing: ProcessingJob | null;
  treasury: number;
  stats: Stats;
  claimed: Record<string, boolean>;
  log: string[];
};

type GameState = Persisted & {
  connect: () => ActionResult;
  mint: (characterId: number, name: string) => ActionResult;
  plant: (index: number, cropId: CropId) => ActionResult;
  harvest: (index: number, now: number) => ActionResult;
  fertilize: (index: number) => ActionResult;
  eat: (itemId: ItemId) => ActionResult;
  buy: (itemId: ItemId, qty: number) => ActionResult;
  sell: (itemId: ItemId, qty: number) => ActionResult;
  startProcess: (recipeId: string, now: number) => ActionResult;
  claimProcess: (now: number) => ActionResult;
  claimLand: () => ActionResult;
  buildStation: (now: number) => ActionResult;
  upgradeRank: () => ActionResult;
  upgradePlots: () => ActionResult;
  claimQuest: (questId: string) => ActionResult;
  passiveTick: (now: number) => void;
  applySave: (saved: Partial<Persisted>) => void;
  reset: () => void;
};

function blankPlot(): PlotState {
  return { crop: null, plantedAt: null, fertilized: false };
}

function blankStats(): Stats {
  return { planted: 0, harvested: 0, eaten: 0, sold: 0, processed: 0, land: 0 };
}

function initialPersisted(): Persisted {
  const now = Date.now();
  return {
    address: null,
    characterId: null,
    name: "",
    level: 1,
    xp: 0,
    energy: 100,
    maxEnergy: 100,
    coins: 36,
    rank: 0,
    hasLand: false,
    stationBuilt: false,
    lastStationAt: now,
    lastEnergyAt: now,
    unlockedPlots: START_PLOTS,
    plots: Array.from({ length: MAX_PLOTS }, blankPlot),
    inventory: emptyInventory(),
    processing: null,
    treasury: 0,
    stats: blankStats(),
    claimed: {},
    log: ["Desa Kebun Robin menunggu petani baru."],
  };
}

function pushLog(log: string[], line: string) {
  return [line, ...log].slice(0, 6);
}

function withXp(state: Persisted, amount: number) {
  let xp = state.xp + amount;
  let level = state.level;
  let maxEnergy = state.maxEnergy;
  let energy = state.energy;
  let note = "";
  while (xp >= level * 40 && level < 20) {
    xp -= level * 40;
    level += 1;
    maxEnergy = Math.min(MAX_ENERGY_CAP, maxEnergy + 4);
    energy = Math.min(maxEnergy, energy + 12);
    note = ` Naik ke level ${level}.`;
  }
  return { xp, level, maxEnergy, energy, note };
}

export function plotReady(plot: PlotState, rank: number, now: number) {
  if (!plot.crop || plot.plantedAt == null) return false;
  const crop = CROP_BY_ID[plot.crop];
  return now - plot.plantedAt >= growthMs(crop.growMs, plot.fertilized, rank);
}

export function plotFraction(plot: PlotState, rank: number, now: number) {
  if (!plot.crop || plot.plantedAt == null) return 0;
  const crop = CROP_BY_ID[plot.crop];
  const total = growthMs(crop.growMs, plot.fertilized, rank);
  return Math.max(0, Math.min(1, (now - plot.plantedAt) / total));
}

export function growthLeft(plot: PlotState, rank: number, now: number) {
  if (!plot.crop || plot.plantedAt == null) return 0;
  const crop = CROP_BY_ID[plot.crop];
  const total = growthMs(crop.growMs, plot.fertilized, rank);
  return Math.max(0, plot.plantedAt + total - now);
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialPersisted(),

      connect: () => {
        const current = get();
        if (current.address) return ok("Dompet sandbox sudah terhubung.");
        const address = makeAddress();
        set({ address });
        return ok("Dompet sandbox terhubung. Ini belum transaksi on-chain.");
      },

      mint: (characterId, rawName) => {
        const state = get();
        if (!state.address) return fail("Hubungkan dompet dulu.");
        if (state.characterId) return fail("Kamu sudah punya karakter.");
        if (characterId < 1 || characterId > CHARACTER_COUNT) return fail("Karakter tidak ada.");
        const name = rawName.trim().replace(/\s+/g, " ");
        if (name.length < 2 || name.length > 14) return fail("Nama 2–14 huruf.");
        const now = Date.now();
        set({
          characterId,
          name,
          lastEnergyAt: now,
          lastStationAt: now,
          log: pushLog(state.log, `${name} tiba di desa.`),
        });
        return ok(`${name} jadi avatar kebunmu.`);
      },

      plant: (index, cropId) => {
        const state = get();
        if (!state.characterId) return fail("Pilih karakter dulu.");
        if (index < 0 || index >= state.unlockedPlots) return fail("Petak ini masih terkunci.");
        const plot = state.plots[index];
        if (!plot || plot.crop) return fail("Petak ini sudah tertanam.");
        const crop = CROP_BY_ID[cropId];
        if ((state.inventory[crop.seed] ?? 0) < 1) return fail(`Benih ${crop.name.toLowerCase()} habis.`);
        if (state.energy < crop.plantEnergy) return fail("Energi kurang. Makan dulu.");
        const plots = state.plots.slice();
        plots[index] = { crop: cropId, plantedAt: Date.now(), fertilized: false };
        const inventory = { ...state.inventory, [crop.seed]: state.inventory[crop.seed] - 1 };
        set({
          plots,
          inventory,
          energy: state.energy - crop.plantEnergy,
          stats: { ...state.stats, planted: state.stats.planted + 1 },
          log: pushLog(state.log, `Menanam ${crop.name.toLowerCase()}.`),
        });
        return ok(`${crop.name} ditanam. Energi −${crop.plantEnergy}.`);
      },

      harvest: (index, now) => {
        const state = get();
        const plot = state.plots[index];
        if (!plot?.crop || !plotReady(plot, state.rank, now)) return fail("Belum siap panen.");
        const crop = CROP_BY_ID[plot.crop];
        if (state.energy < crop.harvestEnergy) return fail("Energi kurang untuk panen.");
        const amount = harvestYield(crop.baseYield, state.rank);
        const plots = state.plots.slice();
        plots[index] = blankPlot();
        const gained = withXp(state, 10);
        set({
          plots,
          inventory: { ...state.inventory, [crop.crop]: state.inventory[crop.crop] + amount },
          energy: Math.max(0, gained.energy - crop.harvestEnergy),
          xp: gained.xp,
          level: gained.level,
          maxEnergy: gained.maxEnergy,
          stats: { ...state.stats, harvested: state.stats.harvested + 1 },
          log: pushLog(state.log, `Panen ${amount} ${crop.name.toLowerCase()}.`),
        });
        return ok(`Panen ${amount} ${crop.name.toLowerCase()}.${gained.note}`);
      },

      fertilize: (index) => {
        const state = get();
        const plot = state.plots[index];
        if (!plot?.crop) return fail("Tidak ada tanaman di petak ini.");
        if (plot.fertilized) return fail("Petak ini sudah dipupuk.");
        if (plotReady(plot, state.rank, Date.now())) return fail("Sudah siap panen.");
        if (state.inventory.fertilizer < 1) return fail("Pupuk habis.");
        const plots = state.plots.slice();
        plots[index] = { ...plot, fertilized: true };
        set({
          plots,
          inventory: { ...state.inventory, fertilizer: state.inventory.fertilizer - 1 },
          log: pushLog(state.log, "Pupuk mempercepat tanaman."),
        });
        return ok("Waktu tumbuh dipersingkat.");
      },

      eat: (itemId) => {
        const state = get();
        const gain = FOOD[itemId];
        if (!gain) return fail("Ini bukan makanan.");
        if ((state.inventory[itemId] ?? 0) < 1) return fail(`${ITEMS[itemId].name} habis.`);
        if (state.energy >= state.maxEnergy) return fail("Energi sudah penuh.");
        const energy = Math.min(state.maxEnergy, state.energy + gain);
        set({
          energy,
          inventory: { ...state.inventory, [itemId]: state.inventory[itemId] - 1 },
          stats: { ...state.stats, eaten: state.stats.eaten + 1 },
          log: pushLog(state.log, `Makan ${ITEMS[itemId].name.toLowerCase()}.`),
        });
        return ok(`Energi +${energy - state.energy}.`);
      },

      buy: (itemId, qty) => {
        const state = get();
        const item = ITEMS[itemId];
        if (!item.buyPrice || qty < 1) return fail("Barang ini tidak dijual.");
        const cost = item.buyPrice * qty;
        if (state.coins < cost) return fail("Leaf tidak cukup.");
        set({
          coins: state.coins - cost,
          inventory: { ...state.inventory, [itemId]: state.inventory[itemId] + qty },
          log: pushLog(state.log, `Membeli ${qty} ${item.name.toLowerCase()}.`),
        });
        return ok(`Beli ${qty} ${item.name.toLowerCase()} seharga ${cost} Leaf.`);
      },

      sell: (itemId, qty) => {
        const state = get();
        const item = ITEMS[itemId];
        if (!item.sellPrice || qty < 1) return fail("Barang ini tidak dibeli pasar.");
        if ((state.inventory[itemId] ?? 0) < qty) return fail(`${item.name} tidak cukup.`);
        const gross = item.sellPrice * qty;
        const fee = Math.floor(gross * MARKET_FEE);
        set({
          coins: state.coins + gross - fee,
          treasury: state.treasury + fee,
          inventory: { ...state.inventory, [itemId]: state.inventory[itemId] - qty },
          stats: { ...state.stats, sold: state.stats.sold + 1 },
          log: pushLog(state.log, `Menjual ${qty} ${item.name.toLowerCase()}.`),
        });
        const feeNote = fee > 0 ? ` Fee desa ${fee}.` : "";
        return ok(`Terima ${gross - fee} Leaf.${feeNote}`);
      },

      startProcess: (recipeId, now) => {
        const state = get();
        const recipe = RECIPE_BY_ID[recipeId];
        if (!recipe) return fail("Resep tidak ada.");
        if (state.processing) return fail("Masih ada olahan yang berjalan.");
        if (state.energy < recipe.energy) return fail("Energi kurang untuk mengolah.");
        for (const [itemId, need] of Object.entries(recipe.inputs) as [ItemId, number][]) {
          if ((state.inventory[itemId] ?? 0) < need) {
            return fail(`Butuh ${need} ${ITEMS[itemId].name.toLowerCase()}.`);
          }
        }
        const inventory = { ...state.inventory };
        for (const [itemId, need] of Object.entries(recipe.inputs) as [ItemId, number][]) {
          inventory[itemId] -= need;
        }
        set({
          inventory,
          energy: state.energy - recipe.energy,
          processing: { recipeId, readyAt: now + recipe.ms },
          log: pushLog(state.log, `${recipe.name} dimulai.`),
        });
        return ok(`${recipe.name} berjalan.`);
      },

      claimProcess: (now) => {
        const state = get();
        const job = state.processing;
        if (!job) return fail("Tidak ada olahan.");
        if (now < job.readyAt) return fail("Masih diproses.");
        const recipe = RECIPE_BY_ID[job.recipeId];
        if (!recipe) return fail("Resep hilang.");
        const gained = withXp(state, 8);
        set({
          processing: null,
          inventory: {
            ...state.inventory,
            [recipe.output]: state.inventory[recipe.output] + recipe.qty,
          },
          xp: gained.xp,
          level: gained.level,
          maxEnergy: gained.maxEnergy,
          energy: gained.energy,
          stats: { ...state.stats, processed: state.stats.processed + 1 },
          log: pushLog(state.log, `${ITEMS[recipe.output].name} selesai.`),
        });
        return ok(`${recipe.qty} ${ITEMS[recipe.output].name.toLowerCase()} masuk tas.${gained.note}`);
      },

      claimLand: () => {
        const state = get();
        if (state.hasLand) return fail("Kamu sudah punya tanah.");
        if (state.coins < LAND_COST) return fail(`Butuh ${LAND_COST} Leaf untuk klaim tanah.`);
        set({
          coins: state.coins - LAND_COST,
          hasLand: true,
          unlockedPlots: Math.max(state.unlockedPlots, LAND_PLOTS),
          stats: { ...state.stats, land: 1 },
          log: pushLog(state.log, "Tanah produktif diklaim."),
        });
        return ok(`Tanah jadi milikmu. Petak terbuka: ${Math.max(state.unlockedPlots, LAND_PLOTS)}.`);
      },

      buildStation: (now) => {
        const state = get();
        if (!state.hasLand) return fail("Klaim tanah dulu.");
        if (state.stationBuilt) return fail("Stasiun pupuk sudah berdiri.");
        if (state.coins < STATION_COST) return fail(`Butuh ${STATION_COST} Leaf.`);
        set({
          coins: state.coins - STATION_COST,
          stationBuilt: true,
          lastStationAt: now,
          log: pushLog(state.log, "Stasiun pupuk selesai dibangun."),
        });
        return ok("Stasiun mulai menghasilkan pupuk.");
      },

      upgradeRank: () => {
        const state = get();
        if (state.rank >= 5) return fail("Karakter sudah di puncak.");
        const cost = upgradeCost(state.rank);
        if (state.coins < cost) return fail(`Butuh ${cost} Leaf.`);
        const maxEnergy = Math.min(MAX_ENERGY_CAP, state.maxEnergy + 8);
        set({
          coins: state.coins - cost,
          rank: state.rank + 1,
          maxEnergy,
          energy: Math.min(maxEnergy, state.energy + 8),
          log: pushLog(state.log, `Karakter naik ke rank ${state.rank + 1}.`),
        });
        return ok(`Rank ${state.rank + 1}. Panen lebih cepat, energi maksimum naik.`);
      },

      upgradePlots: () => {
        const state = get();
        if (!state.hasLand) return fail("Klaim tanah dulu.");
        if (state.unlockedPlots >= MAX_PLOTS) return fail("Semua petak sudah terbuka.");
        if (state.coins < PLOT_UPGRADE_COST) return fail(`Butuh ${PLOT_UPGRADE_COST} Leaf.`);
        const unlockedPlots = Math.min(MAX_PLOTS, state.unlockedPlots + 3);
        set({
          coins: state.coins - PLOT_UPGRADE_COST,
          unlockedPlots,
          log: pushLog(state.log, `Petak bertambah jadi ${unlockedPlots}.`),
        });
        return ok(`Sekarang ada ${unlockedPlots} petak.`);
      },

      claimQuest: (questId) => {
        const state = get();
        const quest = QUESTS.find((item) => item.id === questId);
        if (!quest) return fail("Misi tidak ada.");
        if (state.claimed[quest.id]) return fail("Hadiah ini sudah diambil.");
        if (state.stats[quest.stat] < 1) return fail("Misi belum selesai.");
        set({
          coins: state.coins + quest.reward,
          claimed: { ...state.claimed, [quest.id]: true },
          log: pushLog(state.log, `Hadiah misi: ${quest.reward} Leaf.`),
        });
        return ok(`+${quest.reward} Leaf dari papan bantuan.`);
      },

      applySave: (saved) => {
        const state = get();
        set({
          ...saved,
          inventory: { ...emptyInventory(), ...(saved.inventory ?? {}) },
          plots: saved.plots?.length === MAX_PLOTS ? saved.plots : state.plots,
          stats: { ...blankStats(), ...(saved.stats ?? {}) },
          claimed: saved.claimed ?? {},
          log: saved.log?.length ? saved.log : state.log,
        });
      },

      passiveTick: (now) => {
        const state = get();
        if (!state.characterId) return;
        let energy = state.energy;
        let lastEnergyAt = state.lastEnergyAt;
        let fertilizer = state.inventory.fertilizer;
        let lastStationAt = state.lastStationAt;
        let changed = false;

        if (energy < state.maxEnergy) {
          const steps = Math.floor((now - lastEnergyAt) / ENERGY_REGEN_MS);
          if (steps > 0) {
            energy = Math.min(state.maxEnergy, energy + steps);
            lastEnergyAt += steps * ENERGY_REGEN_MS;
            changed = true;
          }
        } else if (now - lastEnergyAt > ENERGY_REGEN_MS) {
          lastEnergyAt = now;
          changed = true;
        }

        if (state.stationBuilt && fertilizer < FERTILIZER_CAP) {
          const steps = Math.floor((now - lastStationAt) / FERTILIZER_MS);
          if (steps > 0) {
            const add = Math.min(FERTILIZER_CAP - fertilizer, steps);
            fertilizer += add;
            lastStationAt += steps * FERTILIZER_MS;
            changed = true;
          }
        } else if (state.stationBuilt && now - lastStationAt > FERTILIZER_MS) {
          lastStationAt = now;
          changed = true;
        }

        if (!changed) return;
        set({
          energy,
          lastEnergyAt,
          lastStationAt,
          inventory:
            fertilizer === state.inventory.fertilizer
              ? state.inventory
              : { ...state.inventory, fertilizer },
        });
      },

      reset: () => {
        set({ ...initialPersisted() });
      },
    }),
    {
      name: "kebun-robin-v1",
      skipHydration: true,
      partialize: (state) => ({
        address: state.address,
        characterId: state.characterId,
        name: state.name,
        level: state.level,
        xp: state.xp,
        energy: state.energy,
        maxEnergy: state.maxEnergy,
        coins: state.coins,
        rank: state.rank,
        hasLand: state.hasLand,
        stationBuilt: state.stationBuilt,
        lastStationAt: state.lastStationAt,
        lastEnergyAt: state.lastEnergyAt,
        unlockedPlots: state.unlockedPlots,
        plots: state.plots,
        inventory: state.inventory,
        processing: state.processing,
        treasury: state.treasury,
        stats: state.stats,
        claimed: state.claimed,
        log: state.log,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<Persisted>;
        const base = initialPersisted();
        return {
          ...current,
          ...base,
          ...saved,
          inventory: { ...emptyInventory(), ...(saved.inventory ?? {}) },
          plots:
            saved.plots && saved.plots.length === MAX_PLOTS
              ? saved.plots
              : base.plots,
          stats: { ...blankStats(), ...(saved.stats ?? {}) },
          claimed: saved.claimed ?? {},
          log: saved.log?.length ? saved.log : base.log,
        };
      },
    },
  ),
);
