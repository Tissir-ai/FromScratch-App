export type RealtimeEvent =
  | { type: 'cursor'; projectId: string; pageId: string; user: any; x: number; y: number; ts?: number }
  | { type: 'presence.join' | 'presence.leave'; projectId: string; pageId: string; user: any }
  | { type: 'crud'; projectId: string; pageId: string; action: 'create' | 'update' | 'delete'; entity: string; data: any };

export type RealtimeConnection = {
  socket: WebSocket;
  sendCursor: (x: number, y: number) => void;
  close: () => void;
};

function buildWsUrl(base: string, projectId: string, pageId: string, xUserJson: string) {
  // Convert http(s) base to ws(s) when needed
  const url = new URL(base);
  const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  const origin = `${protocol}//${url.host}`;
  const path = `/ws/projects/${encodeURIComponent(projectId)}/pages/${encodeURIComponent(pageId)}`;
  const qs = new URLSearchParams({ x_user: xUserJson }).toString();
  return `${origin}${path}?${qs}`;
}

export function connectRealtime(
  projectId: string,
  pageId: string,
  user: any,
  options?: { baseUrl?: string; onMessage?: (ev: RealtimeEvent) => void }
): RealtimeConnection {
  // In production, derive base URL from window.location; in dev, use env var or localhost
  const getBaseUrl = () => {
    if (options?.baseUrl) return options.baseUrl;
    if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return window.location.origin;
    }
    return 'http://localhost:8000';
  };
  const baseUrl = getBaseUrl();
  // Send a compact, minimal user object (avoid leaking sensitive fields)
  const minimalUser = user ? { id: user.id, firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '' } : { id: 'anonymous', firstName: 'Anonymous', lastName: '', email: '' };
  const xUser = JSON.stringify(minimalUser);
  const wsUrl = buildWsUrl(baseUrl, projectId, pageId, xUser);
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    // small debug hook when connection opens
    console.debug('[realtime] websocket open', wsUrl);
  };

  socket.onerror = (err) => {
    console.error('[realtime] websocket error', err);
  };

  socket.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      options?.onMessage?.(data as RealtimeEvent);
    } catch (_) {
      /* ignore */
    }
  };

  const sendCursor = (x: number, y: number) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'cursor', x, y, ts: Date.now() }));
    }
  };

  return {
    socket,
    sendCursor,
    close: () => socket.close(),
  };
}
