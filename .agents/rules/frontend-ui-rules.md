---
trigger: always_on
---

# Frontend UI/UX Design Rules

## 1. Design Direction

Frontend của hệ thống dùng **HeroUI + Tailwind**, nhưng đi theo triết lý thiết kế giao diện kiểu Google: **đơn giản, rõ ràng, thực dụng, bình tĩnh, dễ hiểu, ít nhiễu**.

Không dùng Material Design component.
Không copy giao diện Google.
Chỉ lấy nguyên tắc thiết kế: rõ trước, đẹp sau; quen thuộc trước, sáng tạo sau; hành động chính phải dễ thấy; trạng thái hệ thống phải minh bạch; nội dung phải dễ đọc và dễ hành động.

## 2. Core Philosophy

Giao diện không được cố gây ấn tượng bằng hiệu ứng, màu sắc hoặc layout phức tạp.

Giao diện phải giúp người dùng trả lời ngay 4 câu hỏi:

1. Tôi đang ở đâu?
2. Tôi cần làm gì tiếp?
3. Vì sao tôi cần làm việc đó?
4. Sau khi làm xong thì chuyện gì xảy ra?

Nếu một màn hình không trả lời được 4 câu hỏi này, màn hình đó chưa đạt yêu cầu UX.

## 3. Clarity Over Decoration

Ưu tiên sự rõ ràng hơn sự đẹp mắt.

Không dùng text marketing sáo rỗng.
Không dùng slogan mơ hồ.
Không dùng icon, gradient, animation nếu chúng không giúp người dùng hiểu nhanh hơn.
Không làm giao diện “ngầu” nhưng khó dùng.
Không dùng nhiều thành phần trang trí gây phân tán sự chú ý.

Text trong UI phải ngắn, rõ, trực tiếp, thực dụng.

Ví dụ tốt:

* “Gửi tài liệu CP1”
* “Chạy audit”
* “Cần bổ sung thông tin”
* “Xem lý do”
* “Nộp bản sửa mới”

Tránh các câu như:

* “Unlock your startup potential”
* “Enhance your entrepreneurial journey”
* “AI-powered innovation platform”
* “Transform your idea with intelligence”

## 4. One Screen, One Main Job

Mỗi màn hình chỉ nên phục vụ một nhiệm vụ chính.

Không trộn quá nhiều mục tiêu vào cùng một màn hình.

Ví dụ:

* Màn hình intake: chỉ để nhận thông tin và tài liệu.
* Màn hình clarification: chỉ để chỉ ra thông tin chưa rõ.
* Màn hình report: chỉ để đọc kết quả.
* Màn hình re-audit: chỉ để nộp bản sửa mới.
* Màn hình admin/case management: chỉ để quản lý trạng thái case.

Nếu một màn hình có quá nhiều việc, hãy tách thành step, tab, drawer hoặc page riêng.

## 5. One Primary Action

Mỗi màn hình chỉ được có một hành động chính.

Primary button chỉ dùng cho hành động quan trọng nhất tại thời điểm đó.

Không đặt hai primary button cạnh nhau.
Không dùng màu nổi cho action phụ.
Không để người dùng phải đoán nên bấm nút nào.

Ví dụ:

Primary action:

* “Gửi tài liệu”
* “Chạy audit”
* “Tiếp tục”
* “Nộp bản sửa”
* “Xem report”

Secondary action:

* “Lưu nháp”
* “Quay lại”
* “Xem ví dụ”
* “Hủy”
* “Xem chi tiết”

## 6. Progressive Disclosure

Không hiển thị toàn bộ thông tin cùng lúc.

Luôn hiển thị phần quan trọng trước, phần chi tiết sau.

Thứ tự ưu tiên:

1. Kết luận ngắn
2. Trạng thái hiện tại
3. Việc cần làm tiếp theo
4. Lý do
5. Bằng chứng
6. Chi tiết mở rộng

Dùng accordion, drawer, tabs hoặc expandable section cho thông tin dài.

Không bắt người dùng đọc một khối nội dung dài mới hiểu mình cần làm gì.

## 7. Familiar Patterns First

Ưu tiên pattern quen thuộc hơn UI sáng tạo.

Người dùng không nên phải học cách dùng giao diện.

Nên dùng:

* Form cho nhập liệu
* Card cho từng nhóm thông tin
* Badge/Chip cho trạng thái
* Stepper cho quy trình nhiều bước
* Table cho danh sách case
* Drawer cho chi tiết phụ
* Modal cho xác nhận ngắn
* Accordion cho nội dung dài
* Toast cho phản hồi nhanh
* Tabs cho các nhóm nội dung ngang cấp

Không tạo interaction lạ nếu pattern quen thuộc đã giải quyết tốt.

## 8. Calm Visual Hierarchy

Giao diện phải bình tĩnh, sạch, rõ thứ bậc.

Không dùng quá nhiều màu.
Không dùng quá nhiều border mạnh.
Không dùng quá nhiều shadow.
Không làm mọi card đều nổi bật như nhau.
Không dùng animation nếu không cần thiết.
Không nhồi quá nhiều nội dung vào một vùng nhỏ.

Chỉ làm nổi bật những thứ thật sự quan trọng:

* Trạng thái case
* Lỗi nghiêm trọng
* Hành động tiếp theo
* Bản report mới nhất
* Bằng chứng quan trọng
* Cảnh báo cần xử lý

## 9. Status Must Be Visible

Người dùng phải luôn biết case, tài liệu hoặc report đang ở trạng thái nào.

Mọi object quan trọng phải có status rõ ràng.

Ví dụ status cho case:

* Draft
* Submitted
* Auditing
* Need Clarification
* Ready for Reality Check
* Human Reviewed
* Final
* Re-audit Requested

Mỗi status cần có mô tả ngắn, dễ hiểu.

Ví dụ:

“Need Clarification: Nexus đã đọc tài liệu nhưng còn thiếu thông tin để audit sâu.”

Không chỉ hiển thị status bằng màu. Phải có label chữ rõ ràng.

## 10. AI Judgment Must Be Explainable

Nếu giao diện hiển thị kết luận từ AI, kết luận đó phải có giải thích.

AI không được chỉ nói:

“Pain point chưa rõ.”

Mỗi finding cần có cấu trúc:

* Field: phần nào bị vấn đề
* Status: loại vấn đề là gì
* Evidence: bằng chứng từ tài liệu
* Reason: vì sao bị đánh giá như vậy
* Question: người dùng cần trả lời gì
* Next action: người dùng nên làm gì tiếp theo

AI output phải tạo cảm giác có căn cứ, không phải phán bừa.

## 11. Design for Trust, Not Magic

Không trình bày AI như một công cụ thần kỳ.

Không hứa rằng AI sẽ làm ý tưởng chắc chắn tốt hơn.
Không nói AI có thể đảm bảo pass.
Không dùng ngôn ngữ quá tự tin khi kết quả vẫn cần con người đánh giá.

Nên trình bày AI như một hệ thống hỗ trợ kiểm tra có quy trình.

Ví dụ tốt:

“Nexus kiểm tra tài liệu theo các tiêu chí CP1 và chỉ ra điểm chưa rõ.”

Ví dụ không tốt:

“Nexus sẽ tối ưu ý tưởng của bạn để chắc chắn vượt checkpoint.”

## 12. Reduce User Thinking Load

Giao diện phải giảm việc người dùng phải tự đoán.

Không hỏi câu quá rộng nếu có thể hỏi cụ thể hơn.

Không tốt:

“Hãy mô tả khách hàng mục tiêu.”

Tốt hơn:

* “Ai là người trực tiếp gặp vấn đề này?”
* “Họ thuộc nhóm sinh viên nào?”
* “Họ gặp vấn đề trong tình huống cụ thể nào?”
* “Hiện tại họ đang xử lý vấn đề đó bằng cách nào?”

UX tốt không chỉ là layout. UX tốt là hỏi đúng câu, đúng thời điểm.

## 13. Plain Language Only

Ngôn ngữ trong UI phải đơn giản, phổ thông, dễ hiểu.

Ưu tiên tiếng Việt rõ nghĩa.

Nên dùng:

* “Thiếu thông tin”
* “Chưa rõ”
* “Cần bổ sung”
* “Xem lý do”
* “Xem bằng chứng”
* “Nộp bản sửa”
* “Bản mới nhất”
* “Đã được kiểm tra”

Tránh dùng:

* “Optimize”
* “Enhance”
* “Leverage”
* “Unlock”
* “Transform”
* “Intelligent insight”
* “AI-powered journey”

Không dùng ngôn ngữ học thuật trong UI nếu người dùng không cần nó để hành động.

## 14. Design for Revision

Hệ thống phải được thiết kế cho việc sửa đi sửa lại.

Không coi mỗi lần gửi tài liệu là một lần dùng độc lập.

Mỗi case nên có:

* Version tài liệu
* Version report
* Lịch sử audit
* Bản mới nhất
* Bản cũ
* Trạng thái từng bản
* Ghi chú thay đổi
* Kết quả re-audit

Người dùng phải luôn biết đâu là bản hiện tại và đâu là bản cũ.

## 15. Separate Input, Output, and Decision

Phải tách rõ ba lớp:

1. Input: tài liệu hoặc câu trả lời người dùng gửi
2. Output: kết quả AI phân tích
3. Decision: quyết định của mentor, admin hoặc người dùng

Không trộn dữ liệu gốc với nhận xét của AI.
Không làm người dùng tưởng AI đã sửa thay họ.
Không để human review bị lẫn với AI draft.

Mỗi lớp cần có label và khu vực hiển thị riêng.

## 16. Helpful Empty States

Không để màn hình trống vô nghĩa.

Empty state phải nói rõ:

1. Chưa có gì
2. Vì sao chưa có
3. Người dùng cần làm gì tiếp

Không tốt:

“No data.”

Tốt hơn:

“Chưa có report cho case này. Hãy gửi tài liệu CP1 để chạy audit đầu tiên.”

## 17. Helpful Error States

Mỗi lỗi phải có hướng xử lý cụ thể.

Không tốt:

“Upload failed.”

Tốt hơn:

“Tải file lên thất bại. Hãy kiểm tra quyền truy cập Google Drive hoặc gửi lại file PDF.”

Không tốt:

“Something went wrong.”

Tốt hơn:

“Không thể chạy audit lúc này. Hãy thử lại hoặc kiểm tra tài liệu đã được cấp quyền xem.”

## 18. Accessibility by Default

Giao diện phải dễ đọc và dễ thao tác.

Yêu cầu tối thiểu:

* Text đủ lớn
* Contrast rõ
* Button dễ bấm
* Label không bị ẩn
* Form field có mô tả rõ
* Error message nằm gần field bị lỗi
* Trạng thái không phụ thuộc vào màu בלבד
* Navigation dùng được bằng keyboard
* Không dùng animation gây khó chịu hoặc làm chậm thao tác

## 19. HeroUI Usage Rules

HeroUI chỉ là công cụ dựng giao diện, không quyết định UX.

Dùng HeroUI theo các rule sau:

* Button: chỉ một primary action mỗi màn hình
* Card: mỗi card chứa một nhóm thông tin rõ ràng
* Chip/Badge: dùng cho status, severity, version
* Accordion: dùng cho giải thích dài
* Drawer: dùng để xem chi tiết mà không rời context chính
* Modal: chỉ dùng cho xác nhận hoặc hành động ngắn
* Tabs: dùng khi các phần ngang cấp nhau
* Stepper: dùng cho quy trình nhiều bước
* Textarea: dùng cho câu trả lời dài
* Alert: dùng để đẩy các lưu ý nổi bật lên (ví dụ: cảnh báo thanh toán, lỗi form, thông báo quan trọng)
* Toast: dùng cho các notification, phản hồi nhanh sau hành động (ví dụ: đã lưu bản nháp, cập nhật thành công)
* Table: dùng cho quản lý nhiều case

Không lạm dụng component chỉ vì thư viện có sẵn.

## 20. Final Design Rule

Mỗi khi thiết kế một màn hình, phải kiểm tra bằng checklist sau:

* Màn hình này có một nhiệm vụ chính chưa?
* Người dùng có biết mình đang ở đâu không?
* Người dùng có biết cần làm gì tiếp không?
* Primary action có rõ không?
* Có quá nhiều thông tin hiển thị cùng lúc không?
* Status có rõ không?
* AI judgment có bằng chứng và lý do không?
* Text có đơn giản không?
* Có phần nào chỉ để trang trí không?
* Người dùng có thể sửa, quay lại, hoặc xem lịch sử không?
* Empty state và error state có hướng dẫn hành động không?
* Giao diện có dễ đọc, dễ bấm, dễ hiểu không?

Nếu câu trả lời là “không” ở bất kỳ điểm nào, cần sửa lại UI trước khi triển khai.
