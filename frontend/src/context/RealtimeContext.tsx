"use client";
import React, { createContext, useContext } from "react";

export type Cursor = { id: string; name?: string; color?: string; x: number; y: number };

export type RealtimeState = {
  connected: boolean;
  users: Array<{ id: string; firstName?: string; lastName?: string; email?: string }>;
  cursors: Cursor[];
  sendCursor: (x: number, y: number) => void;
};

const noop = () => {};

export const RealtimeContext = createContext<RealtimeState>({
  connected: false,
  users: [],
  cursors: [],
  sendCursor: noop,
});

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider = RealtimeContext.Provider;

export default RealtimeContext;
