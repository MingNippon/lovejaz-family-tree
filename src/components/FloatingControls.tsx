import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Ruler,
  Undo2,
  Redo2,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { LayoutSpacingOptions } from '../types/family';
import {
  DEFAULT_SIBLING_GAP,
  DEFAULT_GENERATION_HEIGHT,
  DEFAULT_SPOUSE_GAP,
  DEFAULT_FAMILY_GAP,
} from '../engine/layout';
import { useTheme } from '../context/ThemeContext';
import { ThemeSelector } from './ThemeSelector';

export interface FloatingControlsProps {
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitView: () => void;
  showGenerations?: boolean;
  onToggleGenerations?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  spacing?: LayoutSpacingOptions;
  onSpacingChange?: (spacing: LayoutSpacingOptions) => void;
  className?: string;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
  zoom,
  minZoom = 0.2,
  maxZoom = 3.0,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitView,
  showGenerations = true,
  onToggleGenerations,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  spacing,
  onSpacingChange,
  className,
}) => {
  const { t } = useI18n();
  const { theme } = useTheme();
  const [isSpacingOpen, setIsSpacingOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const dockThemeClass =
    theme === 'pink'
      ? 'bg-[#280C21]/90 backdrop-blur-md border border-rose-500/40 text-rose-100 shadow-2xl shadow-rose-950/50'
      : theme === 'minimalist'
      ? 'bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 shadow-2xl shadow-slate-300/60'
      : theme === 'navy'
      ? 'bg-[#0F1C3F]/95 backdrop-blur-md border border-amber-500/30 text-amber-100 shadow-2xl shadow-indigo-950/60'
      : theme === 'vintage'
      ? 'bg-[#FAF6EE]/95 backdrop-blur-md border border-[#746049]/40 text-[#382918] shadow-2xl shadow-amber-950/20'
      : 'bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-slate-200 shadow-2xl';

  const siblingGap = spacing?.siblingGap ?? DEFAULT_SIBLING_GAP;
  const generationHeight = spacing?.generationHeight ?? DEFAULT_GENERATION_HEIGHT;

  const isMinZoom = zoom <= minZoom + 0.001;
  const isMaxZoom = zoom >= maxZoom - 0.001;
  const zoomPercent = Math.round(zoom * 100);

  // Close popover when clicking outside
  useEffect(() => {
    if (!isSpacingOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsSpacingOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSpacingOpen]);

  const handleSiblingGapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSib = Number(e.target.value);
    const newSpouse = Math.round(newSib * (80 / 90));
    const newFamily = Math.round(newSib * (110 / 90));
    onSpacingChange?.({
      ...spacing,
      siblingGap: newSib,
      spouseGap: newSpouse,
      familyGap: newFamily,
      generationHeight,
    });
  };

  const handleGenHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = Number(e.target.value);
    onSpacingChange?.({
      ...spacing,
      generationHeight: newHeight,
    });
  };

  const handlePreset = (type: 'compact' | 'standard' | 'spacious') => {
    if (type === 'compact') {
      onSpacingChange?.({
        siblingGap: 60,
        spouseGap: 55,
        familyGap: 75,
        generationHeight: 200,
      });
    } else if (type === 'standard') {
      onSpacingChange?.({
        siblingGap: DEFAULT_SIBLING_GAP,
        spouseGap: DEFAULT_SPOUSE_GAP,
        familyGap: DEFAULT_FAMILY_GAP,
        generationHeight: DEFAULT_GENERATION_HEIGHT,
      });
    } else if (type === 'spacious') {
      onSpacingChange?.({
        siblingGap: 140,
        spouseGap: 110,
        familyGap: 160,
        generationHeight: 320,
      });
    }
  };

  const handleResetSpacing = () => {
    onSpacingChange?.({
      siblingGap: DEFAULT_SIBLING_GAP,
      spouseGap: DEFAULT_SPOUSE_GAP,
      familyGap: DEFAULT_FAMILY_GAP,
      generationHeight: DEFAULT_GENERATION_HEIGHT,
    });
  };

  const baseButtonClass =
    'relative flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 active:scale-95 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:active:scale-100';

  return (
    <div
      ref={popoverRef}
      data-testid="floating-controls-container"
      className="relative"
    >
      {/* Spacing Adjust Popover */}
      {isSpacingOpen && (
        <div
          data-testid="spacing-popover"
          className="absolute bottom-14 right-0 z-40 w-72 p-4 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl text-slate-200 select-none animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t('adjustSpacing')}</span>
            </div>
            <button
              type="button"
              data-testid="reset-spacing-button"
              onClick={handleResetSpacing}
              title={t('resetSpacing')}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('resetSpacing')}</span>
            </button>
          </div>

          {/* Horizontal Spacing Slider */}
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">{t('horizontalSpacing')}</span>
              <span className="font-mono text-rose-400">{siblingGap}px</span>
            </div>
            <input
              type="range"
              min={40}
              max={220}
              step={5}
              value={siblingGap}
              onChange={handleSiblingGapChange}
              data-testid="horizontal-spacing-slider"
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>40px</span>
              <span>220px</span>
            </div>
          </div>

          {/* Vertical Generation Height Slider */}
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">{t('verticalSpacing')}</span>
              <span className="font-mono text-rose-400">{generationHeight}px</span>
            </div>
            <input
              type="range"
              min={180}
              max={380}
              step={10}
              value={generationHeight}
              onChange={handleGenHeightChange}
              data-testid="vertical-spacing-slider"
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>180px</span>
              <span>380px</span>
            </div>
          </div>

          {/* Presets */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5">
            <button
              type="button"
              data-testid="preset-compact-button"
              onClick={() => handlePreset('compact')}
              className="flex-1 py-1 px-2 text-[11px] font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {t('compactSpacing')}
            </button>
            <button
              type="button"
              data-testid="preset-standard-button"
              onClick={() => handlePreset('standard')}
              className="flex-1 py-1 px-2 text-[11px] font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {t('defaultSpacing')}
            </button>
            <button
              type="button"
              data-testid="preset-spacious-button"
              onClick={() => handlePreset('spacious')}
              className="flex-1 py-1 px-2 text-[11px] font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center justify-center gap-1"
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              {t('spaciousSpacing')}
            </button>
          </div>
        </div>
      )}

      {/* Floating Toolbar Bar */}
      <div
        data-testid="floating-controls"
        className={
          className ||
          `flex items-center gap-1.5 p-1.5 rounded-2xl select-none transition-colors duration-300 ${dockThemeClass}`
        }
      >
        {/* Undo / Redo controls */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            data-testid="undo-button"
            title={t('undo')}
            aria-label={t('undo')}
            disabled={!canUndo || !onUndo}
            onClick={onUndo}
            className={baseButtonClass}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            data-testid="redo-button"
            title={t('redo')}
            aria-label={t('redo')}
            disabled={!canRedo || !onRedo}
            onClick={onRedo}
            className={baseButtonClass}
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-700/60 mx-0.5" />

        {/* Zoom controls: Zoom Out, Percentage/Reset, Zoom In */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            data-testid="zoom-out-button"
            title={t('zoomOut')}
            aria-label={t('zoomOut')}
            disabled={isMinZoom}
            onClick={onZoomOut}
            className={baseButtonClass}
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            data-testid="reset-zoom-button"
            title={t('resetZoom')}
            aria-label={t('resetZoom')}
            onClick={onResetZoom}
            className="px-2.5 py-1 text-xs font-semibold font-mono tracking-tight text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
          >
            {`${zoomPercent}%`}
          </button>

          <button
            type="button"
            data-testid="zoom-in-button"
            title={t('zoomIn')}
            aria-label={t('zoomIn')}
            disabled={isMaxZoom}
            onClick={onZoomIn}
            className={baseButtonClass}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-700/60 mx-0.5" />

        {/* Viewport & Spacing helpers: Spacing, Fit to View, Toggle Generations */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            data-testid="spacing-button"
            title={t('adjustSpacing')}
            aria-label={t('adjustSpacing')}
            onClick={() => setIsSpacingOpen((prev) => !prev)}
            className={`${baseButtonClass} ${
              isSpacingOpen
                ? 'text-rose-400 bg-rose-500/15 hover:bg-rose-500/25 hover:text-rose-300'
                : ''
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            type="button"
            data-testid="fit-view-button"
            title={t('fitView')}
            aria-label={t('fitView')}
            onClick={onFitView}
            className={baseButtonClass}
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            data-testid="toggle-generations-button"
            title={t('toggleGenerations')}
            aria-label={t('toggleGenerations')}
            onClick={onToggleGenerations}
            className={`${baseButtonClass} ${
              showGenerations
                ? 'text-rose-400 bg-rose-500/15 hover:bg-rose-500/25 hover:text-rose-300'
                : 'text-slate-400 opacity-60'
            }`}
          >
            <Ruler className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-700/60 mx-0.5" />

        {/* Quick Theme Selector Button */}
        <ThemeSelector compact />
      </div>
    </div>
  );
};
