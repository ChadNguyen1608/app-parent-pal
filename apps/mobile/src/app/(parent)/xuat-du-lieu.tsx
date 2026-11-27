import { useState } from 'react';
import { View } from 'react-native';

import { useApp } from '@/state/app';
import { Btn, Choice, H1, Note, Notice, P, Screen } from '@/ui/kit';
import { useAction } from '@/ui/useAction';

// PA-34 Xuất dữ liệu (giữ có điều kiện). Wireframe chưa vẽ màn này: toàn bộ câu chữ là tạm.
// Ở bản thử máy chủ luôn trả BLOCKED_H4 ("chưa mở"): app hiện đúng lời của máy chủ, không hứa có bản xuất.
export default function XuatDuLieu() {
  const { api, home } = useApp();
  const kids = home?.children ?? [];
  const [target, setTarget] = useState<string>('GIA_DINH');
  const act = useAction();
  async function send() {
    await act.run(async () => {
      if (target === 'GIA_DINH') await api.exportRequest('GIA_DINH');
      else await api.exportRequest('HO_SO_CON', target);
    });
  }
  return (
    <Screen>
      <H1>Xuất dữ liệu</H1>
      <P>Bạn có thể xin bản sao dữ liệu của cả gia đình hoặc của một con. (tạm)</P>
      <View style={{ gap: 8 }}>
        <Choice label="Cả gia đình" selected={target === 'GIA_DINH'} onPress={() => setTarget('GIA_DINH')} />
        {kids.map((c) => (
          <Choice key={c.id} label={`Hồ sơ của ${c.callName}`} selected={target === c.id} onPress={() => setTarget(c.id)} />
        ))}
      </View>
      <Note>Tính năng này chưa mở ở bản thử. (tạm)</Note>
      {act.error ? <Notice>{act.error}</Notice> : null}
      <Btn label="Gửi yêu cầu xuất" onPress={send} busy={act.busy} />
    </Screen>
  );
}
