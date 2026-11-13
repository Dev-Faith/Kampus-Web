"use client";
import { AccountPage } from "@/components/account/AccountPage";
import { StudentBookings } from "@/components/account/StudentBookings";
export default function Page() {
  return (
    <AccountPage
      title="Your bookings"
      description="Continue a payment, arrange your inspection, or review a past booking."
      roles={["STUDENT"]}
    >
      <StudentBookings />
    </AccountPage>
  );
}
