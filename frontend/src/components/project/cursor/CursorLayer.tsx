import React from 'react';
import Cursor from './Cursor';
import { CursorPresence } from '@/hooks/useCursorTracking';

type Props = { cursors: CursorPresence[] };

export default function CursorLayer({ cursors }: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {cursors.map((c) => (
        <Cursor key={c.id} cursor={c} />
      ))}
    </div>
  );
}
