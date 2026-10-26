"""Crop character sprites and punch out the flat background."""

from pathlib import Path

import numpy as np
from PIL import Image

SRC = Path("image/nnnn")
OUT = Path("public/avatars")


def dilate(mask: np.ndarray, radius: int) -> np.ndarray:
    out = mask.copy()
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            out |= np.roll(np.roll(mask, dy, axis=0), dx, axis=1)
    return out


def flood(removable: np.ndarray) -> np.ndarray:
    reach = np.zeros(removable.shape, dtype=bool)
    reach[0, :] = removable[0, :]
    reach[-1, :] = removable[-1, :]
    reach[:, 0] = removable[:, 0]
    reach[:, -1] = removable[:, -1]
    while True:
        grown = reach.copy()
        grown[1:, :] |= reach[:-1, :]
        grown[:-1, :] |= reach[1:, :]
        grown[:, 1:] |= reach[:, :-1]
        grown[:, :-1] |= reach[:, 1:]
        grown &= removable
        if np.array_equal(grown, reach):
            return reach
        reach = grown


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for index in range(1, 107):
        image = Image.open(SRC / f"{index}.png").convert("RGBA")
        pixels = np.asarray(image)
        red, green, blue = pixels[:, :, 0], pixels[:, :, 1], pixels[:, :, 2]
        black = (red < 18) & (green < 18) & (blue < 18)
        white = (red > 242) & (green > 242) & (blue > 242)
        chroma = ~(black | white)
        if not chroma.any():
            raise SystemExit(f"no character pixels in {index}")
        protected = dilate(chroma, 2)
        removable = (black | white) & ~protected
        gone = flood(removable)
        ys, xs = np.where(~gone & chroma)
        pad = 10
        x0 = max(0, int(xs.min()) - pad)
        y0 = max(0, int(ys.min()) - pad)
        x1 = min(pixels.shape[1], int(xs.max()) + pad + 1)
        y1 = min(pixels.shape[0], int(ys.max()) + pad + 1)
        cropped = pixels[y0:y1, x0:x1].copy()
        alpha = cropped[:, :, 3]
        alpha[gone[y0:y1, x0:x1]] = 0
        cropped[:, :, 3] = alpha
        sprite = Image.fromarray(cropped, "RGBA")
        width = 280
        height = max(1, round(width * sprite.height / sprite.width))
        sprite = sprite.resize((width, height), Image.Resampling.NEAREST)
        sprite.save(OUT / f"{index}.png", optimize=True)
        print(index, sprite.size, flush=True)


if __name__ == "__main__":
    main()
