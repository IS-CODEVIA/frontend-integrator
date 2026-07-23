export interface Course {
  courseID: number;
  courseName: string;
  section: string;
  period: string;
  joinCode: string;
  subjectID: number;
  teacherID: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfile {
  userID: number;
  name: string;
  email: string;
  avatarURL: string | null;
  courses: Course[];
}

export interface CourseDetail {
  courseID: number;
  courseName: string;
  section: string;
  period: string;
  joinCode: string;
  subjectID: number;
  createdAt: string;
  updatedAt: string;
  teacher: { userID: number; name: string; email: string } | null;
  students: Array<{ userID: number; name: string; email: string }>;
}
