import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Ruler,
  Undo2,
  Redo2,
} from 'lucide-react';
import { useI18n } from '../i18n';

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
  className,
}) => {
  const { t } = useI18n();

  const isMinZoom = zoom <= minZoom + 0.001;
  const isMaxZoom = zoom >= maxZoom - 0.001;
  const zoomPercent = Math.round(zoom * 100);

  const baseButtonClass =
    'relative flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 active:scale-95 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:active:scale-100';

  return (
    <div
      data-testid="floating-controls"
      className={
        className ||
        'absolute bottom-6 right-6 z-30 flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl text-slate-200 select-none'
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

      {/* Viewport & Guide helpers: Fit to View, Toggle Generations */}
      <div className="flex items-center gap-0.5">
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
    </div>
  );
};
