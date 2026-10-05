import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Globe,
  Rocket,
  Check,
  Copy,
  ShieldCheck,
  Zap,
  Server,
  Cloud,
  Layers,
  Sparkles,
  Search,
  BookOpen,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { motion } from 'motion/react';
import { BorderBeam } from './motion/BorderBeam';
import {
  LOVE_JAZ_SITUATIONS,
  THE_FOUR_RULES,
} from '../data/loveJazManual';
import {
  DEPLOY_PROVIDERS,
  DeployTabId,
} from './DeployGuideModal';

export type MainGuideTab = 'manual' | 'deploy';

export interface LoveJazGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: MainGuideTab;
  initialDeployTab?: DeployTabId;
}

export const LoveJazGuideModal: React.FC<LoveJazGuideModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'manual',
  initialDeployTab = 'vercel',
}) => {
  const { t } = useI18n();
  const [activeMainTab, setActiveMainTab] = useState<MainGuideTab>(initialTab);
  const [activeDeployTab, setActiveDeployTab] = useState<DeployTabId>(initialDeployTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedDeployIdx, setCopiedDeployIdx] = useState<number | null>(null);

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveMainTab(initialTab);
      setActiveDeployTab(initialDeployTab);
      setSearchQuery('');
      setCopiedDeployIdx(null);
    }
  }, [isOpen, initialTab, initialDeployTab]);

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

  const handleCopyCommand = async (command: string, index: number) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(command);
      } else if (typeof document !== 'undefined') {
        const textArea = document.createElement('textarea');
        textArea.value = command;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedDeployIdx(index);
      setTimeout(() => setCopiedDeployIdx(null), 2500);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  };

  const filteredSituations = LOVE_JAZ_SITUATIONS.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.situation.toLowerCase().includes(q) ||
      item.whatToDo.toLowerCase().includes(q) ||
      item.whatNotToDo.toLowerCase().includes(q)
    );
  });

  const activeProvider = DEPLOY_PROVIDERS[activeDeployTab] || DEPLOY_PROVIDERS.vercel;

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
                The 22 relationship situations & the 4 pillars of lasting love, plus zero-cost deployment.
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

        {/* Primary Navigation Tabs */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-2.5 border-b border-slate-800 bg-slate-950/60 relative z-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="guide-tab-manual"
              onClick={() => setActiveMainTab('manual')}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeMainTab === 'manual'
                  ? 'text-rose-200'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {activeMainTab === 'manual' && (
                <motion.span
                  layoutId="guide-main-tab-pill"
                  className="absolute inset-0 rounded-xl bg-rose-500/20 border border-rose-500/40 shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>{t('userManualTab') || '💖 How to Love Jaz (Manual v1.0)'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-200 font-mono">
                  22
                </span>
              </span>
            </button>

            <button
              type="button"
              data-testid="guide-tab-deploy"
              onClick={() => setActiveMainTab('deploy')}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeMainTab === 'deploy'
                  ? 'text-sky-200'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {activeMainTab === 'deploy' && (
                <motion.span
                  layoutId="guide-main-tab-pill"
                  className="absolute inset-0 rounded-xl bg-sky-500/20 border border-sky-500/40 shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>{t('deployGuideTab') || '🚀 Free Global Deployment'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 font-mono">
                  $0
                </span>
              </span>
            </button>
          </div>

          {activeMainTab === 'manual' && (
            <div className="relative hidden sm:block w-52 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                data-testid="manual-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search situations or tips..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeMainTab === 'manual' ? (
            /* TAB 1: LOVE JAZ USER MANUAL */
            <div className="space-y-6" data-testid="love-jaz-manual-content">
              {/* Mobile Search */}
              <div className="sm:hidden relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search situations or tips..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Guide Intro Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-pink-950/30 to-purple-950/30 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-bold text-white">
                      The Palomar Compass: Built on Respect, Trust & Independence
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Always choose emotional safety over winning arguments. Every situation below reminds you what to do with love 💖 and what harmful habits to avoid ❌.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
                    {filteredSituations.length} of {LOVE_JAZ_SITUATIONS.length} Situations
                  </span>
                </div>
              </div>

              {/* 22 Situations Table / Grid */}
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/40">
                {/* Desktop Table Header */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-slate-900/80 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <div className="col-span-3 flex items-center gap-1.5 text-amber-300">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Situation</span>
                  </div>
                  <div className="col-span-5 flex items-center gap-1.5 text-emerald-300">
                    <Heart className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-400" />
                    <span>What to do 💖</span>
                  </div>
                  <div className="col-span-4 flex items-center gap-1.5 text-rose-300">
                    <X className="w-3.5 h-3.5 text-rose-400 stroke-[3]" />
                    <span>What NOT to do ❌</span>
                  </div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-800/80">
                  {filteredSituations.map((item, idx) => (
                    <div
                      key={item.id}
                      data-testid={`situation-row-${item.id}`}
                      className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Situation Column */}
                      <div className="md:col-span-3 mb-2 md:mb-0 flex items-center gap-2">
                        <span className="text-lg shrink-0">{item.icon}</span>
                        <div>
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            {item.situation}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            #{idx + 1}
                          </span>
                        </div>
                      </div>

                      {/* What to do Column */}
                      <div className="md:col-span-5 mb-2 md:mb-0 p-2.5 md:p-0 rounded-lg bg-emerald-950/20 md:bg-transparent border border-emerald-900/30 md:border-transparent">
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold shrink-0 text-xs md:hidden">
                            💖 Làm gì:
                          </span>
                          <p className="text-xs text-emerald-200/90 leading-relaxed font-medium">
                            {item.whatToDo}
                          </p>
                        </div>
                      </div>

                      {/* What NOT to do Column */}
                      <div className="md:col-span-4 p-2.5 md:p-0 rounded-lg bg-rose-950/20 md:bg-transparent border border-rose-900/30 md:border-transparent">
                        <div className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold shrink-0 text-xs md:hidden">
                            ❌ Tránh:
                          </span>
                          <p className="text-xs text-rose-200/90 leading-relaxed font-medium">
                            {item.whatNotToDo}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredSituations.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No situations matched &quot;{searchQuery}&quot;. Try another search term!
                    </div>
                  )}
                </div>
              </div>

              {/* The 4 Rules Section */}
              <div
                data-testid="the-four-rules-card"
                className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900 border border-rose-500/30 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
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
          ) : (
            /* TAB 2: FREE GLOBAL DEPLOYMENT GUIDE */
            <div className="space-y-6" data-testid="deploy-guide-content">
              {/* Provider Sub-Tabs */}
              <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800">
                {(
                  [
                    { id: 'vercel', label: 'Vercel', badge: 'Recommended', testId: 'deploy-tab-vercel' },
                    { id: 'cloudflare', label: 'Cloudflare Pages', badge: 'Unlimited Bandwidth', testId: 'deploy-tab-cloudflare' },
                    { id: 'github', label: 'GitHub Pages', badge: 'Pure Git', testId: 'deploy-tab-github' },
                    { id: 'customDomain', label: 'Custom Domain & Zero-Cost', badge: '$0 Forever', testId: 'deploy-tab-custom-domain' },
                  ] as const
                ).map((tab) => {
                  const isSelected = activeDeployTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      data-testid={tab.testId}
                      onClick={() => setActiveDeployTab(tab.id)}
                      className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'text-sky-200'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      {isSelected && (
                        <motion.span
                          layoutId="guide-deploy-subtab-pill"
                          className="absolute inset-0 rounded-xl bg-sky-500/20 border border-sky-500/40 shadow-sm"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <span>{tab.label}</span>
                        {tab.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                              isSelected
                                ? 'bg-sky-400/30 text-sky-100'
                                : 'bg-slate-700/60 text-slate-400'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Provider Overview Card */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-bold text-white">{activeProvider.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {activeProvider.description}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Zero Server Costs</span>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  Step-by-Step Walkthrough
                </h4>

                <div className="space-y-3">
                  {activeProvider.steps.map((step, idx) => (
                    <div
                      key={step.stepNumber}
                      className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 hover:border-slate-700/70 transition-all space-y-2"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {step.stepNumber}
                        </span>
                        <div className="flex-1 space-y-1">
                          <h5 className="text-xs font-bold text-white">{step.title}</h5>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {step.command && (
                        <div
                          data-testid="deploy-code-block"
                          className="relative mt-2 ml-9 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs text-sky-300"
                        >
                          <pre className="p-3 overflow-x-auto text-[11px] leading-5 whitespace-pre">
                            {step.command}
                          </pre>
                          <button
                            type="button"
                            data-testid="deploy-copy-btn"
                            onClick={() => handleCopyCommand(step.command!, idx)}
                            className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-sans font-semibold text-slate-200 border border-slate-700 transition-colors shadow-sm"
                            aria-label="Copy command snippet"
                          >
                            {copiedDeployIdx === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                                <span className="text-emerald-300">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Zero-Cost Technical Architecture Breakdown */}
              <div
                data-testid="zero-cost-breakdown"
                className="p-4 rounded-xl bg-gradient-to-r from-sky-950/30 via-slate-900 to-indigo-950/30 border border-sky-900/40 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Why LoveJaz Is 100% Free Forever
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                      <Server className="w-3.5 h-3.5" />
                      <span>No Database Hosting</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      All family records are compressed directly into URL hashes and client localStorage. No costly PostgreSQL or MongoDB instances to pay for.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300">
                      <Cloud className="w-3.5 h-3.5" />
                      <span>Static Global CDN</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Pure static HTML, JS, and SVG assets are cached globally across 300+ edge locations with unlimited free bandwidth on Vercel and Cloudflare.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Zero Maintenance</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      No server patching, no database migrations, no monthly subscription renewals. Share your tree with confidence for decades to come.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-900/95">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Dedicated with love for Emu & Jazmine (2007) • Palomar Heritage</span>
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
