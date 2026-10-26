import { LIGHT_CHARACTER_IDS } from "../game/content";
import { cn } from "../lib/cn";

export function Sprite({
  id,
  className,
  bob = false,
  alt = "",
}: {
  id: number;
  className?: string;
  bob?: boolean;
  alt?: string;
}) {
  return (
    <div className={cn("sprite-frame", LIGHT_CHARACTER_IDS.has(id) && "is-light", className)}>
      <img
        src={`/avatars/${id}.png`}
        alt={alt}
        draggable={false}
        className={bob ? "bob" : undefined}
      />
    </div>
  );
}
