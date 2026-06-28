// Default packages seeded when none exist in the DB
export const DEFAULT_PACKAGES = [
  {
    name: "Gói 0: Sàng lọc ý tưởng",
    price: 0,
    features: [
      "Phản biện tự động bằng AI",
      "Báo cáo lỗi ý tưởng sơ bộ",
      "Phân tích phân khúc khách hàng & vấn đề cơ bản",
    ],
  },
  {
    name: "Gói 1: Nhận xét 1 vòng",
    price: 99000,
    features: [
      "Báo cáo AI chi tiết (Field-Status-Evidence-Reason-Question)",
      "1 lần Supporter (mentor) đánh giá & ghi chú",
      "Thời gian SLA phản hồi trong 48h",
    ],
  },
  {
    name: "Gói 2: Nhận xét + Sửa đổi (2 vòng)",
    price: 199000,
    features: [
      "2 vòng phản biện sâu (AI + Supporter)",
      "Hỗ trợ đính kèm liên kết tài liệu Checkpoint",
      "Khung chat trao đổi trực tiếp với Supporter",
      "Bộ đếm ngược SLA và ưu tiên phản hồi trong 24h",
    ],
  },
  {
    name: "Gói 3: Đồng hành nhiều vòng",
    price: 399000,
    features: [
      "Đồng hành không giới hạn số vòng cho môn học",
      "Supporter riêng giải đáp thắc mắc chi tiết",
      "Hỗ trợ toàn diện từ ý tưởng đến checkpoint cuối cùng",
      "Cam kết SLA đặc biệt dưới 12h",
    ],
  },
] as const;
