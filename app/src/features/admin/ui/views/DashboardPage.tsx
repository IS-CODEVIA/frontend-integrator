"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminApiRepository } from "../../infrastructure/api/AdminApiRepository";
import { Card, CardGrid } from "@/app/src/common/ui/Card";
import { Badge } from "@/app/src/common/ui/Badge";

interface Stats {
  totalSubjects: number;
  totalCourses: number;
  totalStudents: number;
  totalTeachers: number;
}

const repo = new AdminApiRepository();

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    repo.getDashboardStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00CFBB] border-t-transparent" />
      </div>
    );
  }

  const cards = [
    { label: "Materias", value: stats?.totalSubjects ?? 0, color: "bg-[#00CFBB]" },
    { label: "Cursos", value: stats?.totalCourses ?? 0, color: "bg-[#1C258F]" },
    { label: "Estudiantes", value: stats?.totalStudents ?? 0, color: "bg-[#006b60]" },
    { label: "Profesores", value: stats?.totalTeachers ?? 0, color: "bg-[#C7622B]" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1C258F] font-[family-name:var(--font-poppins)]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#6f797a] font-[family-name:var(--font-nunito)]">
          Resumen del sistema SAAU
        </p>
      </div>

      <CardGrid>
        {cards.map((c) => (
          <Card key={c.label}>
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.color}`}>
                <span className="text-lg font-bold text-white">
                  {c.value}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6f797a] uppercase tracking-wider font-[family-name:var(--font-nunito)]">
                  {c.label}
                </p>
                <p className="text-2xl font-bold text-[#171d1e] font-[family-name:var(--font-poppins)]">
                  {c.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </CardGrid>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-base font-bold text-[#1C258F] font-[family-name:var(--font-poppins)]">
            Acciones rápidas
          </h3>
          <div className="space-y-2">
            <a
              href="/admin/subjects"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#1C258F] hover:bg-[#dbe1ff] transition-colors font-[family-name:var(--font-nunito)]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00CFBB] text-white text-sm">+</span>
              Agregar nueva materia
            </a>
            <a
              href="/admin/users"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#1C258F] hover:bg-[#dbe1ff] transition-colors font-[family-name:var(--font-nunito)]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C258F] text-white text-sm">👤</span>
              Gestionar usuarios
            </a>
            <a
              href="/admin/courses"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#1C258F] hover:bg-[#dbe1ff] transition-colors font-[family-name:var(--font-nunito)]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#006b60] text-white text-sm">📚</span>
              Ver cursos
            </a>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-base font-bold text-[#1C258F] font-[family-name:var(--font-poppins)]">
            Roles en el sistema
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#171d1e] font-[family-name:var(--font-nunito)]">Administradores</span>
              <Badge variant="info">Admin</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#171d1e] font-[family-name:var(--font-nunito)]">Profesores</span>
              <Badge variant="success">Teacher</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#171d1e] font-[family-name:var(--font-nunito)]">Estudiantes</span>
              <Badge variant="warning">Student</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
