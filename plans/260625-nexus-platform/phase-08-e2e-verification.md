# Phase 8: E2E Verification

## Context Links
- [Overview Plan](./plan.md)

## Overview
- **Priority**: P2
- **Status**: Pending
- **Description**: Kiểm thử toàn bộ hệ thống từ đầu đến cuối (End-to-End), tối ưu hóa hiệu năng và xác thực tính ổn định trước khi bàn giao.
- **Estimated Effort**: 2h

## Key Insights
- Chạy thử toàn bộ build monorepo bằng Turbo để phát hiện lỗi type hoặc bundle size.
- Mô phỏng vai trò của User, Supporter và Admin đồng thời để verify các ranh giới bảo mật.

## Requirements
- Vượt qua kiểm tra TypeScript (`check-types`).
- Vượt qua kiểm tra Linter (`eslint`).
- Đảm bảo luồng đi đầy đủ: Đăng nhập -> Intake -> Upload Proof -> Admin Duyệt -> Sinh AI Draft -> Supporter duyệt/sửa -> Gửi User.

## Architecture
- **Tooling**: Turborepo CLI, TypeScript Compiler (`tsc`), ESLint.

## Related Code Files
- [MODIFY] [package.json](../../package.json) - Kiểm tra các script dev và build.
- [MODIFY] [turbo.json](../../turbo.json) - Đảm bảo task dependencies chạy đúng.

## Implementation Steps
1. Chạy lệnh check type toàn dự án: `npm run check-types`.
2. Tiến hành build thử nghiệm production: `npm run build`.
3. Kiểm tra bảo mật: Test thử gọi API của supporter bằng token của sinh viên thường (verify 401/403).
4. Sửa các lỗi CSS, UI bị vỡ trên các thiết bị màn hình khác nhau.

## Todo List
- [ ] Chạy lệnh `check-types`.
- [ ] Kiểm thử linting toàn codebase.
- [ ] Kiểm thử build production.
- [ ] Manual test toàn bộ luồng nghiệp vụ.

## Success Criteria
- Lệnh build chạy thành công 100% không có lỗi type.
- Sinh viên không thể truy cập API gán supporter hay API verify payment.

## Risk Assessment
- *Rủi ro*: Gặp lỗi hydrations ở Next.js do chuyển đổi theme hoặc render động UI.
- *Khắc phục*: Sử dụng dynamic import hoặc useEffect check mounted state cho ThemeProvider.

## Security Considerations
- Validate lại tất cả các biến môi trường nhạy cảm (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `OPENAI_API_KEY`) trên production server.

## Next Steps
- Hoàn thành kế hoạch, bàn giao hệ thống và lưu vết nghiệm thu.
