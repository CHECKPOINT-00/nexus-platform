# Functional Requirement: Structured Intake

## 1. Document info

- Feature ID: F01
- Trạng thái: đang làm việc
- PRD reference: [`../prd/core-product-prd.md`](../prd/core-product-prd.md)
- Flow reference: [`../flows/intake-flow.md`](../flows/intake-flow.md)

## 2. Traceability

- Business reason: bien nhu cau ho tro thanh case gui duoc ma khong lam user bi ngop.
- Target customer: nguoi dai dien team can duoc audit va review.
- User problem: khong biet bat dau tu dau va khong biet Nexus can thong tin gi de audit dung.
- Product behavior: wizard tung buoc, copy than thien, du lieu luu co cau truc, ket thuc bang submit case.
- Related user story: user can duoc dan de gui case dung va du boi canh.
- Related acceptance criteria: user submit duoc case khi du thong tin toi thieu va da xac nhan ranh gioi ho tro.

## 3. Scope

### In scope

- public entry point
- auth truoc khi submit case
- create case wizard
- luu nhap wizard
- review before submit
- case submission

### Out of scope

- chat tu do la source of truth
- auto-audit day du ngay sau submit

## 4. Actors

- Primary actor: user
- Secondary actor: system

## 5. Trigger

- User bam CTA bat dau hoac bam `Tao case moi` trong dashboard.

## 6. Inputs

- tinh huong hien tai
- thong tin nguoi lien he
- thong tin nhom / du an
- nhu cau ho tro
- tai lieu dau vao hoac link Drive
- feedback giang vien neu co
- deadline / urgency
- ky vong dau ra
- xac nhan ranh gioi ho tro

## 7. Outputs

- case moi duoc tao
- du lieu intake duoc luu co cau truc
- user duoc dua vao case workspace

## 8. Processing rules

### Main behavior

- Moi buoc chi hoi mot cum thong tin gan nhau.
- Du lieu da biet phai duoc tai su dung.
- Wizard phai ket thuc bang review before submit.
- Case chi duoc tao sau khi user bam submit ro rang.

### Validation rules

- Khong cho submit case neu chua du thong tin cot loi.
- Khong cho submit case neu chua xac nhan ranh gioi ho tro.
- Neu user dung Drive link thay vi upload file, link phai co y nghia va giai thich ro.

### Business rules

- Wizard phai tao cam giac Nexus dang hieu case cua user, khong phai dang bat user dien don hanh chinh.
- Public wording khong nen lo truc dien ten mon hoc hoac checkpoint.
- Phase 1 ho tro ca file upload va Drive link; user co the dung mot trong hai hoac ket hop ca hai.

## 9. User stories

- As a user, I want to be guided step by step, so that I can submit a case without guessing what Nexus needs.
- As a user, I want to review everything before sending, so that I know the case reflects my real situation.
- As a user, I want to confirm the support boundary, so that expectations stay clear from the beginning.

## 10. Error and edge cases

- Case: user bo do giua flow.
  Expected behavior: du lieu hop ly duoc giu va user co the quay lai.

- Case: user chi co mo ta text, chua co file.
  Expected behavior: system co the cho submit neu mo ta du ro va admin se triage theo rule noi bo.

- Case: user thieu feedback giang vien.
  Expected behavior: van co the submit neu feedback khong phai dieu kien bat buoc.

## 11. Acceptance criteria

- [ ] User co the bat dau create case tu public CTA.
- [ ] Wizard duoc chia thanh nhieu buoc ngan, khong la mot form dai duy nhat.
- [ ] User co the luu nhap va quay lai.
- [ ] Wizard co man review before submit.
- [ ] Case khong duoc tao neu chua du thong tin toi thieu va chua xac nhan ranh gioi ho tro.
- [ ] Sau khi submit, user duoc dua vao case workspace.
- [ ] Phase 1 chap nhan ca file upload va Drive link.

## 12. Missing / unclear

- Missing: bo field mandatory chi tiet cho tung tinh huong.
