import { FOOD, ITEMS, type ItemId } from "../game/content";
import { useGame } from "../game/store";
import { notify } from "./feedback";

export function Bag() {
  const inventory = useGame((state) => state.inventory);
  const eat = useGame((state) => state.eat);
  const owned = (Object.keys(ITEMS) as ItemId[]).filter((id) => inventory[id] > 0);

  return (
    <section className="wood-frame p-4 md:p-6">
      <h2 className="screen-title text-4xl">Tas</h2>
      <p className="mt-1 text-sm text-[#5c4632]">Benih, hasil panen, olahan, dan makanan.</p>
      {owned.length === 0 ? (
        <p className="mt-4 text-sm font-extrabold">Tas kosong.</p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {owned.map((id) => {
            const item = ITEMS[id];
            const food = FOOD[id];
            return (
              <li key={id} className="item-chip justify-between">
                <span>
                  <span className="block text-sm font-extrabold">
                    {item.name} × {inventory[id]}
                  </span>
                  <span className="text-xs text-[#6d5642]">
                    {item.blurb}
                    {food ? ` · makan +${food} energi` : ""}
                  </span>
                </span>
                {food ? (
                  <button type="button" className="btn btn-leaf" onClick={() => notify(eat(id))}>
                    Makan
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
