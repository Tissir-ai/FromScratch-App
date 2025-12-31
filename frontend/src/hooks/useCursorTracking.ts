import { useEffect, useMemo, useRef, useState } from 'react';
import { connectRealtime, RealtimeEvent } from '@/services/realtime.service';

export type CursorPresence = {
  id: string;
  name?: string;
  color?: string;
  x: number;
  y: number;
};

export function useCursorTracking(
  projectId: string,
  pageId: string,
  containerRef: React.RefObject<HTMLElement>,
  user: any
) {
  const [cursors, setCursors] = useState<Record<string, CursorPresence>>({});
  const connRef = useRef<ReturnType<typeof connectRealtime> | null>(null);

  // simple color assignment based on user id hash
  const colorFor = (id: string) => {
    const palette = ['#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#06b6d4'];
    const idx = Math.abs([...id].reduce((a, c) => a + c.charCodeAt(0), 0)) % palette.length;
    return palette[idx];
  };

  useEffect(() => {
    if (!projectId || !pageId) return;
    connRef.current?.close();
    const safeUser = user ? { id: user.id, firstName: user.firstName || user.name || '', lastName: user.lastName || '', email: user.email } : { id: 'anonymous' };
    connRef.current = connectRealtime(projectId, pageId, safeUser, {
      onMessage: (ev: RealtimeEvent) => {
        if (ev.type === 'cursor' && ev.user?.id) {
          const displayName = ((ev.user.firstName || '') + ' ' + (ev.user.lastName || '')).trim() || ev.user.email || 'Guest';
          setCursors((prev) => ({
            ...prev,
            [ev.user.id]: {
              id: ev.user.id,
              name: displayName,
              color: colorFor(ev.user.id),
              x: ev.x ?? 0,
              y: ev.y ?? 0,
            },
          }));
        } else if (ev.type === 'presence.leave' && ev.user?.id) {
          setCursors((prev) => {
            const next = { ...prev };
            delete next[ev.user.id];
            return next;
          });
        }
        // CRUD events can be handled by page components if needed
      },
    });

    return () => {
      connRef.current?.close();
      connRef.current = null;
    };
  }, [projectId, pageId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !connRef.current) return;

    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      connRef.current?.sendCursor(x, y);
    };
    el.addEventListener('mousemove', handler);
    return () => el.removeEventListener('mousemove', handler);
  }, [containerRef, connRef.current]);

  const cursorList = useMemo(() => Object.values(cursors), [cursors]);
  return { cursors: cursorList };
}
