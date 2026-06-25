import { Button } from "@heroui/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { STEPS } from "../types";

interface FormNavigationProps {
  currentStepIdx: number;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function FormNavigation({
  currentStepIdx, loading, onPrev, onNext, onSubmit,
}: FormNavigationProps) {
  const isFirst = currentStepIdx === 0;
  const isLast = currentStepIdx === STEPS.length - 1;

  return (
    <div className="flex justify-between items-center border-t border-default-100 pt-6 mt-4">
      {!isFirst ? (
        <Button onClick={onPrev} variant="outline" className="border-default-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      ) : (
        <div />
      )}

      {!isLast ? (
        <Button onClick={onNext} variant="primary" className="font-semibold">
          Tiếp theo
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <Button onClick={onSubmit} variant="primary" isPending={loading} className="font-bold px-8">
          Hoàn thành và Nộp dự án
        </Button>
      )}
    </div>
  );
}
