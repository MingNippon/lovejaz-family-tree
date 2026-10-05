import React from 'react';
import { motion } from 'motion/react';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  testId?: string;
}

export interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  layoutId?: string;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  pillClassName?: string;
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  layoutId = 'animated-tab-pill',
  className = '',
  tabClassName = '',
  activeTabClassName = '',
  pillClassName = 'bg-rose-500/20 border border-rose-500/40 text-rose-200 shadow-sm',
}) => {
  return (
    <div className={`relative flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-slate-800 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            data-testid={tab.testId}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors z-10 ${
              isActive
                ? activeTabClassName || 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            } ${tabClassName}`}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                className={`absolute inset-0 rounded-lg -z-10 ${pillClassName}`}
              />
            )}
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span className="shrink-0">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default AnimatedTabs;
