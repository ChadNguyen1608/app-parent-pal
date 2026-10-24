import { mentionedChildren, parseCallName, parseChildren } from '../ai/parse';
import { hasPhrase, prep } from '../ai/text';

describe('parseCallName', () => {
  test.each([
    ['chị Lan', 'chị Lan', 'chị'],
    ['Cứ gọi mình là anh Minh nhé', 'anh Minh', 'anh'],
    ['mẹ bống', 'mẹ Bống', 'mẹ'],
    ['Lan', 'Lan', ''],
    ['gọi là Hà', 'Hà', ''],
  ])('%s', (input, full, short) => {
    expect(parseCallName(input)).toEqual({ full, short });
  });

  test('câu dài không có tên thì không đoán', () => {
    expect(parseCallName('mình không biết nói gì bây giờ cả')).toBeNull();
  });
});

describe('parseChildren', () => {
  test('hai bé có tuổi', () => {
    expect(parseChildren('Nhà mình có bé Na 8 tuổi và bé Bin 5 tuổi')).toEqual([
      { name: 'Na', age: 8 },
      { name: 'Bin', age: 5 },
    ]);
  });
  test('viết thường và dấu phẩy', () => {
    expect(parseChildren('bé na 8 tuổi, bé bin 5 tuổi')).toEqual([
      { name: 'Na', age: 8 },
      { name: 'Bin', age: 5 },
    ]);
  });
  test('tuổi bằng chữ và "tên"', () => {
    expect(parseChildren('con gái tên Mai, năm nay mười hai tuổi')).toEqual([{ name: 'Mai', age: 12 }]);
  });
  test('tên viết hoa đứng trước tuổi', () => {
    expect(parseChildren('Na 8 tuổi, Bin 5 tuổi')).toEqual([
      { name: 'Na', age: 8 },
      { name: 'Bin', age: 5 },
    ]);
  });
  test('không có tuổi', () => {
    expect(parseChildren('một bé thôi, bé Su')).toEqual([{ name: 'Su' }]);
  });
  test('không có tên', () => {
    expect(parseChildren('nhà mình có hai đứa')).toEqual([]);
  });
});

describe('so khớp tiếng Việt', () => {
  test('có dấu thì không nhầm "câu" với "cáu"', () => {
    expect(hasPhrase(prep('Con hỏi câu này khó quá'), 'cáu')).toBe(false);
    expect(hasPhrase(prep('Con cáu suốt'), 'cáu')).toBe(true);
  });
  test('gõ không dấu vẫn hiểu', () => {
    expect(hasPhrase(prep('con so di hoc'), 'sợ đi học')).toBe(true);
  });
  test('nhận ra tên con cả khi không dấu', () => {
    const kids = [{ id: '1', name: 'Bống' }, { id: '2', name: 'Bin' }];
    expect(mentionedChildren('hom nay bong bi sot', kids).map((k) => k.id)).toEqual(['1']);
  });
});

test('có dấu thì "sự" không bị nhầm thành bé Su', () => {
  expect(mentionedChildren('Sự việc hôm nay', [{ id: '1', name: 'Su' }])).toEqual([]);
});
