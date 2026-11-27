import { useEffect, useRef } from "react";
import i18n from "i18next";
import { useBrandStore } from "@/stores/brandStore";
import { buildBrandingCss } from "@/lib/branding/brandCss";

const STYLE_ID = "app-branding-style";

/** Applies the user's custom colors and app name. Mount once in <App />. */
export function useBranding() {
  const appName = useBrandStore((s) => s.appName);
  const tagline = useBrandStore((s) => s.tagline);
  const summary = useBrandStore((s) => s.summary);
  const primaryColor = useBrandStore((s) => s.primaryColor);
  const bgLight = useBrandStore((s) => s.bgLight);
  const bgDark = useBrandStore((s) => s.bgDark);
  const textLight = useBrandStore((s) => s.textLight);
  const textDark = useBrandStore((s) => s.textDark);
  const lastName = useRef<string | null>(null);

  useEffect(() => {
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = buildBrandingCss({
      appName, tagline, summary, primaryColor, bgLight, bgDark, textLight, textDark,
    });
  }, [appName, tagline, summary, primaryColor, bgLight, bgDark, textLight, textDark]);

  useEffect(() => {
    document.title = appName || "TeleDrive";
    // Re-render translated text so the new name shows up everywhere.
    if (lastName.current !== null && lastName.current !== appName) {
      void i18n.changeLanguage(i18n.language);
    }
    lastName.current = appName;
  }, [appName]);
}
