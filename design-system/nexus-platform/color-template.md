# PROMPT — Nexus Color Direction & Theme System

You are rebuilding the Nexus frontend visual system.

The goal is not just to pick colors. The goal is to create a color system that supports the emotional experience of Nexus.

## 1. Product Context

Nexus is a startup idea critique and refinement platform for students.

Users are usually students preparing checkpoint documents. They may feel uncertain, stressed, confused, or afraid that their idea is weak.

The frontend should make them feel:

* supported
* guided
* calm
* safe
* taken seriously
* not judged harshly
* confident about the next step

Avoid making Nexus feel:

* cold
* bureaucratic
* government-like
* corporate-heavy
* overly technical
* like a generic AI SaaS
* like a sales funnel
* like a dashboard for admins only

The UI should feel like a calm mentor workspace, not a government portal and not a neon AI product.

## 2. Color Strategy

Use **Teal as the main brand color**.

Use **Warm Orange / Amber as emotional accent**.

Do not use Orange as the whole primary brand color.

Reasoning:

* Teal gives a feeling of calm, guidance, trust, and support.
* Warm Orange gives a feeling of care, energy, encouragement, and human warmth.
* Full Orange as the main brand can feel too promotional, sales-like, or warning-like.
* Full Blue/Navy can feel too cold, corporate, or government-like.
* Emerald should be reserved for success states, not primary CTA.
* Amber/Orange should be used carefully because it overlaps with warning/pending states.

The intended feeling is:

> Calm support first, warm encouragement second.

## 3. Recommended Palette

Use this as the default color foundation.

```ts
const nexusColors = {
  brand: {
    primary: "#0D9488",      // Teal 600 — main brand
    primaryHover: "#0F766E", // Teal 700
    primarySoft: "#CCFBF1",  // Teal 100
    primarySubtle: "#F0FDFA" // Teal 50
  },

  accent: {
    warm: "#F97316",         // Orange 500 — warm highlight / marketing accent
    warmHover: "#EA580C",    // Orange 600
    warmSoft: "#FFEDD5",     // Orange 100
    amber: "#F59E0B",        // Amber 500 — attention / pending
    amberSoft: "#FEF3C7"     // Amber 100
  },

  status: {
    success: "#10B981",      // Emerald 500
    successSoft: "#D1FAE5",
    warning: "#F59E0B",      // Amber 500
    warningSoft: "#FEF3C7",
    danger: "#EF4444",       // Red 500
    dangerSoft: "#FEE2E2",
    info: "#3B82F6",         // Blue 500
    infoSoft: "#DBEAFE"
  },

  neutral: {
    background: "#FBFAF7",   // Warm off-white
    surface: "#FFFFFF",
    surfaceSoft: "#F8FAFC",
    surfaceMuted: "#F1F5F9",
    border: "#E2E8F0",
    borderStrong: "#CBD5E1",
    text: "#1F2937",
    textMuted: "#64748B",
    textSubtle: "#94A3B8"
  },

  dark: {
    background: "#0F172A",
    surface: "#111827",
    surfaceSoft: "#1E293B",
    border: "#334155",
    text: "#F8FAFC",
    textMuted: "#CBD5E1"
  }
}
```

## 4. Semantic Usage Rules

### 4.1 Brand Color

Use Teal for:

* Nexus brand identity
* main navigation highlights
* primary app CTA
* active step
* selected tab
* important workflow progress
* calm guidance states
* trusted system elements

Examples:

* “Tiếp tục”
* “Gửi thông tin”
* “Chạy phản biện”
* “Xem báo cáo”
* “Nộp bản sửa”

Default primary buttons inside the app should usually be Teal.

### 4.2 Warm Accent Color

Use Orange/Warm Accent for:

* landing page highlights
* selected visual emphasis
* friendly guidance
* onboarding moments
* supportive callouts
* small visual warmth
* key value proposition highlights
* selected marketing CTA when appropriate

Do not use orange everywhere.

Do not turn all primary buttons orange.

Use orange to make the product feel warmer, not louder.

### 4.3 Status Colors

Use status colors strictly:

* Emerald = success, approved, paid, completed
* Amber = pending, waiting, needs attention, needs clarification
* Red = rejected, failed, destructive, error
* Blue = informational, neutral system info
* Teal = brand / primary workflow action

Do not use Emerald as the main CTA color.

Reason:

If Emerald is used for normal primary buttons, users may confuse normal action with success/completed states.

### 4.4 Background

Use warm off-white backgrounds instead of pure cold white.

Recommended:

* Main app background: `#FBFAF7`
* Cards/surfaces: `#FFFFFF`
* Secondary areas: `#F8FAFC`
* Soft teal sections: `#F0FDFA`
* Soft orange sections: `#FFF7ED` or `#FFEDD5`

The UI should feel soft and supportive, not sterile.

## 5. Page-Level Color Direction

### Landing Page

Landing page can be warmer and more expressive.

Use:

* Teal as brand anchor
* Warm orange for emotional highlights and key CTA moments
* soft warm background
* product preview surfaces
* subtle gradients if they improve depth

Avoid:

* cold navy-heavy corporate look
* neon AI purple
* excessive orange
* generic SaaS blue gradient
* too many colorful sections

The landing page should communicate:

> “Nexus helps you see what is unclear, know what to fix, and move forward with more confidence.”

### Auth Page

Auth page should feel safe and calm.

Use:

* mostly neutral/warm background
* teal primary button
* small orange accent only if needed
* minimal decoration
* optional side panel explaining the Nexus workflow

Avoid:

* loud gradient backgrounds
* aggressive CTA color
* too many promotional messages

### Student Dashboard

Student dashboard should feel like a supportive workspace, not an admin control panel.

Use:

* warm background
* case cards or hybrid cards
* teal for next action
* amber for pending/needs clarification
* emerald only for completed/approved
* muted status labels

Avoid:

* dense table-first layout for students
* too many chips
* all-white card grid with no hierarchy
* blue/navy government portal feeling

### Intake Flow

Intake should feel guided and low-pressure.

Use:

* soft teal progress indicators
* warm accent for encouragement or helper text
* clear neutral input surfaces
* amber only for missing/attention states
* red only for actual errors

The user should feel:

> “I am being guided step by step.”

Not:

> “I am filling out a strict administrative form.”

### Case Workspace

Case Workspace is the core product screen. It should feel calm, structured, and reliable.

Use:

* teal for current workflow/action
* amber for “needs clarification” or pending state
* emerald for approved/sent/paid
* neutral surfaces for reading long content
* light teal background for guidance blocks
* light orange/amber for attention blocks

Avoid:

* making every finding card colorful
* making all status chips equally loud
* using orange as the entire workspace theme
* making the UI feel like a warning system

### Report / Finding Cards

Report findings need clarity before decoration.

Use color semantically:

* Missing / Need Clarification: Amber
* Unsupported Claim / Risk: Red or Amber depending on severity
* Ready / Resolved: Emerald
* Neutral explanation: Slate/Teal

Do not over-color the entire card.

Prefer:

* small semantic badge
* left border
* subtle tinted background
* clear title and next action

### Supporter Review

Supporter review should feel professional and controlled.

Use:

* neutral surfaces
* teal primary action
* amber for needs attention
* red for reject/danger
* emerald for approve/sent

Avoid:

* warm playful visuals
* excessive gradients
* student-facing emotional UI

Supporter needs speed and clarity.

### Admin

Admin should be functional and clean.

Use:

* mostly neutral
* teal for active/admin action
* red for destructive/reject
* amber for pending payment
* emerald for approved/paid

Admin can be less emotionally warm than student screens, but it must remain visually consistent with the whole system.

## 6. Tailwind / CSS Variable Template

Create semantic CSS variables rather than hardcoding hex everywhere.

Recommended structure:

```css
:root {
  --color-brand: #0D9488;
  --color-brand-hover: #0F766E;
  --color-brand-soft: #CCFBF1;
  --color-brand-subtle: #F0FDFA;

  --color-accent-warm: #F97316;
  --color-accent-warm-hover: #EA580C;
  --color-accent-warm-soft: #FFEDD5;

  --color-success: #10B981;
  --color-success-soft: #D1FAE5;

  --color-warning: #F59E0B;
  --color-warning-soft: #FEF3C7;

  --color-danger: #EF4444;
  --color-danger-soft: #FEE2E2;

  --color-info: #3B82F6;
  --color-info-soft: #DBEAFE;

  --color-bg: #FBFAF7;
  --color-surface: #FFFFFF;
  --color-surface-soft: #F8FAFC;
  --color-surface-muted: #F1F5F9;

  --color-border: #E2E8F0;
  --color-border-strong: #CBD5E1;

  --color-text: #1F2937;
  --color-text-muted: #64748B;
  --color-text-subtle: #94A3B8;
}
```

Optional dark mode:

```css
.dark {
  --color-bg: #0F172A;
  --color-surface: #111827;
  --color-surface-soft: #1E293B;
  --color-surface-muted: #334155;

  --color-border: #334155;
  --color-border-strong: #475569;

  --color-text: #F8FAFC;
  --color-text-muted: #CBD5E1;
  --color-text-subtle: #94A3B8;

  --color-brand: #14B8A6;
  --color-brand-hover: #2DD4BF;
  --color-brand-soft: rgba(45, 212, 191, 0.16);
  --color-brand-subtle: rgba(20, 184, 166, 0.10);
}
```

## 7. Button Color Rules

Default app buttons:

```txt
Primary action: Teal
Secondary action: Neutral / outline
Warm CTA: Orange only for selected landing/onboarding moments
Success action: Emerald only after success/completion context
Destructive action: Red
Pending action: Amber only when action is related to pending/attention
```

Examples:

* “Tiếp tục” → Teal
* “Gửi tài liệu” → Teal
* “Chạy phản biện” → Teal
* “Thanh toán ngay” → Warm Orange or Teal depending on context
* “Duyệt báo cáo” → Emerald only if it means approval/completion
* “Từ chối” → Red
* “Cần làm rõ” → Amber status, not CTA

## 8. Status Badge Template

Use readable labels. Do not rely on color alone.

```ts
const statusTheme = {
  draft: {
    label: "Bản nháp",
    color: "neutral"
  },
  submitted: {
    label: "Đã gửi",
    color: "brand"
  },
  unpaid: {
    label: "Chưa thanh toán",
    color: "warning"
  },
  pendingVerification: {
    label: "Chờ duyệt thanh toán",
    color: "warning"
  },
  paid: {
    label: "Đã thanh toán",
    color: "success"
  },
  auditing: {
    label: "Đang phản biện",
    color: "brand"
  },
  needClarification: {
    label: "Cần làm rõ",
    color: "warning"
  },
  reviewed: {
    label: "Đã supporter xem",
    color: "info"
  },
  sent: {
    label: "Đã gửi báo cáo",
    color: "success"
  },
  rejected: {
    label: "Bị từ chối",
    color: "danger"
  }
}
```

## 9. Visual Mood

The final visual mood should be:

```txt
Warm mentor workspace
Calm academic support
Modern product interface
Trustworthy AI-assisted review
Clear workflow guidance
```

Not:

```txt
Government portal
Corporate admin dashboard
Cold blue SaaS
Neon AI chatbot
Orange sales funnel
Overly playful education app
```

## 10. Implementation Instruction

When implementing the theme:

1. Create semantic color tokens first.
2. Apply Teal as brand and default primary action.
3. Apply Orange only as warm accent and selected CTA highlight.
4. Apply Emerald only for success/completed states.
5. Use warm off-white background for the app.
6. Keep student-facing pages warmer and more supportive.
7. Keep supporter/admin pages more neutral and operational.
8. Do not overuse badges, chips, borders, and colored cards.
9. Review every page for emotional fit:

   * Does this feel supportive?
   * Does this feel calm?
   * Does this feel trustworthy?
   * Does this avoid cold government UI?
   * Does this avoid generic AI SaaS UI?

## 11. Final Decision

Use this final direction:

```txt
Primary Brand: Teal
Primary App CTA: Teal
Warm Accent: Orange / Amber
Success: Emerald
Warning / Pending: Amber
Danger / Error: Red
Info: Blue
Background: Warm off-white
Text: Slate / Warm neutral
```

Do not use Orange as the global primary brand color.
Do not use Emerald as the default primary CTA color.
Do not make the UI navy-heavy or government-like.
Do not make the UI look like a generic purple AI SaaS.

The system should feel like a calm, capable mentor that helps students move forward.
