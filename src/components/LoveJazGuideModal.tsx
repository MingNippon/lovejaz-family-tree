import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Check,
  Sparkles,
  Search,
  BookOpen,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { BorderBeam } from './motion/BorderBeam';
import {
  LOVE_JAZ_SITUATIONS,
  THE_FOUR_RULES,
} from '../data/loveJazManual';

export interface LoveJazGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoveJazGuideModal: React.FC<LoveJazGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

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

  if (!isOpen) {
    return null;
  }

  const filteredSituations = LOVE_JAZ_SITUATIONS.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.situation.toLowerCase().includes(q) ||
      item.whatToDo.toLowerCase().includes(q) ||
      item.whatNotToDo.toLowerCase().includes(q)
    );
  });

  return (
    <div
      data-testid="love-jaz-guide-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="love-jaz-guide-title"
        data-testid="love-jaz-guide-modal"
        className="relative w-full max-w-5xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-4 sm:my-6 text-slate-100 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <BorderBeam size={260} duration={8} colorFrom="#F43F5E" colorTo="#FB7185" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-900/95 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/30 via-pink-500/20 to-amber-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-sm shrink-0">
              <Heart className="w-5 h-5 fill-rose-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="love-jaz-guide-title"
                  className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2"
                >
                  <span>{t('loveJazGuideTitle') || '💖 How to Love Jaz — User Manual v1.0'}</span>
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Palomar Heritage
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('loveJazGuideDesc') || 'The 22 relationship situations & the 4 pillars of lasting love.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="love-jaz-guide-close-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar / Search Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-2.5 border-b border-slate-800 bg-slate-950/60 relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-bold">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />
              <span>{t('loveJazGuide') || 'Love Jaz Manual'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                22
              </span>
            </span>
            <span className="text-[11px] text-slate-400 hidden md:inline">
              4 Pillars • Affection, Trust, Boundaries &amp; Independence
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              data-testid="manual-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search situations or advice..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1" data-testid="love-jaz-manual-content">
          {/* Guide Intro Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-pink-950/30 to-purple-950/30 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">
                  The Palomar Compass: Built on Respect, Trust &amp; Independence
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Always choose emotional safety over winning arguments. Every situation below reminds you what to do with love 💖 and what harmful habits to avoid ❌.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>2007 — Forever</span>
              </div>
            </div>
          </div>

          {/* Situations List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Situations &amp; Solutions ({filteredSituations.length} of {LOVE_JAZ_SITUATIONS.length})
              </h4>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-rose-400 hover:text-rose-300 underline"
                >
                  Clear search
                </button>
              )}
            </div>

            {filteredSituations.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-800/30 border border-slate-700/50 text-slate-400 text-xs">
                No situations match your search query &quot;{searchQuery}&quot;. Try a different keyword!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSituations.map((item) => (
                  <div
                    key={item.id}
                    data-testid={`situation-row-${item.id}`}
                    className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/70 hover:border-slate-600 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.icon}</span>
                        <h4 className="text-sm font-bold text-white">{item.situation}</h4>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* What To Do */}
                      <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>What to do:</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed text-[11px]">
                          {item.whatToDo}
                        </p>
                      </div>

                      {/* What Not To Do */}
                      <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-rose-300">
                          <X className="w-3.5 h-3.5 text-rose-400" />
                          <span>What NOT to do:</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed text-[11px]">
                          {item.whatNotToDo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* The 4 Rules Section */}
          <div
            data-testid="the-four-rules-card"
            className="p-4 rounded-xl bg-gradient-to-tr from-slate-800/80 to-slate-800/40 border border-rose-500/30 space-y-3"
          >
            <div className="flex items-center gap-2 text-rose-400">
              <div className="p-1 rounded-md bg-rose-500/20">
                <Heart className="w-4 h-4 fill-rose-500/30" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">
                  The 4 Rules / Pillars of Lasting Love
                </h4>
                <p className="text-xs text-rose-300/80 font-mono">
                  Love = Affection + Trust + Boundaries + Independence
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {THE_FOUR_RULES.map((rule) => (
                <div
                  key={rule.key}
                  data-testid={`rule-card-${rule.key}`}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 transition-all space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="text-base">{rule.icon}</span>
                    <span>{rule.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-900/95">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Dedicated with love for Emu &amp; Jazmine (2007) • Palomar Heritage</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all"
          >
            {t('close') || 'Got It'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoveJazGuideModal;
