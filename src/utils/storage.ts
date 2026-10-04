import { FamilyTreeData } from '../types/family';

export const STORAGE_KEY = 'lovejaz_family_tree_data';

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch {
    // Storage may be restricted (e.g. cookies disabled, private browsing)
    return null;
  }
  return null;
}

/**
 * Persists the current FamilyTreeData into browser localStorage.
 */
export function saveTreeToStorage(tree: FamilyTreeData): void {
  try {
    const storage = getStorage();
    if (storage) {
      const json = JSON.stringify(tree);
      storage.setItem(STORAGE_KEY, json);
    }
  } catch (err) {
    console.error('Failed to save family tree to localStorage', err);
  }
}

/**
 * Retrieves and validates the saved FamilyTreeData from browser localStorage.
 * Returns null if no tree is saved or if stored data is corrupted.
 */
export function loadTreeFromStorage(): FamilyTreeData | null {
  try {
    const storage = getStorage();
    if (!storage) {
      return null;
    }

    const json = storage.getItem(STORAGE_KEY);
    if (!json) return null;

    const parsed = JSON.parse(json);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.title !== 'string' ||
      typeof parsed.rootPersonId !== 'string' ||
      !parsed.persons ||
      typeof parsed.persons !== 'object' ||
      !parsed.unions ||
      typeof parsed.unions !== 'object'
    ) {
      return null;
    }

    return parsed as FamilyTreeData;
  } catch (err) {
    console.error('Failed to load family tree from localStorage', err);
    return null;
  }
}

/**
 * Clears the persisted family tree data from browser localStorage.
 */
export function clearTreeStorage(): void {
  try {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to clear family tree from localStorage', err);
  }
}

/**
 * Triggers a client-side JSON file download for backup purposes.
 */
export function downloadTreeAsJson(tree: FamilyTreeData, filename?: string): void {
  try {
    const json = JSON.stringify(tree, null, 2);
    if (typeof document === 'undefined') return;

    const safeTitle = (tree.title || 'lovejaz_family_tree')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '_');
    const defaultFilename = `${safeTitle}_backup.json`;
    const finalFilename = filename || defaultFilename;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = finalFilename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download family tree JSON', err);
  }
}

/**
 * Parses and validates an imported JSON string into a FamilyTreeData structure.
 * Throws an Error if the JSON syntax is invalid or required fields are missing.
 */
export function parseTreeFromJson(jsonStr: string): FamilyTreeData {
  if (!jsonStr || typeof jsonStr !== 'string') {
    throw new Error('Invalid JSON input: input must be a non-empty string');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(`Invalid JSON syntax: ${(err as Error).message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid tree format: root must be an object');
  }

  const candidate = parsed as Partial<FamilyTreeData>;

  if (!candidate.title || typeof candidate.title !== 'string') {
    throw new Error('Invalid tree format: missing or invalid "title" string');
  }

  if (!candidate.rootPersonId || typeof candidate.rootPersonId !== 'string') {
    throw new Error('Invalid tree format: missing or invalid "rootPersonId" string');
  }

  if (!candidate.persons || typeof candidate.persons !== 'object' || Array.isArray(candidate.persons)) {
    throw new Error('Invalid tree format: missing or invalid "persons" record');
  }

  if (!candidate.unions || typeof candidate.unions !== 'object' || Array.isArray(candidate.unions)) {
    throw new Error('Invalid tree format: missing or invalid "unions" record');
  }

  // Ensure rootPersonId points to an existing person
  if (!candidate.persons[candidate.rootPersonId]) {
    throw new Error(`Invalid tree format: rootPersonId "${candidate.rootPersonId}" does not exist in persons`);
  }

  return candidate as FamilyTreeData;
}
