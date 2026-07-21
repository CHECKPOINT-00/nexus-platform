---
trigger: always_on
---

# Nexus Frontend UI/UX Design Rules v2

## 1. Design Intent

Nexus uses **HeroUI + Tailwind** as the frontend stack.

The interface should feel:

* clear
* focused
* calm
* practical
* trustworthy
* modern
* polished
* slightly creative, but never confusing

Do not copy Material Design components.
Do not copy Google UI directly.
Use Google-like product thinking only: clarity, hierarchy, useful defaults, visible system status, understandable language, and predictable interaction.

HeroUI is the component base, not the design ceiling. Custom layout, composition, spacing, visual rhythm, and product-specific UI patterns are allowed when they improve the experience.

## 2. Rule Priority

Not every rule has the same weight.

Use this priority order:

1. **Non-negotiable rules**: must be followed.
2. **Design principles**: should guide decisions, but can be adapted by screen context.
3. **Pattern suggestions**: examples, not strict requirements.

When two rules conflict, prioritize:

1. User understanding
2. User trust
3. Task completion
4. Accessibility
5. Visual polish
6. Visual creativity

Creativity is allowed when it improves clarity, hierarchy, emotion, or product memorability. Creativity is not allowed when it makes the user slower, confused, or less confident.

## 3. Non-Negotiable Rules

These rules must be followed across the frontend.

### 3.1 AI Output Must Be Explainable

Any AI judgment shown to the user must explain itself.

Do not show unsupported AI conclusions like:

> Pain point chưa rõ.

Instead, each AI finding should include:

* Field: phần nào đang có vấn đề
* Status: loại vấn đề là gì
* Evidence: bằng chứng từ input/tài liệu
* Reason: vì sao bị đánh giá như vậy
* Question: người dùng cần trả lời gì
* Next action: người dùng nên làm gì tiếp theo

If there is not enough evidence, say that evidence is missing. Do not make the AI look certain when the input is weak.

### 3.2 Design for Trust, Not Magic

Do not present Nexus as a magic AI tool.

Avoid claims like:

* “Tối ưu ý tưởng để chắc chắn pass.”
* “AI đảm bảo ý tưởng của bạn tốt hơn.”
* “Tự động sửa toàn bộ bài cho bạn.”

Use trust-building language:

* “Nexus kiểm tra tài liệu theo tiêu chí checkpoint.”
* “Kết quả này là bản phản biện có cấu trúc, cần được xem lại bởi supporter.”
* “AI draft chỉ là bản nháp, không phải quyết định cuối cùng.”

### 3.3 Status Must Be Visible

Important objects must show their status clearly:

* case
* document
* payment
* report
* AI draft
* supporter review
* revision/version

Do not rely on color alone. Always include readable labels.

Example:

* `Chưa thanh toán`
* `Đang phản biện`
* `Cần làm rõ`
* `Đã gửi báo cáo`
* `Bản mới nhất`

### 3.4 Separate Input, Output, and Decision

Keep these layers visually and structurally separated:

1. **Student Input**: what the user submitted
2. **AI Output**: what AI analyzed or drafted
3. **Supporter/Admin Decision**: what a human reviewed, approved, rejected, or sent

Do not mix original user data with AI interpretation.
Do not make users think the AI has already rewritten or approved their work.
Do not expose internal AI drafts to students unless they are approved for student view.

### 3.5 Error States Must Be Actionable

Every error must tell the user:

* what happened
* where it happened
* what to do next

Bad:

> Upload failed.

Better:

> Không thể tải ảnh minh chứng. Hãy kiểm tra định dạng file hoặc thử tải lại.

Bad:

> Something went wrong.

Better:

> Không thể chạy phản biện lúc này. Hãy thử lại hoặc kiểm tra tài liệu đã được cấp quyền xem.

### 3.6 Empty States Must Guide Action

Do not leave blank pages or generic “No data” states.

An empty state should say:

* chưa có gì
* vì sao chưa có
* người dùng nên làm gì tiếp

Example:

> Chưa có dự án phản biện nào. Hãy gửi thông tin ý tưởng và link tài liệu để bắt đầu case đầu tiên.

### 3.7 Accessibility Is Default

The UI must be readable and usable.

Minimum requirements:

* Text is readable.
* Contrast is clear.
* Buttons are easy to click.
* Form fields have labels or clear accessible names.
* Error messages appear near the relevant field.
* Keyboard navigation should not be broken.
* Important states are not communicated by color alone.
* Motion must not be excessive or required to understand the UI.

Do not sacrifice basic accessibility for visual effects.

## 4. Core Design Principles

These principles should guide design decisions, but they are not rigid laws.

### 4.1 Clarity Before Decoration

The interface should be visually polished, but clarity comes first.

Decoration is allowed when it:

* improves hierarchy
* directs attention
* makes the product feel more complete
* helps users understand workflow
* creates trust or confidence

Decoration is not allowed when it:

* competes with the main task
* makes content harder to read
* makes the UI look like a generic AI SaaS template
* adds noise without meaning

Use visual design intentionally.

### 4.2 One Main Job Per Screen

Each screen should have one dominant user goal.

A screen may contain secondary actions, but users should immediately understand what the screen is mainly for.

Examples:

* Landing: understand Nexus and start.
* Auth: sign in or create account.
* Dashboard: see current cases and start a new one.
* Intake: submit project information step by step.
* Case Workspace: understand case status and continue work.
* Supporter Review: inspect, edit, and approve report.
* Admin: process operational tasks quickly.

If a screen has multiple jobs, use hierarchy, sections, tabs, or progressive disclosure to make the main job obvious.

### 4.3 Clear Primary Action Per Context

Avoid multiple competing primary actions in the same context.

This does not mean the entire page can only have one important button. Large pages may have multiple sections, and each section may have its own main action.

Use this rule:

* One primary action per focused task area.
* Avoid placing two equally loud primary buttons side by side.
* Secondary actions should look visually quieter.
* Destructive actions must not look like normal primary actions.

### 4.4 Progressive Disclosure

Show the most important information first.

Preferred order:

1. Current status
2. Main action
3. Summary
4. Key problem or result
5. Evidence/reason
6. Details
7. History/logs

Use expandable areas, drawers, tabs, or detail panels when content is long.

Do not force users to read long blocks before they know what to do.

### 4.5 Familiar Patterns, Product-Specific Execution

Use familiar patterns when they solve the problem well:

* form
* card
* table
* tabs
* drawer
* modal
* accordion
* timeline
* stepper
* toast
* status badge

However, do not let familiar patterns make the UI generic.

It is acceptable to create product-specific compositions, such as:

* a case progress header
* report finding cards
* evidence/reason panels
* revision timeline
* supporter review workspace
* intake guidance flow
* payment status panel

The interaction should feel familiar; the product should not feel visually generic.

### 4.6 Calm but Not Boring

Nexus should feel calm and serious because users are dealing with academic/startup evaluation.

But calm does not mean plain, empty, or visually dead.

The interface may use:

* thoughtful spacing
* subtle depth
* clean typography
* restrained accent colors
* structured cards
* timeline visuals
* product preview blocks
* soft gradients or surfaces
* clear section rhythm
* useful micro-interactions

Avoid:

* excessive animation
* too many glowing effects
* random gradients
* decorative icons everywhere
* every card looking equally important
* dashboard clutter

### 4.7 Reduce User Thinking Load

Do not make users guess what kind of answer is expected.

Bad:

> Mô tả khách hàng mục tiêu.

Better:

> Ai là người trực tiếp gặp vấn đề này? Họ thuộc nhóm sinh viên nào, ở tình huống nào?

Bad:

> Phân tích giải pháp thay thế.

Better:

> Hiện tại họ đang xử lý vấn đề này bằng cách nào nếu chưa dùng Nexus?

Good UX is not only layout. It is also asking the right question at the right time.

### 4.8 Plain Language, Not Marketing Language

UI copy should be direct Vietnamese.

Prefer:

* “Gửi tài liệu”
* “Chạy phản biện”
* “Cần bổ sung”
* “Xem lý do”
* “Xem bằng chứng”
* “Nộp bản sửa”
* “Bản mới nhất”
* “Đã được supporter duyệt”

Avoid:

* “Unlock”
* “Enhance”
* “Transform”
* “Leverage”
* “AI-powered journey”
* “Intelligent innovation platform”

Use English only for technical labels or product terms that are already familiar and useful.

## 5. Screen-Level Guidance

### 5.1 Landing Page

The landing page may be more creative than internal workspace pages.

Goal:

* explain what Nexus does
* build trust
* show the workflow
* show packages/pricing
* answer common questions
* move users toward starting

Allowed:

* editorial layout
* split-screen layout
* product preview mockups
* workflow visualization
* subtle gradients
* visual metaphor for critique/audit/revision
* stronger visual identity

Avoid:

* vague AI SaaS slogans
* overpromising outcomes
* exposing sensitive syllabus details
* making Nexus sound like it does homework for students
* making the page so minimal that it lacks persuasion

Landing copy should be clear, practical, and credible.

### 5.2 Auth

Auth should feel secure, clean, and low-friction.

Allowed:

* simple form
* Google OAuth button if available
* light visual side panel
* short explanation of what users do after login

Avoid:

* heavy marketing
* unnecessary animation
* too many choices
* visually noisy background

### 5.3 Student Dashboard

The student dashboard should not feel like an admin table unless there are many cases.

For students, prefer:

* case cards
* status-first layout
* clear next action
* empty state with CTA
* recent activity summary

Tables are allowed when they improve scanning, but avoid making the first student experience feel like backend admin software.

### 5.4 Intake Flow

Intake should feel guided, not like a long bureaucratic form.

Required information may include:

* stage
* idea
* customer
* pain point
* alternatives
* team capability
* deadline
* Google Drive URL

The flow may look conversational, but it must remain structured under the hood.

Do:

* ask one focused question at a time
* show lightweight progress
* allow review before submit
* show validation near the relevant input
* save draft locally when useful
* redirect to the case workspace after successful submit

Avoid:

* fully free-form chat with no data structure
* huge form with all fields exposed at once
* progress UI that takes too much space
* over-animated chat bubbles

### 5.5 Case Workspace

This is the core product screen.

The user should quickly understand:

* current case status
* latest version
* payment state if relevant
* whether action is needed
* where the report/feedback is
* where discussion happens

Recommended structure:

* status/action header at the top
* main content area for input/report/discussion
* secondary panel or timeline when useful
* version switcher only when versions exist
* progressive disclosure for detailed findings

Do not force a fixed 3-column layout if it makes the UI crowded. Use tabs, panels, or responsive composition when better.

Separate clearly:

* submitted input
* AI/supporter feedback
* discussion
* activity history
* payment state

### 5.6 Report/Finding Display

Reports should be scannable.

Do not render AI output as one long essay.

Prefer structured finding cards or sections:

* severity/status
* field
* short summary
* evidence
* reason
* question
* next action

Evidence and detailed reasoning can be collapsed by default if the screen is dense.

The user should know what to fix without reading every detail.

## 6. Implementation Rules (Light/Dark Mode & Card)

### 6.1 Dark Mode Text Colors

Hardcoded text colors (`c="#115e59"`, `color: #115e59`) vỡ trong dark mode → dùng CSS variables hoặc Mantine theme color.

Mantine `c="dimmed"` tự động theo theme (ok).

### 6.2 Card Background Override

Global CSS override `.mantine-Card-root` background bằng `!important`. Tailwind gradient/background classes trên Card không生效.

Fix: dùng inline `style` hoặc CSS vars thay vì className.

### 6.3 No Shadow on Cards

Không dùng `shadow` trên Card/Paper. Chỉ dùng border + `borderWidth: 1.5px` cho thanh mảnh, sang trọng.

### 6.4 No Gradient Backgrounds

Dùng solid color, không gradient.

### 6.5 CSS Variables Pattern

```css
:root {
  --cta-bg: #f0fdfa;
  --cta-border: #99f6e4;
  --cta-title: #115e59;
}
[data-mantine-color-scheme="dark"] {
  --cta-bg: rgba(13, 148, 136, 0.15);
  --cta-border: #0f766e;
  --cta-title: #5eead4;
}
```

Định nghĩa trong `globals.css`, dùng qua `style={{ background: "var(--cta-bg)" }}`.
