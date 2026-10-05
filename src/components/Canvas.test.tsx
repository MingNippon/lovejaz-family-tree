import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  clampZoom,
  calculateZoomAtPoint,
  calculateFitToScreen,
  formatGenerationLabel,
  Canvas,
} from './Canvas';
import { GenerationRuler } from './GenerationRuler';
import { FloatingControls } from './FloatingControls';
import { I18nProvider } from '../i18n';
import { computePedigreeLayout } from '../engine/layout';
import { getSampleFamilyTree } from '../utils/sampleData';
import { LayoutResult, GenerationTier } from '../types/family';

describe('Canvas Pan & Zoom Math Utilities', () => {
  describe('clampZoom', () => {
    it('clamps values below minimum zoom (0.2x)', () => {
      expect(clampZoom(0.1)).toBe(0.2);
      expect(clampZoom(0.0)).toBe(0.2);
      expect(clampZoom(-1.5)).toBe(0.2);
    });

    it('clamps values above maximum zoom (3.0x)', () => {
      expect(clampZoom(3.5)).toBe(3.0);
      expect(clampZoom(10.0)).toBe(3.0);
    });

    it('preserves values within zoom range [0.2, 3.0]', () => {
      expect(clampZoom(0.2)).toBe(0.2);
      expect(clampZoom(1.0)).toBe(1.0);
      expect(clampZoom(2.5)).toBe(2.5);
      expect(clampZoom(3.0)).toBe(3.0);
    });

    it('respects custom min and max zoom bounds', () => {
      expect(clampZoom(0.4, 0.5, 2.0)).toBe(0.5);
      expect(clampZoom(2.5, 0.5, 2.0)).toBe(2.0);
      expect(clampZoom(1.5, 0.5, 2.0)).toBe(1.5);
    });
  });

  describe('calculateZoomAtPoint', () => {
    it('preserves focal point world coordinates when zooming in', () => {
      const current = { x: 0, y: 0, scale: 1.0 };
      const focalPoint = { x: 300, y: 200 };
      const newScale = 2.0;

      const next = calculateZoomAtPoint(current, focalPoint, newScale);

      expect(next.scale).toBe(2.0);
      // World point at focal point before zoom: (300 - 0) / 1.0 = 300
      // Screen point after zoom: 300 * 2.0 + next.x = 600 + next.x
      // Should match focalPoint.x (300): next.x should be -300
      expect(next.x).toBe(-300);
      expect(next.y).toBe(-200);

      // Verify world coordinate invariant
      const worldXBefore = (focalPoint.x - current.x) / current.scale;
      const worldXAfter = (focalPoint.x - next.x) / next.scale;
      expect(worldXAfter).toBeCloseTo(worldXBefore);

      const worldYBefore = (focalPoint.y - current.y) / current.scale;
      const worldYAfter = (focalPoint.y - next.y) / next.scale;
      expect(worldYAfter).toBeCloseTo(worldYBefore);
    });

    it('preserves focal point world coordinates when zooming out', () => {
      const current = { x: -300, y: -200, scale: 2.0 };
      const focalPoint = { x: 300, y: 200 };
      const newScale = 1.0;

      const next = calculateZoomAtPoint(current, focalPoint, newScale);

      expect(next.scale).toBe(1.0);
      expect(next.x).toBe(0);
      expect(next.y).toBe(0);
    });

    it('clamps scale to 0.2x and 3.0x boundaries', () => {
      const current = { x: 0, y: 0, scale: 1.0 };
      const focalPoint = { x: 100, y: 100 };

      const minZoomed = calculateZoomAtPoint(current, focalPoint, 0.05);
      expect(minZoomed.scale).toBe(0.2);

      const maxZoomed = calculateZoomAtPoint(current, focalPoint, 5.0);
      expect(maxZoomed.scale).toBe(3.0);
    });
  });

  describe('calculateFitToScreen', () => {
    it('centers and scales bounds horizontally wider than viewport', () => {
      const bounds = { minX: 0, maxX: 2000, minY: 0, maxY: 600, width: 2000, height: 600 };
      const viewport = { width: 1000, height: 800 };
      const padding = 50;

      const result = calculateFitToScreen(bounds, viewport, padding);

      // Available width: 1000 - 100 = 900 -> scale = 900 / 2000 = 0.45
      // Available height: 800 - 100 = 700 -> scale = 700 / 600 = 1.166
      // Min scale should be 0.45
      expect(result.scale).toBeCloseTo(0.45, 2);

      // Center of bounds (1000, 300) should project to center of viewport (500, 400)
      const projectedCenterX = 1000 * result.scale + result.x;
      const projectedCenterY = 300 * result.scale + result.y;
      expect(projectedCenterX).toBeCloseTo(500, 1);
      expect(projectedCenterY).toBeCloseTo(400, 1);
    });

    it('centers and scales bounds vertically taller than viewport', () => {
      const bounds = { minX: 0, maxX: 600, minY: 0, maxY: 1800, width: 600, height: 1800 };
      const viewport = { width: 1000, height: 800 };
      const padding = 50;

      const result = calculateFitToScreen(bounds, viewport, padding);

      // Available height: 700 -> scale = 700 / 1800 = 0.388
      expect(result.scale).toBeCloseTo(700 / 1800, 2);

      const projectedCenterX = 300 * result.scale + result.x;
      const projectedCenterY = 900 * result.scale + result.y;
      expect(projectedCenterX).toBeCloseTo(500, 1);
      expect(projectedCenterY).toBeCloseTo(400, 1);
    });

    it('caps scale at 1.0 / maxFitScale for small trees so they do not over-expand', () => {
      const smallBounds = { minX: 100, maxX: 300, minY: 100, maxY: 300, width: 200, height: 200 };
      const largeViewport = { width: 1920, height: 1080 };

      const result = calculateFitToScreen(smallBounds, largeViewport, 60, 1.0);
      expect(result.scale).toBe(1.0);

      const projectedCenterX = 200 * result.scale + result.x;
      const projectedCenterY = 200 * result.scale + result.y;
      expect(projectedCenterX).toBeCloseTo(1920 / 2, 1);
      expect(projectedCenterY).toBeCloseTo(1080 / 2, 1);
    });

    it('accounts for ruler badge offset when includeRuler is true', () => {
      const bounds = { minX: 200, maxX: 1000, minY: 0, maxY: 600, width: 800, height: 600 };
      const viewport = { width: 1200, height: 800 };

      const withoutRuler = calculateFitToScreen(bounds, viewport, 50, 1.2, false);
      const withRuler = calculateFitToScreen(bounds, viewport, 50, 1.2, true);

      // With ruler, effectiveMinX is shifted left by 180, so the center is shifted left
      // Consequently, withRuler.x should shift right to keep the badge in view
      expect(withRuler.x).toBeGreaterThan(withoutRuler.x);

      // Left edge of the badge in screen coordinates: (bounds.minX - 180) * scale + x
      const badgeScreenX = (bounds.minX - 180) * withRuler.scale + withRuler.x;
      expect(badgeScreenX).toBeGreaterThanOrEqual(40); // Within viewport margins
    });

    it('handles zero or invalid viewport gracefully without throwing or NaN', () => {
      const bounds = { minX: 0, maxX: 500, minY: 0, maxY: 500, width: 500, height: 500 };
      const zeroViewport = { width: 0, height: 0 };

      const result = calculateFitToScreen(bounds, zeroViewport);
      expect(Number.isFinite(result.x)).toBe(true);
      expect(Number.isFinite(result.y)).toBe(true);
      expect(Number.isFinite(result.scale)).toBe(true);
    });
  });

  describe('formatGenerationLabel', () => {
    it('formats Roman numerals for generations correctly', () => {
      expect(formatGenerationLabel(0)).toBe('Generation I');
      expect(formatGenerationLabel(1)).toBe('Generation II');
      expect(formatGenerationLabel(2)).toBe('Generation III');
      expect(formatGenerationLabel(3)).toBe('Generation IV');
      expect(formatGenerationLabel(4)).toBe('Generation V');
    });

    it('supports custom translation function', () => {
      const customT = (key: string, params?: Record<string, string | number>) => {
        if (key === 'generationLabel') return `Thế hệ ${params?.num}`;
        return key;
      };
      expect(formatGenerationLabel(0, customT)).toBe('Thế hệ I');
      expect(formatGenerationLabel(2, customT)).toBe('Thế hệ III');
    });

    it('uses fallback label if translation is missing', () => {
      expect(formatGenerationLabel(0, undefined, 'Custom Tier Label')).toBe('Custom Tier Label');
    });
  });
});

describe('GenerationRuler Component', () => {
  const mockGenerations: GenerationTier[] = [
    { generation: 0, label: 'Generation I', y: 100, height: 180 },
    { generation: 1, label: 'Generation II', y: 280, height: 180 },
    { generation: 2, label: 'Generation III', y: 460, height: 180 },
  ];

  const mockBounds = { minX: 50, maxX: 850, minY: 50, maxY: 650, width: 800, height: 600 };

  it('renders generation tiers with badges, dominantBaseline central, and guide lines', () => {
    const html = renderToString(
      <svg>
        <GenerationRuler generations={mockGenerations} bounds={mockBounds} visible={true} />
      </svg>
    );

    expect(html).toContain('data-testid="generation-ruler"');
    expect(html).toContain('data-testid="generation-tier-0"');
    expect(html).toContain('data-testid="generation-tier-1"');
    expect(html).toContain('data-testid="generation-tier-2"');
    expect(html).toContain('dominant-baseline="central"');
    expect(html).toContain('Generation I');
    expect(html).toContain('Generation II');
    expect(html).toContain('Generation III');
    expect(html).toContain('line');
  });

  it('renders nothing when visible is false', () => {
    const html = renderToString(
      <svg>
        <GenerationRuler generations={mockGenerations} bounds={mockBounds} visible={false} />
      </svg>
    );

    expect(html).not.toContain('data-testid="generation-ruler"');
    expect(html).not.toContain('Generation I');
  });

  it('translates generation label when wrapped in I18nProvider', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="vi">
        <svg>
          <GenerationRuler generations={mockGenerations} bounds={mockBounds} visible={true} />
        </svg>
      </I18nProvider>
    );

    expect(html).toContain('Thế hệ I');
    expect(html).toContain('Thế hệ II');
    expect(html).toContain('Thế hệ III');
  });
});

describe('FloatingControls Component', () => {
  it('renders all toolbar buttons with tooltips and percentage', () => {
    const html = renderToString(
      <FloatingControls
        zoom={1.25}
        minZoom={0.2}
        maxZoom={3.0}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onResetZoom={vi.fn()}
        onFitView={vi.fn()}
        showGenerations={true}
        onToggleGenerations={vi.fn()}
        canUndo={true}
        canRedo={false}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="floating-controls"');
    expect(html).toContain('data-testid="zoom-in-button"');
    expect(html).toContain('data-testid="zoom-out-button"');
    expect(html).toContain('data-testid="reset-zoom-button"');
    expect(html).toContain('data-testid="fit-view-button"');
    expect(html).toContain('data-testid="toggle-generations-button"');
    expect(html).toContain('data-testid="undo-button"');
    expect(html).toContain('data-testid="redo-button"');

    // Zoom percentage text 125%
    expect(html).toContain('125%');

    // Default English tooltips
    expect(html).toContain('Zoom In');
    expect(html).toContain('Zoom Out');
    expect(html).toContain('Reset Zoom');
    expect(html).toContain('Fit to View');
    expect(html).toContain('Toggle Generations');
    expect(html).toContain('Undo');
    expect(html).toContain('Redo');
  });

  it('disables zoom in when zoom reaches maximum (3.0x)', () => {
    const html = renderToString(
      <FloatingControls
        zoom={3.0}
        minZoom={0.2}
        maxZoom={3.0}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onResetZoom={vi.fn()}
        onFitView={vi.fn()}
      />
    );

    // Zoom in button should have disabled attribute
    expect(html).toMatch(/data-testid="zoom-in-button"[^>]*\sdisabled(?:=""|(?=[\s>]))/);
    expect(html).not.toMatch(/data-testid="zoom-out-button"[^>]*\sdisabled(?:=""|(?=[\s>]))/);
  });

  it('disables zoom out when zoom reaches minimum (0.2x)', () => {
    const html = renderToString(
      <FloatingControls
        zoom={0.2}
        minZoom={0.2}
        maxZoom={3.0}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onResetZoom={vi.fn()}
        onFitView={vi.fn()}
      />
    );

    expect(html).toMatch(/data-testid="zoom-out-button"[^>]*\sdisabled(?:=""|(?=[\s>]))/);
    expect(html).not.toMatch(/data-testid="zoom-in-button"[^>]*\sdisabled(?:=""|(?=[\s>]))/);
  });

  it('disables undo and redo according to canUndo/canRedo flags', () => {
    const html = renderToString(
      <FloatingControls
        zoom={1.0}
        canUndo={false}
        canRedo={true}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onResetZoom={vi.fn()}
        onFitView={vi.fn()}
      />
    );

    expect(html).toMatch(/data-testid="undo-button"[^>]*\sdisabled(?:=""|(?=[\s>]))/);
    expect(html).not.toMatch(/data-testid="redo-button"[^>]*\sdisabled(?:=""|(?=[\s>]))/);
  });

  it('renders translated tooltips when wrapped in I18nProvider', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="ja">
        <FloatingControls
          zoom={1.0}
          onZoomIn={vi.fn()}
          onZoomOut={vi.fn()}
          onResetZoom={vi.fn()}
          onFitView={vi.fn()}
          canUndo={true}
          canRedo={true}
        />
      </I18nProvider>
    );

    expect(html).toContain('拡大'); // zoomIn
    expect(html).toContain('縮小'); // zoomOut
    expect(html).toContain('元に戻す'); // undo
    expect(html).toContain('やり直す'); // redo
  });
});

describe('Canvas Component', () => {
  const sampleTree = getSampleFamilyTree();
  const sampleLayout: LayoutResult = computePedigreeLayout(sampleTree);

  it('renders full SVG canvas with marriage lines, branches, and controls', () => {
    const html = renderToString(
      <Canvas layout={sampleLayout} showGenerations={true}>
        <g data-testid="mock-person-node">
          <text>Test Node</text>
        </g>
      </Canvas>
    );

    expect(html).toContain('data-testid="canvas-container"');
    expect(html).toContain('data-testid="family-tree-svg"');
    expect(html).toContain('data-testid="canvas-viewport"');
    expect(html).toContain('data-testid="marriage-lines-group"');
    expect(html).toContain('data-testid="sibling-branches-group"');
    expect(html).toContain('data-testid="generation-ruler"');
    expect(html).toContain('data-testid="floating-controls"');
    expect(html).toContain('data-testid="mock-person-node"');
  });

  it('renders all marriage connection lines from layout', () => {
    const html = renderToString(
      <Canvas layout={sampleLayout} />
    );

    expect(sampleLayout.marriages.length).toBeGreaterThan(0);
    sampleLayout.marriages.forEach((marriage) => {
      expect(html).toContain(`data-testid="marriage-line-${marriage.id}"`);
    });
  });

  it('renders all sibling branches with stems, bars, and child drops', () => {
    const html = renderToString(
      <Canvas layout={sampleLayout} />
    );

    expect(sampleLayout.branches.length).toBeGreaterThan(0);
    sampleLayout.branches.forEach((branch) => {
      expect(html).toContain(`data-testid="sibling-branch-${branch.unionId}"`);
      expect(html).toContain(`data-testid="stem-${branch.unionId}"`);
      expect(html).toContain(`data-testid="bar-${branch.unionId}"`);
      branch.childDrops.forEach((drop) => {
        expect(html).toContain(`data-testid="drop-${drop.childId}"`);
      });
    });
  });

  it('hides generation ruler when showGenerations is false', () => {
    const html = renderToString(
      <Canvas layout={sampleLayout} showGenerations={false} />
    );

    expect(html).not.toContain('data-testid="generation-ruler"');
  });

  it('renders with initial transform when provided', () => {
    const html = renderToString(
      <Canvas
        layout={sampleLayout}
        initialTransform={{ x: 120, y: -45, scale: 1.5 }}
      />
    );

    expect(html).toContain('transform="translate(120, -45) scale(1.5)"');
  });

  it('renders interactive drag-to-stretch widget with horizontal, vertical, and 2D handles', () => {
    const html = renderToString(
      <I18nProvider>
        <Canvas layout={sampleLayout} spacing={{ siblingGap: 100, generationHeight: 260 }} />
      </I18nProvider>
    );

    expect(html).toContain('data-testid="canvas-stretch-widget"');
    expect(html).toContain('data-testid="stretch-horizontal-handle"');
    expect(html).toContain('100px');
    expect(html).toContain('data-testid="stretch-vertical-handle"');
    expect(html).toContain('260px');
    expect(html).toContain('data-testid="stretch-2d-handle"');
    expect(html).toContain('data-testid="stretch-reset-button"');
  });

  it('renders spacing button in floating controls', () => {
    const html = renderToString(
      <I18nProvider>
        <FloatingControls
          zoom={1.0}
          onZoomIn={vi.fn()}
          onZoomOut={vi.fn()}
          onResetZoom={vi.fn()}
          onFitView={vi.fn()}
        />
      </I18nProvider>
    );

    expect(html).toContain('data-testid="spacing-button"');
  });
});

