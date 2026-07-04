# Functional Requirement: Roles and Access Boundary

## 1. Document info

- Feature ID: F06
- Trạng thái: đang làm việc
- PRD reference: [`../prd/core-product-prd.md`](../prd/core-product-prd.md)
- Flow reference: Not needed

## 2. Traceability

- Business reason: bao ve du lieu case va giu ro ranh gioi giua public value flow va noi bo van hanh.
- Target customer: guest, user, supporter, admin.
- User problem: khong the de lo tai lieu, report noi bo, hay thong tin case cua team khac.
- Product behavior: quyen gan voi role va object context.
- Related user story: user chi thay case cua minh; supporter chi thay case duoc giao; admin dieu phoi duoc toan he thong.
- Related acceptance criteria: du lieu noi bo khong lo ra ngoai; public surface khong lo language van hanh nhay cam.

## 3. Scope

### In scope

- role `guest`, `user`, `supporter`, `admin`
- public/user-private/internal/restricted data layers
- object-context access theo case ownership, supporter assignment, report state

### Out of scope

- permission engine sieu chi tiet nhieu tang

## 4. Actors

- Primary actor: all roles

## 5. Trigger

- Nguoi dung truy cap landing, dashboard, case, report, hoac action van hanh.

## 6. Inputs

- role
- session/account context
- case ownership
- supporter assignment
- report state

## 7. Outputs

- access granted/denied dung ngu canh
- UI/action hien thi phu hop role va context

## 8. Processing rules

### Main behavior

- `guest` chi xem public content.
- `user` chi xem case cua minh.
- `supporter` chi xu ly case duoc assign.
- `admin` triage va dieu phoi toan he thong.

### Validation rules

- Role khong du; phai check them object context.
- Internal note, tai lieu trung gian, artifact noi bo khong hien cho user.
- Public surface khong lo operational language khong can thiet.

### Business rules

- Case management la lop van hanh, khong duoc lo thanh headline value tren public UI.
- Quyền truy cap phai gan voi ownership/assignment/state, khong chi la role string.

## 9. User stories

- As a user, I want to see only my own case data, so that my information stays private.
- As a supporter, I want access only to assigned cases, so that workflow ownership stays clear.
- As an admin, I want internal artifacts hidden from users, so that quality control stays intact.

## 10. Error and edge cases

- Case: supporter mo case khong duoc assign.
  Expected behavior: khong cho truy cap.

- Case: user co report final nhung van khong thay internal note.
  Expected behavior: chi hien report va artifact user-facing.

## 11. Acceptance criteria

- [ ] Guest khong xem duoc data private hoac internal.
- [ ] User chi xem va thao tac duoc tren case cua minh.
- [ ] Supporter chi xem case duoc assign.
- [ ] Admin co quyen triage va assignment.
- [ ] Internal artifact va note khong lo ra user.

## 12. Missing / unclear

- Needs decision: admin MVP co duoc dieu chinh role trong giao dien hay khong.
