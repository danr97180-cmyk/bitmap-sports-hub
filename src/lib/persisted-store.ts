import { useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed store for demo-mode state.
 * Server render always uses `initial`, so hydration never mismatches.
 */
export interface PersistedStore<T extends object> {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
  getServerSnapshot: () => T;
  reset: () => void;
}

export function createPersistedStore<T extends object>(key: string, initial: T): PersistedStore<T> {
  let state = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) state = { ...initial, ...(JSON.parse(raw) as Partial<T>) };
    } catch {
      state = initial;
    }
  };

  const emit = () => listeners.forEach((l) => l());

  return {
    get: () => {
      load();
      return state;
    },
    set: (next) => {
      load();
      state = typeof next === "function" ? (next as (p: T) => T)(state) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch {
        /* storage full or blocked — keep in memory */
      }
      emit();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getServerSnapshot: () => initial,
    reset: () => {
      state = initial;
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      emit();
    },
  };
}

export function useStore<T extends object>(store: PersistedStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.getServerSnapshot);
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
