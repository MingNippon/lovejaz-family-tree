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
};

export const THEMES: Record<VisualThemeId, ThemeConfig> = {
  minimalist: minimalistTheme,
  vintage: vintageTheme,
  navy: navyTheme,
  dark: darkTheme,
};

export interface SvgBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Calculates or extracts bounding dimensions of the SVG tree content.
 * Supports SVGSVGElement as well as serialized SVG strings.
 */
export function calculateSvgContentBounds(svg: SVGSVGElement | string): SvgBounds {
  const isString = typeof svg === 'string';
  const rawSvg = isString
    ? svg
    : (svg as any).outerHTML || (svg as any).innerHTML || '';

  // 1. Check explicit data-bounds attributes
  if (
    !isString &&
    typeof (svg as any).hasAttribute === 'function' &&
    (svg as any).hasAttribute('data-bounds-min-x') &&
    (svg as any).hasAttribute('data-bounds-width')
  ) {
    const minX = parseFloat((svg as any).getAttribute('data-bounds-min-x') || '0');
    const minY = parseFloat((svg as any).getAttribute('data-bounds-min-y') || '0');
    const width = parseFloat((svg as any).getAttribute('data-bounds-width') || '800');
    const height = parseFloat((svg as any).getAttribute('data-bounds-height') || '500');
    const maxX = (svg as any).hasAttribute('data-bounds-max-x')
      ? parseFloat((svg as any).getAttribute('data-bounds-max-x') || '800')
      : minX + width;
    const maxY = (svg as any).hasAttribute('data-bounds-max-y')
      ? parseFloat((svg as any).getAttribute('data-bounds-max-y') || '500')
      : minY + height;
    return { minX, maxX, minY, maxY, width, height };
  }

  const minXMatch = rawSvg.match(/data-bounds-min-x="([^"]+)"/);
  const widthMatch = rawSvg.match(/data-bounds-width="([^"]+)"/);
  const minYMatch = rawSvg.match(/data-bounds-min-y="([^"]+)"/);
  const heightMatch = rawSvg.match(/data-bounds-height="([^"]+)"/);

  if (minXMatch && widthMatch) {
    const minX = parseFloat(minXMatch[1]);
    const width = parseFloat(widthMatch[1]);
    const minY = minYMatch ? parseFloat(minYMatch[1]) : 0;
    const height = heightMatch ? parseFloat(heightMatch[1]) : 500;
    return { minX, maxX: minX + width, minY, maxY: minY + height, width, height };
  }

  // 2. Scan child element coordinates in case data attributes are not attached
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const rectRegex = /<rect\b([^>]+)>/gi;
  let rMatch: RegExpExecArray | null;
  while ((rMatch = rectRegex.exec(rawSvg)) !== null) {
    const attrs = rMatch[1];
    if (
      attrs.includes('selected-halo') ||
      attrs.includes('canvas-grid-dots') ||
      attrs.includes('export-decorative-border')
    ) {
      continue;
    }
    const xM = attrs.match(/\bx="([^"]+)"/);
    const yM = attrs.match(/\by="([^"]+)"/);
    const wM = attrs.match(/\bwidth="([^"]+)"/);
    const hM = attrs.match(/\bheight="([^"]+)"/);
    if (xM && yM && wM && hM) {
      const x = parseFloat(xM[1]);
      const y = parseFloat(yM[1]);
      const w = parseFloat(wM[1]);
      const h = parseFloat(hM[1]);
      if (!isNaN(x) && !isNaN(y) && !isNaN(w) && !isNaN(h) && w > 0 && h > 0 && w < 4000) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x + w);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y + h);
      }
    }
  }

  const circleRegex = /<circle\b([^>]+)>/gi;
  let cMatch: RegExpExecArray | null;
  while ((cMatch = circleRegex.exec(rawSvg)) !== null) {
    const attrs = cMatch[1];
    if (attrs.includes('selected-halo')) continue;
    const cxM = attrs.match(/\bcx="([^"]+)"/);
    const cyM = attrs.match(/\bcy="([^"]+)"/);
    const rM = attrs.match(/\br="([^"]+)"/);
    if (cxM && cyM && rM) {
      const cx = parseFloat(cxM[1]);
      const cy = parseFloat(cyM[1]);
      const r = parseFloat(rM[1]);
      if (!isNaN(cx) && !isNaN(cy) && !isNaN(r) && r > 0 && r < 1000) {
        minX = Math.min(minX, cx - r);
        maxX = Math.max(maxX, cx + r);
        minY = Math.min(minY, cy - r);
        maxY = Math.max(maxY, cy + r);
      }
    }
  }

  const lineRegex = /<line\b([^>]+)>/gi;
  let lMatch: RegExpExecArray | null;
  while ((lMatch = lineRegex.exec(rawSvg)) !== null) {
    const attrs = lMatch[1];
    const x1M = attrs.match(/\bx1="([^"]+)"/);
    const y1M = attrs.match(/\by1="([^"]+)"/);
    const x2M = attrs.match(/\bx2="([^"]+)"/);
    const y2M = attrs.match(/\by2="([^"]+)"/);
    if (x1M && y1M && x2M && y2M) {
      const x1 = parseFloat(x1M[1]);
      const y1 = parseFloat(y1M[1]);
      const x2 = parseFloat(x2M[1]);
      const y2 = parseFloat(y2M[1]);
      if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
        minX = Math.min(minX, x1, x2);
        maxX = Math.max(maxX, x1, x2);
        minY = Math.min(minY, y1, y2);
        maxY = Math.max(maxY, y1, y2);
      }
    }
  }

  if (minX === Infinity || maxX === -Infinity || minY === Infinity || maxY === -Infinity) {
    return { minX: 0, maxX: 800, minY: 0, maxY: 500, width: 800, height: 500 };
  }

  // Extra padding for person label text
  maxY += 40;

  const width = Math.max(maxX - minX, 100);
  const height = Math.max(maxY - minY, 100);
  return { minX, maxX, minY, maxY, width, height };
}

function escapeXml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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
 */
export function applyThemeToSvg(
  svgInput: SVGSVGElement | string,
  theme: ThemeConfig,
  options: ExportOptions
): string {
  let svgString =
    typeof svgInput === 'string'
      ? svgInput
      : (svgInput as any).outerHTML ||
        ((svgInput as any).innerHTML ? `<svg>${(svgInput as any).innerHTML}</svg>` : '');

  // 1. Remove interactive UI controls and highlights
  svgString = svgString.replace(
    /<rect\b[^>]*\bdata-testid="selected-halo"[^>]*\/?>/gi,
    ''
  );
  svgString = svgString.replace(
    /<circle\b[^>]*\bdata-testid="selected-halo"[^>]*\/?>/gi,
    ''
  );
  svgString = svgString.replace(
    /<g\b[^>]*\bdata-testid="quick-action-toolbar"[\s\S]*?<\/g>/gi,
    ''
  );
  svgString = svgString.replace(
    /<g\b[^>]*\bclass="[^"]*quick-action-toolbar[^"]*"[\s\S]*?<\/g>/gi,
    ''
  );
  svgString = svgString.replace(
    /<div\b[^>]*\bdata-testid="floating-controls"[\s\S]*?<\/div>/gi,
    ''
  );

  // 2. Generation ruler inclusion/exclusion
  if (!options.includeGenerations) {
    svgString = svgString.replace(
      /<g\b[^>]*\bdata-testid="generation-ruler"[\s\S]*?<\/g>/gi,
      ''
    );
    svgString = svgString.replace(
      /<g\b[^>]*\bclass="[^"]*generation-ruler[^"]*"[\s\S]*?<\/g>/gi,
      ''
    );
  } else {
    // Style generation guide lines and text
    svgString = svgString.replace(
      /(<g\b[^>]*\bdata-testid="generation-ruler"[\s\S]*?<\/g>)/gi,
      (genBlock: string) => {
        let updated = genBlock.replace(
          /(<line\b[^>]*?\bstroke=")[^"]*(")/gi,
          `$1${theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}$2`
        );
        updated = updated.replace(
          /(<text\b[^>]*?\bfill=")[^"]*(")/gi,
          `$1${theme.textSecondary}$2`
        );
        return updated;
      }
    );
  }

  // 3. Apply theme styling to node shapes
  // Male shapes
  svgString = svgString.replace(
    /(<rect\b[^>]*\bdata-gender="male"[^>]*?)(\/?>)/gi,
    (_match: string, p1: string, p2: string) => {
      let updated = p1;
      if (/\bfill="[^"]*"/.test(updated)) {
        updated = updated.replace(/\bfill="[^"]*"/, `fill="${theme.nodeMaleFill}"`);
      } else {
        updated += ` fill="${theme.nodeMaleFill}"`;
      }
      if (/\bstroke="[^"]*"/.test(updated)) {
        updated = updated.replace(/\bstroke="[^"]*"/, `stroke="${theme.nodeMaleStroke}"`);
      } else {
        updated += ` stroke="${theme.nodeMaleStroke}"`;
      }
      return updated + p2;
    }
  );

  // Female shapes
  svgString = svgString.replace(
    /(<circle\b[^>]*\bdata-gender="female"[^>]*?)(\/?>)/gi,
    (_match: string, p1: string, p2: string) => {
      let updated = p1;
      if (/\bfill="[^"]*"/.test(updated)) {
        updated = updated.replace(/\bfill="[^"]*"/, `fill="${theme.nodeFemaleFill}"`);
      } else {
        updated += ` fill="${theme.nodeFemaleFill}"`;
      }
      if (/\bstroke="[^"]*"/.test(updated)) {
        updated = updated.replace(/\bstroke="[^"]*"/, `stroke="${theme.nodeFemaleStroke}"`);
      } else {
        updated += ` stroke="${theme.nodeFemaleStroke}"`;
      }
      return updated + p2;
    }
  );

  // 4. Style node typography
  svgString = svgString.replace(
    /(<text\b[^>]*\bdata-testid="person-initials"[^>]*?)(\/?>)/gi,
    (_match: string, p1: string, p2: string) => {
      const fill = theme.isDark ? '#FFFFFF' : theme.textPrimary;
      let updated = p1;
      if (/\bfill="[^"]*"/.test(updated)) {
        updated = updated.replace(/\bfill="[^"]*"/, `fill="${fill}"`);
      } else {
        updated += ` fill="${fill}"`;
      }
      return updated + p2;
    }
  );

  svgString = svgString.replace(
    /(<text\b[^>]*\bdata-testid="person-name"[^>]*?)(\/?>)/gi,
    (_match: string, p1: string, p2: string) => {
      let updated = p1;
      if (/\bfill="[^"]*"/.test(updated)) {
        updated = updated.replace(/\bfill="[^"]*"/, `fill="${theme.textPrimary}"`);
      } else {
        updated += ` fill="${theme.textPrimary}"`;
      }
      return updated + p2;
    }
  );

  svgString = svgString.replace(
    /(<text\b[^>]*\bdata-testid="person-dates"[^>]*?)(\/?>)/gi,
    (_match: string, p1: string, p2: string) => {
      let updated = p1;
      if (/\bfill="[^"]*"/.test(updated)) {
        updated = updated.replace(/\bfill="[^"]*"/, `fill="${theme.textSecondary}"`);
      } else {
        updated += ` fill="${theme.textSecondary}"`;
      }
      return updated + p2;
    }
  );

  // 5. Marriage lines
  svgString = svgString.replace(
    /(<line\b[^>]*\bdata-testid="marriage-line-[^"]*"[^>]*?)(\/?>)/gi,
    (_match: string, p1: string, p2: string) => {
      let updated = p1;
      if (/\bstroke="[^"]*"/.test(updated)) {
        updated = updated.replace(/\bstroke="[^"]*"/, `stroke="${theme.marriageStroke}"`);
      } else {
        updated += ` stroke="${theme.marriageStroke}"`;
      }
      return updated + p2;
    }
  );

  // 6. Sibling branch lines and dots
  svgString = svgString.replace(
    /(<line\b[^>]*\bdata-testid="(?:stem|bar|drop)-[^"]*"[^>]*?)(\/?>)/gi,
    (_match: string, p1: string, p2: string) => {
      let updated = p1;
      if (/\bstroke="[^"]*"/.test(updated)) {
        updated = updated.replace(/\bstroke="[^"]*"/, `stroke="${theme.siblingStroke}"`);
      } else {
        updated += ` stroke="${theme.siblingStroke}"`;
      }
      return updated + p2;
    }
  );

  svgString = svgString.replace(
    /(<circle\b[^>]*\br="2"[^>]*?)(\/?>)/gi,
    (_match: string, p1: string, p2: string) => {
      let updated = p1;
      if (/\bfill="[^"]*"/.test(updated)) {
        updated = updated.replace(/\bfill="[^"]*"/, `fill="${theme.siblingStroke}"`);
      } else {
        updated += ` fill="${theme.siblingStroke}"`;
      }
      return updated + p2;
    }
  );

  // 7. Remove existing dot pattern & rect
  svgString = svgString.replace(
    /<pattern\b[^>]*\bid="canvas-grid-dots"[\s\S]*?<\/pattern>/gi,
    ''
  );
  svgString = svgString.replace(
    /<rect\b[^>]*\bfill="url\(#canvas-grid-dots\)"[^>]*\/?>/gi,
    ''
  );

  // 8. Calculate content bounds and dimensions
  const bounds = calculateSvgContentBounds(svgInput);
  const padX = 70;
  const padY = 60;
  const titleHeight = options.includeTitle ? 110 : 0;
  const legendHeight = options.includeLegend ? 64 : 0;

  const totalWidth = Math.max(Math.round(bounds.width + padX * 2), 950);
  const totalHeight = Math.max(
    Math.round(bounds.height + padY * 2 + titleHeight + legendHeight),
    650
  );

  // Position content inside viewport
  const targetX = Math.round((totalWidth - bounds.width) / 2 - bounds.minX);
  const targetY = Math.round(padY + titleHeight - bounds.minY);

  svgString = svgString.replace(
    /(<g\b[^>]*\bdata-testid="canvas-viewport"[^>]*?)\btransform="[^"]*"/gi,
    `$1transform="translate(${targetX}, ${targetY})"`
  );

  // 9. Style defs & embedded fonts
  const fontDefs = `
    <defs>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&amp;family=Inter:wght@400;500;600;700&amp;display=swap');
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
      </style>
    </defs>
  `;

  const bgRect = `<rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="${theme.background}" />`;

  // Inject fontDefs and bgRect right after opening <svg ...>
  svgString = svgString.replace(/<svg\b([^>]*)>/i, (_match: string, attrs: string) => {
    let cleanAttrs = attrs
      .replace(/\bwidth="[^"]*"/gi, '')
      .replace(/\bheight="[^"]*"/gi, '')
      .replace(/\bviewBox="[^"]*"/gi, '')
      .replace(/\bdata-theme="[^"]*"/gi, '');

    if (!cleanAttrs.includes('xmlns=')) {
      cleanAttrs += ' xmlns="http://www.w3.org/2000/svg"';
    }

    return `<svg width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" data-theme="${theme.id}" ${cleanAttrs}>\n${bgRect}\n${fontDefs}`;
  });

  // Construct extra decor elements
  const decorElements: string[] = [];

  if (options.includeBorder) {
    decorElements.push(createBorderElement(totalWidth, totalHeight, theme));
  }

  if (options.includeTitle) {
    decorElements.push(
      createTitleBannerElement(
        totalWidth,
        padY + 10,
        theme,
        options.treeTitle,
        options.treeSubtitle
      )
    );
  }

  if (options.includeLegend) {
    decorElements.push(
      createLegendElement(totalWidth, totalHeight - padY + 10, theme)
    );
  }

  if (decorElements.length > 0) {
    svgString = svgString.replace('</svg>', `${decorElements.join('\n')}\n</svg>`);
  }

  return svgString;
}
