import { ITEMS, MARKET_FEE, SHOP_IDS, VENDORS, type ItemId } from "../game/content";
import { useGame } from "../game/store";
import { notify } from "./feedback";
import { Sprite } from "./Sprite";

const SELLABLE = (Object.keys(ITEMS) as ItemId[]).filter((id) => ITEMS[id].sellPrice);

export function Market() {
  const coins = useGame((state) => state.coins);
  const inventory = useGame((state) => state.inventory);
  const treasury = useGame((state) => state.treasury);
  const buy = useGame((state) => state.buy);
  const sell = useGame((state) => state.sell);

  return (
    <div className="grid gap-4">
      <section className="map-stage">
        <img src="/art/town.jpg" alt="Pasar desa" className="map-art max-h-56 object-cover" />
      </section>
      <div className="grid gap-3 sm:grid-cols-4">
        {VENDORS.map((vendor) => (
          <article key={vendor.id} className="wood-frame flex items-center gap-2 p-2">
            <Sprite id={vendor.id} className="h-16 w-14 rounded-lg" alt="" />
            <span>
              <span className="block text-sm font-extrabold">{vendor.name}</span>
              <span className="text-xs text-[#6d5642]">{vendor.stall}</span>
            </span>
          </article>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="wood-frame p-4">
          <h2 className="screen-title text-3xl">Beli</h2>
          <p className="mt-1 text-sm text-[#5c4632]">Leaf di tas: {coins}</p>
          <ul className="mt-3 grid gap-2">
            {SHOP_IDS.map((id) => {
              const item = ITEMS[id];
              return (
                <li key={id} className="item-chip justify-between">
                  <span>
                    <span className="block text-sm font-extrabold">{item.name}</span>
                    <span className="text-xs text-[#6d5642]">
                      {item.blurb} · punya {inventory[id]}
                    </span>
                  </span>
                  <span className="flex gap-1">
                    <button type="button" className="btn btn-gold" onClick={() => notify(buy(id, 1))}>
                      {item.buyPrice}
                    </button>
                    <button type="button" className="btn" onClick={() => notify(buy(id, 5))}>
                      x5
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="wood-frame p-4">
          <h2 className="screen-title text-3xl">Jual</h2>
          <p className="mt-1 text-sm text-[#5c4632]">
            Fee desa {Math.round(MARKET_FEE * 100)}%. Kas desa terkumpul {treasury} Leaf.
          </p>
          <ul className="mt-3 grid gap-2">
            {SELLABLE.filter((id) => inventory[id] > 0).map((id) => {
              const item = ITEMS[id];
              return (
                <li key={id} className="item-chip justify-between">
                  <span>
                    <span className="block text-sm font-extrabold">
                      {item.name} · {inventory[id]}
                    </span>
                    <span className="text-xs text-[#6d5642]">{item.sellPrice} Leaf / buah</span>
                  </span>
                  <span className="flex gap-1">
                    <button type="button" className="btn btn-leaf" onClick={() => notify(sell(id, 1))}>
                      Jual 1
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => notify(sell(id, inventory[id]))}
                    >
                      Semua
                    </button>
                  </span>
                </li>
              );
            })}
            {SELLABLE.every((id) => inventory[id] === 0) ? (
              <li className="text-sm text-[#6d5642]">Belum ada barang untuk dijual.</li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
