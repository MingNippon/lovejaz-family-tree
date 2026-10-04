import React from 'react';
import { Person, NodePosition } from '../types/family';
import { QuickActionToolbar } from './QuickActionToolbar';

export interface PersonNodeProps {
  person: Person;
  position: NodePosition;
  isSelected?: boolean;
  onSelect?: (personId: string) => void;
  onAddSpouse?: (personId: string) => void;
  onAddChild?: (personId: string) => void;
  onAddParents?: (personId: string) => void;
  onEdit?: (personId: string) => void;
  onDelete?: (personId: string) => void;
  theme?: string;
  className?: string;
}

/**
 * Extracts 1-2 letter uppercase initials from full name.
 * e.g., "Eduardo Dela Cruz" -> "EC"
 *       "Maria Theresa" -> "MT"
 *       "Jaz" -> "JA"
 */
export function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const firstLetter = parts[0][0];
  const lastLetter = parts[parts.length - 1][0];
  return (firstLetter + lastLetter).toUpperCase();
}

/**
 * Truncates text with ellipsis if exceeding max length.
 */
export function truncateText(text?: string, maxLength = 22): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

/**
 * Formats birth year and optional age into standard label string.
 * e.g., "1985 (41y)", "b. 1952", or "18y"
 */
export function formatBirthAndAge(
  birthYear?: number | string,
  age?: number | string
): string {
  const hasBirth =
    birthYear !== undefined && birthYear !== null && String(birthYear).trim() !== '';
  const hasAge = age !== undefined && age !== null && String(age).trim() !== '';

  if (hasBirth && hasAge) {
    return `${birthYear} (${age}y)`;
  }
  if (hasBirth) {
    return `b. ${birthYear}`;
  }
  if (hasAge) {
    return `${age}y`;
  }
  return '';
}

export const PersonNode: React.FC<PersonNodeProps> = ({
  person,
  position,
  isSelected = false,
  onSelect,
  onAddSpouse,
  onAddChild,
  onAddParents,
  onEdit,
  onDelete,
  theme,
  className,
}) => {
  const x = position.x ?? 0;
  const y = position.y ?? 0;
  const width = position.width || 72;
  const height = position.height || 72;
  const cx = x + width / 2;
  const cy = y + height / 2;

  const isMale = person.gender === 'male';
  const strokeColor = person.avatarColor || (isMale ? '#3B82F6' : '#EC4899');
  const fillColor = isSelected ? '#1E293B' : '#0F172A';

  // Label positioning beneath node shape
  const nameY = y + height + 20;
  const birthAgeLabel = formatBirthAndAge(person.birthYear, person.age);
  const datesY = nameY + 16;
  const pillY = birthAgeLabel ? datesY + 10 : nameY + 10;
  const titleText = person.title ? truncateText(person.title, 18) : '';
  const pillWidth = Math.min(Math.max((titleText.length * 6.5) + 16, 60), 120);

  // Quick action toolbar position (above the node)
  const toolbarWidth = 220;
  const toolbarHeight = 44;
  const toolbarX = cx - toolbarWidth / 2;
  const toolbarY = y - toolbarHeight - 12;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(person.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(person.id);
    }
  };

  return (
    <g
      data-testid={`person-node-${person.id}`}
      data-interactive="true"
      data-theme={theme}
      tabIndex={0}
      role="button"
      aria-label={`${person.name} (${person.gender})`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`person-node cursor-pointer select-none transition-all duration-150 focus:outline-none ${
        isSelected ? 'is-selected' : ''
      } ${className || ''}`}
    >
      <title>{person.name}</title>

      {/* Selected Glow Halo / Ring */}
      {isSelected && (
        isMale ? (
          <rect
            data-testid="selected-halo"
            x={x - 6}
            y={y - 6}
            width={width + 12}
            height={height + 12}
            rx={12}
            ry={12}
            fill="none"
            stroke="#38BDF8"
            strokeWidth={2.5}
            strokeDasharray="4 2"
            className="animate-pulse"
          />
        ) : (
          <circle
            data-testid="selected-halo"
            cx={cx}
            cy={cy}
            r={width / 2 + 6}
            fill="none"
            stroke="#F43F5E"
            strokeWidth={2.5}
            strokeDasharray="4 2"
            className="animate-pulse"
          />
        )
      )}

      {/* Core Pedigree Shape: Square (<rect>) for Male, Circle (<circle>) for Female */}
      {isMale ? (
        <rect
          data-testid="node-shape"
          data-gender="male"
          x={x}
          y={y}
          width={width}
          height={height}
          rx={8}
          ry={8}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={2.5}
          className="transition-colors duration-150 hover:stroke-sky-400"
        />
      ) : (
        <circle
          data-testid="node-shape"
          data-gender="female"
          cx={cx}
          cy={cy}
          r={width / 2}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={2.5}
          className="transition-colors duration-150 hover:stroke-pink-400"
        />
      )}

      {/* Person Initials Centered Inside Shape */}
      <text
        data-testid="person-initials"
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#F8FAFC"
        fontSize={18}
        fontWeight={700}
        letterSpacing="0.05em"
        className="select-none pointer-events-none font-sans"
        opacity={person.isDeceased ? 0.8 : 1}
      >
        {getInitials(person.name)}
      </text>

      {/* Deceased Diagonal Slash Line (<line>) */}
      {person.isDeceased && (
        <line
          data-testid="deceased-slash"
          x1={x - 4}
          y1={y + height + 4}
          x2={x + width + 4}
          y2={y - 4}
          stroke="#EF4444"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      )}

      {/* Full Name Beneath Shape */}
      <text
        data-testid="person-name"
        x={cx}
        y={nameY}
        textAnchor="middle"
        fill="#F1F5F9"
        fontSize={13}
        fontWeight={600}
        className="select-none pointer-events-none font-sans"
      >
        {truncateText(person.name, 22)}
      </text>

      {/* Birth Year / Age Label Beneath Name */}
      {birthAgeLabel && (
        <text
          data-testid="person-dates"
          x={cx}
          y={datesY}
          textAnchor="middle"
          fill="#94A3B8"
          fontSize={11}
          fontWeight={400}
          className="select-none pointer-events-none font-mono"
        >
          {birthAgeLabel}
        </text>
      )}

      {/* Optional Title Pill */}
      {person.title && (
        <g data-testid="person-title-pill" className="person-title-pill">
          <rect
            x={cx - pillWidth / 2}
            y={pillY}
            width={pillWidth}
            height={18}
            rx={9}
            ry={9}
            fill="rgba(51, 65, 85, 0.75)"
            stroke="rgba(148, 163, 184, 0.35)"
            strokeWidth={1}
          />
          <text
            x={cx}
            y={pillY + 9}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#CBD5E1"
            fontSize={10}
            fontWeight={500}
            className="select-none pointer-events-none font-sans"
          >
            {titleText}
          </text>
        </g>
      )}

      {/* Floating Smart Quick Action Toolbar When Selected */}
      {isSelected && (
        <QuickActionToolbar
          personId={person.id}
          x={toolbarX}
          y={toolbarY}
          width={toolbarWidth}
          height={toolbarHeight}
          onAddSpouse={onAddSpouse}
          onAddChild={onAddChild}
          onAddParents={onAddParents}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </g>
  );
};

export default PersonNode;
