import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Download,
  Printer,
  FileCode,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { VisualThemeId, ExportResolution, ExportOptions } from '../types/theme';
import { THEMES, applyThemeToSvg } from '../engine/themes';
import { exportToPng, exportToSvg, exportToPrintPdf } from '../utils/export';
import { useI18n } from '../i18n';
import { BorderBeam } from './motion/BorderBeam';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  svgElement?: SVGSVGElement | null;
  treeTitle?: string;
  treeSubtitle?: string;
  onExportPng?: (options: ExportOptions) => Promise<void>;
  onExportSvg?: (options: ExportOptions) => void;
  onExportPdf?: (options: ExportOptions) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  svgElement,
  treeTitle = 'LoveJaz Family Tree',
  treeSubtitle = 'Preserving Heritage Across Generations',
  onExportPng,
  onExportSvg,
  onExportPdf,
}) => {
  const { t } = useI18n();

  const [selectedTheme, setSelectedTheme] = useState<VisualThemeId>('vintage');
  const [selectedResolution, setSelectedResolution] = useState<ExportResolution>(4);
  const [includeTitle, setIncludeTitle] = useState(true);
  const [includeGenerations, setIncludeGenerations] = useState(true);
  const [includeLegend, setIncludeLegend] = useState(true);
  const [includeBorder, setIncludeBorder] = useState(true);
  const [customTitle, setCustomTitle] = useState(treeTitle);
  const [customSubtitle, setCustomSubtitle] = useState(treeSubtitle);
  const [isExportingPng, setIsExportingPng] = useState(false);

  // Sync external title props when modal opens
  useEffect(() => {
    if (isOpen) {
      setCustomTitle(treeTitle || 'LoveJaz Family Tree');
      setCustomSubtitle(treeSubtitle || 'Preserving Heritage Across Generations');
    }
  }, [isOpen, treeTitle, treeSubtitle]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const activeTheme = THEMES[selectedTheme] || THEMES.vintage;

  const exportOptions: ExportOptions = useMemo(
    () => ({
      theme: selectedTheme,
      resolution: selectedResolution,
      format: 'png',
      includeTitle,
      includeGenerations,
      includeLegend,
      includeBorder,
      treeTitle: customTitle,
      treeSubtitle: customSubtitle,
    }),
    [
      selectedTheme,
      selectedResolution,
      includeTitle,
      includeGenerations,
      includeLegend,
      includeBorder,
      customTitle,
      customSubtitle,
    ]
  );

  // Generate live SVG preview string if svgElement is present
  const liveSvgPreview = useMemo(() => {
    if (!isOpen || !svgElement) return null;
    try {
      return applyThemeToSvg(svgElement, activeTheme, exportOptions);
    } catch {
      return null;
    }
  }, [isOpen, svgElement, activeTheme, exportOptions]);

  if (!isOpen) {
    return null;
  }

  const handleDownloadPng = async () => {
    setIsExportingPng(true);
    try {
      if (onExportPng) {
        await onExportPng({ ...exportOptions, format: 'png' });
      } else if (svgElement) {
        await exportToPng(svgElement, { ...exportOptions, format: 'png' });
      }
    } catch (err) {
      console.error('PNG export failed:', err);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleDownloadSvg = () => {
    if (onExportSvg) {
      onExportSvg({ ...exportOptions, format: 'svg' });
    } else if (svgElement) {
      exportToSvg(svgElement, { ...exportOptions, format: 'svg' });
    }
  };

  const handlePrintPdf = () => {
    if (onExportPdf) {
      onExportPdf({ ...exportOptions, format: 'pdf' });
    } else if (svgElement) {
      exportToPrintPdf(svgElement, { ...exportOptions, format: 'pdf' });
    }
  };

  const themeList: { id: VisualThemeId; titleKey: string; tag: string }[] = [
    { id: 'pink', titleKey: 'themePink', tag: '💖 Romantic Rose' },
    { id: 'dark', titleKey: 'themeDark', tag: 'Charcoal Studio' },
    { id: 'minimalist', titleKey: 'themeMinimalist', tag: 'Modern Clean' },
    { id: 'navy', titleKey: 'themeNavy', tag: 'Regal Gold' },
    { id: 'vintage', titleKey: 'themeVintage', tag: 'Royal Parchment' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-dialog-title"
        data-testid="export-modal"
        className="relative w-full max-w-5xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Border beam sweep from motion-primitives */}
        <BorderBeam size={220} duration={8} colorFrom="#F59E0B" colorTo="#EC4899" />
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-sky-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="export-dialog-title"
                className="text-lg font-bold text-white tracking-tight"
              >
                {t('exportTitle') || 'Export Family Tree'}
              </h2>
              <p className="text-xs text-slate-400">
                Aesthetic 4K Ultra HD print-ready rendering & heritage themes
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="export-close-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Visual Preview */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Live Theme Preview
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                  {selectedResolution === 4
                    ? '4K Ultra HD (4x)'
                    : selectedResolution === 2
                    ? '2K Retina (2x)'
                    : 'Web 100% (1x)'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  {activeTheme.name}
                </span>
              </div>
            </div>

            {/* Live Preview Card */}
            <div
              data-testid="export-preview-card"
              className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-700/80 shadow-inner flex flex-col items-center justify-center transition-all duration-300 select-none"
              style={{ backgroundColor: activeTheme.background }}
            >
              {liveSvgPreview ? (
                <div
                  className="w-full h-full flex items-center justify-center p-2 overflow-hidden pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: liveSvgPreview }}
                />
              ) : (
                /* Pure Mock Preview when SVG is not yet mounted */
                <div
                  className={`w-full h-full p-6 flex flex-col justify-between items-center transition-colors ${
                    activeTheme.isDark ? 'text-white' : 'text-slate-900'
                  }`}
                  style={{
                    backgroundColor: activeTheme.background,
                    border: includeBorder ? activeTheme.borderStyle : 'none',
                  }}
                >
                  {/* Title Banner */}
                  {includeTitle && (
                    <div className="text-center pt-2">
                      <h3
                        className={`text-base font-bold tracking-tight ${
                          activeTheme.fontClass === 'font-serif' ? 'font-serif' : 'font-sans'
                        }`}
                        style={{ color: activeTheme.textPrimary }}
                      >
                        {customTitle}
                      </h3>
                      {customSubtitle && (
                        <p
                          className="text-[10px] tracking-widest uppercase opacity-75 mt-0.5"
                          style={{ color: activeTheme.textSecondary }}
                        >
                          {customSubtitle}
                        </p>
                      )}
                      <div
                        className="w-24 h-[1px] mx-auto mt-1.5 opacity-40"
                        style={{ backgroundColor: activeTheme.marriageStroke }}
                      />
                    </div>
                  )}

                  {/* Sample Mock Pedigree Tree Structure */}
                  <div className="flex flex-col items-center gap-3 my-auto">
                    {/* Parents Row */}
                    <div className="flex items-center gap-6">
                      {/* Male Father */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-9 h-9 rounded-md flex items-center justify-center font-bold text-xs"
                          style={{
                            backgroundColor: activeTheme.nodeMaleFill,
                            border: `2px solid ${activeTheme.nodeMaleStroke}`,
                            color: activeTheme.textPrimary,
                          }}
                        >
                          ■
                        </div>
                        <span
                          className="text-[9px] mt-1 font-medium"
                          style={{ color: activeTheme.textPrimary }}
                        >
                          Father
                        </span>
                      </div>

                      {/* Marriage Connection */}
                      <div className="flex items-center">
                        <div
                          className="w-8 h-[2px]"
                          style={{ backgroundColor: activeTheme.marriageStroke }}
                        />
                      </div>

                      {/* Female Mother */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs"
                          style={{
                            backgroundColor: activeTheme.nodeFemaleFill,
                            border: `2px solid ${activeTheme.nodeFemaleStroke}`,
                            color: activeTheme.textPrimary,
                          }}
                        >
                          ●
                        </div>
                        <span
                          className="text-[9px] mt-1 font-medium"
                          style={{ color: activeTheme.textPrimary }}
                        >
                          Mother
                        </span>
                      </div>
                    </div>

                    {/* Descendant Branch */}
                    <div
                      className="w-[2px] h-3"
                      style={{ backgroundColor: activeTheme.siblingStroke }}
                    />

                    {/* Child Node */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-9 h-9 rounded-md flex items-center justify-center font-bold text-xs"
                        style={{
                          backgroundColor: activeTheme.nodeMaleFill,
                          border: `2px solid ${activeTheme.nodeMaleStroke}`,
                          color: activeTheme.textPrimary,
                        }}
                      >
                        ■
                      </div>
                      <span
                        className="text-[9px] mt-1 font-medium"
                        style={{ color: activeTheme.textPrimary }}
                      >
                        Child
                      </span>
                    </div>
                  </div>

                  {/* Legend Footer */}
                  {includeLegend && (
                    <div
                      className="flex items-center gap-3 px-3 py-1 rounded-full text-[9px] font-medium border"
                      style={{
                        backgroundColor: activeTheme.isDark
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(0,0,0,0.04)',
                        borderColor: activeTheme.isDark
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(0,0,0,0.08)',
                        color: activeTheme.textPrimary,
                      }}
                    >
                      <span className="flex items-center gap-1">■ Male</span>
                      <span className="flex items-center gap-1">● Female</span>
                      <span className="flex items-center gap-1">= Marriage</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title & Subtitle Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  placeholder="Family Tree Title"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={customSubtitle}
                  onChange={(e) => setCustomSubtitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  placeholder="Pedigree Subtitle"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Aesthetic Controls */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {/* 1. Theme Selection */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {t('exportTheme') || 'Select Theme'}
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {themeList.map(({ id, titleKey, tag }) => {
                  const cfg = THEMES[id];
                  const isSelected = selectedTheme === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      data-theme-option={id}
                      onClick={() => setSelectedTheme(id)}
                      className={`relative p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-amber-400/80 bg-slate-800/90 ring-2 ring-amber-400/20 shadow-md'
                          : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-700'
                      }`}
                    >
                      {/* Theme Palette Bar */}
                      <div className="flex h-2 w-full rounded overflow-hidden mb-2.5 shadow-sm">
                        <div
                          className="flex-1"
                          style={{ backgroundColor: cfg.background }}
                        />
                        <div
                          className="flex-1"
                          style={{ backgroundColor: cfg.nodeMaleStroke }}
                        />
                        <div
                          className="flex-1"
                          style={{ backgroundColor: cfg.nodeFemaleStroke }}
                        />
                        <div
                          className="flex-1"
                          style={{ backgroundColor: cfg.marriageStroke }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">
                            {t(titleKey) || cfg.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {tag}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Resolution Selection */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {t('exportResolution') || 'Export Resolution'}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { res: 1, label: '1x Web', desc: 'Standard DPI' },
                    { res: 2, label: '2x Retina', desc: 'High Quality' },
                    { res: 4, label: '4x Ultra HD', desc: '4K Print Ready' },
                  ] as const
                ).map(({ res, label, desc }) => {
                  const isSelected = selectedResolution === res;
                  return (
                    <button
                      key={res}
                      type="button"
                      data-resolution={res}
                      onClick={() => setSelectedResolution(res)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-sky-400/80 bg-sky-950/40 text-sky-200 ring-2 ring-sky-400/20'
                          : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Display Options Checkboxes */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Display Options
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Include Title */}
                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/40 border border-slate-800/80 hover:bg-slate-800/70 cursor-pointer select-none text-xs text-slate-300">
                  <input
                    type="checkbox"
                    name="includeTitle"
                    checked={includeTitle}
                    onChange={(e) => setIncludeTitle(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>{t('includeTitle') || 'Include Tree Title'}</span>
                </label>

                {/* Include Generations */}
                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/40 border border-slate-800/80 hover:bg-slate-800/70 cursor-pointer select-none text-xs text-slate-300">
                  <input
                    type="checkbox"
                    name="includeGenerations"
                    checked={includeGenerations}
                    onChange={(e) => setIncludeGenerations(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>{t('includeGenerations') || 'Include Generation Axis'}</span>
                </label>

                {/* Include Legend */}
                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/40 border border-slate-800/80 hover:bg-slate-800/70 cursor-pointer select-none text-xs text-slate-300">
                  <input
                    type="checkbox"
                    name="includeLegend"
                    checked={includeLegend}
                    onChange={(e) => setIncludeLegend(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>{t('includeLegend') || 'Include Pedigree Legend'}</span>
                </label>

                {/* Include Border */}
                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/40 border border-slate-800/80 hover:bg-slate-800/70 cursor-pointer select-none text-xs text-slate-300">
                  <input
                    type="checkbox"
                    name="includeBorder"
                    checked={includeBorder}
                    onChange={(e) => setIncludeBorder(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>{t('includeBorder') || 'Include Decorative Frame'}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            data-testid="export-cancel-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {t('cancel') || 'Cancel'}
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Download SVG */}
            <button
              type="button"
              data-testid="export-svg-btn"
              onClick={handleDownloadSvg}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:border-slate-600"
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>{t('downloadSvg') || 'Download SVG'}</span>
            </button>

            {/* Print / PDF */}
            <button
              type="button"
              data-testid="export-pdf-btn"
              onClick={handlePrintPdf}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:border-slate-600"
            >
              <Printer className="w-4 h-4 text-purple-400" />
              <span>{t('printPdf') || 'Print / PDF'}</span>
            </button>

            {/* Download PNG (Primary) */}
            <button
              type="button"
              data-testid="export-png-btn"
              disabled={isExportingPng}
              onClick={handleDownloadPng}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isExportingPng ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Rendering 4K...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>
                    {selectedResolution === 4
                      ? 'Download 4K PNG'
                      : t('downloadPng') || 'Download PNG'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
