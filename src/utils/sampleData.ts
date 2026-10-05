import { FamilyTreeData } from '../types/family';

/**
 * Returns the curated 3-generation sample pedigree family tree for LoveJaz:
 * - Generation I: M + J
 *   - Emu Palomar (Male Square, 2007)
 *   - Jazmine Palomar (Female Circle, 2007)
 * - Generation II: 5 Children
 *   - Haru Palomar (Male Square)
 *   - Kiyo Palomar (Male Square)
 *   - Yuki Palomar (Female Circle)
 *   - Akari Palomar (Male Square)
 *   - Aiko Palomar (Female Circle)
 * - Generation III: 4 Grandchildren
 *   - Rin Palomar (Female Circle)
 *   - Xyril Palomar (Female Circle)
 *   - Darel Palomar (Female Circle)
 *   - Minh Palomar (Male Square)
 */
export function getSampleFamilyTree(): FamilyTreeData {
  return {
    version: '1.0.0',
    title: 'The Palomar Family Heritage',
    subtitle: 'Generation I: M + J (2007) • Generation II: 5 Children • Generation III: 4 Grandchildren',
    description:
      'Curated sample pedigree showcasing 3 generations: male squares, female circles, marriage links, sibling branches, and life milestones.',
    rootPersonId: 'p_gen1_1',
    createdAt: '2026-10-05T00:00:00.000Z',
    updatedAt: '2026-10-05T00:00:00.000Z',
    persons: {
      // Generation I: M + J (2007)
      p_gen1_1: {
        id: 'p_gen1_1',
        name: 'Emu Palomar',
        gender: 'male',
        birthYear: 2007,
        title: 'Founder / Father (M)',
        notes: 'M + J Founder; loving patriarch of the Palomar family.',
        avatarColor: '#3B82F6',
      },
      p_gen1_2: {
        id: 'p_gen1_2',
        name: 'Jazmine Palomar',
        gender: 'female',
        birthYear: 2007,
        title: 'Founder / Mother (J)',
        notes: 'Co-founder of LoveJaz; devoted mother and heart of the family.',
        avatarColor: '#EC4899',
      },

      // Generation II: 5 Children
      p_gen2_1: {
        id: 'p_gen2_1',
        name: 'Haru Palomar',
        gender: 'male',
        birthYear: 2026,
        title: 'Eldest Son',
        notes: 'First child of Emu & Jazmine; father of Rin & Xyril.',
        avatarColor: '#3B82F6',
      },
      p_gen2_2: {
        id: 'p_gen2_2',
        name: 'Kiyo Palomar',
        gender: 'male',
        birthYear: 2028,
        title: 'Second Son',
        notes: 'Second child; father of Darel & Minh.',
        avatarColor: '#3B82F6',
      },
      p_gen2_3: {
        id: 'p_gen2_3',
        name: 'Yuki Palomar',
        gender: 'female',
        birthYear: 2030,
        title: 'Eldest Daughter',
        notes: 'Loving aunt, biochemist, and artist.',
        avatarColor: '#EC4899',
      },
      p_gen2_4: {
        id: 'p_gen2_4',
        name: 'Akari Palomar',
        gender: 'male',
        birthYear: 2032,
        title: 'Third Son',
        notes: 'Visual artist, photographer, and world traveler.',
        avatarColor: '#3B82F6',
      },
      p_gen2_5: {
        id: 'p_gen2_5',
        name: 'Aiko Palomar',
        gender: 'female',
        birthYear: 2035,
        title: 'Youngest Daughter',
        notes: 'Youngest sister, writer, and youth mentor.',
        avatarColor: '#EC4899',
      },

      // Generation III: 4 Grandchildren
      p_gen3_1: {
        id: 'p_gen3_1',
        name: 'Rin Palomar',
        gender: 'female',
        birthYear: 2046,
        age: 10,
        title: 'Granddaughter',
        notes: 'Daughter of Haru Palomar; violinist and chess player.',
        avatarColor: '#EC4899',
      },
      p_gen3_2: {
        id: 'p_gen3_2',
        name: 'Xyril Palomar',
        gender: 'female',
        birthYear: 2048,
        age: 8,
        title: 'Granddaughter',
        notes: 'Daughter of Haru Palomar; swimmer and creative artist.',
        avatarColor: '#EC4899',
      },
      p_gen3_3: {
        id: 'p_gen3_3',
        name: 'Darel Palomar',
        gender: 'female',
        birthYear: 2050,
        age: 6,
        title: 'Granddaughter',
        notes: 'Daughter of Kiyo Palomar; creative dancer.',
        avatarColor: '#EC4899',
      },
      p_gen3_4: {
        id: 'p_gen3_4',
        name: 'Minh Palomar',
        gender: 'male',
        birthYear: 2052,
        age: 4,
        title: 'Grandson',
        notes: 'Son of Kiyo Palomar; curious explorer and robotics fan.',
        avatarColor: '#3B82F6',
      },
    },
    unions: {
      u_gen1: {
        id: 'u_gen1',
        partner1Id: 'p_gen1_1',
        partner2Id: 'p_gen1_2',
        childrenIds: ['p_gen2_1', 'p_gen2_2', 'p_gen2_3', 'p_gen2_4', 'p_gen2_5'],
      },
      u_gen2_1: {
        id: 'u_gen2_1',
        partner1Id: 'p_gen2_1',
        partner2Id: '',
        childrenIds: ['p_gen3_1', 'p_gen3_2'],
      },
      u_gen2_2: {
        id: 'u_gen2_2',
        partner1Id: 'p_gen2_2',
        partner2Id: '',
        childrenIds: ['p_gen3_3', 'p_gen3_4'],
      },
    },
  };
}
