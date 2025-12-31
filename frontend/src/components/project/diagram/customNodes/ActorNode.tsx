import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { User } from 'lucide-react';

const ActorNode = ({ data }: { data: any }) => {
  return (
    <div className="group flex flex-col items-center p-1 justify-center w-[80px] relative border-2 border-primary bg-background rounded-md shadow-sm">
      {/* top handles */}
      <Handle id="top-target" type="target" position={Position.Top} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
      <Handle id="top-source" type="source" position={Position.Top}  className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />

      {/* right handles */}
      <Handle id="right-target" type="target" position={Position.Right} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
      <Handle id="right-source" type="source" position={Position.Right} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />

        <User className="w-10 h-10 text-primary" strokeWidth={1.5} />
        <div className="mt-1 text-xs font-bold text-center">{data.label}</div>
      

      {/* bottom handles */}
      <Handle id="bottom-target" type="target" position={Position.Bottom} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
      <Handle id="bottom-source" type="source" position={Position.Bottom}  className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />

      {/* left handles */}
      <Handle id="left-target" type="target" position={Position.Left} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
      <Handle id="left-source" type="source" position={Position.Left} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />

    </div>
  );
};

export default memo(ActorNode);
