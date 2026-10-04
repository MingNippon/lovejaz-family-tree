# LoveJaz — Interactive Family Pedigree Tree

<p align="center">
  <strong>Preserving Family Heritage, Lineage & Connections Across Generations</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Pedigree_Conventions-Standard_Genetics-blue?style=flat-square" alt="Pedigree Conventions" />
  <img src="https://img.shields.io/badge/Resolution-4K_Ultra_HD-amber?style=flat-square" alt="4K Ultra HD Export" />
  <img src="https://img.shields.io/badge/Languages-6_Supported-rose?style=flat-square" alt="6 Languages" />
  <img src="https://img.shields.io/badge/Hosting-100%25_Free_Forever-emerald?style=flat-square" alt="100% Free Forever" />
  <img src="https://img.shields.io/badge/Zero_Cost-Serverless-purple?style=flat-square" alt="Serverless" />
  <img src="https://img.shields.io/badge/Tests-223_Passing-brightgreen?style=flat-square" alt="Tests 223 Passing" />
</p>

---

## 📖 Overview

**LoveJaz** is a modern, privacy-first, client-side web application for building, visualizing, and sharing family pedigree trees. Designed with standard genealogical and genetic pedigree conventions, it transforms family lineage into an interactive, museum-grade visual artwork suitable for family reunions, personal records, and heritage preservation.

LoveJaz is engineered to be **100% free forever** — requiring **zero database servers**, **zero cloud hosting fees**, and **zero subscription accounts**. Everything is saved locally in your browser and shared via ultra-compact URL hash compression.

---

## ✨ Key Features

### 🏛️ Standard Pedigree Conventions
- **Square Node ($\square$)**: Represents Male individuals with crisp rounded corners, initials, and dynamic color accents.
- **Circle Node ($\bigcirc$)**: Represents Female individuals with smooth contours, initials, and accent strokes.
- **Marriage Lines**: Horizontal dual-anchor connection bars with a central union knot indicator.
- **Sibling Branches**: T-drop stems with unified horizontal sibling bars connecting all biological children in chronological birth order.
- **Deceased Indicators**: Prominent diagonal crimson slash line across deceased ancestors.
- **Generation Ruler (Gen I, II, III...)**: Vertical timeline guide displaying Roman numeral tier markers along the lineage.

### ⚡ Smart Dynamic Interactions
- **One-Click Quick Actions**: Select any person node to reveal the contextual action bar:
  - `+ Spouse`: Instantly creates an opposite-gender partner and establishes a marriage union.
  - `+ Child`: Opens the child modal with real-time gender and birth year fields, connecting to the parent's union.
  - `+ Parents`: Automatically generates a Father Square and Mother Circle with an ancestral union above.
  - `✎ Edit Profile`: Edit full names, roles, birth years, ages, living status, and biographies.
  - `🗑 Delete Member`: Safely removes an individual with smart cascade cleaning and dependency warnings.
- **Full History Stack (Undo / Redo)**: 50-state deep history buffer supporting `Ctrl + Z`, `Ctrl + Y`, `Ctrl + Shift + Z`, and floating button controls.
- **Smooth Canvas Navigation**: Pan & zoom with focal-point centering, mouse wheel zoom, Space + drag, double-touch pinch gestures on mobile, reset zoom, and one-click auto-fit.

### 🎨 Aesthetic Print-Ready 4K Export
- **4 Heritage Art Themes**:
  1. **Minimalist Modern**: Clean white museum aesthetic with charcoal slate accents and high typographic contrast.
  2. **Vintage Parchment**: Warm antique sepia parchment with classic serif typography and traditional heritage ink.
  3. **Regal Navy**: Deep midnight royal navy backdrop accented with regal gold borders and refined brass connections.
  4. **Dark Studio**: Sleek charcoal studio dark mode with vibrant neon highlights.
- **Formats & Resolutions**:
  - **4K Ultra HD PNG** (4x pixel ratio for gallery-quality printing).
  - **2K Retina PNG** (2x pixel ratio for crystal-clear digital displays).
  - **Standalone Vector SVG** (lossless, infinite resolution, embedded CSS styling).
  - **Landscape Print / PDF** (native `@media print` layout formatting).

### 🌐 6 Fully Localized Languages
LoveJaz includes complete, native translations for 6 languages:
- 🇺🇸 **English** (`en`)
- 🇵🇭 **Tagalog** (`tl`)
- 🇵🇭 **Cebuano / Bisaya** (`ceb`)
- 🇯🇵 **Japanese (日本語)** (`ja`)
- 🇨🇳 **Simplified Chinese (简体中文)** (`zh`)
- 🇻🇳 **Vietnamese (Tiếng Việt)** (`vi`)

Switch languages instantly in the header without losing any tree progress or active edits.

---

## 🔒 100% Private, Zero-Cost & Serverless Architecture

Traditional genealogy software locks your personal family records behind monthly paywalls or stores sensitive personal data on third-party servers. LoveJaz takes a fundamentally different architectural approach:

1. **URL Hash Data Compression**: The entire family tree is serialized to JSON and compressed into an encoded URI component using `lz-string`. The entire state lives directly inside the `#tree=...` hash fragment.
2. **Never Sent to Any Server**: Because hash fragments are processed strictly client-side by the browser, no personal genealogical data is ever transmitted over the network or stored in external databases.
3. **Local Storage Auto-Save**: All edits are mirrored to browser `localStorage` under `lovejaz_family_tree_data`.
4. **JSON Backup & Import**: Download offline `.json` backup files at any time and restore them on any device.

---

## 🚀 Free Deployment Guide (100% Free Forever)

Because LoveJaz is a pure client-side static application, you can host it for **$0 / month** indefinitely on leading global edge networks.

### Option 1: Vercel (Recommended — 30 Seconds)
1. Fork or push this repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/your-username/lovejaz.git
   git branch -M main
   git push -u origin main
   ```
2. Navigate to [vercel.com](https://vercel.com) and log in with GitHub.
3. Click **Add New... > Project** and select your `lovejaz` repository.
4. Vercel automatically detects the Vite configuration:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Your family tree is live at `https://your-tree.vercel.app` with free SSL and worldwide edge caching!

---

### Option 2: Cloudflare Pages (Unlimited Free Bandwidth)
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages > Create Application > Pages > Connect to Git**.
2. Select your repository.
3. Enter the build settings:
   - **Framework Preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**. Your site will deploy across 300+ edge data centers worldwide with zero bandwidth fees.

---

### Option 3: GitHub Pages
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `dist` directory using `gh-pages`:
   ```bash
   npx gh-pages -d dist
   ```
3. Alternatively, enable GitHub Pages under **Repository Settings > Pages > Source > GitHub Actions**. Your tree will be hosted at `https://your-username.github.io/lovejaz/`.

---

### Custom Domains ($0 Extra Cost)
You can attach your own custom family domain (e.g. `tree.delacruz.ph` or `family.ourheritage.com`):
1. In Vercel or Cloudflare Pages, open **Settings > Domains**.
2. Add your custom domain.
3. In your DNS provider (Cloudflare, Namecheap, GoDaddy), add a `CNAME` record pointing to the target provided by your host (e.g. `cname.vercel-dns.com`).
4. Automated SSL certificates (HTTPS) are issued and renewed for free via Let's Encrypt.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Z` / `Cmd + Z` | **Undo** last change |
| `Ctrl + Y` / `Cmd + Y` | **Redo** last undone change |
| `Ctrl + Shift + Z` | **Redo** (Alternative) |
| `Escape` | **Deselect** person / Close active modal |
| `Space + Drag` | **Pan** canvas freely |
| `Mouse Wheel` | **Zoom in / Zoom out** around focal point |

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: React 19, TypeScript 5.7
- **Bundler & Tooling**: Vite 6, Tailwind CSS 3.4
- **Icons**: Lucide React
- **Compression**: `lz-string` (URI-safe client compression)
- **Export Engine**: Vector SVG rendering, HTML5 Canvas 2D bitmap rasterizer (up to 4K 3840×2160 resolution)
- **Testing**: Vitest 3, React Server Renderer (`renderToString`), 100% unit and integration test coverage across 223 tests.

---

## 💻 Local Development

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/lovejaz.git
cd lovejaz

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Running Tests
```bash
# Run full Vitest test suite
npm run test
```

### Production Build
```bash
# Typecheck and compile optimized static distribution
npm run build
```

The compiled output will be generated in `dist/`.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information. Built with love for families worldwide.
