import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Person, Gender } from '../types/family';
import { useI18n } from '../i18n';

export interface AddChildFormValues {
  name: string;
  gender: Gender;
  birthYear?: string;
}

/**
 * Validates the child name input.
 */
export function validateChildForm(name: string): { isValid: boolean; error: string | null } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Name is required' };
  }
  return { isValid: true, error: null };
}

/**
 * Builds the payload for adding a child node.
 */
export function buildChildData(values: AddChildFormValues): {
  name: string;
  gender: Gender;
  birthYear?: string | number;
} {
  const trimmedName = values.name.trim();
  const trimmedBirthYear = (values.birthYear || '').trim();
  const parsedBirthYear =
    trimmedBirthYear !== ''
      ? isNaN(Number(trimmedBirthYear))
        ? trimmedBirthYear
        : Number(trimmedBirthYear)
      : undefined;

  return {
    name: trimmedName,
    gender: values.gender,
    birthYear: parsedBirthYear,
  };
}

export interface AddChildModalProps {
  isOpen: boolean;
  parentPerson: Person | null;
  onClose: () => void;
  onAddChild: (data: {
    name: string;
    gender: Gender;
    birthYear?: string | number;
  }) => void;
  className?: string;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  parentPerson,
  onClose,
  onAddChild,
  className,
}) => {
  const { t } = useI18n();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [birthYear, setBirthYear] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens or parentPerson changes
  useEffect(() => {
    if (isOpen) {
      setName('');
      setGender('male');
      setBirthYear('');
      setError(null);
    }
  }, [isOpen, parentPerson]);

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

  if (!isOpen || !parentPerson) {
    return null;
  }

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    const validation = validateChildForm(name);
    if (!validation.isValid) {
      setError(t('childName') ? `${t('childName')} is required` : (validation.error || 'Name is required'));
      return;
    }

    const childData = buildChildData({
      name,
      gender,
      birthYear,
    });

    onAddChild(childData);
  };

  return (
    <div
      data-testid="add-child-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        data-testid="add-child-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-child-modal-title"
        className={
          className ||
          'relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl text-slate-100 p-6 flex flex-col gap-5'
        }
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleContainerKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2
              id="add-child-modal-title"
              className="text-lg font-bold text-slate-100 flex items-center gap-2"
            >
              {t('addChildTitle')}
            </h2>
            <p
              data-testid="add-child-parent-name"
              className="text-xs text-slate-400 mt-0.5"
            >
              Child of {parentPerson.name}
            </p>
          </div>
          <button
            type="button"
            data-testid="add-child-close-btn"
            aria-label={t('close')}
            title={t('close')}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          data-testid="add-child-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {error && (
            <div
              data-testid="add-child-error-message"
              className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm"
            >
              {error}
            </div>
          )}

          {/* Gender Selector - Visual Cards */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {t('gender')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Male Card */}
              <button
                type="button"
                data-testid="child-gender-card-male"
                data-selected={gender === 'male'}
                onClick={() => setGender('male')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  gender === 'male'
                    ? 'border-sky-500 bg-sky-950/50 ring-2 ring-sky-500/60 shadow-lg shadow-sky-950/50 text-white'
                    : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:bg-slate-800/70'
                }`}
              >
                <div
                  data-testid="child-gender-square-icon"
                  className={`w-7 h-7 rounded-md border-2 flex items-center justify-center shrink-0 ${
                    gender === 'male'
                      ? 'border-sky-400 bg-sky-500/20 text-sky-300'
                      : 'border-slate-500 bg-slate-700/30 text-slate-500'
                  }`}
                >
                  <div className="w-3.5 h-3.5 bg-current rounded-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{t('male')}</span>
                  <span className="text-[11px] text-slate-400">Square</span>
                </div>
              </button>

              {/* Female Card */}
              <button
                type="button"
                data-testid="child-gender-card-female"
                data-selected={gender === 'female'}
                onClick={() => setGender('female')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  gender === 'female'
                    ? 'border-pink-500 bg-pink-950/50 ring-2 ring-pink-500/60 shadow-lg shadow-pink-950/50 text-white'
                    : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:bg-slate-800/70'
                }`}
              >
                <div
                  data-testid="child-gender-circle-icon"
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    gender === 'female'
                      ? 'border-pink-400 bg-pink-500/20 text-pink-300'
                      : 'border-slate-500 bg-slate-700/30 text-slate-500'
                  }`}
                >
                  <div className="w-3.5 h-3.5 bg-current rounded-full" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{t('female')}</span>
                  <span className="text-[11px] text-slate-400">Circle</span>
                </div>
              </button>
            </div>
          </div>

          {/* Child Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-child-name"
              className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              {t('childName')} <span className="text-rose-400">*</span>
            </label>
            <input
              id="add-child-name"
              data-testid="add-child-name-input"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder={t('childName')}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
            />
          </div>

          {/* Birth Year */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-child-birth-year"
              className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              {t('birthYear')}
            </label>
            <input
              id="add-child-birth-year"
              data-testid="add-child-birth-year-input"
              type="text"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="e.g. 1985 (optional)"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              data-testid="add-child-cancel-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              data-testid="add-child-submit-btn"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-lg shadow-rose-950/50 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            >
              <Plus className="w-4 h-4" />
              {t('addChildTitle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChildModal;
