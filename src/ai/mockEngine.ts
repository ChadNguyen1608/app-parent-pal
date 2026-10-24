// AI giả lập bằng luật tiếng Việt, để thử trải nghiệm trước khi nối mô hình thật.
// Không phải trí tuệ thật: chỉ nhận ra các chủ đề trong topics.ts.
import { AppState, Child } from '../domain/types';
import { CompanionEngine, NewMemory, PalMessage, TurnOutput } from './engine';
import { mentionedChildren, parseCallName, parseChildren } from './parse';
import { SafetyResult } from './safety';
import { LIKE_VERBS, PARENT_FEELINGS, RESOLVED_KEYS, TOPICS, Topic, UNCHANGED_KEYS, UNSURE_KEYS } from './topics';
import { days, hasAny, hash, pick, prep, Prepared, relativeDay } from './text';

const MIN = 60 * 1000;

/** Cách Pal gọi phụ huynh trong câu: "chị", hoặc tên nếu không có đại từ. */
export function addr(state: AppState): string {
  return state.profile.callShort || state.profile.callName || 'bạn';
}
const cap = (s: string) => s.charAt(0).toLocaleUpperCase('vi') + s.slice(1);
const fill = (tpl: string, state: AppState) => tpl.replace(/\{short\}/g, addr(state));
const names = (kids: Child[]) =>
  kids.length <= 1 ? kids[0]?.name ?? 'bé' : `${kids.slice(0, -1).map((k) => k.name).join(', ')} và ${kids.at(-1)!.name}`;
const topicById = (id?: string) => TOPICS.find((t) => t.id === id);

/** Bối cảnh hay đi kèm, để ghi vào sổ tay chính xác hơn. */
function contextOf(p: Prepared): string {
  if (hasAny(p, ['đi học về', 'sau giờ học', 'tan học', 'đón về'])) return ' sau giờ học';
  if (hasAny(p, ['buổi sáng', 'sáng nào', 'mỗi sáng', 'sáng nay'])) return ' vào buổi sáng';
  if (hasAny(p, ['buổi tối', 'tối nào', 'mỗi tối', 'tối nay', 'trước khi ngủ'])) return ' vào buổi tối';
  if (hasAny(p, ['ở trường', 'ở lớp', 'trên lớp'])) return ' ở trường';
  return '';
}

/** "Na thích vẽ", "bé dị ứng tôm" -> sở thích, dị ứng để ghi vào hồ sơ. */
export function extractFacts(text: string, kids: Child[]): { childName: string; text: string }[] {
  const out: { childName: string; text: string }[] = [];
  const subjects = ['bé', 'con', 'cháu', 'nó', 'còn', 'và', 'lại', ...kids.map((k) => k.name)];
  const verbs = Object.keys(LIKE_VERBS).sort((a, b) => b.length - a.length);
  const re = new RegExp(
    `(?:^|[^\\p{L}])(${subjects.join('|')})\\s+(?:rất\\s+|cực\\s+|hơi\\s+|vẫn\\s+|lại\\s+)?(${verbs.join('|')})\\s+([^.,;!?\\n]+)`,
    'giu',
  );
  for (const m of text.matchAll(re)) {
    const subject = m[1];
    const verb = m[2].toLocaleLowerCase('vi');
    let object = m[3].trim().replace(/\s+(lắm|quá|cực|ghê|nhất)$/iu, '');
    if (!object || object.split(/\s+/).length > 6) continue;
    // "sợ đi học", "không thích đi học" thuộc chủ đề riêng, không phải sở thích.
    if (/đi học|ăn|ngủ/iu.test(object) && verb !== 'dị ứng') continue;
    const prevKid = out.length ? kids.find((k) => k.name === out.at(-1)!.childName) : undefined;
    const kid =
      kids.find((k) => k.name.toLocaleLowerCase('vi') === subject.toLocaleLowerCase('vi')) ??
      (['còn', 'và', 'lại'].includes(subject.toLocaleLowerCase('vi')) ? prevKid : undefined) ??
      (kids.length === 1 ? kids[0] : null);
    if (!kid) continue;
    out.push({ childName: kid.name, text: `${kid.name} ${LIKE_VERBS[verb] ?? verb} ${object}` });
  }
  return out;
}

export class MockEngine implements CompanionEngine {
  async greet(state: AppState): Promise<TurnOutput> {
    return {
      messages: [
        { text: 'Chào bạn, mình là Pal. Mình ở đây để nghe bạn kể chuyện nuôi con, nhớ giúp bạn những điều quan trọng về các bé, và hỏi lại khi cần.' },
        { text: 'Trước tiên, mình nên gọi bạn thế nào cho thân? Ví dụ: chị Lan, anh Minh.' },
      ],
      profilePatch: { onboarding: 'askName' },
    };
  }

  async checkIn(state: AppState, now: number): Promise<TurnOutput | null> {
    if (state.profile.onboarding !== 'done') return null;
    const due = state.memories
      .filter((m) => m.kind === 'followup' && !m.resolvedAt && (m.dueAt ?? Infinity) <= now)
      .filter((m) => !m.askedAt || now - m.askedAt > days(1))
      .sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0))[0];
    if (!due) return null;
    const kid = state.children.find((c) => c.id === due.childId);
    const t = topicById(due.topic);
    const what = t ? `${kid?.name ?? 'bé'} ${t.phrase}` : due.text;
    return {
      messages: [
        {
          text: `Chào ${state.profile.callName ?? 'bạn'}. ${cap(relativeDay(due.createdAt, now))} ${addr(state)} có kể ${what}. Mấy hôm nay ${kid?.name ?? 'bé'} thế nào rồi?`,
          quickReplies: ['Đỡ hơn rồi', 'Vẫn vậy', 'Chưa để ý'],
          showMemories: [due.id],
        },
      ],
      memoryPatches: [{ id: due.id, patch: { askedAt: now } }],
      profilePatch: { awaitingFollowup: due.id },
    };
  }

  async turn(state: AppState, text: string, now: number, safety: SafetyResult): Promise<TurnOutput> {
    const { profile } = state;
    if (profile.onboarding === 'askName') return this.onName(state, text);
    if (profile.onboarding === 'askChildren') return this.onChildren(state, text);

    const p = prep(text);
    if (safety.category === 'harsh_punishment') return this.onHarsh(state);
    if (safety.category === 'postpartum') return this.onPostpartum(state);

    if (profile.awaitingFollowup) {
      const out = this.onFollowupAnswer(state, p, now);
      if (out) return out;
    }

    // Đang chờ phụ huynh nói rõ là con nào.
    if (profile.pendingClarify) {
      const picked = hasAny(p, ['cả hai', 'cả 2', 'hai đứa', 'cả ba', 'các con', 'cả nhà'])
        ? state.children
        : mentionedChildren(text, state.children);
      if (picked.length) {
        const out = this.converse(state, `${profile.pendingClarify.text}. ${text}`, now, picked);
        return { ...out, profilePatch: { ...out.profilePatch, pendingClarify: null } };
      }
    }

    return this.converse(state, text, now);
  }

  // ---------------- làm quen ----------------

  private onName(state: AppState, text: string): TurnOutput {
    const cn = parseCallName(text);
    if (!cn) {
      return { messages: [{ text: 'Mình chưa nghe rõ. Bạn muốn mình gọi là gì? Ví dụ: chị Lan, anh Minh, hoặc chỉ tên thôi cũng được.' }] };
    }
    const short = cn.short || cn.full;
    return {
      profilePatch: { callName: cn.full, callShort: cn.short, onboarding: 'askChildren' },
      messages: [
        { text: `Rất vui được làm quen với ${cn.full}!` },
        {
          text: `Nhà mình có mấy bé, các bé tên gì và bao nhiêu tuổi rồi ${short}? Cứ kể tự nhiên như đang nói chuyện, ví dụ: "Bé Na 8 tuổi, bé Bin 5 tuổi".`,
        },
      ],
    };
  }

  private onChildren(state: AppState, text: string): TurnOutput {
    const kids = parseChildren(text);
    const a = addr(state);
    if (!kids.length) {
      return { messages: [{ text: `Mình chưa nghe ra tên bé. ${cap(a)} kể lại giúp mình nhé, ví dụ: "Bé Na 8 tuổi".` }] };
    }
    const list = kids.map((k) => (k.age ? `${k.name} (${k.age} tuổi)` : k.name));
    const listText = list.length === 1 ? list[0] : `${list.slice(0, -1).join(', ')} và ${list.at(-1)}`;
    return {
      childrenAdds: kids,
      profilePatch: { onboarding: 'done' },
      messages: [
        { text: `Vậy là nhà mình có ${listText}. Mình đã mở sổ tay cho ${kids.length > 1 ? 'từng bé' : 'bé'} rồi.` },
        {
          text: `Từ giờ ${a} cứ kể bất cứ chuyện gì về ${kids.length > 1 ? 'các con' : 'con'}, vui hay lo. Mình sẽ nhớ và hỏi lại khi cần. Hôm nay của ${kids.length > 1 ? 'các bé' : kids[0].name} thế nào?`,
          quickReplies: ['Hôm nay ổn cả', 'Có chuyện muốn kể', 'Mình đang hơi mệt'],
        },
      ],
    };
  }

  // ---------------- hỏi lại ----------------

  private onFollowupAnswer(state: AppState, p: Prepared, now: number): TurnOutput | null {
    const id = state.profile.awaitingFollowup!;
    const fu = state.memories.find((m) => m.id === id);
    const clear = { awaitingFollowup: null };
    if (!fu || fu.resolvedAt) return null;
    const kid = state.children.find((c) => c.id === fu.childId);
    const a = addr(state);
    const t = topicById(fu.topic);
    if (hasAny(p, RESOLVED_KEYS)) {
      return {
        memoryResolves: [id],
        profilePatch: clear,
        messages: [{ text: `Mừng quá! Mình đánh dấu chuyện này là đã ổn rồi nhé. Có điều gì ${a} nghĩ đã giúp ${kid?.name ?? 'bé'} đỡ hơn không?`, showMemories: [id] }],
      };
    }
    if (hasAny(p, UNCHANGED_KEYS)) {
      return {
        memoryPatches: [{ id, patch: { dueAt: now + days(t?.followupDays || 5) } }],
        profilePatch: clear,
        messages: [
          {
            text: `Mình hiểu, chuyện này cần thêm thời gian. ${t ? fill(t.tip, state) : ''} Nếu sau vài tuần vẫn chưa đỡ, nói chuyện với cô giáo hoặc chuyên gia tâm lý trẻ em sẽ giúp ${a} nhìn rõ hơn. Mình sẽ hỏi lại ${a} sau ít hôm.`.replace(/\s+/g, ' '),
          },
        ],
      };
    }
    if (hasAny(p, UNSURE_KEYS)) {
      return {
        memoryPatches: [{ id, patch: { dueAt: now + days(3) } }],
        profilePatch: clear,
        messages: [{ text: `Không sao đâu. Mấy hôm tới ${a} để ý giúp mình nhé. Mình sẽ hỏi lại sau 3 ngày.` }],
      };
    }
    return null;
  }

  // ---------------- tình huống nhạy cảm ----------------

  private onHarsh(state: AppState): TurnOutput {
    const a = addr(state);
    return {
      messages: [
        {
          text: `Mình hiểu lúc đó ${a} bực đến mức nào. Nhưng mình nói thật lòng: đòn roi thường làm con sợ chứ ít khi làm con hiểu, và dễ khiến con giấu chuyện với bố mẹ hơn.`,
          safety: 'concern',
        },
        {
          text: `Khi cả hai đã bình tĩnh, ${a} thử nói rõ một hậu quả gắn với việc con làm, ví dụ "Con làm đổ thì con cùng mẹ lau". Nếu ${a} muốn, kể mình nghe chuyện vừa xảy ra, mình cùng nghĩ cách nhé.`,
          quickReplies: ['Kể chuyện vừa xảy ra', 'Mình chỉ cần xả một chút'],
        },
      ],
    };
  }

  private onPostpartum(state: AppState): TurnOutput {
    const a = addr(state);
    return {
      messages: [
        {
          text: `Cảm ơn ${a} đã dám nói ra. Nhiều người mẹ trải qua cảm giác này sau sinh, và đó không phải lỗi của ${a}. Mình nghĩ ${a} nên nói chuyện sớm với bác sĩ sản khoa hoặc chuyên gia tâm lý, vì cảm giác này có thể được giúp đỡ.`,
          safety: 'concern',
        },
      ],
      memoryAdds: [{ kind: 'parent', scope: 'private', childId: null, text: `${cap(a)} có những cảm xúc khó khăn sau sinh`, topic: 'postpartum' }],
    };
  }

  // ---------------- trò chuyện thường ----------------

  private converse(state: AppState, text: string, now: number, forced?: Child[]): TurnOutput {
    const p = prep(text);
    const a = addr(state);
    const seed = hash(text) + state.messages.length;
    const mentioned = forced ?? mentionedChildren(text, state.children);
    const targets = mentioned.length ? mentioned : state.children.length === 1 ? state.children : [];

    const topics = TOPICS.filter((t) => hasAny(p, t.keys));
    const facts = extractFacts(text, targets.length ? targets : state.children);
    const feeling = hasAny(p, PARENT_FEELINGS.keys);

    // Nhiều con mà chưa rõ đang kể về bé nào: hỏi lại thay vì đoán.
    if ((topics.length || facts.length) && !targets.length && state.children.length > 1) {
      return {
        profilePatch: { pendingClarify: { text } },
        messages: [
          {
            text: `${cap(a)} đang kể về ${names(state.children).replace(/ và /, ' hay ')} vậy? Mình hỏi để ghi đúng vào sổ tay của từng bé.`,
            quickReplies: [...state.children.map((c) => c.name), 'Cả hai'].slice(0, 4),
          },
        ],
      };
    }

    const memoryAdds: NewMemory[] = [];
    const parts: string[] = [];
    let quickReplies: string[] | undefined;
    let lastTopic: AppState['profile']['lastTopic'] = state.profile.lastTopic ?? null;

    if (feeling) {
      const exists = state.memories.some((m) => m.kind === 'parent' && m.topic === 'tired' && now - m.createdAt < days(1));
      if (!exists) memoryAdds.push({ kind: 'parent', scope: 'private', childId: null, text: `${cap(a)} ${PARENT_FEELINGS.phrase}`, topic: 'tired' });
      parts.push(pick([`Cảm ơn ${a} đã nói ra. Chăm con mỗi ngày mà ít ai hỏi han mình thì mệt lắm.`, `Mình nghe rồi. ${cap(a)} đã cố gắng nhiều hơn ${a} nghĩ đấy.`], seed));
      if (!topics.length) {
        parts.push(`Hôm nay điều gì làm ${a} thấy nặng nề nhất?`);
        quickReplies = ['Chuyện của con', 'Chuyện công việc', 'Chỉ muốn nghỉ ngơi'];
      }
    }

    const primary = topics[0];
    if (primary && targets.length) {
      const kid = targets[0];
      const ctx = contextOf(p);
      const prev = state.memories
        .filter((m) => m.kind === 'event' && m.topic === primary.id && m.childId === kid.id && now - m.createdAt < days(60))
        .sort((x, y) => y.createdAt - x.createdAt)[0];
      const open = state.memories.find((m) => m.kind === 'followup' && m.topic === primary.id && m.childId === kid.id && !m.resolvedAt);

      parts.push(fill(pick(primary.empathy, seed), state));
      if (prev && now - prev.createdAt > 30 * MIN) {
        parts.push(`${cap(relativeDay(prev.createdAt, now))} ${a} cũng kể ${kid.name} ${primary.phrase}. Có vẻ chuyện này đang lặp lại.`);
        parts.push(fill(primary.tip, state));
      } else if (primary.positive) {
        parts.push(`Mình ghi lại chuyện vui này của ${kid.name} rồi. ${fill(primary.question, state)}`);
      } else {
        parts.push(fill(primary.question, state));
      }

      for (const k of targets) {
        const sameDay = state.memories.some((m) => m.kind === 'event' && m.topic === primary.id && m.childId === k.id && now - m.createdAt < days(1));
        const eventText = primary.positive ? `${k.name} có chuyện vui: ${shorten(text)}` : `${k.name} ${primary.phrase}${ctx}`;
        if (!sameDay) memoryAdds.push({ kind: 'event', scope: 'family', childId: k.id, text: eventText, topic: primary.id });
        if (primary.followupDays > 0 && !open) {
          memoryAdds.push({
            kind: 'followup',
            scope: 'family',
            childId: k.id,
            text: `Hỏi lại xem ${k.name} còn ${primary.phrase.replace(/^hay /, '')} không`,
            topic: primary.id,
            dueAt: now + days(primary.followupDays),
          });
        }
      }
      for (const t of topics.slice(1)) {
        for (const k of targets) memoryAdds.push({ kind: 'event', scope: 'family', childId: k.id, text: `${k.name} ${t.phrase}`, topic: t.id });
      }
      lastTopic = { id: primary.id, childIds: targets.map((t) => t.id), at: now };
    }

    for (const f of facts) {
      const kid = state.children.find((c) => c.name === f.childName);
      const dup = state.memories.some((m) => m.kind === 'fact' && m.text.toLocaleLowerCase('vi') === f.text.toLocaleLowerCase('vi'));
      if (kid && !dup) memoryAdds.push({ kind: 'fact', scope: 'family', childId: kid.id, text: f.text, topic: 'fact' });
    }
    if (facts.length && !primary) {
      parts.push(`Mình nhớ rồi nhé: ${facts.map((f) => f.text).join('; ')}.`);
      if (facts.some((f) => / dị ứng /u.test(f.text))) parts.push('Thông tin dị ứng mình sẽ luôn nhắc khi gợi ý món ăn hay hoạt động cho bé.');
      else parts.push(`${cap(a)} kể thêm cho mình về điều đó đi.`);
    }

    // Câu kể thêm sau khi Pal vừa hỏi về một chủ đề.
    if (!parts.length && state.profile.lastTopic && now - state.profile.lastTopic.at < 60 * MIN) {
      const t = topicById(state.profile.lastTopic.id)!;
      const kids = state.children.filter((c) => state.profile.lastTopic!.childIds.includes(c.id));
      for (const k of kids) memoryAdds.push({ kind: 'event', scope: 'family', childId: k.id, text: `Chi tiết về ${k.name}: ${shorten(text)}`, topic: `${t.id}_detail` });
      parts.push(`Chi tiết này quan trọng, mình ghi lại rồi.`);
      parts.push(fill(t.tip, state));
      parts.push(`Mình sẽ hỏi lại ${a} chuyện của ${names(kids)} sau vài hôm.`);
      lastTopic = null;
    }

    if (!parts.length) parts.push(...this.smallTalk(state, p, seed));

    const msgs: PalMessage[] = [{ text: parts.join(' '), quickReplies, showMemories: memoryAdds.map((_, i) => i) }];
    return { messages: msgs, memoryAdds, profilePatch: { lastTopic } };
  }

  private smallTalk(state: AppState, p: Prepared, seed: number): string[] {
    const a = addr(state);
    const kids = names(state.children);
    if (hasAny(p, ['chào', 'xin chào', 'hello', 'hi', 'alo'])) return [`Chào ${a}! Hôm nay ${kids} thế nào?`];
    if (hasAny(p, ['cảm ơn', 'cám ơn', 'thanks'])) return [`Không có gì đâu. Lúc nào cần, ${a} cứ mở mình ra kể nhé.`];
    if (hasAny(p, ['ổn cả', 'bình thường', 'không có gì', 'ổn'])) return [`Vậy thì tốt quá. Hôm nay có khoảnh khắc nào làm ${a} vui không?`];
    if (hasAny(p, ['có chuyện muốn kể', 'muốn kể', 'kể chuyện vừa xảy ra'])) return [`Mình nghe đây, ${a} cứ kể từ từ.`];
    if (hasAny(p, ['xả một chút', 'chỉ muốn nghỉ ngơi', 'chỉ cần xả'])) return [`Được, ${a} cứ nói hết ra. Mình chỉ nghe thôi, không khuyên gì cả.`];
    return [
      pick(
        [
          `Mình đang nghe đây. ${cap(a)} kể thêm cho mình nhé, chuyện này bắt đầu từ khi nào?`,
          `Ừm, mình hiểu. Lúc đó ${a} cảm thấy thế nào?`,
          `Cảm ơn ${a} đã kể. Điều gì trong chuyện này làm ${a} bận tâm nhất?`,
        ],
        seed,
      ),
    ];
  }
}

function shorten(text: string, max = 80): string {
  const t = text.trim().replace(/\s+/g, ' ');
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}

