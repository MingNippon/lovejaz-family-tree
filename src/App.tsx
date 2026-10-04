import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Canvas } from './components/Canvas';
import { PersonNode } from './components/PersonNode';
import { EditPersonModal } from './components/EditPersonModal';
import { AddChildModal } from './components/AddChildModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ExportModal } from './components/ExportModal';
import { ShareModal } from './components/ShareModal';
import { DeployGuideModal } from './components/DeployGuideModal';

import { FamilyTreeData, Person, Union, Gender } from './types/family';
import { computePedigreeLayout } from './engine/layout';
import { getSampleFamilyTree } from './utils/sampleData';
import {
  saveTreeToStorage,
  loadTreeFromStorage,
  downloadTreeAsJson,
} from './utils/storage';
import { decodeTreeFromUrl } from './utils/share';
import { I18nProvider } from './i18n';

/**
 * Computes child count and spouse status for a given person.
 */
export function getPersonRelationsInfo(
  tree: FamilyTreeData,
  personId: string
): { childCount: number; hasSpouse: boolean } {
  const unions = Object.values(tree.unions).filter(
    (u) => u.partner1Id === personId || u.partner2Id === personId
  );
  const hasSpouse = unions.length > 0;
  const childCount = unions.reduce(
    (acc, u) => acc + (u.childrenIds?.length || 0),
    0
  );
  return { childCount, hasSpouse };
}

/**
 * Resolves the initial FamilyTreeData based on URL hash, localStorage, or sample tree fallback.
 */
export function createInitialTree(
  urlHash?: string,
  storedTree?: FamilyTreeData | null
): FamilyTreeData {
  if (urlHash) {
    const fromUrl = decodeTreeFromUrl(urlHash);
    if (fromUrl) return fromUrl;
  }
  if (storedTree) {
    return storedTree;
  }
  return getSampleFamilyTree();
}

/**
 * Creates a clean pedigree tree with a single root founder.
 */
export function createNewTree(): FamilyTreeData {
  const rootId = 'p_root_1';
  return {
    version: '1.0.0',
    title: 'My Family Pedigree',
    subtitle: 'Heritage & Line of Descent',
    rootPersonId: rootId,
    persons: {
      [rootId]: {
        id: rootId,
        name: 'Family Founder',
        gender: 'male',
        title: 'Founder',
        avatarColor: '#3B82F6',
      },
    },
    unions: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Adds an opposite-gender spouse to a person and establishes a new marriage union.
 */
export function addSpouseToTree(
  tree: FamilyTreeData,
  personId: string
): { newTree: FamilyTreeData; spouseId: string } {
  const person = tree.persons[personId];
  if (!person) {
    throw new Error(`Person with id "${personId}" not found in tree`);
  }

  const timestamp = Date.now();
  const spouseGender: Gender = person.gender === 'male' ? 'female' : 'male';
  const spouseId = `p_sp_${timestamp}`;
  const unionId = `u_${timestamp}`;

  const spouse: Person = {
    id: spouseId,
    name: `Spouse of ${person.name}`,
    gender: spouseGender,
    title: 'Spouse',
    avatarColor: spouseGender === 'male' ? '#3B82F6' : '#EC4899',
  };

  const union: Union = {
    id: unionId,
    partner1Id: person.id,
    partner2Id: spouseId,
    childrenIds: [],
  };

  const newTree: FamilyTreeData = {
    ...tree,
    persons: {
      ...tree.persons,
      [spouseId]: spouse,
    },
    unions: {
      ...tree.unions,
      [unionId]: union,
    },
    updatedAt: new Date().toISOString(),
  };

  return { newTree, spouseId };
}

/**
 * Adds a child to an existing union involving parent, or auto-creates partner union if unmarried.
 */
export function addChildToTree(
  tree: FamilyTreeData,
  parentId: string,
  childData: { name: string; gender: Gender; birthYear?: string | number }
): { newTree: FamilyTreeData; childId: string } {
  const parent = tree.persons[parentId];
  if (!parent) {
    throw new Error(`Parent with id "${parentId}" not found in tree`);
  }

  const timestamp = Date.now();
  const childId = `p_child_${timestamp}`;
  const newChild: Person = {
    id: childId,
    name: childData.name,
    gender: childData.gender,
    birthYear: childData.birthYear,
    title: 'Child',
    avatarColor: childData.gender === 'male' ? '#3B82F6' : '#EC4899',
  };

  const updatedPersons = {
    ...tree.persons,
    [childId]: newChild,
  };
  const updatedUnions = { ...tree.unions };

  let targetUnion = Object.values(tree.unions).find(
    (u) => u.partner1Id === parentId || u.partner2Id === parentId
  );

  if (!targetUnion) {
    const spouseGender: Gender = parent.gender === 'male' ? 'female' : 'male';
    const spouseId = `p_sp_${timestamp}`;
    const autoSpouse: Person = {
      id: spouseId,
      name: `Partner of ${parent.name}`,
      gender: spouseGender,
      title: 'Partner',
      avatarColor: spouseGender === 'male' ? '#3B82F6' : '#EC4899',
    };
    updatedPersons[spouseId] = autoSpouse;

    const unionId = `u_${timestamp}`;
    targetUnion = {
      id: unionId,
      partner1Id: parent.id,
      partner2Id: spouseId,
      childrenIds: [childId],
    };
    updatedUnions[unionId] = targetUnion;
  } else {
    updatedUnions[targetUnion.id] = {
      ...targetUnion,
      childrenIds: [...targetUnion.childrenIds, childId],
    };
  }

  const newTree: FamilyTreeData = {
    ...tree,
    persons: updatedPersons,
    unions: updatedUnions,
    updatedAt: new Date().toISOString(),
  };

  return { newTree, childId };
}

/**
 * Adds parents (Father Square & Mother Circle) and a union above a person without parents.
 */
export function addParentsToTree(
  tree: FamilyTreeData,
  childId: string
): { newTree: FamilyTreeData; fatherId: string; motherId: string } | null {
  const child = tree.persons[childId];
  if (!child) {
    throw new Error(`Child with id "${childId}" not found in tree`);
  }

  const hasExistingParents = Object.values(tree.unions).some((u) =>
    u.childrenIds.includes(childId)
  );
  if (hasExistingParents) {
    return null;
  }

  const timestamp = Date.now();
  const fatherId = `p_father_${timestamp}`;
  const motherId = `p_mother_${timestamp}`;
  const unionId = `u_parents_${timestamp}`;

  const father: Person = {
    id: fatherId,
    name: `Father of ${child.name}`,
    gender: 'male',
    title: 'Father',
    avatarColor: '#3B82F6',
  };

  const mother: Person = {
    id: motherId,
    name: `Mother of ${child.name}`,
    gender: 'female',
    title: 'Mother',
    avatarColor: '#EC4899',
  };

  const parentsUnion: Union = {
    id: unionId,
    partner1Id: fatherId,
    partner2Id: motherId,
    childrenIds: [childId],
  };

  const newTree: FamilyTreeData = {
    ...tree,
    persons: {
      ...tree.persons,
      [fatherId]: father,
      [motherId]: mother,
    },
    unions: {
      ...tree.unions,
      [unionId]: parentsUnion,
    },
    updatedAt: new Date().toISOString(),
  };

  return { newTree, fatherId, motherId };
}

/**
 * Updates properties of an existing person in the tree.
 */
export function editPersonInTree(
  tree: FamilyTreeData,
  updatedPerson: Person
): FamilyTreeData {
  if (!tree.persons[updatedPerson.id]) {
    throw new Error(`Person with id "${updatedPerson.id}" not found in tree`);
  }
  return {
    ...tree,
    persons: {
      ...tree.persons,
      [updatedPerson.id]: updatedPerson,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Removes a person, dissolving their marriage unions and cleaning child references.
 */
export function deletePersonFromTree(
  tree: FamilyTreeData,
  personId: string
): FamilyTreeData {
  const updatedPersons = { ...tree.persons };
  delete updatedPersons[personId];

  const updatedUnions: Record<string, Union> = {};
  Object.entries(tree.unions).forEach(([uId, u]) => {
    if (u.partner1Id === personId || u.partner2Id === personId) {
      return;
    }
    updatedUnions[uId] = {
      ...u,
      childrenIds: u.childrenIds.filter((cid) => cid !== personId),
    };
  });

  let rootPersonId = tree.rootPersonId;
  if (rootPersonId === personId) {
    const remainingPersonIds = Object.keys(updatedPersons);
    rootPersonId = remainingPersonIds[0] || '';
  }

  return {
    ...tree,
    persons: updatedPersons,
    unions: updatedUnions,
    rootPersonId,
    updatedAt: new Date().toISOString(),
  };
}

export interface LoveJazAppProps {
  initialTree?: FamilyTreeData;
}

export const LoveJazApp: React.FC<LoveJazAppProps> = ({ initialTree }) => {
  // Root state initialization with URL hash -> localStorage -> sample tree precedence
  const [tree, setTree] = useState<FamilyTreeData>(() => {
    if (initialTree) return initialTree;
    const fromUrl = typeof window !== 'undefined' ? decodeTreeFromUrl() : null;
    if (fromUrl) return fromUrl;
    const fromStorage = loadTreeFromStorage();
    if (fromStorage) return fromStorage;
    return getSampleFamilyTree();
  });

  // Undo / Redo history tracking (capped at 50 states)
  const [history, setHistory] = useState<FamilyTreeData[]>([]);
  const [future, setFuture] = useState<FamilyTreeData[]>([]);

  // Selection & Modals state
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeployGuideModalOpen, setIsDeployGuideModalOpen] = useState(false);

  // SVG ref for 4K / High-Res exports
  const [svgElement, setSvgElement] = useState<SVGSVGElement | null>(null);

  // Memoized Pedigree Layout calculation
  const layout = useMemo(() => computePedigreeLayout(tree), [tree]);

  // Persist tree to browser localStorage upon any mutation
  useEffect(() => {
    saveTreeToStorage(tree);
  }, [tree]);

  // Push new state into Undo history
  const pushState = useCallback((newTree: FamilyTreeData) => {
    setTree((current) => {
      setHistory((prevHistory) => [...prevHistory.slice(-49), current]);
      setFuture([]);
      return newTree;
    });
  }, []);

  // Undo Action
  const handleUndo = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;
      const previous = prevHistory[prevHistory.length - 1];
      const newHistory = prevHistory.slice(0, -1);
      setTree((current) => {
        setFuture((prevFuture) => [current, ...prevFuture]);
        return previous;
      });
      return newHistory;
    });
  }, []);

  // Redo Action
  const handleRedo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);
      setTree((current) => {
        setHistory((prevHistory) => [...prevHistory.slice(-49), current]);
        return next;
      });
      return newFuture;
    });
  }, []);

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

  // React to URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const urlTree = decodeTreeFromUrl();
      if (urlTree) {
        pushState(urlTree);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, [pushState]);

  // Keyboard Shortcuts: Ctrl+Z (Undo), Ctrl+Y (Redo), Escape (Deselect / Close Modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = typeof document !== 'undefined' ? document.activeElement : null;
      const isEditingText =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      if (e.key === 'Escape') {
        if (isEditModalOpen) {
          setIsEditModalOpen(false);
          return;
        }
        if (isAddChildModalOpen) {
          setIsAddChildModalOpen(false);
          return;
        }
        if (isDeleteModalOpen) {
          setIsDeleteModalOpen(false);
          return;
        }
        if (isExportModalOpen) {
          setIsExportModalOpen(false);
          return;
        }
        if (isShareModalOpen) {
          setIsShareModalOpen(false);
          return;
        }
        if (isDeployGuideModalOpen) {
          setIsDeployGuideModalOpen(false);
          return;
        }
        if (selectedPersonId) {
          setSelectedPersonId(null);
        }
        return;
      }

      if (isEditingText) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [
    handleUndo,
    handleRedo,
    isEditModalOpen,
    isAddChildModalOpen,
    isDeleteModalOpen,
    isExportModalOpen,
    isShareModalOpen,
    isDeployGuideModalOpen,
    selectedPersonId,
  ]);

  // Quick Action: Add Spouse
  const handleAddSpouse = useCallback(
    (personId: string) => {
      const { newTree, spouseId } = addSpouseToTree(tree, personId);
      pushState(newTree);
      setSelectedPersonId(spouseId);
    },
    [tree, pushState]
  );

  // Quick Action: Add Child (from modal)
  const handleAddChildSubmit = useCallback(
    (childData: { name: string; gender: Gender; birthYear?: string | number }) => {
      if (!selectedPersonId) return;
      const { newTree, childId } = addChildToTree(tree, selectedPersonId, childData);
      pushState(newTree);
      setIsAddChildModalOpen(false);
      setSelectedPersonId(childId);
    },
    [tree, selectedPersonId, pushState]
  );

  // Quick Action: Add Parents
  const handleAddParents = useCallback(
    (personId: string) => {
      const result = addParentsToTree(tree, personId);
      if (result) {
        pushState(result.newTree);
        setSelectedPersonId(result.fatherId);
      }
    },
    [tree, pushState]
  );

  // Quick Action: Edit Profile (from modal)
  const handleSaveEditedPerson = useCallback(
    (updatedPerson: Person) => {
      const newTree = editPersonInTree(tree, updatedPerson);
      pushState(newTree);
      setIsEditModalOpen(false);
    },
    [tree, pushState]
  );

  // Quick Action: Delete Member (from modal)
  const handleConfirmDelete = useCallback(
    (personId: string) => {
      const newTree = deletePersonFromTree(tree, personId);
      pushState(newTree);
      setIsDeleteModalOpen(false);
      setSelectedPersonId(null);
    },
    [tree, pushState]
  );

  // Header Actions
  const handleTitleChange = useCallback((newTitle: string) => {
    setTree((prev) => ({
      ...prev,
      title: newTitle,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const handleSubtitleChange = useCallback((newSubtitle: string) => {
    setTree((prev) => ({
      ...prev,
      subtitle: newSubtitle,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const handleLoadSampleTree = useCallback(() => {
    const sample = getSampleFamilyTree();
    pushState(sample);
    setSelectedPersonId(null);
  }, [pushState]);

  const handleNewTree = useCallback(() => {
    const fresh = createNewTree();
    pushState(fresh);
    setSelectedPersonId(fresh.rootPersonId);
  }, [pushState]);

  const handleImportJson = useCallback(
    (importedTree: FamilyTreeData) => {
      pushState(importedTree);
      setSelectedPersonId(importedTree.rootPersonId || null);
    },
    [pushState]
  );

  // Canvas background click to deselect node
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-interactive="true"]')) {
      setSelectedPersonId(null);
    }
  }, []);

  const selectedPerson = selectedPersonId ? tree.persons[selectedPersonId] || null : null;
  const selectedRelations = useMemo(() => {
    if (!selectedPersonId) return { childCount: 0, hasSpouse: false };
    return getPersonRelationsInfo(tree, selectedPersonId);
  }, [tree, selectedPersonId]);

  return (
    <div
      data-testid="app-container"
      className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 select-none font-sans"
    >
      {/* Top Header Bar */}
      <Header
        tree={tree}
        title={tree.title}
        subtitle={tree.subtitle}
        onTitleChange={handleTitleChange}
        onSubtitleChange={handleSubtitleChange}
        onLoadSampleTree={handleLoadSampleTree}
        onNewTree={handleNewTree}
        onImportJson={handleImportJson}
        onExportJson={() => downloadTreeAsJson(tree)}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideModalOpen(true)}
      />

      {/* Main Pedigree Tree Canvas */}
      <main
        className="flex-1 relative w-full h-full overflow-hidden"
        onClick={handleCanvasClick}
      >
        <Canvas
          layout={layout}
          svgRef={setSvgElement}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          autoFitOnMount={true}
        >
          {/* Render all positioned person nodes */}
          {Object.values(tree.persons).map((person) => {
            const position = layout.nodes[person.id];
            if (!position) return null;
            return (
              <PersonNode
                key={person.id}
                person={person}
                position={position}
                isSelected={selectedPersonId === person.id}
                onSelect={(id) => setSelectedPersonId(id)}
                onAddSpouse={handleAddSpouse}
                onAddChild={(id) => {
                  setSelectedPersonId(id);
                  setIsAddChildModalOpen(true);
                }}
                onAddParents={handleAddParents}
                onEdit={(id) => {
                  setSelectedPersonId(id);
                  setIsEditModalOpen(true);
                }}
                onDelete={(id) => {
                  setSelectedPersonId(id);
                  setIsDeleteModalOpen(true);
                }}
              />
            );
          })}
        </Canvas>
      </main>

      {/* Modals */}
      <EditPersonModal
        isOpen={isEditModalOpen}
        person={selectedPerson}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEditedPerson}
      />

      <AddChildModal
        isOpen={isAddChildModalOpen}
        parentPerson={selectedPerson}
        onClose={() => setIsAddChildModalOpen(false)}
        onAddChild={handleAddChildSubmit}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        person={selectedPerson}
        childCount={selectedRelations.childCount}
        hasSpouse={selectedRelations.hasSpouse}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleConfirmDelete}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        svgElement={svgElement}
        treeTitle={tree.title}
        treeSubtitle={tree.subtitle}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        tree={tree}
        onImportJson={handleImportJson}
      />

      <DeployGuideModal
        isOpen={isDeployGuideModalOpen}
        onClose={() => setIsDeployGuideModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <I18nProvider>
      <LoveJazApp />
    </I18nProvider>
  );
}
