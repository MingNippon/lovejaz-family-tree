import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Upload,
  ShieldCheck,
  AlertCircle,
  Link,
} from 'lucide-react';
import { FamilyTreeData } from '../types/family';
import { encodeTreeToUrl, copyShareUrlToClipboard } from '../utils/share';
import { downloadTreeAsJson, parseTreeFromJson } from '../utils/storage';
import { useI18n } from '../i18n';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  tree: FamilyTreeData;
  onImportJson?: (tree: FamilyTreeData) => void;
  onDownloadJson?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  tree,
  onImportJson,
  onDownloadJson,
}) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const urlInputRef = useRef<HTMLInputElement | null>(null);

  // Compute share URL safely
  const shareUrl = isOpen && tree ? encodeTreeToUrl(tree) : '';

  // Reset notifications on modal open/close
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setImportError(null);
      setImportSuccess(null);
    }
  }, [isOpen]);

  // Handle Escape key listener
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

  const handleCopyLink = async () => {
    try {
      const success = await copyShareUrlToClipboard(tree);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        // Fallback: select URL input text
        urlInputRef.current?.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const handleDownloadBackup = () => {
    if (onDownloadJson) {
      onDownloadJson();
    } else {
      downloadTreeAsJson(tree);
    }
  };

  const handleTriggerUpload = () => {
    setImportError(null);
    setImportSuccess(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedTree = parseTreeFromJson(content);
        setImportError(null);
        setImportSuccess(`Successfully imported "${parsedTree.title}"!`);
        if (onImportJson) {
          onImportJson(parsedTree);
        }
      } catch (err) {
        setImportSuccess(null);
        setImportError((err as Error).message || 'Invalid family tree JSON file.');
      } finally {
        // Reset file input value to allow re-uploading same file if desired
        if (e.target) {
          e.target.value = '';
        }
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  return (
    <div
      data-testid="share-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        data-testid="share-modal"
        className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="share-dialog-title"
                className="text-lg font-bold text-white tracking-tight"
              >
                {t('shareModalTitle') || 'Share Family Tree'}
              </h2>
              <p className="text-xs text-slate-400">
                {t('shareModalDesc') ||
                  'Anyone with this link can view and explore this family pedigree without signing in.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="share-close-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Share Link Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              One-Click Share Link
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={urlInputRef}
                  type="text"
                  readOnly
                  data-testid="share-url-input"
                  value={shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-xs text-sky-200 select-all focus:outline-none focus:border-sky-500 transition-colors"
                  placeholder="Generating link..."
                />
                <Link className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              </div>
              <button
                type="button"
                data-testid="share-copy-btn"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20 transition-all shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3] text-white" />
                    <span>{t('linkCopied') || 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{t('copyLink') || 'Copy Link'}</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Click the field to select all or use the button to copy instantly.
            </p>
          </div>

          {/* Privacy & Serverless Explainer */}
          <div
            data-testid="share-privacy-note"
            className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Private, Zero-Cost & Serverless</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your family pedigree data is compressed entirely inside the URL hash fragment.
              No cloud server or database ever stores or sees your personal genealogy records.
              This guarantees absolute privacy and ensures LoveJaz remains 100% free forever.
            </p>
          </div>

          {/* Backup & Restore Controls */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Offline Backup & Restore
            </span>

            {/* Import Feedback */}
            {importError && (
              <div
                data-testid="share-import-error"
                className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}
            {importSuccess && (
              <div
                data-testid="share-import-success"
                className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>{importSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Download Backup */}
              <button
                type="button"
                data-testid="share-download-json-btn"
                onClick={handleDownloadBackup}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700 transition-all text-xs font-semibold"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>{t('downloadJson') || 'Download Backup (JSON)'}</span>
              </button>

              {/* Upload Backup */}
              <button
                type="button"
                data-testid="share-upload-json-btn"
                onClick={handleTriggerUpload}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700 transition-all text-xs font-semibold"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>{t('uploadJson') || 'Restore from JSON'}</span>
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                data-testid="share-file-input"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {t('close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
