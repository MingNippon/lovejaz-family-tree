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

  it('guarantees clearance routing: sibling bar is strictly below parent label zone and above children', () => {
    const mockTree: FamilyTreeData = {
      version: '1.0',
      title: 'Clearance Test',
      rootPersonId: 'p1',
      persons: {
        p1: { id: 'p1', name: 'Father', gender: 'male', birthYear: 1960 },
        p2: { id: 'p2', name: 'Mother', gender: 'female', birthYear: 1965 },
        c1: { id: 'c1', name: 'Child 1', gender: 'male', birthYear: 1990 },
      },
      unions: {
        u1: {
          id: 'u1',
          partner1Id: 'p1',
          partner2Id: 'p2',
          childrenIds: ['c1'],
        },
      },
    };

    const layout = computePedigreeLayout(mockTree);
    const branch = layout.branches[0];
    const parentY = layout.nodes['p1'].y;
    const parentLabelBottom = parentY + NODE_SIZE + 68;
    const childY = layout.nodes['c1'].y;

    // Sibling bar (stemEndY) must be strictly below parent label zone
    expect(branch.stemEndY).toBeGreaterThan(parentLabelBottom);
    // Sibling bar must be strictly above the top edge of child node
    expect(branch.stemEndY).toBeLessThan(childY);
    // Child drop line connects from bar to top of child node
    expect(branch.childDrops[0].topY).toBe(branch.stemEndY);
    expect(branch.childDrops[0].bottomY).toBe(childY);
  });

  it('places married siblings immediately adjacent to their spouses without slicing across other siblings', () => {
    const marriedSiblingsTree: FamilyTreeData = {
      version: '1.0',
      title: 'Married Siblings Test',
      rootPersonId: 'p1',
      persons: {
        p1: { id: 'p1', name: 'Father', gender: 'male' },
        p2: { id: 'p2', name: 'Mother', gender: 'female' },
        c1: { id: 'c1', name: 'Child 1 (Married)', gender: 'male' },
        c1_sp: { id: 'c1_sp', name: 'Spouse of Child 1', gender: 'female' },
        c2: { id: 'c2', name: 'Child 2 (Single)', gender: 'female' },
      },
      unions: {
        u_parents: {
          id: 'u_parents',
          partner1Id: 'p1',
          partner2Id: 'p2',
          childrenIds: ['c1', 'c2'],
        },
        u_c1: {
          id: 'u_c1',
          partner1Id: 'c1',
          partner2Id: 'c1_sp',
          childrenIds: [],
        },
      },
    };

    const layout = computePedigreeLayout(marriedSiblingsTree);

    // c1 and c1_sp must be adjacent couple
    const c1Pos = layout.nodes['c1'];
    const c1SpPos = layout.nodes['c1_sp'];
    const c2Pos = layout.nodes['c2'];

    expect(c1Pos).toBeDefined();
    expect(c1SpPos).toBeDefined();
    expect(c2Pos).toBeDefined();

    // c1 and c1_sp are adjacent
    expect(c1SpPos.x).toBe(c1Pos.x + NODE_SIZE + 80); // DEFAULT_SPOUSE_GAP = 80
    // c2 is placed after the family unit (c1 + c1_sp)
    expect(c2Pos.x).toBeGreaterThan(c1SpPos.x);

    // Marriage line between c1 and c1_sp is strictly 80px long
    const c1Marriage = layout.marriages.find(m => m.id === 'u_c1');
    expect(c1Marriage).toBeDefined();
    expect(c1Marriage!.x2 - c1Marriage!.x1).toBe(80);
  });

  it('scales layout dynamically and synchronously when custom spacing options are provided', () => {
    const simpleTree: FamilyTreeData = {
      version: '1.0',
      title: 'Spacing Test',
      rootPersonId: 'p1',
      persons: {
        p1: { id: 'p1', name: 'Father', gender: 'male' },
        p2: { id: 'p2', name: 'Mother', gender: 'female' },
        c1: { id: 'c1', name: 'Son', gender: 'male' },
        c2: { id: 'c2', name: 'Daughter', gender: 'female' },
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

    const standardLayout = computePedigreeLayout(simpleTree);
    const stretchedLayout = computePedigreeLayout(simpleTree, {
      siblingGap: 160,
      generationHeight: 320,
      spouseGap: 120,
    });

    // Stretched generation height
    const standardGenGap = standardLayout.nodes['c1'].y - standardLayout.nodes['p1'].y;
    const stretchedGenGap = stretchedLayout.nodes['c1'].y - stretchedLayout.nodes['p1'].y;
    expect(standardGenGap).toBe(240);
    expect(stretchedGenGap).toBe(320);

    // Stretched sibling gap
    const standardSibGap = standardLayout.nodes['c2'].x - (standardLayout.nodes['c1'].x + NODE_SIZE);
    const stretchedSibGap = stretchedLayout.nodes['c2'].x - (stretchedLayout.nodes['c1'].x + NODE_SIZE);
    expect(standardSibGap).toBe(90);
    expect(stretchedSibGap).toBe(160);

    // Stretched spouse gap
    const standardSpouseGap = standardLayout.nodes['p2'].x - (standardLayout.nodes['p1'].x + NODE_SIZE);
    const stretchedSpouseGap = stretchedLayout.nodes['p2'].x - (stretchedLayout.nodes['p1'].x + NODE_SIZE);
    expect(standardSpouseGap).toBe(80);
    expect(stretchedSpouseGap).toBe(120);
  });
});

