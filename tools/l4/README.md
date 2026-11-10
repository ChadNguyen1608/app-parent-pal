# Rà soát thiết kế L4 Parent-Pal

Chọn một L3 để tạo hồ sơ ứng viên, test thiết kế có kết quả mong đợi, phản biện, ma trận hồi quy và câu hỏi cho Product Owner. Hồ sơ ghi riêng kiểm tra bằng mã, lượt gọi model và test ứng dụng. L4 ứng viên dùng ID `CAND-<L3>-<slug>`.

## Chạy từ GitHub

1. Khi workflow đã có trên nhánh mặc định, vào **Actions → Rà soát thiết kế L4 → Run workflow** và chọn `main`.
2. Nhập mã L3, ví dụ `F01-G04-M01`. Chọn `mock` để thử miễn phí với ba module pilot, hoặc `openai` để phân tích một L3 bất kỳ có trong Blueprint 3.2. Chế độ `openai` cần Repository Secret `OPENAI_API_KEY` và sẽ phát sinh chi phí khi được kích hoạt.
3. Tải `l4-history-…` trong phần **Artifacts**. Mở `report.md` để rà soát, `summary.json` để đọc trạng thái và thư mục L3 để truy vết từng lượt.
4. Bật `publish_draft` để một job riêng tạo Draft PR chứa báo cáo khi lượt OpenAI tạo được hồ sơ. Repository/organization phải cho phép GitHub Actions tạo pull request. Khi tắt tùy chọn này hoặc quyền bị thiếu, báo cáo vẫn nằm trong artifact. Lượt mô phỏng và lượt dừng chỉ lưu artifact.

CI của Draft PR triển khai tự chạy offline bằng fixture. Job review chỉ có quyền đọc và không lưu thông tin xác thực của checkout. Job xuất bản chỉ commit một đường dẫn `tools/l4/reviews/<L3>/<run>.md` lên nhánh `l4-review/…`. Các agent không có công cụ GitHub, shell, quyền ghi tệp hoặc chức năng merge. Dữ liệu đầu vào chỉ lấy từ tài liệu thiết kế đã đưa vào danh sách nguồn. Dùng dữ liệu tổng hợp cho mọi test.

## Chạy trên máy

Cần Python 3.12 và Git. Từ thư mục gốc repository, lấy đúng snapshot PR #17 để đọc tham chiếu.

```bash
python -m pip install -r tools/l4/requirements.txt
git fetch origin refs/pull/17/head
git worktree add --detach ../parent-pal-pilot 1ef64c4ed7ee6d58064eee64f8989c7e2dda1f6d
cd tools/l4
python -m l4_system --mode mock --repo ../.. --pilot-root ../../../parent-pal-pilot \
  --module F01-G04-M01 F06-G07-M01 F04-G02-M03
```

Khi đã có khóa và được duyệt chi phí, đặt `OPENAI_API_KEY` qua biến môi trường hoặc trình quản lý bí mật của máy, rồi chọn `--mode openai`. Để chạy test tích hợp, đặt `L4_CANONICAL_ROOT` và `L4_PILOT_ROOT` lần lượt tới gốc checkout chuẩn và checkout pilot, rồi chạy `python -m unittest discover -s tests -v`. Có thể dùng `--out` để chọn thư mục lịch sử và `--config` để dùng bản cấu hình riêng.

## Nguồn và vai trò

- `sources.json` ghi danh sách nguồn đọc và snapshot pilot. Blueprint 3.2-R1 xác định ID L3. 3.3 xác định loại phụ thuộc và cổng bằng chứng. 3.4 xác định luồng và quyền sở hữu. Quyết định Owner có phạm vi, trạng thái và số dòng gốc. Backlog ghi vấn đề cần nghiên cứu. Bộ pilot chỉ được đưa vào lượt đối chiếu, trừ tiêu chuẩn phương pháp đã duyệt và các trích đoạn phản hồi Owner được chọn riêng.
- QA lập danh mục yêu cầu và test trước. Architect tạo thiết kế trong lượt riêng từ tài liệu gốc. Reviewer đánh giá từng test, tự tìm điểm thiếu và nêu phản ví dụ. Validator kiểm schema, trace, ID, cohort, cờ kiểm quyền, cạnh phụ thuộc và ma trận bao phủ. Coordinator xử lý từng phát hiện. Khi Reviewer và Coordinator đồng thuận và trích được nguồn gốc, Architect nhận yêu cầu sửa. Validator và Reviewer rà lại mọi vòng, tối đa ba vòng sửa.
- Hồi quy pilot đọc 43 test cũ, 58 test trong ba Review Package và 6 test mới của P5. Tổng 107 dòng đối chiếu có thể mô tả cùng một hành vi. Lượt OpenAI đối chiếu expected output và ghi tương đương, một phần, thiếu hoặc mâu thuẫn. Tài liệu P5 dùng để tham khảo và có thể chứa giả định chưa chốt. Lượt mock dùng ánh xạ dựng sẵn để kiểm đường chạy. Rà soát liên module dùng test về hợp đồng và kiểm chu trình trong đồ thị cạnh cứng của các module đưa vào cùng lượt. Với L3 mới, có thể thêm baseline đã duyệt theo hướng dẫn dưới đây.
- Hồ sơ lưu ngữ cảnh, prompt, đầu ra, usage, hash nguồn, kết quả validator và các vòng trao đổi. Mã xác minh vị trí và phạm vi trích dẫn. Mức độ nguồn thực sự hỗ trợ kết luận cần Reviewer và Product Owner đánh giá. Cổng pháp lý, quyền riêng tư, an toàn và khả thi giữ `UNKNOWN` đến khi có bằng chứng phù hợp. Các quy tắc như định nghĩa ngoại lệ tương tự và quy ước ngày biên vẫn cần quyết định.

## Baseline hồi quy cho L3 mới

Khi Product Owner chấp thuận test thiết kế, có thể lưu những ca cần bảo vệ vào `tools/l4/regression/<L3>.json` bằng một thay đổi được review. File là mảng các đối tượng có ba khóa `id`, `setup_and_action` và `expected_output`, mỗi giá trị là chuỗi có nội dung. Dùng mã riêng như `REG-001`. Hệ thống đọc baseline này ở lượt đối chiếu sau QA, cùng bộ pilot nếu có. Khi chạy một nhóm L3, dùng cùng một cấu hình và truyền toàn bộ mã sau `--module` để xem cạnh liên module trong cùng báo cáo.

## Giới hạn chi phí

`config.example.json` cấu hình model, giá token, cửa sổ ngữ cảnh và trần đầu ra theo vai trò. Cấu hình mẫu dùng GPT-5.6 Terra với giá trần bảo thủ 5 USD input và 18 USD output mỗi triệu token để bao gồm phụ phí ngữ cảnh dài và ghi cache. Ngân sách mẫu là 8 USD mỗi lượt chạy. Kiểm tra lại bảng giá và cửa sổ ngữ cảnh trước khi đổi model hoặc thông số. Trước mỗi lượt, hệ thống dự phòng chi phí của toàn cửa sổ model cộng trần đầu ra, rồi hạch toán bằng usage theo giá trần input và output sau khi nhận phản hồi. Khi thiếu usage do lỗi API, hệ thống giữ khoản dự phòng và dừng module. Chế độ này có thể dừng sớm hơn mức phí thực tế. Ngân sách và số lượt gọi áp dụng cho cả nhóm module trong một lần chạy. Hóa đơn cuối do nhà cung cấp tính. [Thông số và giá GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra)

## Kiểm chứng trước khi bàn giao

Đã chạy test offline và thử ba module bằng dữ liệu mô phỏng. Chế độ OpenAI cần khóa hợp lệ và ngân sách đã duyệt. Các nhận định trong report mock, kể cả ánh xạ với P5, là dữ liệu dựng sẵn. Lượt pilot không chạy test ứng dụng, benchmark hay kiểm định chuyên môn. [Draft PR pilot và bằng chứng nguồn](https://github.com/ChadNguyen1608/app-parent-pal/pull/17)

