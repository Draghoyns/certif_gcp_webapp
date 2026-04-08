import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { TagProvider } from "@/components/TagContext";

export const metadata: Metadata = {
  title: "GCP MLE Quiz",
  description: "Practice questions for the GCP Professional Machine Learning Engineer exam",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TagProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="ml-60 flex-1 min-h-screen px-8 py-8 w-full max-w-none">
              {children}
            </main>
          </div>
        </TagProvider>
      </body>
    </html>
  );
}
