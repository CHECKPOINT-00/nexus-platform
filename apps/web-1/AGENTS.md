<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## HEROUI STYLING RULE
- **Không tự tiện thêm các Tailwind class định vị thủ công** (như `fixed`, `inset-0`, `flex`, `items-center`, `justify-center`) vào các component con của HeroUI (như `Modal.Backdrop`, `Modal.Container`, v.v.). Các component này đã được HeroUI thiết lập sẵn layout và định vị chuẩn. Việc cố viết đè bằng custom classes sẽ gây xung đột và làm hỏng hiển thị (ví dụ: làm lệch modal khỏi giữa màn hình).
