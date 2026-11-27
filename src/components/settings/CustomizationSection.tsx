import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_DEFAULTS, useBrandStore, type BrandKey } from "@/stores/brandStore";

const card =
  "p-6 border border-slate-200/90 dark:border-white/[0.06] rounded-2xl bg-white dark:bg-[#0c0d0f] shadow-xs space-y-5";
const inputCls =
  "w-full rounded-lg border border-slate-300 dark:border-white/[0.1] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0B57D0]/40";

function TextField(props: {
  label: string;
  field: "appName" | "tagline" | "summary";
  maxLength: number;
  multiline?: boolean;
  placeholder?: string;
}) {
  const value = useBrandStore((s) => s[props.field]);
  const setField = useBrandStore((s) => s.setField);
  const resetField = useBrandStore((s) => s.resetField);
  const changed = value !== BRAND_DEFAULTS[props.field];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">{props.label}</label>
        {changed && (
          <button
            type="button"
            onClick={() => resetField(props.field)}
            className="text-[11px] text-[#747775] hover:underline cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>
      {props.multiline ? (
        <textarea
          rows={3}
          maxLength={props.maxLength}
          value={value}
          placeholder={props.placeholder}
          onChange={(e) => setField(props.field, e.target.value)}
          className={inputCls}
        />
      ) : (
        <input
          type="text"
          maxLength={props.maxLength}
          value={value}
          placeholder={props.placeholder}
          onChange={(e) => setField(props.field, e.target.value)}
          className={inputCls}
        />
      )}
    </div>
  );
}

function ColorField(props: { label: string; hint: string; field: Extract<BrandKey, "primaryColor" | "bgLight" | "bgDark" | "textLight" | "textDark"> }) {
  const value = useBrandStore((s) => s[props.field]);
  const setField = useBrandStore((s) => s.setField);
  const resetField = useBrandStore((s) => s.resetField);
  const changed = value.toLowerCase() !== BRAND_DEFAULTS[props.field].toLowerCase();

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
      <input
        type="color"
        value={value}
        onChange={(e) => setField(props.field, e.target.value.toUpperCase())}
        className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
        aria-label={props.label}
      />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">{props.label}</div>
        <div className="text-[11px] text-[#747775] dark:text-[#8E918F] truncate">{props.hint}</div>
      </div>
      <code className="text-[11px] font-mono text-[#444746] dark:text-[#C4C7C5]">{value.toUpperCase()}</code>
      {changed && (
        <button
          type="button"
          onClick={() => resetField(props.field)}
          title="Reset"
          className="text-[#747775] hover:text-[#1F1F1F] dark:hover:text-white cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export default function CustomizationSection() {
  const resetAll = useBrandStore((s) => s.resetAll);

  return (
    <div className="space-y-6 select-none">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3]">Customize</h2>
        <p className="text-sm text-[#444746] dark:text-[#C4C7C5]">
          Change the app name, text and colors. Changes apply instantly and are saved on this device.
        </p>
      </div>

      <div className={card}>
        <h3 className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">Text</h3>
        <TextField label="App name" field="appName" maxLength={40} />
        <TextField label="Tagline" field="tagline" maxLength={120} />
        <TextField
          label="About text"
          field="summary"
          maxLength={400}
          multiline
          placeholder="Leave empty to use the default description"
        />
      </div>

      <div className={card}>
        <h3 className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">Colors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ColorField label="Primary color" hint="Buttons, links, highlights" field="primaryColor" />
          <ColorField label="Background (light mode)" hint="Main app background" field="bgLight" />
          <ColorField label="Background (dark mode)" hint="Main app background" field="bgDark" />
          <ColorField label="Text (light mode)" hint="Titles and body text" field="textLight" />
          <ColorField label="Text (dark mode)" hint="Titles and body text" field="textDark" />
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={resetAll} className="rounded-full text-xs gap-2 cursor-pointer">
        <RotateCcw className="h-3.5 w-3.5" />
        Reset everything to default
      </Button>
    </div>
  );
}
