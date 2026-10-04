import React, { useEffect } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { Person } from '../types/family';
import { useI18n } from '../i18n';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  person: Person | null;
  childCount?: number;
  hasSpouse?: boolean;
  onClose: () => void;
  onConfirmDelete: (personId: string) => void;
  className?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  person,
  childCount,
  hasSpouse,
  onClose,
  onConfirmDelete,
  className,
}) => {
  const { t } = useI18n();

  // Escape key listener on window
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !person) {
    return null;
  }

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirmDelete(person.id);
  };

  const hasChildren = childCount !== undefined && childCount > 0;

  return (
    <div
      data-testid="delete-confirm-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        data-testid="delete-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-modal-title"
        className={
          className ||
          'relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-rose-900/50 shadow-2xl text-slate-100 p-6 flex flex-col gap-5'
        }
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleContainerKeyDown}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="delete-confirm-modal-title"
                data-testid="delete-modal-title"
                className="text-lg font-bold text-white"
              >
                {t('deleteConfirmTitle')}
              </h2>
              <p className="text-xs text-rose-400/80">Permanent pedigree action</p>
            </div>
          </div>
          <button
            type="button"
            data-testid="delete-modal-close-btn"
            aria-label={t('close')}
            title={t('close')}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Warnings */}
        <div className="flex flex-col gap-3.5">
          <p
            data-testid="delete-modal-desc"
            className="text-sm text-slate-300 leading-relaxed"
          >
            {t('deleteConfirmDesc', { name: person.name })}
          </p>

          {/* Warning for children */}
          {hasChildren && (
            <div
              data-testid="delete-children-warning"
              className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>Warning:</strong> {person.name} has {childCount} child
                {childCount === 1 ? '' : 'ren'}. Deleting this person will disconnect or adjust their branches in the pedigree tree.
              </span>
            </div>
          )}

          {/* Warning for spouse */}
          {hasSpouse && (
            <div
              data-testid="delete-spouse-warning"
              className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>Warning:</strong> {person.name} is currently connected in a marriage union.
              </span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            data-testid="delete-cancel-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            data-testid="confirm-delete-btn"
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-lg shadow-rose-950/60 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          >
            <Trash2 className="w-4 h-4" />
            {t('deleteMember')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
