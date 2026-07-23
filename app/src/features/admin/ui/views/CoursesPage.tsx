"use client";

import { useState, useEffect, useRef, startTransition } from "react";
import { AdminApiRepository } from "../../infrastructure/api/AdminApiRepository";
import type { Course } from "../../domain/entities/Course";
import type { Subject } from "../../domain/entities/Subject";
import type { User } from "../../domain/entities/User";
import { Card } from "@/app/src/common/ui/Card";
import { Badge } from "@/app/src/common/ui/Badge";
import { formatDate } from "@/app/src/core/lib/utils";

const repo = new AdminApiRepository();

type LoadState = "loading" | "ready";

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    Promise.all([
      repo.listCourses(),
      repo.listSubjects(),
      repo.listUsers(2),
    ])
      .then(([c, s, t]) => {
        startTransition(() => {
          if (mounted.current) {
            setCourses(c);
            setSubjects(s);
            setTeachers(t);
            setLoadState("ready");
          }
        });
      })
      .catch(() => {
        startTransition(() => {
          if (mounted.current) {
            setLoadState("ready");
          }
        });
      });
  }, []);

  const subjectMap = new Map(subjects.map((s) => [s.subjectID, s]));
  const teacherMap = new Map(teachers.map((t) => [t.userID, t]));

  if (loadState === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00CFBB] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1C258F] font-[family-name:var(--font-poppins)]">
          Asignaturas
        </h1>
        <p className="mt-1 text-sm text-[#6f797a] font-[family-name:var(--font-nunito)]">
          Cursos o grupos creados a partir de las materias base
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-[#6f797a]">
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-sm font-[family-name:var(--font-nunito)]">
            No hay asignaturas (cursos) registradas aún
          </p>
          <p className="text-xs text-[#6f797a] font-[family-name:var(--font-nunito)]">
            Los profesores pueden crear asignaturas desde la app móvil
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const subject = subjectMap.get(course.subjectID);
            const teacher = teacherMap.get(course.teacherID);
            return (
              <Card key={course.courseID}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#171d1e] font-[family-name:var(--font-poppins)]">
                      {course.courseName}
                    </h3>
                    <p className="text-xs text-[#6f797a] font-[family-name:var(--font-nunito)]">
                      {subject?.subjectName ?? "Materia desconocida"}
                    </p>
                  </div>
                  <Badge variant="info">{course.section}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#6f797a] font-semibold font-[family-name:var(--font-nunito)]">
                      Periodo
                    </p>
                    <p className="text-sm text-[#171d1e] font-[family-name:var(--font-nunito)]">
                      {course.period}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#6f797a] font-semibold font-[family-name:var(--font-nunito)]">
                      Código
                    </p>
                    <p className="text-sm font-bold text-[#00CFBB] tracking-widest font-[family-name:var(--font-nunito)]">
                      {course.joinCode}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#bfc8ca]/30 pt-3 space-y-2">
                  {teacher && (
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1C258F] text-white text-[10px] font-bold shrink-0">
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#171d1e] truncate font-[family-name:var(--font-nunito)]">
                          {teacher.name}
                        </p>
                        <p className="text-xs text-[#6f797a] truncate font-[family-name:var(--font-nunito)]">
                          Profesor
                        </p>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-[#6f797a] font-[family-name:var(--font-nunito)]">
                    Creado el {formatDate(course.createdAt)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
