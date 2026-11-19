import { handle } from '../_shared/api.ts';
import { palDeps } from '../_shared/supabase.ts';
import { run } from './handler.ts';
Deno.serve(handle(palDeps, run));
