import { redirect } from "next/navigation";

export default function CasePaymentRedirect({ params }: { params: { id: string } }) {
  redirect(`/dashboard/case/${params.id}`);
}
