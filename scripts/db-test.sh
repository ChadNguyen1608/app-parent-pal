#!/usr/bin/env bash
# Chạy test RLS (T0.6) trên CSDL thật. Hai chế độ:
#   scripts/db-test.sh                    Postgres 16 thuần: initdb vào thư mục tạm, cổng riêng,
#                                         nạp stub + migrations + seed, chạy test, dọn dẹp.
#   scripts/db-test.sh --supabase         Supabase CLI cục bộ (đã `supabase start`, cần Docker):
#                                         chạy test vào CSDL cục bộ (mặc định cổng 54322).
#                                         Thêm --reset để chạy `supabase db reset` trước.
#   scripts/db-test.sh --prove-negative   Chế độ thuần + áp từng đột biến (tests/rls/mutations/*.sql)
#                                         và xác nhận test THẤT BẠI đúng mã mong đợi.
#   scripts/db-test.sh --prove-negative --only m66,m67
#                                         Chỉ áp các đột biến có tên bắt đầu bằng một trong các mã đó (vẫn chạy đối chứng
#                                         không đột biến trước). Cả bộ mất hơn 60 phút; dùng --only khi thêm đột biến mới.
# Biến môi trường: PG_BIN (mặc định /usr/lib/postgresql/16/bin), DB_TEST_PORT (mặc định tự chọn),
#   RLS_DB_URL (chế độ --supabase; mặc định postgresql://postgres:postgres@127.0.0.1:54322/postgres).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SB="$ROOT/backend/supabase"
TEST_FILES=("$SB/tests/rls/rls.test.mjs" "$SB/tests/rls/fn.test.mjs" "$SB/tests/rls/pair.test.mjs" "$SB/tests/rls/member.test.mjs" "$SB/tests/rls/consent.test.mjs" "$SB/tests/rls/audit.test.mjs" "$SB/tests/rls/lifecycle.test.mjs" "$SB/tests/rls/trial.test.mjs" "$SB/tests/rls/health.test.mjs" "$SB/tests/rls/alerts.test.mjs" "$SB/tests/rls/schedule.test.mjs" "$SB/tests/rls/plan.test.mjs")
MODE=sandbox; RESET=0; PROVE=0; ONLY=
while [ $# -gt 0 ]; do
  a="$1"; shift
  case "$a" in
    --supabase) MODE=supabase ;;
    --reset) RESET=1 ;;
    --prove-negative) PROVE=1 ;;
    --only) [ $# -gt 0 ] || { echo "--only cần danh sách mã (vd m66,m67)" >&2; exit 2; }; ONLY="$1"; shift ;;
    -h|--help) sed -n '2,17p' "$0"; exit 0 ;;
    *) echo "Tham số lạ: $a" >&2; exit 2 ;;
  esac
done

# ------------------------------------------------------------------ chế độ Supabase CLI
if [ "$MODE" = supabase ]; then
  if [ "$RESET" = 1 ]; then (cd "$ROOT/backend" && supabase db reset); fi
  export RLS_DB_URL="${RLS_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
  exec node --test "${TEST_FILES[@]}"
fi

# ------------------------------------------------------------------ chế độ Postgres thuần
PG_BIN="${PG_BIN:-/usr/lib/postgresql/16/bin}"
[ -x "$PG_BIN/initdb" ] || { echo "Không thấy $PG_BIN/initdb (đặt PG_BIN)" >&2; exit 2; }
command -v psql >/dev/null || { echo "Cần psql trong PATH" >&2; exit 2; }

TMP="$(mktemp -d /tmp/pp-dbtest.XXXXXX)"
PORT="${DB_TEST_PORT:-$(node -e 'const s=require("net").createServer().listen(0,()=>{console.log(s.address().port);s.close()})')}"
SOCK="$TMP/sock"; DATA="$TMP/data"
mkdir -p "$SOCK"; chmod 755 "$TMP"

# Postgres không chạy bằng root: nếu đang là root thì hạ quyền xuống user `postgres`.
AS=()
if [ "$(id -u)" = 0 ]; then
  id postgres >/dev/null 2>&1 || { echo "Đang là root và không có user postgres" >&2; exit 2; }
  chown postgres "$SOCK" "$TMP"
  AS=(runuser -u postgres --)
fi

cleanup() {
  "${AS[@]}" "$PG_BIN/pg_ctl" -D "$DATA" -m immediate stop >/dev/null 2>&1 || true
  rm -rf "$TMP"
}
trap cleanup EXIT

"${AS[@]}" "$PG_BIN/initdb" -D "$DATA" -A trust -U postgres -E UTF8 --no-locale >"$TMP/initdb.log" 2>&1 \
  || { cat "$TMP/initdb.log" >&2; exit 1; }
"${AS[@]}" "$PG_BIN/pg_ctl" -D "$DATA" -w -l "$TMP/pg.log" \
  -o "-p $PORT -k $SOCK -c listen_addresses='' -c wal_level=logical -c fsync=off -c synchronous_commit=off -c full_page_writes=off" start >/dev/null \
  || { cat "$TMP/pg.log" >&2; exit 1; }

url() { echo "postgresql://postgres@/$1?host=$SOCK&port=$PORT"; }
psqlf() { psql -X -q -v ON_ERROR_STOP=1 "$(url "$1")" "${@:2}"; }

# Khuôn: stub -> migrations (theo thứ tự tên) -> seed. Mỗi file một giao dịch, như Supabase CLI.
psqlf postgres -c 'create database tpl'
psqlf tpl -1 -f "$SB/tests/stub/supabase-stub.sql"
for f in "$SB"/migrations/*.sql; do echo "migration: $(basename "$f")"; psqlf tpl -1 -f "$f"; done
for f in "$SB"/seed/*.sql; do echo "seed: $(basename "$f")"; psqlf tpl -1 -f "$f"; done

run_tests() { # $1 = tên CSDL, $2... = tham số thêm cho node
  local db="$1"; shift
  RLS_DB_URL="$(url "$db")" node --test "$@" "${TEST_FILES[@]}"
}

if [ "$PROVE" = 0 ]; then
  psqlf postgres -c 'create database run template tpl'
  run_tests run
  exit $?
fi

# ------------------------------------------------------------------ chứng minh test thất bại đúng
echo; echo "== Đối chứng: không đột biến phải đạt =="
psqlf postgres -c 'create database base template tpl'
run_tests base --test-reporter=tap >"$TMP/base.out" 2>&1 || { cat "$TMP/base.out"; echo "FAIL: bản gốc không đạt"; exit 1; }
echo "đạt"

fail=0
for m in "$SB"/tests/rls/mutations/*.sql; do
  name="$(basename "$m" .sql)"
  if [ -n "$ONLY" ]; then
    pick=0
    for code in $(echo "$ONLY" | tr ',' ' '); do
      case "$name" in "$code"|"$code"-*) pick=1 ;; esac
    done
    [ "$pick" = 1 ] || continue
  fi
  expect="$(sed -n 's/^-- expect: *//p' "$m" | head -1)"
  psqlf postgres -c "create database \"$name\" template tpl"
  psqlf "$name" -f "$m" >/dev/null
  if run_tests "$name" --test-reporter=tap >"$TMP/$name.out" 2>&1; then
    echo "KHÔNG PHÁT HIỆN: $name (test vẫn đạt)"; fail=1; continue
  fi
  ok=1
  for id in $(echo "$expect" | tr ',' ' '); do
    grep -E "^\s*not ok .*${id}" "$TMP/$name.out" >/dev/null || { ok=0; echo "  thiếu thất bại mong đợi: $id"; }
  done
  if [ "$ok" = 1 ]; then echo "phát hiện đúng: $name -> $expect"; else echo "SAI MÃ: $name"; fail=1; fi
done
exit $fail
