# Cấu trúc thư mục nexus-document

## Mục đích

`nexus-document/` chứa **tài liệu nguồn gốc của dự án Nexus** — bài nộp checkpoint, biên bản mentoring, phản hồi giảng viên, tài liệu hướng dẫn và tài liệu vận hành thủ công.

Khác với `docs/` chính (product docs, PRD, requirements, technical notes), `nexus-document/` là kho lưu tài liệu **học thuật và vận hành** — phục vụ tra cứu ngữ cảnh business, không phải nguồn cho implementation.

## Cây thư mục đầy đủ

```
nexus-document/
├── overview.md                     ← Tổng quan business (CP1 & CP2) + điều hướng
├── structure-map.md                ← File này — navigation map
│
├── case-management-manual/         ← Tài liệu vận hành thủ công
│   ├── case-management-sheet.tsv                    (Bảng quản lý case)
│   ├── form-user-register-case.pdf                  (Form đăng ký case)
│   └── instruction for-manual-workflow-...pdf       (Hướng dẫn audit thủ công)
│
├── cp1/                            ← Checkpoint 1: Ý tưởng
│   ├── cp1-team-and-idea-document.md                (Bài nộp chính — 177 dòng)
│   ├── cp1-presentation-script.md                   (Script thuyết trình — 82 dòng)
│   └── feedback/                                    (Phản hồi giảng viên — đang trống)
│
├── cp2/                            ← Checkpoint 2: Nghiên cứu thị trường
│   ├── cp2-market-research-document.md              (Bài nộp chính — 327 dòng)
│   └── feedback/
│       ├── cp2-lecturer-feedback-summary.md         (Tóm tắt phản hồi GV — 122 dòng)
│       └── cp2-lecturer-feedback-transcript.md      (Transcript phản hồi GV — 61 dòng)
│
├── cp3/                            ← Checkpoint 3: Lean Canvas & SWOT
│   ├── cp3-lean-canvas-swot.md                      (Bài nộp chính — 181 dòng)
│   └── feedback/
│       └── cp3-lecturer-feedback-transcript.md      (Transcript phản hồi GV — 35 dòng)
│
├── cp4/                            ← Checkpoint 4: Financial & Pitch Deck
│   ├── pitch-deck-pre-writing.md                    (Pre-writing cho pitch deck — 481 dòng)
│   ├── pitch-deck-presentation-script.md            (Script thuyết trình pitch — 309 dòng)
│   ├── Financial Sustainability Plan.pdf            (Kế hoạch tài chính)
│   ├── NEXUS P&L.xlsx                               (Bảng P&L)
│   └── instructions/
│       ├── CP4 va PITCH DECK.md                     (Hướng dẫn CP4 — 49 dòng)
│       └── BẢN PITCH DECK.md                        (Hướng dẫn pitch deck — 57 dòng)
│
├── mentoring/                      ← Biên bản mentoring
│   ├── mentoring-1-summary.md                       (Tóm tắt buổi mentoring — 145 dòng)
│   └── mentoring-1-transcript.md                    (Transcript buổi mentoring — 100 dòng)
│
└── document-system/                ← Quy trình quản lý tài liệu
    └── document-lifecycle-management.md             (Vòng đời tài liệu — 415 dòng)
```

## Chú thích

| Ký hiệu | Ý nghĩa |
|---------|---------|
| 📄 `.md` | Tài liệu Markdown — đọc được trực tiếp |
| 📊 `.tsv` | Bảng dữ liệu (tab-separated) |
| 📕 `.pdf` | PDF — có thể đọc nội dung cơ bản |
| 📗 `.xlsx` | Excel — bảng tính |

## Thứ tự đọc khuyến nghị

Dành cho người mới cần hiểu toàn bộ dự án từ đầu:

1. `overview.md` — tổng quan business, value proposition, PMF
2. `cp1/cp1-team-and-idea-document.md` — ý tưởng gốc
3. `cp1/cp1-presentation-script.md` — cách trình bày CP1
4. `cp2/cp2-market-research-document.md` — nghiên cứu thị trường, 25 interviews
5. `cp2/feedback/cp2-lecturer-feedback-summary.md` — phản hồi GV cho CP2
6. `cp3/cp3-lean-canvas-swot.md` — Lean Canvas + SWOT
7. `cp4/pitch-deck-pre-writing.md` — pre-writing cho pitch deck
8. `cp4/pitch-deck-presentation-script.md` — script thuyết trình pitch
9. `mentoring/mentoring-1-summary.md` — tổng kết mentoring

Tài liệu bổ trợ (đọc khi cần):
- `case-management-manual/` — khi cần hiểu quy trình vận hành thủ công
- `document-system/document-lifecycle-management.md` — khi cần hiểu quy trình tài liệu
- `cp4/instructions/` — hướng dẫn nộp bài, format pitch deck

## Ánh xạ: cấu trúc cũ → mới

| File cũ (flat) | Vị trí mới |
|----------------|------------|
| `cp1-team-and-idea-document.md` | `cp1/cp1-team-and-idea-document.md` |
| `cp2-market-research-document.md` | `cp2/cp2-market-research-document.md` |
| `cp2-lecturer-feedback-summary.md` | `cp2/feedback/cp2-lecturer-feedback-summary.md` |
| `mentoring-1-summary.md` | `mentoring/mentoring-1-summary.md` |

## Ghi chú về các file đặc biệt

- **`cp1/feedback/` đang trống** — placeholder cho phản hồi GV CP1 khi có.
- **`cp4/pitch-deck-pre-writing.md`** — file lớn nhất (481 dòng), là pre-writing trước khi làm slide.
- **`cp4/instructions/`** — chứa hướng dẫn format và yêu cầu nộp bài từ giảng viên, không phải nội dung bài nộp.
- **`document-system/document-lifecycle-management.md`** — quy trình quản lý tài liệu nội bộ dự án, không phải bài nộp checkpoint.
- **`case-management-manual/`** — tài liệu vận hành thủ công giai đoạn concierge MVP, dùng Google Form + Sheet + prompt.
