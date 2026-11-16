import { useRef, useState } from 'react';
import { View } from 'react-native';

import { uuidv4 } from '@/data/uuid';
import { checkCallName, parseGrade } from '@/data/validate';
import { useApp } from '@/state/app';
import { deletionLine } from '@/ui/deletion-status';
import { Btn, Choice, Field, H1, Notice, P, Screen } from '@/ui/kit';
import { useAction } from '@/ui/useAction';

// Lần đầu sau khi đăng nhập: tạo hộ (family_create) rồi hồ sơ con tối thiểu (PA-04 rút gọn).
// Chưa có PA-02 (đồng ý) và PA-05..07: thuộc task sau. Chỉ nhập tên gọi, không họ tên đầy đủ.
export default function BatDau() {
  const { api, home, refreshHome } = useApp();
  const [householdId, setHouseholdId] = useState<string | null>(home?.householdId ?? null);
  const [myName, setMyName] = useState('');
  const [childName, setChildName] = useState('');
  const [gradeText, setGradeText] = useState('');
  const [ageText, setAgeText] = useState('');
  const [hasDevice, setHasDevice] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const key = useRef(uuidv4());
  const fam = useAction();
  const kid = useAction();

  async function createFamily() {
    const bad = checkCallName(myName, 'cách bạn muốn được gọi');
    setErrors({ myName: bad });
    if (bad) return;
    await fam.run(async () => {
      const r = await api.familyCreate(myName);
      setHouseholdId(r.householdId);
    });
  }

  async function createChild() {
    const g = parseGrade(gradeText);
    const a = ageText.trim() === '' ? null : /^\d{1,2}$/.test(ageText.trim()) ? Number(ageText.trim()) : NaN;
    const e: Record<string, string | null> = {
      childName: checkCallName(childName, 'tên gọi của con'),
      grade: g.error,
      age: a !== null && (Number.isNaN(a) || a > 18) ? 'Tuổi là một số từ 0 đến 18.' : null,
      either: g.grade === null && a === null && !g.error ? 'Bạn nhập lớp hoặc tuổi của con nhé.' : null,
      device: hasDevice === null ? 'Bạn chọn một đáp án nhé.' : null,
    };
    setErrors(e);
    if (Object.values(e).some(Boolean) || !householdId || hasDevice === null) return;
    await kid.run(async () => {
      await api.childCreate({
        householdId,
        callName: childName,
        grade: g.grade,
        ageYears: a,
        hasDevice,
        idempotencyKey: key.current,
      });
      await refreshHome(); // cổng ở _layout tự chuyển vào khung chính
    });
  }

  if (!householdId) {
    return (
      <Screen>
        <H1>Mình gọi bạn là gì?</H1>
        <P>Một cách gọi ngắn là đủ, ví dụ "chị Lan". Bạn không cần nhập họ tên đầy đủ.</P>
        <Field label="Cách gọi bạn" value={myName} onChangeText={setMyName} autoCapitalize="words" error={errors.myName} />
        {fam.error ? <Notice>{fam.error}</Notice> : null}
        <Btn label="Tiếp tục" onPress={createFamily} busy={fam.busy} />
      </Screen>
    );
  }

  return (
    <Screen>
      {(home?.openDeletions ?? []).map((d) => (
        <Notice key={d.id} kind="info">
          {deletionLine(d)}
        </Notice>
      ))}
      <H1>Thêm con</H1>
      <P>Chỉ cần vài thông tin để bắt đầu. Bạn dùng tên gọi ở nhà, không cần họ tên đầy đủ.</P>
      <Field label="Tên gọi của con" value={childName} onChangeText={setChildName} autoCapitalize="words" error={errors.childName} />
      <Field
        label="Lớp"
        hint="Số từ 1 đến 9. Con chưa đi học thì để trống và nhập tuổi."
        value={gradeText}
        onChangeText={setGradeText}
        keyboardType="number-pad"
        maxLength={1}
        error={errors.grade}
      />
      <Field label="Tuổi (không bắt buộc nếu đã nhập lớp)" value={ageText} onChangeText={setAgeText} keyboardType="number-pad" maxLength={2} error={errors.age ?? errors.either} />
      <View style={{ gap: 8 }}>
        <P>Con có điện thoại riêng không?</P>
        <Choice label="Có" selected={hasDevice === true} onPress={() => setHasDevice(true)} />
        <Choice label="Không" selected={hasDevice === false} onPress={() => setHasDevice(false)} />
        {errors.device ? <P muted>{errors.device}</P> : null}
        <P muted>Chưa có máy riêng thì bạn vẫn lập lịch được, chỉ chưa ghép máy với con.</P>
      </View>
      {kid.error ? <Notice>{kid.error}</Notice> : null}
      <Btn label="Lưu" onPress={createChild} busy={kid.busy} />
    </Screen>
  );
}
