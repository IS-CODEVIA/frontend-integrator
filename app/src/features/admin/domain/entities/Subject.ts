export interface Subject {
  subjectID: number;
  subjectCode: string | null;
  subjectName: string;
  description: string | null;
  archived: boolean;
}

export interface CreateSubjectInput {
  subjectCode?: string;
  subjectName: string;
  description?: string;
}

export interface UpdateSubjectInput {
  subjectID: number;
  subjectCode?: string;
  subjectName?: string;
  description?: string;
}
