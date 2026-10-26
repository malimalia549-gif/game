import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CHARACTER_COUNT, characterTitle } from "../game/content";
import { useGame } from "../game/store";
import { notify } from "./feedback";
import { Sprite } from "./Sprite";

const PAGE = 12;

export function Mint() {
  const address = useGame((state) => state.address);
  const connect = useGame((state) => state.connect);
  const mint = useGame((state) => state.mint);
  const [page, setPage] = useState(0);
  const [picked, setPicked] = useState(1);
  const [name, setName] = useState("Robin");
  const pages = Math.ceil(CHARACTER_COUNT / PAGE);
  const ids = useMemo(() => {
    const start = page * PAGE + 1;
    return Array.from({ length: PAGE }, (_, index) => start + index).filter(
      (id) => id <= CHARACTER_COUNT,
    );
  }, [page]);

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:items-start">
      <section className="map-stage">
        <img src="/art/cottage.jpg" alt="Rumah petani" className="map-art" />
      </section>

      <section className="wood-frame p-4 md:p-6">
        <p className="text-xs font-extrabold tracking-[0.16em] text-[#8a5a22] uppercase">
          Kebun Robin
        </p>
        <h1 className="screen-title mt-1 text-4xl md:text-5xl">Pilih avatar kebunmu</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#5c4632]">
          106 karakter pixel dari koleksimu. Dompet di sini sandbox di browser — alurnya sama
          dengan connect lalu mint, tanpa transaksi sungguhan.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-gold"
            onClick={() => notify(connect())}
            disabled={Boolean(address)}
          >
            {address ? "Dompet terhubung" : "Hubungkan dompet"}
          </button>
          <span className="self-center text-xs font-extrabold text-[#7a6248]">
            Robinhood Chain · sandbox lokal
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr]">
          <div className="rounded-2xl border-2 border-[#2a1c12] bg-[#efe2c4] p-3">
            <Sprite id={picked} className="mx-auto h-52 w-full rounded-xl" alt="" />
            <p className="mt-2 text-center text-sm font-extrabold">
              #{picked} · {characterTitle(picked)}
            </p>
          </div>
          <div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {ids.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPicked(id)}
                  className="overflow-hidden rounded-xl border-2 border-[#2a1c12]"
                  style={{ outline: picked === id ? "3px solid #e7a02d" : undefined }}
                  aria-label={`Karakter ${id}`}
                >
                  <Sprite id={id} className="h-20 w-full" />
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                className="btn"
                disabled={page === 0}
                onClick={() => setPage((value) => value - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-extrabold text-[#6b5340]">
                Lembar {page + 1} / {pages}
              </span>
              <button
                type="button"
                className="btn"
                disabled={page >= pages - 1}
                onClick={() => setPage((value) => value + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <form
          className="mt-5 flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            notify(mint(picked, name));
          }}
        >
          <label className="text-sm font-extrabold">
            Nama petani
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={14}
              className="mt-1 block w-48 rounded-xl border-2 border-[#2a1c12] bg-white px-3 py-2"
            />
          </label>
          <button type="submit" className="btn btn-leaf">
            Mint karakter
          </button>
        </form>
      </section>
    </main>
  );
}
