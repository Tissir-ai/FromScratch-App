import { useEffect, useState } from 'react';
import { connectRealtime } from '@/services/realtime.service';

type MinimalUser = { id: string; firstName?: string; lastName?: string; email?: string };

export function useRealtimeStatus(projectId: string | undefined, pageId: string | undefined, user: any) {
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<MinimalUser[]>([]);

  useEffect(() => {
    if (!projectId || !pageId) return;

    const conn = connectRealtime(projectId, pageId, user, {
      onMessage: (ev) => {
        if (!ev || typeof ev !== 'object') return;
        const t = (ev as any).type;
        // handle a full presence snapshot (preferred) or incremental join/leave
        if (t === 'presence.snapshot' && Array.isArray((ev as any).users)) {
          const list = (ev as any).users as MinimalUser[];
          setUsers(list.map((u) => ({ id: String(u.id), firstName: u.firstName, lastName: u.lastName, email: u.email })));
        } else if (t === 'presence.join' && (ev as any).user) {
          const u = (ev as any).user as MinimalUser;
          setUsers((prev) => {
            if (prev.find((p) => p.id === String(u.id))) return prev;
            return [...prev, { id: String(u.id), firstName: u.firstName, lastName: u.lastName, email: u.email }];
          });
        } else if (t === 'presence.leave' && (ev as any).user) {
          const u = (ev as any).user as MinimalUser;
          setUsers((prev) => prev.filter((p) => p.id !== String(u.id)));
        }
      },
    });

    const socket = conn.socket;

    const onOpen = () => setConnected(true);
    const onClose = () => setConnected(false);
    const onError = () => setConnected(false);

    socket.addEventListener('open', onOpen);
    socket.addEventListener('close', onClose);
    socket.addEventListener('error', onError);

    // fetch initial users snapshot from server
    (async () => {
      try {
        // In production, use relative path; in dev, use env var or localhost
        const getBaseUrl = () => {
          if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
          if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
            return '';  // Use relative path in production
          }
          return 'http://localhost:8000';
        };
        const base = getBaseUrl();
        const res = await fetch(`${base}/api/v1/realtime/rooms/${encodeURIComponent(projectId)}/${encodeURIComponent(pageId)}/users`);
        if (res.ok) {
          const j = await res.json();
          if (Array.isArray(j.users)) {
            setUsers(j.users.map((u: any) => ({ id: String(u.id), firstName: u.firstName, lastName: u.lastName, email: u.email })));
          }
        }
      } catch (e) {
        // ignore failures; presence will be updated from websocket events
      }
    })();

    // cleanup
    return () => {
      try {
        socket.removeEventListener('open', onOpen);
        socket.removeEventListener('close', onClose);
        socket.removeEventListener('error', onError);
      } catch (e) {
        // ignore
      }
      try {
        conn.close();
      } catch (e) {
        // ignore
      }
    };
  }, [projectId, pageId, user?.id]);

  return { connected, users };
}
