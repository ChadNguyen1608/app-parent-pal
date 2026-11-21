// Lớp an toàn của Pal: chạy TRƯỚC AI (CLAUDE.md "Lớp an toàn chạy trước AI"; BL 11.4 BR-NTF-065..068).
// Luật + từ khóa tiếng Việt, có dấu và không dấu. Thuần (không mạng, không CSDL), test bằng deno test.
// Người soạn: AI, chưa kiểm chứng độc lập. DANH SÁCH TỪ KHÓA VÀ CÂU CHỮ CHƯA ĐƯỢC CHUYÊN GIA DUYỆT (cổng B-6, UF-Q38, Q-NTF-07):
// chỉ chạy với dữ liệu giả lập hoặc gia đình thử. Khớp nhầm thì chỉ hiện thông tin hỗ trợ, KHÔNG ghi nhãn rủi ro vào hồ sơ.
//
// Nguyên tắc:
//  - Tình huống khẩn (tự hại, bạo hành/xâm hại trẻ, nguy hiểm tính mạng): KHÔNG gọi AI, chỉ trả mẫu có 115, 111, 113.
//  - Hỏi thuốc/liều: KHÔNG gọi AI, trả lời mẫu "không thay khám bệnh".
//  - Hỏi chẩn đoán: gọi AI nhưng thêm lời nhắc đầu câu trả lời và dặn AI không chẩn đoán.
//  - Đòn roi, phụ huynh đang buồn: chỉ gắn cờ để lời dặn của AI chặt hơn.

export type SafetyFlag =
  | 'EMERGENCY_SELF_HARM' | 'EMERGENCY_CHILD_ABUSE' | 'EMERGENCY_DANGER_LIFE'
  | 'MEDICAL_DIAGNOSIS' | 'MEDICAL_DRUG' | 'CORPORAL_PUNISHMENT' | 'PARENT_DISTRESS' | 'OUTPUT_DOSE';

export interface SafetyResult {
  flags: SafetyFlag[];
  /** true: không gọi AI, dùng `reply`. */
  block: boolean;
  /** Lời mẫu khi block. */
  reply: string | null;
}

/** Bỏ dấu, hạ chữ thường, đ -> d, ký tự không phải chữ/số thành một dấu cách. Độ dài có thể đổi (chỉ dùng để so khớp). */
export function foldVi(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').replace(/[đĐ]/g, 'd').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

const DIACRITIC = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/;
/** Tin có dấu tiếng Việt không? (để phân biệt "từ từ" với "tu tu" gõ không dấu). */
export function hasDiacritics(s: string): boolean {
  return DIACRITIC.test(s.normalize('NFC').toLowerCase());
}

const R = (...parts: string[]) => parts.map((p) => new RegExp(`(?:^| )${p}(?: |$)`));

// ---- khẩn: tự hại. Mẫu viết trên chữ đã bỏ dấu (an toàn cho cả hai cách gõ).
const SELF_HARM = R(
  'tu sat', 'tu hai (?:ban than|minh)', 'tu lam (?:dau|hai) ban than', 'tu lam dau minh',
  'muon chet', 'khong muon song(?: nua)?', 'chan song', 'khong con muon song', 'song khong noi nua',
  'ket thuc (?:cuoc song|cuoc doi|tat ca|ban than)', 'muon bien mat khoi (?:the gioi|cuoc doi)', 'chet di cho roi', 'chet di cho xong',
  'nghi quan', 'cat tay', 'rach tay', 'cat co tay', 'nhay lau', 'nhay cau', 'uong thuoc ngu (?:de|cho) chet',
  'song de lam gi', 'khong ai can toi', 'ca nha se tot hon neu khong co (?:toi|me|ba|bo)',
);
// Chữ có dấu, những cụm mà bỏ dấu sẽ trùng chữ thường gặp ("từ từ", "treo cờ").
const SELF_HARM_ACCENT = [/(?:^|\s)tự (?:tử|sát|hại)(?:\s|$)/u, /(?:^|\s)treo cổ(?:\s|$)/u];
// Gõ không dấu: "tu tu" trùng "từ từ" (chậm rãi), "treo co" trùng "treo cờ": chỉ khớp khi cả tin KHÔNG có dấu và có tín hiệu đi kèm.
const TU_TU = /(?:^| )tu tu(?: |$)/;
const TU_TU_CUE = /(?:^| )(?:muon|doa|dinh|nghi den|co y|chet|song nua|thuoc ngu|nhay|treo|lam hai|that vong|tuyet vong|chan song)(?: |$)/;
const TREO_CO = /(?:^| )treo co(?: |$)/;

// ---- khẩn: bạo hành, xâm hại trẻ em
const CHILD_ABUSE = R(
  'bao hanh tre(?: em)?', 'bao hanh con', 'bi bao hanh', 'xam hai(?: tinh duc)?', 'bi xam hai', 'hiep dam', 'bi hiep', 'cuong dam', 'lam dung tinh duc', 'dam o',
  'bi so (?:vao|mo)', 'bi ep (?:quan he|lam chuyen)', 'ep (?:con|be) lam chuyen nguoi lon',
  'danh dap(?: con| be)?', 'danh (?:con )?(?:gay|chay mau|bam tim|bam dap|nhap vien|bat tinh)', 'bi danh (?:gay|chay mau|bam tim|nhap vien)',
  'bat coc', 'bi bat coc', 'mat tich', 'con bi lac', 'bi lac mat',
);

// ---- khẩn: nguy hiểm tính mạng (sức khỏe, tai nạn)
const DANGER_LIFE = R(
  'kho tho', 'ngung tho', 'tho khong ra', 'tim tai', 'bat tinh', 'ngat xiu', 'co giat', 'li bi',
  'ngo doc', 'uong nham (?:thuoc|hoa chat|xang|nuoc)', 'nuot nham', 'nuot phai (?:pin|hat|dong xu|nam cham|tien xu)', 'an nham (?:thuoc|hoa chat)', 'hoc (?:di vat|hat|xuong|thuc an)', 'bi hoc',
  'duoi nuoc', 'bi duoi', 'dien giat', 'bi dien giat', 'bi bong (?:nang|lan rong)', 'chay mau khong cam', 'mau chay khong ngung', 'tai nan giao thong', 'bi tai nan nang',
  'te (?:tu )?(?:lau|cau thang|cua so) .*(?:non|bat tinh|li bi|chay mau)', 'dap dau .*(?:non|li bi|bat tinh)', 'dau nguc du doi',
);

// ---- thuốc, liều (không gọi AI). Không dùng "liều"/"liệu" trơn: "liệu con có..." rất thường gặp.
const DRUG = [
  /(?:^| )lieu (?:luong|dung|thuoc)(?: |$)/, /(?:^| )bao nhieu lieu(?: |$)/,
  /(?:^| )(?:uong|dung) .{0,30}(?:thuoc|vien)(?: |$)/, /(?:^| )thuoc (?:gi|nao|ha sot|khang sinh|ho|cam|tri|bo|ngu|an than|tieu hoa|chong di ung|nho|boi)(?: |$)/,
  /(?:^| )(?:paracetamol|acetaminophen|ibuprofen|efferalgan|hapacol|panadol|amoxicillin|amoxicilin|augmentin|aspirin|cetirizin|loratadin)(?: |$)/,
  /(?:^| )\d+(?:[.,]\d+)? ?(?:mg|mcg|iu)(?: |$)/, /(?:^| )mg kg(?: |$)/, /(?:^| )khang sinh(?: |$)/,
];

// ---- hỏi chẩn đoán (gọi AI, kèm lời nhắc)
const DIAGNOSIS = [
  /(?:^| )chan doan(?: |$)/, /(?:^| )(?:co phai|co bi|bi|mac) (?:la )?(?:tu ky|adhd|tang dong|tram cam|lo au|roi loan|cham phat trien|down|dong kinh|hen|viem|benh)(?: |$)/,
  /(?:^| )(?:tu ky|adhd|tang dong giam chu y|tram cam|roi loan (?:lo au|phat trien|ngon ngu|hanh vi)|cham phat trien|kho doc|loan doc)(?: |$)/,
  /(?:^| )(?:bi|mac) benh gi(?: |$)/, /(?:^| )la benh gi(?: |$)/,
];

// ---- đòn roi (gắn cờ, AI phản biện nhẹ nhàng nhưng thẳng thắn)
const CORPORAL_ANY = R(
  'danh con', 'danh be', 'danh dit', 'tet dit', 'tat con', 'tat vao mong', 'phat vao mong', 'danh co sao khong', 'co nen danh con',
  'danh de day', 'danh cho chua', 'danh cho nho', 'phat bang danh', 'dap con', 'bat quy', 'bat quy goi',
);
// "ăn roi", "đòn roi", "dùng roi": phải có dấu mới không nhầm "rồi" (ăn rồi, dùng rồi, đón rồi).
const CORPORAL_ACCENT = [/(?:^|\s)ăn roi(?:\s|$)/u, /(?:^|\s)đòn roi(?:\s|$)/u, /(?:^|\s)roi vọt(?:\s|$)/u, /(?:^|\s)dùng roi(?:\s|$)/u, /(?:^|\s)đánh bằng roi(?:\s|$)/u];

// ---- phụ huynh đang buồn, kiệt sức
const DISTRESS = R(
  'buon qua', 'rat buon', 'buon lam', 'khoc nhieu', 'khoc hoai', 'dang khoc', 'kiet suc', 'qua tai', 'met moi qua', 'met moi lam', 'stress', 'ap luc qua',
  'tuyet vong', 'chan nan', 'bat luc', 'khong chiu noi', 'khong biet phai lam sao nua', 'la me te', 'la bo te', 'toi te qua', 'kiet que', 'tram cam', 'cang thang', 'suy sup', 'muon bo cuoc',
);

const anyMatch = (res: RegExp[], t: string) => res.some((r) => r.test(t));

/** Chạy lớp an toàn trên tin của phụ huynh. `callTitle`: từ xưng hô (anh, chị...) cho lời mẫu. */
export function checkSafety(message: string, callTitle = 'bạn'): SafetyResult {
  const nfc = message.normalize('NFC').toLowerCase();
  const t = foldVi(message);
  const accented = hasDiacritics(message);
  const flags: SafetyFlag[] = [];

  const selfHarm = anyMatch(SELF_HARM, t) || anyMatch(SELF_HARM_ACCENT, nfc)
    || (!accented && ((TU_TU.test(t) && TU_TU_CUE.test(t)) || TREO_CO.test(t)));
  if (selfHarm) flags.push('EMERGENCY_SELF_HARM');
  if (anyMatch(CHILD_ABUSE, t)) flags.push('EMERGENCY_CHILD_ABUSE');
  if (anyMatch(DANGER_LIFE, t)) flags.push('EMERGENCY_DANGER_LIFE');
  if (anyMatch(DRUG, t.replace(/(?:^| )thuoc la(?: |$)/g, ' '))) flags.push('MEDICAL_DRUG');   // "thuốc lá" không phải thuốc chữa bệnh
  if (anyMatch(DIAGNOSIS, t)) flags.push('MEDICAL_DIAGNOSIS');
  if (anyMatch(CORPORAL_ANY, t) || anyMatch(CORPORAL_ACCENT, nfc)) flags.push('CORPORAL_PUNISHMENT');
  if (anyMatch(DISTRESS, t)) flags.push('PARENT_DISTRESS');

  const reply = replyFor(flags, callTitle);
  return { flags, block: reply !== null, reply };
}

const NUMBERS =
  '- 115: cấp cứu y tế.\n- 111: Tổng đài quốc gia bảo vệ trẻ em.\n- 113: công an, khi có nguy hiểm về an ninh.';

/** Lời mẫu (chờ chuyên gia duyệt). Chỉ thông tin hỗ trợ: không chẩn đoán, không hướng dẫn xử trí, không liều thuốc, không gợi ý trả phí. */
function replyFor(flags: SafetyFlag[], title: string): string | null {
  const you = title || 'bạn';
  if (flags.includes('EMERGENCY_SELF_HARM')) {
    return `Mình rất lo cho ${you} và mong ${you} được an toàn ngay lúc này. Mình chỉ là ứng dụng đồng hành, chưa thể thay một người thật ở bên cạnh.\n\n` +
      `Nếu có nguy hiểm đến tính mạng ngay bây giờ, ${you} gọi:\n${NUMBERS}\n\n` +
      `${you} hãy nhờ một người lớn ${you} tin cậy ở cùng ${you} lúc này. Ứng dụng không tự gọi giúp: ${you} bấm số để gọi.`;
  }
  if (flags.includes('EMERGENCY_CHILD_ABUSE')) {
    return `Mình rất tiếc khi nghe điều này. Sự an toàn của con đặt lên trước hết.\n\n` +
      `Các số này có người trực, ${you} có thể gọi:\n${NUMBERS}\n\n` +
      `Mình không xác minh hay xử lý được vụ việc qua tin nhắn. ${you} cố giữ con ở nơi an toàn, gần người lớn đáng tin. Ứng dụng không tự gọi giúp: ${you} bấm số để gọi.`;
  }
  if (flags.includes('EMERGENCY_DANGER_LIFE')) {
    return `Đây có thể là tình huống khẩn cấp. ${you} gọi ngay:\n${NUMBERS}\n\n` +
      `Mình không chẩn đoán và không hướng dẫn xử trí qua tin nhắn được. Ứng dụng không tự gọi giúp: ${you} bấm số để gọi.`;
  }
  if (flags.includes('MEDICAL_DRUG')) {
    return `Mình không tư vấn thuốc hay liều thuốc, vì sai liều có thể nguy hiểm cho con. ${you} hỏi bác sĩ hoặc dược sĩ, hoặc đọc hướng dẫn trên bao bì và tờ hướng dẫn của thuốc.\n\n` +
      `Nếu con đang có dấu hiệu nặng, ${you} gọi 115 (cấp cứu). Mình vẫn ở đây nếu ${you} muốn bàn việc khác.`;
  }
  return null;
}

/** Lời nhắc đặt đầu câu trả lời khi phụ huynh hỏi chẩn đoán. */
export const DIAGNOSIS_REMINDER =
  'Lưu ý: mình là bạn đồng hành, không chẩn đoán và không thay thế khám bệnh. Nếu lo về sức khỏe hay sự phát triển của con, nên đưa con đến bác sĩ nhi hoặc cơ sở y tế.';

/** Kiểm đầu ra (OD-05a, bản nhẹ): chữ nêu liều thuốc thì thay bằng lời mẫu. */
const DOSE_OUT = /\d+(?:[.,]\d+)?\s?(?:mg|mcg|ml|iu|viên|giọt)(?![\p{L}\d])|mg\s*\/\s*kg/iu;
export function checkOutput(reply: string, callTitle = 'bạn'): { ok: boolean; reply: string; flags: SafetyFlag[] } {
  if (DOSE_OUT.test(reply)) {
    return { ok: false, flags: ['OUTPUT_DOSE'],
      reply: `Mình không nêu liều thuốc. ${callTitle || 'bạn'} hỏi bác sĩ hoặc dược sĩ về thuốc và liều cho con nhé; mình vẫn ở đây nếu ${callTitle || 'bạn'} muốn bàn việc khác.` };
  }
  return { ok: true, reply, flags: [] };
}
