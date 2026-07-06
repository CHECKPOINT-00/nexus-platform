# Functional Requirement: Case Workspace and Status

## 1. Document info

- Feature ID: F02
- Trạng thái: đang làm việc
- PRD reference: [`../prd/core-product-prd.md`](../prd/core-product-prd.md)
- Flow reference: [`../flows/case-lifecycle-flow.md`](../flows/case-lifecycle-flow.md)

## 2. Traceability

- Business reason: giu report, tai lieu, va lich su vong review trong cung mot noi de user va supporter khong mat boi canh.
- Target customer: user, supporter, admin.
- User problem: khong thay duoc case dang o dau, report nao dang co hieu luc, va can lam gi tiep theo.
- Product behavior: moi case co workspace rieng, status ro, document board, report panel, va timeline.
- Related user story: user can mo case va thay report moi nhat; supporter can mo case va thay lich su lien quan.
- Related acceptance criteria: case workspace hien du stage hien tai, next action, document board, va report dang co hieu luc.

## 3. Scope

### In scope

- user case workspace
- status badge va next action card
- document board
- report panel
- timeline toi thieu
- supporter/admin case detail
- history theo round

### Out of scope

- analytics dashboard sau
- chat realtime day du

## 4. Actors

- Primary actor: user
- Secondary actor: supporter, admin

## 5. Trigger

- Case duoc tao, duoc mo lai, hoac duoc nang cap sang round moi.

## 6. Inputs

- du lieu intake
- artifacts da upload/publish
- supporter actions
- admin actions
- revision submissions

## 7. Outputs

- case workspace cap nhat
- document board cap nhat
- next action cap nhat
- lich su round duoc giu

## 8. Processing rules

### Main behavior

- Workspace phai uu tien report va next action, khong phai metadata ky thuat.
- Document board la noi user xem tai lieu va report theo ngu canh.
- Report moi nhat phai duoc noi bat ro.
- User-facing labels phai de hieu hon naming ky thuat noi bo.

### Validation rules

- User chi thay case cua minh.
- Internal note va artifact noi bo khong duoc lo ra ngoai.
- Report dang co hieu luc phai duoc danh dau ro.

### Business rules

- Mot case co nhieu round, khong tao case moi cho moi vong sua.
- Khong ghi de report cu; report cu chi tro thanh lich su.
- User luon thay next action.
- Phase 1 khong co tab hoi dap tu do trong case.

## 9. User stories

- As a user, I want one place to see all reports and related documents, so that I do not search across chat or file links.
- As a user, I want to know exactly what step comes next, so that I can move the case forward.
- As a supporter, I want to open a case and immediately see its current round and history, so that I do not lose context.

## 10. UI structure

### User case workspace

- header thong tin case
- status badge
- next action card
- report panel
- document board
- timeline panel

### Supporter/admin case detail

- summary panel
- document preview
- actions panel
- internal notes

## 11. Error and edge cases

- Case: case thieu du lieu sau khi da tao.
  Expected behavior: workspace hien ro dang cho user bo sung.

- Case: user dung lai sau khi nhan report va khong tiep tuc.
  Expected behavior: case duoc dong co ly do ro ma khong xoa lich su.

## 12. Acceptance criteria

- [ ] Moi case co workspace rieng.
- [ ] User thay duoc stage hien tai va next action.
- [ ] Workspace co report panel va document board ro rang.
- [ ] Report moi nhat duoc noi bat ro.
- [ ] Lich su round duoc giu trong he thong.
- [ ] Supporter/admin mo case va thay duoc boi canh can thiet.

## 13. Missing / unclear (Quyết định đã khóa)

- Không có tab hỏi đáp tự do trong case ở phase 1.
- Quy chuẩn hóa nhãn trạng thái thân thiện với người dùng (User-facing stage labels) và quy tắc hiển thị tiến trình.

## 14. Thiết kế Tiến trình & Phân tách Trạng thái (Redesign)

### 14.1 Phân tách Trạng thái Case và Trạng thái Thanh toán (Decoupled Status)
Để tránh tạo ra sự phụ thuộc giả (Gatekeeper) trên tiến trình nghiệp vụ chuyên môn, hệ thống tách biệt hoàn toàn hai luồng hiển thị:
- **Tiến trình nghiệp vụ (Case Pipeline Stepper):** Được hiển thị thông qua component `CasePipelineStepper` (Mantine Stepper) gồm 6 bước cố định, đại diện cho lộ trình chuyên môn chuyên nghiệp (`user_facing_stage`).
- **Trạng thái Thanh toán (Payment Status Alert):** Không nằm trong các bước của Stepper. Khi chưa thanh toán hoặc cần xác nhận gói, hệ thống hiển thị biểu tượng cảnh báo ⚠️ trên `CaseCard` và banner cảnh báo nổi bật (`UnpaidAlertBanner`/`TabPayment` hoặc Drawer tương ứng) trong Case Workspace để thúc đẩy hành động mà không che khuất tiến trình phản biện thực tế.

### 14.2 6 Bước của Case Pipeline Stepper
Tiến trình chuyên môn của học viên trải qua 6 bước (tương ứng với `PIPELINE_STAGES`):
1. **Gửi hồ sơ (`intake`):** Áp dụng khi case vừa được tạo và gửi đi (`submitted`).
2. **Tiếp nhận (`confirm`):** Admin phê duyệt tiếp nhận hồ sơ (`triage_accepted`).
3. **Phản biện (`review`):** Supporter đang tiến hành đọc hiểu và chuẩn bị phản biện (`under_review`, `need_more_information`).
4. **Báo cáo (`report`):** Báo cáo phản biện đã được duyệt và xuất bản (`report_ready`).
5. **Sửa bài (`revision`):** Nhóm nhận báo cáo phản biện và tiến hành sửa bài (`waiting_for_revision`, `revision_submitted`). Hỗ trợ vòng lặp sửa bài (Revision Loop) hiển thị số vòng thực tế: `Sửa bài (Vòng X)` nếu `version >= 2`.
6. **Hoàn thành (`done`):** Hoàn tất toàn bộ quy trình (`completed`, `closed`).

*Lưu ý:* Trường hợp hồ sơ bị từ chối (`rejected`), Stepper sẽ chuyển sang trạng thái cảnh báo màu đỏ (`red`) tại bước **Tiếp nhận** với biểu tượng lỗi `✕`.

### 14.3 Hệ thống Màu sắc Học thuật & Hành động (Semantic Color System)
Hệ thống sử dụng các màu sắc trực quan (đạt chuẩn tương phản A11y) để chỉ rõ đối tượng cần thực hiện hành động tiếp theo:
- 🔵 **Màu Xanh lam (Primary/Info):** Chờ hành động từ phía hệ thống hoặc Supporter (ví dụ: `submitted`, `under_review`, `revision_submitted`, `proof_submitted`).
- 🟠 **Màu Cam/Amber (Warning):** Chờ hành động từ phía **Học viên** (ví dụ: `need_more_information`, `waiting_for_revision`, `unpaid`, `awaiting_confirmation`). Màu Cam được nâng cấp từ Vàng để tối ưu độ tương phản văn bản.
- 🟢 **Màu Xanh lục (Success):** Trạng thái hoàn thành hoặc đã xác minh thành công (ví dụ: `report_ready`, `completed`, `closed`, `paid`, `not_required`).
- 🔴 **Màu Đỏ (Danger):** Trạng thái bị chặn, từ chối hoặc hết hạn (ví dụ: `rejected`, `expired`).
- 🔘 **Màu Xám (Muted/Default):** Bản nháp hoặc trạng thái nháp (`draft`, `refunded`, `triage_pending`).

