# TeleDrive (customized)

Personal cloud storage powered by a private Telegram channel. Built with Tauri v2, React 19 and TypeScript.

Customized and maintained by **Syotyojit Dev Nath Ovi**.

## Features

- Change the app name, tagline and About text from **Settings → Customize**
- Change the primary, background and text colors (separate light and dark mode values) from the same page
- All customizations are saved on the device and can be reset to the defaults

## Run locally

```bash
npm install
npm run dev          # web preview
npm run tauri dev    # desktop app
```

## Build

```bash
npm run build        # frontend
npm run tauri build  # desktop installers
```

## Adding new hard-coded colors

The Customize page re-themes hard-coded Tailwind colors such as `bg-[#0B57D0]`. After adding new ones, regenerate the color list:

```bash
python3 scripts/gen-brand-tokens.py
```

## License

GPL-3.0-or-later. This project is based on the open-source TeleDrive application; see [LICENSE](./LICENSE).
