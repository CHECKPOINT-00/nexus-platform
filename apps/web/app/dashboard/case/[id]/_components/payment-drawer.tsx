import { Drawer, Button } from "@heroui/react";
import { Upload, AlertTriangle } from "lucide-react";

interface PaymentDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  caseCode: string;
  packagePrice: number;
  file: File | null;
  setFile: (file: File | null) => void;
  uploading: boolean;
  uploadError: string;
  setUploadError: (err: string) => void;
  onUpload: () => void;
}

export function PaymentDrawer({
  isOpen,
  onOpenChange,
  caseCode,
  packagePrice,
  file,
  setFile,
  uploading,
  uploadError,
  setUploadError,
  onUpload,
}: PaymentDrawerProps) {
  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement="right" className="max-w-md w-full">
        <Drawer.Dialog>
          <Drawer.Header className="font-display font-bold text-default-800 border-b border-default-100">
            <Drawer.Heading>Thanh toán phí dịch vụ phản biện</Drawer.Heading>
          </Drawer.Header>

          <Drawer.Body className="flex flex-col gap-6 py-6 text-sm">
            {/* Bank info */}
            <div>
              <p className="font-bold text-default-800">Thông tin chuyển khoản ngân hàng</p>
              <div className="bg-default-50 border border-default-200 p-4 rounded-md mt-2 flex flex-col gap-2 font-mono text-xs">
                <p><span className="text-default-400">Ngân hàng:</span> TPBank (Ngân hàng Tiên Phong)</p>
                <p><span className="text-default-400">Số tài khoản:</span> 09876543210</p>
                <p><span className="text-default-400">Chủ tài khoản:</span> CONG TY NEXUS SYSTEM</p>
                <p>
                  <span className="text-default-400">Số tiền cần chuyển:</span>{" "}
                  <span className="font-bold text-orange-600">{packagePrice.toLocaleString("vi-VN")} đ</span>
                </p>
                <p>
                  <span className="text-default-400">Nội dung chuyển khoản:</span>{" "}
                  <span className="font-bold text-default-800">NEXUS {caseCode}</span>
                </p>
              </div>
            </div>

            {/* File upload */}
            <div className="flex flex-col gap-2">
              <label htmlFor="proof-file" className="font-bold text-default-800">
                Tải lên ảnh minh chứng giao dịch (Proof of Payment)
              </label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-default-300 rounded-lg p-6 hover:bg-default-50 transition-colors relative cursor-pointer">
                <input
                  id="proof-file"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                      setUploadError("");
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <Upload className="w-8 h-8 text-default-400 mb-2" />
                <p className="text-xs text-default-500 font-medium">
                  {file ? `Đã chọn: ${file.name}` : "Nhấp để chọn hoặc kéo thả ảnh chụp giao dịch vào đây"}
                </p>
                <p className="text-[10px] text-default-400 mt-1">Định dạng hỗ trợ: JPG, PNG, PDF (tối đa 5MB)</p>
              </div>
              {uploadError && (
                <p className="text-xs text-danger-500 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {uploadError}
                </p>
              )}
            </div>
          </Drawer.Body>

          <Drawer.Footer className="border-t border-default-100">
            <Button variant="ghost" onPress={() => onOpenChange(false)} className="font-semibold">
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onPress={onUpload}
              isPending={uploading}
              isDisabled={!file}
              className="font-bold shadow-sm"
            >
              Xác nhận đã chuyển khoản
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
