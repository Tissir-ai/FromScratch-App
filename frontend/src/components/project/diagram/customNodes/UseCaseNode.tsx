import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const UseCaseNode = ({ data }: { data: any }) => {
  return (
    <div className="group w-[140px] h-[70px] rounded-[50%] bg-background border-2 border-primary shadow-sm flex items-center justify-center p-2 text-center hover:shadow-md transition-shadow">
      <Handle id="top-target" type="target" position={Position.Top} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
      <Handle id="top-source" type="source" position={Position.Top}  className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />

      <Handle id="right-target" type="target" position={Position.Right} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
      <Handle id="right-source" type="source" position={Position.Right}  className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />

      <Handle id="bottom-target" type="target" position={Position.Bottom} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
      <Handle id="bottom-source" type="source" position={Position.Bottom}  className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />

      <Handle id="left-target" type="target" position={Position.Left} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
      <Handle id="left-source" type="source" position={Position.Left}  className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />

      <span className="text-xs font-medium leading-tight">{data.label}</span>
    </div>
  );
};

export default memo(UseCaseNode);
