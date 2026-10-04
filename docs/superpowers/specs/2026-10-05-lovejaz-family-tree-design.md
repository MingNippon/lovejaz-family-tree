# LoveJaz - Family Pedigree & Heritage Tree Application
## Design Specification Document

**Project Name:** LoveJaz  
**Date:** 2026-10-05  
**Status:** Approved by User  
**Target Platform:** Web (Desktop & Mobile Responsive, Worldwide Accessible)  
**Deployment Target:** 100% Free Static Hosting (Vercel, Cloudflare Pages, GitHub Pages)  

---

## 1. Executive Summary & Vision

**LoveJaz** is an elegant, responsive, and intuitive web application designed for creating, customizing, and sharing medical/genetic standard and cultural family pedigree charts (cây quan hệ gia đình / phả hệ).

### Core Principles
1. **Scientific & Clear Pedigree Conventions**:
   * **Squares (■)** represent Males (con trai / nam giới).
   * **Circles (●)** represent Females (con gái / nữ giới).
   * Horizontal marriage bars connect spouses.
   * Vertical branches drop to horizontal sibling bars connecting children.
   * Automatic generation tiers: **Generation I**, **Generation II**, **Generation III**, ...
2. **Symmetrical, Balanced & Glitch-Free Layout**:
   * Specialized tree calculation algorithm ensures nodes never overlap, lines never cross haphazardly, and generation levels remain perfectly straight and aligned.
3. **Aesthetic 4K & Vector Export**:
   * Export stunning, print-ready family charts in Ultra-HD PNG (300 DPI), SVG vector, and PDF formats with customizable heritage themes (Minimalist, Royal Vintage Parchment, Elegant Navy Gold, Dark Studio).
4. **Zero-Backend Global Sharing**:
   * Compressed URL sharing (`lz-string` hash) and JSON backup enable instantaneous, zero-cost sharing across any country with no server maintenance.
5. **Full Multilingual Support (6 Languages)**:
   * English (Default), Tagalog, Bisaya (Cebuano), Japanese (日本語), Chinese (中文), Vietnamese (Tiếng Việt).
6. **Anti-AI Slop Craftsmanship**:
   * Thoughtful typography (Plus Jakarta Sans / Cormorant Garamond for vintage), smooth spring animations, crisp vectors, responsive mobile controls, zero generic boilerplate feel.

---

## 2. System Architecture & Tech Stack

```
+---------------------------------------------------------------------------------+
|                                LoveJaz Web App                                  |
+---------------------------------------------------------------------------------+
|                                                                                 |
|  +--------------------+  +----------------------+  +-------------------------+  |
|  |   i18n Manager     |  |   App State Store    |  |  URL Sharing & Storage  |  |
|  |  (EN, TL, CEB,     |  | (Zustand / Reactive  |  |  - LZ-String URL Hash   |  |
|  |   JA, ZH, VI)      |  |     React State)     |  |  - LocalStorage Auto    |  |
|  +--------------------+  +----------+-----------+  |  - JSON Import / Export |  |
|                                     |              +-------------------------+  |
|                                     v                                           |
|                      +-----------------------------+                            |
|                      | Pedigree Layout Engine      |                            |
|                      | - Generation Stratification |                            |
|                      | - Spouse Horizontal Pairing |                            |
|                      | - Sibling Subtree Centering |                            |
|                      | - Collision Free Coordinates|                            |
|                      +--------------+--------------+                            |
|                                     |                                           |
|                                     v                                           |
|  +---------------------------------------------------------------------------+  |
|  |                    Interactive Vector Canvas (SVG + Canvas)               |  |
|  |  - Smooth Pan & Zoom (20% - 300%, Touch & Mouse Wheel)                    |  |
|  |  - Smart Node Quick Toolbar (+ Spouse, + Child, + Parent, Edit, Delete)   |  |
|  |  - Generation Axis Ruler (Gen I, Gen II, Gen III, ...)                    |  |
|  +---------------------------------------------------------------------------+  |
|                                     |                                           |
|                                     v                                           |
|  +---------------------------------------------------------------------------+  |
|  |                       Aesthetic Export Engine                             |  |
|  |  - 4 Visual Themes: Minimalist, Vintage Parchment, Royal Navy, Dark Studio |  |
|  |  - Formats: PNG (4K / 300 DPI), SVG Vector, PDF Print-Ready               |  |
|  |  - Decorative Borders, Family Title, Legend (■ Male, ● Female)            |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

### Technology Selections
* **Framework**: React 19 + TypeScript + Vite (Lightning-fast dev & optimized static build).
* **Styling**: Tailwind CSS (Custom design system tokens, responsive utilities).
* **Icons**: Lucide React (Clean, modern iconography).
* **State Management**: Lightweight Zustand store with undo/redo capability (`temporal` / custom history stack).
* **Data Compression**: `lz-string` (For zero-cost URL encoding and sharing).
* **Export Utilities**: Vector SVG serialization + Canvas 2D / `html-to-image` rasterizer for 4K PNG.

---

## 3. Data Models & Graph Schema

### 3.1 Person Entity
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
  title?: string; // e.g. "Trưởng nam", "Family Patriarch"
  avatarColor?: string;
}
```

### 3.2 Union (Marriage / Relationship) Entity
```typescript
export interface Union {
  id: string;
  partner1Id: string;
  partner2Id: string;
  childrenIds: string[]; // Order preserved (e.g. oldest to youngest)
}
```

### 3.3 Family Tree Project State
```typescript
export interface FamilyTreeData {
  version: string;
  title: string;
  description?: string;
  persons: Record<string, Person>;
  unions: Record<string, Union>;
  rootPersonId: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. Pedigree Layout Algorithm Specification

The pedigree layout engine operates deterministically to guarantee that:
1. **Generations stay strictly horizontal**: Gen I at top ($Y_0$), Gen II below ($Y_0 + \Delta Y$), Gen III below that ($Y_0 + 2\Delta Y$).
2. **Spouses stay horizontally paired**: $Y_{\text{partner1}} = Y_{\text{partner2}}$, separated by a fixed `spouseDistance` (e.g., $100\text{px}$).
3. **Children drop from marriage center**:
   * Midpoint between spouses: $X_{\text{union}} = \frac{X_{\text{partner1}} + X_{\text{partner2}}}{2}$.
   * Vertical stem drops downwards by $\frac{\Delta Y}{2}$.
   * Horizontal sibling bar connects all children of this union: from $\min(X_{\text{children}})$ to $\max(X_{\text{children}})$.
   * Drop stems drop down to each child node.
4. **Collision Resolution & Subtree Spacing**:
   * For each subtree, the layout calculates bounding widths recursively.
   * Adjacent family subtrees are spaced by `familyGap = 80px`.
   * Parent couple is centered over the bounding box of their children.

---

## 5. UI/UX & Canvas Interaction

### 5.1 Main Layout & Viewport
* **Top Navigation Bar**:
  * Brand: **LoveJaz** with elegant leaf/tree badge.
  * Tree Title: Click-to-edit inline (e.g., "LoveJaz - The Johnson Heritage").
  * Action Buttons:
    * `Sample Tree` (Nạp cây mẫu 3 thế hệ để trải nghiệm).
    * `New Tree` (Tạo mới).
    * `Import JSON` / `Export JSON` (Sao lưu dữ liệu).
    * `Share Link` (Sao chép link nén tức thì).
    * `Export Image` (Mở modal xuất ảnh 4K đa phong cách).
    * `Language Switcher` (Dropdown 6 thứ tiếng: EN, TL, CEB, JA, ZH, VI).
* **Interactive Canvas**:
  * Smooth Pan (drag anywhere or Space + drag) and Zoom (mouse wheel or pinch gesture, 20% to 300%).
  * Floating Toolbar:
    * Zoom in (+), Zoom out (-), Reset (100%), Fit to View (Căn giữa cân đối).
    * Undo / Redo controls.
    * Toggle Generation labels (Gen I, Gen II, Gen III axis).
    * Quick Theme toggle.

### 5.2 Smart Node Interactions
Clicking or hovering on any person node displays an elegant floating action menu:
* `+ Add Spouse`: Automatically generates an opposite-gender partner node, connected via marriage bar.
* `+ Add Child`: Automatically spawns a child in the next generation down. An instant mini-popover lets the user select Gender (Square Male or Circle Female), Name, and Birth Year.
* `+ Add Parents`: Creates a father (Square) and mother (Circle) in the generation above if not already present.
* `Edit`: Opens a smooth slide-in Drawer for complete editing:
  * Full Name
  * Gender toggle (Square / Circle)
  * Birth Year / Age
  * Deceased toggle (adds standard diagonal slash across node)
  * Notes / Title
* `Delete`: Safely removes member with confirmation.

---

## 6. Visual Themes & Export Engine

### 6.1 Four Premium Visual Themes
1. **Modern Minimalist (Tối giản hiện đại)**:
   * Crisp monochrome / slate palette, clean lines, subtle node shadows, ultra-readable typography.
2. **Royal Vintage Parchment (Phả hệ Cổ điển Hoàng gia)**:
   * Warm antique parchment textured background, sepia/ink linework, ornamental corner flourishes, serif typography (Cormorant / Playfair style).
3. **Elegant Navy & Gold (Xanh Navy Hoàng Gia)**:
   * Deep navy slate background with metallic gold accents and warm white text.
4. **Dark Studio (Chế độ tối Hiện đại)**:
   * Charcoal dark canvas with glowing high-contrast node borders and neon blue/rose accents.

### 6.2 Export Modal Features
* Preview canvas showing real-time theme rendering.
* Toggles:
  * Show/Hide Family Title & Subtitle.
  * Show/Hide Generation Axis (Gen I, Gen II, Gen III).
  * Show/Hide Pedigree Legend (■ Male, ● Female, = Marriage).
  * Show/Hide Decorative Frame.
* Resolution selector: `1x (Web)`, `2x (Retina HD)`, `4x (Ultra HD 4K Print-Ready)`.
* Output formats:
  * **PNG**: Download instant lossless image.
  * **SVG**: Download editable vector graphic.
  * **Print / PDF**: Direct browser print dialog formatted for landscape paper.

---

## 7. Internationalization (i18n) Engine

Complete dictionaries for 6 target languages:
1. **en** (English - Default)
2. **tl** (Tagalog / Filipino)
3. **ceb** (Bisaya / Cebuano)
4. **ja** (Japanese / 日本語)
5. **zh** (Chinese / 中文)
6. **vi** (Vietnamese / Tiếng Việt)

Every label, tooltip, confirmation dialog, and pedigree term is mapped through a type-safe translation registry with instant switching and `localStorage` persistence.

---

## 8. Free Global Deployment Guide (Included in App & Docs)

A built-in help guide explaining how to deploy LoveJaz globally for free:
1. **Vercel** (Recommended):
   * Push code to GitHub.
   * Connect to Vercel (1-click import).
   * Automatically deployed to `https://lovejaz.vercel.app` with free SSL and global Edge CDN.
2. **Cloudflare Pages**:
   * Connect GitHub repo, build command `npm run build`, output directory `dist`.
   * Unlimited bandwidth worldwide.
3. **GitHub Pages**:
   * Automated GitHub Action deploying `dist/` branch.

---

## 9. Verification & Acceptance Criteria

1. **Pedigree Rendering**:
   * Square = Male, Circle = Female rendered with crisp SVG paths.
   * Marriage line connects couples; children drop from central union line.
   * Generations marked as Gen I, Gen II, Gen III along the vertical axis.
   * No overlapping nodes or crossed connections.
2. **Interaction & Responsiveness**:
   * Adding spouse, child, and parents works in 1 click.
   * Pan & Zoom is smooth and responsive on both desktop and mobile.
   * Undo / Redo properly tracks additions, edits, and deletions.
3. **Export Quality**:
   * Exported PNG is crisp at 4K resolution with selected theme, border, and legend.
   * SVG export is valid XML and opens cleanly in vector editors (Figma, Illustrator).
4. **Sharing & Multilingual**:
   * URL share link loads the exact family tree on an incognito browser.
   * Switching between all 6 languages immediately updates all UI text.
