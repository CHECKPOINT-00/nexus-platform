# Web Nexus, tổng quan sản phẩm và phạm vi

## Nexus web là gì

Nexus web không phải site giới thiệu đơn thuần. Nó là lớp đóng gói một dịch vụ hỗ trợ sinh viên làm rõ và phát triển ý tưởng khởi nghiệp thành workflow có dữ liệu, có trạng thái, có AI hỗ trợ, và có người kiểm tra lại.

Mục tiêu của web là:

- có một địa chỉ public để người dùng tìm tới;
- cho phép đăng ký và để lại dấu vết;
- biến quy trình hỗ trợ rời rạc thành case workflow;
- giúp team theo dõi case, tài liệu, report, payment, và lịch sử xử lý;
- tạo số liệu vận hành để chứng minh sản phẩm chạy được.

## Phạm vi sản phẩm

### Public side

Public site dùng để giới thiệu Nexus ở ngôn ngữ rộng, không khóa vào syllabus hay Checkpoint.

Nên nói theo hướng:

- giúp sinh viên bắt đầu dự án khởi nghiệp rõ hơn;
- chốt ý tưởng;
- tìm đồng đội;
- kiểm tra market fit sơ bộ;
- làm rõ mô hình kinh doanh;
- chuẩn bị kế hoạch tài chính và sản phẩm.

Public content có thể có:

- pricing/package tổng quan;
- FAQ;
- testimonial đã ẩn danh;
- case study đã ẩn danh, không lộ tài liệu gốc hay giảng viên;
- quy trình tổng quát ở mức người ngoài hiểu được.

Không nên public các câu kiểu:

- hỗ trợ qua CP1;
- tối ưu cho syllabus FPT;
- cam kết qua checkpoint;
- prompt nội bộ;
- report thật;
- tài liệu nhóm thật chưa ẩn danh.

Không nên public:

- rubric/checklist nội bộ;
- bài làm thật hoặc transcript thật;
- nội dung khiến Nexus trông như đang thương mại hóa tài nguyên nội bộ FPT.

### Private side

Private workspace mới là nơi xử lý thật.

Nơi đây có:

- tạo case;
- nhập structured intake;
- upload hoặc gắn link tài liệu;
- nhận AI draft;
- supporter review;
- gửi report final;
- gửi bản sửa;
- theo dõi payment;
- xem lịch sử case.

## Ranh giới MVP

MVP đầu tiên phải đủ để thay phần vận hành thủ công hiện có, nhưng không cần làm Nexus hoàn chỉnh.

Phải có:

- landing page public;
- auth và role;
- tạo case;
- intake có cấu trúc;
- upload hoặc gắn tài liệu;
- document lifecycle;
- AI draft;
- supporter review;
- report final;
- payment proof thủ công;
- workspace cho user, supporter, admin.

Chưa cần làm sớm:

- realtime chat phức tạp;
- automation nặng;
- AI agent tự động toàn phần;
- analytics nâng cao;
- tích hợp payment gateway ngay từ đầu.

## Kim chỉ nam suy luận spec — Triad Lens (NMF–IPOD–CV)

Toàn bộ các quyết định spec dưới đây được suy luận qua bộ ba lens này. Đây không phải chức năng sản phẩm, mà là framework dùng để tránh suy luận vội khi thiết kế.

### NMF — Name / Meaning / Framing

Trước khi quyết định một chức năng, phải hỏi: tên gọi của nó là gì, người dùng hiểu nó theo nghĩa nào, và nó đang được đóng khung ra sao.

Áp dụng cho Nexus: phân biệt "audit" ≠ "tư vấn" ≠ "viết thay" ≠ "mentor" ≠ "supporter" ≠ "AI agent". Nếu không tách được framing, spec sẽ bị nhầm giữa các khái niệm này.

### IPOD — Input / Process / Output / Data

Mỗi chức năng phải tách được: nhận input gì, xử lý ra sao, output là gì, và dữ liệu nào phải lưu lại.

Áp dụng cho Nexus: intake là input, AI audit + supporter review là process, report là output, case/document/report version là data phải lưu.

### CV — Constant / Variable

Phần nào là quyết định đã chốt, phần nào còn là giả định, phần nào phải test bằng MVP, phần nào cần để admin/supporter review.

Áp dụng cho Nexus: hybrid model và Better Auth là constant; pricing cuối và SLA là variable cần test.

## Nguyên tắc truyền thông

Nexus nên được mô tả như một nền tảng hỗ trợ sinh viên làm rõ, phản biện, và phát triển ý tưởng khởi nghiệp ở giai đoạn đầu.

Không nên mô tả theo kiểu dịch vụ can thiệp điểm số hay thương mại hóa tài nguyên nội bộ.
