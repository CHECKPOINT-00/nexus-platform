"use client";

import { Accordion } from "@mantine/core";

const faqItems = [
  {
    question: "Nexus phản biện tài liệu của tôi như thế nào?",
    answer: "Bạn gửi tài liệu dự án (file hoặc link tài liệu). Nexus phân tích nội dung, đối chiếu với tiêu chí đánh giá và xuất báo cáo chỉ rõ từng lỗ hổng: lập luận chưa chặt, bằng chứng còn yếu, cần bổ sung gì. Sau đó Supporter — người có kinh nghiệm thực chiến — đọc lại và hoàn thiện báo cáo trước khi bạn nhận kết quả.",
  },
  {
    question: "Nexus có khác gì ChatGPT không?",
    answer: "ChatGPT phản biện chung chung dựa trên câu hỏi bạn đặt. Nexus đọc đúng tài liệu của bạn, đối chiếu với tiêu chí đánh giá cụ thể, và có Supporter thực chiến xem xét lại — không phải AI trả lời một chiều. Kết quả là báo cáo có cấu trúc, chỉ đúng chỗ yếu, không phải lời khuyên mơ hồ.",
  },
  {
    question: "Vai trò của Supporter trên hệ thống là gì?",
    answer: "Supporter là các chuyên gia, giảng viên hoặc mentor có kinh nghiệm thực chiến. Họ đọc lại bản draft phản biện của AI, chỉnh sửa, bổ sung ý kiến thực tế để xuất bản báo cáo chất lượng nhất cho hồ sơ của bạn. Bạn không nhận kết quả chưa qua tay người.",
  },
  {
    question: "Bao lâu thì tôi nhận được kết quả?",
    answer: "Thông thường trong vòng 24–48 giờ kể từ khi hồ sơ được tiếp nhận. Gói cao hơn có SLA ưu tiên phản hồi nhanh hơn. Nexus sẽ thông báo nếu cần thêm thông tin trước khi bắt đầu phân tích.",
  },
  {
    question: "Tôi có thể gửi lại sau khi nhận phản biện không?",
    answer: "Có. Sau khi nhận báo cáo và chỉnh sửa tài liệu, bạn có thể gửi bản mới để Nexus đánh giá lại. Mỗi lần gửi được lưu riêng, dễ theo dõi tiến trình qua từng vòng sửa.",
  },
  {
    question: "Thông tin dự án của tôi có bị chia sẻ ra ngoài không?",
    answer: "Không. Mọi thông tin và tài liệu của bạn chỉ được dùng cho mục đích phản biện nội bộ và không được chia sẻ cho bất kỳ bên nào.",
  },
];


export default function FAQSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-app transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="font-heading text-3xl font-semibold text-text-app">Câu hỏi thường gặp</h2>
          <p className="font-body text-text-muted">
            Những điều các nhóm khởi nghiệp thường thắc mắc trước khi dùng Nexus.
          </p>
        </div>

        <div className="bg-surface-app border border-border-app rounded-2xl p-6 md:p-8 shadow-sm">
          <Accordion multiple variant="separated" radius="md">
            {faqItems.map((item, index) => (
              <Accordion.Item key={index} value={`faq-${index}`}>
                <Accordion.Control className="font-heading font-medium text-text-app">
                  {item.question}
                </Accordion.Control>
                <Accordion.Panel className="font-body text-sm text-text-muted leading-relaxed">
                  {item.answer}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
