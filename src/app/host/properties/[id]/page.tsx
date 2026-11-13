"use client";
import { useParams } from "next/navigation";
import { AccountPage } from "@/components/account/AccountPage";
import { PropertyEditor } from "@/components/account/PropertyEditor";
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return (
    <AccountPage title="Edit your unit" roles={["LANDLORD"]}>
      <PropertyEditor id={id} />
    </AccountPage>
  );
}
