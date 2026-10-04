# LoveJaz Family Tree Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a beautiful, responsive, and glitch-free web application ("LoveJaz") for creating standard genetic/heritage pedigree charts (Male = Square, Female = Circle, generation levels Gen I, Gen II, Gen III, marriage & sibling branches), with 4K aesthetic export, 6-language internationalization, URL sharing, and a complete free deployment guide.

**Architecture:** Single Page Application (SPA) powered by React 19 + TypeScript + Tailwind CSS with a custom deterministic Pedigree Layout Engine. Renders an interactive SVG canvas supporting infinite pan/zoom, smart node action bars, and export to Ultra-HD PNG/SVG/PDF across 4 themes (Minimalist, Royal Vintage Parchment, Elegant Navy, Dark Studio). Data is persisted via LocalStorage and shared worldwide via LZ-string compressed URL hash (zero server cost).

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, lz-string, html-to-image, canvas-confetti, Vitest.

**Spec:** [`docs/superpowers/specs/2026-10-05-lovejaz-family-tree-design.md`](file:///e:/project%20code/web%20help%20jaz/docs/superpowers/specs/2026-10-05-lovejaz-family-tree-design.md)

## Global Constraints
- Node conventions: **Male = Square (■)**, **Female = Circle (●)**.
- Generation levels strictly labeled: **Generation I**, **Generation II**, **Generation III**, ...
- Marriage connects spouses horizontally; children drop vertically from the marriage midpoint to a horizontal sibling bar.
- Supported languages: **English (`en`, default)**, **Tagalog (`tl`)**, **Bisaya (`ceb`)**, **Japanese (`ja`)**, **Chinese (`zh`)**, **Vietnamese (`vi`)**.
- URL sharing must be client-side and free: LZ-string hash encoding.
- Zero-cost deployment: build must produce pure static assets for Vercel / Cloudflare Pages / GitHub Pages.
- Aesthetic polish: anti-AI slop, refined typography, smooth spring transitions, high contrast, clean vector lines.

---

### Task 1: Project Scaffolding & Build Configuration

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/index.css`
- Create: `src/main.tsx`
- Create: `src/App.tsx`

**Interfaces:**
- Consumes: None (Root setup).
- Produces: Runnable Vite React 19 + Tailwind CSS + Vitest project.

- [ ] **Step 1: Create package.json with dependencies**

```json
{
  "name": "lovejaz-family-tree",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "html-to-image": "^1.11.11",
    "lucide-react": "^1.16.0",
    "lz-string": "^1.5.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.0.2"
  },
  "devDependencies": {
    "@types/lz-string": "^1.5.0",
    "@types/node": "^22.13.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "vite": "^6.1.0",
    "vitest": "^3.0.5"
  }
}
```

- [ ] **Step 2: Create TypeScript and Vite configs**

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
  },
});
```

Create `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        parchment: {
          50: '#FAF8F5',
          100: '#F5F0E6',
          200: '#EBDDC5',
          300: '#DFCAA2',
          800: '#52432D',
          900: '#34291B',
        },
      },
    },
  },
  plugins: [],
};
```

Create `postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: Create index.html, index.css, and basic App.tsx**

Create `index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌳</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LoveJaz - Family Pedigree & Heritage Tree</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased selection:bg-rose-500 selection:text-white overflow-hidden">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    user-select: none;
    -webkit-user-select: none;
  }
}
```

Create `src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">
      <h1 className="text-3xl font-bold text-rose-400">LoveJaz Family Tree</h1>
    </div>
  );
}
```

- [ ] **Step 4: Install dependencies and verify build**

Run: `npm install`  
Run: `npm run build`  
Expected: Successful compile into `dist/`.

- [ ] **Step 5: Commit scaffolding**

```bash
git add .
git commit -m "chore: scaffold LoveJaz Vite React TypeScript Tailwind app"
```

---

### Task 2: Core Data Models & Pedigree Layout Engine

**Files:**
- Create: `src/types/family.ts`
- Create: `src/engine/layout.ts`
- Create: `src/engine/layout.test.ts`

**Interfaces:**
- Consumes: `Person`, `Gender`, `Union`, `FamilyTreeData`.
- Produces: `computePedigreeLayout(tree: FamilyTreeData): LayoutResult`
  - Returns calculated node coordinates `Record<string, NodePosition>`, marriage connection lines `MarriageLine[]`, sibling drop branches `SiblingBranch[]`, and generation bounds `GenerationTier[]`.

- [ ] **Step 1: Define types in `src/types/family.ts`**

```typescript
export type Gender = 'male' | 'female';

export interface Person {
  id: string;
  name: string;
  gender: Gender;
  birthYear?: number | string;
  age?: number | string;
  isDeceased?: boolean;
  notes?: string;
  title?: string;
}

export interface Union {
  id: string;
  partner1Id: string;
  partner2Id: string;
  childrenIds: string[];
}

export interface FamilyTreeData {
  version: string;
  title: string;
  subtitle?: string;
  persons: Record<string, Person>;
  unions: Record<string, Union>;
  rootPersonId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  generation: number;
  gender: Gender;
}

export interface MarriageLine {
  id: string;
  partner1Id: string;
  partner2Id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  midX: number;
  midY: number;
  childrenIds: string[];
}

export interface SiblingBranch {
  unionId: string;
  stemStartX: number;
  stemStartY: number;
  stemEndY: number;
  barStartX: number;
  barEndX: number;
  childDrops: {
    childId: string;
    topX: number;
    topY: number;
    bottomX: number;
    bottomY: number;
  }[];
}

export interface GenerationTier {
  generation: number;
  label: string; // e.g. "Generation I"
  y: number;
  height: number;
}

export interface LayoutResult {
  nodes: Record<string, NodePosition>;
  marriages: MarriageLine[];
  branches: SiblingBranch[];
  generations: GenerationTier[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
  };
}
```

- [ ] **Step 2: Write failing test in `src/engine/layout.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { computePedigreeLayout } from './layout';
import { FamilyTreeData } from '../types/family';

describe('computePedigreeLayout', () => {
  it('correctly stratifies generations and positions couple + children', () => {
    const mockTree: FamilyTreeData = {
      version: '1.0',
      title: 'Test Family',
      rootPersonId: 'p1',
      persons: {
        p1: { id: 'p1', name: 'Father', gender: 'male', birthYear: 1960 },
        p2: { id: 'p2', name: 'Mother', gender: 'female', birthYear: 1965 },
        c1: { id: 'c1', name: 'Son', gender: 'male', birthYear: 1990 },
        c2: { id: 'c2', name: 'Daughter', gender: 'female', birthYear: 1995 },
      },
      unions: {
        u1: {
          id: 'u1',
          partner1Id: 'p1',
          partner2Id: 'p2',
          childrenIds: ['c1', 'c2'],
        },
      },
    };

    const layout = computePedigreeLayout(mockTree);

    // Generation checks
    expect(layout.generations.length).toBe(2);
    expect(layout.generations[0].label).toBe('Generation I');
    expect(layout.generations[1].label).toBe('Generation II');

    // Node generation checks
    expect(layout.nodes['p1'].generation).toBe(0);
    expect(layout.nodes['p2'].generation).toBe(0);
    expect(layout.nodes['c1'].generation).toBe(1);
    expect(layout.nodes['c2'].generation).toBe(1);

    // Marriage horizontal alignment: father and mother share exact same Y
    expect(layout.nodes['p1'].y).toBe(layout.nodes['p2'].y);

    // Children are placed strictly below parents
    expect(layout.nodes['c1'].y).toBeGreaterThan(layout.nodes['p1'].y);
    expect(layout.nodes['c2'].y).toBe(layout.nodes['c1'].y);

    // Children are spaced apart horizontally
    expect(layout.nodes['c2'].x).toBeGreaterThan(layout.nodes['c1'].x);

    // Marriage line mid-point
    expect(layout.marriages.length).toBe(1);
    expect(layout.marriages[0].midX).toBeCloseTo((layout.nodes['p1'].x + layout.nodes['p2'].x) / 2);

    // Branches drop down to children
    expect(layout.branches.length).toBe(1);
    expect(layout.branches[0].childDrops.length).toBe(2);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/engine/layout.test.ts`  
Expected: FAIL with "computePedigreeLayout is not defined" or missing module.

- [ ] **Step 4: Implement Pedigree Layout Algorithm in `src/engine/layout.ts`**

Implement deterministic layering, spouse pairing, sibling spacing, and generation bounding:
```typescript
import { FamilyTreeData, LayoutResult, NodePosition, MarriageLine, SiblingBranch, GenerationTier } from '../types/family';

export const NODE_SIZE = 72; // Width & height of square / circle
export const SPOUSE_GAP = 70; // Distance between married couple
export const SIBLING_GAP = 60; // Horizontal gap between siblings
export const GENERATION_HEIGHT = 180; // Vertical distance between generations
export const PADDING = 100;

function romanNumeral(num: number): string {
  const lookup: [number, string][] = [
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let result = '';
  let n = num;
  for (const [val, roman] of lookup) {
    while (n >= val) {
      result += roman;
      n -= val;
    }
  }
  return result || 'I';
}

export function computePedigreeLayout(tree: FamilyTreeData): LayoutResult {
  const nodes: Record<string, NodePosition> = {};
  const marriages: MarriageLine[] = [];
  const branches: SiblingBranch[] = [];
  const generations: GenerationTier[] = [];

  // 1. Calculate generational depths using BFS/DFS from roots
  const parentOf: Record<string, string[]> = {};
  const childrenOfPerson: Record<string, string[]> = {};
  const spouseOf: Record<string, string> = {};

  Object.values(tree.unions).forEach(union => {
    spouseOf[union.partner1Id] = union.partner2Id;
    spouseOf[union.partner2Id] = union.partner1Id;
    union.childrenIds.forEach(childId => {
      if (!parentOf[childId]) parentOf[childId] = [];
      parentOf[childId].push(union.partner1Id, union.partner2Id);

      if (!childrenOfPerson[union.partner1Id]) childrenOfPerson[union.partner1Id] = [];
      childrenOfPerson[union.partner1Id].push(childId);
      if (!childrenOfPerson[union.partner2Id]) childrenOfPerson[union.partner2Id] = [];
      childrenOfPerson[union.partner2Id].push(childId);
    });
  });

  // Determine generation level for each person
  const personGen: Record<string, number> = {};
  
  // Find top-level ancestors (persons with no recorded parents in tree)
  const allPersonIds = Object.keys(tree.persons);
  const rootAncestors = allPersonIds.filter(id => !parentOf[id] || parentOf[id].length === 0);

  // If no clear root, use tree.rootPersonId
  const initialRoots = rootAncestors.length > 0 ? rootAncestors : [tree.rootPersonId];

  // Helper to assign generation
  function assignGen(personId: string, gen: number) {
    if (personGen[personId] !== undefined && personGen[personId] >= gen) return;
    personGen[personId] = gen;

    // Spouses must share the exact same generation
    const spouseId = spouseOf[personId];
    if (spouseId && personGen[spouseId] !== gen) {
      personGen[spouseId] = gen;
    }

    // Children get gen + 1
    const children = childrenOfPerson[personId] || [];
    children.forEach(cId => assignGen(cId, gen + 1));
  }

  initialRoots.forEach(rId => assignGen(rId, 0));

  // Fallback for disconnected nodes
  allPersonIds.forEach(id => {
    if (personGen[id] === undefined) assignGen(id, 0);
  });

  const maxGen = Math.max(...Object.values(personGen), 0);

  // Group by generation
  const genGroups: Record<number, string[]> = {};
  for (let g = 0; g <= maxGen; g++) genGroups[g] = [];
  allPersonIds.forEach(id => {
    const g = personGen[id] ?? 0;
    genGroups[g].push(id);
  });

  // Calculate layout coordinates recursively from top down
  let currentX = PADDING;

  // Track positioned unions and people
  const positionedPersons = new Set<string>();

  for (let g = 0; g <= maxGen; g++) {
    const y = PADDING + g * GENERATION_HEIGHT;
    generations.push({
      generation: g,
      label: `Generation ${romanNumeral(g + 1)}`,
      y,
      height: GENERATION_HEIGHT,
    });
  }

  // Positioning: place top roots and their family clusters
  // Helper to layout a family unit
  const unionList = Object.values(tree.unions);

  unionList.forEach((union) => {
    const p1 = tree.persons[union.partner1Id];
    const p2 = tree.persons[union.partner2Id];
    if (!p1 || !p2) return;

    const g = personGen[p1.id] ?? 0;
    const y = PADDING + g * GENERATION_HEIGHT;

    // Position p1 and p2 horizontally
    const p1X = currentX;
    const p2X = p1X + NODE_SIZE + SPOUSE_GAP;

    nodes[p1.id] = {
      id: p1.id,
      x: p1X,
      y,
      width: NODE_SIZE,
      height: NODE_SIZE,
      generation: g,
      gender: p1.gender,
    };
    nodes[p2.id] = {
      id: p2.id,
      x: p2X,
      y,
      width: NODE_SIZE,
      height: NODE_SIZE,
      generation: g,
      gender: p2.gender,
    };

    positionedPersons.add(p1.id);
    positionedPersons.add(p2.id);

    // Marriage line between them
    const marriageLine: MarriageLine = {
      id: union.id,
      partner1Id: p1.id,
      partner2Id: p2.id,
      x1: p1X + NODE_SIZE,
      y1: y + NODE_SIZE / 2,
      x2: p2X,
      y2: y + NODE_SIZE / 2,
      midX: (p1X + NODE_SIZE + p2X) / 2,
      midY: y + NODE_SIZE / 2,
      childrenIds: union.childrenIds,
    };
    marriages.push(marriageLine);

    // Layout children
    if (union.childrenIds.length > 0) {
      const childY = PADDING + (g + 1) * GENERATION_HEIGHT;
      const childCount = union.childrenIds.length;
      const totalChildrenWidth = childCount * NODE_SIZE + (childCount - 1) * SIBLING_GAP;
      
      // Center children under marriage midX
      let childStartX = marriageLine.midX - totalChildrenWidth / 2;
      // Ensure it does not collide with left bounds
      if (childStartX < currentX) childStartX = currentX;

      const childDrops: SiblingBranch['childDrops'] = [];

      union.childrenIds.forEach((childId, index) => {
        const child = tree.persons[childId];
        if (!child) return;
        const cx = childStartX + index * (NODE_SIZE + SIBLING_GAP);
        nodes[childId] = {
          id: childId,
          x: cx,
          y: childY,
          width: NODE_SIZE,
          height: NODE_SIZE,
          generation: g + 1,
          gender: child.gender,
        };
        positionedPersons.add(childId);

        childDrops.push({
          childId,
          topX: cx + NODE_SIZE / 2,
          topY: marriageLine.midY + 45,
          bottomX: cx + NODE_SIZE / 2,
          bottomY: childY,
        });
      });

      // Sibling Bar
      const minChildX = childDrops[0].topX;
      const maxChildX = childDrops[childDrops.length - 1].topX;

      branches.push({
        unionId: union.id,
        stemStartX: marriageLine.midX,
        stemStartY: marriageLine.midY,
        stemEndY: marriageLine.midY + 45,
        barStartX: minChildX,
        barEndX: maxChildX,
        childDrops,
      });

      currentX = Math.max(p2X + NODE_SIZE + 100, childStartX + totalChildrenWidth + 100);
    } else {
      currentX = p2X + NODE_SIZE + 100;
    }
  });

  // Handle single / unpartnered persons
  allPersonIds.forEach(pId => {
    if (!positionedPersons.has(pId)) {
      const p = tree.persons[pId];
      const g = personGen[pId] ?? 0;
      const y = PADDING + g * GENERATION_HEIGHT;
      nodes[pId] = {
        id: pId,
        x: currentX,
        y,
        width: NODE_SIZE,
        height: NODE_SIZE,
        generation: g,
        gender: p.gender,
      };
      currentX += NODE_SIZE + 80;
    }
  });

  // Calculate total bounding box
  const allX = Object.values(nodes).map(n => n.x);
  const allY = Object.values(nodes).map(n => n.y);
  const minX = Math.min(...allX, 0) - PADDING;
  const maxX = Math.max(...allX.map(x => x + NODE_SIZE), 800) + PADDING;
  const minY = Math.min(...allY, 0) - PADDING;
  const maxY = Math.max(...allY.map(y => y + NODE_SIZE), 600) + PADDING;

  return {
    nodes,
    marriages,
    branches,
    generations,
    bounds: {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    },
  };
}
```

- [ ] **Step 5: Run tests and verify they pass**

Run: `npx vitest run src/engine/layout.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit Task 2**

```bash
git add src/types/family.ts src/engine/layout.ts src/engine/layout.test.ts
git commit -m "feat: implement pedigree layout engine and data models with tests"
```

---

### Task 3: Multilingual Engine (6 Languages: EN, TL, CEB, JA, ZH, VI)

**Files:**
- Create: `src/types/i18n.ts`
- Create: `src/i18n/locales/en.ts`
- Create: `src/i18n/locales/tl.ts`
- Create: `src/i18n/locales/ceb.ts`
- Create: `src/i18n/locales/ja.ts`
- Create: `src/i18n/locales/zh.ts`
- Create: `src/i18n/locales/vi.ts`
- Create: `src/i18n/index.tsx`

**Interfaces:**
- Consumes: Supported language code `'en' | 'tl' | 'ceb' | 'ja' | 'zh' | 'vi'`.
- Produces: `useI18n()` hook providing `t(key: string): string`, `currentLanguage`, `setLanguage(lang: SupportedLanguage)`.

- [ ] **Step 1: Define translation schema in `src/types/i18n.ts`**

```typescript
export type SupportedLanguage = 'en' | 'tl' | 'ceb' | 'ja' | 'zh' | 'vi';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
  { code: 'ceb', name: 'Bisaya', flag: '🇵🇭' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];
```

- [ ] **Step 2: Create dictionary files for all 6 languages**

Create `en.ts`, `tl.ts`, `ceb.ts`, `ja.ts`, `zh.ts`, `vi.ts` with comprehensive coverage of:
- Brand & header: Title, Sample tree, New tree, Export, Share, Deploy Guide, Help.
- Canvas & nodes: Male (Square), Female (Circle), Generation, Spouse, Add Child, Add Parents, Edit, Delete.
- Modals: Full Name, Birth Year, Age, Notes, Status (Living/Deceased), Cancel, Save, Confirm.
- Themes: Minimalist Clean, Vintage Parchment, Elegant Navy, Dark Studio.
- Export: Resolution (1x, 2x, 4x), Format (PNG, SVG, PDF), Legend toggle, Generation marker toggle.
- Share: Link copied toast, QR code, Backup JSON, Restore JSON.

- [ ] **Step 3: Implement `useI18n` context and hook in `src/i18n/index.tsx`**

Persists selected language to `localStorage.getItem('lovejaz_lang') || 'en'`.

- [ ] **Step 4: Verify i18n switching with a simple unit test**

Create `src/i18n/i18n.test.ts` testing translation key lookups and fallback.  
Run: `npx vitest run src/i18n/i18n.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit Task 3**

```bash
git add src/types/i18n.ts src/i18n/
git commit -m "feat: complete 6-language i18n system (EN, TL, CEB, JA, ZH, VI)"
```

---

### Task 4: URL Sharing (`lz-string`), Persistence & Curated Sample Tree

**Files:**
- Create: `src/utils/share.ts`
- Create: `src/utils/storage.ts`
- Create: `src/utils/sampleData.ts`
- Create: `src/utils/share.test.ts`

**Interfaces:**
- Consumes: `FamilyTreeData`.
- Produces:
  - `encodeTreeToUrl(tree: FamilyTreeData): string`
  - `decodeTreeFromUrl(hash: string): FamilyTreeData | null`
  - `saveTreeToStorage(tree: FamilyTreeData): void`
  - `loadTreeFromStorage(): FamilyTreeData | null`
  - `getSampleFamilyTree(): FamilyTreeData`

- [ ] **Step 1: Write test for URL encode/decode in `src/utils/share.test.ts`**

Verify compression round-trip without data loss.

- [ ] **Step 2: Implement `src/utils/share.ts` using `lz-string`**

```typescript
import LZString from 'lz-string';
import { FamilyTreeData } from '../types/family';

export function encodeTreeToUrl(tree: FamilyTreeData): string {
  const json = JSON.stringify(tree);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return `${window.location.origin}${window.location.pathname}#tree=${compressed}`;
}

export function decodeTreeFromUrl(): FamilyTreeData | null {
  try {
    const hash = window.location.hash;
    if (!hash || !hash.includes('#tree=')) return null;
    const compressed = hash.split('#tree=')[1];
    if (!compressed) return null;
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    return JSON.parse(json) as FamilyTreeData;
  } catch (err) {
    console.error('Failed to parse tree from URL', err);
    return null;
  }
}
```

- [ ] **Step 3: Implement `src/utils/storage.ts` and `src/utils/sampleData.ts`**

Create realistic, multi-generational sample tree (e.g. Patriarch & Matriarch in Gen I, 3 children + spouses in Gen II, 4 grandchildren in Gen III).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/share.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit Task 4**

```bash
git add src/utils/
git commit -m "feat: implement lz-string URL sharing, local storage and sample data"
```

---

### Task 5: Interactive SVG Canvas & Generation Axis

**Files:**
- Create: `src/components/Canvas.tsx`
- Create: `src/components/GenerationRuler.tsx`
- Create: `src/components/FloatingControls.tsx`

**Interfaces:**
- Consumes: `LayoutResult`, current zoom scale (0.2 - 3.0), pan offsets (translateX, translateY).
- Produces: Interactive Pan & Zoom viewport with mouse drag, wheel scroll, pinch gestures, and "Fit to Screen" button.

- [ ] **Step 1: Implement `GenerationRuler.tsx`**

Renders elegant horizontal axis markers at the left/right edges for `Generation I`, `Generation II`, `Generation III` with subtle divider lines and roman numerals.

- [ ] **Step 2: Implement `FloatingControls.tsx`**

Floating action buttons: Zoom In (+), Zoom Out (-), Reset (100%), Fit to View (🎯), Toggle Generation Labels, Undo/Redo.

- [ ] **Step 3: Implement `Canvas.tsx`**

Includes SVG wrapper, infinite viewport transform (`matrix` or `transform="translate(x, y) scale(s)"`), smooth panning handlers, and render pipeline for marriage lines and sibling drop branches.

- [ ] **Step 4: Commit Task 5**

```bash
git add src/components/Canvas.tsx src/components/GenerationRuler.tsx src/components/FloatingControls.tsx
git commit -m "feat: implement interactive SVG canvas with smooth pan, zoom and generation ruler"
```

---

### Task 6: Person Nodes (Square Male / Circle Female) & Smart Action Toolbar

**Files:**
- Create: `src/components/PersonNode.tsx`
- Create: `src/components/QuickActionToolbar.tsx`

**Interfaces:**
- Consumes: `Person`, `NodePosition`, selection state.
- Produces:
  - SVG node: **Square** for male, **Circle** for female.
  - Hover/click popup with buttons: `+ Spouse`, `+ Child`, `+ Parents`, `Edit`, `Delete`.

- [ ] **Step 1: Implement `PersonNode.tsx`**

- Square (`<rect>`) with rounded corners (rx=8) for Male.
- Circle (`<circle>`) for Female.
- Diagonal deceased slash line (`<line>`) if `isDeceased === true`.
- Typography inside/beneath: Name, birth year/age.
- Subtle drop shadows and theme-reactive stroke colors.

- [ ] **Step 2: Implement `QuickActionToolbar.tsx`**

Smooth floating pill toolbar positioned directly above or beside the selected node with tooltips and icons for quick additions.

- [ ] **Step 3: Commit Task 6**

```bash
git add src/components/PersonNode.tsx src/components/QuickActionToolbar.tsx
git commit -m "feat: implement square male / circle female nodes with quick action toolbar"
```

---

### Task 7: Profile Editing & Fast Add Child Modals

**Files:**
- Create: `src/components/EditPersonModal.tsx`
- Create: `src/components/AddChildModal.tsx`
- Create: `src/components/DeleteConfirmModal.tsx`

**Interfaces:**
- Consumes: Selected `personId` or `unionId`.
- Produces: Accessible, responsive dialogs with form controls, smooth opening backdrop, and Esc/Enter keyboard support.

- [ ] **Step 1: Implement `EditPersonModal.tsx`**

Form fields: Name, Gender (Square/Circle selector), Birth Year, Age, Living/Deceased checkbox, Title/Role, Notes.

- [ ] **Step 2: Implement `AddChildModal.tsx`**

Rapid 3-input popover: Gender selector (Male Square vs Female Circle), Child Name, Birth Year. Instantly updates tree layout.

- [ ] **Step 3: Implement `DeleteConfirmModal.tsx`**

Confirmation dialog with warning if person has children.

- [ ] **Step 4: Commit Task 7**

```bash
git add src/components/EditPersonModal.tsx src/components/AddChildModal.tsx src/components/DeleteConfirmModal.tsx
git commit -m "feat: implement edit profile, add child and deletion modals"
```

---

### Task 8: Aesthetic 4K Export Engine & Visual Themes

**Files:**
- Create: `src/types/theme.ts`
- Create: `src/engine/themes.ts`
- Create: `src/components/ExportModal.tsx`
- Create: `src/utils/export.ts`

**Interfaces:**
- Consumes: SVG DOM element, selected theme, export settings (1x/2x/4x, PNG/SVG/PDF).
- Produces: Direct download of pristine 4K PNG, SVG vector, or Landscape Print PDF.

- [ ] **Step 1: Implement `src/types/theme.ts` and `src/engine/themes.ts`**

Define 4 themes:
1. `minimalist`: Crisp white, slate borders, clean typography.
2. `vintage`: Parchment ivory background, sepia ink borders, antique corner ornaments, serif titles.
3. `navy`: Royal navy slate `#0B132B`, gold borders `#D4AF37`, elegant white text.
4. `dark`: Charcoal slate `#121826`, crisp neon blue and rose accents.

- [ ] **Step 2: Implement `src/utils/export.ts`**

High-resolution rasterization pipeline using `html-to-image` / Canvas rendering:
- Supports `pixelRatio: 4` for crystal-clear 4K export.
- Embeds Title banner, Generation indicators, and Legend (■ Male, ● Female).
- SVG exporter serializes pure XML with embedded styles for Figma/Illustrator compatibility.

- [ ] **Step 3: Implement `src/components/ExportModal.tsx`**

Preview window, theme selector cards, resolution buttons, toggles for Legend/Title/Borders, and instant download buttons.

- [ ] **Step 4: Commit Task 8**

```bash
git add src/types/theme.ts src/engine/themes.ts src/components/ExportModal.tsx src/utils/export.ts
git commit -m "feat: implement 4-theme aesthetic 4K PNG, SVG and PDF export engine"
```

---

### Task 9: Header, Free Global Deployment Guide & Share Modal

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/ShareModal.tsx`
- Create: `src/components/DeployGuideModal.tsx`

**Interfaces:**
- Consumes: Tree title, language selector, share link.
- Produces: Modern top navbar, instant link copy modal, and step-by-step free hosting guide for Vercel, Cloudflare, and GitHub Pages.

- [ ] **Step 1: Implement `DeployGuideModal.tsx`**

Detailed walkthrough with copyable commands:
- **Vercel**: Import repository on vercel.com, build command `npm run build`, output `dist`, click Deploy -> Free `*.vercel.app` with worldwide Edge CDN.
- **Cloudflare Pages**: Connect repo -> Free unlimited bandwidth worldwide.
- **GitHub Pages**: One-click setup via GitHub Actions.

- [ ] **Step 2: Implement `ShareModal.tsx`**

One-click "Copy Link" button with success tooltip, and options to download backup JSON.

- [ ] **Step 3: Implement `Header.tsx`**

Houses the LoveJaz logo, editable tree title, Sample Tree button, Language selector, Share, Export, and Deploy Guide buttons.

- [ ] **Step 4: Commit Task 9**

```bash
git add src/components/Header.tsx src/components/ShareModal.tsx src/components/DeployGuideModal.tsx
git commit -m "feat: implement header, share modal and global free deployment guide"
```

---

### Task 10: App Integration, Polish, Responsiveness & Verification

**Files:**
- Modify: `src/App.tsx`
- Create: `README.md`

**Interfaces:**
- Consumes: All components, state, hooks, and modals.
- Produces: Complete, responsive LoveJaz web application.

- [ ] **Step 1: Assemble full state and components in `src/App.tsx`**

Wire up undo/redo history, keyboard shortcuts (Ctrl+Z, Ctrl+Y, Space+Drag, Ctrl+0), local storage sync, and modals.

- [ ] **Step 2: Write clear, informative `README.md` with deployment instructions**

Include quick start, features list, pedigree rules, and free deployment steps for users.

- [ ] **Step 3: Run comprehensive verification**

1. Run unit test suite: `npm run test` (All tests must PASS).
2. Run TypeScript build: `npm run build` (Zero TS errors, output in `dist/`).
3. Preview build: `npm run preview` to verify bundle.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete LoveJaz family pedigree tree application"
```
