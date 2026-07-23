"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/src/common/ui/Button";
import { Input } from "@/app/src/common/ui/Input";
import { gqlClient, setAccessToken } from "@/app/src/core/api/graphql-client";
import Link from "next/link";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await gqlClient().request<{
        register: { accessToken: string; refreshToken: string; user: { roleID: number } };
      }>(
        `mutation ($input: RegisterInput!) {
          register(input: $input) {
            accessToken
            refreshToken
            user { userID name email roleID }
          }
        }`,
        { input: { name, email, password, roleID: 3 } },
      );
      const { accessToken, refreshToken, user } = data.register;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setAccessToken(accessToken);
      if (user.roleID === 3) {
        router.replace("/admin");
      } else {
        router.replace("/login");
      }
    } catch (err: unknown) {
      const e = err as { response?: { errors?: Array<{ message: string }> } };
      setError(e?.response?.errors?.[0]?.message ?? "Error al registrarse");
    }
    setLoading(false);
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
              Crear cuenta Admin
            </h1>
            <p className="mt-1 text-sm text-[#6f797a] font-[family-name:var(--font-nunito)]">
              Registra el primer administrador del sistema
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre completo"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              placeholder="Mín. 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            {error && (
              <div className="rounded-xl bg-[#ffdad6] px-4 py-3 text-sm text-[#8c0d0d] font-[family-name:var(--font-nunito)]">
                {error}
              </div>
            )}

            <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Crear administrador"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6f797a] font-[family-name:var(--font-nunito)]">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold text-[#1C258F] hover:underline">
              Inicia sesión
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
