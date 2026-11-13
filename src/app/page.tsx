import type { Metadata } from "next";
import LandingPage from "@/components/home/LandingPage";
import "./landing.css";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Kampus",
    title: "Kampus | Student Accommodation Platform",
    description:
      "Find off-campus student accommodation near FUTMINNA and manage your booking, payment, and inspection in Kampus.",
    url: "/",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
