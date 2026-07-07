"use client";

import React from "react";
import Link from "next/link";
import { Title, Text, Button, Container, Group, List, ThemeIcon } from "@mantine/core";
import { ArrowRight, Check } from "lucide-react";
import classes from "./HeroBullets.module.css";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-bg-app transition-colors duration-200">
      {/* Decorative background grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 dark:opacity-10" />

      <Container size="lg">
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title className={classes.title}>
              Dự án khởi nghiệp của bạn<br />
              <span className={classes.highlight}>đã sẵn sàng chưa?</span>
            </Title>
            
            <Text c="dimmed" mt="md" className="font-body leading-relaxed">
              Nexus phản biện tài liệu ý tưởng theo đúng tiêu chí đánh giá, chỉ ra lỗi lập luận bằng AI, rồi có Supporter thực chiến xem xét lại trước khi bạn lên bảo vệ.
            </Text>

            <List
              mt={30}
              spacing="sm"
              size="sm"
              icon={
                <ThemeIcon size={20} radius="xl" variant="light" color="blue">
                  <Check className="w-3.5 h-3.5 text-brand" />
                </ThemeIcon>
              }
              className="font-body text-text-muted"
            >
              <List.Item>
                <b>Chỉ đúng điểm yếu</b> – AI đọc tài liệu và báo cáo rõ từng lỗ hổng theo tiêu chí đánh giá.
              </List.Item>
              <List.Item>
                <b>Supporter xem xét lại</b> – Mentor thực chiến bổ sung nhận xét trước khi bạn nhận kết quả.
              </List.Item>
              <List.Item>
                <b>Sửa rồi nộp lại được</b> – Hệ thống lưu lịch sử từng phiên bản, dễ theo dõi tiến trình.
              </List.Item>
            </List>

            <Group mt={30} className="w-full sm:w-auto">
              <Button
                component={Link}
                href="/auth"
                size="md"
                color="brand"
                radius="md"
                rightSection={<ArrowRight className="w-4 h-4" />}
                className={`${classes.control} font-semibold font-body shadow-md shadow-brand/10 transition-transform hover:-translate-y-0.5`}
              >
                Bắt đầu kiểm định
              </Button>
              <Button
                component="a"
                href="#packages"
                size="md"
                variant="default"
                radius="md"
                className={`${classes.control} font-semibold font-body text-text-muted hover:text-text-app border-border-strong`}
              >
                Xem bảng giá dịch vụ
              </Button>
            </Group>
          </div>
        </div>
      </Container>
    </section>
  );
}
