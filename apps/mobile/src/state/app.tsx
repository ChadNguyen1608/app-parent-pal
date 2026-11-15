// Trạng thái dùng chung: api, phiên đăng nhập, hộ (phụ huynh) hoặc giai đoạn ghép (máy con).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getApi } from '../data';
import type { Api, Home, SessionInfo } from '../data/types';
import { APP_VARIANT } from '../variant';

/** Phụ huynh: loading → out (PA-01) → needHome (tạo hộ, con) → ready. */
export type ParentStage = 'loading' | 'out' | 'needHome' | 'ready';
/** Máy con: loading → unpaired (CA-01, CA-02) → justPaired (CA-03) → intro (CA-16) → ready. */
export type ChildStage = 'loading' | 'unpaired' | 'justPaired' | 'intro' | 'ready';

type Ctx = {
  api: Api;
  session: SessionInfo | null;
  // phụ huynh
  parentStage: ParentStage;
  home: Home;
  refreshHome: () => Promise<void>;
  signOut: () => Promise<void>;
  // máy con
  childStage: ChildStage;
  childId: string | null;
  onPaired: (childId: string) => void;
  acknowledgeJustPaired: () => void;
  acknowledgeIntro: () => Promise<void>;
  onUnlinked: () => Promise<void>;
};

const AppCtx = createContext<Ctx | null>(null);
const INTRO_KEY = 'pp.child.ca16_seen';

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp ngoài AppProvider');
  return c;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const api = getApi();
  if (!api) return <>{children}</>; // màn gốc đã báo thiếu cấu hình
  return <Inner api={api}>{children}</Inner>;
}

function Inner({ api, children }: { api: Api; children: ReactNode }) {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [booted, setBooted] = useState(false);
  const [home, setHome] = useState<Home>(null);
  const [homeLoaded, setHomeLoaded] = useState(false);
  const [childId, setChildId] = useState<string | null>(null);
  const [childStage, setChildStage] = useState<ChildStage>('loading');

  const isParent = APP_VARIANT === 'parent';

  // Khởi động: đọc phiên đã lưu và theo dõi thay đổi.
  useEffect(() => {
    let alive = true;
    api.auth
      .getSession()
      .then((s) => alive && setSession(s))
      .catch(() => alive && setSession(null))
      .finally(() => alive && setBooted(true));
    const off = api.auth.onChange((s) => alive && setSession(s));
    return () => {
      alive = false;
      off();
    };
  }, [api]);

  const refreshHome = useCallback(async () => {
    const h = await api.getHome();
    setHome(h);
    setHomeLoaded(true);
  }, [api]);

  // Phụ huynh: có phiên (không ẩn danh) thì nạp hộ và báo "đang hoạt động".
  const parentSession = isParent && session && !session.isAnonymous ? session : null;
  useEffect(() => {
    if (!parentSession) {
      setHome(null);
      setHomeLoaded(false);
      return;
    }
    let alive = true;
    api
      .getHome()
      .then((h) => {
        if (!alive) return;
        setHome(h);
        setHomeLoaded(true);
        if (h) void api.touchActive().catch(() => undefined);
      })
      .catch(() => {
        // Không nạp được hộ (mạng, quyền): coi như chưa có hộ để không treo; người dùng thử lại ở bước sau.
        if (alive) setHomeLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [api, parentSession?.userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Máy con: có phiên ẩn danh thì hỏi máy chủ đã ghép chưa.
  const childSession = !isParent && session ? session : null;
  useEffect(() => {
    if (isParent || !booted) return;
    if (!childSession) {
      setChildId(null);
      setChildStage('unpaired');
      return;
    }
    let alive = true;
    (async () => {
      try {
        const b = await api.getMyBinding();
        if (!alive) return;
        if (!b) {
          setChildId(null);
          setChildStage('unpaired');
          return;
        }
        setChildId(b.childId);
        const seen = (await AsyncStorage.getItem(INTRO_KEY)) === '1';
        if (alive) setChildStage((cur) => (cur === 'justPaired' ? cur : seen ? 'ready' : 'intro'));
      } catch {
        if (alive) setChildStage('unpaired');
      }
    })();
    return () => {
      alive = false;
    };
  }, [api, isParent, booted, childSession?.userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const parentStage: ParentStage = !booted
    ? 'loading'
    : !parentSession
      ? 'out'
      : !homeLoaded
        ? 'loading'
        : home && home.children.length > 0
          ? 'ready'
          : 'needHome';

  const value = useMemo<Ctx>(
    () => ({
      api,
      session,
      parentStage,
      home,
      refreshHome,
      signOut: async () => {
        await api.auth.signOut();
        setSession(null);
      },
      childStage,
      childId,
      onPaired: (id) => {
        setChildId(id);
        setChildStage('justPaired');
      },
      acknowledgeJustPaired: () => setChildStage('intro'),
      acknowledgeIntro: async () => {
        await AsyncStorage.setItem(INTRO_KEY, '1').catch(() => undefined);
        setChildStage('ready');
      },
      onUnlinked: async () => {
        await AsyncStorage.removeItem(INTRO_KEY).catch(() => undefined);
        await api.auth.signOut().catch(() => undefined);
        setSession(null);
        setChildId(null);
        setChildStage('unpaired');
      },
    }),
    [api, session, parentStage, home, refreshHome, childStage, childId],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
