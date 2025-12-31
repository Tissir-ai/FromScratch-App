import React from 'react';
import { Handle, Position } from 'reactflow';

const ActivityNode = ({ data }: { data: { label: string } }) => {
  return (
    <div className="group relative bg-white text-black rounded-[4px] p-3 border border-black  min-w-[150px]">
      <div className="text-xs text-center">{data.label}</div>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
    </div>
  );
};

export default ActivityNode;