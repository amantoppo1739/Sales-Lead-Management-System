"use client";

import { create } from "zustand";

const MAX_EVENTS = 5;

export const useRealtimeStore = create((set) => ({
  events: [],
  addEvent: (payload) =>
    set((state) => {
      const enriched = {
        ...payload,
        uuid: crypto.randomUUID(),
        receivedAt: new Date().toISOString(),
      };

      const nextEvents = [enriched, ...state.events];

      return {
        events: nextEvents.slice(0, MAX_EVENTS),
      };
    }),
  removeEvent: (uuid) =>
    set((state) => ({
      events: state.events.filter((event) => event.uuid !== uuid),
    })),
  clearEvents: () => set({ events: [] }),
}));

