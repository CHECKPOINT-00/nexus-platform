# TÓM TẮT

# **Tóm tắt Tài liệu Nexus CP1 & CP2**

## **PHẦN A — CHECKPOINT 1: Ý TƯỞNG**

**Ý tưởng:** Nexus là dịch vụ hỗ trợ các team sinh viên FPT học EXE101 kiểm tra, làm rõ và refine ý tưởng khởi nghiệp cho Checkpoint 1\. Nexus **không chọn ý tưởng thay** và **không làm bài thay** sinh viên — vai trò là phản biện có cấu trúc, không phải làm hộ.

**Khách hàng mục tiêu:**

- Team sinh viên FPT đang học EXE101, rơi vào 1 trong các trạng thái: chưa có idea, có idea mơ hồ, có nhiều idea chưa biết chọn, hoặc đã rớt CP1 và còn cơ hội sửa lại.
- Người trực tiếp làm việc với Nexus: Leader/Project Manager/người phụ trách idea & business của team.
- Phân vai:
  - **User** \= người trao đổi trực tiếp;
  - **Customer** \= cả team;
  - **Payer** \= cả team (chia tiền, cử người đại diện trả);
  - **Partner** \= chưa có vai trò chính thức ở giai đoạn này.
- Chưa ưu tiên: sinh viên ngoài FPT, startup đã có sản phẩm, team EXE201, hoặc team muốn AI làm thay toàn bộ.

**Câu chuyện khách hàng (case Minh):** Leader một team 6 người rớt CP1, nhận feedback từ giảng viên nhưng không rõ lỗi gốc nằm ở đâu, mỗi thành viên đề xuất hướng sửa khác nhau, hỏi ChatGPT/bạn bè vẫn rời rạc → minh hoạ đúng pain point cốt lõi.

**Pain point chính:**

- Team thiếu quy trình có cấu trúc để chọn & kiểm tra tính khả thi của idea trước CP1.
- Sau feedback từ giảng viên, vẫn không biết lỗi gốc nằm ở đâu và nên sửa phần nào trước.
- Giảng viên quản lý hơn 100 nhóm nên phản hồi thường chậm, ngắn, không đủ chi tiết → sinh viên dễ "sa lầy" trong sửa bài mà không rõ hướng.
- Vấn đề đủ đau vì CP1 là nền tảng của cả môn học — sai từ đây kéo theo lỗi ở các checkpoint sau.

**Cách khách hàng đang giải quyết hiện tại** (và điểm yếu): hỏi ChatGPT (chung chung, phụ thuộc và kĩ năng prompting) → hỏi bạn bè/khoá trước (phụ thuộc kinh nghiệm cá nhân, thiếu nhất quán) → xem tài liệu mẫu (chỉ học được hình thức, không hiểu lý do, không giải quyết được chính xác vấn đề của nhóm đang gặp) → tự họp nhóm sửa cảm tính (tốn thời gian, không ai chắc là sửa đúng hướng hay không) → chờ feedback giảng viên (đến muộn) → tìm người có kinh nghiệm hỗ trợ trực tiếp (chất lượng không ổn định).

**Nexus phải vượt trội ở 5 điểm:** phát hiện lỗi gốc nhanh hơn, phản hồi có cấu trúc và thứ tự ưu tiên hơn, giúp sửa đúng hướng hơn, tiết kiệm thời gian khi deadline gấp, có người theo sát nhiều vòng.

**Giải pháp / Cơ chế hoạt động:**

- Input: tài liệu ý tưởng, thông tin team & năng lực, tình trạng hiện tại, feedback giảng viên (nếu có).
- Bước 1 — **Audit độ rõ ràng đầu vào**: phát hiện khách hàng mục tiêu mơ hồ, pain point chưa rõ, phát hiện thiếu thông tin về giải pháp thay thế mà khách hàng đang dùng (current alternative), trộn vai trò...
- Bước 2 — **Kiểm tra logic thực tế & tính khả thi**: idea có vượt năng lực team không, MVP có quá lớn không, team có đang chọn domain mình chưa hiểu không (nếu cần chuyên môn sâu, Nexus yêu cầu team tìm chuyên gia, không tự đánh giá thay).
- Output: report có cấu trúc (lỗi nghiêm trọng/lỗi nên sửa/câu hỏi bắt buộc/hướng điều chỉnh/tiêu chí dừng vòng sửa).
- Re-audit liên tục sau mỗi lần team sửa.

**Tính năng lõi bản đầu:** tiếp nhận tài liệu & tình trạng team, template viết ý tưởng, audit độ rõ ràng, re-audit, kiểm tra logic thực tế, gợi ý hướng điều chỉnh, hỗ trợ trao đổi nhiều vòng, demo công cụ nội bộ (một phần).

**Không làm ở giai đoạn đầu:** không chọn idea thay, không viết báo cáo thay, không cam kết chắc đậu, chưa phục vụ toàn bộ EXE101/EXE201, chưa có web app hoàn chỉnh tự vận hành, không làm kho idea để copy, không thay chuyên gia domain, không xử lý mâu thuẫn nội bộ team.

**MVP (Concierge MVP):**

- Giả định nguy hiểm nhất cần test: team (đặc biệt team rớt CP1) **có sẵn sàng trả phí** không.
- Vận hành: dịch vụ thủ công qua Zalo/Telegram, dùng người \+ AI (ChatGPT Plus) \+ bộ prompt nội bộ \+ template.
- Test dự kiến: 5–10 team, ưu tiên nhóm đã rớt CP1.
- Tiêu chí Pass: ≥70% thấy report chỉ ra lỗi họ chưa thấy; ≥50% thật sự sửa lại tài liệu; ≥50% thấy rõ ràng/dễ hành động hơn ChatGPT/bạn bè; ≥30% thể hiện willingness-to-pay.
- Tiêu chí Fail & hướng học: nếu team không hiểu/không sửa được/không khác biệt so với ChatGPT/không sẵn sàng trả tiền → cần điều chỉnh cách viết report, quy trình audit, hoặc nhóm khách hàng ưu tiên.

**Bằng chứng ban đầu (9 team đã hỗ trợ thật, do giảng viên chuyển đến):**

- Lỗi lặp lại: khách hàng mục tiêu chưa rõ, pain point "tưởng tượng", tài liệu quá sơ sài, solution/MVP quá sức team, chọn domain chưa đủ hiểu biết.
- Kết quả: từ \~3–4/10 điểm ở CP1 → sau hỗ trợ (3–4 vòng audit/sửa) đạt **≥8/10** khi nộp lại.
- Vận hành: người khác dùng cùng quy trình có thể đạt \~80% chất lượng so với người xây quy trình.
- Doanh thu: **chưa có dữ liệu trả tiền thật** (9 case đều miễn phí, do giảng viên chuyển đến); tín hiệu phỏng vấn cho thấy mức chấp nhận ước tính 100.000–300.000 VNĐ/team.

**5 giả định quan trọng cần kiểm chứng tiếp ở CP2:** (1) team rớt CP1 có pain đủ mạnh để trả tiền; (2) team nộp CP1 lần đầu có đủ nhu cầu không; (3) quy trình có lặp lại được bởi người khác không; (4) report chỉ lỗi \+ hướng sửa là giá trị cốt lõi đủ mạnh; (5) mức giá 100k–300k có hợp lý không.

**Mô hình doanh thu dự kiến:**

- Payer: cả team, thu theo nhóm.
- 3 gói: **Audit một lần** (100k), Audit \+ **Review lại** — gói lõi (200k), **Hỗ trợ nhiều vòng** (300k+).
- Thanh toán: ưu tiên mô hình chia rủi ro (đặt cọc trước, trả phần còn lại sau report đầu/khi xong), tránh hoàn toàn trả-sau-khi-đậu vì kết quả CP1 không nằm hoàn toàn trong kiểm soát của Nexus.
- Chi phí vận hành chính giai đoạn này: ChatGPT Plus (\~20 USD/tháng) \+ thời gian con người (chi phí lớn nhất thực chất).

---

## **PHẦN B — CHECKPOINT 2: NGHIÊN CỨU THỊ TRƯỜNG**

**Mục tiêu nghiên cứu:** Kiểm tra xem vấn đề Nexus giải quyết có thật tồn tại không, sinh viên đang tự xử lý ra sao, vì sao chưa đủ, và phần nào của Nexus được đánh giá cao nhất.

**Phương pháp:** Phỏng vấn sâu bán cấu trúc — **25 cuộc phỏng vấn trực tiếp** (9 team đã dùng Nexus \+ 16 team chưa dùng), mỗi cuộc 15–30 phút. Phạm vi: sinh viên EXE101 tại FPT, giai đoạn CP1 — kết quả dùng để kiểm tra beachhead customer, chưa đại diện toàn thị trường.

**Findings chính từ phỏng vấn:**

- 15/25 case nhắc khó khăn về pain point/customer/USP → khách hàng muốn được chỉ lỗi cụ thể, không cần lời khuyên chung.
- 21/25 case nhắc giới hạn của ChatGPT (chung chung, phụ thuộc prompt, thiếu bối cảnh EXE101).
- 10 case cần nhu cầu review lại sau khi sửa.
- Lỗi tính khả thi lặp lại: solution quá rộng, MVP quá lớn, chọn lĩnh vực chưa đủ hiểu biết.
- 18 case nhắc đến yếu tố **niềm tin** — cần sample report, case trước/sau để giảm rào cản. _(Ghi chú: sản phẩm mẫu trước \- sau, dùng để so sánh nhằm xác định giá trị nexus có thể mang lại, từ đó quyết định có thuê nexus không.)_
- 18 case cho thấy nhu cầu tăng mạnh khi gần deadline hoặc sau feedback xấu.
- 12 case đánh giá cao việc được theo sát nhiều vòng.
- CP1 được xem là "gốc rễ" của cả môn học.

**4 Pain Points chính được xác định:**

1. Không biết lỗi gốc nằm ở đâu.
2. Không biết nên sửa phần nào trước (thiếu thứ tự ưu tiên).
3. Ý tưởng thường quá rộng, quá khả năng thực thi so với năng lực thực tế.
4. Không chắc bản sửa đã đủ ổn để tiếp tục.

**Customer Insight:** Sinh viên không thiếu nguồn hỗ trợ, mà thiếu cách xác định lỗi gốc, ưu tiên hướng sửa, và kiểm tra lại sau khi sửa — đúng trong bối cảnh CP1.

**Ước tính quy mô thị trường:**

| Chỉ số | Phạm vi                          | Quy mô      | Giá trị/năm            |
| :----- | :------------------------------- | :---------- | :--------------------- |
| TAM    | Dự án khởi nghiệp SV cả nước     | 5.635 dự án | 563,5tr – 1,69 tỷ VNĐ  |
| SAM    | Team EXE101 tại FPT HCM          | 678 dự án   | 67,8 – 203,4 triệu VNĐ |
| SOM    | Khả năng phục vụ thực tế năm đầu | 30–45 dự án | 3 – 13,5 triệu VNĐ     |

**Đối thủ cạnh tranh:**

- **AI tạo sinh** (ChatGPT, Gemini, Claude): nhanh, miễn phí, nhưng thiếu bối cảnh EXE101, dễ "hùa theo" giả định sai của người dùng.
- **Khoá trước/bạn bè/tài liệu cũ**: tạo an tâm nhưng chỉ thấy kết quả cuối, không giải thích logic, chất lượng phụ thuộc từng người.
- **Đối thủ vô hình**: sự trì hoãn, thói quen tự xử lý nội bộ, ưu tiên giải pháp miễn phí.
- **Positioning**: Nexus định vị ở góc "High Context Fit (EXE101) \+ High Quality of Feedback" — khác biệt với AI (low context) và khoá trước/bạn bè (low quality).

**MVP demo (Concierge MVP) — 4 thành phần:** Google Form (thu input) → Google Sheet (quản lý case, các trạng thái New Request → Completed/Lost) → Zalo/Telegram (trao đổi trực tiếp) → Công cụ nội bộ (AI \+ prompt \+ checklist \+ template).

**Quy trình demo (6 bước):**

1. Team gửi yêu cầu qua Google Form.
2. Dữ liệu ghi vào Google Sheet — Nexus xếp mức độ ưu tiên xử lý dựa trên deadline, trạng thái checkpoint và độ thiếu rõ của tài liệu.
3. Nexus đọc tài liệu, yêu cầu bổ sung thông tin nếu còn thiếu.
4. Tạo báo cáo audit: chỉ lỗi gốc, mức độ nghiêm trọng, hướng sửa ưu tiên.
5. Team nhận report qua Zalo/Telegram và tự chỉnh sửa tài liệu.
6. Team gửi bản sửa mới — Nexus re-audit để kiểm tra lỗi cũ đã xử lý chưa và có phát sinh lỗi mới không.

**4 tinh chỉnh sau feedback khách hàng:**

1. Từ web app tự động hoàn toàn _(Ghi chú: ban đầu nhóm dự định làm một web app hoàn toàn tự động và cho khách tự xài, thu phí bằng các limit tính năng, số lần gọi AI. Thu như một subscription)_ → dịch vụ có người theo sát.
2. Từ "gợi ý idea" → "audit và refine idea" có sẵn.
3. Từ report một lần → quy trình nhiều vòng.
4. Từ phục vụ mọi sinh viên → ưu tiên team có pain cấp bách.

**Đánh giá PMF (Product-Market Fit):**

- **Định lượng:** team ở ngưỡng rớt (3,5–4,2 điểm) sau hỗ trợ đạt 8,4–8,9 điểm khi nộp lại; 9/9 team sẵn sàng sửa 40–80% nội dung theo gợi ý Nexus.
- **Định tính:** khách hàng phản hồi tích cực, có ý định giới thiệu cho bạn bè/khoá sau, xem Nexus như "mentor đồng hành".
- **Khả năng chi trả:** nhóm rủi ro mất học phí (\~5 triệu) sẵn sàng trả phí cao; mức giá 150k–300k/nhóm được xem là hợp lý.
- **Pivot quan trọng:** từ web-app tự động → concierge service (kết hợp AI \+ con người) để kiểm soát chất lượng phản hồi sát bối cảnh từng nhóm.

**Chiến lược 4Ps:**

- **Product:** audit độ rõ input, kiểm tra logic & tính khả thi, vòng lặp re-audit (lên đến 4–5 lượt), template ý tưởng chuẩn.
- **Price:** mini-audit miễn phí ban đầu → Audit một lần (100k) / Audit \+ Review (200k) / Đồng hành nhiều vòng (300k+) — mức thử nghiệm, chưa cố định.
- **Place:** Messenger/Zalo/Telegram/Google Drive, cộng đồng sinh viên FPT; web-app là hướng phát triển sau, chưa là kênh chính hiện tại.
- **Promotion:** thông điệp "Biết mình sai ở đâu và biết sửa đúng cách" — dùng bằng chứng kết quả thực tế (điểm số nhảy vọt), audit miễn phí ban đầu, WOM từ leader đã thành công, tiếp cận qua cộng đồng Facebook sinh viên FPT.

---

**Tóm gọn 1 câu mỗi phần:**

- **CP1** trình bày _ý tưởng_: ai là khách hàng, pain point gì, Nexus giải quyết bằng cách nào, MVP đầu tiên và bằng chứng ban đầu từ 9 team thật.
- **CP2** trình bày _market research_: xác nhận pain point qua 25 phỏng vấn, định lượng quy mô thị trường (TAM/SAM/SOM), phân tích đối thủ, demo MVP cụ thể, và đánh giá PMF \+ chiến lược 4Ps.
