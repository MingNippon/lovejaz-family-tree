import { ThemeConfig, VisualThemeId, ExportOptions } from '../types/theme';

export const minimalistTheme: ThemeConfig = {
  id: 'minimalist',
  name: 'Minimalist Clean',
  description: 'Crisp modern look, neutral slate, clean contrast',
  background: '#FFFFFF',
  nodeMaleFill: '#EFF6FF',
  nodeMaleStroke: '#3B82F6',
  nodeFemaleFill: '#FDF2F8',
  nodeFemaleStroke: '#EC4899',
  marriageStroke: '#64748B',
  siblingStroke: '#94A3B8',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  fontClass: 'font-sans',
  borderStyle: 'solid 2px #E2E8F0',
  isDark: false,
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  accentColor: '#3B82F6',
  borderColor: '#E2E8F0',
  cardBackground: '#F8FAFC',
};

export const vintageTheme: ThemeConfig = {
  id: 'vintage',
  name: 'Royal Vintage Parchment',
  description: 'Royal antique parchment, sepia ink, serif typography, ornamental corners',
  background: '#F5F0E6',
  nodeMaleFill: '#EFE7D8',
  nodeMaleStroke: '#52432D',
  nodeFemaleFill: '#EAE0CF',
  nodeFemaleStroke: '#7A431D',
  marriageStroke: '#52432D',
  siblingStroke: '#746049',
  textPrimary: '#382918',
  textSecondary: '#6E5A44',
  fontClass: 'font-serif',
  borderStyle: 'double 4px #52432D',
  isDark: false,
  fontFamily: "'Cormorant Garamond', 'Times New Roman', Georgia, serif",
  accentColor: '#8C6239',
  borderColor: '#52432D',
  cardBackground: '#EFE6D5',
};

export const navyTheme: ThemeConfig = {
  id: 'navy',
  name: 'Elegant Navy & Gold',
  description: 'Regal midnight navy, rich metallic gold accents, crisp typography',
  background: '#0B132B',
  nodeMaleFill: '#1C2541',
  nodeMaleStroke: '#D4AF37',
  nodeFemaleFill: '#1C2541',
  nodeFemaleStroke: '#F39C12',
  marriageStroke: '#D4AF37',
  siblingStroke: '#B8972E',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  fontClass: 'font-serif',
  borderStyle: 'solid 2px #D4AF37',
  isDark: true,
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  accentColor: '#D4AF37',
  borderColor: '#D4AF37',
  cardBackground: '#1C2541',
};

export const darkTheme: ThemeConfig = {
  id: 'dark',
  name: 'Dark Studio',
  description: 'Charcoal studio, vibrant glowing nodes, high contrast',
  background: '#111827',
  nodeMaleFill: '#1F2937',
  nodeMaleStroke: '#38BDF8',
  nodeFemaleFill: '#1F2937',
  nodeFemaleStroke: '#F43F5E',
  marriageStroke: '#94A3B8',
  siblingStroke: '#64748B',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  fontClass: 'font-sans',
  borderStyle: 'solid 2px #374151',
  isDark: true,
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  accentColor: '#38BDF8',
  borderColor: '#374151',
  cardBackground: '#1F2937',
  headerBackground: '#0F172A',
  dotColor: 'rgba(148, 163, 184, 0.12)',
};

export const pinkTheme: ThemeConfig = {
  id: 'pink',
  name: 'Romantic Pink LoveJaz',
  description: 'Romantic rose velvet, glowing heart accents, floating love particles',
  background: '#180814',
  nodeMaleFill: '#290F22',
  nodeMaleStroke: '#F472B6',
  nodeFemaleFill: '#2E0B24',
  nodeFemaleStroke: '#FB7185',
  marriageStroke: '#F43F5E',
  siblingStroke: '#E11D48',
  textPrimary: '#FFF1F2',
  textSecondary: '#FDA4AF',
  fontClass: 'font-sans',
  borderStyle: 'solid 2px #FB7185',
  isDark: true,
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  accentColor: '#F43F5E',
  borderColor: '#BE185D',
  cardBackground: '#280C21',
  headerBackground: '#240A1D',
  dotColor: 'rgba(244, 63, 94, 0.22)',
};

export const THEMES: Record<VisualThemeId, ThemeConfig> = {
  minimalist: minimalistTheme,
  vintage: vintageTheme,
  navy: navyTheme,
  dark: darkTheme,
  pink: pinkTheme,
};

export interface SvgBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export function escapeXml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function unescapeXml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/**
 * Lightweight, robust SVG DOM Node implementation supporting CSS queries,
 * attribute manipulation, subtree removals, and XML serialization across both
 * browser and Node environments.
 */
export class SvgDomNode {
  tagName: string;
  attributes: Record<string, string> = {};
  children: SvgDomNode[] = [];
  parentNode: SvgDomNode | null = null;
  textContent: string = '';

  constructor(tagName: string) {
    this.tagName = tagName;
  }

  getAttribute(name: string): string | null {
    return this.attributes[name] ?? null;
  }

  setAttribute(name: string, value: string): void {
    this.attributes[name] = String(value);
  }

  hasAttribute(name: string): boolean {
    return name in this.attributes;
  }

  removeAttribute(name: string): void {
    delete this.attributes[name];
  }

  remove(): void {
    if (this.parentNode) {
      const idx = this.parentNode.children.indexOf(this);
      if (idx !== -1) {
        this.parentNode.children.splice(idx, 1);
      }
      this.parentNode = null;
    }
  }

  appendChild(child: SvgDomNode): void {
    child.remove();
    child.parentNode = this;
    this.children.push(child);
  }

  insertBefore(newChild: SvgDomNode, refChild: SvgDomNode | null): void {
    newChild.remove();
    newChild.parentNode = this;
    if (!refChild) {
      this.children.push(newChild);
      return;
    }
    const idx = this.children.indexOf(refChild);
    if (idx === -1) {
      this.children.push(newChild);
    } else {
      this.children.splice(idx, 0, newChild);
    }
  }

  cloneNode(deep = true): SvgDomNode {
    const clone = new SvgDomNode(this.tagName);
    clone.attributes = { ...this.attributes };
    clone.textContent = this.textContent;
    if (deep) {
      for (const child of this.children) {
        clone.appendChild(child.cloneNode(true));
      }
    }
    return clone;
  }

  matches(compoundSelector: string): boolean {
    const sel = compoundSelector.trim();
    if (!sel || sel === '*') return true;

    // Attribute selectors like [attr="val"] or [attr^="val"] or [attr]
    const attrRegex = /\[([a-zA-Z0-9_-]+)(?:(\^?=)"([^"]*)")?\]/g;
    let attrMatch: RegExpExecArray | null;
    let stripped = sel;

    while ((attrMatch = attrRegex.exec(sel)) !== null) {
      stripped = stripped.replace(attrMatch[0], '');
      const attrName = attrMatch[1];
      const op = attrMatch[2];
      const attrVal = attrMatch[3];
      const currentVal = this.getAttribute(attrName);
      if (currentVal === null) return false;
      if (op === '=') {
        if (currentVal !== attrVal) return false;
      } else if (op === '^=') {
        if (!currentVal.startsWith(attrVal)) return false;
      }
    }

    // Class selectors like .class-name
    const classRegex = /\.([a-zA-Z0-9_-]+)/g;
    let classMatch: RegExpExecArray | null;
    while ((classMatch = classRegex.exec(stripped)) !== null) {
      stripped = stripped.replace(classMatch[0], '');
      const className = classMatch[1];
      const elemClass = this.getAttribute('class') || '';
      const classes = elemClass.split(/\s+/);
      if (!classes.includes(className)) return false;
    }

    // Tag name match
    const tag = stripped.trim();
    if (tag && tag.toLowerCase() !== this.tagName.toLowerCase()) {
      return false;
    }

    return true;
  }

  matchesPath(parts: string[]): boolean {
    if (parts.length === 0) return false;
    const target = parts[parts.length - 1];
    if (!this.matches(target)) return false;
    if (parts.length === 1) return true;

    let currentAncestor: SvgDomNode | null = this.parentNode;
    let partIdx = parts.length - 2;

    while (currentAncestor && partIdx >= 0) {
      if (currentAncestor.matches(parts[partIdx])) {
        partIdx--;
      }
      currentAncestor = currentAncestor.parentNode;
    }

    return partIdx < 0;
  }

  querySelector(selector: string): SvgDomNode | null {
    const list = this.querySelectorAll(selector);
    return list.length > 0 ? list[0] : null;
  }

  querySelectorAll(selector: string): SvgDomNode[] {
    const results: SvgDomNode[] = [];
    const selectors = selector
      .split(',')
      .map((s) => s.trim().split(/\s+/).filter(Boolean));

    const traverse = (node: SvgDomNode) => {
      for (const selParts of selectors) {
        if (node.matchesPath(selParts)) {
          results.push(node);
          break;
        }
      }
      for (const child of node.children) {
        traverse(child);
      }
    };

    for (const child of this.children) {
      traverse(child);
    }

    return results;
  }

  toString(): string {
    const attrs = Object.entries(this.attributes)
      .map(([k, v]) => `${k}="${escapeXml(v)}"`)
      .join(' ');
    const attrStr = attrs ? ` ${attrs}` : '';

    if (this.children.length === 0 && !this.textContent) {
      const voidTags = ['line', 'rect', 'circle', 'path', 'polygon', 'ellipse'];
      if (voidTags.includes(this.tagName.toLowerCase())) {
        return `<${this.tagName}${attrStr} />`;
      }
      return `<${this.tagName}${attrStr}></${this.tagName}>`;
    }

    let inner = '';
    if (this.textContent) {
      inner += this.textContent;
    }
    for (const child of this.children) {
      inner += child.toString();
    }

    return `<${this.tagName}${attrStr}>${inner}</${this.tagName}>`;
  }
}

/**
 * Parses SVG XML into an SvgDomNode tree.
 */
export function parseSvgXml(xmlString: string): SvgDomNode {
  let xml = xmlString
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  const dummyRoot = new SvgDomNode('root');
  let current: SvgDomNode = dummyRoot;

  const tagRegex =
    /<style\b[^>]*>([\s\S]*?)<\/style>|<(\/?)([a-zA-Z0-9:_-]+)([^>]*?)(\/?)>|([^<]+)/gi;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(xml)) !== null) {
    const [fullMatch, styleContent, isClosing, tagName, attrString, isSelfClosing, textContent] =
      match;

    if (styleContent !== undefined) {
      const styleNode = new SvgDomNode('style');
      styleNode.textContent = styleContent;
      current.appendChild(styleNode);
      continue;
    }

    if (textContent !== undefined) {
      const trimmed = textContent.trim();
      if (trimmed) {
        current.textContent =
          (current.textContent ? current.textContent + ' ' : '') + unescapeXml(trimmed);
      }
      continue;
    }

    if (isClosing) {
      if (current.parentNode) {
        current = current.parentNode;
      }
      continue;
    }

    const node = new SvgDomNode(tagName);

    if (attrString) {
      const attrRegex =
        /([a-zA-Z0-9:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
      let aMatch: RegExpExecArray | null;
      while ((aMatch = attrRegex.exec(attrString)) !== null) {
        const attrName = aMatch[1];
        const attrVal = aMatch[2] ?? aMatch[3] ?? aMatch[4] ?? '';
        node.setAttribute(attrName, unescapeXml(attrVal));
      }
    }

    current.appendChild(node);

    const isVoid =
      isSelfClosing === '/' ||
      (['line', 'rect', 'circle', 'path', 'polygon', 'ellipse'].includes(
        tagName.toLowerCase()
      ) &&
        fullMatch.endsWith('/>'));

    if (!isVoid) {
      current = node;
    }
  }

  const svgNode =
    dummyRoot.children.find((c) => c.tagName.toLowerCase() === 'svg') ||
    dummyRoot.children[0];

  return svgNode || dummyRoot;
}

/**
 * Calculates or extracts bounding dimensions of the SVG tree content.
 */
export function calculateSvgContentBounds(
  svgInput: SVGSVGElement | SvgDomNode | string
): SvgBounds {
  let rootNode: SvgDomNode;

  if (typeof svgInput === 'string') {
    rootNode = parseSvgXml(svgInput);
  } else if (svgInput instanceof SvgDomNode) {
    rootNode = svgInput;
  } else {
    const raw =
      (svgInput as any).outerHTML ||
      (svgInput as any).innerHTML ||
      '';
    rootNode = parseSvgXml(raw);
  }

  // 1. Check explicit data-bounds attributes
  if (rootNode.hasAttribute('data-bounds-min-x') && rootNode.hasAttribute('data-bounds-width')) {
    const minX = parseFloat(rootNode.getAttribute('data-bounds-min-x') || '0');
    const minY = parseFloat(rootNode.getAttribute('data-bounds-min-y') || '0');
    const width = parseFloat(rootNode.getAttribute('data-bounds-width') || '800');
    const height = parseFloat(rootNode.getAttribute('data-bounds-height') || '500');
    const maxX = rootNode.hasAttribute('data-bounds-max-x')
      ? parseFloat(rootNode.getAttribute('data-bounds-max-x') || '800')
      : minX + width;
    const maxY = rootNode.hasAttribute('data-bounds-max-y')
      ? parseFloat(rootNode.getAttribute('data-bounds-max-y') || '500')
      : minY + height;
    return { minX, maxX, minY, maxY, width, height };
  }

  // 2. Scan child elements
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const elements = rootNode.querySelectorAll('rect, circle, line');
  elements.forEach((el) => {
    const testId = el.getAttribute('data-testid') || '';
    if (
      testId === 'selected-halo' ||
      testId === 'quick-action-toolbar' ||
      el.getAttribute('fill')?.includes('canvas-grid-dots') ||
      testId === 'export-decorative-border'
    ) {
      return;
    }

    const tag = el.tagName.toLowerCase();
    if (tag === 'rect') {
      const x = parseFloat(el.getAttribute('x') || '0');
      const y = parseFloat(el.getAttribute('y') || '0');
      const w = parseFloat(el.getAttribute('width') || '0');
      const h = parseFloat(el.getAttribute('height') || '0');
      if (w > 0 && h > 0 && w < 4000) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x + w);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y + h);
      }
    } else if (tag === 'circle') {
      const cx = parseFloat(el.getAttribute('cx') || '0');
      const cy = parseFloat(el.getAttribute('cy') || '0');
      const r = parseFloat(el.getAttribute('r') || '0');
      if (r > 0 && r < 1000) {
        minX = Math.min(minX, cx - r);
        maxX = Math.max(maxX, cx + r);
        minY = Math.min(minY, cy - r);
        maxY = Math.max(maxY, cy + r);
      }
    } else if (tag === 'line') {
      const x1 = parseFloat(el.getAttribute('x1') || '0');
      const y1 = parseFloat(el.getAttribute('y1') || '0');
      const x2 = parseFloat(el.getAttribute('x2') || '0');
      const y2 = parseFloat(el.getAttribute('y2') || '0');
      if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
        minX = Math.min(minX, x1, x2);
        maxX = Math.max(maxX, x1, x2);
        minY = Math.min(minY, y1, y2);
        maxY = Math.max(maxY, y1, y2);
      }
    }
  });

  if (minX === Infinity || maxX === -Infinity || minY === Infinity || maxY === -Infinity) {
    return { minX: 0, maxX: 800, minY: 0, maxY: 500, width: 800, height: 500 };
  }

  maxY += 40; // Label clearance
  const width = Math.max(maxX - minX, 100);
  const height = Math.max(maxY - minY, 100);
  return { minX, maxX, minY, maxY, width, height };
}

/**
 * Creates decorative corner flourishes for vintage and navy themes.
 */
function createCornerFlourishes(
  x: number,
  y: number,
  width: number,
  height: number,
  theme: ThemeConfig
): string {
  const strokeColor = theme.nodeMaleStroke || theme.textPrimary;
  const size = 32;

  if (theme.id === 'vintage') {
    return `
      <g class="corner-flourishes" stroke="${strokeColor}" fill="none" stroke-width="1.5" stroke-linecap="round">
        <!-- Top Left -->
        <path d="M ${x} ${y + size} L ${x} ${y + 8} Q ${x} ${y} ${x + 8} ${y} L ${x + size} ${y}" />
        <path d="M ${x + 4} ${y + size - 8} L ${x + 4} ${y + 12} Q ${x + 4} ${y + 4} ${x + 12} ${y + 4} L ${x + size - 8} ${y + 4}" stroke-width="0.8" />
        <circle cx="${x + 14}" cy="${y + 14}" r="2" fill="${strokeColor}" />

        <!-- Top Right -->
        <path d="M ${x + width - size} ${y} L ${x + width - 8} ${y} Q ${x + width} ${y} ${x + width} ${y + 8} L ${x + width} ${y + size}" />
        <path d="M ${x + width - size + 8} ${y + 4} L ${x + width - 12} ${y + 4} Q ${x + width - 4} ${y + 4} ${x + width - 4} ${y + 12} L ${x + width - 4} ${y + size - 8}" stroke-width="0.8" />
        <circle cx="${x + width - 14}" cy="${y + 14}" r="2" fill="${strokeColor}" />

        <!-- Bottom Left -->
        <path d="M ${x} ${y + height - size} L ${x} ${y + height - 8} Q ${x} ${y + height} ${x + 8} ${y + height} L ${x + size} ${y + height}" />
        <path d="M ${x + 4} ${y + height - size + 8} L ${x + 4} ${y + height - 12} Q ${x + 4} ${y + height - 4} ${x + 12} ${y + height - 4} L ${x + size - 8} ${y + height - 4}" stroke-width="0.8" />
        <circle cx="${x + 14}" cy="${y + height - 14}" r="2" fill="${strokeColor}" />

        <!-- Bottom Right -->
        <path d="M ${x + width - size} ${y + height} L ${x + width - 8} ${y + height} Q ${x + width} ${y + height} ${x + width} ${y + height - 8} L ${x + width} ${y + height - size}" />
        <path d="M ${x + width - size + 8} ${y + height - 4} L ${x + width - 12} ${y + height - 4} Q ${x + width - 4} ${y + height - 4} ${x + width - 4} ${y + height - 12} L ${x + width - 4} ${y + height - size + 8}" stroke-width="0.8" />
        <circle cx="${x + width - 14}" cy="${y + height - 14}" r="2" fill="${strokeColor}" />
      </g>
    `;
  }

  if (theme.id === 'navy') {
    return `
      <g class="corner-flourishes" stroke="#D4AF37" fill="none" stroke-width="2" stroke-linecap="square">
        <!-- Top Left -->
        <path d="M ${x} ${y + size} L ${x} ${y} L ${x + size} ${y}" />
        <polygon points="${x + 8},${y + 8} ${x + 16},${y + 8} ${x + 8},${y + 16}" fill="#D4AF37" stroke="none" />

        <!-- Top Right -->
        <path d="M ${x + width - size} ${y} L ${x + width} ${y} L ${x + width} ${y + size}" />
        <polygon points="${x + width - 8},${y + 8} ${x + width - 16},${y + 8} ${x + width - 8},${y + 16}" fill="#D4AF37" stroke="none" />

        <!-- Bottom Left -->
        <path d="M ${x} ${y + height - size} L ${x} ${y + height} L ${x + size} ${y + height}" />
        <polygon points="${x + 8},${y + height - 8} ${x + 16},${y + height - 8} ${x + 8},${y + height - 16}" fill="#D4AF37" stroke="none" />

        <!-- Bottom Right -->
        <path d="M ${x + width - size} ${y + height} L ${x + width} ${y + height} L ${x + width} ${y + height - size}" />
        <polygon points="${x + width - 8},${y + height - 8} ${x + width - 16},${y + height - 8} ${x + width - 8},${y + height - 16}" fill="#D4AF37" stroke="none" />
      </g>
    `;
  }

  return '';
}

/**
 * Creates decorative border element based on theme and canvas dimensions.
 */
function createBorderElement(
  totalWidth: number,
  totalHeight: number,
  theme: ThemeConfig
): string {
  const inset = 18;
  const width = totalWidth - inset * 2;
  const height = totalHeight - inset * 2;
  const borderColor = theme.borderColor || (theme.isDark ? '#374151' : '#E2E8F0');

  if (theme.id === 'vintage') {
    return `
      <g data-testid="export-decorative-border" class="export-decorative-border">
        <!-- Outer primary border -->
        <rect x="${inset}" y="${inset}" width="${width}" height="${height}" fill="none" stroke="${theme.nodeMaleStroke}" stroke-width="2" rx="2" />
        <!-- Inner delicate secondary border -->
        <rect x="${inset + 8}" y="${inset + 8}" width="${width - 16}" height="${height - 16}" fill="none" stroke="${theme.nodeMaleStroke}" stroke-width="0.8" stroke-dasharray="5 3" rx="2" />
        ${createCornerFlourishes(inset, inset, width, height, theme)}
      </g>
    `;
  }

  if (theme.id === 'navy') {
    return `
      <g data-testid="export-decorative-border" class="export-decorative-border">
        <!-- Outer metallic gold frame -->
        <rect x="${inset}" y="${inset}" width="${width}" height="${height}" fill="none" stroke="#D4AF37" stroke-width="2.5" />
        <!-- Inner accent frame -->
        <rect x="${inset + 6}" y="${inset + 6}" width="${width - 12}" height="${height - 12}" fill="none" stroke="#D4AF37" stroke-width="0.8" opacity="0.6" />
        ${createCornerFlourishes(inset, inset, width, height, theme)}
      </g>
    `;
  }

  if (theme.id === 'dark') {
    return `
      <g data-testid="export-decorative-border" class="export-decorative-border">
        <rect x="${inset}" y="${inset}" width="${width}" height="${height}" rx="12" fill="none" stroke="#374151" stroke-width="2" />
        <rect x="${inset + 4}" y="${inset + 4}" width="${width - 8}" height="${height - 8}" rx="8" fill="none" stroke="#1E293B" stroke-width="1" />
      </g>
    `;
  }

  if (theme.id === 'pink') {
    return `
      <g data-testid="export-decorative-border" class="export-decorative-border">
        <rect x="${inset}" y="${inset}" width="${width}" height="${height}" rx="16" fill="none" stroke="#FB7185" stroke-width="2" />
        <rect x="${inset + 5}" y="${inset + 5}" width="${width - 10}" height="${height - 10}" rx="12" fill="none" stroke="#F43F5E" stroke-width="0.8" stroke-dasharray="6 4" opacity="0.6" />
      </g>
    `;
  }

  // Minimalist clean frame
  return `
    <g data-testid="export-decorative-border" class="export-decorative-border">
      <rect x="${inset}" y="${inset}" width="${width}" height="${height}" rx="12" fill="none" stroke="${borderColor}" stroke-width="1.5" />
    </g>
  `;
}

/**
 * Creates aesthetic Title Banner at top center of exported tree.
 */
function createTitleBannerElement(
  totalWidth: number,
  y: number,
  theme: ThemeConfig,
  title: string,
  subtitle?: string
): string {
  const centerX = totalWidth / 2;
  const escapedTitle = escapeXml(title || 'LoveJaz Family Tree');
  const escapedSubtitle = escapeXml(subtitle || 'Preserved Pedigree Heritage');
  const dividerStroke = theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
  const fontFamily = theme.fontFamily || 'sans-serif';

  return `
    <g data-testid="export-title-banner" class="export-title-banner">
      <!-- Main Title -->
      <text
        x="${centerX}"
        y="${y}"
        text-anchor="middle"
        font-size="32"
        font-weight="700"
        letter-spacing="0.02em"
        fill="${theme.textPrimary}"
        style="font-family: ${fontFamily};"
      >
        ${escapedTitle}
      </text>

      <!-- Subtitle -->
      <text
        x="${centerX}"
        y="${y + 26}"
        text-anchor="middle"
        font-size="13"
        font-weight="500"
        letter-spacing="0.08em"
        fill="${theme.textSecondary}"
        style="font-family: ${fontFamily};"
      >
        ${escapedSubtitle}
      </text>

      <!-- Decorative Divider -->
      <g transform="translate(${centerX}, ${y + 40})">
        <line x1="-120" y1="0" x2="-15" y2="0" stroke="${dividerStroke}" stroke-width="1.2" stroke-linecap="round" />
        <polygon points="0,-4 4,0 0,4 -4,0" fill="${theme.marriageStroke}" />
        <line x1="15" y1="0" x2="120" y2="0" stroke="${dividerStroke}" stroke-width="1.2" stroke-linecap="round" />
      </g>
    </g>
  `;
}

/**
 * Creates standard Pedigree Legend (Male Square, Female Circle, Marriage double-line, Deceased slash).
 * Positioned safely inside the bottom decorative frame.
 */
function createLegendElement(
  totalWidth: number,
  y: number,
  theme: ThemeConfig
): string {
  const centerX = totalWidth / 2;
  const legendWidth = 520;
  const legendHeight = 36;
  const startX = centerX - legendWidth / 2;
  const fontFamily = theme.fontFamily || 'sans-serif';
  const pillBg = theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const pillBorder = theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';

  return `
    <g data-testid="export-legend" class="export-legend" transform="translate(0, ${y})">
      <!-- Container Pill -->
      <rect
        x="${startX}"
        y="0"
        width="${legendWidth}"
        height="${legendHeight}"
        rx="18"
        fill="${pillBg}"
        stroke="${pillBorder}"
        stroke-width="1"
      />

      <g transform="translate(${startX + 24}, ${legendHeight / 2})">
        <!-- Male Square -->
        <g transform="translate(0, 0)">
          <rect x="0" y="-7" width="14" height="14" rx="2" fill="${theme.nodeMaleFill}" stroke="${theme.nodeMaleStroke}" stroke-width="2" />
          <text x="22" y="4" font-size="12" font-weight="600" fill="${theme.textPrimary}" style="font-family: ${fontFamily};">Male</text>
        </g>

        <!-- Female Circle -->
        <g transform="translate(110, 0)">
          <circle cx="7" cy="0" r="7" fill="${theme.nodeFemaleFill}" stroke="${theme.nodeFemaleStroke}" stroke-width="2" />
          <text x="22" y="4" font-size="12" font-weight="600" fill="${theme.textPrimary}" style="font-family: ${fontFamily};">Female</text>
        </g>

        <!-- Marriage Double Line -->
        <g transform="translate(225, 0)">
          <line x1="0" y1="-2" x2="16" y2="-2" stroke="${theme.marriageStroke}" stroke-width="2" stroke-linecap="round" />
          <line x1="0" y1="3" x2="16" y2="3" stroke="${theme.marriageStroke}" stroke-width="2" stroke-linecap="round" />
          <text x="24" y="4" font-size="12" font-weight="600" fill="${theme.textPrimary}" style="font-family: ${fontFamily};">Marriage</text>
        </g>

        <!-- Deceased Slash -->
        <g transform="translate(355, 0)">
          <rect x="0" y="-7" width="14" height="14" rx="2" fill="${theme.isDark ? '#334155' : '#E2E8F0'}" stroke="${theme.textSecondary}" stroke-width="1" opacity="0.6" />
          <line x1="-1" y1="8" x2="15" y2="-8" stroke="#EF4444" stroke-width="2" stroke-linecap="round" />
          <text x="22" y="4" font-size="12" font-weight="600" fill="${theme.textPrimary}" style="font-family: ${fontFamily};">Deceased</text>
        </g>
      </g>
    </g>
  `;
}

/**
 * Transforms an SVG family tree element into a self-contained, aesthetic,
 * standalone SVG string styled with the chosen visual theme tokens.
 * Uses atomic DOM manipulation for reliable recoloring, element stripping,
 * and layout generation.
 */
export function applyThemeToSvg(
  svgInput: SVGSVGElement | SvgDomNode | string,
  theme: ThemeConfig,
  options: ExportOptions
): string {
  // Convert input into a working SvgDomNode tree
  let root: SvgDomNode;
  if (typeof svgInput === 'string') {
    root = parseSvgXml(svgInput);
  } else if (svgInput instanceof SvgDomNode) {
    root = svgInput.cloneNode(true);
  } else {
    const raw =
      (svgInput as any).outerHTML ||
      (svgInput as any).innerHTML ||
      '';
    root = parseSvgXml(raw);
  }

  // 1. Strip all <foreignObject> elements (QuickActionToolbar) and interactive artifacts
  const foreignObjects = root.querySelectorAll(
    'foreignObject, [data-testid="quick-action-toolbar-foreign-object"], [data-testid="quick-action-toolbar"], .quick-action-toolbar'
  );
  foreignObjects.forEach((el) => el.remove());

  const halos = root.querySelectorAll(
    '[data-testid="selected-halo"], .selected-halo'
  );
  halos.forEach((el) => el.remove());

  const floatingControls = root.querySelectorAll(
    '[data-testid="floating-controls"], .floating-controls'
  );
  floatingControls.forEach((el) => el.remove());

  // 2. Generation Ruler: Atomic removal of ruler tree, or thematic recoloring
  if (!options.includeGenerations) {
    const rulers = root.querySelectorAll(
      '[data-testid="generation-ruler"], .generation-ruler'
    );
    rulers.forEach((r) => r.remove());
  } else {
    const genLines = root.querySelectorAll(
      '[data-testid="generation-ruler"] line, .generation-ruler line'
    );
    genLines.forEach((line) => {
      line.setAttribute(
        'stroke',
        theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'
      );
    });

    const genTexts = root.querySelectorAll(
      '[data-testid="generation-ruler"] text, .generation-ruler text'
    );
    genTexts.forEach((text) => {
      text.setAttribute('fill', theme.textSecondary);
      if (theme.fontFamily) {
        text.setAttribute('font-family', theme.fontFamily);
      }
    });
  }

  // 3. Marriage Lines & Connection Knots
  // Matches lines inside .marriage-lines, [data-testid^="marriage-line-"], and .marriage-line
  const marriageLines = root.querySelectorAll(
    '.marriage-lines line, [data-testid^="marriage-line-"] line, .marriage-line line'
  );
  marriageLines.forEach((line) => {
    line.setAttribute('stroke', theme.marriageStroke);
  });

  const marriageCircles = root.querySelectorAll(
    '.marriage-lines circle, [data-testid^="marriage-line-"] circle, .marriage-line circle'
  );
  marriageCircles.forEach((circle) => {
    circle.setAttribute('stroke', theme.marriageStroke);
    circle.setAttribute('fill', theme.marriageStroke);
  });

  // 4. Sibling Branch Lines & Drops
  // Matches lines inside .sibling-branches, [data-testid^="sibling-branch-"], [data-testid^="branch-"], .sibling-branch
  const siblingLines = root.querySelectorAll(
    '.sibling-branches line, [data-testid^="sibling-branch-"] line, [data-testid^="branch-"] line, .sibling-branch line, [data-testid^="stem-"], [data-testid^="bar-"], [data-testid^="drop-"] line'
  );
  siblingLines.forEach((line) => {
    line.setAttribute('stroke', theme.siblingStroke);
  });

  const siblingDots = root.querySelectorAll(
    '.sibling-branches circle, [data-testid^="sibling-branch-"] circle, [data-testid^="branch-"] circle, .sibling-branch circle'
  );
  siblingDots.forEach((dot) => {
    dot.setAttribute('fill', theme.siblingStroke);
  });

  // 5. Male & Female Pedigree Node Shapes
  const maleShapes = root.querySelectorAll(
    '[data-gender="male"], rect[data-testid="node-shape"][data-gender="male"]'
  );
  maleShapes.forEach((shape) => {
    shape.setAttribute('fill', theme.nodeMaleFill);
    shape.setAttribute('stroke', theme.nodeMaleStroke);
  });

  const femaleShapes = root.querySelectorAll(
    '[data-gender="female"], circle[data-testid="node-shape"][data-gender="female"]'
  );
  femaleShapes.forEach((shape) => {
    shape.setAttribute('fill', theme.nodeFemaleFill);
    shape.setAttribute('stroke', theme.nodeFemaleStroke);
  });

  // 6. Node Typography & Pills
  const initialsTexts = root.querySelectorAll('[data-testid="person-initials"]');
  initialsTexts.forEach((text) => {
    text.setAttribute('fill', theme.isDark ? '#FFFFFF' : theme.textPrimary);
    if (theme.fontFamily) {
      text.setAttribute('font-family', theme.fontFamily);
    }
  });

  const nameTexts = root.querySelectorAll('[data-testid="person-name"]');
  nameTexts.forEach((text) => {
    text.setAttribute('fill', theme.textPrimary);
    if (theme.fontFamily) {
      text.setAttribute('font-family', theme.fontFamily);
    }
  });

  const dateTexts = root.querySelectorAll('[data-testid="person-dates"]');
  dateTexts.forEach((text) => {
    text.setAttribute('fill', theme.textSecondary);
    if (theme.fontFamily) {
      text.setAttribute('font-family', theme.fontFamily);
    }
  });

  const titlePills = root.querySelectorAll('[data-testid="person-title-pill"] rect');
  titlePills.forEach((r) => {
    r.setAttribute('fill', theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)');
    r.setAttribute('stroke', theme.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)');
  });

  const titlePillTexts = root.querySelectorAll('[data-testid="person-title-pill"] text');
  titlePillTexts.forEach((t) => {
    t.setAttribute('fill', theme.textSecondary);
    if (theme.fontFamily) {
      t.setAttribute('font-family', theme.fontFamily);
    }
  });

  // 7. Strip background pattern
  const gridPatterns = root.querySelectorAll(
    'pattern#canvas-grid-dots, rect[fill*="canvas-grid-dots"]'
  );
  gridPatterns.forEach((el) => el.remove());

  // 8. Calculate Bounds & Canvas Dimensions
  const bounds = calculateSvgContentBounds(root);
  const padX = 70;
  const padY = 60;
  const titleHeight = options.includeTitle ? 110 : 0;
  const legendHeight = 36;
  const legendBottomClearance = 28;
  const totalLegendSpace = options.includeLegend ? legendHeight + legendBottomClearance : 0;

  const totalWidth = Math.max(Math.round(bounds.width + padX * 2), 950);
  const totalHeight = Math.max(
    Math.round(bounds.height + padY * 2 + titleHeight + totalLegendSpace),
    650
  );

  // Position content inside canvas viewport
  const viewport = root.querySelector('[data-testid="canvas-viewport"]');
  if (viewport) {
    const targetX = Math.round((totalWidth - bounds.width) / 2 - bounds.minX);
    const targetY = Math.round(padY + titleHeight - bounds.minY);
    viewport.setAttribute('transform', `translate(${targetX}, ${targetY})`);
  }

  // 9. Root SVG Attributes
  root.setAttribute('width', String(totalWidth));
  root.setAttribute('height', String(totalHeight));
  root.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
  root.setAttribute('data-theme', theme.id);
  root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  root.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // 10. Inject Background Rect as first child
  const bgRect = new SvgDomNode('rect');
  bgRect.setAttribute('x', '0');
  bgRect.setAttribute('y', '0');
  bgRect.setAttribute('width', String(totalWidth));
  bgRect.setAttribute('height', String(totalHeight));
  bgRect.setAttribute('fill', theme.background);
  root.insertBefore(bgRect, root.children[0] || null);

  // 11. Inject Embedded CSS & Fonts in <defs>
  let defs = root.querySelector('defs');
  if (!defs) {
    defs = new SvgDomNode('defs');
    root.insertBefore(defs, root.children[1] || null);
  }

  const styleNode = new SvgDomNode('style');
  styleNode.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap');
    text {
      font-family: ${theme.fontFamily};
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .font-serif {
      font-family: 'Cormorant Garamond', Georgia, serif;
    }
    .font-sans {
      font-family: 'Inter', system-ui, sans-serif;
    }
    svg {
      background-color: ${theme.background};
    }
  `;
  defs.appendChild(styleNode);

  // 12. Inject Decorative Border
  if (options.includeBorder) {
    const borderMarkup = createBorderElement(totalWidth, totalHeight, theme);
    const borderNode = parseSvgXml(borderMarkup);
    root.appendChild(borderNode);
  }

  // 13. Inject Title Banner
  if (options.includeTitle) {
    const titleMarkup = createTitleBannerElement(
      totalWidth,
      padY + 10,
      theme,
      options.treeTitle,
      options.treeSubtitle
    );
    const titleNode = parseSvgXml(titleMarkup);
    root.appendChild(titleNode);
  }

  // 14. Inject Pedigree Legend (positioned safely inside decorative frame)
  if (options.includeLegend) {
    // Clearance: safely above the bottom decorative border
    const legendY = totalHeight - legendHeight - legendBottomClearance;
    const legendMarkup = createLegendElement(totalWidth, legendY, theme);
    const legendNode = parseSvgXml(legendMarkup);
    root.appendChild(legendNode);
  }

  return root.toString();
}
