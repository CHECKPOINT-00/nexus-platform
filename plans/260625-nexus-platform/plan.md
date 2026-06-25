---
title: "Nexus Platform Implementation Plan"
description: "Xây dựng hệ thống Nexus phản biện ý tưởng khởi nghiệp sử dụng Hono API và Next.js + HeroUI v3."
status: pending
priority: P2
effort: 24h
branch: main
tags: [feature, backend, frontend, database, auth]
created: 2026-06-25
---

# Nexus Platform Implementation Plan

Tài liệu tổng quan kế hoạch xây dựng hệ thống Nexus. Mỗi phase chi tiết được thiết lập trong các file phase riêng biệt.

## Phases

| # | Phase | Status | Effort | Detail Link |
|---|---|---|---|---|
| 1 | Database & Core API Setup | Completed | 3h | [Phase 1](./phase-01-database-api-setup.md) |
| 2 | Auth & Layout Setup | Pending | 2h | [Phase 2](./phase-02-auth-layout-setup.md) |
| 3 | Landing & Packages | Pending | 2h | [Phase 3](./phase-03-landing-packages.md) |
| 4 | Conversational Intake | Pending | 4h | [Phase 4](./phase-04-conversational-intake.md) |
| 5 | AI Engine & Reports | Pending | 4h | [Phase 5](./phase-05-ai-engine-reports.md) |
| 6 | Workspaces | Pending | 5h | [Phase 6](./phase-06-workspaces.md) |
| 7 | Manual Payments | Pending | 2h | [Phase 7](./phase-07-manual-payments.md) |
| 8 | E2E Verification | Pending | 2h | [Phase 8](./phase-08-e2e-verification.md) |

## Core Dependencies
1. **Database Schema** -> Phải migrated trước khi phát triển backend routes.
2. **Better Auth** -> Phải được thiết lập ở cả API và Web trước khi xây dựng Workspaces.
3. **OpenAI Key** -> Cần thiết cho luồng AI audit ở Phase 5.

## Validation Log

### Session 1 — 2026-06-25
**Trigger:** Initial plan validation
**Questions asked:** 4

#### Questions & Answers

1. **[Architecture]** How should Google Drive documents be integrated in the MVP?
   - Options: (Recommended) Chỉ gắn link Google Drive URL do người dùng cung cấp vào database, không kết nối API ở MVP. | Tích hợp trực tiếp Google Drive API (OAuth/Service Account) để upload file trực tiếp từ giao diện. | Lưu trữ file trực tiếp trên Local Storage của server / database và bỏ qua Google Drive.
   - **Answer:** (Recommended) Chỉ gắn link Google Drive URL do người dùng cung cấp vào database, không kết nối API ở MVP.
   - **Rationale:** Giảm thiểu độ phức tạp tích hợp OAuth/Google API trong MVP, giúp ra mắt sản phẩm nhanh hơn.

2. **[Scope]** Khung giá và thông tin các gói dịch vụ nên được cấu hình ở đâu?
   - Options: (Recommended) Cấu hình động trong database để admin dễ dàng điều chỉnh giá và gói cước. | Cấu hình tĩnh trong code/config file để triển khai nhanh nhất.
   - **Answer:** (Recommended) Cấu hình động trong database để admin dễ dàng điều chỉnh giá và gói cước.
   - **Rationale:** Dễ dàng thay đổi các gói pricing của dự án linh hoạt từ phía admin panel mà không cần deploy lại code.

3. **[Architecture]** Hệ thống phản biện AI nên sử dụng mô hình LLM nào mặc định?
   - Options: (Recommended) Sử dụng OpenAI models (gpt-4o / gpt-4o-mini) với OPENAI_API_KEY có sẵn. | Sử dụng Gemini models qua Gemini API. | Hỗ trợ đa nhà cung cấp (OpenAI + Gemini) để backup.
   - **Answer:** Hỗ trợ đa nhà cung cấp (OpenAI + Gemini) để backup.
   - **Rationale:** Tránh rủi ro bị block limit hoặc downtime API của một provider cụ thể bằng cơ chế backup luân phiên.

4. **[Scope]** Thời gian cam kết (SLA) phản hồi cho mỗi case của supporter nên là bao nhiêu?
   - Options: (Recommended) Mặc định 24h - 48h và hiển thị bộ đếm ngược trên dashboard. | Mặc định 72h để supporter có thêm thời gian xử lý. | Không áp dụng SLA ở MVP.
   - **Answer:** (Recommended) Mặc định 24h - 48h và hiển thị bộ đếm ngược trên dashboard.
   - **Rationale:** Đáp ứng đúng tốc độ nộp checkpoint của sinh viên, tăng tính trải nghiệm cam kết của dịch vụ.

#### Confirmed Decisions
- Google Drive: Chỉ lưu URL link.
- Pricing/Packages: Lưu động trong database.
- AI Models: Hỗ trợ cả OpenAI và Gemini qua Vercel AI SDK. Ưu tiên Gemini (`GEMINI_API_KEY`, `GEMINI_MODEL_LLM`) cho chatbot và phản biện chính. Dùng OpenAI làm dự phòng với `V98_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL_LLM`.
- SLA: Mặc định 24h - 48h kèm đếm ngược.

#### Action Items
- [ ] Cập nhật Phase 5 để hỗ trợ cả OpenAI và Gemini provider qua Vercel AI SDK.
- [ ] Cập nhật Phase 6 để hiển thị bộ đếm ngược SLA trên dashboard.

#### Impact on Phases
- Phase 5: Hỗ trợ đa nhà cung cấp OpenAI + Gemini làm backup.
- Phase 6: Hiển thị bộ đếm ngược SLA 24h - 48h trên dashboard supporter.

