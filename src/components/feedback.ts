import { toast } from "sonner";
import type { ActionResult } from "../game/format";

export function notify(result: ActionResult) {
  if (result.ok) toast.success(result.message);
  else toast.error(result.message);
}

export type View = "village" | "farm" | "market" | "bag" | "hero";
