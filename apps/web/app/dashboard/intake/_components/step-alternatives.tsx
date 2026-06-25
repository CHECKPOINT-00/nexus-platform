import { TextArea } from "@heroui/react";

interface StepAlternativesProps {
  alternatives: string;
  teamCapability: string;
  onAlternativesChange: (v: string) => void;
  onTeamCapabilityChange: (v: string) => void;
}

export function StepAlternatives({
  alternatives, teamCapability, onAlternativesChange, onTeamCapabilityChange,
}: StepAlternativesProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-default-50 p-4 rounded-md border border-default-200 text-sm text-default-600 leading-relaxed flex flex-col gap-2">
        <span className="font-bold text-default-800">Chatbot hỏi (Rule 12):</span>
        <p className="italic text-orange-600 dark:text-orange-400">
          &ldquo;Hiện tại đối tượng khách hàng đó đang tự giải quyết nỗi đau/vấn đề đó bằng cách nào? Giải pháp thay thế của bạn tối ưu hơn ở điểm nào?&rdquo;
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="alternatives-desc" className="text-sm font-bold text-default-700">
          Giải pháp thay thế hiện có
        </label>
        <TextArea
          id="alternatives-desc"
          placeholder="Ví dụ: Họ dùng Excel, hoặc sử dụng dịch vụ của đối thủ X..."
          value={alternatives}
          onChange={(e) => onAlternativesChange(e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="team-cap" className="text-sm font-bold text-default-700">
          Thế mạnh / Năng lực cạnh tranh của nhóm (không bắt buộc)
        </label>
        <TextArea
          id="team-cap"
          placeholder="Năng lực đặc biệt giúp nhóm thực thi ý tưởng này..."
          value={teamCapability}
          onChange={(e) => onTeamCapabilityChange(e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
}
