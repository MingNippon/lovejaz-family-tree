import React from 'react';
import { GenerationTier, LayoutResult } from '../types/family';
import { useI18n } from '../i18n';

export interface GenerationRulerProps {
  generations: GenerationTier[];
  bounds: LayoutResult['bounds'];
  visible?: boolean;
  theme?: string;
  className?: string;
}

export function romanNumeral(num: number): string {
  const lookup: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let result = '';
  let n = Math.max(1, Math.floor(num));
  for (const [val, roman] of lookup) {
    while (n >= val) {
      result += roman;
      n -= val;
    }
  }
  return result || 'I';
}

export function formatGenerationLabel(
  generation: number,
  t?: (key: string, params?: Record<string, string | number>) => string,
  fallbackLabel?: string
): string {
  const roman = romanNumeral(generation + 1);
  if (t) {
    const translated = t('generationLabel', { num: roman });
    if (translated && translated !== 'generationLabel') {
      return translated;
    }
  }
  return fallbackLabel || `Generation ${roman}`;
}

export const GenerationRuler: React.FC<GenerationRulerProps> = ({
  generations,
  bounds,
  visible = true,
  theme,
  className,
}) => {
  const { t } = useI18n();

  if (!visible || !generations || generations.length === 0) {
    return null;
  }

  // Calculate horizontal guide bounds
  const guideStartX = bounds.minX - 30;
  const guideEndX = bounds.maxX + 50;
  const badgeWidth = 120;
  const badgeHeight = 26;
  const badgeX = bounds.minX - badgeWidth - 45;

  return (
    <g
      data-testid="generation-ruler"
      data-theme={theme}
      className={className || 'generation-ruler select-none'}
      pointerEvents="none"
    >
      {generations.map((tier) => {
        const displayLabel = formatGenerationLabel(tier.generation, t, tier.label);

        // Node center Y is tier.y + 36 (half of NODE_SIZE 72)
        const centerY = tier.y + 36;
        const badgeY = centerY - badgeHeight / 2;

        return (
          <g
            key={tier.generation}
            data-testid={`generation-tier-${tier.generation}`}
            className="generation-tier"
          >
            {/* Subtle horizontal guide line spanning across the generation */}
            <line
              x1={guideStartX}
              y1={centerY}
              x2={guideEndX}
              y2={centerY}
              stroke="rgba(148, 163, 184, 0.2)"
              strokeWidth={1}
              strokeDasharray="4 6"
            />

            {/* Connecting dot at left edge of guide line */}
            <circle
              cx={guideStartX}
              cy={centerY}
              r={2.5}
              fill="rgba(148, 163, 184, 0.4)"
            />

            {/* Connecting dot at right edge of guide line */}
            <circle
              cx={guideEndX}
              cy={centerY}
              r={2.5}
              fill="rgba(148, 163, 184, 0.4)"
            />

            {/* Left generation badge pill */}
            <g className="generation-badge">
              {/* Badge backdrop */}
              <rect
                x={badgeX}
                y={badgeY}
                width={badgeWidth}
                height={badgeHeight}
                rx={badgeHeight / 2}
                ry={badgeHeight / 2}
                fill="rgba(15, 23, 42, 0.85)"
                stroke="rgba(148, 163, 184, 0.35)"
                strokeWidth={1}
              />
              {/* Roman numeral / translated title with dominantBaseline="central" */}
              <text
                x={badgeX + badgeWidth / 2}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#E2E8F0"
                fontSize={11}
                fontWeight={600}
                letterSpacing="0.04em"
                style={{ fontFamily: 'inherit' }}
              >
                {displayLabel}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
};
