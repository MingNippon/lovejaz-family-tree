import {
  FamilyTreeData,
  LayoutResult,
  NodePosition,
  MarriageLine,
  SiblingBranch,
  GenerationTier,
} from '../types/family';

export const NODE_SIZE = 72; // Width & height of square / circle
export const SPOUSE_GAP = 70; // Distance between married couple
export const SIBLING_GAP = 60; // Horizontal gap between siblings
export const GENERATION_HEIGHT = 180; // Vertical distance between generations
export const PADDING = 100;

export function romanNumeral(num: number): string {
  const lookup: [number, string][] = [
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let result = '';
  let n = num;
  for (const [val, roman] of lookup) {
    while (n >= val) {
      result += roman;
      n -= val;
    }
  }
  return result || 'I';
}

export function computePedigreeLayout(tree: FamilyTreeData): LayoutResult {
  const nodes: Record<string, NodePosition> = {};
  const marriages: MarriageLine[] = [];
  const branches: SiblingBranch[] = [];
  const generations: GenerationTier[] = [];

  // 1. Calculate generational depths using BFS/DFS / iterative propagation
  const parentOf: Record<string, string[]> = {};
  const childrenOfPerson: Record<string, string[]> = {};
  const spouseOf: Record<string, string[]> = {};

  Object.values(tree.unions).forEach((union) => {
    if (!spouseOf[union.partner1Id]) spouseOf[union.partner1Id] = [];
    if (!spouseOf[union.partner2Id]) spouseOf[union.partner2Id] = [];
    spouseOf[union.partner1Id].push(union.partner2Id);
    spouseOf[union.partner2Id].push(union.partner1Id);

    union.childrenIds.forEach((childId) => {
      if (!parentOf[childId]) parentOf[childId] = [];
      parentOf[childId].push(union.partner1Id, union.partner2Id);

      if (!childrenOfPerson[union.partner1Id]) childrenOfPerson[union.partner1Id] = [];
      childrenOfPerson[union.partner1Id].push(childId);
      if (!childrenOfPerson[union.partner2Id]) childrenOfPerson[union.partner2Id] = [];
      childrenOfPerson[union.partner2Id].push(childId);
    });
  });

  // Assign generations iteratively to guarantee parents < children and spouses share generation
  const personGen: Record<string, number> = {};
  const allPersonIds = Object.keys(tree.persons);
  allPersonIds.forEach((id) => {
    personGen[id] = 0;
  });

  let changed = true;
  let iterations = 0;
  const maxIterations = Math.max(allPersonIds.length * 2, 20);

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // Unify spouse generations
    Object.values(tree.unions).forEach((union) => {
      const g1 = personGen[union.partner1Id] ?? 0;
      const g2 = personGen[union.partner2Id] ?? 0;
      const maxSpouseGen = Math.max(g1, g2);

      if (g1 < maxSpouseGen) {
        personGen[union.partner1Id] = maxSpouseGen;
        changed = true;
      }
      if (g2 < maxSpouseGen) {
        personGen[union.partner2Id] = maxSpouseGen;
        changed = true;
      }

      // Propagate to children
      const requiredChildGen = maxSpouseGen + 1;
      union.childrenIds.forEach((childId) => {
        if (personGen[childId] !== undefined && personGen[childId] < requiredChildGen) {
          personGen[childId] = requiredChildGen;
          changed = true;
        }
      });
    });
  }

  const maxGen = Math.max(...Object.values(personGen), 0);

  for (let g = 0; g <= maxGen; g++) {
    const y = PADDING + g * GENERATION_HEIGHT;
    generations.push({
      generation: g,
      label: `Generation ${romanNumeral(g + 1)}`,
      y,
      height: GENERATION_HEIGHT,
    });
  }

  // Positioning: place roots, unions, and children
  // Track rightmost X position on each generation to prevent any collisions
  const maxXByGen: Record<number, number> = {};
  const positionedPersons = new Set<string>();

  // Helper to place a person node
  function placePerson(personId: string, x: number, gen: number) {
    const person = tree.persons[personId];
    if (!person) return;
    const y = PADDING + gen * GENERATION_HEIGHT;
    nodes[personId] = {
      id: personId,
      x,
      y,
      width: NODE_SIZE,
      height: NODE_SIZE,
      generation: gen,
      gender: person.gender,
    };
    positionedPersons.add(personId);
    maxXByGen[gen] = Math.max(maxXByGen[gen] ?? 0, x + NODE_SIZE);
  }

  // Sort unions by generation level so older generations are positioned first
  const unionList = Object.values(tree.unions).sort((a, b) => {
    const genA = Math.min(personGen[a.partner1Id] ?? 0, personGen[a.partner2Id] ?? 0);
    const genB = Math.min(personGen[b.partner1Id] ?? 0, personGen[b.partner2Id] ?? 0);
    return genA - genB;
  });

  unionList.forEach((union) => {
    const p1 = tree.persons[union.partner1Id];
    const p2 = tree.persons[union.partner2Id];
    if (!p1 || !p2) return;

    const g = personGen[p1.id] ?? 0;
    const y = PADDING + g * GENERATION_HEIGHT;

    // Check if either partner is already positioned
    const p1Positioned = positionedPersons.has(p1.id);
    const p2Positioned = positionedPersons.has(p2.id);

    let p1X = 0;
    let p2X = 0;

    if (!p1Positioned && !p2Positioned) {
      // Find starting X that accommodates both parents and children with zero collisions
      const minParentX = maxXByGen[g] ? maxXByGen[g] + 80 : PADDING;
      let startX = minParentX;

      if (union.childrenIds.length > 0) {
        const childGen = g + 1;
        const minChildX = maxXByGen[childGen] ? maxXByGen[childGen] + 80 : PADDING;
        const childCount = union.childrenIds.length;
        const totalChildrenWidth = childCount * NODE_SIZE + (childCount - 1) * SIBLING_GAP;
        const totalParentsWidth = NODE_SIZE * 2 + SPOUSE_GAP;

        // If children are wider, adjust startX so children start at least at minChildX
        const midOffset = totalParentsWidth / 2;
        const childStartOffset = midOffset - totalChildrenWidth / 2;
        if (startX + childStartOffset < minChildX) {
          startX = minChildX - childStartOffset;
        }
      }

      p1X = startX;
      p2X = p1X + NODE_SIZE + SPOUSE_GAP;
      placePerson(p1.id, p1X, g);
      placePerson(p2.id, p2X, g);
    } else if (p1Positioned && !p2Positioned) {
      p1X = nodes[p1.id].x;
      p2X = Math.max(
        p1X + NODE_SIZE + SPOUSE_GAP,
        maxXByGen[g] ? maxXByGen[g] + SPOUSE_GAP : p1X + NODE_SIZE + SPOUSE_GAP
      );
      placePerson(p2.id, p2X, g);
    } else if (!p1Positioned && p2Positioned) {
      p2X = nodes[p2.id].x;
      p1X = Math.max(
        p2X + NODE_SIZE + SPOUSE_GAP,
        maxXByGen[g] ? maxXByGen[g] + SPOUSE_GAP : p2X + NODE_SIZE + SPOUSE_GAP
      );
      placePerson(p1.id, p1X, g);
    } else {
      p1X = nodes[p1.id].x;
      p2X = nodes[p2.id].x;
    }

    // Marriage line between p1 and p2
    const leftX = Math.min(p1X, p2X);
    const rightX = Math.max(p1X, p2X);
    const marriageLine: MarriageLine = {
      id: union.id,
      partner1Id: p1.id,
      partner2Id: p2.id,
      x1: leftX + NODE_SIZE,
      y1: y + NODE_SIZE / 2,
      x2: rightX,
      y2: y + NODE_SIZE / 2,
      midX: (leftX + NODE_SIZE + rightX) / 2,
      midY: y + NODE_SIZE / 2,
      childrenIds: union.childrenIds,
    };
    marriages.push(marriageLine);

    // Layout children
    if (union.childrenIds.length > 0) {
      const childGen = g + 1;
      const childY = PADDING + childGen * GENERATION_HEIGHT;
      const childCount = union.childrenIds.length;
      const totalChildrenWidth = childCount * NODE_SIZE + (childCount - 1) * SIBLING_GAP;

      let childStartX = marriageLine.midX - totalChildrenWidth / 2;
      const minChildX = maxXByGen[childGen] ? maxXByGen[childGen] + SIBLING_GAP : PADDING;
      if (childStartX < minChildX) {
        childStartX = minChildX;
      }

      const childDrops: SiblingBranch['childDrops'] = [];

      union.childrenIds.forEach((childId, index) => {
        const child = tree.persons[childId];
        if (!child) return;

        let cx: number;
        if (positionedPersons.has(childId)) {
          cx = nodes[childId].x;
        } else {
          cx = childStartX + index * (NODE_SIZE + SIBLING_GAP);
          placePerson(childId, cx, childGen);
        }

        childDrops.push({
          childId,
          topX: cx + NODE_SIZE / 2,
          topY: marriageLine.midY + 45,
          bottomX: cx + NODE_SIZE / 2,
          bottomY: childY,
        });
      });

      if (childDrops.length > 0) {
        const childXs = childDrops.map((d) => d.topX);
        const minChildDropX = Math.min(...childXs);
        const maxChildDropX = Math.max(...childXs);

        branches.push({
          unionId: union.id,
          stemStartX: marriageLine.midX,
          stemStartY: marriageLine.midY,
          stemEndY: marriageLine.midY + 45,
          barStartX: minChildDropX,
          barEndX: maxChildDropX,
          childDrops,
        });
      }
    }
  });

  // Handle single / unpartnered persons
  allPersonIds.forEach((pId) => {
    if (!positionedPersons.has(pId)) {
      const p = tree.persons[pId];
      if (!p) return;
      const g = personGen[pId] ?? 0;
      const nextX = maxXByGen[g] ? maxXByGen[g] + 80 : PADDING;
      placePerson(pId, nextX, g);
    }
  });

  // Calculate total bounding box
  const allX = Object.values(nodes).map((n) => n.x);
  const allY = Object.values(nodes).map((n) => n.y);
  const minX = (allX.length > 0 ? Math.min(...allX) : 0) - PADDING;
  const maxX = (allX.length > 0 ? Math.max(...allX.map((x) => x + NODE_SIZE)) : 800) + PADDING;
  const minY = (allY.length > 0 ? Math.min(...allY) : 0) - PADDING;
  const maxY = (allY.length > 0 ? Math.max(...allY.map((y) => y + NODE_SIZE)) : 600) + PADDING;

  return {
    nodes,
    marriages,
    branches,
    generations,
    bounds: {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    },
  };
}
