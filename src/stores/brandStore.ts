import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Original look & feel. Values equal to these produce no CSS overrides. */
export const BRAND_DEFAULTS = {
  appName: "TeleDrive",
  tagline: "Virtual cloud storage client backed by Telegram",
  /** Empty string = use the built-in (translated) About text. */
  summary: "",
  primaryColor: "#0B57D0",
  bgLight: "#F8FAFD",
  bgDark: "#000000",
  textLight: "#1F1F1F",
  textDark: "#E3E3E3",
};

export type BrandFields = typeof BRAND_DEFAULTS;
export type BrandKey = keyof BrandFields;

interface BrandState extends BrandFields {
  setField: <K extends BrandKey>(key: K, value: BrandFields[K]) => void;
  resetField: (key: BrandKey) => void;
  resetAll: () => void;
}

export const useBrandStore = create<BrandState>()(
  persist(
    (set) => ({
      ...BRAND_DEFAULTS,
      setField: (key, value) => set({ [key]: value } as Partial<BrandFields>),
      resetField: (key) => set({ [key]: BRAND_DEFAULTS[key] } as Partial<BrandFields>),
      resetAll: () => set({ ...BRAND_DEFAULTS }),
    }),
    { name: "app-branding-storage" }
  )
);
