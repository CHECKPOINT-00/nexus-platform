# Brainstorm: Landing Page Pricing & FAQ Revisions
**Date:** 2026-07-07
**Status:** Reviewed

---

## 1. Problem Statement & Requirements

SME101 mentor session review identified critical issues on the landing page:
1. **Pricing Package Friction:**
   - Gói 1 (Nhận xét 1 vòng): 149k is too high for a lead product ("sản phẩm dẫn"). Need price reduction to 49k (either fixed or discounted temporarily to ~67%) to capture demand.
   - Gói 3 (Đồng hành nhiều vòng): Endless rounds look greedy and signal lack of confidence in early rounds. Must be hidden.
2. **FAQ Trust Issue:**
   - FAQ Q2: *"Báo cáo của Nexus có đảm bảo tôi sẽ pass checkpoint không? - Không."* direct rejection is too blunt and causes immediate dropoff. Need professional, value-first rephrasing.

---

## 2. Evaluated Approaches

### A. Pricing Structure Changes
- **Approach 1: Hardcode discounted prices on UI.**
  - *Pros:* Simple, instant frontend fix.
  - *Cons:* Drifts if admin edits package prices via `AdminPackagesSettings.tsx` later.
- **Approach 2: Dynamic UI discount badges (Selected).**
  - *Pros:* Fetches dynamic database pricing. Shows original strikethrough price and computed percentage badge (`pkg.previous_price` vs `pkg.price`) if a discount exists. Auto-hides Gói 3 via `is_active: false`.
  - *Cons:* Requires safe property handling on frontend.

### B. FAQ Restructuring
- **Approach 1: Delete pass guarantee question entirely.**
  - *Pros:* Removes controversy.
  - *Cons:* Ignores a major target persona concern (FPT SME101 students).
- **Approach 2: Reframe question and answer to focus on coaching value (Selected).**
  - *Pros:* Addresses doubt constructively, highlights AI-supporter synergy, maintains credibility without overpromising.
  - *Cons:* None.

---

## 3. Final Recommended Solution

1. **Pricing UI (PackagePreview.tsx):**
   - Read `previous_price` from the fetched packages.
   - If `pkg.previous_price && pkg.previous_price > pkg.price`:
     - Show strikethrough value of `previous_price`.
     - Show badge: `Giảm ${Math.round(((previous_price - price) / previous_price) * 100)}%`.
   - Admin will change Gói 1 price to 49,000 VND (from 149,000 VND) via admin dashboard to activate the badge automatically on UI.
   - Gói 3 stays `is_active: false` in DB to be auto-filtered.

2. **FAQ Update (FAQSection.tsx):**
   - Replace Q2:
     - **Old Q:** *"Báo cáo của Nexus có đảm bảo tôi sẽ pass checkpoint không?"*
     - **Old A:** *"Không. Nexus là công cụ phản biện..."*
     - **New Q:** `"Dịch vụ phản biện của Nexus đem lại giá trị gì cho nhóm dự án?"`
     - **New A:** `"Đội ngũ supporter của Nexus gồm các mentor và cựu sinh viên giàu kinh nghiệm, thấu hiểu tường nhận các lỗi phổ biến khiến nhóm dự án SME101 thất bại. Nexus kết hợp cùng AI phản biện để chỉ ra các lỗ hổng lập luận, thiếu sót chứng minh, từ đó giúp bạn khai thác tối đa tiềm lực đề tài và chuẩn bị tốt nhất trước hội đồng."`

---

## 4. Implementation Considerations & Risks
- **Frontend Type Safety:** Ensure `previous_price` is typed as optional/nullable number to avoid crash.
- **Mantine Compatibility:** Styles must match Mantine v9 without introducing raw positioning overlays that break alignment.

---

## 5. Success Metrics
- **CTR Improvement:** Target 25%+ increase in registrations selecting Gói 1.
- **Conversion rate:** Fewer bounce rates on landing page pricing section.

---

## 6. Next Steps & Dependencies
- Create step-by-step implementation plan.
- Modify `apps/web-1/components/landing/FAQSection.tsx`.
- Modify `apps/web-1/components/landing/PackagePreview.tsx` to handle dynamic previous prices.
