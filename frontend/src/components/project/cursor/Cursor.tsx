import React, { useEffect } from 'react';
import { CursorPresence } from '@/hooks/useCursorTracking';

type Props = { cursor: CursorPresence };

export default function Cursor({ cursor }: Props) {
  // Support both normalized (0..1) and absolute pixel coordinates.
  const isNormalized = typeof cursor.x === 'number' && typeof cursor.y === 'number' && cursor.x <= 1 && cursor.y <= 1;
  const style: React.CSSProperties = isNormalized
    ? {
        position: 'absolute',
        left: `${Math.round(cursor.x * 10000) / 100}%`,
        top: `${Math.round(cursor.y * 10000) / 100}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 50,
      }
    : {
        position: 'absolute',
        left: Math.max(0, (cursor as any).x - 6),
        top: Math.max(0, (cursor as any).y - 6),
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 50,
      };

  return (
    <div style={style}>
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          background: cursor.color || '#3b82f6',
          boxShadow: '0 0 0 2px rgba(255,255,255,0.9)',
        }}
      />
      <div
        style={{
          marginTop: 6,
          padding: '2px 6px',
          borderRadius: 6,
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          fontSize: 10,
          whiteSpace: 'nowrap',
        }}
      >
        {cursor.name || cursor.id}
      </div>
    </div>
  );
}
