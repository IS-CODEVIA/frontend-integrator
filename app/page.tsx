"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/src/core/auth/AuthContext";

export default function Home() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && isAdmin) {
        router.replace("/admin");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, isAdmin, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5fafb]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00CFBB] border-t-transparent" />
    </div>
  );
}
