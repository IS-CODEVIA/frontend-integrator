"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { AdminApiRepository } from "../../infrastructure/api/AdminApiRepository";
import type { Subject, CreateSubjectInput, UpdateSubjectInput } from "../../domain/entities/Subject";
import { Button } from "@/app/src/common/ui/Button";
import { Input } from "@/app/src/common/ui/Input";
import { Card } from "@/app/src/common/ui/Card";
import { Badge } from "@/app/src/common/ui/Badge";
import { Modal } from "@/app/src/common/ui/Modal";
import { Table } from "@/app/src/common/ui/Table";

const repo = new AdminApiRepository();

export function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const load = useCallback(() => {
    repo.listSubjects().then(setSubjects).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setFormCode("");
    setFormDescription("");
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditing(s);
    setFormName(s.subjectName);
    setFormCode(s.subjectCode ?? "");
    setFormDescription(s.description ?? "");
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        const input: UpdateSubjectInput = { subjectID: editing.subjectID };
        if (formName !== editing.subjectName) input.subjectName = formName;
        if (formCode !== (editing.subjectCode ?? "")) input.subjectCode = formCode;
        if (formDescription !== (editing.description ?? "")) input.description = formDescription;
        await repo.updateSubject(input);
      } else {
        const input: CreateSubjectInput = { subjectName: formName };
        if (formCode) input.subjectCode = formCode;
        if (formDescription) input.description = formDescription;
        await repo.createSubject(input);
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { errors?: Array<{ message: string }> } };
      setError(e?.response?.errors?.[0]?.message ?? "Error al guardar");
    }
  };

  const handleDelete = async (s: Subject) => {
    if (!confirm(`¿Eliminar "${s.subjectName}"?`)) return;
    try {
      await repo.deleteSubject(s.subjectID);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { errors?: Array<{ message: string }> } };
      alert(e?.response?.errors?.[0]?.message ?? "Error al eliminar");
    }
  };

  const handleArchive = async (s: Subject) => {
    try {
      if (s.archived) {
        await repo.unarchiveSubject(s.subjectID);
      } else {
        await repo.archiveSubject(s.subjectID);
      }
      load();
    } catch (err: unknown) {
      const e = err as { response?: { errors?: Array<{ message: string }> } };
      alert(e?.response?.errors?.[0]?.message ?? "Error al cambiar estado");
    }
  };

  if (loading) {
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
            Materias
          </h1>
          <p className="mt-1 text-sm text-[#6f797a] font-[family-name:var(--font-nunito)]">
            Gestiona las materias del sistema
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} className="self-start sm:self-auto">
          + Nueva materia
        </Button>
      </div>

      <Card padding={false}>
        <Table
          columns={[
            { key: "subjectCode", header: "Código", className: "w-24" },
            { key: "subjectName", header: "Nombre" },
            {
              key: "description",
              header: "Descripción",
              render: (s: Subject) => (
                <span className="text-[#6f797a]">{s.description ?? "—"}</span>
              ),
            },
            {
              key: "archived",
              header: "Estado",
              className: "w-24",
              render: (s: Subject) => (
                <Badge variant={s.archived ? "warning" : "success"}>
                  {s.archived ? "Archivada" : "Activa"}
                </Badge>
              ),
            },
            {
              key: "actions",
              header: "Acciones",
              className: "w-48 text-right",
              render: (s: Subject) => (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openEdit(s)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#1C258F] hover:bg-[#dbe1ff] transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleArchive(s)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#006b60] hover:bg-[#b3f5ed] transition-colors cursor-pointer"
                  >
                    {s.archived ? "Activar" : "Archivar"}
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              ),
            },
          ]}
          data={subjects}
          keyExtractor={(s) => s.subjectID}
          emptyMessage="No hay materias registradas"
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar materia" : "Nueva materia"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de la materia"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Ej: Cálculo Diferencial"
            required
          />
          <Input
            label="Código"
            value={formCode}
            onChange={(e) => setFormCode(e.target.value)}
            placeholder="Ej: CAL-101"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1C258F] font-[family-name:var(--font-nunito)]">
              Descripción
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Descripción opcional"
              rows={3}
              className="w-full rounded-xl border-2 border-[#bfc8ca] bg-white px-4 py-2.5 text-sm text-[#171d1e] font-[family-name:var(--font-nunito)] placeholder:text-[#6f797a] outline-none transition-colors focus:border-[#1C258F] focus:ring-2 focus:ring-[#dbe1ff] resize-none"
            />
          </div>
          {error && (
            <div className="rounded-xl bg-[#ffdad6] px-4 py-3 text-sm text-[#8c0d0d] font-[family-name:var(--font-nunito)]">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="secondary">
              {editing ? "Guardar cambios" : "Crear materia"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
