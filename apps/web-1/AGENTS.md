<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## MANTINE UI STYLING RULE
- **Không tự tiện thêm các Tailwind class định vị thủ công** (như `fixed`, `inset-0`, `flex`, `items-center`, `justify-center`) vào các component của Mantine UI (như `Modal`, `Drawer`, v.v.). Các component này đã được Mantine UI thiết lập sẵn layout và định vị chuẩn. Việc cố viết đè bằng custom classes sẽ gây xung đột và làm hỏng hiển thị (ví dụ: làm lệch modal khỏi giữa màn hình).
- **Tùy biến các component có custom bullet/node (như Timeline.Item)**: Khi sử dụng custom bullet node trong `Timeline.Item` (ví dụ: Lucide icons được bọc trong các thẻ div có chứa CSS Tailwind), cần vô hiệu hóa hoặc reset background/border/box-shadow mặc định của Mantine trên `itemBullet` thông qua thuộc tính `styles` hoặc `classNames` của `Timeline` hoặc `Timeline.Item` (ví dụ: `styles={{ itemBullet: { backgroundColor: "transparent", border: "none", boxShadow: "none" } }}`).
