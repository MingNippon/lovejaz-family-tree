import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  Heart,
  Palette,
  Check,
  ChevronDown,
  Compass,
  Scroll,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { VisualThemeId } from '../types/theme';
import { useI18n } from '../i18n';

export interface ThemeOption {
  id: VisualThemeId;
  labelKey: string;
  defaultLabel: string;
  subtitleKey: string;
  defaultSubtitle: string;
  icon: React.ReactNode;
  bgPreview: string;
  accentPreview: string;
  hasHearts?: boolean;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'pink',
    labelKey: 'themePinkShort',
    defaultLabel: 'Romantic Pink',
    subtitleKey: 'themePinkDesc',
    defaultSubtitle: 'Romantic velvet & floating hearts',
    icon: <Heart className="w-4 h-4 text-rose-400 fill-rose-500/20" />,
    bgPreview: '#1A0714',
    accentPreview: '#F43F5E',
    hasHearts: true,
  },
  {
    id: 'dark',
    labelKey: 'themeDarkShort',
    defaultLabel: 'Dark Studio',
    subtitleKey: 'themeDarkDesc',
    defaultSubtitle: 'Charcoal studio & neon glow',
    icon: <Moon className="w-4 h-4 text-sky-400" />,
    bgPreview: '#111827',
    accentPreview: '#38BDF8',
  },
  {
    id: 'minimalist',
    labelKey: 'themeLight',
    defaultLabel: 'Clean Light',
    subtitleKey: 'themeLightDesc',
    defaultSubtitle: 'Clean, elegant & modern',
    icon: <Sun className="w-4 h-4 text-amber-500" />,
    bgPreview: '#F8FAFC',
    accentPreview: '#3B82F6',
  },
  {
    id: 'navy',
    labelKey: 'themeNavyShort',
    defaultLabel: 'Regal Navy',
    subtitleKey: 'themeNavyDesc',
    defaultSubtitle: 'Regal navy & golden accents',
    icon: <Compass className="w-4 h-4 text-amber-400" />,
    bgPreview: '#0B132B',
    accentPreview: '#D4AF37',
  },
  {
    id: 'vintage',
    labelKey: 'themeVintageShort',
    defaultLabel: 'Royal Vintage',
    subtitleKey: 'themeVintageDesc',
    defaultSubtitle: 'Antique parchment & sepia ink',
    icon: <Scroll className="w-4 h-4 text-amber-600" />,
    bgPreview: '#F5F0E6',
    accentPreview: '#52432D',
  },
];

export interface ThemeSelectorProps {
  compact?: boolean;
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  compact = false,
  className = '',
}) => {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const activeOption = THEME_OPTIONS.find((opt) => opt.id === theme) || THEME_OPTIONS[0];

  return (
    <div
      ref={dropdownRef}
      data-testid="theme-selector-container"
      className={`relative inline-block ${className}`}
    >
      <button
        type="button"
        data-testid="theme-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm ${
          theme === 'pink'
            ? 'bg-rose-950/60 text-rose-200 border-rose-500/40 hover:bg-rose-900/60 shadow-rose-950/30'
            : theme === 'minimalist'
            ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            : theme === 'navy'
            ? 'bg-[#0B132B]/80 text-amber-200 border-amber-500/40 hover:bg-[#1C2541]'
            : theme === 'vintage'
            ? 'bg-[#EFE7D8] text-[#52432D] border-[#746049]/40 hover:bg-[#EAE0CF]'
            : 'bg-slate-800/80 text-slate-200 border-slate-700/80 hover:bg-slate-700/80 hover:text-white'
        }`}
        title={`${t('theme') || 'Theme'}: ${t(activeOption.labelKey) || activeOption.defaultLabel}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="shrink-0">{activeOption.icon}</span>
        {!compact && (
          <span className="hidden sm:inline">
            {t(activeOption.labelKey) || activeOption.defaultLabel}
          </span>
        )}
        {theme === 'pink' && !compact && (
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-testid="theme-dropdown-menu"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl p-1.5 z-50 backdrop-blur-xl ${
              theme === 'pink'
                ? 'bg-[#220B1C]/95 border-rose-500/30 shadow-rose-950/80 text-rose-100'
                : theme === 'minimalist'
                ? 'bg-white/95 border-slate-200 shadow-slate-300/60 text-slate-800'
                : theme === 'navy'
                ? 'bg-[#0B132B]/95 border-amber-500/30 shadow-indigo-950/80 text-slate-100'
                : theme === 'vintage'
                ? 'bg-[#F5F0E6]/95 border-[#746049]/40 shadow-stone-900/40 text-[#382918]'
                : 'bg-slate-900/95 border-slate-700 shadow-slate-950/80 text-slate-100'
            }`}
          >
            <div className="px-3 py-1.5 mb-1 border-b border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                <Palette className="w-3 h-3" />
                {t('themeSelector') || 'Theme'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-white/10 opacity-70">
                {t('themeCountBadge') || '5 Themes'}
              </span>
            </div>

            <div className="space-y-1">
              {THEME_OPTIONS.map((opt) => {
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    data-testid={`theme-option-${opt.id}`}
                    onClick={() => {
                      setTheme(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? opt.id === 'pink'
                          ? 'bg-rose-500/25 text-rose-100 shadow-sm border border-rose-500/30'
                          : opt.id === 'minimalist'
                          ? 'bg-blue-500/15 text-blue-900 shadow-sm border border-blue-300'
                          : opt.id === 'navy'
                          ? 'bg-amber-500/20 text-amber-100 shadow-sm border border-amber-500/30'
                          : opt.id === 'vintage'
                          ? 'bg-[#DFCAA2]/50 text-[#382918] shadow-sm border border-[#746049]/30'
                          : 'bg-sky-500/20 text-sky-100 shadow-sm border border-sky-500/30'
                        : 'hover:bg-white/5 opacity-80 hover:opacity-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Color Preview Swatch */}
                      <div
                        className="w-5 h-5 rounded-full border shadow-inner flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: opt.bgPreview,
                          borderColor: opt.accentPreview,
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: opt.accentPreview }}
                        />
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">
                            {t(opt.labelKey) || opt.defaultLabel}
                          </span>
                          {opt.hasHearts && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-200 font-normal">
                              💖 {t('themeHeartsBadge') || 'Hearts'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] opacity-60 font-normal">
                          {t(opt.subtitleKey) || opt.defaultSubtitle}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 stroke-[3] text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;
