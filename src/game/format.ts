export type ActionResult = { ok: true; message: string } | { ok: false; message: string };

export function fail(message: string): ActionResult {
  return { ok: false, message };
}

export function ok(message: string): ActionResult {
  return { ok: true, message };
}

export function stageFromFraction(fraction: number): 1 | 2 | 3 {
  if (fraction < 0.34) return 1;
  if (fraction < 0.78) return 2;
  return 3;
}

export function formatLeft(ms: number) {
  if (ms <= 0) return "Siap";
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds} dtk`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes} mnt` : `${minutes} mnt ${rest} dtk`;
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function makeAddress() {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return `0x${[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function leaf(amount: number) {
  return `${amount} Leaf`;
}
