import type { Subject, CreateSubjectInput, UpdateSubjectInput } from "../entities/Subject";
import type { Course, CourseDetail, TeacherProfile } from "../entities/Course";
import type { User } from "../entities/User";

export interface AdminRepository {
  listSubjects(): Promise<Subject[]>;
  listProfessors(): Promise<TeacherProfile[]>;
  createSubject(input: CreateSubjectInput): Promise<Subject>;
  updateSubject(input: UpdateSubjectInput): Promise<Subject>;
  deleteSubject(subjectID: number): Promise<boolean>;
  archiveSubject(subjectID: number): Promise<Subject>;
  unarchiveSubject(subjectID: number): Promise<Subject>;

  listUsers(roleID?: number): Promise<User[]>;
  updateUserRole(userID: number, roleID: number): Promise<boolean>;

  listCourses(): Promise<Course[]>;
  getCourseDetail(courseID: number): Promise<CourseDetail>;

  getDashboardStats(): Promise<{
    totalSubjects: number;
    totalCourses: number;
    totalStudents: number;
    totalTeachers: number;
  }>;
}
