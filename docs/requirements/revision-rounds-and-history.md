# Functional Requirement: Revision Rounds and History

## 1. Document info

- Feature ID: F05
- Trạng thái: đang làm việc
- PRD reference: [`../prd/core-product-prd.md`](../prd/core-product-prd.md)
- Flow reference: [`../flows/case-lifecycle-flow.md`](../flows/case-lifecycle-flow.md)

## 2. Traceability

- Business reason: gia tri cua Nexus khong chi nam o report dau tien ma con nam o kha nang review lai sau khi team sua.
- Target customer: user, supporter.
- User problem: sua xong nhung khong chac ban moi da on hon chua.
- Product behavior: user gui ban sua moi trong cung case; system tao round moi; supporter review lai tren lich su da co.
- Related user story: user can gui ban sua ma khong mat boi canh; supporter can so sanh round truoc va round moi.
- Related acceptance criteria: revision tao round moi trong cung case va giu lich su report cu.

## 3. Scope

### In scope

- submit revision
- round history
- report theo round
- compare round context toi thieu cho supporter

### Out of scope

- auto-diff phuc tap
- merge workflow phuc tap

## 4. Actors

- Primary actor: user
- Secondary actor: supporter, system

## 5. Trigger

- User muon gui ban sua moi sau khi da nhan report.

## 6. Inputs

- tai lieu sua moi
- ghi chu user da sua gi
- round hien tai cua case

## 7. Outputs

- round moi duoc tao
- supporter thay case quay lai queue
- lich su round duoc cap nhat

## 8. Processing rules

### Main behavior

- Revision khong tao case moi.
- Revision phai gan voi case hien tai va round moi.
- Report moi phai duoc luu rieng, khong ghi de report cu.

### Validation rules

- User phai nop tai lieu hoac mo ta sua doi du ro de mo round moi.
- Supporter phai thay duoc round truoc do khi review round moi.

### Business rules

- Mot case co the co nhieu round cho den khi hoan tat hoac dung lai.
- Revision loop la mot phan cua value proposition, khong phai phu luc van hanh.

## 9. User stories

- As a user, I want to submit a revised version inside the same case, so that Nexus can review it in context.
- As a supporter, I want to compare the new submission against the previous round, so that I can assess progress meaningfully.

## 10. Error and edge cases

- Case: user gui revision nhung khong ghi da sua gi.
  Expected behavior: system van cho nop neu tai lieu du ro, nhung nen canh bao khach bo sung mo ta.

- Case: user gui revision khi case da dong.
  Expected behavior: system chan hoac yeu cau mo lai theo rule noi bo.

## 11. Acceptance criteria

- [ ] User co the gui ban sua moi trong cung case.
- [ ] He thong tao round moi thay vi tao case moi.
- [ ] Supporter thay duoc lich su round truoc.
- [ ] Report theo round duoc giu lai trong lich su.

## 12. Missing / unclear

- Needs decision: phase 1 co can visual diff giua cac round hay chi can xem tai lieu cu/moi canh nhau.
- Needs decision: case da dong co cho phep mo lai bang revision hay khong.
