"use client";
import { useParams } from "next/navigation";
import { AccountPage } from "@/components/account/AccountPage";
import { BookingDetail } from "@/components/account/BookingDetail";
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return (
    <AccountPage
      title="Booking details"
      description="Your reservation, payment, inspection and move-in in one place."
      roles={["STUDENT"]}
    >
      <BookingDetail id={id} />
    </AccountPage>
  );
}
