import { FamilyTreeData } from '../types/family';

/**
 * Returns a rich, curated 3-generation sample pedigree family tree.
 * Complies strictly with genetic/heritage pedigree conventions:
 * - Gen I: Grandfather (Male Square, 1952) + Grandmother (Female Circle, 1956)
 * - Gen II: 3 Children with spouses:
 *   - Eldest Son (Male Square) married to Daughter-in-law (Female Circle)
 *   - Daughter (Female Circle) married to Son-in-law (Male Square)
 *   - Youngest Son (Male Square, unmarried)
 * - Gen III: 4 Grandchildren (2 boys, 2 girls)
 */
export function getSampleFamilyTree(): FamilyTreeData {
  return {
    version: '1.0.0',
    title: 'The Dela Cruz & Santos Heritage',
    subtitle: 'Three Generations of Strength, Heritage & Family Legacy',
    description:
      'Curated sample pedigree showcasing 3 generations: male squares, female circles, marriage links, sibling branches, and life milestones.',
    rootPersonId: 'p_gen1_1',
    createdAt: '2026-10-05T00:00:00.000Z',
    updatedAt: '2026-10-05T00:00:00.000Z',
    persons: {
      // Generation I: Patriarch & Matriarch
      p_gen1_1: {
        id: 'p_gen1_1',
        name: 'Eduardo Dela Cruz',
        gender: 'male',
        birthYear: 1952,
        title: 'Patriarch / Grandfather',
        notes: 'Civil engineer & community elder; built the ancestral family home.',
        avatarColor: '#3B82F6',
      },
      p_gen1_2: {
        id: 'p_gen1_2',
        name: 'Maria Theresa Dela Cruz',
        gender: 'female',
        birthYear: 1956,
        title: 'Matriarch / Grandmother',
        notes: 'Botanist, educator, and beloved storyteller of family folklore.',
        avatarColor: '#EC4899',
      },

      // Generation II: 3 Children + 2 Spouses
      p_gen2_1: {
        id: 'p_gen2_1',
        name: 'Mateo Dela Cruz',
        gender: 'male',
        birthYear: 1978,
        title: 'Eldest Son',
        notes: 'Senior structural engineer and heritage preservation advocate.',
        avatarColor: '#3B82F6',
      },
      p_gen2_1_sp: {
        id: 'p_gen2_1_sp',
        name: 'Clarissa Reyes Dela Cruz',
        gender: 'female',
        birthYear: 1980,
        title: 'Daughter-in-law',
        notes: 'Landscape architect specializing in sustainable botanical gardens.',
        avatarColor: '#EC4899',
      },
      p_gen2_2: {
        id: 'p_gen2_2',
        name: 'Isabella Dela Cruz Santos',
        gender: 'female',
        birthYear: 1982,
        title: 'Daughter',
        notes: 'Associate professor of biochemistry and active youth mentor.',
        avatarColor: '#EC4899',
      },
      p_gen2_2_sp: {
        id: 'p_gen2_2_sp',
        name: 'Gabriel Santos',
        gender: 'male',
        birthYear: 1981,
        title: 'Son-in-law',
        notes: 'Software architect and competitive long-distance marathoner.',
        avatarColor: '#3B82F6',
      },
      p_gen2_3: {
        id: 'p_gen2_3',
        name: 'Rafael Dela Cruz',
        gender: 'male',
        birthYear: 1988,
        title: 'Youngest Son',
        notes: 'Award-winning documentary photographer and nature conservationist.',
        avatarColor: '#3B82F6',
      },

      // Generation III: 4 Grandchildren (2 boys, 2 girls)
      p_gen3_1: {
        id: 'p_gen3_1',
        name: 'Lucas Dela Cruz',
        gender: 'male',
        birthYear: 2008,
        age: 18,
        title: 'Grandson',
        notes: 'High school robotics captain and aspiring software engineer.',
        avatarColor: '#3B82F6',
      },
      p_gen3_2: {
        id: 'p_gen3_2',
        name: 'Sofia Dela Cruz',
        gender: 'female',
        birthYear: 2012,
        age: 14,
        title: 'Granddaughter',
        notes: 'Classical violinist, cellist, and regional youth chess champion.',
        avatarColor: '#EC4899',
      },
      p_gen3_3: {
        id: 'p_gen3_3',
        name: 'Julian Santos',
        gender: 'male',
        birthYear: 2011,
        age: 15,
        title: 'Grandson',
        notes: 'Varsity swimmer, math olympiad medalist, and sci-fi enthusiast.',
        avatarColor: '#3B82F6',
      },
      p_gen3_4: {
        id: 'p_gen3_4',
        name: 'Elena Santos',
        gender: 'female',
        birthYear: 2015,
        age: 11,
        title: 'Granddaughter',
        notes: 'Creative watercolor artist, avid reader, and wildlife protector.',
        avatarColor: '#EC4899',
      },
    },
    unions: {
      u_gen1: {
        id: 'u_gen1',
        partner1Id: 'p_gen1_1',
        partner2Id: 'p_gen1_2',
        childrenIds: ['p_gen2_1', 'p_gen2_2', 'p_gen2_3'],
      },
      u_gen2_1: {
        id: 'u_gen2_1',
        partner1Id: 'p_gen2_1',
        partner2Id: 'p_gen2_1_sp',
        childrenIds: ['p_gen3_1', 'p_gen3_2'],
      },
      u_gen2_2: {
        id: 'u_gen2_2',
        partner1Id: 'p_gen2_2',
        partner2Id: 'p_gen2_2_sp',
        childrenIds: ['p_gen3_3', 'p_gen3_4'],
      },
    },
  };
}
