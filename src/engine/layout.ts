import {
  FamilyTreeData,
  LayoutResult,
  NodePosition,
  MarriageLine,
  SiblingBranch,
  GenerationTier,
  LayoutSpacingOptions,
} from '../types/family';

export const NODE_SIZE = 72; // Width & height of square / circle
export const DEFAULT_SPOUSE_GAP = 80; // Distance between married couple
export const DEFAULT_SIBLING_GAP = 90; // Horizontal gap between siblings
export const DEFAULT_GENERATION_HEIGHT = 240; // Vertical distance between generations (guarantees clear clearance below labels)
export const DEFAULT_FAMILY_GAP = 110; // Gap between distinct family units on the same generation
export const PADDING = 100;

// Aliases for backwards compatibility
export const SPOUSE_GAP = DEFAULT_SPOUSE_GAP;
export const SIBLING_GAP = DEFAULT_SIBLING_GAP;
export const GENERATION_HEIGHT = DEFAULT_GENERATION_HEIGHT;

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

export function computePedigreeLayout(
  tree: FamilyTreeData,
  spacing?: LayoutSpacingOptions
): LayoutResult {
  const nodes: Record<string, NodePosition> = {};
  const marriages: MarriageLine[] = [];
  const branches: SiblingBranch[] = [];
  const generations: GenerationTier[] = [];

  const spouseGap = spacing?.spouseGap ?? DEFAULT_SPOUSE_GAP;
  const siblingGap = spacing?.siblingGap ?? DEFAULT_SIBLING_GAP;
  const generationHeight = spacing?.generationHeight ?? DEFAULT_GENERATION_HEIGHT;
  const familyGap = spacing?.familyGap ?? DEFAULT_FAMILY_GAP;

  // 1. Calculate generational depths using iterative propagation
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
    const y = PADDING + g * generationHeight;
    generations.push({
      generation: g,
      label: `Generation ${romanNumeral(g + 1)}`,
      y,
      height: generationHeight,
    });
  }

  // Positioning: place roots, unions, and children
  const maxXByGen: Record<number, number> = {};
  const positionedPersons = new Set<string>();

  function placePerson(personId: string, x: number, gen: number) {
    const person = tree.persons[personId];
    if (!person) return;
    const y = PADDING + gen * generationHeight;
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
    const y = PADDING + g * generationHeight;

    const p1Positioned = positionedPersons.has(p1.id);
    const p2Positioned = positionedPersons.has(p2.id);

    let p1X = 0;
    let p2X = 0;

    // Helper: calculate children units (coupling children with their spouses so they stay adjacent)
    const childGen = g + 1;
    const childUnits: {
      primaryChildId: string;
      spouseId?: string;
      width: number;
    }[] = [];

    if (union.childrenIds.length > 0) {
      union.childrenIds.forEach((childId) => {
        // Find if this child is married to someone who hasn't been placed yet
        const childUnion = Object.values(tree.unions).find(
          (u) =>
            (u.partner1Id === childId && !positionedPersons.has(u.partner2Id)) ||
            (u.partner2Id === childId && !positionedPersons.has(u.partner1Id))
        );
        const spouseId = childUnion
          ? childUnion.partner1Id === childId
            ? childUnion.partner2Id
            : childUnion.partner1Id
          : undefined;

        if (spouseId && tree.persons[spouseId]) {
          childUnits.push({
            primaryChildId: childId,
            spouseId,
            width: NODE_SIZE * 2 + spouseGap,
          });
        } else {
          childUnits.push({
            primaryChildId: childId,
            width: NODE_SIZE,
          });
        }
      });
    }

    let totalChildrenWidth = 0;
    childUnits.forEach((unit, idx) => {
      totalChildrenWidth += unit.width;
      if (idx < childUnits.length - 1) {
        const nextUnit = childUnits[idx + 1];
        const gap = unit.spouseId || nextUnit.spouseId ? familyGap : siblingGap;
        totalChildrenWidth += gap;
      }
    });

    if (!p1Positioned && !p2Positioned) {
      const minParentX = maxXByGen[g] ? maxXByGen[g] + familyGap : PADDING;
      let startX = minParentX;

      if (union.childrenIds.length > 0) {
        const minChildX = maxXByGen[childGen] ? maxXByGen[childGen] + familyGap : PADDING;
        const totalParentsWidth = NODE_SIZE * 2 + spouseGap;
        const midOffset = totalParentsWidth / 2;
        const childStartOffset = midOffset - totalChildrenWidth / 2;
        if (startX + childStartOffset < minChildX) {
          startX = minChildX - childStartOffset;
        }
      }

      p1X = startX;
      p2X = p1X + NODE_SIZE + spouseGap;
      placePerson(p1.id, p1X, g);
      placePerson(p2.id, p2X, g);
    } else if (p1Positioned && !p2Positioned) {
      p1X = nodes[p1.id].x;
      p2X = p1X + NODE_SIZE + spouseGap;
      placePerson(p2.id, p2X, g);
    } else if (!p1Positioned && p2Positioned) {
      p2X = nodes[p2.id].x;
      p1X = Math.max(PADDING, p2X - (NODE_SIZE + spouseGap));
      if (positionedPersons.has(p1.id)) {
        p1X = nodes[p1.id].x;
      } else {
        placePerson(p1.id, p1X, g);
      }
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

    // Layout children & sibling branch
    if (union.childrenIds.length > 0) {
      const childY = PADDING + childGen * generationHeight;
      const minChildX = maxXByGen[childGen] ? maxXByGen[childGen] + siblingGap : PADDING;

      let childStartX = marriageLine.midX - totalChildrenWidth / 2;
      if (childStartX < minChildX) {
        childStartX = minChildX;
      }

      // Position children units
      let currX = childStartX;
      childUnits.forEach((unit, idx) => {
        const isChildPlaced = positionedPersons.has(unit.primaryChildId);
        if (!isChildPlaced) {
          if (unit.spouseId && !positionedPersons.has(unit.spouseId)) {
            placePerson(unit.primaryChildId, currX, childGen);
            placePerson(unit.spouseId, currX + NODE_SIZE + spouseGap, childGen);
            currX += NODE_SIZE * 2 + spouseGap;
          } else {
            placePerson(unit.primaryChildId, currX, childGen);
            currX += NODE_SIZE;
          }
        } else {
          currX = Math.max(currX, (nodes[unit.primaryChildId]?.x ?? currX) + NODE_SIZE);
        }

        if (idx < childUnits.length - 1) {
          const nextUnit = childUnits[idx + 1];
          const gap = unit.spouseId || nextUnit.spouseId ? familyGap : siblingGap;
          currX += gap;
        }
      });

      // Clearance calculation for sibling bar:
      // Node text labels extend up to ~68px below node shape (y + NODE_SIZE + 68)
      // We route the horizontal sibling bar in the clear vertical channel between
      // the parent text bottom and child node top:
      const parentTextBottom = y + NODE_SIZE + 68;
      const channelHeight = childY - parentTextBottom;
      const barY = Math.round(parentTextBottom + Math.max(channelHeight * 0.4, 20));

      const childDrops: SiblingBranch['childDrops'] = [];
      union.childrenIds.forEach((childId) => {
        if (!nodes[childId]) return;
        const cx = nodes[childId].x + NODE_SIZE / 2;
        childDrops.push({
          childId,
          topX: cx,
          topY: barY,
          bottomX: cx,
          bottomY: childY,
        });
      });

      if (childDrops.length > 0) {
        const childXs = childDrops.map((d) => d.topX);
        const minChildDropX = Math.min(...childXs);
        const maxChildDropX = Math.max(...childXs);
        const barStartX = Math.min(minChildDropX, marriageLine.midX);
        const barEndX = Math.max(maxChildDropX, marriageLine.midX);

        branches.push({
          unionId: union.id,
          stemStartX: marriageLine.midX,
          stemStartY: marriageLine.midY,
          stemEndY: barY,
          barStartX,
          barEndX,
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
      const nextX = maxXByGen[g] ? maxXByGen[g] + siblingGap : PADDING;
      placePerson(pId, nextX, g);
    }
  });

  // Calculate total bounding box (adding bottom margin for name/date labels)
  const allX = Object.values(nodes).map((n) => n.x);
  const allY = Object.values(nodes).map((n) => n.y);
  const minX = (allX.length > 0 ? Math.min(...allX) : 0) - PADDING;
  const maxX = (allX.length > 0 ? Math.max(...allX.map((x) => x + NODE_SIZE)) : 800) + PADDING;
  const minY = (allY.length > 0 ? Math.min(...allY) : 0) - PADDING;
  const maxY = (allY.length > 0 ? Math.max(...allY.map((y) => y + NODE_SIZE + 100)) : 600) + PADDING;

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
