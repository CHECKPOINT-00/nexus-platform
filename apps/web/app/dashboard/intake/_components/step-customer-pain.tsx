import { TextArea } from "@heroui/react";

interface StepCustomerPainProps {
  customer: string;
  painPoint: string;
  onCustomerChange: (v: string) => void;
  onPainPointChange: (v: string) => void;
}

export function StepCustomerPain({
  customer, painPoint, onCustomerChange, onPainPointChange,
}: StepCustomerPainProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-default-50 p-4 rounded-md border border-default-200 text-sm text-default-600 leading-relaxed flex flex-col gap-2">
        <span className="font-bold text-default-800">Chatbot hỏi (Rule 12):</span>
        <p className="italic text-orange-600 dark:text-orange-400">
          &ldquo;Ai là người trực tiếp gặp vấn đề này? Họ thuộc nhóm đối tượng cụ thể nào? Vấn đề nghiêm trọng nhất của họ là gì?&rdquo;
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="customer-desc" className="text-sm font-bold text-default-700">
          Khách hàng mục tiêu là ai?
        </label>
        <TextArea
          id="customer-desc"
          placeholder="Mô tả cụ thể tệp khách hàng của bạn..."
          value={customer}
          onChange={(e) => onCustomerChange(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pain-desc" className="text-sm font-bold text-default-700">
          Vấn đề cốt lõi họ gặp phải là gì?
        </label>
        <TextArea
          id="pain-desc"
          placeholder="Nỗi đau hoặc vấn đề lớn nhất của khách hàng..."
          value={painPoint}
          onChange={(e) => onPainPointChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}
