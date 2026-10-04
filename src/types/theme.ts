export type VisualThemeId = 'minimalist' | 'vintage' | 'navy' | 'dark';

export type ExportFormat = 'png' | 'svg' | 'pdf';

export type ExportResolution = 1 | 2 | 4;

export interface ThemeConfig {
  id: VisualThemeId;
  name: string;
  description: string;
  background: string;
  nodeMaleFill: string;
  nodeMaleStroke: string;
  nodeFemaleFill: string;
  nodeFemaleStroke: string;
  marriageStroke: string;
  siblingStroke: string;
  textPrimary: string;
  textSecondary: string;
  fontClass: string;
  borderStyle: string;
  isDark: boolean;
  fontFamily?: string;
  accentColor?: string;
  borderColor?: string;
  cardBackground?: string;
}

export interface ExportOptions {
  theme: VisualThemeId;
  resolution: ExportResolution;
  format: ExportFormat;
  includeTitle: boolean;
  includeGenerations: boolean;
  includeLegend: boolean;
  includeBorder: boolean;
  treeTitle: string;
  treeSubtitle?: string;
}
