"use client";

import { useAuth } from "@/app/src/core/auth/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegisterPage } from "@/app/src/features/auth/ui/views/RegisterPage";

export default function Register() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.replace("/admin");
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5fafb]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00CFBB] border-t-transparent" />
      </div>
    );
  }

  return <RegisterPage />;
}
