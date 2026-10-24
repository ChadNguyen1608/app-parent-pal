// Điều phối một lượt trò chuyện theo đúng thứ tự đã thiết kế:
// 1. ghi tin của phụ huynh  2. kiểm tra an toàn  3. AI trả lời  4. ghi trí nhớ.
// Toàn bộ là hàm thuần (không gọi mạng, không đọc đồng hồ), để test được.
import { CompanionEngine, PalMessage, TurnOutput } from '../ai/engine';
import { addr } from '../ai/mockEngine';
import { assessSafety, SafetyResult } from '../ai/safety';
import { AppState, Child, MemoryItem, Message } from '../domain/types';

let seq = 0;
export const makeId = (prefix: string, now: number) => `${prefix}_${now.toString(36)}_${(seq++).toString(36)}`;

export function applyOutput(state: AppState, out: TurnOutput, now: number): AppState {
  const children: Child[] = [...state.children];
  for (const c of out.childrenAdds ?? []) {
    if (children.some((k) => k.name.toLocaleLowerCase('vi') === c.name.toLocaleLowerCase('vi'))) continue;
    children.push({ ...c, id: makeId('child', now), createdAt: now });
  }

  const added: MemoryItem[] = (out.memoryAdds ?? []).map(({ childName, ...m }) => ({
    ...m,
    childId: m.childId ?? (childName ? children.find((c) => c.name === childName)?.id ?? null : null),
    id: makeId('mem', now),
    createdAt: now,
  }));

  let memories = [...state.memories, ...added];
  const resolves = new Set(out.memoryResolves ?? []);
  const patches = new Map((out.memoryPatches ?? []).map((p) => [p.id, p.patch]));
  memories = memories.map((m) => {
    let next = m;
    if (patches.has(m.id)) next = { ...next, ...patches.get(m.id) };
    if (resolves.has(m.id)) next = { ...next, resolvedAt: now };
    return next;
  });

  const palMessages: Message[] = out.messages.map((pm: PalMessage, i) => ({
    id: makeId('msg', now),
    sender: 'pal',
    text: pm.text,
    // Mỗi tin của Pal cách nhau 1ms để giữ đúng thứ tự.
    createdAt: now + i + 1,
    quickReplies: pm.quickReplies,
    safety: pm.safety,
    savedMemoryIds: (pm.showMemories ?? [])
      .map((ref) => (typeof ref === 'number' ? added[ref]?.id : ref))
      .filter((x): x is string => !!x),
  }));

  return {
    ...state,
    children,
    memories,
    messages: [...state.messages, ...palMessages],
    profile: { ...state.profile, ...out.profilePatch },
  };
}

/** Lời nhắn an toàn: không để AI tự xử lý tình huống nguy hiểm. */
export function safetyOutput(result: SafetyResult, state: AppState): TurnOutput {
  const a = addr(state);
  const lines: Record<string, string> = {
    self_harm: `Mình rất lo khi nghe điều này, và mình muốn ${a} có người thật ở bên ngay lúc này. Nếu đang có nguy hiểm, hãy gọi 115 (cấp cứu) hoặc nhờ một người thân ở cạnh ngay. Nếu chuyện này liên quan tới một bé, Tổng đài quốc gia bảo vệ trẻ em 111 miễn phí và trực 24/7.`,
    abuse: `Điều ${a} vừa kể rất nghiêm trọng. Hãy gọi Tổng đài quốc gia bảo vệ trẻ em 111 (miễn phí, 24/7) để được hướng dẫn. Nếu bé đang gặp nguy hiểm, gọi 113 ngay.`,
    domestic_violence: `An toàn của ${a} và các con là trên hết. Nếu đang có nguy hiểm, hãy gọi 113 ngay. Tổng đài 111 (miễn phí, 24/7) có thể hướng dẫn ${a} các bước tiếp theo.`,
  };
  return {
    messages: [
      { text: lines[result.category ?? 'self_harm'] ?? lines.self_harm, safety: 'urgent' },
      { text: `Mình vẫn ở đây nếu ${a} muốn kể tiếp.` },
    ],
  };
}

export async function runTurn(state: AppState, text: string, engine: CompanionEngine, now: number): Promise<AppState> {
  const trimmed = text.trim();
  if (!trimmed) return state;
  const parentMsg: Message = { id: makeId('msg', now), sender: 'parent', text: trimmed, createdAt: now };
  // Gợi ý trả lời nhanh chỉ dùng một lần.
  const messages = state.messages.map((m) => (m.quickReplies ? { ...m, quickReplies: undefined } : m));
  const withParent: AppState = { ...state, messages: [...messages, parentMsg] };

  const safety = assessSafety(trimmed);
  if (safety.level === 'urgent' && state.profile.onboarding === 'done') {
    return applyOutput(withParent, safetyOutput(safety, withParent), now);
  }
  const out = await engine.turn(withParent, trimmed, now, safety);
  return applyOutput(withParent, out, now);
}

/** Khi mở app: chào lần đầu, hoặc hỏi lại chuyện đến hạn. */
export async function openSession(state: AppState, engine: CompanionEngine, now: number): Promise<AppState> {
  if (!state.messages.length) return applyOutput(state, await engine.greet(state, now), now);
  const out = await engine.checkIn(state, now);
  return out ? applyOutput(state, out, now) : state;
}

// ---------- chỉnh sửa sổ tay (phụ huynh tự làm) ----------

export const editMemory = (s: AppState, id: string, text: string): AppState => ({
  ...s,
  memories: s.memories.map((m) => (m.id === id ? { ...m, text: text.trim() || m.text } : m)),
});

export const deleteMemory = (s: AppState, id: string): AppState => ({
  ...s,
  memories: s.memories.filter((m) => m.id !== id),
  messages: s.messages.map((m) => (m.savedMemoryIds?.includes(id) ? { ...m, savedMemoryIds: m.savedMemoryIds.filter((x) => x !== id) } : m)),
});

export const toggleScope = (s: AppState, id: string): AppState => ({
  ...s,
  memories: s.memories.map((m) => (m.id === id ? { ...m, scope: m.scope === 'private' ? 'family' : 'private' } : m)),
});

export const resolveMemory = (s: AppState, id: string, now: number): AppState => ({
  ...s,
  memories: s.memories.map((m) => (m.id === id ? { ...m, resolvedAt: now } : m)),
});
