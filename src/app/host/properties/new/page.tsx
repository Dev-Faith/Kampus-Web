"use client";
import { AccountPage } from "@/components/account/AccountPage";
import { PropertyEditor } from "@/components/account/PropertyEditor";
export default function Page() {
  return (
    <AccountPage
      title="List a unit"
      description="A clear listing helps students decide whether your room is right for them."
      roles={["LANDLORD"]}
    >
      <PropertyEditor />
    </AccountPage>
  );
}
