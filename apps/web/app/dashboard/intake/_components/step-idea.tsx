import { TextArea } from "@heroui/react";

interface StepIdeaProps {
  idea: string;
  onIdeaChange: (v: string) => void;
}

export function StepIdea({ idea, onIdeaChange }: StepIdeaProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-default-50 p-4 rounded-md border border-default-200 text-sm text-default-600 leading-relaxed flex flex-col gap-2">
        <span className="font-bold text-default-800">Chatbot hỏi:</span>
        <p className="italic text-orange-600 dark:text-orange-400">
          &ldquo;Ý tưởng khởi nghiệp của nhóm bạn là gì? Bạn mong muốn mang lại giải pháp gì cho thị trường?&rdquo;
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="idea-desc" className="text-sm font-bold text-default-700">
          Mô tả ý tưởng kinh doanh
        </label>
        <TextArea
          id="idea-desc"
          placeholder="Mô tả cụ thể mô hình và giải pháp của bạn..."
          value={idea}
          onChange={(e) => onIdeaChange(e.target.value)}
          rows={6}
        />
      </div>
    </div>
  );
}
