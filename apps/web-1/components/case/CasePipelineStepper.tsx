"use client";

import React, { useState } from "react";
import { Case, PIPELINE_STAGES, getPipelineStep } from "@/types";
import { Stepper, Button, Drawer } from "@mantine/core";
import { 
  FileText, 
  ClipboardCheck, 
  Activity, 
  FileCheck, 
  PenTool, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  CreditCard
} from "lucide-react";

interface CasePipelineStepperProps {
  caseData: Case;
  versionNo?: number;
}

export default function CasePipelineStepper({ caseData, versionNo }: CasePipelineStepperProps) {
  const [drawerOpened, setDrawerOpened] = useState(false);

  const stage = caseData.user_facing_stage;
  const version = versionNo ?? caseData.checkpoints?.[0]?.latest_version_no ?? 1;

  const { stepKey, stepIndex } = getPipelineStep(stage, version, caseData.payment_status);
  const isRejected = stepKey === "rejected";
  const isCompleted = ["completed", "closed"].includes(stage);
  
  // For Stepper component: if completed, set to length so all steps are marked as completed (ticked & filled)
  const activeStepIndex = isRejected 
    ? 1 
    : isCompleted 
      ? PIPELINE_STAGES.length 
      : stepIndex;

  // For text labels: cap at the final index (done)
  const displayStepIndex = isRejected 
    ? 1 
    : isCompleted 
      ? PIPELINE_STAGES.length - 1 
      : stepIndex;

  const getStepIcon = (key: string, isActive: boolean, isCompleted: boolean) => {
    const size = 16;
    let icon = <FileText size={size} />;

    switch (key) {
      case "intake":
        icon = <FileText size={size} />;
        break;
      case "confirm":
        icon = isRejected && isActive ? <XCircle size={size} /> : <ClipboardCheck size={size} />;
        break;
      case "payment":
        icon = <CreditCard size={size} />;
        break;
      case "review":
        icon = <Activity size={size} />;
        break;
      case "report":
        icon = <FileCheck size={size} />;
        break;
      case "revision":
        icon = <PenTool size={size} />;
        break;
      case "done":
        icon = <CheckCircle2 size={size} />;
        break;
    }

    if (isActive && !isRejected) {
      return (
        <div className="relative flex items-center justify-center">
          <span className="absolute -inset-1.5 rounded-full bg-brand-soft/40 animate-ping opacity-75" />
          <span className="relative">{icon}</span>
        </div>
      );
    }

    return icon;
  };

  const getStepLabel = (key: string, label: string) => {
    if (key === "revision" && version >= 2) {
      return `Sửa bài (Vòng ${version})`;
    }
    return label;
  };

  const currentStageLabel = isRejected 
    ? "Bị từ chối" 
    : getStepLabel(
        PIPELINE_STAGES[displayStepIndex]?.key || "intake", 
        PIPELINE_STAGES[displayStepIndex]?.label || "Gửi hồ sơ"
      );

  const stepperColor = isRejected ? "red" : "brand";

  const renderStepperContent = (orientation: "horizontal" | "vertical") => (
    <Stepper 
      active={activeStepIndex} 
      color={stepperColor} 
      size="sm" 
      allowNextStepsSelect={false}
      orientation={orientation}
      classNames={{
        stepIcon: "border-border-app bg-surface-app text-text-subtle",
        stepCompletedIcon: "text-white",
        separator: "bg-border-app",
        verticalSeparator: "bg-border-app",
      }}
    >
      {PIPELINE_STAGES.map((s, idx) => {
        const isActive = idx === activeStepIndex;
        const isCompleted = idx < activeStepIndex;
        
        return (
          <Stepper.Step
            key={s.key}
            label={<span className="font-heading text-xs font-semibold text-text-app">{getStepLabel(s.key, s.label)}</span>}
            icon={getStepIcon(s.key, isActive, isCompleted)}
            completedIcon={isRejected && isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            color={isRejected && isActive ? "red" : undefined}
          />
        );
      })}
    </Stepper>
  );

  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:block w-full py-2">
        {renderStepperContent("horizontal")}
      </div>

      {/* Mobile Stepper (Breadcrumb Bar) */}
      <div className="block md:hidden w-full">
        <div className="flex justify-between items-center bg-surface-soft p-3 rounded-lg border border-border-app">
          <div className="flex items-center gap-2">
            <div className={`relative flex h-2 w-2 shrink-0`}>
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isRejected ? "bg-red" : "bg-brand animate-ping"
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isRejected ? "bg-red" : "bg-brand"
              }`} />
            </div>
            <span className="text-xs font-semibold text-text-app">
              {isRejected 
                ? "Hồ sơ bị từ chối" 
                : `Giai đoạn ${displayStepIndex + 1}/${PIPELINE_STAGES.length}: ${currentStageLabel}`
              }
            </span>
          </div>
          <Button 
            variant="subtle" 
            size="xs" 
            color="brand" 
            className="font-semibold cursor-pointer text-xs h-7 px-2.5 flex items-center gap-1"
            onClick={() => setDrawerOpened(true)}
          >
            <span>Chi tiết</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Mobile Detail Drawer */}
        <Drawer
          opened={drawerOpened}
          onClose={() => setDrawerOpened(false)}
          title={<span className="font-heading font-bold text-sm text-text-app">Tiến trình hồ sơ</span>}
          position="bottom"
          size="auto"
          radius="md"
          styles={{
            header: {
              borderBottom: "1px solid var(--border-app)",
              paddingBottom: "12px",
            },
            body: {
              paddingTop: "20px",
              paddingBottom: "30px",
            }
          }}
        >
          <div className="px-2">
            {renderStepperContent("vertical")}
          </div>
        </Drawer>
      </div>
    </div>
  );
}
