import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import App, {
  LoveJazApp,
  createInitialTree,
  addSpouseToTree,
  addChildToTree,
  addParentsToTree,
  editPersonInTree,
  deletePersonFromTree,
  createNewTree,
  getPersonRelationsInfo,
} from './App';
import { getSampleFamilyTree } from './utils/sampleData';
import { encodeTreeToUrl } from './utils/share';
import { FamilyTreeData, Person } from './types/family';

describe('LoveJaz App Integration - Mutation Utilities', () => {
  let sampleTree: FamilyTreeData;

  beforeEach(() => {
    sampleTree = getSampleFamilyTree();
  });

  describe('createInitialTree', () => {
    it('returns sample family tree when no url hash or storage exists', () => {
      const tree = createInitialTree(undefined, null);
      expect(tree).toBeDefined();
      expect(tree.title).toBe('The Dela Cruz & Santos Heritage');
      expect(tree.persons['p_gen1_1'].name).toBe('Eduardo Dela Cruz');
    });

    it('loads from storage when stored tree is provided', () => {
      const customTree: FamilyTreeData = {
        version: '1.0.0',
        title: 'Stored Custom Heritage',
        rootPersonId: 'p1',
        persons: {
          p1: { id: 'p1', name: 'Original Ancestor', gender: 'male' },
        },
        unions: {},
      };
      const tree = createInitialTree(undefined, customTree);
      expect(tree.title).toBe('Stored Custom Heritage');
      expect(tree.persons['p1'].name).toBe('Original Ancestor');
    });

    it('prioritizes URL hash when valid encoded tree is provided', () => {
      const urlTree: FamilyTreeData = {
        version: '1.0.0',
        title: 'URL Hash Heritage',
        rootPersonId: 'p_url',
        persons: {
          p_url: { id: 'p_url', name: 'Web Shared Ancestor', gender: 'female' },
        },
        unions: {},
      };
      const fullUrl = encodeTreeToUrl(urlTree);
      const hash = fullUrl.split('#')[1];

      const tree = createInitialTree(`#${hash}`, sampleTree);
      expect(tree.title).toBe('URL Hash Heritage');
      expect(tree.persons['p_url'].name).toBe('Web Shared Ancestor');
    });
  });

  describe('addSpouseToTree', () => {
    it('creates an opposite gender spouse (female for male) and marriage union', () => {
      const malePersonId = 'p_gen2_3'; // Rafael Dela Cruz (unmarried male)
      const initialPersonCount = Object.keys(sampleTree.persons).length;
      const initialUnionCount = Object.keys(sampleTree.unions).length;

      const { newTree, spouseId } = addSpouseToTree(sampleTree, malePersonId);

      expect(Object.keys(newTree.persons).length).toBe(initialPersonCount + 1);
      expect(Object.keys(newTree.unions).length).toBe(initialUnionCount + 1);

      const spouse = newTree.persons[spouseId];
      expect(spouse).toBeDefined();
      expect(spouse.gender).toBe('female');
      expect(spouse.name).toContain('Spouse of Rafael Dela Cruz');

      // Check marriage union
      const union = Object.values(newTree.unions).find(
        (u) =>
          (u.partner1Id === malePersonId && u.partner2Id === spouseId) ||
          (u.partner1Id === spouseId && u.partner2Id === malePersonId)
      );
      expect(union).toBeDefined();
      expect(union?.childrenIds).toEqual([]);
    });

    it('creates an opposite gender spouse (male for female) correctly', () => {
      // Create a test female person with no spouse
      const singleFemale: Person = {
        id: 'p_single_female',
        name: 'Single Lady',
        gender: 'female',
      };
      const treeWithSingleFemale: FamilyTreeData = {
        ...sampleTree,
        persons: {
          ...sampleTree.persons,
          [singleFemale.id]: singleFemale,
        },
      };

      const { newTree, spouseId } = addSpouseToTree(treeWithSingleFemale, 'p_single_female');
      const spouse = newTree.persons[spouseId];
      expect(spouse.gender).toBe('male');
      expect(spouse.name).toContain('Spouse of Single Lady');
    });

    it('throws an error if personId does not exist', () => {
      expect(() => addSpouseToTree(sampleTree, 'non_existent_id')).toThrow(
        'Person with id "non_existent_id" not found in tree'
      );
    });
  });

  describe('addChildToTree', () => {
    it('adds child to existing union of married person', () => {
      const parentId = 'p_gen1_1'; // Eduardo (married to Maria Theresa in u_gen1)
      const existingUnion = sampleTree.unions['u_gen1'];
      const initialChildrenCount = existingUnion.childrenIds.length;

      const { newTree, childId } = addChildToTree(sampleTree, parentId, {
        name: 'Baby Dela Cruz',
        gender: 'male',
        birthYear: 2026,
      });

      expect(newTree.persons[childId]).toBeDefined();
      expect(newTree.persons[childId].name).toBe('Baby Dela Cruz');
      expect(newTree.persons[childId].gender).toBe('male');
      expect(newTree.persons[childId].birthYear).toBe(2026);

      const updatedUnion = newTree.unions['u_gen1'];
      expect(updatedUnion.childrenIds.length).toBe(initialChildrenCount + 1);
      expect(updatedUnion.childrenIds).toContain(childId);
    });

    it('automatically creates partner and union if parent has no existing union', () => {
      const unmarriedId = 'p_gen2_3'; // Rafael (unmarried)
      const initialPersons = Object.keys(sampleTree.persons).length;
      const initialUnions = Object.keys(sampleTree.unions).length;

      const { newTree, childId } = addChildToTree(sampleTree, unmarriedId, {
        name: 'Rafael Jr.',
        gender: 'male',
        birthYear: 2024,
      });

      // Creates child + auto-spouse
      expect(Object.keys(newTree.persons).length).toBe(initialPersons + 2);
      expect(Object.keys(newTree.unions).length).toBe(initialUnions + 1);

      const child = newTree.persons[childId];
      expect(child.name).toBe('Rafael Jr.');

      // Find the created union containing unmarriedId and childId
      const newUnion = Object.values(newTree.unions).find(
        (u) =>
          (u.partner1Id === unmarriedId || u.partner2Id === unmarriedId) &&
          u.childrenIds.includes(childId)
      );
      expect(newUnion).toBeDefined();
    });

    it('throws error if parentId does not exist', () => {
      expect(() =>
        addChildToTree(sampleTree, 'ghost_id', { name: 'Casper', gender: 'male' })
      ).toThrow('Parent with id "ghost_id" not found in tree');
    });
  });

  describe('addParentsToTree', () => {
    it('creates Father Square, Mother Circle, and union above person without parents', () => {
      const grandFatherId = 'p_gen1_1'; // Currently has no parents in sampleTree
      const initialPersons = Object.keys(sampleTree.persons).length;
      const initialUnions = Object.keys(sampleTree.unions).length;

      const result = addParentsToTree(sampleTree, grandFatherId);
      expect(result).not.toBeNull();

      if (result) {
        const { newTree, fatherId, motherId } = result;
        expect(Object.keys(newTree.persons).length).toBe(initialPersons + 2);
        expect(Object.keys(newTree.unions).length).toBe(initialUnions + 1);

        const father = newTree.persons[fatherId];
        const mother = newTree.persons[motherId];

        expect(father.gender).toBe('male');
        expect(father.name).toContain('Father of Eduardo Dela Cruz');
        expect(mother.gender).toBe('female');
        expect(mother.name).toContain('Mother of Eduardo Dela Cruz');

        // Check that union lists grandFatherId as child
        const parentsUnion = Object.values(newTree.unions).find(
          (u) =>
            u.partner1Id === fatherId &&
            u.partner2Id === motherId &&
            u.childrenIds.includes(grandFatherId)
        );
        expect(parentsUnion).toBeDefined();
      }
    });

    it('returns null if person already has parents in the tree', () => {
      const childWithParentsId = 'p_gen2_1'; // Mateo has parents in u_gen1
      const result = addParentsToTree(sampleTree, childWithParentsId);
      expect(result).toBeNull();
    });

    it('throws error if childId does not exist', () => {
      expect(() => addParentsToTree(sampleTree, 'non_existent_child')).toThrow(
        'Child with id "non_existent_child" not found in tree'
      );
    });
  });

  describe('editPersonInTree', () => {
    it('updates person profile correctly', () => {
      const targetId = 'p_gen1_1';
      const updatedPerson: Person = {
        ...sampleTree.persons[targetId],
        name: 'Eduardo Dela Cruz Sr.',
        title: 'Grand Patriarch of the Family',
        notes: 'Updated family memories',
        birthYear: 1950,
      };

      const newTree = editPersonInTree(sampleTree, updatedPerson);
      expect(newTree.persons[targetId].name).toBe('Eduardo Dela Cruz Sr.');
      expect(newTree.persons[targetId].title).toBe('Grand Patriarch of the Family');
      expect(newTree.persons[targetId].notes).toBe('Updated family memories');
      expect(newTree.persons[targetId].birthYear).toBe(1950);
    });

    it('throws error when editing non-existent person', () => {
      const ghostPerson: Person = {
        id: 'phantom_id',
        name: 'Phantom',
        gender: 'male',
      };
      expect(() => editPersonInTree(sampleTree, ghostPerson)).toThrow(
        'Person with id "phantom_id" not found in tree'
      );
    });
  });

  describe('deletePersonFromTree', () => {
    it('safely deletes person and cleans up unions and child references', () => {
      const personToDelete = 'p_gen2_1'; // Mateo Dela Cruz
      const initialPersonCount = Object.keys(sampleTree.persons).length;

      const newTree = deletePersonFromTree(sampleTree, personToDelete);

      // Person should be deleted
      expect(newTree.persons[personToDelete]).toBeUndefined();
      expect(Object.keys(newTree.persons).length).toBe(initialPersonCount - 1);

      // Union where Mateo was partner (u_gen2_1) should be removed
      expect(newTree.unions['u_gen2_1']).toBeUndefined();

      // Mateo should be removed from parents' union (u_gen1) childrenIds
      expect(newTree.unions['u_gen1'].childrenIds).not.toContain(personToDelete);
    });

    it('reassigns rootPersonId when root person is deleted', () => {
      const rootId = sampleTree.rootPersonId;
      const newTree = deletePersonFromTree(sampleTree, rootId);

      expect(newTree.rootPersonId).not.toBe(rootId);
      expect(Object.keys(newTree.persons)).toContain(newTree.rootPersonId);
    });
  });

  describe('createNewTree', () => {
    it('creates a fresh tree with 1 root founder', () => {
      const freshTree = createNewTree();
      expect(freshTree.version).toBe('1.0.0');
      expect(freshTree.title).toBe('My Family Pedigree');
      expect(Object.keys(freshTree.persons).length).toBe(1);
      expect(Object.keys(freshTree.unions).length).toBe(0);

      const founder = freshTree.persons[freshTree.rootPersonId];
      expect(founder).toBeDefined();
      expect(founder.name).toBe('Family Founder');
    });
  });

  describe('getPersonRelationsInfo', () => {
    it('returns correct childCount and hasSpouse for a married parent', () => {
      const info = getPersonRelationsInfo(sampleTree, 'p_gen1_1');
      expect(info.hasSpouse).toBe(true);
      expect(info.childCount).toBe(3); // Mateo, Isabella, Rafael
    });

    it('returns childCount 0 and hasSpouse false for unmarried person', () => {
      const info = getPersonRelationsInfo(sampleTree, 'p_gen2_3'); // Rafael
      expect(info.hasSpouse).toBe(false);
      expect(info.childCount).toBe(0);
    });
  });
});

describe('LoveJaz App Component Integration Rendering', () => {
  it('renders the complete application root without crashing', () => {
    const html = renderToString(<App />);
    expect(html).toBeDefined();
    expect(html).toContain('data-testid="app-container"');
  });

  it('renders header with branding, title, and subtitle', () => {
    const html = renderToString(<App />);
    expect(html).toContain('data-testid="header-container"');
    expect(html).toContain('LoveJaz');
    expect(html).toContain('The Dela Cruz &amp; Santos Heritage');
  });

  it('renders header action buttons (Sample, New, Import, Export, Share, Deploy)', () => {
    const html = renderToString(<App />);
    expect(html).toContain('data-testid="header-sample-tree-btn"');
    expect(html).toContain('data-testid="header-new-tree-btn"');
    expect(html).toContain('data-testid="header-import-json-btn"');
    expect(html).toContain('data-testid="header-export-json-btn"');
    expect(html).toContain('data-testid="header-share-btn"');
    expect(html).toContain('data-testid="header-export-image-btn"');
    expect(html).toContain('data-testid="header-deploy-guide-btn"');
    expect(html).toContain('data-testid="header-language-selector"');
  });

  it('renders canvas with SVG viewport, dot grid, and marriage connections', () => {
    const html = renderToString(<App />);
    expect(html).toContain('data-testid="canvas-container"');
    expect(html).toContain('data-testid="family-tree-svg"');
    expect(html).toContain('data-testid="canvas-viewport"');
    expect(html).toContain('data-testid="marriage-lines-group"');
    expect(html).toContain('data-testid="sibling-branches-group"');
    expect(html).toContain('data-testid="nodes-container"');
  });

  it('renders Generation Ruler tiers across the sample tree generations', () => {
    const html = renderToString(<App />);
    expect(html).toContain('data-testid="generation-ruler"');
    expect(html).toContain('Generation I');
    expect(html).toContain('Generation II');
    expect(html).toContain('Generation III');
  });

  it('renders floating controls with zoom and undo/redo buttons', () => {
    const html = renderToString(<App />);
    expect(html).toContain('data-testid="floating-controls"');
    expect(html).toContain('data-testid="zoom-in-button"');
    expect(html).toContain('data-testid="zoom-out-button"');
    expect(html).toContain('data-testid="reset-zoom-button"');
    expect(html).toContain('data-testid="fit-view-button"');
    expect(html).toContain('data-testid="toggle-generations-button"');
    expect(html).toContain('data-testid="undo-button"');
    expect(html).toContain('data-testid="redo-button"');
  });

  it('renders person nodes with male squares and female circles', () => {
    const html = renderToString(<App />);
    // Gen I: Eduardo Dela Cruz (male square) & Maria Theresa (female circle)
    expect(html).toContain('data-testid="person-node-p_gen1_1"');
    expect(html).toContain('data-testid="person-node-p_gen1_2"');
    expect(html).toContain('Eduardo Dela Cruz');
    expect(html).toContain('Maria Theresa Dela Cruz');
  });

  it('renders LoveJazApp directly within custom I18n context', () => {
    const html = renderToString(<LoveJazApp initialTree={getSampleFamilyTree()} />);
    expect(html).toContain('data-testid="app-container"');
    expect(html).toContain('data-testid="header-container"');
    expect(html).toContain('data-testid="canvas-container"');
  });

  it('renders interactive drag-to-stretch widget and spacing button in App', () => {
    const html = renderToString(<App />);
    expect(html).toContain('data-testid="canvas-stretch-widget"');
    expect(html).toContain('data-testid="stretch-horizontal-handle"');
    expect(html).toContain('data-testid="stretch-vertical-handle"');
    expect(html).toContain('data-testid="stretch-2d-handle"');
    expect(html).toContain('data-testid="spacing-button"');
  });
});
