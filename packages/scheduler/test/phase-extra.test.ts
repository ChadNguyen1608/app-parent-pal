// Ca giai đoạn của hồ sơ P5 trong spike (run.js phaseExtraTests) và AC-18: P6-BP-OD-01/02, J4, J5, D-09.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePhase } from '../src/phase.ts';
import { PROFILES } from '../src/profiles.ts';

const p5: any = PROFILES.find((p: any) => p.id === 'P5');
const expected: [string, string[]][] = [
  ['TU_CHOI', ['P6-OD-01:vuot_60_ngay']],
  ['CHUYEN_THANH_MONG_MUON', ['B01-CR§2/D-10:mong_muon']],
  ['TU_CHOI', ['D-09:vuot_60_ngay_giai_doan']],
  ['TU_CHOI', ['J4/OD-02:noi_khong_hop_le']],
  ['CHO_BO_ME_XAC_NHAN', ['J5:cho_xac_nhan']],
];
p5.phaseExtraTests.forEach((x: any, i: number) => {
  test(`giai đoạn P5: ${x.label}`, () => {
    const r = validatePhase(x.ph, p5.phaseHistory);
    assert.equal(r.status, expected[i][0]);
    assert.deepEqual(r.findings.map((f: any) => f.rule + ':' + f.k), expected[i][1]);
  });
});

test('AC-18: giai đoạn tương tự kết thúc 25/11, bắt đầu 30/11 bị từ chối; gợi ý sớm nhất 03/12', () => {
  const hist = [{ purpose: 'on_thi', scope: 'child:X', tu_ngay: '2026-10-20', den_ngay: '2026-11-25', noi_long: ['tong_gio_hoc'] }];
  const r = validatePhase({ purpose: 'on_thi', scope: 'child:X', nguon: 'bo_me', tu_ngay: '2026-11-30', den_ngay: '2026-12-20', noi_long: ['tong_gio_hoc'] }, hist);
  assert.equal(r.status, 'TU_CHOI');
  const f = r.findings.find((x: any) => x.k === 'khoang_trong_7');
  assert.ok(f && /2026-12-03/.test(f.t));
  const ok = validatePhase({ purpose: 'on_thi', scope: 'child:X', nguon: 'bo_me', tu_ngay: '2026-12-03', den_ngay: '2026-12-20', noi_long: ['tong_gio_hoc'] }, hist);
  assert.equal(ok.status, 'OK');
});
