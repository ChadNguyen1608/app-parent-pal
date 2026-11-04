// Chạy hàm gốc trong prototype/index.html trên các lịch mẫu, ghi kết quả chuẩn ra
// mobile/src/pal/fixtures/golden.json. balance.test.ts so kết quả của balance.ts với file này.
// Dùng: node scripts/gen-golden.mjs
import fs from 'node:fs';

const html = fs.readFileSync('prototype/index.html', 'utf8').split('\n');
const lines = (a, b) => html.slice(a - 1, b).join('\n');
const find = (re) => html.findIndex((l) => re.test(l)) + 1;

const from = find(/^const toMin = /);
const checkEnd = find(/^function allWarnings\(\)/);
const budgetFrom = find(/^const GROUPS = \[/);
const budgetTo = find(/^function budgetForPrompt\(\)/) - 1;
const padLine = find(/^const pad = n =>/);
if (!from || !checkEnd || !budgetFrom || !budgetTo || !padLine) throw new Error('Không tìm thấy hàm trong prototype');

const code = `
const DAYS = ["T2","T3","T4","T5","T6","T7","CN"];
let S;
${lines(from, checkEnd)}
${lines(padLine, padLine)}
${lines(budgetFrom, budgetTo)}
return { setS: (s) => { S = s; }, checkDayK, allWarnings, checkDay, relaxedCount, fixedDay, actualDay, restRange, rangeOf, judge, defaultBudget, getBudget, ageOf, gradeOf, hm, COLS, DAYS };
`;
const P = new Function(code)();

const fixtures = JSON.parse(fs.readFileSync('mobile/src/pal/fixtures/lich-mau.json', 'utf8'));
const out = {};
for (const [name, state] of Object.entries(fixtures)) {
  P.setS(JSON.parse(JSON.stringify(state)));
  const days = {};
  for (const d of P.DAYS) {
    days[d] = { warn: P.checkDayK(d), checked: P.checkDay(d), relaxed: P.relaxedCount(d), fixed: P.fixedDay(d), actual: P.actualDay(d) };
  }
  const budget = JSON.parse(JSON.stringify(P.getBudget()));
  const judged = {};
  for (const col of ['wd', 'we']) {
    for (const gk of ['ngu', 'hoc_nha', 'man_hinh', 'sinh_hoat', 'choi_nghi', 'hoc_them']) {
      for (const v of [-30, 0, 20, 45, 59, 60, 61, 90, 120, 121, 180, 181, 270, 271, 500, 540, 570, 600]) {
        judged[`${col}.${gk}.${v}`] = P.judge(gk, col, v);
      }
    }
  }
  out[name] = {
    days,
    budget,
    defaultBudget: P.defaultBudget(),
    rest: { wd: P.restRange('wd'), we: P.restRange('we') },
    ranges: {
      wd: { truong: P.rangeOf('wd', P.fixedDay, 'truong'), hoc_them: P.rangeOf('wd', P.fixedDay, 'hoc_them') },
      we: { truong: P.rangeOf('we', P.fixedDay, 'truong'), hoc_them: P.rangeOf('we', P.fixedDay, 'hoc_them') },
    },
    judged,
  };
}
fs.writeFileSync('mobile/src/pal/fixtures/golden.json', JSON.stringify(out, null, 1));
console.log('Đã ghi golden.json cho', Object.keys(out).join(', '));
