# Frontend Journey & Gating Research Report

## Scope
Analysis of student UI flows, payment gating notifications, package confirmations, admin/supporter screens, and design rule alignment in the React/Next.js workspace.

## 1. Student Workspace Payment Journey
- **Package Confirmation Stage:** Once a case is accepted by an admin (stage `triage_accepted`), the student will see a new [PackageConfirmationCard.tsx](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/dashboard/case/%5Bid%5D/_components/PackageConfirmationCard.tsx) in their workspace. This prompts them to review and confirm the selected package/pricing.
- **Awaiting Payment & Unpaid Alerts:** After confirmation, the payment window opens (72h duration). The [UnpaidAlertBanner.tsx](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/dashboard/case/%5Bid%5D/_components/UnpaidAlertBanner.tsx) displays the remaining time and links to open the [PaymentDrawer.tsx](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/dashboard/case/%5Bid%5D/_components/PaymentDrawer.tsx).
- **Expiry Notification:** If payment is overdue, the workspace will transition to show [ExpiredPaymentNotice.tsx](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/dashboard/case/%5Bid%5D/_components/ExpiredPaymentNotice.tsx) with instructions on how to re-activate the case (within the 7-day reactivate window) or cancel it to free up their active case slot.

## 2. Gating and Separate Information Spaces (Nexus Design Rules Alignment)
- **Separate original student input from AI feedback / admin status:** The workspace layout will partition:
  - **Left / Main Section:** Original student case details (intake details, documents).
  - **Top Banner / Workspace Header:** Payment and triage status indicators (clean text labels, explicit step notifications).
  - **Right Drawer / Modal:** Verification actions (uploading payment receipt, requesting a refund via a Refund button, and tracking historical transactions).
- **Supporter Hard-Gating:** If `!isPaymentSatisfied`, we will block or disable editing functions in the supporter workspace page ([page.tsx](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/supporter/case/%5Bid%5D/page.tsx)), and also block access to the review creation screen ([review/page.tsx](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/supporter/case/%5Bid%5D/review/page.tsx)) by redirecting back with a warning toast.
- **Mantine UI v9 Constraints:** No custom overlay styling (like manually trying to position modals or drawers with absolute positioning/Tailwind utility classes like `fixed`, `inset-0`, etc.). We will let Mantine UI control modal/drawer portals natively to avoid visual displacement and layering bugs.



## 3. Admin & Supporter Interface
- **Admin Triage & Pricing Proposal:** Admins can accept a case but propose a different pricing package (e.g., if the user chose the wrong tier). This package proposal will be stored as `proposed_package_id` and must be confirmed by the student.
- **Admin Refund Verification:** Admins will have a table to view pending refund requests. To process a refund, the admin must mark it complete by uploading a transfer receipt image and inputting a manual bank transfer reference string.

## Unresolved Questions
- Should the RefundRequestButton be displayed inline under the payment history tab, or as a persistent primary action in the header when the conditions (paid, no supporter assigned) are met?
