import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { PageLoader } from "@/components/ui/page-loader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hirelane | Job Portal",
  description: "A production-ready frontend for a job board API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <PageLoader />
        <Suspense>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
