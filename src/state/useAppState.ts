// Nối lõi (companion.ts) với giao diện: tải, lưu, gửi tin, chỉnh sổ tay.
import { useCallback, useEffect, useRef, useState } from 'react';
import { CompanionEngine } from '../ai/engine';
import { MockEngine } from '../ai/mockEngine';
import { days } from '../ai/text';
import { LocalRepo, Repo } from '../data/repo';
import { AppState, emptyState } from '../domain/types';
import * as core from './companion';

const TYPING_MS = typeof window !== 'undefined' && /[?&]fast\b/.test(window.location?.search ?? '') ? 50 : 700;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useAppState(repo: Repo = defaultRepo, engine: CompanionEngine = defaultEngine) {
  const [state, setState] = useState<AppState | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const ref = useRef<AppState | null>(null);
  ref.current = state;

  const now = useCallback(() => Date.now() + (ref.current?.clockOffset ?? 0), []);

  const commit = useCallback(
    (next: AppState) => {
      ref.current = next;
      setState(next);
      void repo.save(next);
    },
    [repo],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      const loaded = await repo.load();
      const opened = await core.openSession(loaded, engine, Date.now() + loaded.clockOffset);
      if (alive) commit(opened);
    })();
    return () => {
      alive = false;
    };
  }, [repo, engine, commit]);

  const send = useCallback(
    async (text: string) => {
      const s = ref.current;
      if (!s || !text.trim() || typing) return;
      setPending(text.trim());
      setTyping(true);
      const t = now();
      const next = await core.runTurn(s, text, engine, t);
      await wait(TYPING_MS);
      setPending(null);
      setTyping(false);
      commit(next);
    },
    [engine, now, commit, typing],
  );

  const update = useCallback((fn: (s: AppState) => AppState) => ref.current && commit(fn(ref.current)), [commit]);

  return {
    state,
    pending,
    typing,
    send,
    now,
    editMemory: (id: string, text: string) => update((s) => core.editMemory(s, id, text)),
    deleteMemory: (id: string) => update((s) => core.deleteMemory(s, id)),
    toggleScope: (id: string) => update((s) => core.toggleScope(s, id)),
    resolveMemory: (id: string) => update((s) => core.resolveMemory(s, id, now())),
    /** Công cụ thử: tua đồng hồ tới trước để xem Pal chủ động hỏi lại. */
    skipDays: async (n: number) => {
      const s = ref.current;
      if (!s) return;
      const moved = { ...s, clockOffset: s.clockOffset + days(n) };
      commit(await core.openSession(moved, engine, Date.now() + moved.clockOffset));
    },
    restart: async () => {
      await repo.reset();
      commit(await core.openSession(emptyState(), engine, Date.now()));
    },
  };
}

const defaultRepo = new LocalRepo();
const defaultEngine = new MockEngine();

export type AppApi = ReturnType<typeof useAppState>;
