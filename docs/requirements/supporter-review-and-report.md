# Functional Requirement: Supporter Review and Report

## 1. Document info

- Feature ID: F04
- Trạng thái: đang làm việc
- PRD reference: [`../prd/core-product-prd.md`](../prd/core-product-prd.md)
- Flow reference: [`../flows/case-lifecycle-flow.md`](../flows/case-lifecycle-flow.md)

## 2. Traceability

- Business reason: value thuc cua Nexus nam o audit chat luong va report ro rang, khong nam o viec luu ho so.
- Target customer: user, supporter.
- User problem: can biet tai lieu dang yeu o dau, can sua gi truoc, va can huong sua du de team tu chinh.
- Product behavior: supporter doc case, audit theo workflow noi bo, va publish report vao case.
- Related user story: supporter can xu ly case co cau truc; user can nhan report de hanh dong.
- Related acceptance criteria: report final luon co owner ro rang va duoc publish vao case workspace.

## 3. Scope

### In scope

- supporter mo case va doc tai lieu
- supporter yeu cau bo sung
- supporter tao/paste/upload report
- supporter publish report vao case
- supporter dong case voi ly do ro khi khong nen di tiep

### Out of scope

- chat tu do giua user va supporter
- AI tu quyet dinh ket qua cuoi

## 4. Actors

- Primary actor: supporter
- Secondary actor: user, system

## 5. Trigger

- Case da duoc admin accept va assign cho supporter.

## 6. Inputs

- intake input
- tai lieu case
- feedback giang vien
- supporter notes
- revision tu user

## 7. Outputs

- report final duoc publish vao case
- request more info neu can
- close reason neu khuyen nghi khong di tiep

## 8. Quy trình supporter phase 1

1. Mo case.
2. Doc summary, deadline, va tai lieu.
3. Kiem tra input co du audit chua.
4. Neu thieu, yeu cau bo sung.
5. Neu du, audit theo workflow noi bo va checklist.
6. Tao report.
7. Publish report vao case.
8. Neu co revision, lap lai cho round moi.

## 9. Processing rules

### Main behavior

- Report la artifact chinh user xem trong case.
- Internal notes va tai lieu trung gian khong hien cho user.
- Moi report phai gan voi mot round ro rang.
- Phase 1 dung structured rich text lam dang report chinh va cho phep file dinh kem tuy chon.

### Validation rules

- Report final chi duoc xem la co hieu luc sau khi supporter publish.
- Neu case dong vi khong nen di tiep, ly do phai giup user hieu boundary.

### Business rules

- Khong dung wording dam bao ket qua hoc tap.
- Report phai giup user biet loi o dau, sua gi truoc, va buoc tiep theo la gi.
- Audit workflow noi bo co the dung AI ho tro, nhung output cuoi van la trach nhiem cua supporter.

## 10. User stories

- As a supporter, I want one audit workspace with documents, checklist, and actions, so that I can process a case without losing context.
- As a user, I want to receive a clear report inside my case, so that I can act on it with my team.
- As a supporter, I want the option to stop a weak case with a clear reason, so that Nexus does not overpromise.

## 11. Error and edge cases

- Case: tai lieu chua du.
  Expected behavior: supporter yeu cau bo sung.

- Case: idea qua yeu hoac qua lech so voi kha nang thuc thi hien tai.
  Expected behavior: supporter co the dong case co ly do ro.

## 12. Acceptance criteria

- [ ] Supporter co workspace rieng de audit case.
- [ ] Supporter co the yeu cau bo sung tai lieu.
- [ ] Supporter co the publish report vao case.
- [ ] User chi xem duoc report dang co hieu luc.
- [ ] Case co the duoc dong co ly do ro khi khong nen tiep tuc.

## 13. Missing / unclear

- Locked for phase 1: report ho tro ca hai, trong do structured rich text la dang chinh va file dinh kem la tuy chon.
- Locked for phase 1: checklist supporter chi can render toi thieu trong UI; SOP chi tiet co the van ton tai ben ngoai he thong.
