# BÁO CÁO BRAINSTORM TOÀN DIỆN: TÁI CẤU TRÚC GÓI DỊCH VỤ (79K/149K), LÕI ĐÁNH GIÁ (CORE ENGINE) & KIẾN TRÚC VÒNG ĐỜI TÀI LIỆU (DOCUMENT LIFECYCLE)

> **Tài liệu nguồn:** `temp/omp-session-2026-09-06-dialogue-clean.txt` (Phiên làm việc `01a07584-6ce3-702a-bbd2-1762647c03e3`)  
> **Thời điểm niêm phong:** 06/09/2026  
> **Người chủ trì brainstorm:** User (Product Owner / Tech Lead) & Solution Brainstormer Agent  
> **Trạng thái:** Đang đánh giá tính sẵn sàng lập kế hoạch (Plan Readiness Assessment) — Phát hiện 7 tử huyệt kiến trúc cần giải quyết trước khi lên Plan

---

## MỤC LỤC
1. [Bối cảnh lịch sử & Nguồn gốc thực tế của Nexus](#1-bối-cảnh-lịch-sử--nguồn-gốc-thực-tế-của-nexus)
2. [Hiện trạng kỹ thuật & Xử lý Pull Request #34](#2-hiện-trạng-kỹ-thuật--xử-lý-pull-request-34)
3. [Xung đột tư duy & Sự hợp nhất 3 thế hệ kiến trúc](#3-xung-đột-tư-duy--sự-hợp-nhất-3-thế-hệ-kiến-trúc)
4. [Tái cấu trúc trải nghiệm thanh toán (Payment UX) & Mô hình Credit](#4-tái-cấu-trúc-trải-nghiệm-thanh-toán-payment-ux--mô-hình-credit)
5. [Mổ xẻ "Cái lõi" đánh giá (The Core Engine) & Hệ tiêu chí](#5-mổ-xẻ-cái-lõi-đánh-giá-the-core-engine--hệ-tiêu-chí)
6. [Cơ chế chuyển đổi điểm số toán học (Deterministic Scoring) & Cứu hộ định dạng](#6-cơ-chế-chuyển-đổi-điểm-số-toán-học-deterministic-scoring--cứu-hộ-định-dạng)
7. [Kiến trúc Cơ sở dữ liệu động cho Agent: "Strong Spine, Flexible Ribs"](#7-kiến-trúc-cơ-sở-dữ-liệu-động-cho-agent-strong-spine-flexible-ribs)
8. [Tổng hợp Quyết định kiến trúc (ADR Summary) & Kế hoạch 4 giai đoạn](#8-tổng-hợp-quyết-định-kiến-trúc-adr-summary--kế-hoạch-4-giai-đoạn)
9. [Đánh giá tính sẵn sàng lập kế hoạch & 7 tử huyệt kiến trúc (Plan Readiness & Core Blockers)](#9-đánh-giá-tính-sẵn-sàng-lập-kế-hoạch--7-tử-huyệt-kiến-trúc-plan-readiness--core-blockers)
10. [Bảng đối chiếu Đã đủ vs. Còn thiếu & 3 Quyết định cốt lõi cho phiên tiếp theo](#10-bảng-đối-chiếu-đã-đủ-vs-còn-thiếu--3-quyết-định-cốt-lõi-cho-phiên-tiếp-theo)

---

## 1. BỐI CẢNH LỊCH SỬ & NGUỒN GỐC THỰC TẾ CỦA NEXUS

### 1.1. Thực tế từ 12 nhóm sinh viên tại `HƯỚNG DẪN CÁC NHÓM`
Trước khi có phần mềm web tự động, Nexus đã vận hành thực tế hỗ trợ **12 nhóm sinh viên FPT môn EXE101** (từ nhóm `0001_26` đến `0012_187` được lưu trữ tại `E:\FPT\Semester_7\EXE101\HƯỚNG DẪN CÁC NHÓM`).
- Toàn bộ dữ liệu thực chứng gồm:
  - Các bản nộp gốc của sinh viên: `_INPUT_SUBMISSION_ORIGINAL.md`
  - Các bản báo cáo thẩm định xuất bản: `_OUTPUT_FINAL_REPORT_DELIVERED.md`
  - Tài liệu đặc tả vòng đời tài liệu: `LIFECYCLE_IMPLEMENTATION_SPEC.md`
- Trong giai đoạn này, Product Owner đóng vai trò là "Human Operator":
  1. Nhận bài nộp sơ khởi qua tin nhắn riêng.
  2. Đưa bài nộp qua System Prompt được căn chỉnh thủ công trên ChatGPT.
  3. Xuất file báo cáo Markdown gửi lại cho sinh viên.
  4. Sinh viên đọc các lỗi vi phạm, chỉnh sửa bài làm và gửi lại bản cập nhật.
  5. Tiếp tục thẩm định lần 2, lần 3 cho đến khi bài đạt chuẩn Checkpoint 1.

### 1.2. Bản chất bất biến của Checkpoint 1: Vòng lặp sửa bài (Iteration Loop)
Từ dữ liệu thực tế của 12 nhóm, phát hiện một chân lý miền (Domain Insight) cốt tử:
* **Không có bất kỳ nhóm nào nộp bài 1 lần duy nhất mà đạt chuẩn ngay.**
* Bài nộp vòng 1 (`v01`) luôn mắc các lỗi ngây thơ kinh điển: Vấn đề quá rộng ("giải quyết nỗi buồn của giới trẻ"), Khách hàng mục tiêu mơ hồ ("tất cả sinh viên Việt Nam"), Giải pháp "búa tìm đinh" (đòi làm Siêu ứng dụng tích hợp AI/Blockchain mà chưa phỏng vấn được 1 khách hàng nào).
* Sau khi nhận Báo cáo thẩm định vòng 1, sinh viên **bắt buộc phải sửa bài và nộp lại vòng 2 (`v02`)** để đào sâu phân khúc hẹp và bổ sung số liệu chứng minh.
* Thực tế cho thấy: Số vòng lặp tối đa của một nhóm tại Checkpoint 1 là **3 lần (v01, v02, v03)**. Đến vòng 3, ý tưởng đã đủ độ sắc bén để tự tin pitching trước hội đồng giảng viên.

### 1.3. Hậu quả lên thiết kế mã nguồn ban đầu
- Vì nhận thấy sinh viên cần nộp bài nhiều lần cho 1 Checkpoint, kiến trúc ban đầu của Nexus đã thiết kế mô hình **Ví Credit theo Case** (sinh viên nạp credit để có lượt nộp bài lại).
- Tuy nhiên, khi đưa mô hình này lên giao diện thương mại sau buổi Demo Pitching, sự nhập nhằng giữa "mua credit trừ dần" và "mua gói dịch vụ 79k / 149k" đã tạo ra xung đột nghiêm trọng về trải nghiệm người dùng và logic State Machine.

---

## 2. HIỆN TRẠNG KỸ THUẬT & XỬ LÝ PULL REQUEST #34

### 2.1. Xác minh Cơ sở dữ liệu thực tế (Production Database)
- Đã thực hiện truy vấn trực tiếp vào bảng `service_packages` thông qua chuỗi kết nối an toàn `READONLY_DATABASE_URL`:
  - `pkg_ai_audit` (**79.000 VNĐ**): Đã tồn tại trong DB, `is_active = true`, `features` chứa mô tả gói tự động.
  - `pkg_supporter_audit` (**149.000 VNĐ**): Đã tồn tại trong DB, `is_active = true`, `features` chứa mô tả gói có Mentor thẩm định.
  - `pkg_tf_audit` (**39.000 VNĐ**): Gói cũ, đã bị vô hiệu hóa (`is_active = false`).
- **Kết luận:** Cơ sở dữ liệu thực tế **đã có sẵn 2 gói 79k và 149k**. Nhận định ban đầu của AI cho rằng "bảng ServicePackage chưa có 2 gói này" là sai sót do đọc tài liệu phân tích cũ chưa cập nhật.

### 2.2. Kiểm tra và Hợp nhất PR #34
- **PR #34 (`feat/payment-flow-shortcut-fix`)**:
  - Giải quyết bài toán: Sinh viên thanh toán mà ví thiếu tiền sẽ được chuyển hướng thẳng sang `/dashboard/payment?amount=...`, tự động tạo giao dịch VietQR với đúng số tiền còn thiếu.
  - Sau khi chuyển khoản qua SePay, Webhook cập nhật số dư ví tức thì và tự động hoàn tất đơn hàng.
- **Quyết định:** Đã hợp nhất (Merge) PR #34 vào nhánh `dev`, sau đó pull code mới nhất về nhánh làm việc `feat/pricing-package-tiers-ui`. Toàn bộ luồng thanh toán mới của 2 gói 79k/149k sẽ kế thừa 100% nền tảng vững chắc này.

---

## 3. XUNG ĐỘT TƯ DUY & SỰ HỢP NHẤT 3 THẾ HỆ KIẾN TRÚC

### 3.1. Ba thế hệ tư duy trong Nexus
1. **Thế hệ 1 (Mô hình Dịch vụ Tĩnh):** Gói bán theo số lượt đánh giá tĩnh (Gói 1 lượt, Gói 2 lượt, Gói vô hạn lượt). Phù hợp bán lẻ nhưng thiếu khả năng quản lý vòng đời tài liệu.
2. **Thế hệ 2 (Mô hình Ví Credit theo Case - Code hiện tại):** Nạp tiền vào ví  $\rightarrow$  Đổi thành Credit  $\rightarrow$  Mỗi lần nộp bài/yêu cầu báo cáo trừ 1 Credit. Linh hoạt về kỹ thuật nhưng giao diện cực kỳ khó hiểu đối với sinh viên.
3. **Thế hệ 3 (Mô hình Phân tầng Thương mại 79k/149k):** Sinh viên mua Cấp độ giải pháp (Gói 79k: Máy chấm AI tức thì; Gói 149k: Mentor người thật thẩm định chuyên sâu + 24h tư vấn).

### 3.2. Bản chất của sự xung đột
* **Xung đột 1 (Kỳ vọng người dùng vs Chi phí vận hành):** 
  - Gói 79k là **100% máy chấm**, chi phí 1 lần chạy API chỉ tốn 1.000đ – 2.000đ. Máy không biết mệt, do đó việc cho phép sinh viên nộp bài sửa lại lần 2 miễn phí trong 24 giờ là hoàn toàn khả thi và tạo ra giá trị khổng lồ cho sinh viên.
  - Gói 149k là **có Human Mentor FPT đọc và ký duyệt**. Không thể bắt Mentor đọc lại miễn phí lần 2 mà không tăng chi phí nhân sự. Giá trị vượt trội của gói 149k không nằm ở việc "chấm lại nhiều lần" mà nằm ở **Độ tin cậy được Mentor bảo chứng + Kênh chat 24h hỏi đáp trực tiếp (tối đa 3 câu hỏi đào sâu)**.
* **Xung đột 2 (Mô hình Credit ngầm vs Modal bán Credit trên UI):**
  - Người dùng không quan tâm "Credit" là gì. Sinh viên vào Nexus vì họ đang hoang mang sắp đến hạn nộp Checkpoint 1, họ chỉ muốn biết: "Tôi trả 79k thì tôi được gì? Bài tôi có qua môn không?".
  - Nếu hiện modal hỏi: *"Bạn muốn mua mấy credit?"*, sinh viên sẽ đứng hình: *"Tôi làm sao biết bài tôi cần mấy credit? 300k là mấy credit?"*.

### 3.3. Quyết định kiến trúc hợp nhất: "Bên ngoài bán Gói — Bên trong cấp Hạn mức Vòng đời"
Hệ thống hợp nhất hoàn hảo 3 thế hệ kiến trúc bằng nguyên lý phân tầng:

```
┌────────────────────────────────────────────────────────────────────────┐
│              GIAO DIỆN THƯƠNG MẠI (COMMERCIAL UX - FRONTEND)           │
│  Bán Cấp độ giải pháp rõ ràng:                                         │
│  • Gói 79k: Báo cáo AI Tức thì + 1 lần Quét lại miễn phí sau khi sửa   │
│  • Gói 149k: Mentor FPT Thẩm định & Ký tên + 24h Chat tư vấn trực tiếp │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Kích hoạt giao dịch
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│            HẠN MỨC VÒNG ĐỜI NGẦM (DOCUMENT LIFECYCLE QUOTA - BACKEND)   │
│  Quản trị kỹ thuật bằng State Machine & Credit Ledger:                 │
│  • Mua Gói 79k  ──► Cấp Hạn ngạch: 2 vòng chấm AI (v01 + v02 trong 24h) │
│  • Mua Gói 149k ──► Cấp Hạn ngạch: 1 vòng Mentor ký tên + 1 Chat Session│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. TÁI CẤU TRÚC TRẢI NGHIỆM THANH TOÁN (PAYMENT UX) & MÔ HÌNH CREDIT

### 4.1. Hành trình Người dùng Chi tiết (Persona: Hoàng Long - K19 SE ĐH FPT)
* **Bối cảnh:** Hoàng Long là nhóm trưởng nhóm 13 môn EXE101. Hiện tại là 21h30, hạn nộp bài Checkpoint 1 trên Flm/Coursera là 23h59. Nhóm Long đang cãi nhau gay gắt vì chưa thống nhất được chân dung khách hàng và giải pháp. Long vào Nexus để tìm chiếc phao cứu sinh.
* **Bước 1: Chọn gói giải pháp:**
  - Long tải file bài nộp lên màn hình Intake.
  - Màn hình hiển thị 2 thẻ gói rõ ràng:
    - Thẻ 79.000đ: "Báo cáo AI Tức thì (1 phút) — Tặng 1 lần quét lại miễn phí trong 24h để hoàn thiện bài".
    - Thẻ 149.000đ: "Mentor FPT Thẩm định (Có chữ ký bảo chứng) — Tặng 24h chat trực tiếp với Mentor".
  - Long chọn gói 79k vì cần kết quả ngay trong đêm để kịp giờ nộp bài.
* **Bước 2: Xác nhận thanh toán 1-click & Tự động tính tiền thiếu:**
  - Bấm `[Chọn gói 79.000đ]`, Modal **"Xác nhận thanh toán gói dịch vụ"** hiện lên (xóa sổ hoàn toàn ô nhập số lượng credit):
    - Tên dịch vụ: **Gói Thẩm định AI Cấp tốc**
    - Đơn giá: **79.000 VNĐ**
    - Số dư ví hiện tại: **50.000 VNĐ**
    - Số tiền cần nạp thêm: **29.000 VNĐ**
  - Long bấm nút `[Nạp thêm 29.000đ & Thanh toán]`: Hệ thống lập tức mở popup VietQR với số tiền chính xác **29.000 VNĐ**.
  - Long quét mã ngân hàng. Sau 3 giây, SePay bắn Webhook về API  $\rightarrow$  Ví nhảy lên 79.000đ  $\rightarrow$  Hệ thống tự trừ tiền và chuyển Long sang màn hình thẩm định mà Long không cần phải bấm lại nút nào!

### 4.2. Màn hình Chờ Tích cực (Active Radar Progress Screen)
Thay vì để màn hình đứng im ở trạng thái `triage_pending` vô cảm khiến sinh viên sốt ruột:
- **Gói 79k:** Hiển thị radar xoay kèm các dòng trạng thái giải thích rõ AI đang làm gì theo từng mốc giây:
  - *Giây 0 – 15:* "🔍 Đang bóc tách 13 trường dữ liệu ý tưởng và chân dung khách hàng..."
  - *Giây 15 – 35:* "⚖️ Đang đối chiếu Bộ tiêu chí Checkpoint 1 FPT EXE101 & Quét bẫy lỗi phổ biến..."
  - *Giây 35 – 50:* "📊 Đang tổng hợp khuyến nghị chỉnh sửa và đóng gói báo cáo thẩm định..."
- **Gói 149k:** Hiển thị Stepper 3 giai đoạn: `AI tạo bản nháp (Hoàn tất)`  $\rightarrow$  `Đang phân phối tới Mentor chuyên môn (Đang xử lý)`  $\rightarrow$  `Mentor duyệt & Kích hoạt kênh tư vấn 24h`.

### 4.3. Banner Nhắc nhở & Guardrail Chống Phí Lượt Quét Lần 2 (Copywriting Chuẩn)
Khi Báo cáo thẩm định lần 1 của gói 79k hiện ra:
* **Giao diện Banner nổi bật ở đầu trang báo cáo:**
  ```
  ⚡ BẠN CÒN 1 LƯỢT QUÉT LẠI MIỄN PHÍ (HẾT HẠN SAU: 23 GIỜ 58 PHÚT)
  💡 Lời khuyên quan trọng từ Nexus: Đừng vội bấm "Quét lại" ngay bây giờ!
  Hãy cùng nhóm đọc kỹ từng Lỗi nghiêm trọng (Blocker/Major) được chỉ ra ở báo cáo bên dưới. 
  Chỉnh sửa lại file bài nộp cho thật chuẩn chỉnh, sau đó mới dùng lượt quét này để kiểm tra 
  xem điểm số Checkpoint 1 của nhóm đã được nâng lên hay chưa nhé.
  ```
* **Guardrail logic khi bấm `[Quét lại bài nộp]`:*
  - Hệ thống so sánh nội dung bài nộp mới với bài nộp cũ thông qua mã băm (Hash comparison) hoặc cờ `is_intake_modified`.
  - **Nếu nội dung CHƯA HỀ ĐƯỢC CHỈNH SỬA:** Lập tức bật Modal cảnh báo màu cam:
    ```
    ⚠️ CẢNH BÁO: BÀI NỘP CHƯA CÓ THAY ĐỔI!
    Hệ thống phát hiện bạn chưa chỉnh sửa nội dung bài làm so với lần quét trước.
    Nếu quét lại ngay bây giờ, điểm số và kết quả sẽ không thay đổi, và nhóm bạn sẽ 
    LÃNG PHÍ MẤT LƯỢT QUÉT MIỄN PHÍ DUY NHẤT.

    [ Quay lại chỉnh sửa bài làm ] (Nút chính - Màu xanh nổi bật)
    [ Tôi vẫn muốn quét lại ]       (Nút phụ - Chữ xám mờ)
    ```

---

## 5. MỔ XẺ "CÁI LÕI" ĐÁNH GIÁ (THE CORE ENGINE) & HỆ TIÊU CHÍ

### 5.1. Nguồn gốc Tiêu chí & Quy trình Thẩm định Chuẩn trên Notion
* **Tài liệu tham chiếu gốc:** Bộ quy trình vận hành thủ công của Supporter trên ChatGPT do Product Owner biên soạn (`https://app.notion.com/p/H-NG-D-N-WORKFLOW-TH-C-NG-AUDIT-T-NG-B-NG-CHATGPT-38657ff9f63e8053a46fecc08e1963b5`).
* Quy trình chuẩn gồm một dây chuyền kiểm định chất lượng (Assembly Line) 4 công đoạn:
  1. **Công đoạn 1 (Context Opening - Triad Framework NMF-IPOD-CV):** Đóng khung vai trò AI là "Mentor phản biện khắt khe môn EXE101 ĐH FPT", triệt tiêu hoàn toàn tính cách "khen dạo thảo mai" hay "nói nước đôi" của LLM thông thường.
  2. **Công đoạn 2 (Input Clarification Gate):** Cơ chế chống ảo giác (Anti-Hallucination) và chống khen xảo quyệt (Anti-Flattery). Nếu sinh viên nộp bài hời hợt, AI gắn cờ vi phạm ngay ở cửa ngõ, tuyệt đối không tự suy diễn thêm thông tin để bao biện cho sinh viên.
  3. **Công đoạn 3 (Rubric Evaluation):** Bóc tách và đối chiếu 13 trường dữ liệu bài nộp với bộ tiêu chí chuẩn.
  4. **Công đoạn 4 (Report Formatting):** Đóng gói báo cáo chuẩn hóa gồm bảng tổng kết, điểm trừ và hướng dẫn hành động.

* **13 Trường dữ liệu nộp bài Checkpoint 1 FPT EXE101:**
  1. *Idea name* (Tên ý tưởng)
  2. *Target customer* (Khách hàng mục tiêu)
  3. *Customer story* (Bối cảnh/Câu chuyện thực tế)
  4. *Pain point* (Nỗi đau thực tế)
  5. *Current alternative* (Giải pháp thay thế hiện tại)
  6. *Solution* (Giải pháp đề xuất)
  7. *Core value proposition* (Tuyên ngôn giá trị cốt lõi)
  8. *User / Customer / Payer / Partner* (Phân định vai trò)
  9. *Evidence / Assumptions* (Bằng chứng và giả định)
  10. *Market* (Quy mô thị trường sơ bộ)
  11. *Business model* (Mô hình kiếm tiền sơ khởi)
  12. *MVP / Validation path* (Lộ trình kiểm chứng nhỏ nhất)
  13. *Team feasibility* (Khả năng thực thi của nhóm)

### 5.2. So sánh 4 Hướng Triển khai Tiêu chí
Trong buổi brainstorm, 4 hướng triển khai tiêu chí kỹ thuật đã được phân tích và đánh giá:

| Hướng Triển Khai | Cho ra điểm số? | Mức độ khách quan | Ưu điểm | Nhược điểm / Đánh giá |
| :--- | :---: | :---: | :--- | :--- |
| **1. Checklist Nhị phân (Yes/No)** | Không trực tiếp | Rất cao | Đơn giản, lập trình dễ, AI không bị lú | Quá nông cạn, không đo được độ chín muồi của ý tưởng. |
| **2. Thang đo Rubric Định tính** | Không trực tiếp | Trung bình | Sâu sắc về mặt sư phạm, giải thích cặn kẽ | Khó tự động hóa thành điểm số nhất quán. |
| **3. Điểm số Trực tiếp (0-100)** | Có | Rất thấp (Dễ ảo giác) | Trực quan cho sinh viên | **Bị loại bỏ hoàn toàn**: AI sinh số ngẫu nhiên, lần 1 chấm 52, lần 2 sửa 1 chữ chấm 80. |
| **4. Luật Trừ điểm (Rule Penalty)** | Có (Toán học) | Cực kỳ cao | Minh bạch lý do trừ điểm, có thể kiểm thử hồi quy | Cần xây dựng cây lỗi phong phú. |

**👉 Quyết định:** Nexus lựa chọn giải pháp **Lai (Hybrid)**: Kết hợp **Thang đo Rubric Định tính (Tầng 4) + Luật Trừ điểm Cơ học (Backend Deterministic Scoring)**.

### 5.3. Định nghĩa Khoa học: Cây Phân tầng 4 Cấp độ (Evaluation Hierarchy)
Khắc phục sai lầm coi 1 hạng mục là 1 check-item đơn lẻ, hệ thống chuẩn hóa cây phân tầng 4 cấp độ:

```
[TẦNG 1: HẠNG MỤC]      Field: "Khách hàng mục tiêu" (Target Customer)
        │
        ▼
[TẦNG 2: HỆ TIÊU CHÍ]   Criteria: Các thuộc tính chất lượng cốt lõi
        │               1. Độ hẹp và cụ thể của phân khúc (Granularity)
        │               2. Tính khả thi tiếp cận 5-10 người trong 1 tuần (Accessibility)
        │               3. Phân định vai trò User vs Payer (Role Separation)
        ▼
[TẦNG 3: CHỈ BÁO ĐO]    Indicators: Dấu hiệu thực chứng để nhận diện
        │               • Indicator IND-01: Chứa từ cấm chung chung ("sinh viên", "người trẻ")
        │               • Indicator IND-02: Không nêu rõ địa điểm/kênh tiếp cận thực tế
        │               • Indicator IND-03: Nhầm lẫn giữa người dùng cuối và người trả tiền
        ▼
[TẦNG 4: RUBRIC & LỖI]  Rubric Status & Severity Level
                        • Status: Good enough | Too vague | Missing | Mixed frame
                        • Severity: BLOCKER (-25đ, chặn trần 49) | MAJOR (-12đ, chặn trần 75) | MINOR (-5đ)
```

### 5.4. Phân nhánh Pipeline cho 2 Gói
* **Gói 79k (Single-pass Fast Pipeline):** Gộp toàn bộ kiểm định vào **1 file Prompt duy nhất** (`input_clarification_gate_lite_v1.md`). Thời gian chạy ~10-15 giây, chi phí LLM < 150 VNĐ/lần, tự động hoàn tất 100% không cần can thiệp con người.
* **Gói 149k (Two-pass Human-in-the-loop Pipeline):** Chạy 2 bước hoàn chỉnh (`triad_framework_v1_1`  $\rightarrow$  `input_clarification_gate_v4_1`) xuất bản nháp (Draft Report) lên Dashboard  $\rightarrow$  Supporter/Mentor FPT vào đọc, chỉnh sửa nhận xét, ký tên bảo chứng  $\rightarrow$  Xuất bản báo cáo chính thức và mở kênh Chat 24h.

---

## 6. CƠ CHẾ CHUYỂN ĐỔI ĐIỂM SỐ TOÁN HỌC (DETERMINISTIC SCORING) & CỨU HỘ ĐỊNH DẠNG

### 6.1. Bản chất của System Prompt gốc
**Khẳng định nguyên tắc bất biến: System Prompt tuyệt đối KHÔNG ĐƯỢC PHÉP xuất điểm số 0-100 trực tiếp.**
LLM chỉ chịu trách nhiệm nhận diện sự thật khách quan:
1. Xác định 3 mức độ Sẵn sàng: `READY FOR CP1`, `PARTIALLY READY FOR CP1`, hoặc `NOT READY FOR CP1 YET`.
2. Trạng thái của từng trường: `Good enough`, `Too vague`, `Missing`, `Mixed frame`.
3. Danh sách các vi phạm cụ thể tương ứng với các `indicator_id` và mức độ nghiêm trọng `severity`.

### 6.2. Công thức Tính điểm Cơ học tại Backend TypeScript
Con số điểm số hiển thị trên giao diện (ví dụ: `68/100`) được Backend tính toán bằng thuật toán toán học cơ học, đảm bảo cùng một danh sách lỗi thì 100 lần tính đều ra đúng 1 kết quả duy nhất:

$$	ext{Điểm ban đầu} = \left( rac{	ext{Số trường đạt chuẩn Good enough}}{13} 
ight) 	imes 100$$

$$	ext{Tổng điểm phạt} = \sum (	ext{Lỗi BLOCKER} 	imes 20) + \sum (	ext{Lỗi MAJOR} 	imes 8) + \sum (	ext{Lỗi MINOR} 	imes 3)$$

$$	ext{Điểm thô} = 	ext{Điểm ban đầu} - 	ext{Tổng điểm phạt}$$

### 6.3. Quy tắc Khóa Trần Điểm số (Clamping Rules)
Để ngăn chặn trường hợp bài nộp viết rất dài được nhiều điểm nhưng lại mắc phải 1 lỗi chết người (ví dụ: Ý tưởng phạm pháp, hoặc tệp khách hàng hoàn toàn không tiếp cận được) mà vẫn được điểm cao:
1. **Khóa trần lỗi BLOCKER:** Nếu bài nộp dính $\ge 1$ lỗi `BLOCKER`, điểm tổng kết **tuyệt đối không được vượt quá 49/100** (bắt buộc rớt xuống ngưỡng `NOT READY FOR CP1 YET`):
   $$	ext{Điểm kết luận} = \min(	ext{Điểm thô}, 49)$$
2. **Khóa trần lỗi MAJOR:** Nếu bài nộp không có `BLOCKER` nhưng dính $\ge 1$ lỗi `MAJOR`, điểm tổng kết **tuyệt đối không được vượt quá 75/100** (bắt buộc rớt xuống ngưỡng `PARTIALLY READY FOR CP1`):
   $$	ext{Điểm kết luận} = \min(	ext{Điểm thô}, 75)$$
3. **Giới hạn biên:** Điểm số được giới hạn trong đoạn $[10, 100]$ (không bao giờ để điểm 0 gây sốc tâm lý cực đoan, điểm sàn là 10).

### 6.4. Bộ Tự Động Cứu Hộ Định Dạng (Validator & Retry Loop)
Thay thế hoàn toàn vai trò của Human Operator khi LLM trả về định dạng vỡ cú pháp:
```
  [LLM Output Markdown] ──► [Backend Syntax & JSON Validator]
                                          │
                        ┌─────────────────┴─────────────────┐
                        ▼                                   ▼
                   [Hợp lệ 100%]                    [Lỗi vỡ cấu trúc]
             Chạy hàm tính điểm số               Gửi prompt sửa lỗi tức thì:
             Lưu kết quả & Hiển thị UI           "System notice: Output format invalid. 
                                                  Regenerate strictly adhering to schema..."
                                                 (Vòng lặp thử lại tối đa 2 lần)
```

---

## 7. KIẾN TRÚC CƠ SỞ DỮ LIỆU ĐỘNG CHO AGENT: "STRONG SPINE, FLEXIBLE RIBS"

### 7.1. Bài toán Mâu thuẫn Kỹ thuật
* **Yêu cầu 1 (Khả năng tích lũy tri thức):** Sau khi vận hành 100+ dự án, Product Owner sẽ thu thập được vô số bẫy lỗi mới, từ cấm mới, và các trường hợp biên (edge cases). Cơ sở dữ liệu phải cho phép thêm bớt thuộc tính mà không cần chạy Prisma Migration (tránh nguy cơ mất an toàn DB).
* **Yêu cầu 2 (Tốc độ truy vấn & Thống kê):** Agent cần query cực nhanh trong < 1ms danh sách Top 3 lỗi phổ biến nhất trên toàn hệ thống để làm dữ liệu đối chiếu nhanh (Fast-Path Screening).
* **Bế tắc nếu dùng giải pháp cực đoan:**
  - Ném hết vào 1 bản ghi JSON khổng lồ: Chậm, nghẽn băng thông, không thể dùng lệnh `GROUP BY` để đếm tần suất lỗi.
  - Tách thành 7-8 bảng quan hệ chuẩn tắc (Pure Relational): Cực kỳ cồng kềnh, mỗi lần sửa thuộc tính bẫy lỗi là phải đổi schema.

### 7.2. Giải pháp: Mô hình "Strong Spine, Flexible Ribs" (PostgreSQL JSONB)
Áp dụng mẫu hình thiết kế tiêu chuẩn công nghiệp (Stripe & Shopify Architecture):

```mermaid
erDiagram
    EvaluationCriteria ||--o{ EvaluationIndicator : "chứa các chỉ báo"
    EvaluationIndicator ||--o{ CaseAuditViolation : "bị vi phạm trong"
    Case ||--o{ CaseAuditViolation : "ghi nhận lỗi"

    EvaluationCriteria {
        string id PK "crit_target_granularity"
        string field_code "target_customer (Index)"
        string name "Độ cụ thể của phân khúc"
        int weight "Trọng số"
        boolean is_active "true"
    }

    EvaluationIndicator {
        string id PK "ind_target_generic_student"
        string criteria_id FK "crit_target_granularity"
        string code "ERR_TARGET_GENERIC_STUDENT"
        string severity "BLOCKER | MAJOR | MINOR (Index)"
        string title "Dùng từ cấm sinh viên chung chung"
        boolean is_active "true (Index)"
        jsonb rule_data "Chứa keywords, bad_patterns, good_examples, edge_cases"
    }

    CaseAuditViolation {
        string id PK
        string case_id FK "Index"
        int audit_round "1 | 2"
        string indicator_id FK "Index"
        string field_code "Index"
        string severity "BLOCKER (Index)"
        jsonb evidence "Trích dẫn câu sai + lập luận AI"
        datetime created_at
    }
```

* **Cột sống cứng (Strong Spine - B-Tree Index):**
  - Các trường định danh và phân loại: `id`, `field_code`, `severity`, `is_active`, `case_id`, `audit_round`.
  - Được đánh chỉ mục B-Tree chuẩn của PostgreSQL, phục vụ cho các câu lệnh đếm, lọc và thống kê cực nhanh.
* **Xương sườn mềm (Flexible Ribs - JSONB Column):**
  - Cột `rule_data` trong `EvaluationIndicator`: Thoải mái lưu mảng từ cấm, câu hỏi bẫy lỗi, kinh nghiệm mentor:
    ```json
    {
      "trigger_keywords": ["sinh viên", "mọi người", "người trẻ", "toàn quốc"],
      "bad_pattern_examples": ["Khách hàng là sinh viên các trường đại học tại Hà Nội"],
      "good_pattern_examples": ["Sinh viên năm 1-2 khối ngành kinh tế tại khu vực Cầu Giấy chi tiêu dưới 3tr/tháng"],
      "edge_case_notes": "Nếu đề tài là ứng dụng tuyển dụng B2B thì sinh viên là user chứ không phải payer."
    }
    ```

### 7.3. Cơ chế Fast-Path Screening của Agent
Nhờ kiến trúc "Strong Spine", Agent thực hiện cơ chế rà soát 2 giai đoạn siêu tốc:
1. **Truy vấn thống kê siêu tốc (< 1ms):**
   ```sql
   SELECT indicator_id, COUNT(*) as hit_frequency
   FROM case_audit_violations
   WHERE severity IN ('BLOCKER', 'MAJOR')
   GROUP BY indicator_id
   ORDER BY hit_frequency DESC
   LIMIT 3;
   ```
2. **Soi nhanh bài nộp (Fast-Path Pre-screening):**
   Agent nạp payload của đúng 3 lỗi hay gặp nhất này vào bộ nhớ làm việc. Trong 2 giây đầu tiên đọc bài nộp, Agent đối chiếu ngay xem bài có dính 3 lỗi ngớ ngẩn kinh điển này không. Nếu có, cờ vi phạm được dựng ngay lập tức trước khi bước vào phân tích sâu 13 trường.

---

## 8. TỔNG HỢP QUYẾT ĐỊNH KIẾN TRÚC (ADR SUMMARY) & KẾ HOẠCH 4 GIAI ĐOẠN

### 8.1. Bảng Tổng Hợp Quyết Định Kiến Trúc (ADR 01 – 08)

| Mã Quyết Định | Tên Quyết Định | Bản Chất Quyết Định & Đánh Đổi (Trade-offs) | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **ADR-01** | Tận dụng Luồng Nạp tiền PR #34 | Chuyển hướng thanh toán thiếu tiền sang VietQR tự động. Không tự chế luồng nạp mới. | **ĐÃ CHỐT** |
| **ADR-02** | Hợp nhất Gói & Hạn mức Vòng đời | Bên ngoài bán Gói giải pháp (79k/149k) — Bên trong cấp Hạn mức vòng đời tài liệu (v01 + v02). | **ĐÃ CHỐT** |
| **ADR-03** | Bỏ Modal Credit Quantity | Xóa bỏ hoàn toàn ô chọn số lượng credit trên UI. Modal đổi thành "Xác nhận thanh toán gói dịch vụ" 1-click. | **ĐÃ CHỐT** |
| **ADR-04** | Lựa chọn Rubric + Rule Penalty | Loại bỏ chấm điểm trực tiếp 0-100 từ Prompt; kết hợp Thang đo Rubric định tính với Luật trừ điểm cơ học. | **ĐÃ CHỐT** |
| **ADR-05** | Chuẩn hóa Cây 4 Cấp độ | Cấu trúc phân tầng chuẩn: Hạng mục (Field)  $\rightarrow$  Tiêu chí (Criteria)  $\rightarrow$  Chỉ báo (Indicator)  $\rightarrow$  Rubric/Severity. | **ĐÃ CHỐT** |
| **ADR-06** | Công thức Tính điểm & Khóa trần | Backend tính điểm bằng công thức cơ học; dính `BLOCKER` khóa trần $\le 49$, dính `MAJOR` khóa trần $\le 75$. | **ĐÃ CHỐT** |
| **ADR-07** | Kiến trúc DB Hybrid PostgreSQL JSONB | "Strong Spine, Flexible Ribs": Cột cứng có B-Tree index để query nhanh; Cột `rule_data` JSONB để mở rộng tri thức không cần migration. | **ĐÃ CHỐT** |
| **ADR-08** | Cơ chế Fast-Path Screening | Agent query Top 3 chỉ báo vi phạm nhiều nhất để soi lướt bài nộp trong 2 giây đầu tiên. | **ĐÃ CHỐT** |

### 8.2. Kế hoạch 4 Giai đoạn Triển khai Mã nguồn (Implementation Roadmap)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: CƠ SỞ DỮ LIỆU & SEED TRI THỨC (DATABASE & KNOWLEDGE SEED)     │
│ • Kiểm tra bảng EvaluationCriteria & EvaluationIndicator (thêm JSONB)      │
│ • Seed bộ 13 trường Checkpoint 1 & danh sách Indicators lỗi phổ biến       │
│ • Tuân thủ tuyệt đối quy tắc An toàn Prisma Migration của dự án            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 2: LÕI THẨM ĐỊNH & PROMPT PIPELINE (CORE ENGINE & PROMPTS)       │
│ • Hoàn thiện `input_clarification_gate_lite_v1.md` cho gói 79k             │
│ • Viết hàm tính điểm cơ học Deterministic Scoring & Clamping Rules tại API │
│ • Xây dựng bộ Validator kiểm tra định dạng và Retry Loop                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 3: BACKEND USE CASES & STATE MACHINE (BUSINESS LOGIC)             │
│ • Cập nhật Use Case nộp bài lần 2 (Resubmission Use Case) cho gói 79k       │
│ • Thiết lập thời hạn hết hạn 24 giờ cho lượt quét miễn phí                 │
│ • Dây nối webhook thanh toán VietQR với việc kích hoạt lượt thẩm định       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 4: GIAO DIỆN NGƯỜI DÙNG & TRẢI NGHIỆM (FRONTEND & UX)            │
│ • Xóa bỏ ô nhập số lượng Credit, hoàn thiện Modal Xác nhận thanh toán gói   │
│ • Xây dựng Màn hình Chờ tích cực (Active Radar Progress Screen)             │
│ • Thêm Banner nhắc nhở 24h & Modal cảnh báo chống lãng phí lượt quét lại   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. ĐÁNH GIÁ TÍNH SẴN SÀNG LẬP KẾ HOẠCH & 7 TỬ HUYỆT KIẾN TRÚC (PLAN READINESS & CORE BLOCKERS)

Sau khi đối chiếu trực tiếp các kết luận từ buổi brainstorm với mã nguồn thực tế của hệ thống (`apps/api`, `case-machine.ts`, Prisma schema, PR #34), phát hiện **BẢN BRAINSTORM NÀY CHƯA ĐỦ ĐIỀU KIỆN ĐỂ LẬP IMPLEMENTATION PLAN**.

Báo cáo mới dừng ở mức định hình khái niệm nghiệp vụ (Product Concept & Pricing Framing). Nếu phân công kỹ sư hoặc subagent lập trình ngay lúc này, hệ thống sẽ gặp phải **7 tử huyệt kiến trúc cốt lõi (Core Blockers)** dưới đây:

### 9.1. Tử huyệt 1: State Machine kẹt cứng — Gói 79k chạy trên trạng thái nào? Ai trigger transition?
* **Hiện trạng Codebase (`apps/api/src/modules/cases/domain/case-machine.ts`):**
  * Tập hợp trạng thái `VALID_STATES` hiện tại chỉ phục vụ quy trình thẩm định thủ công:
    $$\text{triage\_pending} \longrightarrow \text{accepted\_unassigned} \longrightarrow \text{assigned} \longrightarrow \text{supporter\_working} \longrightarrow \text{report\_ready\_to\_publish} \longrightarrow \text{done} \longrightarrow \text{cancelled}$$
  * Khi một Case mới được tạo, trạng thái luôn mặc định là `triage_pending`.
  * Lối thoát duy nhất để rời khỏi `triage_pending` là sự kiện `T5_ACCEPT`, được khóa cứng bởi guard: `isAdmin && hasCredit && hasPaymentComplete`.
  * Sự kiện bàn giao báo cáo `T11_SUBMIT_OUTPUT` bắt buộc guard `isAssignedSupporter`.
* **Xung đột thực tế với Gói 79k (Basic AI):**
  1. Gói 79k được định vị là **"100% máy chấm tức thì sau 1 phút, không có can thiệp con người"**. Nhưng trong `caseMachine`, **hoàn toàn không có trạng thái `ai_evaluating` hay `ai_delivered`**, cũng không có cơ chế rẽ nhánh để bypass Admin hay Supporter.
  2. Sau khi sinh viên thanh toán 79k, nếu Case vẫn nằm ở `triage_pending`, màn hình sinh viên sẽ hiển thị "Đang chờ Admin duyệt", làm phá vỡ hoàn toàn cam kết SLA tức thì.
  3. Khi AI Service chạy xong, tiến trình này lấy tư cách danh tính gì (`actorId`) để gọi transition sang `report_ready_to_publish` khi mà guard chỉ chấp nhận `isAssignedSupporter`?
* **Xung đột với Lượt Quét Lại Lần 2 (Resubmission V2 trong 24h):**
  * Khi sinh viên nhận xong Báo cáo V1, Case chuyển sang `done` hoặc `report_ready_to_publish`.
  * Khi sinh viên bấm "Quét lại bài đã sửa", transition nào cho phép mở lại case để máy quét tiếp?
  * Hiện tại chỉ có sự kiện `T19_REOPEN` đưa trạng thái về `supporter_working` (chờ supporter), hoàn toàn không có đường quay lại cho AI Service.

### 9.2. Tử huyệt 2: Rủi ro Schema "Strong Spine, Flexible Ribs", Cold-Start & Nguy cơ Crash Foreign Key (P2003)
* **Hiện trạng Codebase & Quy tắc An toàn DB (`.agents/rules/prisma-migration-safety.md`):**
  * Target DB của hệ thống là **Supabase PostgreSQL Production**. Quy tắc dự án nghiêm cấm chạy `prisma migrate dev` tự do, cấm mọi lệnh destructive, bắt buộc kiểm soát chặt qua `--create-only`.
  * 3 bảng được đề xuất trong báo cáo (`evaluation_criteria`, `evaluation_indicators`, `case_audit_violations`) **chưa hề tồn tại** trong `prisma/schema.prisma`.
* **3 Lỗ hổng kỹ thuật chí mạng chưa có lời giải:**
  1. **Chưa có Dữ liệu Mồi (Seed Data) thực tế:** Muốn AI đối chiếu được 13 trường của Checkpoint 1, cần tối thiểu bao nhiêu criteria và bao nhiêu indicators? Báo cáo chỉ đưa ra đúng 1 ví dụ minh họa (`IND-01`). Nếu chưa biên soạn danh mục Indicators chuẩn xác, hệ thống lấy gì để seed vào DB?
  2. **Nguy cơ sập Foreign Key (P2003 Constraint Failure) do LLM Ảo giác:**
     * LLM sinh output dạng JSON có chứa mảng vi phạm: `[{ "indicator_id": "...", "severity": "..." }]`.
     * Nếu LLM tự ý sinh ra một mã `indicator_id` không có sẵn trong bảng `evaluation_indicators` (hoặc định dạng sai một ký tự), khi Backend insert vào bảng `case_audit_violations`, PostgreSQL sẽ lập tức ném lỗi vi phạm khóa ngoại (**Foreign Key Violation**) và crash toàn bộ transaction lưu báo cáo!
  3. **Lỗ hổng Khởi động nguội (Cold-Start Problem):**
     * Báo cáo đề xuất cơ chế Fast-Path Screening: *"Agent query Top 3 chỉ báo vi phạm nhiều nhất từ `case_audit_violations` trong < 1ms"*.
     * Nhưng khi hệ thống mới deploy lên production, bảng `case_audit_violations` hoàn toàn rỗng (0 bản ghi). Câu lệnh `GROUP BY` sẽ trả về **0 kết quả**.
     * Chưa hề có cơ chế Fallback tĩnh (Default Hardcoded Top Indicators) để hệ thống hoạt động trong giai đoạn đầu.

### 9.3. Tử huyệt 3: Ngộ nhận giữa "Agent tự query DB siêu tốc" và thực tế Stateless Backend Service
* **Hiện trạng Codebase (`apps/api/src/modules/ai-engine/`):**
  * Kiến trúc AI hiện tại của Nexus chạy trên Hono backend, sử dụng Vercel AI SDK (`generateObject`, `generateText`) để gửi API request sang Google Gemini hoặc OpenAI.
  * Đây là một **Stateless Backend Service**, hoàn toàn không phải một Autonomous Agent chạy vòng lặp ReAct có khả năng tự gọi Tool hay tự query PostgreSQL.
* **Cần chuẩn hóa hợp đồng kỹ thuật (Technical Contract):**
  * Báo cáo dùng văn phong nhân hóa: *"Agent nạp payload vào bộ nhớ làm việc, trong 2 giây đầu tiên đọc bài nộp, Agent đối chiếu ngay..."*. Cách viết này che giấu bản chất thực thi thực tế.
  * Bản chất kỹ thuật bắt buộc phải là một **TypeScript Service Function** tuần tự:
    $$\text{Đọc DB lấy Top Indicators} \longrightarrow \text{Ghép vào System/User Prompt} \longrightarrow \text{Gọi LLM API (1-pass/2-pass)} \longrightarrow \text{Validate JSON} \longrightarrow \text{Lưu DB}$$
  * Các tham số kỹ thuật sống còn chưa được chốt:
    * Sử dụng model nào chính thức (`gemini-2.0-flash` hay `gpt-4o`)?
    * Token budget tối đa là bao nhiêu?
    * Timeout của API call là bao nhiêu giây?
    * Xử lý retry thế nào khi LLM API bị rate limit (429) hoặc gateway timeout (504)?

### 9.4. Tử huyệt 4: Dây nối thanh toán (PR #34 Cutover) vẫn bị khóa cứng vào gói 39k cũ
* **Hiện trạng Codebase (`apps/api/src/modules/orders/application/credit-audit-order.helpers.ts`):**
  * Mặc dù đã merge PR #34 và hoàn thành plan `260906-1225-free-upgrade-after-order`, nhưng toàn bộ mã nguồn bên trong vẫn đang gắn cứng vào gói 39.000đ đã bị vô hiệu hóa:
    ```typescript
    export const AUDIT_PACKAGE_KEY = "pkg_tf_audit"; // Gói 39k cũ (is_active = false)
    ```
  * Hàm `resolveCreditAuditPrice` chỉ tìm duy nhất gói `pkg_tf_audit`.
  * Endpoint `POST /orders` chỉ nhận `service_type: "credit_audit"`, hoàn toàn không có trường để nhận `target_package_id` (`pkg_ai_audit` 79k hay `pkg_supporter_audit` 149k).
* **Lỗ hổng hợp đồng dữ liệu:**
  * Khi sinh viên bấm chọn gói 79k hoặc 149k, Frontend gửi payload gì lên `POST /orders`?
  * Sau khi SePay bắn Webhook xác nhận tiền vào ví $\rightarrow$ Hệ thống tự trừ tiền trong ví $\rightarrow$ Webhook/Order sẽ gọi Use Case nào để khởi chạy tiến trình AI Audit? Hiện tại chưa hề có Use Case này.

### 9.5. Tử huyệt 5: Hạn mức Vòng đời (Resubmission Quota 24h) chưa có nơi lưu trữ vật lý trong Schema
* **Hiện trạng Codebase:**
  * Bảng `Case` hiện tại không có các trường quản lý lượt nộp lại (như `resubmissions_left`, `resubmission_deadline_at`).
  * Bảng `Report` không có trường `version` hay `round` mà chỉ liên kết với `lifecycle_unit_id`.
* **Lỗ hổng quản lý vòng đời tài liệu:**
  * Báo cáo đề ra nguyên lý *"Bên ngoài bán Gói — Bên trong cấp Hạn mức Vòng đời"*, nhưng **chưa chỉ định hạn mức này nằm ở đâu trong Database**:
    * Thêm cột trực tiếp vào bảng `cases`?
    * Hay lưu dưới dạng bản ghi quyền lợi trong `credit_ledgers`?
  * Khi sinh viên nộp bài quét lại lần 2 (V2):
    * Theo tài liệu `LIFECYCLE_IMPLEMENTATION_SPEC.md`, hệ thống phải tạo lifecycle unit `v02` hoặc `a02-v02`.
    * Báo cáo lần 2 sẽ được lưu thành một dòng mới trong bảng `reports` hay ghi đè lên dòng cũ?
    * Nếu tạo dòng mới, làm sao Frontend phân biệt được đâu là Báo cáo Lần 1 và đâu là Báo cáo Lần 2 để hiển thị màn hình so sánh điểm số tiến bộ?

### 9.6. Tử huyệt 6: Lỗ hổng vận hành Gói 149k (Thiếu Auto-assign Supporter & Giới hạn Chat 24h)
* **Hiện trạng Codebase:**
  * Hệ thống hoàn toàn không có cơ chế Tự động phân bổ Supporter (Auto-assignment). Hiện tại phụ thuộc 100% vào việc Admin đăng nhập thủ công để bấm gán qua `T6_ASSIGN_SUPPORTER`.
  * Bảng `CaseMessage` không có trường phân loại câu hỏi hay đếm số lượt tin nhắn của sinh viên.
* **Lỗ hổng quy trình vận hành:**
  1. **Nghẽn cổ chai Admin:** Nếu sinh viên thanh toán gói 149k vào ban đêm mà Admin không online để gán Supporter, hồ sơ sẽ bị treo vô thời hạn. SLA 24h-48h bắt đầu tính từ thời điểm nào (lúc thanh toán hay lúc supporter nhận bài)?
  2. **Thực thi Luật Chat 24h & 3 câu hỏi:** Báo cáo đặt ra luật: *"Nhóm được gửi tối đa 3 câu hỏi, mỗi câu $\le 500$ ký tự trong vòng 24 giờ"*. Chưa có logic kiểm tra số lượng câu hỏi trong `send-message.usecase.ts`.
  3. **Giao diện Supporter Editor:** Khi Supporter vào xem bản nháp của AI, họ sửa đổi trực tiếp vào nội dung Markdown hay sửa qua các ô nhận xét có cấu trúc? Chưa có đặc tả UI cho Supporter Dashboard của gói 149k.

### 9.7. Tử huyệt 7: Công thức tính điểm cơ học (Deterministic Scoring) cào bằng trọng số 13 trường
* **Lỗ hổng toán học trong Mục 6.2:**
  $$\text{Điểm ban đầu} = \left(\frac{\text{Số trường Good enough}}{13}\right) \times 100$$
  * Công thức này ngầm định **tất cả 13 trường đều có tầm quan trọng ngang nhau (tỷ trọng 1:1)**.
  * **Nghịch lý thực tế môn EXE101:** Trường "Tên ý tưởng" (Idea name) hay "Câu chuyện khách hàng" (Customer story) không thể có trọng số tương đương với "Khách hàng mục tiêu" (Target customer), "Nỗi đau thực tế" (Pain point), hay "Mô hình kinh doanh" (Business model).
  * Một bài nộp viết tên ý tưởng rất kêu, câu chuyện rất cảm động (được tính 2 trường Good enough) nhưng sai lệch hoàn toàn về khách hàng mục tiêu và giải pháp thì không thể được cộng điểm tương đương với một bài làm tốt phần khách hàng mục tiêu.
  * Bắt buộc phải thiết lập **Bảng trọng số (Weight Matrix)** cho từng trường trong 13 trường thay vì tính trung bình cộng cào bằng.
  * Chưa có file schema Zod chuẩn để validate dữ liệu đầu ra từ LLM trước khi đưa vào hàm tính điểm.

---

## 10. BẢNG ĐỐI CHIẾU ĐÃ ĐỦ VS. CÒN THIẾU & 3 QUYẾT ĐỊNH CỐT LÕI CHO PHIÊN TIẾP THEO

### 10.1. Bảng Đối Chiếu Hiện Trạng Brainstorm

| Thành phần | Trạng thái trong Brainstorm | Đã đủ lên Plan chưa? | Việc cụ thể cần giải quyết dứt điểm |
| :--- | :---: | :---: | :--- |
| **1. Định vị 2 Gói (79k / 149k)** | Đã chốt rõ ràng, logic thực tế vững | **ĐỦ** | Sẵn sàng chuyển giao cho Copywriting & UI Pricing Cards. |
| **2. State Machine Cases** | Chưa thiết kế luồng rẽ nhánh cho AI | **THIẾU** | Mở rộng `caseMachine`: bổ sung trạng thái AI tự động và luồng nộp lại V2. |
| **3. Database Criteria & Indicators** | Mới có ý tưởng schema cơ bản | **THIẾU** | Biên soạn danh mục seed ban đầu; xử lý fallback Cold-start; giải pháp chống lỗi FK. |
| **4. AI Engine Pipeline** | Mới có tên gọi các file prompt | **THIẾU** | Viết spec kỹ thuật cho TypeScript Service, chốt model, token, và Zod schema. |
| **5. Dây nối PR #34 sang 79k/149k** | Đang bị khóa cứng vào gói 39k cũ | **THIẾU** | Refactor `credit-audit-order.helpers.ts` và `POST /orders` để nhận động `package_id`. |
| **6. Lưu trữ Hạn ngạch 24h** | Mới là khái niệm trừu tượng | **THIẾU** | Chỉ định chính xác tên bảng, tên cột trong schema để lưu hạn ngạch 1 lần quét lại. |
| **7. Quản trị Supporter & Chat 149k** | Mới có luật nghiệp vụ trên giấy | **THIẾU** | Thiết kế cơ chế hàng chờ/auto-assign Supporter; thêm logic đếm 3 tin nhắn chat. |
| **8. Trọng số chấm điểm** | Cào bằng 13 trường (1/13) | **THIẾU** | Thiết lập bảng trọng số (%) thực tế cho 13 trường Checkpoint 1 FPT EXE101. |

### 10.2. 3 Quyết Định Cốt Lõi Cần Tech Lead Chốt Để Hoàn Thiện Brainstorm

Để bản brainstorm này đủ độ hoàn thiện và chuyển hóa thành Implementation Plan chuẩn xác, phiên làm việc tiếp theo cần tập trung giải quyết 3 bài toán sau:

1. **Quyết định về State Machine:**
   * *Phương án A:* Mở rộng trực tiếp `case-machine.ts` hiện tại, thêm các trạng thái mới (`ai_evaluating`, `ai_completed`) và các transition riêng cho gói AI.
   * *Phương án B:* Tách riêng một State Machine phụ (Sub-machine / Automated Pipeline) dành riêng cho các Case thuộc gói AI thuần túy, giữ nguyên `case-machine.ts` gốc cho các Case có Supporter người thật.
2. **Quyết định về Lưu trữ Bộ Tiêu chí & Chỉ báo (Criteria & Indicators):**
   * *Phương án A (An toàn tuyệt đối cho DB):* Giai đoạn 1 lưu bộ Indicators dưới dạng **File cấu hình TypeScript/JSON tĩnh** trong mã nguồn (`apps/api/src/modules/ai-engine/config/`). AI service đọc thẳng từ code, không sợ lỗi Foreign Key, không cần migration trên Supabase.
   * *Phương án B (Lưu hoàn toàn trong DB):* Thực hiện Prisma Migration thêm 3 bảng `evaluation_criteria`, `evaluation_indicators`, `case_audit_violations`, chấp nhận độ phức tạp của việc seed dữ liệu và xử lý bắt lỗi runtime.
3. **Quyết định về Vị trí Lưu Hạn Mức Nộp Lại 24H (Resubmission Quota):**
   * *Phương án A:* Bổ sung trực tiếp 2 cột vào bảng `cases`: `resubmissions_left Int @default(0)` và `resubmission_deadline_at DateTime?`.
   * *Phương án B:* Quản lý thông qua cơ chế đếm số lượng bản ghi `lifecycle_units` loại `version` gắn với Checkpoint hiện tại của Case (nếu đã có `v02` thì khóa không cho nộp tiếp).


---
*Báo cáo được chuẩn hóa và niêm phong đầy đủ toàn bộ ngữ cảnh kỹ thuật, kinh doanh và dữ liệu thực tế từ buổi làm việc.*
