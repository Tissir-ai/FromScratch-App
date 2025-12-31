import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const NoteNode = ({ data }: { data: { label: string; bgColor?: string; textColor?: string; withBorder?: boolean } }) => {
  const bgColor = data.bgColor || 'bg-yellow-50 dark:bg-yellow-900/30';
  const textColor = data.textColor || 'text-yellow-900 dark:text-yellow-50';

  // Derive a border class that is the same hue as the bg but with stronger contrast
  const deriveBorderClass = (bg: string) => {
    if (!bg) return 'border-gray-300 dark:border-gray-600';
    if (bg.includes('yellow')) return 'border-yellow-400 dark:border-yellow-700';
    if (bg.includes('blue')) return 'border-blue-400 dark:border-blue-700';
    if (bg.includes('green')) return 'border-green-400 dark:border-green-700';
    if (bg.includes('red')) return 'border-red-400 dark:border-red-700';
    if (bg.includes('purple')) return 'border-purple-400 dark:border-purple-700';
    if (bg.includes('gray')) return 'border-gray-300 dark:border-gray-600';
    return 'border-gray-300 dark:border-gray-600';
  };

  const borderClass = data.withBorder === false ? 'border-transparent' : deriveBorderClass(bgColor);

  return (
    <div className={`relative ${bgColor} ${textColor} rounded-md p-3 border ${borderClass} shadow-sm min-w-[160px] max-w-[280px]`}> 
      <div className="text-xs leading-snug whitespace-pre-wrap">
        {data.label}
      </div>
    </div>
  );
};

export default memo(NoteNode);
