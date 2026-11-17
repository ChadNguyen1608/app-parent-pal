// Đầu ra THAM CHIẾU của bộ xếp chạy bằng Node (nguồn packages/scheduler), in JSON để test Deno so sánh từng byte.
// Chạy: node --experimental-strip-types node-ref.ts  (Deno test tự gọi bằng --allow-run=node)
import { scheduleWeek, validatePhase, PROFILES } from '../../../../packages/scheduler/src/index.ts';

const out: Record<string, unknown> = {};
for (const prof of PROFILES as any[]) {
  let phase = null;
  if (prof.phase) phase = validatePhase(prof.phase, prof.phaseHistory || []).status === 'OK' ? prof.phase : null;
  out[prof.id] = scheduleWeek({ ...prof, phase });
}
process.stdout.write(JSON.stringify(out));
