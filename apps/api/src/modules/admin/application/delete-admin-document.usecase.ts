import { AppError } from "../../../shared/domain/app-error.js";
import { prisma } from "../../../db.js";
import { deleteManagedDocumentFile } from "../../documents/application/upload-managed-document-file.js";

export async function deleteAdminDocumentUseCase(adminId: string, documentId: string) {
  const doc = await prisma.documentRecord.findUnique({
    where: { id: documentId },
  });

  if (!doc) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy tài liệu này");
  }

  // If there's a Cloudinary public ID, delete the file from Cloudinary
  if (doc.cloudinary_public_id) {
    try {
      await deleteManagedDocumentFile(doc.cloudinary_public_id);
    } catch (err) {
      console.error(`Failed to delete Cloudinary file for document ${documentId}:`, err);
    }
  }

  // Delete document and log the case event in a database transaction
  await prisma.$transaction(async (tx) => {
    // Delete the database record
    await tx.documentRecord.delete({
      where: { id: documentId },
    });

    // Create a CaseEvent log entry
    await tx.caseEvent.create({
      data: {
        case_id: doc.case_id,
        event_type: "document_deleted",
        actor_auth_user_id: adminId,
        metadata_json: {
          document_id: doc.id,
          original_name: doc.original_name,
          doc_type: doc.doc_type,
          uploaded_by_id: doc.uploaded_by_auth_user_id,
        },
      },
    });
  });

  return { success: true };
}
