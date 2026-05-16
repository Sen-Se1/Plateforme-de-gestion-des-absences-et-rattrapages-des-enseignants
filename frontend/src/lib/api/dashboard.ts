import { fetchWithAuth } from "../api";
import { AdminStats, TeacherStats, StudentStats } from "@/types/dashboard";

export async function getAdminStats(): Promise<AdminStats> {
  return fetchWithAuth("/dashboard/admin/stats");
}

export async function getTeacherStats(): Promise<TeacherStats> {
  return fetchWithAuth("/dashboard/enseignant/stats");
}

export async function getStudentStats(): Promise<StudentStats> {
  return fetchWithAuth("/dashboard/etudiant/stats");
}
