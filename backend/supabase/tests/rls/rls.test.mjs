// Bộ test RLS (T0.6; Tech Spec §6.2). Chạy: scripts/db-test.sh (dựng Postgres tạm) hoặc
// RLS_DB_URL=postgresql://... node --test backend/supabase/tests/rls/rls.test.mjs
// Không dùng package ngoài: psql qua child_process (lib/db.mjs).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DB_URL, run, admin, scalar } from './lib/db.mjs';

const matrix = JSON.parse(readFileSync(new URL('./policy-matrix.json', import.meta.url), 'utf8'));
const ACTORS = matrix.actors;
const HH1 = '00000000-0000-4000-8000-000000000101';
const NA = '00000000-0000-4000-8000-000000000301';
const BIN = '00000000-0000-4000-8000-000000000302';
const SU = '00000000-0000-4000-8000-000000000303';
const PAST_WEEK = '2025-W40'; // T2 2025-09-29 .. CN 2025-10-05, có dữ liệu seed cho bé Na

const skip = DB_URL ? false : 'đặt RLS_DB_URL (hoặc chạy scripts/db-test.sh) để chạy test CSDL';

const catalog = (sql) => {
  const r = admin(sql);
  assert.ok(r.ok, `truy vấn catalog lỗi: ${r.err}`);
  return r.rows;
};
const list = (sql) => catalog(sql).map((l) => l.trim());

const appTables = () => list(`select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='app' and c.relkind in ('r','p') order by 1`);
const privateTables = () => list(`select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='private' and c.relkind in ('r','p') order by 1`);

// ---------------------------------------------------------------- RLS-GEN
describe('RLS-GEN', { skip }, () => {
  it('RLS-GEN-01: mọi bảng app bật RLS và có dòng trong policy-matrix.json (và ngược lại)', () => {
    const tables = appTables();
    assert.ok(tables.length > 0, 'schema app không có bảng nào');
    const noRls = list(`select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='app' and c.relkind in ('r','p') and not c.relrowsecurity order by 1`);
    assert.deepEqual(noRls, [], `bảng app chưa bật RLS: ${noRls.join(', ')}`);
    const inMatrix = Object.keys(matrix.app).sort();
    const missing = tables.filter((t) => !inMatrix.includes(t));
    assert.deepEqual(missing, [], `bảng app thiếu dòng trong policy-matrix.json: ${missing.join(', ')}`);
    const stale = inMatrix.filter((t) => !tables.includes(t));
    assert.deepEqual(stale, [], `policy-matrix.json có bảng không tồn tại: ${stale.join(', ')}`);
  });

  it('RLS-GEN-02: anon và authenticated không select được gì từ private.*', () => {
    const tables = privateTables();
    const known = Object.keys(matrix.private).sort();
    assert.deepEqual(tables, known, 'bảng private lệch với policy-matrix.json');
    assert.equal(list(`select has_schema_privilege('anon','private','USAGE')`)[0], 'f');
    assert.equal(list(`select has_schema_privilege('authenticated','private','USAGE')`)[0], 'f');
    for (const t of tables) {
      for (const role of ['anon', 'authenticated']) {
        assert.equal(list(`select has_table_privilege('${role}','private.${t}','SELECT')`)[0], 'f',
          `${role} có quyền SELECT trên private.${t}`);
        assert.equal(list(`select has_any_column_privilege('${role}','private.${t}','SELECT')`)[0], 'f');
      }
      for (const key of Object.keys(ACTORS)) {
        const r = run(ACTORS[key], `select count(*) from private.${t}`);
        assert.equal(r.ok, false, `${key} đọc được private.${t}`);
        assert.equal(r.code, '42501', `${key}/private.${t}: mong 42501, nhận ${r.code}`);
      }
      assert.equal(list(`select relrowsecurity from pg_class where oid='private.${t}'::regclass`)[0], 't',
        `private.${t} chưa bật RLS (phòng thủ chiều sâu)`);
    }
    assert.equal(list(`select count(*) from pg_policies where schemaname='private'`)[0], '0',
      'private.* không được có chính sách nào');
  });

  it('RLS-GEN-03: anon không có quyền gì trên schema app; không ai có quyền ghi trực tiếp', () => {
    assert.equal(list(`select has_schema_privilege('anon','app','USAGE')`)[0], 'f');
    const anonFn = list(`select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='app' and has_function_privilege('anon', p.oid, 'EXECUTE')`);
    assert.deepEqual(anonFn, [], `anon có EXECUTE: ${anonFn.join(', ')}`);
    const anonTbl = list(`select c.oid::regclass from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname in ('app','private') and c.relkind in ('r','p','v','m')
        and has_any_column_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,REFERENCES')`);
    assert.deepEqual(anonTbl, [], `anon có quyền trên: ${anonTbl.join(', ')}`);
    const writers = list(`select c.oid::regclass from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname in ('app','private') and c.relkind in ('r','p')
        and (has_table_privilege('authenticated', c.oid, 'INSERT')
          or has_table_privilege('authenticated', c.oid, 'UPDATE')
          or has_table_privilege('authenticated', c.oid, 'DELETE')
          or has_table_privilege('authenticated', c.oid, 'TRUNCATE'))`);
    assert.deepEqual(writers, [], `authenticated ghi trực tiếp được: ${writers.join(', ')} (ghi phải qua hàm)`);
  });

  it('RLS-GEN-04: mọi hàm app là security definer, search_path rỗng, EXECUTE đúng danh sách', () => {
    const rows = list(`select p.proname, p.prosecdef, coalesce(array_to_string(p.proconfig, ','), ''),
        (select coalesce(string_agg(r.rolname, ',' order by r.rolname), '') from pg_roles r
          where r.rolname in ('anon','authenticated') and has_function_privilege(r.rolname, p.oid, 'EXECUTE'))
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='app' order by 1`);
    assert.ok(rows.length > 0);
    for (const row of rows) {
      const [name, secdef, config, execRoles] = row.split('|');
      assert.ok(name in matrix.app_functions, `hàm app.${name} chưa có trong policy-matrix.json`);
      assert.equal(secdef, 't', `app.${name} không phải security definer`);
      assert.match(config, /search_path=("")?(,|$)/, `app.${name} không đặt search_path rỗng (có: ${config})`);
      assert.equal(execRoles, [...matrix.app_functions[name]].sort().join(','),
        `app.${name}: vai có EXECUTE = '${execRoles}'`);
    }
  });
});

// ---------------------------------------------------------------- RLS-ROLE
describe('RLS-ROLE: đọc theo vai trên bảng baseline (mặc định từ chối)', { skip }, () => {
  for (const [table, def] of Object.entries(matrix.app)) {
    for (const [who, expected] of Object.entries(def.select)) {
      it(`RLS-ROLE ${table} / ${who}: ${expected === 'denied' ? 'bị từ chối' : `thấy ${expected} dòng`}`, () => {
        const r = run(ACTORS[who], `select count(*) from app.${table}`);
        if (expected === 'denied') {
          assert.equal(r.ok, false, `${who} đọc được app.${table}`);
          assert.equal(r.code, '42501');
        } else {
          assert.ok(r.ok, r.err);
          assert.equal(Number(r.rows[0]), expected);
        }
      });
    }
    for (const who of Object.keys(ACTORS)) {
      it(`RLS-ROLE ${table} / ${who}: ghi trực tiếp (insert, update, delete) bị từ chối`, () => {
        for (const sql of [
          `insert into app.${table} default values`,
          `update app.${table} set id = id`,
          `delete from app.${table}`,
        ]) {
          const r = run(ACTORS[who], sql);
          assert.equal(r.ok, false, `${who} chạy được: ${sql}`);
          assert.equal(r.code, '42501', `${sql} → ${r.code}`);
        }
      });
    }
  }

  it('RLS-ROLE-ISO: người hộ khác không thấy dòng nào của hộ 1; NL không thấy bé Bin', () => {
    for (const [t, col] of [['households', 'id'], ['members', 'household_id'], ['children', 'household_id']]) {
      const n = scalar(ACTORS.HO_KHAC, `select count(*) from app.${t} where ${col} = '${HH1}'`);
      assert.equal(n, '0', `HO_KHAC thấy dòng hộ 1 ở app.${t}`);
    }
    assert.equal(scalar(ACTORS.NL, `select count(*) from app.children where id = '${BIN}'`), '0');
    assert.equal(scalar(ACTORS.NL, `select count(*) from app.children where id = '${NA}'`), '1');
    assert.equal(scalar(ACTORS.QL, `select count(*) from app.children where id = '${SU}'`), '0');
  });

  it('RLS-ROLE-GRANT: thu hồi grant thì NL không còn thấy bé Na', () => {
    const r = run(ACTORS.NL, `select count(*) from app.children where id = '${NA}'`,
      { setup: `update app.grants set state='THU_HOI' where child_id='${NA}';` });
    assert.equal(r.rows[0], '0');
  });

  it('RLS-ROLE-BIND: huỷ ghép thì máy con không còn thấy bé Na; QL cũng không thấy bé đã ẩn', () => {
    const dev = run(ACTORS.CON, `select count(*) from app.children where id = '${NA}'`,
      { setup: `update app.device_bindings set state='DA_HUY' where child_id='${NA}';` });
    assert.equal(dev.rows[0], '0');
    const ql = run(ACTORS.QL, `select count(*) from app.children where id = '${NA}'`,
      { setup: `update app.children set hidden_at=now(), hidden_reason='test' where id='${NA}';` });
    assert.equal(ql.rows[0], '0');
  });

  it('RLS-ROLE-SVC: service_role (hệ thống) đọc được app và private (đối chứng dương)', () => {
    const svc = { role: 'service_role' };
    assert.equal(scalar(svc, 'select count(*) from app.children'), '3');
    assert.equal(scalar(svc, 'select count(*) from private.checkin_responses'), '6');
  });
});

// ---------------------------------------------------------------- Ràng buộc lược đồ
describe('RLS-SCHEMA: ràng buộc dữ liệu của baseline', { skip }, () => {
  const bad = (sql, code) => {
    const r = admin(sql);
    assert.equal(r.ok, false, `lẽ ra lỗi: ${sql}`);
    assert.equal(r.code, code, r.err);
  };
  it('chỉ một PRIMARY đang tham gia mỗi hộ', () => {
    bad(`insert into auth.users(id) values ('00000000-0000-4000-8000-0000000000f1');
         insert into app.members(household_id,user_id,role,call_name)
         values ('${HH1}','00000000-0000-4000-8000-0000000000f1','PRIMARY','chị giả')`, '23505');
  });
  it('mode CHILD_DIRECTED bị cấm (D-19)', () => {
    bad(`update app.children set mode='CHILD_DIRECTED' where id='${NA}'`, '23514');
  });
  it('con không có máy (has_device=false) không được ghép', () => {
    bad(`insert into auth.users(id) values ('00000000-0000-4000-8000-0000000000f2');
         insert into app.device_bindings(child_id,device_user_id) values ('${BIN}','00000000-0000-4000-8000-0000000000f2')`,
      '23514');
  });
  it('mỗi con chỉ một liên kết HIEU_LUC', () => {
    bad(`insert into auth.users(id) values ('00000000-0000-4000-8000-0000000000f3');
         insert into app.device_bindings(child_id,device_user_id,state) values ('${NA}','00000000-0000-4000-8000-0000000000f3','HIEU_LUC')`,
      '23505');
  });
  it('mã ghép đang hạn là duy nhất (dùng một lần)', () => {
    bad(`insert into private.pairing_codes(device_user_id,code_hmac,expires_at)
         values ('00000000-0000-4000-8000-0000000000a5','seed-fake-hmac-0001', now())`, '23505');
  });
  it('hộ THU_NOI_BO_D01 bắt buộc có trial_slot_id', () => {
    bad(`insert into app.households(data_class) values ('THU_NOI_BO_D01')`, '23514');
  });
});

// ---------------------------------------------------------------- RLS-D38
describe('RLS-D38: lựa chọn hỏi thăm của con (D-38)', { skip }, () => {
  const adults = ['QL', 'NL', 'HO_KHAC'];
  const week = (a, w, child = NA) => run(ACTORS[a], `select app.weekly_report('${child}', '${w}')`);

  it('RLS-D38-01: người lớn (và mọi vai) đọc trực tiếp private.checkin_responses bị từ chối', () => {
    for (const who of Object.keys(ACTORS)) {
      for (const sql of [
        'select * from private.checkin_responses',
        'select count(*) from private.checkin_responses',
        `select choice from private.checkin_responses where child_id='${NA}'`,
        'select * from private.child_settings',
      ]) {
        const r = run(ACTORS[who], sql);
        assert.equal(r.ok, false, `${who} chạy được: ${sql}`);
        assert.equal(r.code, '42501');
      }
    }
    // Không thể tự cấp quyền cho mình.
    const g = run(ACTORS.QL, 'grant select on private.checkin_responses to authenticated');
    assert.equal(g.ok, false);
  });

  it('RLS-D38-02: không có đường vòng qua view, hàm, publication, chính sách', () => {
    // (a) không view/matview/rule nào dựa trên các bảng private nhạy cảm
    const deps = list(`select distinct r.ev_class::regclass from pg_rewrite r
      join pg_depend d on d.classid='pg_rewrite'::regclass and d.objid=r.oid
      where d.refobjid in ('private.checkin_responses'::regclass, 'private.child_settings'::regclass)
        and r.ev_class not in ('private.checkin_responses'::regclass, 'private.child_settings'::regclass)`);
    assert.deepEqual(deps, [], `view/rule đọc private: ${deps.join(', ')}`);
    // (b) mọi hàm (mọi schema người dùng) nhắc tới checkin_responses phải nằm trong allowlist
    const readers = list(`select n.nspname || '.' || p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname not in ('pg_catalog','information_schema') and p.prosrc ~* 'checkin_responses' order by 1`);
    assert.deepEqual(readers, [...matrix.private_readers.functions].sort(),
      `hàm đọc checkin_responses ngoài allowlist: ${readers.join(', ')}`);
    // (c) hàm duy nhất đó trả jsonb đơn (không setof / record / bảng)
    assert.deepEqual(list(`select pg_get_function_result('app.weekly_report(uuid,text)'::regprocedure), proretset
      from pg_proc where oid='app.weekly_report(uuid,text)'::regprocedure`), ['jsonb|f']);
    // (d) không có bảng/hàm nào trong private mà authenticated gọi được
    assert.deepEqual(list(`select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='private' and has_function_privilege('authenticated', p.oid, 'EXECUTE')`), []);
    // (e) không nằm trong publication Realtime (hay publication nào)
    assert.deepEqual(list(`select pubname || ':' || schemaname || '.' || tablename from pg_publication_tables
      where schemaname='private' or tablename in ('checkin_responses','child_settings')`), []);
    assert.deepEqual(list(`select p.pubname from pg_publication p where p.puballtables`), []);
    // (f) không bảng app nào có cột sao chép lựa chọn hỏi thăm
    assert.deepEqual(list(`select table_name || '.' || column_name from information_schema.columns
      where table_schema='app' and column_name in ('choice','day_features','checkin','hoi_met','rat_met')`), []);
    // (g) không chính sách nào trên bảng private
    assert.equal(list(`select count(*) from pg_policies where schemaname='private'`)[0], '0');
  });

  it('RLS-D38-03: người lớn gọi weekly_report chỉ nhận số đếm theo loại ngày (QL), người khác bị từ chối', () => {
    const ql = week('QL', PAST_WEEK);
    assert.ok(ql.ok, ql.err);
    const out = JSON.parse(ql.rows[0]);
    assert.equal(out.ready, true);
    // Seed: hoc_them_toi = T2(on), T3(rat_met), T5(hoi_met) -> 3 ngày; the_thao = 1; khong_dac_diem = T4, T7 (T6 bo_qua bị loại)
    assert.deepEqual(out.by_day_type, {
      hoc_them_toi: { ngay: 3, hoi_met: 1, rat_met: 1 },
      the_thao: { ngay: 1, hoi_met: 1, rat_met: 0 },
      khong_dac_diem: { ngay: 2, hoi_met: 0, rat_met: 0 },
    });
    // Đầu ra không chứa ngày, thứ, giờ.
    assert.doesNotMatch(ql.rows[0], /\d{4}-\d{2}-\d{2}|T[2-7]\b|CN\b|occurred|local_date|thứ/i);
    assert.deepEqual(Object.keys(out).sort(), ['by_day_type', 'iso_week', 'ready']);
    for (const who of ['NL', 'HO_KHAC', 'CON', 'CON_CHUA_GHEP', 'ANON']) {
      const r = week(who, PAST_WEEK);
      assert.equal(r.ok, false, `${who} gọi được weekly_report`);
      assert.equal(r.code, '42501');
    }
    // QL không xem được con của hộ khác.
    const other = week('QL', PAST_WEEK, SU);
    assert.equal(other.ok, false);
    assert.equal(other.code, '42501');
  });

  it('RLS-D38-05: weekly_report chỉ nhận mã tuần ISO, không nhận khoảng ngày', () => {
    assert.deepEqual(list(`select pg_get_function_arguments(p.oid) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='app' and p.proname='weekly_report'`), ['child uuid, iso_week text']);
    for (const bad of ['2025-09-29', '2025-W54', '2025-W00', '2025-W40-1', 'tuần 40', '2025-W53', '']) {
      const r = week('QL', bad);
      assert.equal(r.ok, false, `chấp nhận '${bad}'`);
      assert.equal(r.code, '22023');
    }
  });

  it('RLS-D38-06: mốc cắt - tuần chưa kết thúc trả "chưa sẵn sàng"; bản ghi sau mốc bị loại', () => {
    const future = JSON.parse(week('QL', '2099-W10').rows[0]);
    assert.deepEqual(future, { iso_week: '2099-W10', ready: false });
    // Thêm một bản ghi lúc CN 20:30 (sau mốc 20:00) vào tuần W40: không được tính.
    const r = run(ACTORS.QL, `select app.weekly_report('${NA}', '${PAST_WEEK}')`, {
      setup: `delete from private.checkin_responses where child_id='${NA}' and local_date='2025-10-04';
              insert into private.checkin_responses(child_id,local_date,choice,day_features,occurred_at,idempotency_key)
              values ('${NA}','2025-10-05','rat_met','{muon}','2025-10-05 20:30+07','10000000-0000-4000-8000-0000000000ff');`,
    });
    assert.ok(r.ok, r.err);
    assert.equal(JSON.parse(r.rows[0]).by_day_type.muon, undefined);
    // Cùng bản ghi lúc 19:59 thì được tính.
    const r2 = run(ACTORS.QL, `select app.weekly_report('${NA}', '${PAST_WEEK}')`, {
      setup: `insert into private.checkin_responses(child_id,local_date,choice,day_features,occurred_at,idempotency_key)
              values ('${NA}','2025-10-05','rat_met','{muon}','2025-10-05 19:59+07','10000000-0000-4000-8000-0000000000fe');`,
    });
    assert.deepEqual(JSON.parse(r2.rows[0]).by_day_type.muon, { ngay: 1, hoi_met: 0, rat_met: 1 });
  });

  it('RLS-D38-07: không-suy-ngược - hai bộ dữ liệu chỉ khác NGÀY cho cùng đầu ra ở mọi điểm người lớn đọc được', () => {
    const wipe = `delete from private.checkin_responses where child_id='${NA}';`;
    const ins = (date, hh) => `insert into private.checkin_responses(child_id,local_date,choice,day_features,occurred_at,idempotency_key)
      values ('${NA}','${date}','rat_met','{hoc_them_toi}','${date} ${hh}+07', gen_random_uuid());`;
    const sets = [
      wipe + ins('2025-09-29', '20:30') + ins('2025-10-01', '20:30'),   // rất mệt vào T2 và T4
      wipe + ins('2025-09-30', '20:30') + ins('2025-10-03', '20:30'),   // rất mệt vào T3 và T6
    ];
    const outputs = sets.map((setup) => {
      // Mọi điểm người lớn đọc được: weekly_report, và đọc 5 bảng app (QL).
      const r = run(ACTORS.QL, `select app.weekly_report('${NA}', '${PAST_WEEK}');`, { setup });
      assert.ok(r.ok, r.err);
      const dump = run(ACTORS.QL, `
        select (select json_agg(t order by t::text) from app.children t)::text
          || (select json_agg(t order by t::text) from app.grants t)::text
          || (select json_agg(t order by t::text) from app.device_bindings t)::text`, { setup });
      assert.ok(dump.ok, dump.err);
      return r.rows.join('\n') + '\n' + dump.rows.join('\n');
    });
    assert.equal(outputs[0], outputs[1], 'đầu ra khác nhau theo ngày: lộ thông tin từng ngày');
    // Đối chứng: đổi LOẠI ngày thì đầu ra phải khác (test không rỗng).
    const diff = run(ACTORS.QL, `select app.weekly_report('${NA}', '${PAST_WEEK}')`,
      { setup: wipe + ins('2025-09-29', '20:30').replace('{hoc_them_toi}', '{the_thao}') });
    assert.notEqual(diff.rows[0], outputs[0].split('\n')[0]);
  });
});
