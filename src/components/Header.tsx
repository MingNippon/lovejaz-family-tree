import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Upload,
  Download,
  Share2,
  Image as ImageIcon,
  Globe,
  ChevronDown,
  Check,
  BookOpen,
} from 'lucide-react';
import { FamilyTreeData } from '../types/family';
import { useI18n } from '../i18n';
import { downloadTreeAsJson, parseTreeFromJson } from '../utils/storage';

export interface HeaderProps {
  tree?: FamilyTreeData;
  title?: string;
  subtitle?: string;
  onTitleChange?: (title: string) => void;
  onSubtitleChange?: (subtitle: string) => void;
  onLoadSampleTree?: () => void;
  onNewTree?: () => void;
  onImportJson?: (tree: FamilyTreeData) => void;
  onExportJson?: () => void;
  onOpenShare?: () => void;
  onOpenExport?: () => void;
  onOpenDeployGuide?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  tree,
  title: propTitle,
  subtitle: propSubtitle,
  onTitleChange,
  onSubtitleChange,
  onLoadSampleTree,
  onNewTree,
  onImportJson,
  onExportJson,
  onOpenShare,
  onOpenExport,
  onOpenDeployGuide,
  className = '',
}) => {
  const { currentLanguage, setLanguage, t, LANGUAGES } = useI18n();

  const [currentTitle, setCurrentTitle] = useState<string>(
    propTitle ?? tree?.title ?? 'My Family Pedigree'
  );
  const [currentSubtitle, setCurrentSubtitle] = useState<string>(
    propSubtitle ?? tree?.subtitle ?? 'Heritage & Line of Descent'
  );
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const langDropdownRef = useRef<HTMLDivElement | null>(null);

  // Sync title and subtitle with external props
  useEffect(() => {
    if (propTitle !== undefined) {
      setCurrentTitle(propTitle);
    } else if (tree?.title !== undefined) {
      setCurrentTitle(tree.title);
    }
  }, [propTitle, tree?.title]);

  useEffect(() => {
    if (propSubtitle !== undefined) {
      setCurrentSubtitle(propSubtitle);
    } else if (tree?.subtitle !== undefined) {
      setCurrentSubtitle(tree.subtitle);
    }
  }, [propSubtitle, tree?.subtitle]);

  // Handle outside click for language dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentTitle(val);
    if (onTitleChange) {
      onTitleChange(val);
    }
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentSubtitle(val);
    if (onSubtitleChange) {
      onSubtitleChange(val);
    }
  };

  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseTreeFromJson(content);
        if (onImportJson) {
          onImportJson(parsed);
        }
      } catch (err) {
        console.error('Failed to import JSON file:', err);
      } finally {
        if (e.target) {
          e.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleExportJsonClick = () => {
    if (onExportJson) {
      onExportJson();
    } else if (tree) {
      downloadTreeAsJson(tree);
    }
  };

  const activeLanguageInfo =
    LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <header
      role="banner"
      data-testid="header-container"
      className={`w-full bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-2.5 select-none shadow-md ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Section: Brand & Editable Title */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Brand Logo & Name */}
          <div
            data-testid="header-brand"
            className="flex items-center gap-2.5 shrink-0 group cursor-pointer"
          >
            {/* Pedigree Emblem */}
            <div
              data-testid="header-tree-logo"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500/20 via-pink-500/10 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-sm transition-transform group-hover:scale-105"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-rose-400"
              >
                {/* Stylized Family Pedigree Tree: trunk, roots, branch connecting male square and female circle */}
                <path d="M12 22v-7" />
                <path d="M12 15c-3 0-6-2-6-5V7" />
                <path d="M12 15c3 0 6-2 6-5V7" />
                {/* Male Square */}
                <rect x="4" y="3" width="4" height="4" rx="0.5" fill="currentColor" fillOpacity="0.2" />
                {/* Female Circle */}
                <circle cx="18" cy="5" r="2" fill="currentColor" fillOpacity="0.2" />
                {/* Central Love Heart Node */}
                <path d="M12 9c-1-1.5-2.5-1-2.5.5 0 1.5 2.5 3 2.5 3s2.5-1.5 2.5-3c0-1.5-1.5-2-2.5-.5z" fill="currentColor" />
              </svg>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-rose-400 via-pink-300 to-amber-200 bg-clip-text text-transparent">
                  LoveJaz
                </span>
                <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60 hidden sm:inline-block">
                  Pedigree
                </span>
              </div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />

          {/* Editable Title & Subtitle */}
          <div className="flex flex-col min-w-0">
            <input
              type="text"
              data-testid="header-title-input"
              value={currentTitle}
              onChange={handleTitleChange}
              className="text-xs sm:text-sm font-bold text-white bg-transparent border border-transparent hover:border-slate-700/80 focus:border-sky-500 rounded px-1.5 py-0.5 outline-none transition-all max-w-[170px] sm:max-w-[240px] md:max-w-[320px] truncate"
              placeholder="Family Tree Title"
              title="Click to edit tree title"
            />
            <input
              type="text"
              data-testid="header-subtitle-input"
              value={currentSubtitle}
              onChange={handleSubtitleChange}
              className="text-[10px] sm:text-[11px] text-slate-400 bg-transparent border border-transparent hover:border-slate-700/80 focus:border-sky-500 rounded px-1.5 py-0.2 outline-none transition-all max-w-[170px] sm:max-w-[240px] md:max-w-[320px] truncate"
              placeholder="Preserve your heritage across generations"
              title="Click to edit subtitle"
            />
          </div>
        </div>

        {/* Right Section: Action Buttons & Language Dropdown */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Sample Tree */}
          <button
            type="button"
            data-testid="header-sample-tree-btn"
            onClick={onLoadSampleTree}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/70 transition-all shadow-sm"
            title="Load curated 3-generation sample pedigree tree"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">{t('sampleTree') || 'Sample Tree'}</span>
          </button>

          {/* New Tree */}
          <button
            type="button"
            data-testid="header-new-tree-btn"
            onClick={onNewTree}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/70 transition-all shadow-sm"
            title="Create clean new pedigree tree"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">{t('newTree') || 'New Tree'}</span>
          </button>

          {/* Import JSON */}
          <button
            type="button"
            data-testid="header-import-json-btn"
            onClick={handleTriggerImport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/70 transition-all shadow-sm"
            title="Import tree from JSON backup"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden xl:inline">{t('uploadJson') || 'Import'}</span>
          </button>

          {/* Hidden JSON file input */}
          <input
            ref={fileInputRef}
            type="file"
            data-testid="header-file-input"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Export JSON */}
          <button
            type="button"
            data-testid="header-export-json-btn"
            onClick={handleExportJsonClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/70 transition-all shadow-sm"
            title="Download JSON backup"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline">{t('downloadJson') || 'Backup'}</span>
          </button>

          {/* Share Link */}
          <button
            type="button"
            data-testid="header-share-btn"
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-md shadow-sky-600/20 transition-all"
            title="Share interactive family tree link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t('shareLink') || 'Share'}</span>
          </button>

          {/* Export 4K Image */}
          <button
            type="button"
            data-testid="header-export-image-btn"
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 shadow-md shadow-amber-600/20 transition-all"
            title="Export 4K Ultra HD pedigree artwork"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{t('exportImage') || 'Export'}</span>
          </button>

          {/* Free Deploy Guide */}
          <button
            type="button"
            data-testid="header-deploy-guide-btn"
            onClick={onOpenDeployGuide}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 transition-all"
            title="100% Free Forever deployment guide (Vercel, Cloudflare, GitHub)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">{t('deployGuide') || 'Deploy'}</span>
          </button>

          {/* 6-Language Dropdown Switcher */}
          <div
            ref={langDropdownRef}
            data-testid="header-language-selector"
            className="relative"
          >
            <button
              type="button"
              data-testid="header-language-btn"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/70 transition-all"
              aria-label="Select language"
              aria-expanded={isLangDropdownOpen}
            >
              <span className="text-sm leading-none">{activeLanguageInfo.flag}</span>
              <span className="hidden sm:inline text-xs">{activeLanguageInfo.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isLangDropdownOpen && (
              <div
                data-testid="header-language-dropdown"
                className="absolute right-0 mt-1.5 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden z-50 py-1"
              >
                {LANGUAGES.map((lang) => {
                  const isSelected = currentLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      data-testid={`language-option-${lang.code}`}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                        isSelected
                          ? 'bg-sky-500/20 text-sky-200 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{lang.flag}</span>
                        <div>
                          <div>{lang.nativeName}</div>
                          <div className="text-[10px] text-slate-400">{lang.name}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-sky-400 stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
