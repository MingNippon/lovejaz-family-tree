export type Gender = 'male' | 'female';

export interface Person {
  id: string;
  name: string;
  gender: Gender;
  birthYear?: number | string;
  age?: number | string;
  isDeceased?: boolean;
  notes?: string;
  title?: string;
  avatarColor?: string;
}

export interface Union {
  id: string;
  partner1Id: string;
  partner2Id: string;
  childrenIds: string[];
}

export interface FamilyTreeData {
  version: string;
  title: string;
  subtitle?: string;
  description?: string;
  persons: Record<string, Person>;
  unions: Record<string, Union>;
  rootPersonId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  generation: number;
  gender: Gender;
}

export interface MarriageLine {
  id: string;
  partner1Id: string;
  partner2Id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  midX: number;
  midY: number;
  childrenIds: string[];
}

export interface SiblingBranch {
  unionId: string;
  stemStartX: number;
  stemStartY: number;
  stemEndY: number;
  barStartX: number;
  barEndX: number;
  childDrops: {
    childId: string;
    topX: number;
    topY: number;
    bottomX: number;
    bottomY: number;
  }[];
}

export interface GenerationTier {
  generation: number;
  label: string; // e.g. "Generation I"
  y: number;
  height: number;
}

export interface LayoutResult {
  nodes: Record<string, NodePosition>;
  marriages: MarriageLine[];
  branches: SiblingBranch[];
  generations: GenerationTier[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
  };
}
