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
    const p1Id = union.partner1Id;
    const p2Id = union.partner2Id;

    if (p1Id && p2Id) {
      if (!spouseOf[p1Id]) spouseOf[p1Id] = [];
      if (!spouseOf[p2Id]) spouseOf[p2Id] = [];
      spouseOf[p1Id].push(p2Id);
      spouseOf[p2Id].push(p1Id);
    }

    const parents = [p1Id, p2Id].filter(Boolean);
    union.childrenIds.forEach((childId) => {
      if (!parentOf[childId]) parentOf[childId] = [];
      parentOf[childId].push(...parents);

      parents.forEach((parentId) => {
        if (!childrenOfPerson[parentId]) childrenOfPerson[parentId] = [];
        childrenOfPerson[parentId].push(childId);
      });
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

    // Unify spouse generations & propagate to children
    Object.values(tree.unions).forEach((union) => {
      const p1Id = union.partner1Id;
      const p2Id = union.partner2Id;
      const g1 = p1Id ? personGen[p1Id] ?? 0 : 0;
      const g2 = p2Id ? personGen[p2Id] ?? 0 : 0;
      const hasSpouse = Boolean(p1Id && p2Id && tree.persons[p1Id] && tree.persons[p2Id]);
      const maxSpouseGen = hasSpouse ? Math.max(g1, g2) : (p1Id ? g1 : g2);

      if (hasSpouse) {
        if (g1 < maxSpouseGen) {
          personGen[p1Id] = maxSpouseGen;
          changed = true;
        }
        if (g2 < maxSpouseGen) {
          personGen[p2Id] = maxSpouseGen;
          changed = true;
        }
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
    const genA = a.partner1Id
      ? personGen[a.partner1Id] ?? 0
      : a.partner2Id
        ? personGen[a.partner2Id] ?? 0
        : 0;
    const genB = b.partner1Id
      ? personGen[b.partner1Id] ?? 0
      : b.partner2Id
        ? personGen[b.partner2Id] ?? 0
        : 0;
    return genA - genB;
  });

  unionList.forEach((union) => {
    const p1 = union.partner1Id ? tree.persons[union.partner1Id] : undefined;
    const p2 = union.partner2Id ? tree.persons[union.partner2Id] : undefined;
    if (!p1 && !p2) return;

    const hasSpouse = Boolean(p1 && p2);
    const mainParent = p1 || p2!;
    const spouse = p1 ? p2 : undefined;

    const g = personGen[mainParent.id] ?? 0;
    const y = PADDING + g * generationHeight;
    const childGen = g + 1;

    const mainParentPositioned = positionedPersons.has(mainParent.id);
    const spousePositioned = spouse ? positionedPersons.has(spouse.id) : false;

    let p1X = 0;
    let p2X = 0;

    // Helper: calculate children units (coupling children with their spouses so they stay adjacent)
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
            (u.partner1Id === childId && u.partner2Id && !positionedPersons.has(u.partner2Id)) ||
            (u.partner2Id === childId && u.partner1Id && !positionedPersons.has(u.partner1Id))
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

    let stemStartX = 0;
    let stemStartY = 0;

    if (hasSpouse && spouse) {
      // Coupled union with two partners
      if (!mainParentPositioned && !spousePositioned) {
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
        placePerson(mainParent.id, p1X, g);
        placePerson(spouse.id, p2X, g);
      } else if (mainParentPositioned && !spousePositioned) {
        p1X = nodes[mainParent.id].x;
        p2X = p1X + NODE_SIZE + spouseGap;
        placePerson(spouse.id, p2X, g);
      } else if (!mainParentPositioned && spousePositioned) {
        p2X = nodes[spouse.id].x;
        p1X = Math.max(PADDING, p2X - (NODE_SIZE + spouseGap));
        placePerson(mainParent.id, p1X, g);
      } else {
        p1X = nodes[mainParent.id].x;
        p2X = nodes[spouse.id].x;
      }

      const leftX = Math.min(p1X, p2X);
      const rightX = Math.max(p1X, p2X);
      const marriageLine: MarriageLine = {
        id: union.id,
        partner1Id: mainParent.id,
        partner2Id: spouse.id,
        x1: leftX + NODE_SIZE,
        y1: y + NODE_SIZE / 2,
        x2: rightX,
        y2: y + NODE_SIZE / 2,
        midX: (leftX + NODE_SIZE + rightX) / 2,
        midY: y + NODE_SIZE / 2,
        childrenIds: union.childrenIds,
      };
      marriages.push(marriageLine);

      stemStartX = marriageLine.midX;
      stemStartY = marriageLine.midY;
    } else {
      // Single parent union (no spouse)
      if (!mainParentPositioned) {
        const minParentX = maxXByGen[g] ? maxXByGen[g] + familyGap : PADDING;
        let startX = minParentX;

        if (union.childrenIds.length > 0) {
          const minChildX = maxXByGen[childGen] ? maxXByGen[childGen] + familyGap : PADDING;
          const midOffset = NODE_SIZE / 2;
          const childStartOffset = midOffset - totalChildrenWidth / 2;
          if (startX + childStartOffset < minChildX) {
            startX = minChildX - childStartOffset;
          }
        }

        placePerson(mainParent.id, startX, g);
      }

      stemStartX = nodes[mainParent.id].x + NODE_SIZE / 2;
      // Drop from below the label area so it never intersects the name or badge
      stemStartY = y + NODE_SIZE + 68;
    }

    // Layout children & sibling branch
    if (union.childrenIds.length > 0) {
      const childY = PADDING + childGen * generationHeight;
      const minChildX = maxXByGen[childGen] ? maxXByGen[childGen] + siblingGap : PADDING;

      let childStartX = stemStartX - totalChildrenWidth / 2;
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
        const barStartX = Math.min(minChildDropX, stemStartX);
        const barEndX = Math.max(maxChildDropX, stemStartX);

        branches.push({
          unionId: union.id,
          stemStartX,
          stemStartY,
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
