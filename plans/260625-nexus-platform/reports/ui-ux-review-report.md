# UI/UX Review Report: Nexus Platform Plan

Date: 2026-06-25
Author: Antigravity UI/UX Specialist
Reference Rules: [frontend-ui-rules.md](../../.agents/rules/frontend-ui-rules.md)
Design System: `ui-ux-pro-max` (Minimal Single Column / Flat Design)

---

## 1. Design System & Typography Integration
Based on the `ui-ux-pro-max` stack guidelines for a calm, professional feedback platform:
- **Typography**: 
  - Headings: **Space Grotesk** (tech, modern, structured)
  - Body: **DM Sans** (clean, readable, calming)
- **Color Palette**:
  - Primary (Indigo): `#6366F1`
  - Secondary (Muted Indigo): `#818CF8`
  - CTA (Emerald): `#10B981`
  - Background (Lavender tint): `#F5F3FF`
  - Text (Deep Indigo): `#1E1B4B`
- **Interactions**: Flat 2D layout, no heavy shadows. Simple hover transitions (150-200ms opacity/color shift). Hover cursor pointer on all cards/clickable containers.

---

## 2. Gaps & Edge Cases Identified (vs. Frontend UI Rules)

### Gap A: Plain Language & Pricing Slogans (Rules 3, 5, 13)
- **Current Plan**: Mentions packages like "Mini-audit", "Audit một lần", etc.
- **UX Requirement**: Avoid English or technical jargon. Translate packages and status tags into plain, action-oriented Vietnamese.
  - *Correction*: Rename plans to:
    - Gói 0: Sàng lọc ý tưởng (Miễn phí)
    - Gói 1: Nhận xét 1 vòng
    - Gói 2: Nhận xét + Sửa đổi (2 vòng)
    - Gói 3: Đồng hành nhiều vòng
  - *CTA buttons*: Ensure only ONE primary button (Emerald) exists per page (e.g. "Gửi ý tưởng" or "Nộp bản sửa"). All others must be secondary.

### Gap B: Conversational Intake Validation (Rules 9, 12, 17)
- **Current Plan**: Basic question steps.
- **UX Requirement**:
  - Show a clear sidebar step indicator so the user knows "where they are".
  - Auto-fill data (like Group No, Checkpoint) and make it explicitly read-only with a message explaining why.
  - If a Google Drive link is invalid or lacks viewer permission, render a helpful error state (e.g. "Không thể đọc liên kết Google Drive. Vui lòng cấp quyền xem cho bất kỳ ai có liên kết").

### Gap C: Separation of Input, Output & Decision in Reports (Rule 15)
- **Current Plan**: Renders report drafts.
- **UX Requirement**:
  - In the Case detail view, separate user input, AI audit draft, and supporter final comments.
  - The AI audit findings must be structured and explainable. No prose walls. Divide into:
    - **Vấn đề (Field)**
    - **Trạng thái (Status)**
    - **Bằng chứng (Evidence)**
    - **Lý do (Reason)**
    - **Câu hỏi làm rõ (Question)**
    - **Hành động tiếp theo (Next Action)**
  - Implement collapsible Accordion sections (HeroUI Accordion) for detailed reports.

### Gap D: Revision & Document Versioning (Rule 14)
- **Current Plan**: Mentions documents and reports.
- **UX Requirement**:
  - Maintain a version selector dropdown or tab for both documents and reports (e.g. Bản tài liệu v01, Bản tài liệu v02).
  - Explicitly show differences or comments linked to each version.

---

## 3. Recommended Actions & Phase Modifications

1. **Phase 2 (Layout)**: Insert breadcrumbs component using HeroUI for clear navigation hierarchy.
2. **Phase 3 (Landing)**: Replace English slogans with direct Vietnamese value propositions.
3. **Phase 4 (Intake)**: Include a validation workflow for Google Drive links (mock permissions verify) and step-by-step progress cards.
4. **Phase 5 (AI Engine)**: Restructure the AI output template to match the Field-Status-Evidence-Reason-Question structure.
5. **Phase 6 (Workspaces)**: Modify the 3-panel workspace middle column to use `<Tabs>` for switching between document versions and their corresponding reports.
6. **Phase 7 (Payments)**: Add rejection reason input form for Admin when marking payment as rejected.
