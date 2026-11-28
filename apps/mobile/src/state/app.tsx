// Trạng thái dùng chung: api, phiên đăng nhập, hộ (phụ huynh) hoặc giai đoạn ghép (máy con).
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { AppState } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { getApi } from '../data';
import { parseAuthLink } from '../data/auth-link';
import { errorMessage } from '../data/errors';
import { uuidv4 } from '../data/uuid';
import type { Api, Binding, Home, PlanInfo, SessionInfo } from '../data/types';
import { APP_VARIANT } from '../variant';

/**
 * Phụ huynh: loading → out (PA-01) → needHome (tạo hộ, thêm con; đồng ý ghi mặc định, D-73) → ready.
 * frozen: hộ đóng băng (PA-39). closing: hộ đang chờ xóa (đã gửi yêu cầu xóa gia đình).
 */
export type ParentStage = 'loading' | 'out' | 'needHome' | 'frozen' | 'closing' | 'ready';
/** Máy con: loading → unpaired (CA-01, CA-02) → justPaired (CA-03) → intro (CA-16) → ready. */
export type ChildStage = 'loading' | 'unpaired' | 'justPaired' | 'intro' | 'ready';

type Ctx = {
  api: Api;
  session: SessionInfo | null;
  // phụ huynh
  parentStage: ParentStage;
  home: Home;
  refreshHome: () => Promise<void>;
  /** Gói dịch vụ của hộ (D-68); null khi chưa nạp được (màn không đoán, để máy chủ quyết). */
  plan: PlanInfo | null;
  refreshPlan: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Lỗi khi hoàn tất đăng nhập từ link trong thư (D-59), hiện ở PA-01. */
  linkError: string | null;
  clearLinkError: () => void;
  // máy con
  childStage: ChildStage;
  childId: string | null;
  /** Gói của hộ còn hoạt động với máy con (hộ PREMIUM, D-72). false: hiện màn tạm dừng CA-18. Mặc định true tới khi máy chủ báo khác. */
  childPlanActive: boolean;
  /** binding_epoch của liên kết hiện hành (nhận từ pair_accept); unlink_device phải gửi kèm. */
  bindingEpoch: number | null;
  onPaired: (b: Binding) => void;
  /** Đọc lại liên kết từ máy chủ (sau CONFLICT_REV). Trả false nếu liên kết không còn (đã về màn chưa ghép). */
  refreshBinding: () => Promise<boolean>;
  acknowledgeJustPaired: () => void;
  acknowledgeIntro: () => Promise<void>;
  /** CA-17: máy từng ghép nhưng nay không còn liên kết (tự hủy hoặc bố mẹ rút/xóa). */
  disconnected: boolean;
  /** Bấm "Lấy mã mới" ở CA-17: quay về luồng ghép. */
  startNewPairing: () => Promise<void>;
  /** CA-18: gia đình đang tạm dừng và con chưa bấm "Xem lịch đã có". */
  paused: boolean;
  dismissPause: () => void;
  onUnlinked: () => Promise<void>;
};

const AppCtx = createContext<Ctx | null>(null);
const INTRO_KEY = 'pp.child.ca16_seen';
const WAS_PAIRED_KEY = 'pp.child.was_paired';

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
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [childId, setChildId] = useState<string | null>(null);
  const [bindingEpoch, setBindingEpoch] = useState<number | null>(null);
  const [childStage, setChildStage] = useState<ChildStage>('loading');
  const [childPlanActive, setChildPlanActive] = useState(true);
  const [disconnected, setDisconnected] = useState(false);
  const [frozenFamily, setFrozenFamily] = useState(false);
  const [pauseSeen, setPauseSeen] = useState(false);

  const isParent = APP_VARIANT === 'parent';
  const [linkError, setLinkError] = useState<string | null>(null);
  const handledUrl = useRef<string | null>(null);
  const introKey = useRef(uuidv4());

  // Link đăng nhập trong thư mở app (D-59): hoàn tất phiên. Chỉ app phụ huynh.
  useEffect(() => {
    if (!isParent) return;
    let alive = true;
    const handle = (url: string | null) => {
      const link = parseAuthLink(url);
      if (!link || !url || handledUrl.current === url) return;
      handledUrl.current = url; // mã trong link chỉ dùng được một lần
      setLinkError(null);
      api.auth.completeFromLink(link).catch((e) => {
        if (alive) setLinkError(`Liên kết đăng nhập không dùng được. ${errorMessage(e)} Bạn xin liên kết hoặc mã mới nhé.`);
      });
    };
    void Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener('url', (ev) => handle(ev.url));
    return () => {
      alive = false;
      sub.remove();
    };
  }, [api, isParent]);

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

  const refreshPlan = useCallback(async () => {
    setPlan(await api.myPlan());
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
      })
      .catch(() => {
        // Không nạp được hộ (mạng, quyền): coi như chưa có hộ để không treo; người dùng thử lại ở bước sau.
        if (alive) setHomeLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [api, parentSession?.userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Có hộ thì nạp gói dịch vụ (D-68). Lỗi thì để null: màn không chặn theo đoán, máy chủ vẫn là nơi quyết định.
  const hasHome = Boolean(home);
  useEffect(() => {
    if (!parentSession || !hasHome) {
      setPlan(null);
      return;
    }
    let alive = true;
    api
      .myPlan()
      .then((p) => alive && setPlan(p))
      .catch(() => alive && setPlan(null));
    return () => {
      alive = false;
    };
  }, [api, parentSession?.userId, hasHome]); // eslint-disable-line react-hooks/exhaustive-deps

  // Người lớn mở app (lúc nạp hộ xong và mỗi lần app trở lại nền trước) thì báo "đang hoạt động" (BR-FAM-050).
  // Chỉ thao tác có chủ đích của người lớn; client tự giới hạn 1 lần/giờ. Máy con không gọi hàm này.
  const touchEligible = Boolean(parentSession && home);
  useEffect(() => {
    if (!touchEligible) return;
    const touch = () => void api.touchActive().catch(() => undefined);
    touch();
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') touch();
    });
    return () => sub.remove();
  }, [api, touchEligible]);

  // Máy con: có phiên ẩn danh thì hỏi máy chủ đã ghép chưa.
  const childSession = !isParent && session ? session : null;
  useEffect(() => {
    if (isParent || !booted) return;
    if (!childSession) {
      setChildId(null);
      setBindingEpoch(null);
      void AsyncStorage.getItem(WAS_PAIRED_KEY).then((v) => setDisconnected(v === '1')).catch(() => undefined);
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
          setBindingEpoch(null);
          setChildStage('unpaired');
          return;
        }
        setChildId(b.childId);
        setBindingEpoch(b.epoch);
        await AsyncStorage.setItem(WAS_PAIRED_KEY, '1').catch(() => undefined);
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

  // Máy con đã vào app: hỏi máy chủ gia đình có đóng băng không và gói còn hoạt động không (D-72, D-74), lúc vào và mỗi lần app trở lại nền trước.
  useEffect(() => {
    if (isParent || childStage !== 'ready') return;
    let alive = true;
    const check = () =>
      api
        .myFamilyState()
        .then((st) => {
          if (!alive) return;
          setFrozenFamily(st.frozen);
          setChildPlanActive(st.planActive);
          if (!st.frozen) setPauseSeen(false);
        })
        .catch(() => undefined); // không đọc được thì giữ trạng thái cũ, không chặn
    void check();
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') void check();
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, [api, isParent, childStage]);

  const parentStage: ParentStage = !booted
    ? 'loading'
    : !parentSession
      ? 'out'
      : !homeLoaded
        ? 'loading'
        : !home
          ? 'needHome'
          : home.householdState === 'CHO_XOA' || home.householdState === 'DA_XOA'
            ? 'closing'
            : home.householdState === 'DONG_BANG'
              ? 'frozen'
              : home.children.length === 0
                ? 'needHome'
                : 'ready';

  const value = useMemo<Ctx>(
    () => ({
      api,
      session,
      parentStage,
      home,
      refreshHome,
      plan,
      refreshPlan,
      signOut: async () => {
        await api.auth.signOut();
        setSession(null);
      },
      linkError,
      clearLinkError: () => setLinkError(null),
      childStage,
      childId,
      childPlanActive,
      bindingEpoch,
      onPaired: (b) => {
        setChildId(b.childId);
        setBindingEpoch(b.epoch);
        setDisconnected(false);
        void AsyncStorage.setItem(WAS_PAIRED_KEY, '1').catch(() => undefined);
        setChildStage('justPaired');
      },
      refreshBinding: async () => {
        const b = await api.getMyBinding();
        if (!b) {
          setChildId(null);
          setBindingEpoch(null);
          setChildStage('unpaired');
          return false;
        }
        setChildId(b.childId);
        setBindingEpoch(b.epoch);
        return true;
      },
      acknowledgeJustPaired: () => setChildStage('intro'),
      acknowledgeIntro: async () => {
        // CA-16 kiêm bước con đồng ý (D-64): ghi đồng ý lên máy chủ TRƯỚC, lỗi thì ném ra để màn báo và cho thử lại
        // (không đặt cờ "đã xem", không vào app). Khóa gửi lặp giữ nguyên giữa các lần thử.
        await api.childConsentRecord(introKey.current);
        await AsyncStorage.setItem(INTRO_KEY, '1').catch(() => undefined);
        setChildStage('ready');
      },
      disconnected,
      startNewPairing: async () => {
        await AsyncStorage.removeItem(WAS_PAIRED_KEY).catch(() => undefined);
        setDisconnected(false);
      },
      paused: frozenFamily && !pauseSeen,
      dismissPause: () => setPauseSeen(true),
      onUnlinked: async () => {
        await AsyncStorage.removeItem(INTRO_KEY).catch(() => undefined);
        await AsyncStorage.setItem(WAS_PAIRED_KEY, '1').catch(() => undefined);
        setDisconnected(true);
        await api.auth.signOut().catch(() => undefined);
        setSession(null);
        setChildId(null);
        setBindingEpoch(null);
        setChildStage('unpaired');
      },
    }),
    [api, session, parentStage, home, refreshHome, plan, refreshPlan, linkError, childStage, childId, childPlanActive, bindingEpoch, disconnected, frozenFamily, pauseSeen],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
