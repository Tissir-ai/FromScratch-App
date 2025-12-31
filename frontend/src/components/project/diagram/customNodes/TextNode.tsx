import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const TextNode = ({ data }: { data: { label: string; fontSize?: string; textColor?: string; isBold?: boolean; isItalic?: boolean; textTransform?: string; fontFamily?: string } }) => {
  const fontSize = data.fontSize || 'text-base';
  const textColor = data.textColor || 'text-foreground';
  const fontWeight = data.isBold ? 'font-bold' : 'font-normal';
  const fontStyle = data.isItalic ? 'italic' : 'not-italic';
  const textTransform = data.textTransform || 'none';
  const fontFamily = data.fontFamily || 'font-sans';
  
  const isTailwindFont = fontFamily.startsWith('font-');
  const className = `${fontSize} ${textColor} ${fontWeight} ${fontStyle} ${textTransform !== 'none' ? textTransform : ''} ${isTailwindFont ? fontFamily : ''}`;
  const style = !isTailwindFont ? { fontFamily } : {};
  
  return (
    <div className="bg-transparent p-2 min-w-[100px]">
      
      <div className={className} style={style}>
        {data.label}
      </div>
    </div>
  );
};

export default memo(TextNode);
