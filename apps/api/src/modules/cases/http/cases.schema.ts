// ---------------------------------------------------------------------------
// CP1 Intake validation
// ---------------------------------------------------------------------------

export function validateCp1Intake(body: any): string[] {
  const errors: string[] = [];
  if (!body) {
    errors.push("Dữ liệu trống");
    return errors;
  }

  // 1. Contact validation
  const contact = body.contact;
  if (!contact) {
    errors.push("Thiếu thông tin liên hệ");
  } else {
    if (
      !contact.full_name ||
      typeof contact.full_name !== "string" ||
      contact.full_name.trim().length < 2
    ) {
      errors.push("Họ tên người liên hệ không hợp lệ (tối thiểu 2 ký tự)");
    }
    if (
      !contact.student_code ||
      typeof contact.student_code !== "string" ||
      contact.student_code.trim().length < 5
    ) {
      errors.push("Mã số sinh viên không hợp lệ (tối thiểu 5 ký tự)");
    }
    if (
      !contact.team_role ||
      typeof contact.team_role !== "string" ||
      contact.team_role.trim().length < 2
    ) {
      errors.push("Vai trò trong nhóm không hợp lệ");
    }
    if (
      !contact.zalo ||
      typeof contact.zalo !== "string" ||
      !/^\d{10}$/.test(contact.zalo.trim())
    ) {
      errors.push(
        "Số điện thoại Zalo không hợp lệ (phải bao gồm chính xác 10 chữ số)",
      );
    }
    if (
      !contact.email ||
      typeof contact.email !== "string" ||
      !contact.email.includes("@")
    ) {
      errors.push("Email liên hệ không hợp lệ");
    }
  }

  // 2. Main content validation
  const current_situations = body.current_situations;
  const case_summary = body.case_summary;
  const support_needs = body.support_needs;

  const hasSituation =
    Array.isArray(current_situations) &&
    current_situations.length > 0 &&
    current_situations.some(
      (s) => typeof s === "string" && s.trim().length > 0,
    );
  const hasSummary =
    typeof case_summary === "string" && case_summary.trim().length >= 20;
  const hasPrimaryNeed =
    support_needs &&
    typeof support_needs.primary_need === "string" &&
    support_needs.primary_need.trim().length >= 5;

  if (!hasSituation && !hasSummary && !hasPrimaryNeed) {
    errors.push(
      "Cần cung cấp ít nhất một trong các thông tin: Tình huống hiện tại, Tóm tắt dự án (tối thiểu 20 ký tự), hoặc Nhu cầu hỗ trợ chính",
    );
  }

  // 3. Documents validation
  const documents = body.documents;
  if (!Array.isArray(documents) || documents.length === 0) {
    errors.push("Thư mục Google Drive tài liệu là bắt buộc");
  } else {
    const folderDoc = documents[0];
    if (
      !folderDoc.drive_url ||
      typeof folderDoc.drive_url !== "string" ||
      !/^https?:\/\/(drive|docs)\.google\.com\/.*/.test(
        folderDoc.drive_url.trim(),
      )
    ) {
      errors.push(
        "Đường dẫn thư mục Google Drive không hợp lệ (phải bắt đầu bằng drive.google.com hoặc docs.google.com)",
      );
    }
    if (
      !folderDoc.document_type ||
      typeof folderDoc.document_type !== "string" ||
      folderDoc.document_type.trim().length === 0
    ) {
      errors.push("Vui lòng chọn ít nhất một loại tài liệu có trong thư mục");
    }
  }

  // 4. Boundary confirmations validation
  const boundary_confirmations = body.boundary_confirmations;
  if (
    !Array.isArray(boundary_confirmations) ||
    boundary_confirmations.length < 3
  ) {
    errors.push("Phải xác nhận đầy đủ ít nhất 3 cam kết ranh giới");
  }

  return errors;
}
