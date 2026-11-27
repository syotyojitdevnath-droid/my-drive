import { BRAND_DEFAULTS, type BrandFields } from "@/stores/brandStore";
import { BRAND_TOKENS } from "./brandTokens";

type Role = "primary" | "bgLight" | "bgDark" | "textLight" | "textDark";

/**
 * The UI uses many hard-coded Tailwind colors (e.g. `bg-[#0B57D0]`).
 * Each of those colors is mapped to a role; the CSS expression is derived
 * from the user's chosen color so one picker re-themes every shade.
 */
const COLOR_MAP: Record<string, { role: Role; css: string }> = {
  // primary / accent
  "0B57D0": { role: "primary", css: "var(--td-primary)" },
  "1A73E8": { role: "primary", css: "var(--td-primary)" },
  "0842A0": { role: "primary", css: "color-mix(in srgb, var(--td-primary) 80%, black)" },
  "1558B0": { role: "primary", css: "color-mix(in srgb, var(--td-primary) 80%, black)" },
  "8AB4F8": { role: "primary", css: "color-mix(in srgb, var(--td-primary) 55%, white)" },
  A8C7FA: { role: "primary", css: "color-mix(in srgb, var(--td-primary) 55%, white)" },
  C2E7FF: { role: "primary", css: "color-mix(in srgb, var(--td-primary) 16%, white)" },
  D3E3FD: { role: "primary", css: "color-mix(in srgb, var(--td-primary) 16%, white)" },
  E8F0FE: { role: "primary", css: "color-mix(in srgb, var(--td-primary) 10%, white)" },
  EDF2FC: { role: "primary", css: "color-mix(in srgb, var(--td-primary) 10%, white)" },
  "063177": { role: "primary", css: "color-mix(in srgb, var(--td-primary) 60%, black)" },
  "004A77": { role: "primary", css: "color-mix(in srgb, var(--td-primary) 45%, black)" },
  "001D35": { role: "primary", css: "color-mix(in srgb, var(--td-primary) 30%, black)" },
  // light background
  F8FAFD: { role: "bgLight", css: "var(--td-bg-light)" },
  F0F4F9: { role: "bgLight", css: "color-mix(in srgb, var(--td-bg-light) 95%, black)" },
  // dark background
  "000000": { role: "bgDark", css: "var(--td-bg-dark)" },
  "0A0A0A": { role: "bgDark", css: "color-mix(in srgb, var(--td-bg-dark) 96%, white)" },
  "060709": { role: "bgDark", css: "color-mix(in srgb, var(--td-bg-dark) 98%, white)" },
  "0C0D0F": { role: "bgDark", css: "color-mix(in srgb, var(--td-bg-dark) 95%, white)" },
  "0E1015": { role: "bgDark", css: "color-mix(in srgb, var(--td-bg-dark) 94%, white)" },
  "111214": { role: "bgDark", css: "color-mix(in srgb, var(--td-bg-dark) 93%, white)" },
  "141518": { role: "bgDark", css: "color-mix(in srgb, var(--td-bg-dark) 92%, white)" },
  "161719": { role: "bgDark", css: "color-mix(in srgb, var(--td-bg-dark) 91%, white)" },
  "1F2124": { role: "bgDark", css: "color-mix(in srgb, var(--td-bg-dark) 88%, white)" },
  // light text
  "1F1F1F": { role: "textLight", css: "var(--td-text-light)" },
  "444746": { role: "textLight", css: "color-mix(in srgb, var(--td-text-light) 80%, white)" },
  "747775": { role: "textLight", css: "color-mix(in srgb, var(--td-text-light) 60%, white)" },
  "5F6368": { role: "textLight", css: "color-mix(in srgb, var(--td-text-light) 65%, white)" },
  // dark text
  E3E3E3: { role: "textDark", css: "var(--td-text-dark)" },
  C4C7C5: { role: "textDark", css: "color-mix(in srgb, var(--td-text-dark) 85%, black)" },
  "8E918F": { role: "textDark", css: "color-mix(in srgb, var(--td-text-dark) 65%, black)" },
  "9AA0A6": { role: "textDark", css: "color-mix(in srgb, var(--td-text-dark) 68%, black)" },
};

const UTIL_PROP: Record<string, string> = {
  bg: "background-color",
  text: "color",
  border: "border-color",
  ring: "--tw-ring-color",
  from: "--tw-gradient-from",
  via: "--tw-gradient-via",
  to: "--tw-gradient-to",
  accent: "accent-color",
};

const STATES = new Set(["hover", "focus", "focus-visible", "active"]);

const ROLE_FIELD: Record<Role, keyof BrandFields> = {
  primary: "primaryColor",
  bgLight: "bgLight",
  bgDark: "bgDark",
  textLight: "textLight",
  textDark: "textDark",
};

function isChanged(role: Role, s: BrandFields): boolean {
  const key = ROLE_FIELD[role];
  return String(s[key]).toLowerCase() !== String(BRAND_DEFAULTS[key]).toLowerCase();
}

/** Black or white, whichever reads better on top of the given hex color. */
function readableOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#111111" : "#ffffff";
}

export function buildBrandingCss(s: BrandFields): string {
  const changed = (Object.keys(ROLE_FIELD) as Role[]).filter((r) => isChanged(r, s));
  if (changed.length === 0) return "";

  const out: string[] = [];
  out.push(
    `:root{--td-primary:${s.primaryColor};--td-bg-light:${s.bgLight};--td-bg-dark:${s.bgDark};` +
      `--td-text-light:${s.textLight};--td-text-dark:${s.textDark};}`
  );

  // Design tokens used by the shadcn-style components.
  if (changed.includes("primary")) {
    const fg = readableOn(s.primaryColor);
    const v = `--primary:${s.primaryColor};--primary-foreground:${fg};--ring:${s.primaryColor};` +
      `--sidebar-primary:${s.primaryColor};--sidebar-primary-foreground:${fg};--sidebar-ring:${s.primaryColor};`;
    out.push(`:root{${v}}html.dark{${v}}`);
  }
  if (changed.includes("bgLight")) out.push(`:root{--background:${s.bgLight};}`);
  if (changed.includes("bgDark")) out.push(`html.dark{--background:${s.bgDark};}`);
  if (changed.includes("textLight")) out.push(`:root{--foreground:${s.textLight};}`);
  if (changed.includes("textDark")) out.push(`html.dark{--foreground:${s.textDark};}`);

  const base: string[] = [];
  const stateful: string[] = [];
  const dark: string[] = [];
  const darkStateful: string[] = [];
  const primaryFallbackDark: string[] = [];

  for (const [raw, variants, util, hex, opacity] of BRAND_TOKENS) {
    const mapped = COLOR_MAP[hex];
    const prop = UTIL_PROP[util];
    if (!mapped || !prop || !changed.includes(mapped.role)) continue;

    const parts = variants ? variants.split(":") : [];
    if (!parts.every((p) => p === "dark" || STATES.has(p))) continue;
    const isDark = parts.includes("dark");
    // Dark-mode palette roles only apply to dark: variants (plain black elements stay black in light mode).
    if (!isDark && (mapped.role === "bgDark" || mapped.role === "textDark")) continue;
    const pseudo = parts
      .filter((p) => STATES.has(p))
      .map((p) => `:${p}`)
      .join("");

    const value = opacity
      ? `color-mix(in srgb, ${mapped.css} ${opacity}%, transparent)`
      : mapped.css;
    const decl = `{${prop}:${value}}`;
    const attr = `[class~="${raw}"]`;

    if (isDark) {
      (pseudo ? darkStateful : dark).push(`html.dark ${attr}${pseudo}${decl}`);
    } else {
      (pseudo ? stateful : base).push(`html:not(.dark) ${attr}${pseudo}${decl}`);
      // Primary accents without a dark variant should still follow the new color in dark mode.
      if (!pseudo && mapped.role === "primary") {
        primaryFallbackDark.push(`html.dark ${attr}:not([class*="dark:"])${decl}`);
      }
    }
  }

  // Order matters: equal specificity is resolved by source order.
  return [...out, ...base, ...stateful, ...primaryFallbackDark, ...dark, ...darkStateful].join("\n");
}
