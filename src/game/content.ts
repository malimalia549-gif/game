export const CHARACTER_COUNT = 106;

export const LIGHT_CHARACTER_IDS = new Set([1, 2, 3, 4, 5, 6]);

export type CropId = "wheat" | "tomato" | "carrot" | "corn";

export type ItemId =
  | "seed_wheat"
  | "seed_tomato"
  | "seed_carrot"
  | "seed_corn"
  | "wheat"
  | "tomato"
  | "carrot"
  | "corn"
  | "flour"
  | "sauce"
  | "juice"
  | "meal"
  | "bread"
  | "fertilizer";

export type CropDef = {
  id: CropId;
  name: string;
  seed: ItemId;
  crop: ItemId;
  growMs: number;
  plantEnergy: number;
  harvestEnergy: number;
  seedPrice: number;
  sellPrice: number;
  baseYield: number;
  blurb: string;
};

export const CROPS: CropDef[] = [
  {
    id: "wheat",
    name: "Gandum",
    seed: "seed_wheat",
    crop: "wheat",
    growMs: 20_000,
    plantEnergy: 5,
    harvestEnergy: 7,
    seedPrice: 8,
    sellPrice: 12,
    baseYield: 2,
    blurb: "Cepat tumbuh. Bahan tepung dan roti.",
  },
  {
    id: "carrot",
    name: "Wortel",
    seed: "seed_carrot",
    crop: "carrot",
    growMs: 28_000,
    plantEnergy: 5,
    harvestEnergy: 7,
    seedPrice: 10,
    sellPrice: 16,
    baseYield: 2,
    blurb: "Bisa dimakan mentah atau diperas jadi jus.",
  },
  {
    id: "tomato",
    name: "Tomat",
    seed: "seed_tomato",
    crop: "tomato",
    growMs: 36_000,
    plantEnergy: 6,
    harvestEnergy: 8,
    seedPrice: 14,
    sellPrice: 22,
    baseYield: 2,
    blurb: "Lebih lama, laku lebih mahal. Jadi saus.",
  },
  {
    id: "corn",
    name: "Jagung",
    seed: "seed_corn",
    crop: "corn",
    growMs: 48_000,
    plantEnergy: 7,
    harvestEnergy: 9,
    seedPrice: 18,
    sellPrice: 28,
    baseYield: 2,
    blurb: "Paling lama. Olahan jagung paling menguntungkan.",
  },
];

export const CROP_BY_ID: Record<CropId, CropDef> = Object.fromEntries(
  CROPS.map((crop) => [crop.id, crop]),
) as Record<CropId, CropDef>;

export const CROP_BY_SEED: Partial<Record<ItemId, CropDef>> = Object.fromEntries(
  CROPS.map((crop) => [crop.seed, crop]),
);

export type ItemDef = {
  id: ItemId;
  name: string;
  sellPrice: number | null;
  buyPrice: number | null;
  blurb: string;
};

export const ITEMS: Record<ItemId, ItemDef> = {
  seed_wheat: {
    id: "seed_wheat",
    name: "Benih gandum",
    sellPrice: 4,
    buyPrice: 8,
    blurb: "Tanam di petak kosong.",
  },
  seed_tomato: {
    id: "seed_tomato",
    name: "Benih tomat",
    sellPrice: 7,
    buyPrice: 14,
    blurb: "Tanam di petak kosong.",
  },
  seed_carrot: {
    id: "seed_carrot",
    name: "Benih wortel",
    sellPrice: 5,
    buyPrice: 10,
    blurb: "Tanam di petak kosong.",
  },
  seed_corn: {
    id: "seed_corn",
    name: "Benih jagung",
    sellPrice: 9,
    buyPrice: 18,
    blurb: "Tanam di petak kosong.",
  },
  wheat: { id: "wheat", name: "Gandum", sellPrice: 12, buyPrice: null, blurb: "Hasil panen." },
  tomato: { id: "tomato", name: "Tomat", sellPrice: 22, buyPrice: null, blurb: "Hasil panen." },
  carrot: { id: "carrot", name: "Wortel", sellPrice: 16, buyPrice: null, blurb: "Hasil panen." },
  corn: { id: "corn", name: "Jagung", sellPrice: 28, buyPrice: null, blurb: "Hasil panen." },
  flour: { id: "flour", name: "Tepung", sellPrice: 32, buyPrice: null, blurb: "2 gandum digiling." },
  sauce: { id: "sauce", name: "Saus tomat", sellPrice: 54, buyPrice: null, blurb: "2 tomat dimasak." },
  juice: { id: "juice", name: "Jus wortel", sellPrice: 40, buyPrice: null, blurb: "2 wortel diperas." },
  meal: { id: "meal", name: "Olahan jagung", sellPrice: 68, buyPrice: null, blurb: "2 jagung diolah." },
  bread: {
    id: "bread",
    name: "Roti",
    sellPrice: 14,
    buyPrice: 18,
    blurb: "Makanan. Mengisi banyak energi.",
  },
  fertilizer: {
    id: "fertilizer",
    name: "Pupuk",
    sellPrice: 20,
    buyPrice: 26,
    blurb: "Mempercepat sisa waktu tumbuh.",
  },
};

export const SHOP_IDS: ItemId[] = [
  "seed_wheat",
  "seed_carrot",
  "seed_tomato",
  "seed_corn",
  "bread",
  "fertilizer",
];

export const FOOD: Partial<Record<ItemId, number>> = {
  bread: 46,
  juice: 24,
  meal: 18,
  tomato: 12,
  carrot: 10,
  corn: 8,
  wheat: 4,
  sauce: 6,
};

export type Recipe = {
  id: string;
  name: string;
  inputs: Partial<Record<ItemId, number>>;
  output: ItemId;
  qty: number;
  ms: number;
  energy: number;
};

export const RECIPES: Recipe[] = [
  {
    id: "flour",
    name: "Giling tepung",
    inputs: { wheat: 2 },
    output: "flour",
    qty: 1,
    ms: 12_000,
    energy: 6,
  },
  {
    id: "sauce",
    name: "Masak saus",
    inputs: { tomato: 2 },
    output: "sauce",
    qty: 1,
    ms: 14_000,
    energy: 8,
  },
  {
    id: "juice",
    name: "Peras jus",
    inputs: { carrot: 2 },
    output: "juice",
    qty: 1,
    ms: 10_000,
    energy: 5,
  },
  {
    id: "meal",
    name: "Olah jagung",
    inputs: { corn: 2 },
    output: "meal",
    qty: 1,
    ms: 16_000,
    energy: 8,
  },
  {
    id: "bread",
    name: "Panggang roti",
    inputs: { flour: 1 },
    output: "bread",
    qty: 1,
    ms: 8_000,
    energy: 4,
  },
];

export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(
  RECIPES.map((recipe) => [recipe.id, recipe]),
);

export type Quest = {
  id: string;
  stat: "planted" | "harvested" | "eaten" | "sold" | "processed" | "land";
  reward: number;
  title: string;
  detail: string;
};

export const QUESTS: Quest[] = [
  {
    id: "plant",
    stat: "planted",
    reward: 12,
    title: "Tanam benih pertama",
    detail: "Pilih petak kosong di kebunmu.",
  },
  {
    id: "harvest",
    stat: "harvested",
    reward: 18,
    title: "Panen pertama",
    detail: "Tunggu tanaman siap, lalu panen.",
  },
  {
    id: "eat",
    stat: "eaten",
    reward: 10,
    title: "Isi energi",
    detail: "Makan roti atau hasil kebun.",
  },
  {
    id: "sell",
    stat: "sold",
    reward: 14,
    title: "Jual ke pasar",
    detail: "Tukar hasil panen dengan Leaf.",
  },
  {
    id: "process",
    stat: "processed",
    reward: 20,
    title: "Olahan pertama",
    detail: "Giling, masak, peras, atau panggang.",
  },
  {
    id: "land",
    stat: "land",
    reward: 24,
    title: "Punya tanah",
    detail: "Klaim tanah di lembar karakter.",
  },
];

export const VENDORS = [
  { id: 12, name: "Mira", stall: "Benih & roti" },
  { id: 27, name: "Jio", stall: "Hasil kebun" },
  { id: 50, name: "Arun", stall: "Pupuk" },
  { id: 80, name: "Nia", stall: "Olahan" },
];

export const MARKET_FEE = 0.04;
export const LAND_COST = 90;
export const STATION_COST = 60;
export const PLOT_UPGRADE_COST = 80;
export const MAX_PLOTS = 9;
export const START_PLOTS = 4;
export const LAND_PLOTS = 6;
export const FERTILIZER_MS = 45_000;
export const FERTILIZER_CAP = 8;
export const ENERGY_REGEN_MS = 8_000;
export const MAX_ENERGY_CAP = 180;

export function upgradeCost(rank: number) {
  return 40 + rank * 40;
}

export function growthMs(base: number, fertilized: boolean, rank: number) {
  const speed = 1 - Math.min(0.3, rank * 0.06);
  return Math.round(base * (fertilized ? 0.55 : 1) * speed);
}

export function harvestYield(base: number, rank: number) {
  return base + (rank >= 2 ? 1 : 0) + (rank >= 4 ? 1 : 0);
}

export function characterTitle(id: number) {
  const titles = [
    "Penjaga Pagi",
    "Tukang Kebun",
    "Anak Pasar",
    "Petani Bukit",
    "Peracik Saus",
    "Penggiling Tepung",
    "Jaga Ternak",
    "Tukang Pupuk",
  ];
  return titles[id % titles.length];
}

export function emptyInventory(): Record<ItemId, number> {
  return {
    seed_wheat: 3,
    seed_tomato: 1,
    seed_carrot: 1,
    seed_corn: 0,
    wheat: 0,
    tomato: 0,
    carrot: 0,
    corn: 0,
    flour: 0,
    sauce: 0,
    juice: 0,
    meal: 0,
    bread: 1,
    fertilizer: 0,
  };
}
