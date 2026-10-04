import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  LayoutResult,
  MarriageLine,
  SiblingBranch,
} from '../types/family';
import {
  GenerationRuler,
  romanNumeral,
  formatGenerationLabel,
} from './GenerationRuler';
import { FloatingControls } from './FloatingControls';

export { romanNumeral, formatGenerationLabel };

export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 3.0;

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasProps {
  layout: LayoutResult;
  showGenerations?: boolean;
  onToggleGenerations?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  svgRef?: React.Ref<SVGSVGElement | null>;
  className?: string;
  theme?: string;
  children?: React.ReactNode;
  transform?: CanvasTransform;
  onTransformChange?: (transform: CanvasTransform) => void;
  initialTransform?: CanvasTransform;
  autoFitOnMount?: boolean;
  minZoom?: number;
  maxZoom?: number;
}

export function clampZoom(scale: number, min = MIN_ZOOM, max = MAX_ZOOM): number {
  return Math.min(Math.max(scale, min), max);
}

export function calculateZoomAtPoint(
  current: CanvasTransform,
  focalPoint: { x: number; y: number },
  newScale: number,
  min = MIN_ZOOM,
  max = MAX_ZOOM
): CanvasTransform {
  const clampedScale = clampZoom(newScale, min, max);
  const safeCurrentScale = current.scale || 1.0;
  const worldX = (focalPoint.x - current.x) / safeCurrentScale;
  const worldY = (focalPoint.y - current.y) / safeCurrentScale;

  return {
    x: focalPoint.x - worldX * clampedScale,
    y: focalPoint.y - worldY * clampedScale,
    scale: clampedScale,
  };
}

export function calculateFitToScreen(
  bounds: LayoutResult['bounds'],
  viewport: { width: number; height: number },
  padding = 60,
  maxFitScale = 1.2,
  includeRuler = false
): CanvasTransform {
  if (!viewport.width || !viewport.height || viewport.width <= 0 || viewport.height <= 0) {
    return { x: 0, y: 0, scale: 1.0 };
  }

  // Account for generation ruler badges offset on the left (~180px) when visible
  const rulerLeftOffset = includeRuler ? 180 : 0;
  const effectiveMinX = bounds.minX - rulerLeftOffset;
  const effectiveMaxX = bounds.maxX;
  const effectiveWidth = Math.max(effectiveMaxX - effectiveMinX, 100);
  const effectiveHeight = Math.max(bounds.height, 100);

  const availW = Math.max(viewport.width - padding * 2, 50);
  const availH = Math.max(viewport.height - padding * 2, 50);

  const scale = clampZoom(Math.min(availW / effectiveWidth, availH / effectiveHeight, maxFitScale));

  const boundsCenterX = (effectiveMinX + effectiveMaxX) / 2;
  const boundsCenterY = (bounds.minY + bounds.maxY) / 2;

  const viewportCenterX = viewport.width / 2;
  const viewportCenterY = viewport.height / 2;

  const x = viewportCenterX - boundsCenterX * scale;
  const y = viewportCenterY - boundsCenterY * scale;

  return { x, y, scale };
}

export const Canvas: React.FC<CanvasProps> = ({
  layout,
  showGenerations,
  onToggleGenerations,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  svgRef,
  className,
  theme,
  children,
  transform: controlledTransform,
  onTransformChange,
  initialTransform,
  autoFitOnMount = false,
  minZoom = MIN_ZOOM,
  maxZoom = MAX_ZOOM,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const internalSvgRef = useRef<SVGSVGElement | null>(null);

  // Uncontrolled internal transform state
  const [internalTransform, setInternalTransform] = useState<CanvasTransform>(
    initialTransform || { x: 0, y: 0, scale: 1.0 }
  );

  const currentTransform = controlledTransform || internalTransform;

  // Stable refs to prevent unnecessary recreation of callbacks and effects
  const transformRef = useRef<CanvasTransform>(currentTransform);
  transformRef.current = currentTransform;

  const onTransformChangeRef = useRef(onTransformChange);
  onTransformChangeRef.current = onTransformChange;

  const controlledTransformRef = useRef(controlledTransform);
  controlledTransformRef.current = controlledTransform;

  // Stable transform updater using ref values
  const updateTransform = useCallback(
    (next: CanvasTransform | ((prev: CanvasTransform) => CanvasTransform)) => {
      const prev = transformRef.current;
      const resolved = typeof next === 'function' ? next(prev) : next;
      transformRef.current = resolved;
      if (!controlledTransformRef.current) {
        setInternalTransform(resolved);
      }
      onTransformChangeRef.current?.(resolved);
    },
    []
  );

  // Uncontrolled generation ruler visibility
  const [internalShowGen, setInternalShowGen] = useState(true);
  const isGenVisible = showGenerations !== undefined ? showGenerations : internalShowGen;
  const handleToggleGenerations = onToggleGenerations || (() => setInternalShowGen((prev) => !prev));

  // Dragging & Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; x: number; y: number; scale: number } | null>(null);
  const pinchStartRef = useRef<{ dist: number; scale: number; midX: number; midY: number } | null>(null);

  // Single-run ref guard for auto-fit on mount
  const hasAutoFittedRef = useRef(false);

  // Attach SVG ref (both internal and exposed forward ref)
  const setCombinedSvgRef = useCallback(
    (element: SVGSVGElement | null) => {
      internalSvgRef.current = element;
      if (svgRef) {
        if (typeof svgRef === 'function') {
          svgRef(element);
        } else {
          (svgRef as React.MutableRefObject<SVGSVGElement | null>).current = element;
        }
      }
    },
    [svgRef]
  );

  // Auto-fit on mount (runs strictly once when dimensions are acquired)
  useEffect(() => {
    if (autoFitOnMount && !hasAutoFittedRef.current && containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth > 0 && clientHeight > 0) {
        hasAutoFittedRef.current = true;
        const fit = calculateFitToScreen(
          layout.bounds,
          { width: clientWidth, height: clientHeight },
          60,
          1.2,
          isGenVisible
        );
        updateTransform(fit);
      }
    }
  }, [autoFitOnMount, isGenVisible, layout.bounds, updateTransform]);

  // Keyboard Space key detection for Space+Drag
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only allow left button (0) or middle button (1)
    if (e.button !== 0 && e.button !== 1) return;

    // Do not initiate drag if clicking directly on interactive UI element
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, select, [data-interactive="true"]')) {
      return;
    }

    const curr = transformRef.current;
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      x: curr.x,
      y: curr.y,
      scale: curr.scale,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;

    updateTransform(() => ({
      x: dragStartRef.current!.x + dx,
      y: dragStartRef.current!.y + dy,
      scale: dragStartRef.current!.scale,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // Wheel zoom handler with focal point centering
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const focalPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const curr = transformRef.current;
    const zoomFactor = Math.exp(-e.deltaY * 0.002);
    const targetScale = curr.scale * zoomFactor;

    const next = calculateZoomAtPoint(curr, focalPoint, targetScale, minZoom, maxZoom);
    updateTransform(next);
  };

  // Touch pan & pinch zoom handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Prevent dragging when tapping interactive UI elements on mobile
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, select, [data-interactive="true"]')) {
      return;
    }

    const curr = transformRef.current;
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        x: curr.x,
        y: curr.y,
        scale: curr.scale,
      };
      pinchStartRef.current = null;
    } else if (e.touches.length === 2 && containerRef.current) {
      setIsDragging(false);
      const rect = containerRef.current.getBoundingClientRect();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
      const midY = (t1.clientY + t2.clientY) / 2 - rect.top;

      pinchStartRef.current = {
        dist: dist || 1,
        scale: curr.scale,
        midX,
        midY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isDragging && dragStartRef.current) {
      const dx = e.touches[0].clientX - dragStartRef.current.clientX;
      const dy = e.touches[0].clientY - dragStartRef.current.clientY;
      updateTransform(() => ({
        x: dragStartRef.current!.x + dx,
        y: dragStartRef.current!.y + dy,
        scale: dragStartRef.current!.scale,
      }));
    } else if (e.touches.length === 2 && pinchStartRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = dist / pinchStartRef.current.dist;
      const newScale = pinchStartRef.current.scale * ratio;

      const curr = transformRef.current;
      const next = calculateZoomAtPoint(
        curr,
        { x: pinchStartRef.current.midX, y: pinchStartRef.current.midY },
        newScale,
        minZoom,
        maxZoom
      );
      updateTransform(next);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    dragStartRef.current = null;
    pinchStartRef.current = null;
  };

  // Button Action Handlers
  const getViewportCenter = useCallback((): { x: number; y: number } => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      return { x: clientWidth / 2, y: clientHeight / 2 };
    }
    return { x: 400, y: 300 };
  }, []);

  const handleZoomIn = () => {
    const focalPoint = getViewportCenter();
    const curr = transformRef.current;
    const next = calculateZoomAtPoint(
      curr,
      focalPoint,
      curr.scale * 1.25,
      minZoom,
      maxZoom
    );
    updateTransform(next);
  };

  const handleZoomOut = () => {
    const focalPoint = getViewportCenter();
    const curr = transformRef.current;
    const next = calculateZoomAtPoint(
      curr,
      focalPoint,
      curr.scale / 1.25,
      minZoom,
      maxZoom
    );
    updateTransform(next);
  };

  const handleResetZoom = () => {
    const focalPoint = getViewportCenter();
    const curr = transformRef.current;
    const next = calculateZoomAtPoint(curr, focalPoint, 1.0, minZoom, maxZoom);
    updateTransform(next);
  };

  const handleFitToScreen = () => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const fit = calculateFitToScreen(
        layout.bounds,
        { width: clientWidth, height: clientHeight },
        60,
        1.2,
        isGenVisible
      );
      updateTransform(fit);
    }
  };

  // Render Marriage Lines
  const renderMarriageLine = (marriage: MarriageLine) => {
    return (
      <g
        key={marriage.id}
        data-testid={`marriage-line-${marriage.id}`}
        className="marriage-line"
      >
        {/* Main horizontal line between spouses */}
        <line
          x1={marriage.x1}
          y1={marriage.y1}
          x2={marriage.x2}
          y2={marriage.y2}
          stroke="#94A3B8"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* Marriage knot indicator at midpoint */}
        <circle
          cx={marriage.midX}
          cy={marriage.midY}
          r={2.5}
          fill="#E2E8F0"
          stroke="#475569"
          strokeWidth={1}
        />
      </g>
    );
  };

  // Render Sibling Branches (stem drop, sibling bar, child drops)
  const renderSiblingBranch = (branch: SiblingBranch) => {
    return (
      <g
        key={branch.unionId}
        data-testid={`sibling-branch-${branch.unionId}`}
        className="sibling-branch"
      >
        {/* Vertical stem dropping from marriage midpoint to sibling bar */}
        <line
          data-testid={`stem-${branch.unionId}`}
          x1={branch.stemStartX}
          y1={branch.stemStartY}
          x2={branch.stemStartX}
          y2={branch.stemEndY}
          stroke="#94A3B8"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Horizontal sibling bar encompassing all children */}
        <line
          data-testid={`bar-${branch.unionId}`}
          x1={branch.barStartX}
          y1={branch.stemEndY}
          x2={branch.barEndX}
          y2={branch.stemEndY}
          stroke="#94A3B8"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Drop stems to each child node */}
        {branch.childDrops.map((drop) => (
          <g key={drop.childId} data-testid={`drop-${drop.childId}`}>
            <line
              x1={drop.topX}
              y1={drop.topY}
              x2={drop.bottomX}
              y2={drop.bottomY}
              stroke="#94A3B8"
              strokeWidth={2}
              strokeLinecap="round"
            />
            {/* Connection anchor on horizontal bar */}
            <circle
              cx={drop.topX}
              cy={drop.topY}
              r={2}
              fill="#94A3B8"
            />
          </g>
        ))}
      </g>
    );
  };

  const cursorClass = isDragging
    ? 'cursor-grabbing'
    : isSpacePressed
      ? 'cursor-grab'
      : 'cursor-default';

  return (
    <div
      ref={containerRef}
      data-testid="canvas-container"
      className={`relative w-full h-full overflow-hidden select-none bg-slate-950 ${cursorClass} ${
        className || ''
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <svg
        ref={setCombinedSvgRef}
        data-testid="family-tree-svg"
        data-bounds-min-x={layout.bounds.minX}
        data-bounds-min-y={layout.bounds.minY}
        data-bounds-max-x={layout.bounds.maxX}
        data-bounds-max-y={layout.bounds.maxY}
        data-bounds-width={layout.bounds.width}
        data-bounds-height={layout.bounds.height}
        className="w-full h-full block touch-none pointer-events-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="canvas-grid-dots"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="1" fill="rgba(148, 163, 184, 0.12)" />
          </pattern>
        </defs>

        {/* Background subtle dot grid */}
        <rect
          width="100%"
          height="100%"
          fill="url(#canvas-grid-dots)"
          pointerEvents="none"
        />

        {/* Transformed content container */}
        <g
          data-testid="canvas-viewport"
          transform={`translate(${currentTransform.x}, ${currentTransform.y}) scale(${currentTransform.scale})`}
        >
          {/* Generation Ruler Guide (optional toggle) */}
          <GenerationRuler
            generations={layout.generations}
            bounds={layout.bounds}
            visible={isGenVisible}
            theme={theme}
          />

          {/* Marriage connection lines */}
          <g data-testid="marriage-lines-group" className="marriage-lines">
            {layout.marriages.map(renderMarriageLine)}
          </g>

          {/* Sibling branch connectors */}
          <g data-testid="sibling-branches-group" className="sibling-branches">
            {layout.branches.map(renderSiblingBranch)}
          </g>

          {/* Person nodes container (children) */}
          <g data-testid="nodes-container" className="nodes-container">
            {children}
          </g>
        </g>
      </svg>

      {/* Floating Action Controls */}
      <FloatingControls
        zoom={currentTransform.scale}
        minZoom={minZoom}
        maxZoom={maxZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onFitView={handleFitToScreen}
        showGenerations={isGenVisible}
        onToggleGenerations={handleToggleGenerations}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
      />
    </div>
  );
};

export default Canvas;
