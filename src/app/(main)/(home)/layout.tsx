import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";
import type { Metadata } from "next";
import type React from "react";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Seller Dashboard - E-commerce Platform",
  description: "Comprehensive seller dashboard for managing your online store",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-2 sm:p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
