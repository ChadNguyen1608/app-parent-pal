// SINH TỰ ĐỘNG bởi scripts/sync-pal-knowledge.mjs từ documents/knowledge/by-age. KHÔNG SỬA TAY: sửa tài liệu rồi chạy lại script.
// NHÁP, người soạn: AI, CHƯA DUYỆT. Chỉ là tóm tắt "Ở tuổi này con cần gì" theo chặng tuổi; chưa phải kho đầy đủ.
export const PAL_KNOWLEDGE_LABEL = 'nháp, người soạn AI, chưa duyệt';
export interface KnowledgeBand { file: string; label: string; minAge: number; maxAge: number; text: string }
export const PAL_KNOWLEDGE: KnowledgeBand[] = [
  {
    "file": "documents/knowledge/by-age/age-00-06-early-childhood/content-01-so-sinh-0-1-thang.md",
    "label": "0–1 tháng",
    "minAge": 0,
    "maxAge": 0,
    "text": "| Nhóm | Con cần |\n|---|---|\n| Nền | Ngủ an toàn, không bị lắc, không khói thuốc; người lớn biết dấu hiệu nguy hiểm |\n| 1 Sức khỏe | Bú mẹ sớm và theo nhu cầu; giữ ấm; chăm rốn đúng cách; tiêm viêm gan B và lao |\n| 2 Nhận thức | Được nhìn, nghe, cử động tự do; được nói chuyện |\n| 4 Quan hệ | Được ôm ấp, da kề da, được đáp lại |\n| 7 Gia đình | Cha mẹ được hỗ trợ, nhất là sức khỏe tinh thần của mẹ |\n| 11 Màn hình | Không xem màn hình |"
  },
  {
    "file": "documents/knowledge/by-age/age-00-06-early-childhood/content-02-nhu-nhi-1-12-thang.md",
    "label": "1–12 tháng",
    "minAge": 0,
    "maxAge": 0,
    "text": "| Nhóm | Con cần |\n|---|---|\n| Nền | Ngủ an toàn đến 1 tuổi; tránh hóc, ngộ độc, đuối nước khi con bắt đầu lật, bò, cầm nắm |\n| 1 Sức khỏe | Bú mẹ hoàn toàn đến 6 tháng; ăn bổ sung từ 6 tháng; ngủ 12–16 giờ (từ 4 tháng); tiêm chủng theo lịch; khám răng trước 1 tuổi |\n| 2 Nhận thức | Được trò chuyện, gọi tên đồ vật, chơi trốn tìm, ú òa |\n| 3 Cảm xúc | Được an ủi khi sợ người lạ, khi xa cha mẹ |\n| 4 Quan hệ | Gắn bó với người chăm sóc qua tương tác \"giao và đáp\" |\n| 7 Gia đình | Người chăm ổn định, nhất là khi cha mẹ đi làm lại |\n| 11 Màn hình | Không xem màn hình (trừ gọi video) |\n| 12 Chơi | Đồ gia dụng sạch, an toàn để cầm, đập, thả |"
  },
  {
    "file": "documents/knowledge/by-age/age-00-06-early-childhood/content-03-tap-di-12-18-thang.md",
    "label": "12–18 tháng",
    "minAge": 1,
    "maxAge": 1,
    "text": "| Nhóm | Con cần |\n|---|---|\n| Nền | Nhà được \"chống trẻ\": cầu thang, ổ điện, bếp, thuốc, hóa chất, nước |\n| 1 Sức khỏe | Ngủ 11–14 giờ; vận động ít nhất 180 phút mỗi ngày; tiếp tục bú mẹ; tiêm viêm não Nhật Bản lúc 1 tuổi |\n| 2 Nhận thức | Được đọc sách mỗi ngày, được nói chuyện và nối dài từ con nói |\n| 3 Cảm xúc | Được an ủi khi lo âu xa cha mẹ, lúc này đang ở đỉnh |\n| 5 Tự chủ | Được tập tự xúc ăn, tự mặc đồ |\n| 7 Gia đình | Được khen hành vi tốt nhiều hơn bị phạt hành vi chưa tốt |\n| 11 Màn hình | Không xem màn hình (trừ gọi video) |\n| 12 Chơi | Đồ để xếp chồng, bỏ vào và lấy ra khỏi hộp |"
  },
  {
    "file": "documents/knowledge/by-age/age-00-06-early-childhood/content-04-tap-di-18-24-thang.md",
    "label": "18–24 tháng",
    "minAge": 1,
    "maxAge": 1,
    "text": "| Nhóm | Con cần |\n|---|---|\n| Nền | Nhà được \"chống trẻ\", vì con đi vững, leo trèo, với tới nhiều chỗ hơn |\n| 1 Sức khỏe | Ngủ 11–14 giờ; vận động ít nhất 180 phút; tiêm nhắc lúc 18 tháng; sàng lọc phát triển và tự kỷ lúc 18 tháng |\n| 2 Nhận thức | Đọc sách, nói chuyện, trò ghép và phân loại |\n| 3 Cảm xúc | Được hỗ trợ khi lo âu xa cha mẹ bắt đầu giảm dần |\n| 5 Tự chủ | Tập tự ăn bằng thìa, tự mặc đồ; có thể bắt đầu có dấu hiệu sẵn sàng đi vệ sinh |\n| 11 Màn hình | Nếu cho xem: nội dung chất lượng, có người lớn xem cùng |\n| 12 Chơi | Bắt đầu chơi tưởng tượng đơn giản |"
  },
  {
    "file": "documents/knowledge/by-age/age-00-06-early-childhood/content-05-nha-tre-2-3-tuoi.md",
    "label": "2–3 tuổi",
    "minAge": 2,
    "maxAge": 2,
    "text": "| Nhóm | Con cần |\n|---|---|\n| Nền | Người lớn để mắt liên tục; ngồi khi ăn; không ngồi trong lòng người đang cầm đồ uống nóng |\n| 1 Sức khỏe | Ngủ 11–14 giờ; vận động ít nhất 180 phút; uống nước lọc hoặc sữa thay nước ngọt; sàng lọc 24 và 30 tháng |\n| 2 Nhận thức | Đọc sách, hát, đếm, gọi tên và so sánh đồ vật |\n| 3 Cảm xúc | Được dạy cách bày tỏ khi bực bội; người lớn bình tĩnh khi con ăn vạ |\n| 5 Tự chủ | Tập đi vệ sinh khi con sẵn sàng; tự cởi đồ; làm theo nếp sinh hoạt |\n| 7 Gia đình | Được khen khi làm theo hướng dẫn, ít bị chú ý khi chống đối |\n| 11 Màn hình | Tối đa 1 giờ mỗi ngày, ít hơn thì tốt hơn |\n| 12 Chơi | Chơi giả vờ, chơi cạnh và chơi cùng trẻ khác |"
  },
  {
    "file": "documents/knowledge/by-age/age-00-06-early-childhood/content-06-mau-giao-3-4-tuoi.md",
    "label": "3–4 tuổi",
    "minAge": 3,
    "maxAge": 3,
    "text": "| Nhóm | Con cần |\n|---|---|\n| Nền | Hiểu vì sao phải tránh xa đường xe; được giám sát liên tục khi ở ngoài và gần nước; biết tên đúng các bộ phận cơ thể và biết kể với người lớn tin cậy |\n| 1 Sức khỏe | Ngủ 10–13 giờ; vận động ít nhất 180 phút, trong đó ít nhất 60 phút vận động mạnh vừa trở lên |\n| 2 Nhận thức | Được nói chuyện bằng câu hoàn chỉnh, được đọc sách, được hỏi \"ai, cái gì, tại sao\" |\n| 3 Cảm xúc | Được giúp từng bước giải quyết vấn đề khi bực bội |\n| 4 Quan hệ | Có cơ hội chơi cùng trẻ khác |\n| 5, 14 Tự chủ, kỹ năng sống | Được chọn trong vài lựa chọn đơn giản; được làm việc nhà nhỏ |\n| 7 Gia đình | Kỷ luật rõ ràng, nhất quán; sau chữ \"không\" là việc con nên làm |\n| 17 Bước chuyển | Được chuẩn bị khi vào mẫu giáo |"
  },
  {
    "file": "documents/knowledge/by-age/age-00-06-early-childhood/content-07-mau-giao-4-5-tuoi.md",
    "label": "4–5 tuổi",
    "minAge": 4,
    "maxAge": 4,
    "text": "| Nhóm | Con cần |\n|---|---|\n| Nền | An toàn ngoài đường, gần nước, với người lạ; biết kể với người lớn tin cậy khi bị chạm vào vùng riêng tư |\n| 1 Sức khỏe | Ngủ 10–13 giờ; vận động ít nhất 180 phút, trong đó ít nhất 60 phút vận động mạnh vừa trở lên |\n| 2 Nhận thức | Được kể chuyện, trò chuyện bằng câu hoàn chỉnh, chơi trò chơi cần ghi nhớ và đổi luật |\n| 3 Cảm xúc | Được giúp giải quyết vấn đề khi bực bội |\n| 4 Quan hệ | Có bạn để chơi; được làm \"người giúp việc\" |\n| 5, 14 Tự chủ, kỹ năng sống | Tự xới đồ ăn, rót nước có người lớn trông; làm việc nhà nhỏ |\n| 12 Chơi | Chơi đóng vai; trò chơi có luật |"
  },
  {
    "file": "documents/knowledge/by-age/age-00-06-early-childhood/content-08-mau-giao-5-6-tuoi.md",
    "label": "5–6 tuổi",
    "minAge": 5,
    "maxAge": 5,
    "text": "| Nhóm | Con cần |\n|---|---|\n| Nền | Đội mũ bảo hiểm khi ngồi xe máy; ngồi đúng chỗ, đúng thiết bị trên ô tô; biết an toàn với người lạ và với nước |\n| 1 Sức khỏe | Ngủ 10–13 giờ (đến 6 tuổi); trung bình ít nhất 60 phút vận động vừa đến mạnh mỗi ngày |\n| 2 Nhận thức | Được kể chuyện, hỏi về truyện, chơi vần, đếm |\n| 4 Quan hệ | Chơi theo luật, chờ đến lượt với bạn |\n| 14 Kỹ năng sống | Làm việc nhà đơn giản: xếp tất, dọn bàn |\n| 17 Bước chuyển | Chuẩn bị vào lớp 1 (6 tuổi tính theo năm) |"
  },
  {
    "file": "documents/knowledge/by-age/age-06-11-primary-school/content-01-tieu-hoc-dau-6-8-tuoi.md",
    "label": "6–8 tuổi",
    "minAge": 6,
    "maxAge": 8,
    "text": "| Nhóm | Con cần |\n|---|---|\n| Nền | Đội mũ bảo hiểm; ngồi ghế sau, đúng thiết bị trên ô tô |\n| 1 Sức khỏe | Ít nhất 1 giờ vận động mỗi ngày; tiêm nhắc lúc 7 tuổi |\n| 5 Tự chủ | Rèn kỹ năng điều hành qua trò chơi bài, cờ, vận động, bắt chước |\n| 14 Kỹ năng sống | Được giao việc nhà vừa sức |\n| 17 Bước chuyển | Vào lớp 1 |"
  },
  {
    "file": "documents/knowledge/by-age/age-06-11-primary-school/content-02-tieu-hoc-cuoi-9-11-tuoi.md",
    "label": "9–11 tuổi",
    "minAge": 9,
    "maxAge": 10,
    "text": "| Nhóm | Con cần |\n|---|---|\n| Nền | Ngồi ghế sau ô tô đến 12 tuổi; đội mũ khi đạp xe, chơi thể thao |\n| 1 Sức khỏe | Được chuẩn bị cho dậy thì; để ý nỗi lo về hình ảnh cơ thể |\n| 2, 6 Học tập | Đọc mỗi ngày; cha mẹ hỏi chuyện bài vở |\n| 4 Quan hệ | Tình bạn gắn bó hơn; được giúp đối phó với áp lực bạn bè |\n| 5, 12 Tự chủ, chơi | Cờ, trò chơi bài, thể thao phối hợp, nhạc cụ, câu đố |\n| 7 Gia đình | Kỷ luật hướng dẫn, không trừng phạt |\n| 11 Môi trường số | Chưa có tài khoản mạng xã hội |\n| 14 Kỹ năng sống | Việc nhà; tập quản lý tiền |\n| 17 Bước chuyển | Dậy thì; lên lớp 6 |"
  },
  {
    "file": "documents/knowledge/by-age/age-11-15-lower-secondary/content-01-thcs-dau-11-13-tuoi.md",
    "label": "11–13 tuổi",
    "minAge": 11,
    "maxAge": 12,
    "text": "| Nhóm | Con cần |\n|---|---|\n| Nền | Đội mũ bảo hiểm khi ngồi sau xe máy, khi đạp xe; được dặn trước cách xử lý khi bị dụ dỗ trên mạng |\n| 1 Sức khỏe | Được nói chuyện về dậy thì, kinh nguyệt **trước khi** chúng đến; ngủ 9–12 giờ (đến 12 tuổi) |\n| 3 Cảm xúc | Được để ý khi khác đi; ý nghĩ tự tử, tự hại thì tìm trợ giúp ngay |\n| 6, 8 Học tập, trường | Làm quen trường mới, nhiều môn hơn |\n| 11 Môi trường số | Chưa tạo tài khoản mạng xã hội trước 13 tuổi; dưới 16 tuổi thì cha mẹ đăng ký theo luật |\n| 14 Kỹ năng sống | Việc nhà như dọn bếp, giặt gấp quần áo, nấu món đơn giản có người lớn trông |\n| 17 Bước chuyển | Vào lớp 6; bắt đầu dậy thì |"
  },
  {
    "file": "documents/knowledge/by-age/age-11-15-lower-secondary/content-02-thcs-cuoi-13-15-tuoi.md",
    "label": "13–15 tuổi",
    "minAge": 13,
    "maxAge": 14,
    "text": "| Nhóm | Con cần |\n|---|---|\n| Nền | Chưa lái xe gắn máy trước 16 tuổi; không rượu, bia, thuốc lá, thuốc lá điện tử; biết rằng bị tống tiền trên mạng không phải lỗi của con |\n| 1 Sức khỏe | Ngủ 8–10 giờ; được để ý dấu hiệu dậy thì muộn, rối loạn ăn uống |\n| 3 Cảm xúc | Được giảm áp lực thi cử; ý nghĩ tự tử, tự hại thì tìm trợ giúp ngay |\n| 4 Quan hệ | Bạn bè ảnh hưởng mạnh; cha mẹ biết bạn của con mà không cấm đoán |\n| 15 Hướng nghiệp | Được nói chuyện về nghề con nghĩ tới; biết các lựa chọn sau lớp 9 |\n| 17 Bước chuyển | Thi vào lớp 10 hoặc học trung học nghề; hoàn thành THCS |"
  },
  {
    "file": "documents/knowledge/by-age/age-15-18-upper-secondary/content-01-thpt-dau-15-17-tuoi.md",
    "label": "15–17 tuổi",
    "minAge": 15,
    "maxAge": 16,
    "text": "| Nhóm | Con cần |\n|---|---|\n| Nền | Đi xe gắn máy đúng luật từ 16 tuổi, đội mũ bảo hiểm, không rượu bia; chưa lái xe mô tô từ 50 cm3 |\n| 1 Sức khỏe | Ngủ 8–10 giờ; khám trước khi chơi thể thao thi đấu |\n| 3 Cảm xúc | Được để ý dấu hiệu trầm cảm, lo âu khi áp lực học tăng |\n| 7 Gia đình | Được tự quyết nhiều dần; được tôn trọng riêng tư |\n| 14 Kỹ năng sống | Biết quy định khi đi làm thêm, mở tài khoản |\n| 17 Bước chuyển | Vào lớp 10; chọn 4 môn lựa chọn; giữ ổn định đến hết lớp 12 |"
  },
  {
    "file": "documents/knowledge/by-age/age-15-18-upper-secondary/content-02-thpt-cuoi-17-18-tuoi.md",
    "label": "17–18 tuổi",
    "minAge": 17,
    "maxAge": 18,
    "text": "| Nhóm | Con cần |\n|---|---|\n| Nền | Lái xe đúng hạng bằng khi đủ 18; không rượu bia khi lái |\n| 3 Cảm xúc | Được giảm áp lực thi cử; ý nghĩ tự tử, tự hại thì tìm trợ giúp ngay |\n| 6 Học tập | Ngủ đủ trong mùa thi; học bài vừa phải |\n| 15 Hướng nghiệp | Được biết đủ các lựa chọn sau lớp 12 và chi phí |\n| 16 Công dân | Nam đăng ký nghĩa vụ quân sự từ 17; bầu cử từ 18 |\n| 17 Bước chuyển | Thi tốt nghiệp; chọn trường, chọn nghề; tròn 18 tuổi |"
  }
];
