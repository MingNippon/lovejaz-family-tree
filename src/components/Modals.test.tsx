import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  EditPersonModal,
  validatePersonForm,
  buildUpdatedPerson,
} from './EditPersonModal';
import {
  AddChildModal,
  validateChildForm,
  buildChildData,
} from './AddChildModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { QuickActionToolbar } from './QuickActionToolbar';
import { I18nProvider } from '../i18n';
import { Person } from '../types/family';

describe('EditPersonModal Form Helpers & Validation', () => {
  const basePerson: Person = {
    id: 'p_test_1',
    name: 'Eduardo Dela Cruz',
    gender: 'male',
    birthYear: 1952,
    age: 74,
    isDeceased: false,
    title: 'Patriarch',
    notes: 'Beloved father',
  };

  describe('validatePersonForm', () => {
    it('returns valid when name is provided', () => {
      const res = validatePersonForm('Maria Theresa');
      expect(res.isValid).toBe(true);
      expect(res.error).toBeNull();
    });

    it('rejects empty name or whitespace', () => {
      expect(validatePersonForm('').isValid).toBe(false);
      expect(validatePersonForm('   ').isValid).toBe(false);
      expect(validatePersonForm('').error).toBe('Name is required');
    });
  });

  describe('buildUpdatedPerson', () => {
    it('correctly updates fields with numeric birthYear and age', () => {
      const updated = buildUpdatedPerson(basePerson, {
        name: 'Eduardo Jr.',
        gender: 'male',
        birthYear: '1980',
        age: '46',
        isDeceased: true,
        title: 'Heir',
        notes: 'Updated biography note',
      });

      expect(updated.id).toBe('p_test_1');
      expect(updated.name).toBe('Eduardo Jr.');
      expect(updated.gender).toBe('male');
      expect(updated.birthYear).toBe(1980);
      expect(updated.age).toBe(46);
      expect(updated.isDeceased).toBe(true);
      expect(updated.title).toBe('Heir');
      expect(updated.notes).toBe('Updated biography note');
    });

    it('handles non-numeric string birthYear and age without NaN errors', () => {
      const updated = buildUpdatedPerson(basePerson, {
        name: 'Ancestor Jane',
        gender: 'female',
        birthYear: 'circa 1850',
        age: 'unknown',
        isDeceased: true,
      });

      expect(updated.birthYear).toBe('circa 1850');
      expect(updated.age).toBe('unknown');
      expect(updated.gender).toBe('female');
    });

    it('clears empty optional fields to undefined', () => {
      const updated = buildUpdatedPerson(basePerson, {
        name: 'Clean Person',
        gender: 'male',
        birthYear: '',
        age: '',
        title: '   ',
        notes: '',
      });

      expect(updated.birthYear).toBeUndefined();
      expect(updated.age).toBeUndefined();
      expect(updated.title).toBeUndefined();
      expect(updated.notes).toBeUndefined();
    });
  });
});

describe('EditPersonModal Component Rendering & Accessibility', () => {
  const mockPerson: Person = {
    id: 'p_edit_1',
    name: 'Eduardo Dela Cruz',
    gender: 'male',
    birthYear: 1952,
    age: 74,
    isDeceased: false,
    title: 'Patriarch',
    notes: 'Beloved father and grandfather.',
  };

  it('renders nothing when isOpen is false', () => {
    const html = renderToString(
      <EditPersonModal
        isOpen={false}
        person={mockPerson}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    expect(html).toBe('');
  });

  it('renders nothing when person is null', () => {
    const html = renderToString(
      <EditPersonModal
        isOpen={true}
        person={null}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    expect(html).toBe('');
  });

  it('renders modal dialog with pre-filled form fields', () => {
    const html = renderToString(
      <EditPersonModal
        isOpen={true}
        person={mockPerson}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    // Modal dialog accessibility and structure
    expect(html).toContain('data-testid="edit-person-modal"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('data-testid="edit-person-modal-backdrop"');

    // Name field
    expect(html).toContain('data-testid="edit-name-input"');
    expect(html).toContain('value="Eduardo Dela Cruz"');

    // Gender visual cards
    expect(html).toContain('data-testid="gender-card-male"');
    expect(html).toContain('data-testid="gender-card-female"');
    expect(html).toContain('data-testid="gender-square-icon"');
    expect(html).toContain('data-testid="gender-circle-icon"');

    // Birth Year and Age fields
    expect(html).toContain('data-testid="edit-birth-year-input"');
    expect(html).toContain('value="1952"');
    expect(html).toContain('data-testid="edit-age-input"');
    expect(html).toContain('value="74"');

    // Living/Deceased status
    expect(html).toContain('data-testid="edit-deceased-toggle"');
    expect(html).toContain('data-testid="living-badge"');

    // Title and Notes
    expect(html).toContain('data-testid="edit-title-input"');
    expect(html).toContain('value="Patriarch"');
    expect(html).toContain('data-testid="edit-notes-input"');
    expect(html).toContain('Beloved father and grandfather.');

    // Action buttons
    expect(html).toContain('data-testid="edit-close-btn"');
    expect(html).toContain('data-testid="edit-cancel-btn"');
    expect(html).toContain('data-testid="edit-save-btn"');
  });

  it('renders deceased badge when person is deceased', () => {
    const deceasedPerson: Person = {
      ...mockPerson,
      isDeceased: true,
    };

    const html = renderToString(
      <EditPersonModal
        isOpen={true}
        person={deceasedPerson}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="deceased-badge"');
    expect(html).not.toContain('data-testid="living-badge"');
  });

  it('renders with female gender active when editing a female person', () => {
    const femalePerson: Person = {
      id: 'p_female_1',
      name: 'Maria Theresa',
      gender: 'female',
    };

    const html = renderToString(
      <EditPersonModal
        isOpen={true}
        person={femalePerson}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="gender-card-female"');
    expect(html).toContain('data-selected="true"');
  });

  it('renders localized labels in Vietnamese when wrapped in I18nProvider', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="vi">
        <EditPersonModal
          isOpen={true}
          person={mockPerson}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      </I18nProvider>
    );

    expect(html).toContain('Chỉnh sửa thông tin'); // editProfile
    expect(html).toContain('Họ và tên'); // name
    expect(html).toContain('Giới tính'); // gender
    expect(html).toContain('Năm sinh'); // birthYear
    expect(html).toContain('Lưu thay đổi'); // save
    expect(html).toContain('Hủy bỏ'); // cancel
  });

  it('renders localized labels in Tagalog when wrapped in I18nProvider', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="tl">
        <EditPersonModal
          isOpen={true}
          person={mockPerson}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      </I18nProvider>
    );

    expect(html).toContain('I-edit ang Profile'); // editProfile
    expect(html).toContain('Buong Pangalan'); // name
    expect(html).toContain('Kasarian'); // gender
  });
});

describe('AddChildModal Form Helpers & Validation', () => {
  describe('validateChildForm', () => {
    it('validates non-empty child name', () => {
      expect(validateChildForm('Alexander').isValid).toBe(true);
      expect(validateChildForm('Alexander').error).toBeNull();
    });

    it('rejects empty or whitespace-only child name', () => {
      expect(validateChildForm('').isValid).toBe(false);
      expect(validateChildForm('   ').isValid).toBe(false);
      expect(validateChildForm('').error).toBe('Name is required');
    });
  });

  describe('buildChildData', () => {
    it('builds payload with numeric birthYear when digits provided', () => {
      const data = buildChildData({
        name: 'Alexander',
        gender: 'male',
        birthYear: '1985',
      });

      expect(data).toEqual({
        name: 'Alexander',
        gender: 'male',
        birthYear: 1985,
      });
    });

    it('builds payload with undefined birthYear when empty', () => {
      const data = buildChildData({
        name: 'Beatrice',
        gender: 'female',
        birthYear: '',
      });

      expect(data).toEqual({
        name: 'Beatrice',
        gender: 'female',
        birthYear: undefined,
      });
    });

    it('preserves string birthYear if non-numeric', () => {
      const data = buildChildData({
        name: 'Child 3',
        gender: 'male',
        birthYear: 'c. 1990',
      });

      expect(data.birthYear).toBe('c. 1990');
    });
  });
});

describe('AddChildModal Component Rendering & Accessibility', () => {
  const mockParent: Person = {
    id: 'p_parent_1',
    name: 'Eduardo Dela Cruz',
    gender: 'male',
  };

  it('renders nothing when isOpen is false', () => {
    const html = renderToString(
      <AddChildModal
        isOpen={false}
        parentPerson={mockParent}
        onClose={vi.fn()}
        onAddChild={vi.fn()}
      />
    );
    expect(html).toBe('');
  });

  it('renders nothing when parentPerson is null', () => {
    const html = renderToString(
      <AddChildModal
        isOpen={true}
        parentPerson={null}
        onClose={vi.fn()}
        onAddChild={vi.fn()}
      />
    );
    expect(html).toBe('');
  });

  it('renders modal dialog with parent name, default male selection, and empty fields', () => {
    const html = renderToString(
      <AddChildModal
        isOpen={true}
        parentPerson={mockParent}
        onClose={vi.fn()}
        onAddChild={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="add-child-modal"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('data-testid="add-child-parent-name"');
    expect(html).toContain('Eduardo Dela Cruz');

    // Gender toggle cards
    expect(html).toContain('data-testid="child-gender-card-male"');
    expect(html).toContain('data-testid="child-gender-card-female"');
    expect(html).toContain('data-testid="child-gender-square-icon"');
    expect(html).toContain('data-testid="child-gender-circle-icon"');

    // Inputs
    expect(html).toContain('data-testid="add-child-name-input"');
    expect(html).toContain('data-testid="add-child-birth-year-input"');

    // Actions
    expect(html).toContain('data-testid="add-child-close-btn"');
    expect(html).toContain('data-testid="add-child-cancel-btn"');
    expect(html).toContain('data-testid="add-child-submit-btn"');
  });

  it('renders localized strings in Japanese when wrapped in I18nProvider', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="ja">
        <AddChildModal
          isOpen={true}
          parentPerson={mockParent}
          onClose={vi.fn()}
          onAddChild={vi.fn()}
        />
      </I18nProvider>
    );

    expect(html).toContain('子供を追加'); // addChildTitle
    expect(html).toContain('子供の名前'); // childName
    expect(html).toContain('生年'); // birthYear
    expect(html).toContain('キャンセル'); // cancel
  });
});

describe('DeleteConfirmModal Component Rendering & Warnings', () => {
  const mockPerson: Person = {
    id: 'p_del_1',
    name: 'Alexander Dela Cruz',
    gender: 'male',
  };

  it('renders nothing when isOpen is false', () => {
    const html = renderToString(
      <DeleteConfirmModal
        isOpen={false}
        person={mockPerson}
        onClose={vi.fn()}
        onConfirmDelete={vi.fn()}
      />
    );
    expect(html).toBe('');
  });

  it('renders nothing when person is null', () => {
    const html = renderToString(
      <DeleteConfirmModal
        isOpen={true}
        person={null}
        onClose={vi.fn()}
        onConfirmDelete={vi.fn()}
      />
    );
    expect(html).toBe('');
  });

  it('renders modal dialog with member name and standard warning', () => {
    const html = renderToString(
      <DeleteConfirmModal
        isOpen={true}
        person={mockPerson}
        onClose={vi.fn()}
        onConfirmDelete={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="delete-confirm-modal"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('data-testid="delete-modal-title"');
    expect(html).toContain('data-testid="delete-modal-desc"');
    expect(html).toContain('Alexander Dela Cruz');
    expect(html).toContain('data-testid="confirm-delete-btn"');
    expect(html).toContain('data-testid="delete-cancel-btn"');
    expect(html).toContain('data-testid="delete-modal-close-btn"');
  });

  it('renders children warning when childCount is greater than zero', () => {
    const html = renderToString(
      <DeleteConfirmModal
        isOpen={true}
        person={mockPerson}
        childCount={3}
        onClose={vi.fn()}
        onConfirmDelete={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="delete-children-warning"');
    expect(html).toContain('3');
  });

  it('does not render children warning when childCount is 0 or undefined', () => {
    const html = renderToString(
      <DeleteConfirmModal
        isOpen={true}
        person={mockPerson}
        childCount={0}
        onClose={vi.fn()}
        onConfirmDelete={vi.fn()}
      />
    );

    expect(html).not.toContain('data-testid="delete-children-warning"');
  });

  it('renders spouse warning when hasSpouse is true', () => {
    const html = renderToString(
      <DeleteConfirmModal
        isOpen={true}
        person={mockPerson}
        hasSpouse={true}
        onClose={vi.fn()}
        onConfirmDelete={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="delete-spouse-warning"');
  });

  it('renders localized warning descriptions in Cebuano when wrapped in I18nProvider', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="ceb">
        <DeleteConfirmModal
          isOpen={true}
          person={mockPerson}
          onClose={vi.fn()}
          onConfirmDelete={vi.fn()}
        />
      </I18nProvider>
    );

    expect(html).toContain('Papasa ang Miyembro'); // deleteConfirmTitle
    expect(html).toContain('Sigurado ka ba nga gusto nimong papason si Alexander Dela Cruz?'); // deleteConfirmDesc
  });
});

describe('QuickActionToolbar Hook Adherence', () => {
  it('calls useI18n unconditionally and respects custom translation function', () => {
    const customT = vi.fn((key: string) => `CUSTOM_${key}`);

    const html = renderToString(
      <svg>
        <QuickActionToolbar
          personId="p_test_hook"
          t={customT}
        />
      </svg>
    );

    expect(html).toContain('CUSTOM_addSpouse');
    expect(html).toContain('CUSTOM_addChild');
    expect(html).toContain('CUSTOM_addParents');
    expect(html).toContain('CUSTOM_editProfile');
    expect(html).toContain('CUSTOM_deleteMember');
  });

  it('uses I18nProvider context when t is not provided', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="zh">
        <svg>
          <QuickActionToolbar personId="p_test_hook" />
        </svg>
      </I18nProvider>
    );

    expect(html).toContain('添加配偶'); // addSpouse
    expect(html).toContain('添加子女'); // addChild
    expect(html).toContain('添加父母'); // addParents
    expect(html).toContain('编辑资料'); // editProfile
    expect(html).toContain('删除成员'); // deleteMember
  });
});
