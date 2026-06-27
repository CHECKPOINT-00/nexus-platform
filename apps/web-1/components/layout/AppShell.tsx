"use client";

import React from "react";
import Link from "next/link";
import {
  Group,
  Button,
  Divider,
  Burger,
  Drawer,
  ScrollArea,
  Anchor,
  ActionIcon,
  Container,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import ThemeToggler from "../ui/ThemeToggler";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const navLinks = [
    { href: "/", label: "Trang chủ" },
    { href: "#features", label: "Tính năng" },
    { href: "#packages", label: "Bảng giá" },
    { href: "#faq", label: "Hỗ trợ" },
  ];

  const footerLinks = [
    { href: "#", label: "Chính sách bảo mật" },
    { href: "#", label: "Điều khoản sử dụng" },
    { href: "/", label: "Trang chủ" },
    { href: "#contact", label: "Liên hệ" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg-app transition-colors duration-200">
      {/* ── Header Mega Menu ── */}
      <header className="sticky top-0 z-50 border-b border-border-app bg-surface-app/80 backdrop-blur-md h-16">
        <div className="w-full h-full px-6">
          <div className="flex items-center justify-between h-full w-full">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 font-heading font-semibold text-xl text-brand"
            >
              <span className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold">
                N
              </span>
              <span>Nexus</span>
            </Link>

            {/* Desktop Navigation Links */}
            <Group gap={20} visibleFrom="md">
              {navLinks.map((link) => (
                <Anchor
                  component={Link}
                  key={link.label}
                  href={link.href}
                  className="font-body text-sm font-semibold text-text-muted hover:text-brand transition-colors no-underline"
                >
                  {link.label}
                </Anchor>
              ))}
            </Group>

            {/* Desktop Actions */}
            <Group visibleFrom="md" gap={12}>
              <ThemeToggler />
              <Button
                component={Link}
                href="/auth"
                variant="default"
                radius="md"
                size="sm"
                className="font-semibold text-text-muted border-border-app hover:bg-surface-soft font-body"
              >
                Đăng nhập
              </Button>
              <Button
                component={Link}
                href="/auth?tab=register"
                color="brand"
                radius="md"
                size="sm"
                className="font-semibold font-body"
              >
                Đăng ký
              </Button>
            </Group>

            {/* Mobile Burger and Theme Toggle */}
            <Group hiddenFrom="md" gap={8}>
              <ThemeToggler />
              <Burger opened={drawerOpened} onClick={toggleDrawer} size="sm" />
            </Group>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title={
          <Link
            href="/"
            className="flex items-center gap-2 font-heading font-semibold text-lg text-brand"
            onClick={closeDrawer}
          >
            <span className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center text-white font-bold">
              N
            </span>
            <span>Nexus</span>
          </Link>
        }
        hiddenFrom="md"
        zIndex={1000}
      >
        <ScrollArea h="calc(100vh - 80px)" mx="-md">
          <Divider my="sm" />

          <div className="flex flex-col gap-1 px-4 font-body">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeDrawer}
                className="flex items-center w-full py-3 px-4 rounded-xl text-sm font-semibold text-text-muted hover:text-brand hover:bg-surface-soft transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Divider my="sm" />

          <div className="flex flex-col gap-3 px-4 pt-2 font-body">
            <Button
              component={Link}
              href="/auth"
              variant="default"
              radius="md"
              fullWidth
              size="md"
              onClick={closeDrawer}
              className="font-semibold text-text-muted border-border-app"
            >
              Đăng nhập
            </Button>
            <Button
              component={Link}
              href="/auth?tab=register"
              color="brand"
              radius="md"
              fullWidth
              size="md"
              onClick={closeDrawer}
              className="font-semibold"
            >
              Đăng ký
            </Button>
          </div>
        </ScrollArea>
      </Drawer>

      {/* ── Main Content ── */}
      <main className="flex-grow">{children}</main>

      {/* ── Footer Centered ── */}
      <footer className="border-t border-border-app bg-surface-app py-12">
        <Container
          size="lg"
          className="flex flex-col items-center gap-6 text-center"
        >
          {/* Logo Centered */}
          <Link
            href="/"
            className="flex items-center gap-2 font-heading font-semibold text-brand text-lg"
          >
            <span className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center text-white font-bold">
              N
            </span>
            <span>Nexus Platform</span>
          </Link>

          {/* Centered Navigation Links */}
          <Group gap="xl" justify="center" className="flex-wrap">
            {footerLinks.map((link) => (
              <Anchor
                component={Link}
                href={link.href}
                key={link.label}
                c="dimmed"
                className="font-body text-xs font-semibold hover:text-brand transition-colors no-underline"
              >
                {link.label}
              </Anchor>
            ))}
          </Group>

          {/* Social Links */}
          <Group gap="xs" justify="center">
            <ActionIcon
              size="lg"
              color="gray"
              variant="subtle"
              radius="xl"
              className="cursor-pointer"
            >
              <FacebookIcon className="w-4.5 h-4.5" />
            </ActionIcon>
            <ActionIcon
              size="lg"
              color="gray"
              variant="subtle"
              radius="xl"
              className="cursor-pointer"
            >
              <GithubIcon className="w-4.5 h-4.5" />
            </ActionIcon>
            <ActionIcon
              size="lg"
              color="gray"
              variant="subtle"
              radius="xl"
              className="cursor-pointer"
            >
              <LinkedinIcon className="w-4.5 h-4.5" />
            </ActionIcon>
          </Group>

          {/* Copyright & Info */}
          <Text size="xs" c="dimmed" className="font-body">
            &copy; {new Date().getFullYear()} Nexus Platform. Tất cả quyền được
            bảo lưu.
          </Text>
        </Container>
      </footer>
    </div>
  );
}
