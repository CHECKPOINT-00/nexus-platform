# Tổng quan Tài liệu Nexus

> Overview business — value proposition, market research, PMF.
> Xem [`structure-map.md`](./structure-map.md) cho cây thư mục + hướng dẫn điều hướng.

## Cấu trúc nhanh

| Khu vực | Mô tả |
|---------|-------|
| `cp1/` | Checkpoint 1 — Ý tưởng: bài nộp, script thuyết trình |
| `cp2/` | Checkpoint 2 — Nghiên cứu thị trường: market research, feedback GV |
| `cp3/` | Checkpoint 3 — Lean Canvas & SWOT |
| `cp4/` | Checkpoint 4 — Tài chính & Pitch Deck: kế hoạch tài chính, pre-writing, script |
| `mentoring/` | Biên bản mentoring: summary & transcript |
| `case-management-manual/` | Tài liệu vận hành thủ công concierge MVP |
| `document-system/` | Quy trình quản lý tài liệu nội bộ |

## Mục lục

- [PHẦN A — Checkpoint 1: Ý tưởng](#phần-a--checkpoint-1-ý-tưởng)
- [PHẦN B — Checkpoint 2: Nghiên cứu thị trường](#phần-b--checkpoint-2-nghiên-cứu-thị-trường)
- [PHẦN C — Checkpoint 3: Lean Canvas & SWOT](#phần-c--checkpoint-3-lean-canvas--swot)
- [PHẦN D — Checkpoint 4: Tài chính & Pitch Deck](#phần-d--checkpoint-4-tài-chính--pitch-deck)
- [PHẦN E — Mentoring](#phần-e--mentoring)
- [Tóm gọn 1 câu mỗi phần](#tóm-gọn-1-câu-mỗi-phần)

---

## **PHẦN A — CHECKPOINT 1: Ý TƯỞNG**

**Ý tưởng:** Nexus hỗ trợ team sinh viên FPT học EXE101 kiểm tra, làm rõ, refine ý tưởng khởi nghiệp cho Checkpoint 1. Nexus **không chọn ý tưởng thay** và **không làm bài thay** sinh viên — phản biện có cấu trúc, không làm hộ.

**Khách hàng mục tiêu:**

- Team sinh viên FPT học EXE101, trạng thái: chưa có idea, idea mơ hồ, nhiều idea chưa biết chọn, rớt CP1 còn cơ hội sửa.
- Người làm việc với Nexus: Leader/Project Manager/phụ trách idea & business.
- Phân vai:
  - **User** — người trao đổi trực tiếp
  - **Customer** — cả team
  - **Payer** — cả team (chia tiền, cử người đại diện trả)
  - **Partner** — chưa có vai trò chính thức
- Chưa ưu tiên: sinh viên ngoài FPT, startup có sản phẩm, team EXE201, team muốn AI làm thay.

**Case Minh:** Leader team 6 người rớt CP1, nhận feedback GV nhưng không rõ lỗi gốc, mỗi thành viên đề xuất hướng khác nhau, hỏi ChatGPT/bạn bè rời rạc → minh hoạ pain point cốt lõi.

**Pain point chính:**

- Team thiếu quy trình có cấu trúc để chọn & kiểm tra tính khả thi của idea trước CP1.
- Sau feedback GV, không biết lỗi gốc ở đâu và sửa phần nào trước.
- GV quản lý >100 nhóm — phản hồi chậm, ngắn, không đủ chi tiết → sinh viên "sa lầy" sửa bài không rõ hướng.
- CP1 là nền tảng cả môn — sai từ đây kéo lỗi checkpoint sau.

**Cách khách hàng giải quyết hiện tại** (điểm yếu): hỏi ChatGPT (chung chung, phụ thuộc prompt) → hỏi bạn bè/khoá trước (phụ thuộc kinh nghiệm, thiếu nhất quán) → xem tài liệu mẫu (học format, không hiểu lý do) → tự họp nhóm sửa cảm tính (tốn thời gian, không chắc hướng) → chờ feedback GV (đến muộn) → tìm người hỗ trợ trực tiếp (chất lượng không ổn định).

**Nexus vượt trội 5 điểm:** phát hiện lỗi gốc nhanh hơn, phản hồi có cấu trúc + thứ tự ưu tiên, giúp sửa đúng hướng, tiết kiệm thời gian, có người theo sát nhiều vòng.

**Giải pháp / Cơ chế hoạt động:**

- Input: tài liệu ý tưởng, thông tin team & năng lực, tình trạng hiện tại, feedback GV (nếu có).
- Bước 1 — **Audit độ rõ ràng đầu vào**: phát hiện khách hàng mục tiêu mơ hồ, pain point chưa rõ, thiếu thông tin current alternative, trộn vai trò.
- Bước 2 — **Kiểm tra logic thực tế & tính khả thi**: idea vượt năng lực team? MVP quá lớn? Chọn domain chưa hiểu? (Nexus yêu cầu tìm chuyên gia, không tự đánh giá thay)
- Output: report có cấu trúc (lỗi nghiêm trọng/lỗi nên sửa/câu hỏi bắt buộc/hướng điều chỉnh/tiêu chí dừng vòng sửa).
- Re-audit sau mỗi lần team sửa.

**Tính năng lõi bản đầu:** tiếp nhận tài liệu & tình trạng team, template viết ý tưởng, audit độ rõ ràng, re-audit, kiểm tra logic thực tế, gợi ý hướng điều chỉnh, hỗ trợ trao đổi nhiều vòng, demo công cụ nội bộ (một phần).

**Không làm giai đoạn đầu:** không chọn idea thay, không viết báo cáo thay, không cam kết đậu, chưa phục vụ toàn bộ EXE101/EXE201, chưa có web app hoàn chỉnh, không làm kho idea copy, không thay chuyên gia domain, không xử lý mâu thuẫn nội bộ team.

**MVP (Concierge MVP):**

- Giả định nguy hiểm nhất: team (đặc biệt rớt CP1) **có sẵn sàng trả phí** không?
- Vận hành: thủ công qua Zalo/Telegram, dùng người \+ AI (ChatGPT Plus) \+ prompt nội bộ \+ template.
- Test: 5–10 team, ưu tiên nhóm đã rớt CP1.
- Tiêu chí Pass: ≥70% thấy report chỉ lỗi chưa thấy; ≥50% thật sự sửa tài liệu; ≥50% thấy rõ ràng/dễ hành động hơn ChatGPT/bạn bè; ≥30% thể hiện willingness-to-pay.
- Tiêu chí Fail + hướng học: nếu team không hiểu/không sửa được/không khác biệt so với ChatGPT/không sẵn sàng trả tiền → điều chỉnh cách viết report, quy trình audit, hoặc nhóm khách hàng ưu tiên.

**Bằng chứng ban đầu (9 team đã hỗ trợ thật, do GV chuyển đến):**

- Lỗi lặp lại: khách hàng mục tiêu chưa rõ, pain point "tưởng tượng", tài liệu sơ sài, solution/MVP quá sức team, chọn domain chưa đủ hiểu biết.
- Kết quả: từ \~3–4/10 điểm CP1 → sau hỗ trợ (3–4 vòng audit/sửa) đạt **≥8/10** khi nộp lại.
- Vận hành: người khác dùng cùng quy trình đạt \~80% chất lượng so với người xây quy trình.
- Doanh thu: **chưa có dữ liệu trả tiền thật** (9 case đều miễn phí, do GV chuyển đến); tín hiệu phỏng vấn cho thấy mức chấp nhận ước tính 100.000–300.000 VNĐ/team.

**5 giả định cần kiểm chứng tiếp ở CP2:** (1) team rớt CP1 pain đủ mạnh để trả tiền; (2) team nộp CP1 lần đầu đủ nhu cầu? (3) quy trình lặp lại được bởi người khác? (4) report chỉ lỗi \+ hướng sửa là giá trị cốt lõi đủ mạnh? (5) mức giá 100k–300k hợp lý?

**Mô hình doanh thu dự kiến:**

- Payer: cả team, thu theo nhóm.
- 3 gói: **Audit một lần** (100k), Audit \+ **Review lại** — gói lõi (200k), **Hỗ trợ nhiều vòng** (300k+).
- Thanh toán: chia rủi ro (đặt cọc trước, trả phần còn lại sau report đầu/khi xong), tránh trả-sau-khi-đậu vì kết quả CP1 không nằm hoàn toàn trong kiểm soát Nexus.
- Chi phí vận hành chính: ChatGPT Plus (\~20 USD/tháng) \+ thời gian con người.

---

## **PHẦN B — CHECKPOINT 2: NGHIÊN CỨU THỊ TRƯỜNG**

**Mục tiêu:** Kiểm tra vấn đề Nexus giải quyết có thật tồn tại? Sinh viên tự xử lý ra sao? Vì sao chưa đủ? Phần nào của Nexus được đánh giá cao nhất?

**Phương pháp:** Phỏng vấn sâu bán cấu trúc — **25 cuộc phỏng vấn trực tiếp** (9 đã dùng Nexus \+ 16 chưa dùng), 15–30 phút/cuộc. Phạm vi: sinh viên EXE101 tại FPT, giai đoạn CP1.

**Findings chính:**

- 15/25 nhắc khó khăn về pain point/customer/USP → muốn được chỉ lỗi cụ thể.
- 21/25 nhắc giới hạn ChatGPT (chung chung, phụ thuộc prompt, thiếu context EXE101).
- 10 case cần review lại sau khi sửa.
- Lỗi tính khả thi: solution rộng, MVP lớn, chọn lĩnh vực chưa hiểu.
- 18 case nhắc **niềm tin** — cần sample report, case trước/sau để giảm rào cản.
- 18 case nhu cầu tăng mạnh gần deadline hoặc sau feedback xấu.
- 12 case đánh giá cao được theo sát nhiều vòng.
- CP1 là "gốc rễ" cả môn.

**4 Pain Points:**

1. Không biết lỗi gốc.
2. Không biết sửa phần nào trước (thiếu thứ tự ưu tiên).
3. Ý tưởng quá rộng so với năng lực.
4. Không chắc bản sửa đủ ổn.

**Customer Insight:** Sinh viên không thiếu nguồn hỗ trợ — thiếu cách xác định lỗi gốc, ưu tiên hướng sửa, kiểm tra lại.

**Quy mô thị trường:**

| Chỉ số | Phạm vi | Quy mô | Giá trị/năm |
| :----- | :------ | :----- | :---------- |
| TAM | Dự án khởi nghiệp SV cả nước | 5.635 dự án | 563,5tr – 1,69 tỷ VNĐ |
| SAM | Team EXE101 tại FPT HCM | 678 dự án | 67,8 – 203,4 triệu VNĐ |
| SOM | Khả năng phục vụ thực tế năm đầu | 30–45 dự án | 3 – 13,5 triệu VNĐ |

**Đối thủ cạnh tranh:**

- **AI tạo sinh** (ChatGPT, Gemini, Claude): nhanh, miễn phí, thiếu context EXE101, dễ "hùa theo".
- **Khoá trước/bạn bè/tài liệu cũ**: an tâm nhưng chỉ thấy kết quả cuối, chất lượng phụ thuộc người.
- **Đối thủ vô hình**: sự trì hoãn, thói quen tự xử lý nội bộ, ưu tiên miễn phí.
- **Positioning**: Nexus ở góc "High Context Fit (EXE101) + High Quality of Feedback" — khác biệt AI (low context) và khoá trước/bạn bè (low quality).

**MVP demo (Concierge MVP) — 4 thành phần:** Google Form (thu input) → Google Sheet (quản lý case, trạng thái New Request → Completed/Lost) → Zalo/Telegram (trao đổi) → Công cụ nội bộ (AI + prompt + checklist + template).

**Quy trình demo (6 bước):**

1. Team gửi yêu cầu qua Google Form.
2. Dữ liệu ghi vào Google Sheet — Nexus xếp ưu tiên theo deadline, trạng thái checkpoint, độ thiếu rõ tài liệu.
3. Nexus đọc tài liệu, yêu cầu bổ sung nếu thiếu.
4. Tạo báo cáo audit: lỗi gốc, mức độ, hướng sửa.
5. Team nhận report qua Zalo/Telegram, tự chỉnh sửa.
6. Team gửi bản sửa mới — Nexus re-audit: lỗi cũ đã xử lý? Có lỗi mới?

**4 tinh chỉnh sau feedback khách hàng:**

1. Web app tự động hoàn toàn → dịch vụ có người theo sát.
2. "Gợi ý idea" → "audit và refine idea".
3. Report một lần → quy trình nhiều vòng.
4. Phục vụ mọi sinh viên → ưu tiên team pain cấp bách.

**Đánh giá PMF:**

- **Định lượng:** team ngưỡng rớt (3,5–4,2 điểm) sau hỗ trợ đạt 8,4–8,9 điểm; 9/9 team sẵn sàng sửa 40–80% nội dung theo gợi ý.
- **Định tính:** phản hồi tích cực, có ý định giới thiệu bạn bè/khoá sau, xem Nexus như "mentor đồng hành".
- **Khả năng chi trả:** nhóm mất học phí (\~5 triệu) sẵn sàng trả phí cao; giá 150k–300k/nhóm hợp lý.
- **Pivot:** web-app tự động → concierge service (AI + con người) để kiểm soát chất lượng sát context.

**Chiến lược 4Ps:**

- **Product:** audit độ rõ input, kiểm tra logic & tính khả thi, 4–5 lượt re-audit, template ý tưởng.
- **Price:** mini-audit miễn phí → Audit 100k / Audit+Review 200k / Đồng hành 300k+.
- **Place:** Messenger/Zalo/Telegram/Google Drive, cộng đồng SV FPT.
- **Promotion:** "Biết mình sai ở đâu và biết sửa đúng cách" — bằng chứng điểm số thật, audit miễn phí, WOM.

---

## **PHẦN C — CHECKPOINT 3: LEAN CANVAS & SWOT**

**Nội dung:** Lean Canvas mô tả mô hình kinh doanh Nexus — vấn đề, giải pháp, KPIs, lợi thế cạnh tranh, kênh tiếp cận, chi phí, doanh thu. Kết hợp SWOT (điểm mạnh/yếu, cơ hội/thách thức).

**Tài liệu tham khảo:**
- [`cp3/cp3-lean-canvas-swot.md`](./cp3/cp3-lean-canvas-swot.md)
- [`cp3/feedback/cp3-lecturer-feedback-transcript.md`](./cp3/feedback/cp3-lecturer-feedback-transcript.md)

---

## **PHẦN D — CHECKPOINT 4: TÀI CHÍNH & PITCH DECK**

**Nội dung:** Kế hoạch tài chính (P&L, dự báo doanh thu, chi phí vận hành) + chuẩn bị pitch deck cho thuyết trình cuối kỳ. Gồm pre-writing, script, hướng dẫn format từ GV.

**Tài liệu tham khảo:**
- [`cp4/pitch-deck-pre-writing.md`](./cp4/pitch-deck-pre-writing.md)
- [`cp4/pitch-deck-presentation-script.md`](./cp4/pitch-deck-presentation-script.md)
- `cp4/Financial Sustainability Plan.pdf`
- `cp4/NEXUS P&L.xlsx`
- [`cp4/instructions/CP4 va PITCH DECK.md`](./cp4/instructions/CP4%20va%20PITCH%20DECK.md)
- [`cp4/instructions/BẢN PITCH DECK.md`](./cp4/instructions/BẢN%20PITCH%20DECK.md)

---

## **PHẦN E — MENTORING**

**Nội dung:** Biên bản các buổi mentoring với GV hướng dẫn. Ghi nhận phản hồi trực tiếp, định hướng điều chỉnh, quyết định quan trọng.

**Tài liệu tham khảo:**
- [`mentoring/mentoring-1-summary.md`](./mentoring/mentoring-1-summary.md)
- [`mentoring/mentoring-1-transcript.md`](./mentoring/mentoring-1-transcript.md)

---

**Tóm gọn 1 câu mỗi phần:**

- **CP1** — _ý tưởng_: khách hàng, pain point, giải pháp, MVP, bằng chứng 9 team.
- **CP2** — _market research_: xác nhận pain point qua 25 interviews, TAM/SAM/SOM, đối thủ, demo MVP, PMF + 4Ps.
- **CP3** — _Lean Canvas & SWOT_: mô hình kinh doanh, phân tích cạnh tranh, chiến lược.
- **CP4** — _tài chính & pitch deck_: kế hoạch tài chính, pre-writing slide, script thuyết trình.
- **Mentoring** — _biên bản hỗ trợ_: phản hồi trực tiếp GV, định hướng, quyết định.
