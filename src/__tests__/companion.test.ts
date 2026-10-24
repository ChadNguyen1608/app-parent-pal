import { MockEngine } from '../ai/mockEngine';
import { assessSafety } from '../ai/safety';
import { days } from '../ai/text';
import { AppState, emptyState } from '../domain/types';
import { deleteMemory, openSession, runTurn, toggleScope } from '../state/companion';

const engine = new MockEngine();
const T0 = new Date('2026-10-20T21:00:00+07:00').getTime();
const MIN = 60_000;

async function onboard(kids = 'bé Na 8 tuổi'): Promise<AppState> {
  let s = await openSession(emptyState(), engine, T0);
  s = await runTurn(s, 'chị Lan', engine, T0 + MIN);
  s = await runTurn(s, kids, engine, T0 + 2 * MIN);
  return s;
}
const lastPal = (s: AppState) => s.messages.filter((m) => m.sender === 'pal').at(-1)!;
const palTextSince = (s: AppState, n: number) => s.messages.slice(n).filter((m) => m.sender === 'pal').map((m) => m.text).join(' ');

describe('làm quen bằng trò chuyện', () => {
  test('lời chào hỏi tên', async () => {
    const s = await openSession(emptyState(), engine, T0);
    expect(s.messages).toHaveLength(2);
    expect(lastPal(s).text).toMatch(/gọi bạn thế nào/);
  });

  test('tên và các con được ghi lại', async () => {
    const s = await onboard('bé Na 8 tuổi và bé Bin 5 tuổi');
    expect(s.profile).toMatchObject({ callName: 'chị Lan', callShort: 'chị', onboarding: 'done' });
    expect(s.children.map((c) => [c.name, c.age])).toEqual([
      ['Na', 8],
      ['Bin', 5],
    ]);
    expect(palTextSince(s, 0)).toMatch(/Na \(8 tuổi\) và Bin \(5 tuổi\)/);
  });

  test('chưa nghe rõ thì hỏi lại, không đoán', async () => {
    let s = await openSession(emptyState(), engine, T0);
    s = await runTurn(s, 'chị Lan', engine, T0 + MIN);
    s = await runTurn(s, 'nhà mình có hai đứa', engine, T0 + 2 * MIN);
    expect(s.children).toHaveLength(0);
    expect(s.profile.onboarding).toBe('askChildren');
  });
});

describe('trí nhớ từ cuộc trò chuyện', () => {
  test('kể chuyện lo thì ghi sự kiện và việc cần hỏi lại', async () => {
    let s = await onboard();
    s = await runTurn(s, 'Hôm nay Na đi học về cứ cáu, hỏi gì cũng không nói', engine, T0 + 10 * MIN);
    const na = s.children[0];
    const events = s.memories.filter((m) => m.kind === 'event');
    const follow = s.memories.filter((m) => m.kind === 'followup');
    expect(events.map((m) => m.text)).toContain('Na hay cáu kỉnh sau giờ học');
    expect(follow).toHaveLength(1);
    expect(follow[0]).toMatchObject({ childId: na.id, topic: 'irritable', scope: 'family' });
    expect(follow[0].dueAt).toBe(T0 + 10 * MIN + days(5));
    // Tin trả lời hiện những gì vừa ghi nhớ.
    expect(lastPal(s).savedMemoryIds!.length).toBeGreaterThanOrEqual(2);
  });

  test('chuyện lặp lại thì Pal nhắc lần trước và đưa gợi ý', async () => {
    let s = await onboard();
    s = await runTurn(s, 'Na cáu quá', engine, T0 + 10 * MIN);
    s = await runTurn(s, 'Hôm nay Na lại cáu', engine, T0 + days(2));
    expect(lastPal(s).text).toMatch(/2 hôm trước chị cũng kể Na hay cáu kỉnh/);
    expect(lastPal(s).text).toMatch(/gọi tên cảm xúc/);
    // Không tạo thêm việc theo dõi trùng.
    expect(s.memories.filter((m) => m.kind === 'followup' && !m.resolvedAt)).toHaveLength(1);
  });

  test('nhiều con mà không nêu tên thì hỏi lại là bé nào', async () => {
    let s = await onboard('bé Na 8 tuổi, bé Bin 5 tuổi');
    s = await runTurn(s, 'Con không chịu đi học', engine, T0 + 10 * MIN);
    expect(lastPal(s).text).toMatch(/Na hay Bin/);
    expect(s.memories).toHaveLength(0);
    s = await runTurn(s, 'Bin', engine, T0 + 11 * MIN);
    const bin = s.children.find((c) => c.name === 'Bin')!;
    expect(s.memories.find((m) => m.kind === 'event')).toMatchObject({ childId: bin.id, text: 'Bin không muốn đi học' });
    expect(s.profile.pendingClarify).toBeNull();
  });

  test('sở thích và dị ứng vào hồ sơ', async () => {
    let s = await onboard();
    s = await runTurn(s, 'Na rất thích vẽ, còn dị ứng tôm', engine, T0 + 10 * MIN);
    expect(s.memories.filter((m) => m.kind === 'fact').map((m) => m.text)).toEqual(['Na thích vẽ', 'Na dị ứng tôm']);
  });

  test('cảm xúc của phụ huynh nằm trong vùng riêng', async () => {
    let s = await onboard();
    s = await runTurn(s, 'Dạo này mình mệt mỏi quá', engine, T0 + 10 * MIN);
    const m = s.memories.find((x) => x.kind === 'parent')!;
    expect(m).toMatchObject({ scope: 'private', childId: null });
  });

  test('câu kể thêm được ghi làm chi tiết của chủ đề vừa hỏi', async () => {
    let s = await onboard();
    s = await runTurn(s, 'Na không muốn đi học', engine, T0 + 10 * MIN);
    s = await runTurn(s, 'Tuần trước cô mới đổi chỗ, bé ngồi cạnh một bạn hay trêu', engine, T0 + 12 * MIN);
    expect(s.memories.some((m) => m.text.startsWith('Chi tiết về Na: Tuần trước cô mới đổi chỗ'))).toBe(true);
    expect(lastPal(s).text).toMatch(/câu thật cụ thể/);
  });
});

describe('chủ động hỏi lại', () => {
  test('đến hạn thì Pal mở lời, phụ huynh báo đỡ thì khép lại', async () => {
    let s = await onboard();
    s = await runTurn(s, 'Na hay cáu sau giờ học', engine, T0 + 10 * MIN);
    // Chưa đến hạn: không hỏi.
    expect(await openSession(s, engine, T0 + days(1))).toBe(s);
    s = await openSession(s, engine, T0 + days(6));
    expect(lastPal(s).text).toMatch(/chị có kể Na hay cáu kỉnh\. Mấy hôm nay Na thế nào rồi\?/);
    expect(lastPal(s).quickReplies).toEqual(['Đỡ hơn rồi', 'Vẫn vậy', 'Chưa để ý']);
    s = await runTurn(s, 'Đỡ hơn rồi', engine, T0 + days(6) + MIN);
    expect(s.memories.find((m) => m.kind === 'followup')!.resolvedAt).toBeDefined();
    expect(s.profile.awaitingFollowup).toBeNull();
  });

  test('vẫn vậy thì dời ngày hỏi lại', async () => {
    let s = await onboard();
    s = await runTurn(s, 'Na hay cáu', engine, T0 + 10 * MIN);
    s = await openSession(s, engine, T0 + days(6));
    s = await runTurn(s, 'Vẫn vậy', engine, T0 + days(6) + MIN);
    const f = s.memories.find((m) => m.kind === 'followup')!;
    expect(f.resolvedAt).toBeUndefined();
    expect(f.dueAt).toBe(T0 + days(6) + MIN + days(5));
  });
});

describe('an toàn', () => {
  test.each([
    ['Con nói con muốn chết', 'urgent'],
    ['Tôi nghi bé bị sờ soạng ở chỗ học thêm', 'urgent'],
    ['Tôi định đánh cho nó nhớ', 'concern'],
    ['Con hỏi câu này khó quá', 'none'],
    ['Na bị bạn đánh ở trường', 'none'],
  ])('%s -> %s', (text, level) => {
    expect(assessSafety(text).level).toBe(level);
  });

  test('tình huống khẩn: chỉ đưa thông tin hỗ trợ, không ghi trí nhớ', async () => {
    let s = await onboard();
    s = await runTurn(s, 'Na nói con muốn chết', engine, T0 + 10 * MIN);
    const pals = s.messages.slice(-2);
    expect(pals[0]).toMatchObject({ sender: 'pal', safety: 'urgent' });
    expect(pals[0].text).toMatch(/115/);
    expect(pals[0].text).toMatch(/111/);
    expect(s.memories).toHaveLength(0);
  });

  test('muốn dùng đòn roi: Pal phản biện nhẹ nhàng, không hùa theo', async () => {
    let s = await onboard();
    s = await runTurn(s, 'Tôi định đánh cho nó nhớ', engine, T0 + 10 * MIN);
    const text = s.messages.slice(-2).map((m) => m.text).join(' ');
    expect(text).toMatch(/đòn roi thường làm con sợ/);
  });
});

describe('phụ huynh tự sửa sổ tay', () => {
  test('xóa và đổi phạm vi', async () => {
    let s = await onboard();
    s = await runTurn(s, 'Na thích vẽ', engine, T0 + 10 * MIN);
    const id = s.memories[0].id;
    s = toggleScope(s, id);
    expect(s.memories[0].scope).toBe('private');
    s = deleteMemory(s, id);
    expect(s.memories).toHaveLength(0);
    expect(s.messages.every((m) => !m.savedMemoryIds?.includes(id))).toBe(true);
  });
});
