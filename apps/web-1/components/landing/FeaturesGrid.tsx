"use client";

import React from "react";
import { Container, Title, Text, SimpleGrid, Card, ThemeIcon } from "@mantine/core";
import { Cpu, Users, History, CheckCircle } from "lucide-react";

const featuresData = [
  {
    title: "AI phản biện tức thì",
    description: "Đọc slide và báo cáo rồi chỉ ra luận điểm chưa đủ, bằng chứng còn yếu, cần bổ sung chỗ nào.",
    icon: Cpu,
    color: "blue",
  },
  {
    title: "Supporter thực chiến xem xét lại",
    description: "Không chỉ AI. Mentor có kinh nghiệm thực tế đọc lại và bổ sung trước khi bạn nhận kết quả.",
    icon: Users,
    color: "teal",
  },
  {
    title: "Lưu phiên bản từng lần sửa",
    description: "Mỗi lần nộp được đánh số (v00, v01, v02...). Dễ so sánh trước và sau khi chỉnh sửa.",
    icon: History,
    color: "indigo",
  },
  {
    title: "Bám sát tiêu chí đánh giá",
    description: "Tìm kiếm lỗ hổng theo đúng cấu trúc đánh giá, không phản biện chung chung.",
    icon: CheckCircle,
    color: "green",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-soft/20 transition-colors duration-200">
      <Container size="lg" className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Title order={2} className="font-heading text-3xl font-bold text-text-app">
            Nexus làm được gì?
          </Title>
          <Text className="font-body text-text-muted">
            Bốn thứ thiết yếu để đi từ hồ sơ sơ khai đến bảo vệ tự tin.
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {featuresData.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                p="lg"
                radius="lg"
                withBorder
                className="bg-surface-app border-border-app hover:border-brand/40 shadow-sm transition-all"
              >
                <div className="flex items-start gap-4">
                  <ThemeIcon color={item.color} size={40} radius="md" variant="light">
                    <Icon className="w-5 h-5" />
                  </ThemeIcon>
                  <div className="space-y-1">
                    <Text className="font-heading font-bold text-sm text-text-app">
                      {item.title}
                    </Text>
                    <Text className="font-body text-xs text-text-muted leading-relaxed">
                      {item.description}
                    </Text>
                  </div>
                </div>
              </Card>
            );
          })}
        </SimpleGrid>
      </Container>
    </section>
  );
}
