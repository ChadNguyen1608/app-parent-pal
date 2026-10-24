// Kiến thức tối thiểu cho AI giả lập: các chủ đề phụ huynh hay kể.
// Bản thật thay bằng bộ kiến thức chuyên gia duyệt + mô hình ngôn ngữ.
// Nội dung lời khuyên ở đây là ví dụ chung, chưa qua chuyên gia duyệt.

export interface Topic {
  id: string;
  /** Cụm từ nhận diện (so khớp sau khi bỏ dấu). */
  keys: string[];
  /** Cách ghi vào sổ tay, nối sau tên con: "Na" + " hay cáu kỉnh". */
  phrase: string;
  /** Số ngày sau thì hỏi lại; 0 = không cần theo dõi. */
  followupDays: number;
  /** Câu đồng cảm mở đầu. */
  empathy: string[];
  /** Một câu hỏi để hiểu thêm. */
  question: string;
  /** Một gợi ý nhỏ, chỉ đưa ra khi phụ huynh đã kể đủ (lượt thứ hai trở đi về cùng chủ đề). */
  tip: string;
  /** Chuyện vui: không theo dõi, chỉ ghi lại và chúc mừng. */
  positive?: boolean;
}

export const TOPICS: Topic[] = [
  {
    id: 'school_reluctance',
    keys: ['sợ đi học', 'không muốn đi học', 'không chịu đi học', 'khóc khi đi học', 'khóc không đi học', 'ngại đi học', 'đòi nghỉ học'],
    phrase: 'không muốn đi học',
    followupDays: 3,
    empathy: ['Sáng nào cũng vật lộn chuyện đi học thì mệt thật.', 'Thấy con không muốn đến lớp, bố mẹ nào cũng lo.'],
    question: 'Ở lớp dạo này có gì thay đổi không, như cô mới, bạn mới hay đổi chỗ ngồi?',
    tip: 'Tối nay {short} thử hỏi bé một câu thật cụ thể, như "Ở lớp con thích ngồi cạnh ai nhất?", thay vì "Sao con không muốn đi học?". Câu hỏi cụ thể dễ trả lời hơn câu hỏi "tại sao".',
  },
  {
    id: 'irritable',
    keys: ['cáu', 'cau có', 'gắt', 'gắt gỏng', 'nổi nóng', 'ăn vạ', 'khó chịu', 'hờn dỗi', 'dỗi', 'bực bội', 'la hét'],
    phrase: 'hay cáu kỉnh',
    followupDays: 5,
    empathy: ['Nghe {short} kể là thấy {short} mệt rồi.', 'Con cáu mà mình không biết vì sao thì khó xử lắm.'],
    question: 'Bé hay cáu vào lúc nào trong ngày, ví dụ lúc đói, lúc mệt hay sau giờ học?',
    tip: 'Lúc bé đang cáu, {short} thử gọi tên cảm xúc giúp bé trước, như "Con đang bực lắm phải không?", rồi mới hỏi lý do. Trẻ thường dịu lại khi thấy mình được hiểu.',
  },
  {
    id: 'withdrawn',
    keys: ['không nói', 'im lặng', 'không kể', 'ít nói', 'hỏi gì cũng không', 'không chịu nói', 'lầm lì', 'thu mình'],
    phrase: 'ít chia sẻ hơn',
    followupDays: 5,
    empathy: ['Con bỗng ít nói, bố mẹ dễ thấy hụt hẫng.', 'Mình hiểu cảm giác hỏi mà con không trả lời.'],
    question: 'Bé ít nói với cả nhà hay chỉ khi được hỏi về trường lớp?',
    tip: 'Thay vì "Hôm nay học thế nào?", {short} thử hỏi "Hôm nay ai làm con cười nhất?". Câu hỏi nhỏ, vui thường mở được câu chuyện dài hơn.',
  },
  {
    id: 'sleep',
    keys: ['khó ngủ', 'mất ngủ', 'ngủ muộn', 'thức khuya', 'giật mình', 'ác mộng', 'không chịu ngủ', 'quấy đêm'],
    phrase: 'gặp khó khăn với giấc ngủ',
    followupDays: 4,
    empathy: ['Con ngủ không ngon thì cả nhà cũng mệt theo.', 'Những đêm thiếu ngủ làm mình kiệt sức lắm.'],
    question: 'Bé thường đi ngủ lúc mấy giờ, và trước khi ngủ hay làm gì?',
    tip: 'Một thói quen trước giờ ngủ lặp lại mỗi tối, như tắt màn hình, đọc một mẩu truyện, tắt đèn đúng giờ, thường giúp trẻ dễ vào giấc hơn.',
  },
  {
    id: 'eating',
    keys: ['biếng ăn', 'không chịu ăn', 'lười ăn', 'kén ăn', 'ăn ít', 'ngậm cơm', 'bỏ bữa'],
    phrase: 'ăn uống thất thường',
    followupDays: 5,
    empathy: ['Bữa cơm mà thành cuộc chiến thì mệt thật.', 'Chuyện con ăn ít làm bố mẹ nào cũng sốt ruột.'],
    question: 'Bé ăn ít ở mọi bữa hay chỉ một vài bữa trong ngày?',
    tip: 'Giữ bữa ăn trong khoảng 30 phút và không ép thêm thường nhẹ nhàng hơn cho cả hai bên. Nếu bé sụt cân, {short} nên hỏi bác sĩ nhi.',
  },
  {
    id: 'screens',
    keys: ['điện thoại', 'ipad', 'máy tính bảng', 'chơi game', 'youtube', 'tiktok', 'xem tivi', 'xem tv', 'nghiện game'],
    phrase: 'dùng thiết bị nhiều',
    followupDays: 7,
    empathy: ['Chuyện màn hình là nỗi lo của rất nhiều nhà.', 'Giằng co chuyện điện thoại với con dễ thành cãi nhau lắm.'],
    question: 'Hiện nhà mình có quy định giờ dùng điện thoại cho bé chưa?',
    tip: 'Thay vì cấm hẳn, {short} thử cùng bé thống nhất một khung giờ và viết ra giấy. Trẻ giữ lời tốt hơn khi được cùng đặt luật.',
  },
  {
    id: 'study',
    keys: ['điểm kém', 'học kém', 'lười học', 'bài tập', 'kiểm tra', 'thi cử', 'học thêm', 'không chịu học', 'áp lực học'],
    phrase: 'gặp áp lực học tập',
    followupDays: 7,
    empathy: ['Chuyện học của con lúc nào cũng làm bố mẹ đau đầu.', 'Mình hiểu, điểm số làm cả nhà căng thẳng.'],
    question: 'Bé gặp khó ở một môn cụ thể hay thấy chán học nói chung?',
    tip: 'Khen nỗ lực cụ thể, như "Con làm hết bài khó này rồi", thường giúp trẻ bền bỉ hơn khen "Con thông minh".',
  },
  {
    id: 'peers',
    keys: ['bị bạn trêu', 'bị trêu', 'bắt nạt', 'không có bạn', 'cãi nhau với bạn', 'bị bạn đánh', 'bị cô lập', 'bị tẩy chay', 'giận bạn'],
    phrase: 'có chuyện với bạn bè',
    followupDays: 2,
    empathy: ['Nghe con bị bạn đối xử như vậy, chắc {short} xót lắm.', 'Chuyện bạn bè ở lớp ảnh hưởng tới con nhiều hơn mình nghĩ.'],
    question: 'Bé tự kể với {short} hay {short} biết qua người khác?',
    tip: 'Nếu chuyện lặp lại, {short} nên báo cô chủ nhiệm sớm. Trước đó, cho bé biết bé kể ra là đúng và bố mẹ luôn đứng về phía bé.',
  },
  {
    id: 'sick',
    keys: ['bị ốm', 'ốm rồi', 'sốt', 'bị ho', 'ho nhiều', 'sổ mũi', 'đau bụng', 'viêm họng', 'nôn', 'tiêu chảy', 'cảm cúm', 'mệt trong người'],
    phrase: 'bị ốm',
    followupDays: 2,
    empathy: ['Con ốm là bố mẹ mất ngủ theo.', 'Mong bé mau khỏe.'],
    question: 'Bé đã đi khám chưa, hay nhà mình đang theo dõi ở nhà?',
    tip: 'Nếu bé sốt cao, sốt kéo dài, li bì hoặc bỏ ăn uống, {short} đưa bé đi khám ngay nhé. Mình không thay được bác sĩ.',
  },
  {
    id: 'good_news',
    keys: ['được khen', 'điểm 10', 'điểm mười', 'được giải', 'tự làm', 'ngoan lắm', 'giỏi quá', 'tiến bộ', 'vui lắm', 'tự hào'],
    phrase: 'có chuyện vui',
    followupDays: 0,
    positive: true,
    empathy: ['Tuyệt quá!', 'Nghe mà mình cũng vui lây.'],
    question: 'Bé phản ứng thế nào khi được khen?',
    tip: 'Kể lại chuyện vui này với cả nhà vào bữa tối, bé sẽ nhớ lâu hơn một món quà.',
  },
];

/** Cảm xúc của chính phụ huynh: ghi vào vùng riêng, không chia sẻ cho người lớn khác. */
export const PARENT_FEELINGS = {
  keys: ['mệt mỏi', 'kiệt sức', 'áp lực', 'stress', 'căng thẳng', 'bất lực', 'có lỗi', 'tội con', 'chán nản', 'quát con', 'mắng con', 'không còn sức', 'mệt quá', 'buồn quá', 'hơi mệt', 'đang mệt', 'mệt lắm', 'stress quá', 'muốn khóc'],
  phrase: 'đang thấy mệt và áp lực',
};

/** Phụ huynh báo chuyện đã ổn: dùng để khép lại việc đang theo dõi. */
export const RESOLVED_KEYS = ['đỡ rồi', 'đỡ hơn', 'ổn rồi', 'hết rồi', 'khỏe rồi', 'khỏi rồi', 'bình thường rồi', 'vui vẻ rồi', 'không sao rồi', 'tốt hơn'];
export const UNCHANGED_KEYS = ['vẫn vậy', 'vẫn thế', 'chưa đỡ', 'không đỡ', 'vẫn còn', 'tệ hơn', 'nặng hơn'];
export const UNSURE_KEYS = ['chưa để ý', 'không rõ', 'chưa biết', 'không biết'];

export const LIKE_VERBS: Record<string, string> = {
  thích: 'thích',
  mê: 'mê',
  ghét: 'không thích',
  'không thích': 'không thích',
  sợ: 'sợ',
  'dị ứng': 'dị ứng',
  'dị ứng với': 'dị ứng',
};
