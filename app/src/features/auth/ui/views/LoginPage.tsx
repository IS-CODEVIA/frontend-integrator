"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/app/src/core/auth/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/src/common/ui/Button";
import { Input } from "@/app/src/common/ui/Input";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, isAdmin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await login(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else if (isAdmin) {
      router.replace("/admin");
    } else {
      setError("No tienes permisos de administrador");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00CFBB]">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <h1 className="text-3xl font-bold text-[#1C258F] font-[family-name:var(--font-poppins)]">
              Panel Administrativo
            </h1>
            <p className="mt-1 text-sm text-[#6f797a] font-[family-name:var(--font-nunito)]">
              Inicia sesión para administrar SAAU
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="rounded-xl bg-[#ffdad6] px-4 py-3 text-sm text-[#8c0d0d] font-[family-name:var(--font-nunito)]">
                {error}
              </div>
            )}

            <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6f797a] font-[family-name:var(--font-nunito)]">
            ¿Primer acceso?{" "}
            <Link href="/register" className="font-semibold text-[#1C258F] hover:underline">
              Registrar administrador
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#00CFBB] to-[#1C258F] items-center justify-center p-16">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/20">
            <span className="text-5xl font-bold text-white">S</span>
          </div>
          <h2 className="text-3xl font-bold text-white font-[family-name:var(--font-poppins)]">
            SAAU
          </h2>
          <p className="mt-2 text-lg text-white/80 font-[family-name:var(--font-nunito)]">
            Sistema de Administración Académica Universitaria
          </p>
        </div>
      </div>
    </div>
  );
}
