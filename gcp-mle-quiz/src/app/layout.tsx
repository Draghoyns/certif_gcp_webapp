import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { TagProvider } from "@/components/TagContext";
import { ThemeProvider } from "@/components/ThemeContext";
import { CertificationProvider } from "@/components/CertificationContext";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "GCP Quiz",
  description: "Practice questions for the GCP Professional certification exams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <CertificationProvider>
            <TagProvider>
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="ml-0 md:ml-60 flex-1 min-w-0 min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-none relative">
                  <div className="fixed right-4 top-4 z-30 sm:right-6 sm:top-6">
                    <ThemeToggle />
                  </div>
                  <div className="pt-12 sm:pt-2">{children}</div>
                </main>
              </div>
            </TagProvider>
          </CertificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
