import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const SequenceLifelineNode = ({ data }: { data: any }) => {
  const lifelineHeight = typeof data?.lifelineHeight === 'number' ? data.lifelineHeight : 400;
  const lifelineWidth = typeof data?.lifelineWidth === 'number' ? data.lifelineWidth : 2;

  return (
    <div className="group flex flex-col items-center relative" style={{ height: lifelineHeight }}>
      <div className="px-4 py-2 bg-background border-2 border-primary rounded-md shadow-sm mb-0 z-10 relative">
        <span className="text-sm font-bold">{data.label}</span>
      </div>
      {/* Lifeline centered below the label */}
      <div
        className="absolute top-8 bottom-0 z-0 flex items-stretch justify-center"
        style={{
          left: 0,
          right: 0,
        }}
      >
          <div style={{ width: `${lifelineWidth}px` }} className="h-full bg-primary/50 relative">
          <div className="h-full" style={{ width: '100%', borderLeft: `${Math.max(1, lifelineWidth)}px dashed rgba(59,130,246,0.5)` }} />

          {/* Place handles along the lifeline so connections attach to the line, not the label */}
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((pct, idx) => (
            <React.Fragment key={idx}>
              <Handle id={`left-target-${idx}`} type="target" position={Position.Left} style={{ top: `${pct}%` , left: 2}} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
              <Handle id={`left-source-${idx}`} type="source" position={Position.Right} style={{ top: `${pct}%`, left: 2 }} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
              <Handle id={`right-target-${idx}`} type="target" position={Position.Right} style={{ top: `${pct}%` , right: 2 }} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
              <Handle id={`right-source-${idx}`} type="source" position={Position.Right} style={{ top: `${pct}%`, right: 2 }} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(SequenceLifelineNode);
