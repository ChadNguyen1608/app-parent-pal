import { handle } from '../_shared/api.ts';
import { userDeps } from '../_shared/supabase.ts';
import { run } from './handler.ts';
Deno.serve(handle(userDeps, run));
