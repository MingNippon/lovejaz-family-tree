import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { encodeTreeToUrl, decodeTreeFromUrl, copyShareUrlToClipboard } from './share';
import {
  STORAGE_KEY,
  saveTreeToStorage,
  loadTreeFromStorage,
  clearTreeStorage,
  downloadTreeAsJson,
  parseTreeFromJson,
} from './storage';
import { getSampleFamilyTree } from './sampleData';
import { FamilyTreeData } from '../types/family';
import { computePedigreeLayout } from '../engine/layout';

describe('Task 4: URL Sharing, Persistence & Sample Tree', () => {
  const sampleTree = getSampleFamilyTree();

  describe('lz-string URL sharing (src/utils/share.ts)', () => {
    it('encodes and decodes a family tree without data loss (roundtrip)', () => {
      const url = encodeTreeToUrl(sampleTree);
      expect(url).toContain('#tree=');

      const decoded = decodeTreeFromUrl(url);
      expect(decoded).not.toBeNull();
      expect(decoded).toEqual(sampleTree);
    });

    it('decodes directly from hash string with #tree= prefix', () => {
      const url = encodeTreeToUrl(sampleTree);
      const hash = url.slice(url.indexOf('#tree='));
      const decoded = decodeTreeFromUrl(hash);
      expect(decoded).toEqual(sampleTree);
    });

    it('decodes directly from hash string without # prefix (tree=...)', () => {
      const url = encodeTreeToUrl(sampleTree);
      const hashWithoutPound = url.slice(url.indexOf('tree='));
      const decoded = decodeTreeFromUrl(hashWithoutPound);
      expect(decoded).toEqual(sampleTree);
    });

    it('handles international Unicode characters safely (TL, JA, ZH, VI accents)', () => {
      const unicodeTree: FamilyTreeData = {
        version: '1.0.0',
        title: 'Familia José & 家族 & 阮氏家谱 & Gia phả',
        subtitle: 'Maligayang Pagdating / 歡迎 / ようこそ / Chào mừng',
        rootPersonId: 'u1',
        persons: {
          u1: {
            id: 'u1',
            name: 'José Protasio Rizal-Mercado y Alonso Realonda',
            gender: 'male',
            birthYear: 1861,
            notes: 'National hero; speaks Tagalog, Spanish, Nihongo, & Deutsch',
          },
          u2: {
            id: 'u2',
            name: '山田 太郎 (Yamada Tarō)',
            gender: 'male',
            birthYear: 1970,
            notes: '東京出身、伝統芸能の継承者',
          },
          u3: {
            id: 'u3',
            name: '阮文勇 (Nguyễn Văn Dũng)',
            gender: 'male',
            birthYear: 1985,
            notes: 'Kỹ sư phần mềm từ Hà Nội',
          },
        },
        unions: {},
      };

      const url = encodeTreeToUrl(unicodeTree);
      const decoded = decodeTreeFromUrl(url);
      expect(decoded).toEqual(unicodeTree);
    });

    it('returns null for empty, missing or invalid hash values', () => {
      expect(decodeTreeFromUrl('')).toBeNull();
      expect(decodeTreeFromUrl('#')).toBeNull();
      expect(decodeTreeFromUrl('#tree=')).toBeNull();
      expect(decodeTreeFromUrl('#other=12345')).toBeNull();
      expect(decodeTreeFromUrl('#tree=invalidGarbageBase64Data!!!')).toBeNull();
      expect(decodeTreeFromUrl(undefined)).toBeNull();
    });

    it('returns null if decompressed data is not valid FamilyTreeData object', () => {
      // Create a corrupted payload that decompresses to invalid JSON or non-tree
      const invalidJsonHash = '#tree=N4IgJgpg'; // something trivial
      expect(decodeTreeFromUrl(invalidJsonHash)).toBeNull();
    });

    it('strips additional query/hash parameters appended to the URL', () => {
      const url = encodeTreeToUrl(sampleTree);
      const urlWithParams = `${url}&theme=vintage&zoom=1.2`;
      const decoded = decodeTreeFromUrl(urlWithParams);
      expect(decoded).toEqual(sampleTree);
    });

    describe('copyShareUrlToClipboard', () => {
      beforeEach(() => {
        vi.restoreAllMocks();
      });

      it('successfully copies URL to clipboard when navigator.clipboard is available', async () => {
        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal('navigator', {
          clipboard: {
            writeText: writeTextMock,
          },
        });

        const success = await copyShareUrlToClipboard(sampleTree);
        expect(success).toBe(true);
        expect(writeTextMock).toHaveBeenCalledTimes(1);
        expect(writeTextMock.mock.calls[0][0]).toContain('#tree=');

        vi.unstubAllGlobals();
      });

      it('returns false gracefully when clipboard.writeText rejects', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const writeTextMock = vi.fn().mockRejectedValue(new Error('Permission denied'));
        vi.stubGlobal('navigator', {
          clipboard: {
            writeText: writeTextMock,
          },
        });

        const success = await copyShareUrlToClipboard(sampleTree);
        expect(success).toBe(false);

        vi.unstubAllGlobals();
        consoleSpy.mockRestore();
      });
    });
  });

  describe('localStorage & JSON export/import (src/utils/storage.ts)', () => {
    let mockStorage: Record<string, string> = {};

    beforeEach(() => {
      mockStorage = {};
      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key: string) => mockStorage[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          mockStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockStorage[key];
        }),
        clear: vi.fn(() => {
          mockStorage = {};
        }),
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('defines STORAGE_KEY as lovejaz_family_tree_data', () => {
      expect(STORAGE_KEY).toBe('lovejaz_family_tree_data');
    });

    it('saves tree to localStorage and loads it back accurately', () => {
      saveTreeToStorage(sampleTree);
      expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(sampleTree));

      const loaded = loadTreeFromStorage();
      expect(loaded).toEqual(sampleTree);
    });

    it('clears saved tree from localStorage', () => {
      saveTreeToStorage(sampleTree);
      expect(loadTreeFromStorage()).not.toBeNull();

      clearTreeStorage();
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(loadTreeFromStorage()).toBeNull();
    });

    it('returns null when loading from empty or corrupt storage', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(loadTreeFromStorage()).toBeNull();

      mockStorage[STORAGE_KEY] = 'INVALID_JSON{{{';
      expect(loadTreeFromStorage()).toBeNull();

      mockStorage[STORAGE_KEY] = JSON.stringify({ invalid: 'format' });
      expect(loadTreeFromStorage()).toBeNull();
      consoleSpy.mockRestore();
    });

    it('parses valid tree JSON and throws on malformed JSON', () => {
      const jsonStr = JSON.stringify(sampleTree);
      const parsed = parseTreeFromJson(jsonStr);
      expect(parsed).toEqual(sampleTree);

      expect(() => parseTreeFromJson('')).toThrow();
      expect(() => parseTreeFromJson('{ corrupt json ')).toThrow();
      expect(() => parseTreeFromJson(JSON.stringify({ notA: 'tree' }))).toThrow();
      expect(() => parseTreeFromJson(JSON.stringify({ ...sampleTree, rootPersonId: 'non-existent-id' }))).toThrow();
    });

    it('triggers file download with correct filename and MIME type', () => {
      const clickMock = vi.fn();
      const appendChildMock = vi.fn();
      const removeChildMock = vi.fn();
      const createObjectURLMock = vi.fn(() => 'blob:mock-url');
      const revokeObjectURLMock = vi.fn();

      vi.stubGlobal('URL', {
        createObjectURL: createObjectURLMock,
        revokeObjectURL: revokeObjectURLMock,
      });

      const mockAnchor = {
        href: '',
        download: '',
        click: clickMock,
      } as unknown as HTMLAnchorElement;

      vi.stubGlobal('document', {
        createElement: vi.fn((tag: string) => {
          if (tag === 'a') return mockAnchor;
          return {};
        }),
        body: {
          appendChild: appendChildMock,
          removeChild: removeChildMock,
        },
      });

      downloadTreeAsJson(sampleTree, 'custom-family.json');

      expect(createObjectURLMock).toHaveBeenCalled();
      expect(mockAnchor.download).toBe('custom-family.json');
      expect(mockAnchor.href).toBe('blob:mock-url');
      expect(clickMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('Curated 3-generation sample family tree (src/utils/sampleData.ts)', () => {
    it('returns a well-formed 3-generation family tree structure', () => {
      const tree = getSampleFamilyTree();

      expect(tree.version).toBeDefined();
      expect(tree.title).toBeTruthy();
      expect(tree.rootPersonId).toBeTruthy();
      expect(tree.persons[tree.rootPersonId]).toBeDefined();

      const persons = Object.values(tree.persons);
      const unions = Object.values(tree.unions);

      // Must have at least 10 people for 3 generations
      expect(persons.length).toBeGreaterThanOrEqual(10);
      expect(unions.length).toBeGreaterThanOrEqual(2);

      // Verify every union references valid partner IDs
      unions.forEach((u) => {
        expect(tree.persons[u.partner1Id]).toBeDefined();
        if (u.partner2Id) {
          expect(tree.persons[u.partner2Id]).toBeDefined();
        }
        u.childrenIds.forEach((childId) => {
          expect(tree.persons[childId]).toBeDefined();
        });
      });
    });

    it('satisfies Gen I requirements: M + J (Emu Palomar 2026 + Jazmine Palomar 2026)', () => {
      const tree = getSampleFamilyTree();
      const rootPerson = tree.persons[tree.rootPersonId];
      expect(rootPerson).toBeDefined();
      expect(rootPerson.name).toBe('Emu Palomar');
      expect(rootPerson.gender).toBe('male');
      expect(Number(rootPerson.birthYear)).toBe(2026);

      // Find root's marriage
      const gen1Union = Object.values(tree.unions).find(
        (u) => u.partner1Id === tree.rootPersonId || u.partner2Id === tree.rootPersonId
      );
      expect(gen1Union).toBeDefined();

      const spouseId = gen1Union!.partner1Id === tree.rootPersonId ? gen1Union!.partner2Id : gen1Union!.partner1Id;
      const mother = tree.persons[spouseId];
      expect(mother).toBeDefined();
      expect(mother.name).toBe('Jazmine Palomar');
      expect(mother.gender).toBe('female');
      expect(Number(mother.birthYear)).toBe(2026);

      // Gen I has 5 children
      expect(gen1Union!.childrenIds.length).toBe(5);
    });

    it('satisfies Gen II requirements: 5 children (Haru, Kiyo, Yuki, Akari, Aiko)', () => {
      const tree = getSampleFamilyTree();
      const gen1Union = Object.values(tree.unions).find(
        (u) => u.partner1Id === tree.rootPersonId || u.partner2Id === tree.rootPersonId
      )!;

      const [c1Id, c2Id, c3Id, c4Id, c5Id] = gen1Union.childrenIds;
      const c1 = tree.persons[c1Id]; // Haru
      const c2 = tree.persons[c2Id]; // Kiyo
      const c3 = tree.persons[c3Id]; // Yuki
      const c4 = tree.persons[c4Id]; // Akari
      const c5 = tree.persons[c5Id]; // Aiko

      expect(c1.name).toBe('Haru Palomar');
      expect(c1.gender).toBe('male');

      expect(c2.name).toBe('Kiyo Palomar');
      expect(c2.gender).toBe('male');

      expect(c3.name).toBe('Yuki Palomar');
      expect(c3.gender).toBe('female');

      expect(c4.name).toBe('Akari Palomar');
      expect(c4.gender).toBe('male');

      expect(c5.name).toBe('Aiko Palomar');
      expect(c5.gender).toBe('female');
    });

    it('satisfies Gen III requirements: 4 grandchildren (Rin, Xyril, Darel, Minh)', () => {
      const tree = getSampleFamilyTree();
      const gen1Union = Object.values(tree.unions).find(
        (u) => u.partner1Id === tree.rootPersonId || u.partner2Id === tree.rootPersonId
      )!;

      const gen2Unions = Object.values(tree.unions).filter((u) => u.id !== gen1Union.id);
      const grandchildrenIds = Array.from(new Set(gen2Unions.flatMap((u) => u.childrenIds)));
      expect(grandchildrenIds.length).toBe(4);

      const grandchildren = grandchildrenIds.map((id) => tree.persons[id]);
      const names = grandchildren.map((g) => g.name);

      expect(names).toContain('Rin Palomar');
      expect(names).toContain('Xyril Palomar');
      expect(names).toContain('Darel Palomar');
      expect(names).toContain('Minh Palomar');

      const boys = grandchildren.filter((g) => g.gender === 'male');
      const girls = grandchildren.filter((g) => g.gender === 'female');

      expect(boys.length).toBe(1);
      expect(girls.length).toBe(3);
    });

    it('renders cleanly in computePedigreeLayout without errors and stratifies into 3 generations', () => {
      const tree = getSampleFamilyTree();
      const layout = computePedigreeLayout(tree);

      expect(layout.generations.length).toBe(3);
      expect(layout.generations[0].label).toBe('Generation I');
      expect(layout.generations[1].label).toBe('Generation II');
      expect(layout.generations[2].label).toBe('Generation III');

      // Every person is placed in the layout
      Object.keys(tree.persons).forEach((pId) => {
        expect(layout.nodes[pId]).toBeDefined();
      });

      // Bounds are positive and valid
      expect(layout.bounds.width).toBeGreaterThan(0);
      expect(layout.bounds.height).toBeGreaterThan(0);
      expect(layout.marriages.length).toBe(3); // Emu + Jazmine, Kiyo + Yuki, Akari + Aiko
      expect(layout.branches.length).toBe(4); // Gen 1, Haru, Kiyo + Yuki, Akari + Aiko
    });
  });
});
