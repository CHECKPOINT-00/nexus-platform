"use client";

import { Accordion, Card } from "@heroui/react";
import Link from "next/link";
import { PricingCards } from "../components/landing/pricing-cards";
import { ArrowRight, HelpCircle, Shield, Award, Zap } from "lucide-react";

export default function HomePage() {
  const faqItems = [
    {
      title: "Nexus hỗ trợ phản biện ý tưởng khởi nghiệp như thế nào?",
      content:
        "Nexus phân tích tài liệu ý tưởng của bạn theo tiêu chuẩn checkpoint của môn học. AI sẽ đưa ra các nhận xét ban đầu dưới dạng cấu trúc cụ thể (Field-Status-Evidence-Reason), sau đó supporter (mentor) sẽ kiểm duyệt, bổ sung chi tiết và đưa ra câu hỏi hướng dẫn cụ thể để bạn tối ưu hóa ý tưởng.",
    },
    {
      title: "Thông tin và tài liệu của tôi có được bảo mật không?",
      content:
        "Có. Toàn bộ tài liệu, ý tưởng và lịch sử trao đổi của dự án chỉ hiển thị với nhóm sinh viên của bạn, supporter được gán phụ trách và ban quản trị hệ thống. Chúng tôi cam kết không chia sẻ dữ liệu ra ngoài.",
    },
    {
      title: "Tôi cần nộp những thông tin gì ở bước đăng ký dự án?",
      content:
        "Bạn cần cung cấp mô tả ngắn về ý tưởng, đối tượng khách hàng mục tiêu, vấn đề cốt lõi muốn giải quyết, giải pháp thay thế hiện có và một đường dẫn Google Drive chứa tài liệu checkpoint của nhóm (cần cấp quyền xem công khai).",
    },
    {
      title: "SLA phản hồi từ supporter được tính như thế nào?",
      content:
        "Thời gian cam kết (SLA) mặc định là từ 24h đến 48h kể từ khi dự án được gán supporter và thanh toán được kích hoạt. Bộ đếm ngược SLA sẽ hiển thị rõ ràng trên dashboard. Khi supporter gửi phản hồi yêu cầu bạn giải thích rõ thông tin (Need Clarification), bộ đếm ngược sẽ tự động tạm dừng.",
    },
  ];

  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto py-10 md:py-16">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight font-display leading-tight">
          Phản biện và tìm lỗi ý tưởng khởi nghiệp theo checkpoint môn học
        </h1>
        <p className="text-lg text-default-500 max-w-2xl">
          Hệ thống hỗ trợ phản biện tự động bằng AI kết hợp với mentor đánh giá chuyên sâu. 
          Giúp sinh viên chỉ ra các điểm thiếu sót, thông tin mơ hồ và tối ưu hóa tài liệu checkpoint dự án.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          {/* Rule 5: Duy nhất nút này là Primary/Solid */}
          <Link
            href="/dashboard/intake"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-bold text-base transition-colors shadow-sm"
          >
            Bắt đầu dự án ngay
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#pricing"
            className="inline-flex items-center justify-center h-12 px-8 rounded-md border border-default-300 hover:border-orange-500/40 text-default-700 hover:bg-default-50 font-semibold text-base transition-colors"
          >
            Xem bảng giá dịch vụ
          </a>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Card className="border border-default-200/50" variant="default">
          <Card.Content className="p-6 flex flex-col gap-3">
            <Zap className="w-8 h-8 text-orange-500" />
            <h3 className="text-lg font-bold font-display text-default-800">Phản biện AI chuẩn cấu trúc</h3>
            <p className="text-sm text-default-500 leading-relaxed">
              Nhận kết quả phân tích nhanh chóng chỉ rõ: Vấn đề (Field), Trạng thái (Status), Bằng chứng (Evidence), Lý do (Reason) và Câu hỏi thảo luận chi tiết.
            </p>
          </Card.Content>
        </Card>

        <Card className="border border-default-200/50" variant="default">
          <Card.Content className="p-6 flex flex-col gap-3">
            <Award className="w-8 h-8 text-orange-500" />
            <h3 className="text-lg font-bold font-display text-default-800">Đội ngũ Mentor kiểm duyệt</h3>
            <p className="text-sm text-default-500 leading-relaxed">
              Báo cáo AI được đọc, chỉnh sửa và đóng góp ý kiến thực tế bởi Supporter giàu kinh nghiệm trước khi gửi đến bạn, đảm bảo tính thiết thực cao nhất.
            </p>
          </Card.Content>
        </Card>

        <Card className="border border-default-200/50" variant="default">
          <Card.Content className="p-6 flex flex-col gap-3">
            <Shield className="w-8 h-8 text-orange-500" />
            <h3 className="text-lg font-bold font-display text-default-800">Thời gian cam kết rõ ràng</h3>
            <p className="text-sm text-default-500 leading-relaxed">
              Bộ đếm ngược SLA trên dashboard giúp bạn luôn nắm được khi nào nhận được phản hồi, tối ưu hóa tốc độ chuẩn bị bài nộp Checkpoint.
            </p>
          </Card.Content>
        </Card>
      </section>

      {/* Pricing packages Section */}
      <section id="pricing" className="border-t border-default-100 pt-16">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <h2 className="text-3xl font-bold font-display tracking-tight text-default-800">Các gói dịch vụ phản biện</h2>
          <p className="text-default-500 text-sm">
            Chọn gói cước phù hợp với nhu cầu của nhóm để kích hoạt công cụ phản biện AI và Supporter đồng hành.
          </p>
        </div>
        <PricingCards />
      </section>

      {/* FAQ Section */}
      <section className="border-t border-default-100 pt-16 max-w-4xl mx-auto w-full pb-12">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2 mb-10">
          <h2 className="text-3xl font-bold font-display tracking-tight text-default-800">Câu hỏi thường gặp (FAQ)</h2>
          <p className="text-default-500 text-sm">Giải đáp những thắc mắc phổ biến của học viên khi tham gia phản biện dự án trên Nexus.</p>
        </div>
        <Accordion variant="surface">
          {faqItems.map((item, idx) => (
            <Accordion.Item key={idx} className="border border-default-200/50 rounded-lg p-2">
              <Accordion.Heading>
                <Accordion.Trigger className="flex items-center w-full justify-between py-2 text-left">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="font-bold text-default-800 font-display text-sm">{item.title}</span>
                  </div>
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body className="text-sm text-default-500 leading-relaxed pb-4 px-2">
                  {item.content}
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
