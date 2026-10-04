import { describe, it, expect } from 'vitest';
import { computePedigreeLayout, NODE_SIZE } from './layout';
import { FamilyTreeData } from '../types/family';

describe('computePedigreeLayout', () => {
  it('correctly stratifies generations and positions couple + children', () => {
    const mockTree: FamilyTreeData = {
      version: '1.0',
      title: 'Test Family',
      rootPersonId: 'p1',
      persons: {
        p1: { id: 'p1', name: 'Father', gender: 'male', birthYear: 1960 },
        p2: { id: 'p2', name: 'Mother', gender: 'female', birthYear: 1965 },
        c1: { id: 'c1', name: 'Son', gender: 'male', birthYear: 1990 },
        c2: { id: 'c2', name: 'Daughter', gender: 'female', birthYear: 1995 },
      },
      unions: {
        u1: {
          id: 'u1',
          partner1Id: 'p1',
          partner2Id: 'p2',
          childrenIds: ['c1', 'c2'],
        },
      },
    };

    const layout = computePedigreeLayout(mockTree);

    // Generation checks
    expect(layout.generations.length).toBe(2);
    expect(layout.generations[0].label).toBe('Generation I');
    expect(layout.generations[1].label).toBe('Generation II');

    // Node generation checks
    expect(layout.nodes['p1'].generation).toBe(0);
    expect(layout.nodes['p2'].generation).toBe(0);
    expect(layout.nodes['c1'].generation).toBe(1);
    expect(layout.nodes['c2'].generation).toBe(1);

    // Marriage horizontal alignment: father and mother share exact same Y
    expect(layout.nodes['p1'].y).toBe(layout.nodes['p2'].y);

    // Children are placed strictly below parents
    expect(layout.nodes['c1'].y).toBeGreaterThan(layout.nodes['p1'].y);
    expect(layout.nodes['c2'].y).toBe(layout.nodes['c1'].y);

    // Children are spaced apart horizontally
    expect(layout.nodes['c2'].x).toBeGreaterThan(layout.nodes['c1'].x);

    // Marriage line mid-point connects the gap between partner 1 and partner 2
    expect(layout.marriages.length).toBe(1);
    expect(layout.marriages[0].midX).toBeCloseTo((layout.nodes['p1'].x + NODE_SIZE + layout.nodes['p2'].x) / 2);
    expect(layout.marriages[0].midX).toBeCloseTo((layout.marriages[0].x1 + layout.marriages[0].x2) / 2);

    // Branches drop down to children
    expect(layout.branches.length).toBe(1);
    expect(layout.branches[0].childDrops.length).toBe(2);
  });

  it('handles single unpartnered person with no children', () => {
    const singleTree: FamilyTreeData = {
      version: '1.0',
      title: 'Single Person Tree',
      rootPersonId: 'p1',
      persons: {
        p1: { id: 'p1', name: 'Solo', gender: 'female', birthYear: 2000 },
      },
      unions: {},
    };

    const layout = computePedigreeLayout(singleTree);

    expect(layout.generations.length).toBe(1);
    expect(layout.generations[0].label).toBe('Generation I');
    expect(layout.nodes['p1']).toBeDefined();
    expect(layout.nodes['p1'].generation).toBe(0);
    expect(layout.marriages.length).toBe(0);
    expect(layout.branches.length).toBe(0);
    expect(layout.bounds.width).toBeGreaterThan(0);
    expect(layout.bounds.height).toBeGreaterThan(0);
  });

  it('handles multi-generation lineage (3 generations)', () => {
    const threeGenTree: FamilyTreeData = {
      version: '1.0',
      title: 'Three Generation Family',
      rootPersonId: 'gp1',
      persons: {
        gp1: { id: 'gp1', name: 'Grandfather', gender: 'male', birthYear: 1935 },
        gp2: { id: 'gp2', name: 'Grandmother', gender: 'female', birthYear: 1940 },
        p1: { id: 'p1', name: 'Father', gender: 'male', birthYear: 1965 },
        p2: { id: 'p2', name: 'Mother', gender: 'female', birthYear: 1968 },
        c1: { id: 'c1', name: 'Grandchild', gender: 'female', birthYear: 1995 },
      },
      unions: {
        u1: {
          id: 'u1',
          partner1Id: 'gp1',
          partner2Id: 'gp2',
          childrenIds: ['p1'],
        },
        u2: {
          id: 'u2',
          partner1Id: 'p1',
          partner2Id: 'p2',
          childrenIds: ['c1'],
        },
      },
    };

    const layout = computePedigreeLayout(threeGenTree);

    expect(layout.generations.length).toBe(3);
    expect(layout.generations[0].label).toBe('Generation I');
    expect(layout.generations[1].label).toBe('Generation II');
    expect(layout.generations[2].label).toBe('Generation III');

    expect(layout.nodes['gp1'].generation).toBe(0);
    expect(layout.nodes['gp2'].generation).toBe(0);
    expect(layout.nodes['p1'].generation).toBe(1);
    expect(layout.nodes['p2'].generation).toBe(1);
    expect(layout.nodes['c1'].generation).toBe(2);

    expect(layout.nodes['p1'].y).toBeGreaterThan(layout.nodes['gp1'].y);
    expect(layout.nodes['c1'].y).toBeGreaterThan(layout.nodes['p1'].y);
  });

  it('ensures zero overlap/collision between nodes in the same generation', () => {
    const multiFamilyTree: FamilyTreeData = {
      version: '1.0',
      title: 'Multi Family Collisions Test',
      rootPersonId: 'f1',
      persons: {
        f1: { id: 'f1', name: 'Father 1', gender: 'male' },
        m1: { id: 'm1', name: 'Mother 1', gender: 'female' },
        c1: { id: 'c1', name: 'Child 1', gender: 'male' },
        c2: { id: 'c2', name: 'Child 2', gender: 'female' },
        f2: { id: 'f2', name: 'Father 2', gender: 'male' },
        m2: { id: 'm2', name: 'Mother 2', gender: 'female' },
        c3: { id: 'c3', name: 'Child 3', gender: 'male' },
      },
      unions: {
        u1: {
          id: 'u1',
          partner1Id: 'f1',
          partner2Id: 'm1',
          childrenIds: ['c1', 'c2'],
        },
        u2: {
          id: 'u2',
          partner1Id: 'f2',
          partner2Id: 'm2',
          childrenIds: ['c3'],
        },
      },
    };

    const layout = computePedigreeLayout(multiFamilyTree);

    // Check all nodes on each generation do not overlap
    const nodesByGen: Record<number, typeof layout.nodes[string][]> = {};
    Object.values(layout.nodes).forEach(n => {
      if (!nodesByGen[n.generation]) nodesByGen[n.generation] = [];
      nodesByGen[n.generation].push(n);
    });

    Object.values(nodesByGen).forEach(genNodes => {
      const sorted = [...genNodes].sort((a, b) => a.x - b.x);
      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];
        // The right edge of current must not exceed left edge of next
        expect(current.x + current.width).toBeLessThanOrEqual(next.x);
      }
    });
  });

  it('guarantees sibling bar connects stemStartX and all child drops seamlessly without disconnections', () => {
    // Tree where children may be right-shifted or uneven
    const shiftedTree: FamilyTreeData = {
      version: '1.0',
      title: 'Shifted Tree',
      rootPersonId: 'p1',
      persons: {
        p1: { id: 'p1', name: 'Father 1', gender: 'male' },
        p2: { id: 'p2', name: 'Mother 1', gender: 'female' },
        c1: { id: 'c1', name: 'Child 1', gender: 'male' },
        c2: { id: 'c2', name: 'Child 2', gender: 'female' },
        c3: { id: 'c3', name: 'Child 3', gender: 'male' },
      },
      unions: {
        u1: {
          id: 'u1',
          partner1Id: 'p1',
          partner2Id: 'p2',
          childrenIds: ['c1', 'c2', 'c3'],
        },
      },
    };

    const layout = computePedigreeLayout(shiftedTree);

    expect(layout.branches.length).toBeGreaterThan(0);
    layout.branches.forEach(branch => {
      // Sibling bar must encompass stem drop point
      expect(branch.barStartX).toBeLessThanOrEqual(branch.stemStartX);
      expect(branch.barEndX).toBeGreaterThanOrEqual(branch.stemStartX);

      // Sibling bar must encompass all child drops
      branch.childDrops.forEach(drop => {
        expect(branch.barStartX).toBeLessThanOrEqual(drop.topX);
        expect(branch.barEndX).toBeGreaterThanOrEqual(drop.topX);
      });
    });
  });
});
