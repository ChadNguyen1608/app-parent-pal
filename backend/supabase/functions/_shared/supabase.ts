// Nối CSDL thật bằng supabase-js, schema `app`, JWT của NGƯỜI DÙNG (lý do: xem api.ts). Chỉ index.ts của từng hàm nhập file này,
// nên test (handler.ts) không cần mạng hay package npm.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { fromDbError, type Deps, type Db } from './api.ts';

export function userDeps(authHeader: string): Deps {
  const env = (k: string) => Deno.env.get(k);
  const db: Db = {
    async rpc(fn, args) {
      const c = createClient(env('SUPABASE_URL')!, env('SUPABASE_ANON_KEY')!, {
        db: { schema: 'app' }, auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: authHeader } },
      });
      const { data, error } = await c.rpc(fn, args);
      if (error) throw fromDbError(error as any);
      return data;
    },
  };
  return { db, env };
}
