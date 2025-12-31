"use client";
import { RequirementCategory } from '@/types/requirement.type';
import { FileText, Code, CheckCircle2, Target, Gauge, HelpCircle } from 'lucide-react';
import React from 'react';

const categoryConfig: Record<RequirementCategory, { from: string; to: string; Icon: React.ComponentType<any> }> = {
  'user-stories': { from: 'from-blue-500', to: 'to-blue-400', Icon: FileText },
  'technical': { from: 'from-purple-500', to: 'to-purple-400', Icon: Code },
  'acceptance': { from: 'from-emerald-500', to: 'to-emerald-400', Icon: CheckCircle2 },
  'business': { from: 'from-amber-500', to: 'to-amber-400', Icon: Target },
  'non-functional': { from: 'from-rose-500', to: 'to-rose-400', Icon: Gauge },
  'questions': { from: 'from-cyan-500', to: 'to-cyan-400', Icon: HelpCircle },
};

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

type ThumbSize = keyof typeof sizeMap;

interface RequirementThumbnailProps {
  category: RequirementCategory;
  size?: ThumbSize;
  className?: string;
  title?: string;
}

export const RequirementThumbnail: React.FC<RequirementThumbnailProps> = ({ category, size = 'sm', className, title }) => {
  const cfg = categoryConfig[category];
  const Icon = cfg.Icon;
  return (
    <div
      className={`flex items-center justify-center rounded-md bg-gradient-to-br ${cfg.from} ${cfg.to} text-white/95 shadow-sm ${sizeMap[size]} ${className ?? ''}`}
      aria-hidden
      title={title}
    >
      <Icon className={size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4'} />
    </div>
  );
};
