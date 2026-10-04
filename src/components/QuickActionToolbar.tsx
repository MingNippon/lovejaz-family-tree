import React from 'react';
import {
  UserPlus,
  Baby,
  Users,
  Edit3,
  Trash2,
} from 'lucide-react';
import { useI18n } from '../i18n';

export interface QuickActionToolbarProps {
  personId: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  asForeignObject?: boolean;
  onAddSpouse?: (personId: string) => void;
  onAddChild?: (personId: string) => void;
  onAddParents?: (personId: string) => void;
  onEdit?: (personId: string) => void;
  onDelete?: (personId: string) => void;
  t?: (key: string, params?: Record<string, string | number>) => string;
  className?: string;
}

export const QuickActionToolbar: React.FC<QuickActionToolbarProps> = ({
  personId,
  x = 0,
  y = 0,
  width = 220,
  height = 44,
  asForeignObject = true,
  onAddSpouse,
  onAddChild,
  onAddParents,
  onEdit,
  onDelete,
  t: customT,
  className,
}) => {
  // If custom translation function is provided (e.g. In unit tests), use it directly.
  // Otherwise, use the useI18n() hook.
  const i18n = customT ? null : useI18n();
  const t = customT || (i18n ? i18n.t : ((k: string) => k));

  const baseBtnClass =
    'p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/90 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 flex items-center justify-center';
  const deleteBtnClass =
    'p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 flex items-center justify-center';

  const content = (
    <div
      data-testid="quick-action-toolbar"
      data-interactive="true"
      className={
        className ||
        'flex items-center gap-1 p-1 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl text-slate-200 select-none'
      }
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* + Spouse */}
      <button
        type="button"
        data-testid="quick-action-add-spouse"
        title={t('addSpouse')}
        aria-label={t('addSpouse')}
        onClick={(e) => {
          e.stopPropagation();
          onAddSpouse?.(personId);
        }}
        className={baseBtnClass}
      >
        <UserPlus className="w-3.5 h-3.5" />
      </button>

      {/* + Child */}
      <button
        type="button"
        data-testid="quick-action-add-child"
        title={t('addChild')}
        aria-label={t('addChild')}
        onClick={(e) => {
          e.stopPropagation();
          onAddChild?.(personId);
        }}
        className={baseBtnClass}
      >
        <Baby className="w-3.5 h-3.5" />
      </button>

      {/* + Parents */}
      <button
        type="button"
        data-testid="quick-action-add-parents"
        title={t('addParents')}
        aria-label={t('addParents')}
        onClick={(e) => {
          e.stopPropagation();
          onAddParents?.(personId);
        }}
        className={baseBtnClass}
      >
        <Users className="w-3.5 h-3.5" />
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-slate-700/60 mx-0.5" />

      {/* Edit Profile */}
      <button
        type="button"
        data-testid="quick-action-edit"
        title={t('editProfile')}
        aria-label={t('editProfile')}
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.(personId);
        }}
        className={baseBtnClass}
      >
        <Edit3 className="w-3.5 h-3.5" />
      </button>

      {/* Delete Member */}
      <button
        type="button"
        data-testid="quick-action-delete"
        title={t('deleteMember')}
        aria-label={t('deleteMember')}
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(personId);
        }}
        className={deleteBtnClass}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  if (!asForeignObject) {
    return content;
  }

  return (
    <foreignObject
      data-testid="quick-action-toolbar-foreign-object"
      x={x}
      y={y}
      width={width}
      height={height}
      className="overflow-visible"
      style={{ overflow: 'visible' }}
    >
      {content}
    </foreignObject>
  );
};

export default QuickActionToolbar;
