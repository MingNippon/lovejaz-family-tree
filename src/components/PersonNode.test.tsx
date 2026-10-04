import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  PersonNode,
  getInitials,
  truncateText,
  formatBirthAndAge,
} from './PersonNode';
import { QuickActionToolbar } from './QuickActionToolbar';
import { I18nProvider } from '../i18n';
import { Person, NodePosition } from '../types/family';

describe('PersonNode Helper Utilities', () => {
  describe('getInitials', () => {
    it('extracts initials from multi-word names', () => {
      expect(getInitials('Eduardo Dela Cruz')).toBe('EC');
      expect(getInitials('Maria Theresa')).toBe('MT');
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('handles single-word names', () => {
      expect(getInitials('Jaz')).toBe('JA');
      expect(getInitials('A')).toBe('A');
    });

    it('handles empty or missing names gracefully', () => {
      expect(getInitials('')).toBe('?');
      expect(getInitials(undefined)).toBe('?');
      expect(getInitials('   ')).toBe('?');
    });
  });

  describe('truncateText', () => {
    it('leaves short text untouched', () => {
      expect(truncateText('Eduardo', 20)).toBe('Eduardo');
    });

    it('truncates text exceeding max length with ellipsis', () => {
      expect(truncateText('Alexander The Great Emperor', 15)).toBe('Alexander The …');
    });

    it('handles empty text', () => {
      expect(truncateText('', 10)).toBe('');
      expect(truncateText(undefined, 10)).toBe('');
    });
  });

  describe('formatBirthAndAge', () => {
    it('formats both birth year and age as "1985 (41y)"', () => {
      expect(formatBirthAndAge(1985, 41)).toBe('1985 (41y)');
      expect(formatBirthAndAge('1978', '48')).toBe('1978 (48y)');
    });

    it('formats only birth year as "b. 1985"', () => {
      expect(formatBirthAndAge(1985)).toBe('b. 1985');
      expect(formatBirthAndAge('1952')).toBe('b. 1952');
    });

    it('formats only age as "18y"', () => {
      expect(formatBirthAndAge(undefined, 18)).toBe('18y');
      expect(formatBirthAndAge('', 25)).toBe('25y');
    });

    it('returns empty string when neither is provided', () => {
      expect(formatBirthAndAge()).toBe('');
      expect(formatBirthAndAge(undefined, undefined)).toBe('');
    });
  });
});

describe('PersonNode Component Pedigree Conformity', () => {
  const malePerson: Person = {
    id: 'p_male_1',
    name: 'Eduardo Dela Cruz',
    gender: 'male',
    birthYear: 1952,
    title: 'Patriarch',
  };

  const femalePerson: Person = {
    id: 'p_female_1',
    name: 'Maria Theresa Dela Cruz',
    gender: 'female',
    birthYear: 1956,
    age: 70,
    title: 'Matriarch',
  };

  const deceasedPerson: Person = {
    id: 'p_deceased_1',
    name: 'Lolo Manuel',
    gender: 'male',
    birthYear: 1920,
    isDeceased: true,
  };

  const mockPosition: NodePosition = {
    id: 'p_male_1',
    x: 100,
    y: 100,
    width: 72,
    height: 72,
    generation: 0,
    gender: 'male',
  };

  it('renders male strictly as a square <rect>', () => {
    const html = renderToString(
      <svg>
        <PersonNode person={malePerson} position={mockPosition} />
      </svg>
    );

    // Must render <rect> for node-shape and not <circle> for main shape
    expect(html).toContain('data-testid="node-shape"');
    expect(html).toContain('data-gender="male"');
    expect(html).toMatch(/<rect\b[^>]*data-testid="node-shape"[^>]*>/);
    expect(html).not.toMatch(/<circle\b[^>]*data-testid="node-shape"[^>]*>/);
    expect(html).toContain('x="100"');
    expect(html).toContain('y="100"');
    expect(html).toContain('width="72"');
    expect(html).toContain('height="72"');
  });

  it('renders female strictly as a circle <circle>', () => {
    const femalePos: NodePosition = { ...mockPosition, id: femalePerson.id, gender: 'female' };
    const html = renderToString(
      <svg>
        <PersonNode person={femalePerson} position={femalePos} />
      </svg>
    );

    expect(html).toContain('data-testid="node-shape"');
    expect(html).toContain('data-gender="female"');
    expect(html).toMatch(/<circle\b[^>]*data-testid="node-shape"[^>]*>/);
    expect(html).not.toMatch(/<rect\b[^>]*data-testid="node-shape"[^>]*>/);
    // Center at x + 36, y + 36 with radius 36
    expect(html).toContain('cx="136"');
    expect(html).toContain('cy="136"');
    expect(html).toContain('r="36"');
  });

  it('renders diagonal slash <line> when person is deceased', () => {
    const deceasedPos: NodePosition = { ...mockPosition, id: deceasedPerson.id };
    const htmlDeceased = renderToString(
      <svg>
        <PersonNode person={deceasedPerson} position={deceasedPos} />
      </svg>
    );

    expect(htmlDeceased).toContain('data-testid="deceased-slash"');
    expect(htmlDeceased).toMatch(/<line\b[^>]*data-testid="deceased-slash"[^>]*>/);
  });

  it('does NOT render diagonal slash when person is alive', () => {
    const livingPerson: Person = { ...malePerson, isDeceased: false };
    const htmlLiving = renderToString(
      <svg>
        <PersonNode person={livingPerson} position={mockPosition} />
      </svg>
    );

    expect(htmlLiving).not.toContain('data-testid="deceased-slash"');
  });

  it('renders initials centered inside the shape', () => {
    const html = renderToString(
      <svg>
        <PersonNode person={malePerson} position={mockPosition} />
      </svg>
    );

    expect(html).toContain('data-testid="person-initials"');
    expect(html).toContain('EC');
    expect(html).toContain('dominant-baseline="central"');
    expect(html).toContain('text-anchor="middle"');
  });

  it('renders full name and birth year label beneath the shape', () => {
    const html = renderToString(
      <svg>
        <PersonNode person={malePerson} position={mockPosition} />
      </svg>
    );

    expect(html).toContain('data-testid="person-name"');
    expect(html).toContain('Eduardo Dela Cruz');
    expect(html).toContain('data-testid="person-dates"');
    expect(html).toContain('b. 1952');
  });

  it('renders birth year and age label format when both are present', () => {
    const femalePos: NodePosition = { ...mockPosition, id: femalePerson.id, gender: 'female' };
    const html = renderToString(
      <svg>
        <PersonNode person={femalePerson} position={femalePos} />
      </svg>
    );

    expect(html).toContain('data-testid="person-dates"');
    expect(html).toContain('1956 (70y)');
  });

  it('renders title pill when title is provided', () => {
    const html = renderToString(
      <svg>
        <PersonNode person={malePerson} position={mockPosition} />
      </svg>
    );

    expect(html).toContain('data-testid="person-title-pill"');
    expect(html).toContain('Patriarch');
  });

  it('does NOT render title pill when person has no title', () => {
    const noTitlePerson: Person = { ...malePerson, title: undefined };
    const html = renderToString(
      <svg>
        <PersonNode person={noTitlePerson} position={mockPosition} />
      </svg>
    );

    expect(html).not.toContain('data-testid="person-title-pill"');
  });

  it('renders selection halo and quick action toolbar ONLY when isSelected is true', () => {
    const unselectedHtml = renderToString(
      <svg>
        <PersonNode person={malePerson} position={mockPosition} isSelected={false} />
      </svg>
    );

    expect(unselectedHtml).not.toContain('data-testid="selected-halo"');
    expect(unselectedHtml).not.toContain('data-testid="quick-action-toolbar"');

    const selectedHtml = renderToString(
      <svg>
        <PersonNode person={malePerson} position={mockPosition} isSelected={true} />
      </svg>
    );

    expect(selectedHtml).toContain('data-testid="selected-halo"');
    expect(selectedHtml).toContain('data-testid="quick-action-toolbar"');
  });
});

describe('QuickActionToolbar Component', () => {
  it('renders all 5 pedigree action buttons with data-interactive and tooltips', () => {
    const html = renderToString(
      <svg>
        <QuickActionToolbar
          personId="p_test_1"
          onAddSpouse={vi.fn()}
          onAddChild={vi.fn()}
          onAddParents={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      </svg>
    );

    expect(html).toContain('data-testid="quick-action-toolbar"');
    expect(html).toContain('data-interactive="true"');
    expect(html).toContain('data-testid="quick-action-add-spouse"');
    expect(html).toContain('data-testid="quick-action-add-child"');
    expect(html).toContain('data-testid="quick-action-add-parents"');
    expect(html).toContain('data-testid="quick-action-edit"');
    expect(html).toContain('data-testid="quick-action-delete"');

    // Default English tooltips
    expect(html).toContain('+ Add Spouse');
    expect(html).toContain('+ Add Child');
    expect(html).toContain('+ Add Parents');
    expect(html).toContain('Edit Profile');
    expect(html).toContain('Delete Member');
  });

  it('renders translated tooltips when wrapped in I18nProvider (Vietnamese)', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="vi">
        <svg>
          <QuickActionToolbar
            personId="p_test_1"
            onAddSpouse={vi.fn()}
            onAddChild={vi.fn()}
            onAddParents={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </svg>
      </I18nProvider>
    );

    expect(html).toContain('+ Thêm bạn đời');
    expect(html).toContain('+ Thêm con');
    expect(html).toContain('+ Thêm cha mẹ');
    expect(html).toContain('Chỉnh sửa thông tin');
    expect(html).toContain('Xóa thành viên');
  });

  it('renders translated tooltips when wrapped in I18nProvider (Japanese)', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="ja">
        <svg>
          <QuickActionToolbar
            personId="p_test_1"
            onAddSpouse={vi.fn()}
            onAddChild={vi.fn()}
            onAddParents={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </svg>
      </I18nProvider>
    );

    expect(html).toContain('配偶者を追加'); // addSpouse
    expect(html).toContain('子供を追加'); // addChild
    expect(html).toContain('両親を追加'); // addParents
    expect(html).toContain('プロフィール編集'); // editProfile
    expect(html).toContain('メンバーを削除'); // deleteMember
  });
});

describe('Interactive Event Callbacks and Event Propagation', () => {
  it('triggers onSelect with person id when clicking PersonNode', () => {
    const handleSelect = vi.fn();
    const stopPropagation = vi.fn();

    const person: Person = {
      id: 'p_click_1',
      name: 'Click Test',
      gender: 'male',
    };
    const position: NodePosition = {
      id: 'p_click_1',
      x: 50,
      y: 50,
      width: 72,
      height: 72,
      generation: 0,
      gender: 'male',
    };

    const element = PersonNode({
      person,
      position,
      onSelect: handleSelect,
    }) as React.ReactElement<any>;

    // Invoke the root element's onClick handler
    element.props.onClick({ stopPropagation });

    expect(handleSelect).toHaveBeenCalledWith('p_click_1');
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('triggers quick action button callbacks with personId and stops propagation', () => {
    const handleAddSpouse = vi.fn();
    const handleAddChild = vi.fn();
    const handleAddParents = vi.fn();
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    const toolbarElement = QuickActionToolbar({
      personId: 'p_action_1',
      asForeignObject: false,
      t: (key: string) => key,
      onAddSpouse: handleAddSpouse,
      onAddChild: handleAddChild,
      onAddParents: handleAddParents,
      onEdit: handleEdit,
      onDelete: handleDelete,
    }) as React.ReactElement<any>;

    // The container div has buttons as children
    const container = toolbarElement;
    expect(container.props['data-testid']).toBe('quick-action-toolbar');

    // Stop propagation on toolbar container itself
    const containerStopPropagation = vi.fn();
    container.props.onMouseDown({ stopPropagation: containerStopPropagation });
    expect(containerStopPropagation).toHaveBeenCalled();

    container.props.onClick({ stopPropagation: containerStopPropagation });
    expect(containerStopPropagation).toHaveBeenCalledTimes(2);

    // Find and trigger all 5 buttons
    // Children contain buttons and a divider element
    const children = React.Children.toArray(container.props.children);
    const buttons = children.filter(
      (child): child is React.ReactElement<any> =>
        React.isValidElement(child) && child.type === 'button'
    );

    expect(buttons.length).toBe(5);

    const spouseBtn = buttons.find((b) => b.props['data-testid'] === 'quick-action-add-spouse');
    const childBtn = buttons.find((b) => b.props['data-testid'] === 'quick-action-add-child');
    const parentsBtn = buttons.find((b) => b.props['data-testid'] === 'quick-action-add-parents');
    const editBtn = buttons.find((b) => b.props['data-testid'] === 'quick-action-edit');
    const deleteBtn = buttons.find((b) => b.props['data-testid'] === 'quick-action-delete');

    expect(spouseBtn).toBeDefined();
    expect(childBtn).toBeDefined();
    expect(parentsBtn).toBeDefined();
    expect(editBtn).toBeDefined();
    expect(deleteBtn).toBeDefined();

    const mockEvent = { stopPropagation: vi.fn() };

    spouseBtn!.props.onClick(mockEvent);
    expect(handleAddSpouse).toHaveBeenCalledWith('p_action_1');
    expect(mockEvent.stopPropagation).toHaveBeenCalled();

    mockEvent.stopPropagation.mockClear();
    childBtn!.props.onClick(mockEvent);
    expect(handleAddChild).toHaveBeenCalledWith('p_action_1');
    expect(mockEvent.stopPropagation).toHaveBeenCalled();

    mockEvent.stopPropagation.mockClear();
    parentsBtn!.props.onClick(mockEvent);
    expect(handleAddParents).toHaveBeenCalledWith('p_action_1');
    expect(mockEvent.stopPropagation).toHaveBeenCalled();

    mockEvent.stopPropagation.mockClear();
    editBtn!.props.onClick(mockEvent);
    expect(handleEdit).toHaveBeenCalledWith('p_action_1');
    expect(mockEvent.stopPropagation).toHaveBeenCalled();

    mockEvent.stopPropagation.mockClear();
    deleteBtn!.props.onClick(mockEvent);
    expect(handleDelete).toHaveBeenCalledWith('p_action_1');
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });
});
