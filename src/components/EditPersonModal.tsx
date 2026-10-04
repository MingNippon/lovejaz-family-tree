import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Person, Gender } from '../types/family';
import { useI18n } from '../i18n';

export interface EditPersonFormValues {
  name: string;
  gender: Gender;
  birthYear?: string;
  age?: string;
  isDeceased?: boolean;
  title?: string;
  notes?: string;
}

/**
 * Validates the required person fields.
 */
export function validatePersonForm(name: string): { isValid: boolean; error: string | null } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Name is required' };
  }
  return { isValid: true, error: null };
}

/**
 * Builds an updated Person object by combining original data and sanitized form values.
 */
export function buildUpdatedPerson(
  original: Person,
  values: EditPersonFormValues
): Person {
  const trimmedName = values.name.trim();
  const trimmedBirthYear = (values.birthYear || '').trim();
  const parsedBirthYear =
    trimmedBirthYear !== ''
      ? isNaN(Number(trimmedBirthYear))
        ? trimmedBirthYear
        : Number(trimmedBirthYear)
      : undefined;

  const trimmedAge = (values.age || '').trim();
  const parsedAge =
    trimmedAge !== ''
      ? isNaN(Number(trimmedAge))
        ? trimmedAge
        : Number(trimmedAge)
      : undefined;

  const trimmedTitle = (values.title || '').trim();
  const trimmedNotes = (values.notes || '').trim();

  return {
    ...original,
    name: trimmedName,
    gender: values.gender,
    birthYear: parsedBirthYear,
    age: parsedAge,
    isDeceased: Boolean(values.isDeceased),
    title: trimmedTitle !== '' ? trimmedTitle : undefined,
    notes: trimmedNotes !== '' ? trimmedNotes : undefined,
  };
}

export interface EditPersonModalProps {
  isOpen: boolean;
  person: Person | null;
  onClose: () => void;
  onSave: (updated: Person) => void;
  className?: string;
}

export const EditPersonModal: React.FC<EditPersonModalProps> = ({
  isOpen,
  person,
  onClose,
  onSave,
  className,
}) => {
  const { t } = useI18n();

  const [name, setName] = useState(person?.name || '');
  const [gender, setGender] = useState<Gender>(person?.gender || 'male');
  const [birthYear, setBirthYear] = useState(
    person?.birthYear !== undefined && person?.birthYear !== null
      ? String(person.birthYear)
      : ''
  );
  const [age, setAge] = useState(
    person?.age !== undefined && person?.age !== null ? String(person.age) : ''
  );
  const [isDeceased, setIsDeceased] = useState(Boolean(person?.isDeceased));
  const [title, setTitle] = useState(person?.title || '');
  const [notes, setNotes] = useState(person?.notes || '');
  const [error, setError] = useState<string | null>(null);

  // Sync internal form state whenever person or isOpen changes
  useEffect(() => {
    if (person && isOpen) {
      setName(person.name || '');
      setGender(person.gender || 'male');
      setBirthYear(
        person.birthYear !== undefined && person.birthYear !== null
          ? String(person.birthYear)
          : ''
      );
      setAge(
        person.age !== undefined && person.age !== null ? String(person.age) : ''
      );
      setIsDeceased(Boolean(person.isDeceased));
      setTitle(person.title || '');
      setNotes(person.notes || '');
      setError(null);
    }
  }, [person, isOpen]);

  // Window escape key listener
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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    const validation = validatePersonForm(name);
    if (!validation.isValid) {
      setError(t('name') ? `${t('name')} is required` : (validation.error || 'Name is required'));
      return;
    }

    const updated = buildUpdatedPerson(person, {
      name,
      gender,
      birthYear,
      age,
      isDeceased,
      title,
      notes,
    });

    onSave(updated);
  };

  return (
    <div
      data-testid="edit-person-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        data-testid="edit-person-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-person-modal-title"
        className={
          className ||
          'relative w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl text-slate-100 p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto'
        }
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleContainerKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2
              id="edit-person-modal-title"
              className="text-xl font-bold text-slate-100 flex items-center gap-2"
            >
              {t('editProfile')}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {person.name} ({person.id})
            </p>
          </div>
          <button
            type="button"
            data-testid="edit-close-btn"
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
          data-testid="edit-person-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {error && (
            <div
              data-testid="edit-error-message"
              className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm"
            >
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-person-name"
              className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              {t('name')} <span className="text-rose-400">*</span>
            </label>
            <input
              id="edit-person-name"
              data-testid="edit-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder={t('name')}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
            />
          </div>

          {/* Gender Selector - Visual Cards */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {t('gender')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Male Card (Square) */}
              <button
                type="button"
                data-testid="gender-card-male"
                data-selected={gender === 'male'}
                onClick={() => setGender('male')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  gender === 'male'
                    ? 'border-sky-500 bg-sky-950/50 ring-2 ring-sky-500/60 shadow-lg shadow-sky-950/50 text-white'
                    : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:bg-slate-800/70'
                }`}
              >
                {/* Visual Square Icon */}
                <div
                  data-testid="gender-square-icon"
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
                  <span className="text-[11px] text-slate-400">Pedigree Square</span>
                </div>
              </button>

              {/* Female Card (Circle) */}
              <button
                type="button"
                data-testid="gender-card-female"
                data-selected={gender === 'female'}
                onClick={() => setGender('female')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  gender === 'female'
                    ? 'border-pink-500 bg-pink-950/50 ring-2 ring-pink-500/60 shadow-lg shadow-pink-950/50 text-white'
                    : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:bg-slate-800/70'
                }`}
              >
                {/* Visual Circle Icon */}
                <div
                  data-testid="gender-circle-icon"
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
                  <span className="text-[11px] text-slate-400">Pedigree Circle</span>
                </div>
              </button>
            </div>
          </div>

          {/* Birth Year & Age row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-birth-year"
                className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
              >
                {t('birthYear')}
              </label>
              <input
                id="edit-birth-year"
                data-testid="edit-birth-year-input"
                type="text"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="e.g. 1952"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-age"
                className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
              >
                {t('age')}
              </label>
              <input
                id="edit-age"
                data-testid="edit-age-input"
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 74"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
              />
            </div>
          </div>

          {/* Living / Deceased Status */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-800/40">
            <div className="flex items-center gap-3">
              <input
                id="edit-deceased-toggle"
                data-testid="edit-deceased-toggle"
                type="checkbox"
                checked={isDeceased}
                onChange={(e) => setIsDeceased(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 bg-slate-700 border-slate-600 focus:ring-rose-500 focus:ring-offset-slate-900 cursor-pointer"
              />
              <label
                htmlFor="edit-deceased-toggle"
                className="text-sm font-medium text-slate-300 cursor-pointer select-none"
              >
                {t('deceased')}
              </label>
            </div>

            {/* Status indicator badge */}
            {isDeceased ? (
              <span
                data-testid="deceased-badge"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                {t('deceasedBadge')}
              </span>
            ) : (
              <span
                data-testid="living-badge"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {t('living')}
              </span>
            )}
          </div>

          {/* Title / Role */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-title"
              className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              {t('titleRole')}
            </label>
            <input
              id="edit-title"
              data-testid="edit-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Patriarch / Matriarch"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
            />
          </div>

          {/* Notes / Biography */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-notes"
              className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              {t('notes')}
            </label>
            <textarea
              id="edit-notes"
              data-testid="edit-notes-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add biography, memories, or notes..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              data-testid="edit-cancel-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              data-testid="edit-save-btn"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-lg shadow-rose-950/50 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            >
              <Check className="w-4 h-4" />
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPersonModal;
