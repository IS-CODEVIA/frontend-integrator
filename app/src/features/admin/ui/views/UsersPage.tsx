"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AdminApiRepository } from "../../infrastructure/api/AdminApiRepository";
import type { User } from "../../domain/entities/User";
import { Button } from "@/app/src/common/ui/Button";
import { Card } from "@/app/src/common/ui/Card";
import { Badge } from "@/app/src/common/ui/Badge";
import { Modal } from "@/app/src/common/ui/Modal";
import { Table } from "@/app/src/common/ui/Table";
import { formatDate, roleName } from "@/app/src/core/lib/utils";

const repo = new AdminApiRepository();
const ROLES = [
  { id: 0, name: "Todos" },
  { id: 1, name: "Estudiantes" },
  { id: 2, name: "Profesores" },
  { id: 3, name: "Administradores" },
];

type LoadingState = "initial" | "idle" | "filtering";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("initial");
  const [roleFilter, setRoleFilter] = useState(0);
  const [changingRole, setChangingRole] = useState<{ user: User; roleID: number } | null>(null);
  const mountedRef = useRef(true);

  const loadAll = useCallback(async () => {
    const [s, t, a] = await Promise.all([
      repo.listUsers(1),
      repo.listUsers(2),
      repo.listUsers(3),
    ]);
    if (mountedRef.current) {
      setUsers([...s, ...t, ...a]);
      setLoadingState("idle");
    }
  }, []);

  const loadByRole = useCallback(async (roleID: number) => {
    const data = await repo.listUsers(roleID);
    if (mountedRef.current) {
      setUsers(data);
      setLoadingState("idle");
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (roleFilter === 0) {
      loadAll();
    } else {
      loadByRole(roleFilter);
    }
  }, [roleFilter, loadAll, loadByRole]);

  const handleRoleChange = async () => {
    if (!changingRole) return;
    try {
      await repo.updateUserRole(changingRole.user.userID, changingRole.roleID);
      setChangingRole(null);
      if (roleFilter === 0) loadAll();
      else loadByRole(roleFilter);
    } catch (err: unknown) {
      const e = err as { response?: { errors?: Array<{ message: string }> } };
      alert(e?.response?.errors?.[0]?.message ?? "Error al cambiar rol");
    }
  };

  const roleBadge = (roleID: number) => {
    const variants: Record<number, "info" | "success" | "warning"> = {
      1: "warning",
      2: "success",
      3: "info",
    };
    return <Badge variant={variants[roleID] ?? "default"}>{roleName(roleID)}</Badge>;
  };

  if (loadingState === "initial") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00CFBB] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C258F] font-[family-name:var(--font-poppins)]">
            Usuarios
          </h1>
          <p className="mt-1 text-sm text-[#6f797a] font-[family-name:var(--font-nunito)]">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <Button
              key={r.id}
              variant={roleFilter === r.id ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setLoadingState("filtering");
                setRoleFilter(r.id);
              }}
            >
              {r.name}
            </Button>
          ))}
        </div>
      </div>

      <Card padding={false}>
        {loadingState === "filtering" ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#00CFBB] border-t-transparent" />
          </div>
        ) : (
          <Table
            columns={[
              { key: "name", header: "Nombre" },
              { key: "email", header: "Correo" },
              {
                key: "roleID",
                header: "Rol",
                className: "w-32",
                render: (u: User) => roleBadge(u.roleID),
              },
              {
                key: "createdAt",
                header: "Registrado",
                className: "w-36",
                render: (u: User) => (
                  <span className="text-[#6f797a] text-xs">{formatDate(u.createdAt)}</span>
                ),
              },
              {
                key: "actions",
                header: "Acciones",
                className: "w-40 text-right",
                render: (u: User) => (
                  <div className="flex justify-end gap-2">
                    {[1, 2, 3].map((rid) =>
                      rid !== u.roleID ? (
                        <button
                          key={rid}
                          onClick={() => setChangingRole({ user: u, roleID: rid })}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#1C258F] hover:bg-[#dbe1ff] transition-colors cursor-pointer"
                        >
                          Hacer {roleName(rid)}
                        </button>
                      ) : null,
                    )}
                  </div>
                ),
              },
            ]}
            data={users}
            keyExtractor={(u) => u.userID}
            emptyMessage="No hay usuarios con ese rol"
          />
        )}
      </Card>

      <Modal
        open={!!changingRole}
        onClose={() => setChangingRole(null)}
        title="Cambiar rol de usuario"
      >
        {changingRole && (
          <div className="space-y-4">
            <p className="text-sm text-[#171d1e] font-[family-name:var(--font-nunito)]">
              ¿Cambiar el rol de <strong>{changingRole.user.name}</strong> a{" "}
              <strong>{roleName(changingRole.roleID)}</strong>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setChangingRole(null)}>
                Cancelar
              </Button>
              <Button variant="secondary" onClick={handleRoleChange}>
                Confirmar cambio
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
