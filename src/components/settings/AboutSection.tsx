import { useState, useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { APP_VERSION } from "@/lib/telegram/config";
import { runtimeGetVersion } from "@/lib/runtime/bridge";
import { useBrandStore } from "@/stores/brandStore";

const DEVELOPER_NAME = "Syotyojit Dev Nath Ovi";

export default function AboutSection() {
  const { t } = useTranslation("settings");
  const [version, setVersion] = useState(APP_VERSION);
  const appName = useBrandStore((s) => s.appName) || "TeleDrive";
  const tagline = useBrandStore((s) => s.tagline);
  const summary = useBrandStore((s) => s.summary);

  useEffect(() => {
    async function fetchVersion() {
      const appVersion = await runtimeGetVersion(APP_VERSION);
      setVersion(appVersion);
    }
    fetchVersion();
  }, []);

  return (
    <div className="space-y-6 select-none max-w-3xl">
      <div>
        <h3 className="text-base font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
          {t("about.title")}
        </h3>
        <p className="text-sm text-[#444746] dark:text-[#C4C7C5] mt-1">
          {t("about.description")}
        </p>
      </div>

      <div className="p-6 bg-white dark:bg-[#0c0d0f] border border-slate-200/90 dark:border-white/[0.06] rounded-2xl space-y-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <img
            src="/teledrive.png"
            alt={appName}
            className="h-12 w-12 object-contain rounded-2xl shrink-0 border border-slate-200/80 dark:border-white/[0.06] p-0.5 bg-white dark:bg-[#060709]"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h4 className="text-base font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                {appName}
              </h4>
              <span className="inline-flex items-center bg-blue-50 dark:bg-blue-950/40 text-[#0B57D0] dark:text-[#8ab4f8] border border-blue-200/60 dark:border-blue-800/60 font-mono text-xs px-2.5 py-0.5 rounded-full font-medium">
                v{version}
              </span>
            </div>
            <p className="text-xs text-[#747775]">{tagline}</p>
          </div>
        </div>

        <p className="text-xs text-[#444746] dark:text-[#C4C7C5] leading-relaxed">
          {summary.trim() ? summary : t("about.summary")}
        </p>

        <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.06] text-xs text-[#747775] dark:text-[#9aa0a6]">
          Developed by <span className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">{DEVELOPER_NAME}</span>
        </div>
      </div>

      <div className="flex gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-[#060709] border border-slate-200/70 dark:border-white/[0.06] text-[#444746] dark:text-[#C4C7C5]">
        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-[#0B57D0] dark:text-[#8ab4f8]" />
        <div className="space-y-1 text-xs leading-relaxed">
          <h5 className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t("about.disclaimer.title")}
          </h5>
          <p>{t("about.disclaimer.body")}</p>
        </div>
      </div>
    </div>
  );
}
