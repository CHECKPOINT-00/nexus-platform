"use client";

import React from "react";
import { Coins, AlertCircle, CreditCard } from "lucide-react";
import { Button } from "@mantine/core";

interface CreditPanelProps {
  creditBalance: number | null | undefined;
  onBuyCredits: () => void;
}

export default function CreditPanel({ creditBalance, onBuyCredits }: CreditPanelProps) {
  // State 1: No credit yet (balance = 0, never bought)
  if (creditBalance === undefined || creditBalance === null) {
    return (
      <div className="bg-surface-app border border-border-app rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-soft/30 text-brand flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-text-app">Credit</h3>
            <p className="font-body text-xs text-text-muted">Gói miễn phí</p>
          </div>
        </div>
        <p className="font-body text-xs text-text-muted leading-relaxed">
          Mua credit để mở khoá đầy đủ tính năng đánh giá chuyên sâu.
        </p>
        <Button
          onClick={onBuyCredits}
          color="brand"
          fullWidth
          leftSection={<CreditCard className="w-4 h-4" />}
          className="font-body font-semibold text-xs h-9"
        >
          Mua credit
        </Button>
      </div>
    );
  }

  // State 2: Has credit balance
  if (creditBalance > 0) {
    return (
      <div className="bg-surface-app border border-border-app rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success-soft text-success flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-text-app">Credit</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success-soft text-success border border-success/20">
              Còn {creditBalance} credit
            </span>
          </div>
        </div>
        <Button
          onClick={onBuyCredits}
          color="brand"
          variant="light"
          fullWidth
          leftSection={<CreditCard className="w-4 h-4" />}
          className="font-body font-semibold text-xs h-9"
        >
          Mua thêm credit
        </Button>
      </div>
    );
  }

  // State 3: Zero credit (exhausted)
  return (
    <div className="bg-surface-app border border-danger/20 rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-danger-soft text-danger flex items-center justify-center">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-sm text-text-app">Credit</h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-danger-soft text-danger border border-danger/20">
            Hết credit
          </span>
        </div>
      </div>
      <p className="font-body text-xs text-text-muted leading-relaxed">
        Bạn cần mua thêm credit để tiếp tục sử dụng dịch vụ.
      </p>
      <Button
        onClick={onBuyCredits}
        color="brand"
        fullWidth
        leftSection={<CreditCard className="w-4 h-4" />}
        className="font-body font-semibold text-xs h-9"
      >
        Mua thêm credit
      </Button>
    </div>
  );
}
