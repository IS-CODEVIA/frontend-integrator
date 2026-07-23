import { gqlClient } from "@/app/src/core/api/graphql-client";
import type { Subject, CreateSubjectInput, UpdateSubjectInput } from "../../domain/entities/Subject";
import type { Course, CourseDetail, TeacherProfile } from "../../domain/entities/Course";
import type { User } from "../../domain/entities/User";
import type { AdminRepository } from "../../domain/interfaces/AdminRepository";

const SUBJECT_FRAGMENT = `subjectID subjectCode subjectName description archived`;
const USER_FRAGMENT = `userID name email avatarURL roleID createdAt updatedAt`;
const COURSE_FRAGMENT = `courseID courseName section period joinCode subjectID teacherID createdAt updatedAt`;

export class AdminApiRepository implements AdminRepository {
  async listSubjects(): Promise<Subject[]> {
    return gqlClient()
      .request<{ subjects: Subject[] }>(`query { subjects { ${SUBJECT_FRAGMENT} } }`)
      .then((r) => r.subjects);
  }

  async createSubject(input: CreateSubjectInput): Promise<Subject> {
    return gqlClient()
      .request<{ createSubject: Subject }>(
        `mutation ($input: CreateSubjectInput!) { createSubject(input: $input) { ${SUBJECT_FRAGMENT} } }`,
        { input },
      )
      .then((r) => r.createSubject);
  }

  async updateSubject(input: UpdateSubjectInput): Promise<Subject> {
    return gqlClient()
      .request<{ updateSubject: Subject }>(
        `mutation ($input: UpdateSubjectInput!) { updateSubject(input: $input) { ${SUBJECT_FRAGMENT} } }`,
        { input },
      )
      .then((r) => r.updateSubject);
  }

  async deleteSubject(subjectID: number): Promise<boolean> {
    return gqlClient()
      .request<{ deleteSubject: boolean }>(
        `mutation ($subjectID: Int!) { deleteSubject(subjectID: $subjectID) }`,
        { subjectID },
      )
      .then((r) => r.deleteSubject);
  }

  async archiveSubject(subjectID: number): Promise<Subject> {
    return gqlClient()
      .request<{ archiveSubject: Subject }>(
        `mutation ($subjectID: Int!) { archiveSubject(subjectID: $subjectID) { ${SUBJECT_FRAGMENT} } }`,
        { subjectID },
      )
      .then((r) => r.archiveSubject);
  }

  async unarchiveSubject(subjectID: number): Promise<Subject> {
    return gqlClient()
      .request<{ unarchiveSubject: Subject }>(
        `mutation ($subjectID: Int!) { unarchiveSubject(subjectID: $subjectID) { ${SUBJECT_FRAGMENT} } }`,
        { subjectID },
      )
      .then((r) => r.unarchiveSubject);
  }

  async listUsers(roleID?: number): Promise<User[]> {
    return gqlClient()
      .request<{ users: User[] }>(
        `query ($roleID: Int) { users(roleID: $roleID) { ${USER_FRAGMENT} } }`,
        { roleID },
      )
      .then((r) => r.users);
  }

  async updateUserRole(userID: number, roleID: number): Promise<boolean> {
    return gqlClient()
      .request<{ updateUserRole: boolean }>(
        `mutation ($input: UpdateUserRoleInput!) { updateUserRole(input: $input) }`,
        { input: { userID, roleID } },
      )
      .then((r) => r.updateUserRole);
  }

  async listCourses(): Promise<Course[]> {
    return gqlClient()
      .request<{ courses: Course[] }>(
        `query { courses { ${COURSE_FRAGMENT} } }`,
      )
      .then((r) => r.courses);
  }

  async getCourseDetail(courseID: number): Promise<CourseDetail> {
    return gqlClient()
      .request<{ courseDetail: CourseDetail }>(
        `query ($courseID: Int!) {
          courseDetail(courseID: $courseID) {
            courseID courseName section period joinCode subjectID createdAt updatedAt
            teacher { userID name email }
            students { userID name email }
          }
        }`,
        { courseID },
      )
      .then((r) => r.courseDetail);
  }

  async listProfessors(): Promise<TeacherProfile[]> {
    return gqlClient()
      .request<{ teachers: TeacherProfile[] }>(
        `query {
          teachers {
            userID name email avatarURL
            courses { courseID courseName section period joinCode subjectID teacherID createdAt updatedAt }
          }
        }`,
      )
      .then((r) => r.teachers);
  }

  async getDashboardStats(): Promise<{
    totalSubjects: number;
    totalCourses: number;
    totalStudents: number;
    totalTeachers: number;
  }> {
    const [subjects, courses, students, teachers] = await Promise.all([
      this.listSubjects(),
      this.listCourses(),
      this.listUsers(1),
      this.listUsers(2),
    ]);
    return {
      totalSubjects: subjects.length,
      totalCourses: courses.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
    };
  }
}
