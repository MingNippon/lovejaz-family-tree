import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';
import {
  THEMES,
  minimalistTheme,
  vintageTheme,
  navyTheme,
  darkTheme,
  applyThemeToSvg,
  calculateSvgContentBounds,
} from './themes';
import {
  generateExportFilename,
  exportToSvg,
  exportToPrintPdf,
} from '../utils/export';
import { ExportModal } from '../components/ExportModal';
import { I18nProvider } from '../i18n';
import { ExportOptions, VisualThemeId } from '../types/theme';

class MockSvgElement {
  tagName: string;
  attributes: Record<string, string> = {};
  innerHTML: string = '';
  style: Record<string, string> = {};
  click = vi.fn();

  constructor(tagName = 'svg') {
    this.tagName = tagName;
  }

  setAttribute(name: string, value: string) {
    this.attributes[name] = String(value);
  }

  getAttribute(name: string) {
    return this.attributes[name] ?? null;
  }

  hasAttribute(name: string) {
    return name in this.attributes;
  }

  removeAttribute(name: string) {
    delete this.attributes[name];
  }

  get outerHTML() {
    const attrs = Object.entries(this.attributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
    const attrStr = attrs ? ` ${attrs}` : '';
    return `<${this.tagName}${attrStr}>${this.innerHTML}</${this.tagName}>`;
  }
}

// Setup lightweight DOM and browser globals if running under Node test environment
if (typeof (globalThis as any).document === 'undefined') {
  (globalThis as any).document = {
    createElementNS: (_ns: string, tag: string) => new MockSvgElement(tag),
    createElement: (tag: string) => new MockSvgElement(tag),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  };
}

if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = {
    URL: {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    },
    open: vi.fn(),
  };
}

if (typeof (globalThis as any).URL === 'undefined') {
  (globalThis as any).URL = (globalThis as any).window.URL;
}

describe('Theme Configuration Tokens', () => {
  const themeIds: VisualThemeId[] = ['minimalist', 'vintage', 'navy', 'dark'];

  it('defines all 4 heritage visual themes in THEMES dictionary', () => {
    themeIds.forEach((id) => {
      expect(THEMES[id]).toBeDefined();
      expect(THEMES[id].id).toBe(id);
    });
  });

  it('validates minimalist theme tokens', () => {
    expect(minimalistTheme.id).toBe('minimalist');
    expect(minimalistTheme.background.toUpperCase()).toBe('#FFFFFF');
    expect(minimalistTheme.nodeMaleStroke).toBe('#3B82F6');
    expect(minimalistTheme.nodeFemaleStroke).toBe('#EC4899');
    expect(minimalistTheme.fontClass).toBe('font-sans');
    expect(minimalistTheme.isDark).toBe(false);
  });

  it('validates royal vintage parchment theme tokens', () => {
    expect(vintageTheme.id).toBe('vintage');
    expect(vintageTheme.background.toUpperCase()).toBe('#F5F0E6');
    expect(vintageTheme.nodeMaleStroke.toUpperCase()).toBe('#52432D');
    expect(vintageTheme.marriageStroke.toUpperCase()).toBe('#52432D');
    expect(vintageTheme.fontClass).toBe('font-serif');
    expect(vintageTheme.isDark).toBe(false);
  });

  it('validates elegant navy & gold theme tokens', () => {
    expect(navyTheme.id).toBe('navy');
    expect(navyTheme.background.toUpperCase()).toBe('#0B132B');
    expect(navyTheme.nodeMaleStroke.toUpperCase()).toBe('#D4AF37');
    expect(navyTheme.marriageStroke.toUpperCase()).toBe('#D4AF37');
    expect(navyTheme.isDark).toBe(true);
  });

  it('validates dark studio theme tokens', () => {
    expect(darkTheme.id).toBe('dark');
    expect(darkTheme.background.toUpperCase()).toBe('#111827');
    expect(darkTheme.nodeMaleStroke).toBe('#38BDF8');
    expect(darkTheme.nodeFemaleStroke).toBe('#F43F5E');
    expect(darkTheme.fontClass).toBe('font-sans');
    expect(darkTheme.isDark).toBe(true);
  });

  it('ensures each theme specifies complete styling properties', () => {
    themeIds.forEach((id) => {
      const theme = THEMES[id];
      expect(typeof theme.name).toBe('string');
      expect(typeof theme.description).toBe('string');
      expect(typeof theme.background).toBe('string');
      expect(typeof theme.nodeMaleFill).toBe('string');
      expect(typeof theme.nodeMaleStroke).toBe('string');
      expect(typeof theme.nodeFemaleFill).toBe('string');
      expect(typeof theme.nodeFemaleStroke).toBe('string');
      expect(typeof theme.marriageStroke).toBe('string');
      expect(typeof theme.siblingStroke).toBe('string');
      expect(typeof theme.textPrimary).toBe('string');
      expect(typeof theme.textSecondary).toBe('string');
      expect(typeof theme.fontClass).toBe('string');
      expect(typeof theme.borderStyle).toBe('string');
      expect(typeof theme.isDark).toBe('boolean');
    });
  });
});

describe('applyThemeToSvg Engine', () => {
  let sampleSvg: SVGSVGElement;

  beforeEach(() => {
    sampleSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sampleSvg.setAttribute('data-testid', 'family-tree-svg');
    sampleSvg.setAttribute('data-bounds-min-x', '0');
    sampleSvg.setAttribute('data-bounds-min-y', '0');
    sampleSvg.setAttribute('data-bounds-width', '800');
    sampleSvg.setAttribute('data-bounds-height', '500');

    sampleSvg.innerHTML = `
      <g data-testid="canvas-viewport" transform="translate(10, 20) scale(1.5)">
        <g data-testid="generation-ruler">
          <line x1="0" y1="100" x2="800" y2="100" stroke="#334155" />
          <text x="20" y="90">Generation I</text>
        </g>
        <g class="marriage-lines">
          <line data-testid="marriage-line-u1" x1="100" y1="100" x2="200" y2="100" stroke="#94A3B8" />
        </g>
        <g class="sibling-branches">
          <line data-testid="stem-u1" x1="150" y1="100" x2="150" y2="180" stroke="#94A3B8" />
          <line data-testid="bar-u1" x1="100" y1="180" x2="200" y2="180" stroke="#94A3B8" />
          <circle cx="100" cy="180" r="2" fill="#94A3B8" />
        </g>
        <g class="nodes-container">
          <g data-testid="person-node-p1" class="person-node">
            <rect data-testid="selected-halo" x="94" y="94" width="84" height="84" />
            <rect data-testid="node-shape" data-gender="male" x="100" y="100" width="72" height="72" fill="#0F172A" stroke="#3B82F6" />
            <text data-testid="person-initials" x="136" y="136">JD</text>
            <text data-testid="person-name" x="136" y="192">John Doe</text>
            <text data-testid="person-dates" x="136" y="208">1980 (46y)</text>
          </g>
          <g data-testid="person-node-p2" class="person-node">
            <circle data-testid="node-shape" data-gender="female" cx="236" cy="136" r="36" fill="#0F172A" stroke="#EC4899" />
            <text data-testid="person-initials" x="236" y="136">JD</text>
            <text data-testid="person-name" x="236" y="192">Jane Doe</text>
            <text data-testid="person-dates" x="236" y="208">1982 (44y)</text>
          </g>
        </g>
      </g>
    `;
  });

  it('renders solid background matching theme color', () => {
    const options: ExportOptions = {
      theme: 'vintage',
      resolution: 1,
      format: 'svg',
      includeTitle: false,
      includeGenerations: true,
      includeLegend: false,
      includeBorder: false,
      treeTitle: 'The Heritage Family',
    };

    const result = applyThemeToSvg(sampleSvg, vintageTheme, options);
    expect(result).toContain(`fill="${vintageTheme.background}"`);
    expect(result).toContain('data-theme="vintage"');
  });

  it('applies theme node fills and strokes to male and female shapes', () => {
    const options: ExportOptions = {
      theme: 'navy',
      resolution: 2,
      format: 'png',
      includeTitle: false,
      includeGenerations: true,
      includeLegend: false,
      includeBorder: false,
      treeTitle: 'Test Navy',
    };

    const result = applyThemeToSvg(sampleSvg, navyTheme, options);
    // Male node should have navy male stroke (gold)
    expect(result).toContain(`fill="${navyTheme.nodeMaleFill}"`);
    expect(result).toContain(`stroke="${navyTheme.nodeMaleStroke}"`);
    // Female node should have navy female stroke
    expect(result).toContain(`fill="${navyTheme.nodeFemaleFill}"`);
    expect(result).toContain(`stroke="${navyTheme.nodeFemaleStroke}"`);
    // Marriage line should have navy gold stroke
    expect(result).toContain(`stroke="${navyTheme.marriageStroke}"`);
  });

  it('strips interactive elements like selected halo ring', () => {
    const options: ExportOptions = {
      theme: 'minimalist',
      resolution: 1,
      format: 'svg',
      includeTitle: false,
      includeGenerations: true,
      includeLegend: false,
      includeBorder: false,
      treeTitle: 'Clean Tree',
    };

    const result = applyThemeToSvg(sampleSvg, minimalistTheme, options);
    expect(result).not.toContain('data-testid="selected-halo"');
  });

  it('injects title banner when includeTitle is true', () => {
    const options: ExportOptions = {
      theme: 'vintage',
      resolution: 4,
      format: 'png',
      includeTitle: true,
      includeGenerations: true,
      includeLegend: false,
      includeBorder: false,
      treeTitle: 'Royal Dynasty Heritage',
      treeSubtitle: 'Eight Generations of Pedigree',
    };

    const result = applyThemeToSvg(sampleSvg, vintageTheme, options);
    expect(result).toContain('data-testid="export-title-banner"');
    expect(result).toContain('Royal Dynasty Heritage');
    expect(result).toContain('Eight Generations of Pedigree');
  });

  it('omits title banner when includeTitle is false', () => {
    const options: ExportOptions = {
      theme: 'dark',
      resolution: 1,
      format: 'svg',
      includeTitle: false,
      includeGenerations: true,
      includeLegend: false,
      includeBorder: false,
      treeTitle: 'No Title Tree',
    };

    const result = applyThemeToSvg(sampleSvg, darkTheme, options);
    expect(result).not.toContain('data-testid="export-title-banner"');
  });

  it('removes generation ruler when includeGenerations is false', () => {
    const options: ExportOptions = {
      theme: 'minimalist',
      resolution: 1,
      format: 'svg',
      includeTitle: false,
      includeGenerations: false,
      includeLegend: false,
      includeBorder: false,
      treeTitle: 'No Generations',
    };

    const result = applyThemeToSvg(sampleSvg, minimalistTheme, options);
    expect(result).not.toContain('data-testid="generation-ruler"');
  });

  it('injects pedigree legend when includeLegend is true', () => {
    const options: ExportOptions = {
      theme: 'navy',
      resolution: 4,
      format: 'png',
      includeTitle: false,
      includeGenerations: true,
      includeLegend: true,
      includeBorder: false,
      treeTitle: 'Legend Tree',
    };

    const result = applyThemeToSvg(sampleSvg, navyTheme, options);
    expect(result).toContain('data-testid="export-legend"');
    expect(result).toContain('Male');
    expect(result).toContain('Female');
    expect(result).toContain('Marriage');
  });

  it('injects decorative border frame when includeBorder is true', () => {
    const options: ExportOptions = {
      theme: 'vintage',
      resolution: 4,
      format: 'png',
      includeTitle: false,
      includeGenerations: true,
      includeLegend: false,
      includeBorder: true,
      treeTitle: 'Border Tree',
    };

    const result = applyThemeToSvg(sampleSvg, vintageTheme, options);
    expect(result).toContain('data-testid="export-decorative-border"');
  });

  it('embeds Google Fonts and typography stylesheets into <defs>', () => {
    const options: ExportOptions = {
      theme: 'vintage',
      resolution: 1,
      format: 'svg',
      includeTitle: true,
      includeGenerations: true,
      includeLegend: true,
      includeBorder: true,
      treeTitle: 'Font Embedding Test',
    };

    const result = applyThemeToSvg(sampleSvg, vintageTheme, options);
    expect(result).toContain('<defs>');
    expect(result).toContain('fonts.googleapis.com');
    expect(result).toContain('Cormorant Garamond');
  });

  it('centers content and calculates safe export viewBox dimensions', () => {
    const options: ExportOptions = {
      theme: 'minimalist',
      resolution: 1,
      format: 'svg',
      includeTitle: true,
      includeGenerations: true,
      includeLegend: true,
      includeBorder: true,
      treeTitle: 'Dimension Test',
    };

    const result = applyThemeToSvg(sampleSvg, minimalistTheme, options);
    expect(result).toContain('viewBox=');
    expect(result).toContain('width=');
    expect(result).toContain('height=');
  });
});

describe('calculateSvgContentBounds Utility', () => {
  it('prefers explicit data-bounds attributes if present', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('data-bounds-min-x', '50');
    svg.setAttribute('data-bounds-min-y', '60');
    svg.setAttribute('data-bounds-width', '500');
    svg.setAttribute('data-bounds-height', '400');

    const bounds = calculateSvgContentBounds(svg);
    expect(bounds.minX).toBe(50);
    expect(bounds.minY).toBe(60);
    expect(bounds.width).toBe(500);
    expect(bounds.height).toBe(400);
  });

  it('calculates bounds from child elements when data attributes are absent', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.innerHTML = `
      <rect data-testid="node-shape" x="100" y="150" width="72" height="72" />
      <circle data-testid="node-shape" cx="300" cy="186" r="36" />
    `;

    const bounds = calculateSvgContentBounds(svg);
    expect(bounds.minX).toBe(100);
    expect(bounds.maxX).toBeGreaterThanOrEqual(336);
    expect(bounds.minY).toBe(150);
  });
});

describe('Filename Generator (generateExportFilename)', () => {
  it('generates 4K PNG filename with 4x resolution', () => {
    const filename = generateExportFilename('Dela Cruz Family Tree', 'vintage', 'png', 4);
    expect(filename).toBe('LoveJaz-Dela-Cruz-Family-Tree-Vintage-4K.png');
  });

  it('generates 2K PNG filename with 2x resolution', () => {
    const filename = generateExportFilename('Heritage Pedigree', 'navy', 'png', 2);
    expect(filename).toBe('LoveJaz-Heritage-Pedigree-Navy-2K.png');
  });

  it('generates 1x PNG filename with 1x resolution', () => {
    const filename = generateExportFilename('Modern Family', 'minimalist', 'png', 1);
    expect(filename).toBe('LoveJaz-Modern-Family-Minimalist-1x.png');
  });

  it('generates standalone SVG vector filename', () => {
    const filename = generateExportFilename('My Heritage', 'dark', 'svg');
    expect(filename).toBe('LoveJaz-My-Heritage-Dark.svg');
  });

  it('generates PDF print filename', () => {
    const filename = generateExportFilename('Imperial Lineage', 'navy', 'pdf');
    expect(filename).toBe('LoveJaz-Imperial-Lineage-Navy.pdf');
  });

  it('sanitizes illegal characters in titles', () => {
    const filename = generateExportFilename('Doe/Smith: 100% "Love"?', 'minimalist', 'svg');
    expect(filename).not.toContain('/');
    expect(filename).not.toContain(':');
    expect(filename).not.toContain('"');
    expect(filename).not.toContain('?');
  });
});

describe('Export Functions Execution', () => {
  let sampleSvg: SVGSVGElement;

  beforeEach(() => {
    sampleSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sampleSvg.setAttribute('data-bounds-width', '600');
    sampleSvg.setAttribute('data-bounds-height', '400');
    sampleSvg.innerHTML = `
      <g data-testid="canvas-viewport">
        <rect data-testid="node-shape" data-gender="male" x="50" y="50" width="72" height="72" />
      </g>
    `;
  });

  it('exportToSvg triggers download with valid SVG XML and blob', () => {
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    const createObjectURLMock = vi.fn().mockReturnValue('blob:test-svg-url');
    const revokeObjectURLMock = vi.fn();
    (globalThis as any).URL.createObjectURL = createObjectURLMock;
    (globalThis as any).URL.revokeObjectURL = revokeObjectURLMock;
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    exportToSvg(sampleSvg, {
      theme: 'vintage',
      resolution: 1,
      format: 'svg',
      includeTitle: true,
      includeGenerations: true,
      includeLegend: true,
      includeBorder: true,
      treeTitle: 'Heritage SVG Test',
    });

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('exportToPrintPdf opens print window or landscape iframe', () => {
    const printMock = vi.fn();
    const openMock = vi.fn().mockReturnValue({
      document: {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
      },
      focus: vi.fn(),
      print: printMock,
    });
    window.open = openMock;

    exportToPrintPdf(sampleSvg, {
      theme: 'navy',
      resolution: 2,
      format: 'pdf',
      includeTitle: true,
      includeGenerations: true,
      includeLegend: true,
      includeBorder: true,
      treeTitle: 'Print PDF Test',
    });

    expect(openMock).toHaveBeenCalled();
  });
});

describe('ExportModal Component', () => {
  it('returns null when isOpen is false', () => {
    const html = renderToString(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(ExportModal, { isOpen: false, onClose: () => {} })
      )
    );
    expect(html).toBe('');
  });

  it('renders modal dialog when isOpen is true', () => {
    const html = renderToString(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(ExportModal, {
          isOpen: true,
          onClose: () => {},
          treeTitle: 'The Heritage Family',
        })
      )
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('The Heritage Family');
  });

  it('renders 4 visual theme selection cards', () => {
    const html = renderToString(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(ExportModal, { isOpen: true, onClose: () => {} })
      )
    );

    expect(html).toContain('data-theme-option="minimalist"');
    expect(html).toContain('data-theme-option="vintage"');
    expect(html).toContain('data-theme-option="navy"');
    expect(html).toContain('data-theme-option="dark"');
  });

  it('renders resolution selection options (1x, 2x, 4x)', () => {
    const html = renderToString(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(ExportModal, { isOpen: true, onClose: () => {} })
      )
    );

    expect(html).toContain('data-resolution="1"');
    expect(html).toContain('data-resolution="2"');
    expect(html).toContain('data-resolution="4"');
  });

  it('renders display option toggles (Title, Generations, Legend, Border)', () => {
    const html = renderToString(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(ExportModal, { isOpen: true, onClose: () => {} })
      )
    );

    expect(html).toContain('name="includeTitle"');
    expect(html).toContain('name="includeGenerations"');
    expect(html).toContain('name="includeLegend"');
    expect(html).toContain('name="includeBorder"');
  });

  it('renders action buttons (Download PNG, Download SVG, Print / PDF, Cancel)', () => {
    const html = renderToString(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(ExportModal, { isOpen: true, onClose: () => {} })
      )
    );

    expect(html).toContain('data-testid="export-png-btn"');
    expect(html).toContain('data-testid="export-svg-btn"');
    expect(html).toContain('data-testid="export-pdf-btn"');
    expect(html).toContain('data-testid="export-cancel-btn"');
  });

  it('renders live preview card area', () => {
    const html = renderToString(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(ExportModal, {
          isOpen: true,
          onClose: () => {},
          treeTitle: 'Preview Test',
        })
      )
    );

    expect(html).toContain('data-testid="export-preview-card"');
  });
});

