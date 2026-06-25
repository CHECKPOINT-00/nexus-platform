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
    <div className="relative w-full">
      {/* Premium Background Mesh Glows */}
      <div className="absolute top-[-100px] left-[50%] -translate-x-[50%] w-[600px] h-[350px] rounded-full bg-gradient-to-b from-accent/15 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[400px] right-[-200px] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-[200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[160px] pointer-events-none -z-10" />

      <div className="flex flex-col gap-28 py-12 relative z-10">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto py-12 md:py-24">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight font-display leading-[1.1] max-w-3xl">
            Phản biện & tìm lỗi ý tưởng theo{" "}
            <span className="text-gradient-gold block mt-2 md:inline md:mt-0">checkpoint môn học</span>
          </h1>
          <p className="text-lg md:text-xl text-default-500 max-w-3xl leading-relaxed">
            Hệ thống hỗ trợ phản biện tự động bằng AI kết hợp với mentor đánh giá chuyên sâu. 
            Giúp sinh viên chỉ ra các điểm thiếu sót, thông tin mơ hồ và tối ưu hóa tài liệu checkpoint dự án.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 mt-6 w-full sm:w-auto px-4">
            <Link
              href="/dashboard/intake"
              className="inline-flex items-center justify-center gap-2.5 h-14 px-10 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-extrabold text-lg transition-all shadow-md hover:shadow-xl active:scale-[0.97] duration-250 w-full sm:w-auto"
            >
              Bắt đầu dự án ngay
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center h-14 px-10 rounded-xl border border-default-300 hover:border-accent/40 text-default-700 hover:bg-default-50/50 font-bold text-lg transition-all active:scale-[0.97] duration-250 w-full sm:w-auto"
            >
              Xem bảng giá dịch vụ
            </a>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full px-4">
          <Card className="border border-default-200/50 shadow-sm bg-surface/50 backdrop-blur-md rounded-2xl hover:-translate-y-1.5 duration-300 transition-transform" variant="default">
            <Card.Content className="p-8 flex flex-col gap-4">
              <Zap className="w-10 h-10 text-accent" />
              <h3 className="text-xl font-bold font-display text-default-800">Phản biện AI chuẩn cấu trúc</h3>
              <p className="text-base text-default-500 leading-relaxed">
                Nhận kết quả phân tích nhanh chóng chỉ rõ: Vấn đề (Field), Trạng thái (Status), Bằng chứng (Evidence), Lý do (Reason) và Câu hỏi thảo luận chi tiết.
              </p>
            </Card.Content>
          </Card>

          <Card className="border border-default-200/50 shadow-sm bg-surface/50 backdrop-blur-md rounded-2xl hover:-translate-y-1.5 duration-300 transition-transform" variant="default">
            <Card.Content className="p-8 flex flex-col gap-4">
              <Award className="w-10 h-10 text-accent" />
              <h3 className="text-xl font-bold font-display text-default-800">Đội ngũ Mentor kiểm duyệt</h3>
              <p className="text-base text-default-500 leading-relaxed">
                Báo cáo AI được đọc, chỉnh sửa và đóng góp ý kiến thực tế bởi Supporter giàu kinh nghiệm trước khi gửi đến bạn, đảm bảo tính thiết thực cao nhất.
              </p>
            </Card.Content>
          </Card>

          <Card className="border border-default-200/50 shadow-sm bg-surface/50 backdrop-blur-md rounded-2xl hover:-translate-y-1.5 duration-300 transition-transform" variant="default">
            <Card.Content className="p-8 flex flex-col gap-4">
              <Shield className="w-10 h-10 text-accent" />
              <h3 className="text-xl font-bold font-display text-default-800">Thời gian cam kết rõ ràng</h3>
              <p className="text-base text-default-500 leading-relaxed">
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
            <Accordion.Item key={idx} className="border border-default-200/50 rounded-lg p-3">
              <Accordion.Heading>
                <Accordion.Trigger className="flex items-center w-full justify-between py-3 text-left">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-accent shrink-0" />
                    <span className="font-bold text-default-850 font-display text-base">{item.title}</span>
                  </div>
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body className="text-sm md:text-base text-default-500 leading-relaxed pb-4 px-3">
                  {item.content}
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </section>
    </div>
    </div>
  );
}
