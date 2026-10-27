import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "maplibre-gl/dist/maplibre-gl.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "@photo-sphere-viewer/core/index.css";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kampus | Student Accommodation Platform",
  description:
    "Find verified off-campus student lodges near FUTMINNA and track your booking, payment, and move-in inspection in Kampus.",
  icons: {
    icon: [
      { url: "/kampus-icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/kampus-icon.svg",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200 selection:bg-emerald-500/30 selection:text-emerald-700 dark:selection:text-emerald-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <NuqsAdapter>{children}</NuqsAdapter>
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
