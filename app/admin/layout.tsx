"use client";

import { AuthGuard } from "@/app/src/core/auth/AuthGuard";
import { Sidebar } from "@/app/src/common/ui/Sidebar";
import { type ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pt-16 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
