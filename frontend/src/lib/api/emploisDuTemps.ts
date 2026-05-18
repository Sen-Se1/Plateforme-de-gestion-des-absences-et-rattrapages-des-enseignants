import { fetchWithAuth } from "../api";
import { PaginatedResponse } from "@/types/groupe";
import { EmploiDuTempsResponse, CreateEmploiDuTempsPayload, UpdateEmploiDuTempsPayload } from "@/types/emploiDuTemps";

const BASE_URL = "/emplois-du-temps";

export async function getTimetableByGroupe(
  groupeId: number,
  page = 1,
  perPage = 100,
  jourSemaine?: number
): Promise<PaginatedResponse<EmploiDuTempsResponse>> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    ...(jourSemaine !== undefined && { jour_semaine: jourSemaine.toString() }),
  });
  return fetchWithAuth<PaginatedResponse<EmploiDuTempsResponse>>(`${BASE_URL}/groupe/${groupeId}?${params}`);
}

export async function getMyTimetableAsStudent(
  page = 1,
  perPage = 100,
  jourSemaine?: number
): Promise<PaginatedResponse<EmploiDuTempsResponse>> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    ...(jourSemaine !== undefined && { jour_semaine: jourSemaine.toString() }),
  });
  return fetchWithAuth<PaginatedResponse<EmploiDuTempsResponse>>(`${BASE_URL}/etudiant?${params}`);
}

export async function getMyTimetableAsTeacher(
  page = 1,
  perPage = 100,
  jourSemaine?: number
): Promise<PaginatedResponse<EmploiDuTempsResponse>> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    ...(jourSemaine !== undefined && { jour_semaine: jourSemaine.toString() }),
  });
  return fetchWithAuth<PaginatedResponse<EmploiDuTempsResponse>>(`${BASE_URL}/enseignant?${params}`);
}

export async function getTimetableBySalle(
  salleId: number,
  page = 1,
  perPage = 100,
  jourSemaine?: number
): Promise<PaginatedResponse<EmploiDuTempsResponse>> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    ...(jourSemaine !== undefined && { jour_semaine: jourSemaine.toString() }),
  });
  return fetchWithAuth<PaginatedResponse<EmploiDuTempsResponse>>(`${BASE_URL}/salle/${salleId}?${params}`);
}

export async function getTimetableByMatiere(
  matiereId: number,
  page = 1,
  perPage = 100,
  jourSemaine?: number
): Promise<PaginatedResponse<EmploiDuTempsResponse>> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    ...(jourSemaine !== undefined && { jour_semaine: jourSemaine.toString() }),
  });
  return fetchWithAuth<PaginatedResponse<EmploiDuTempsResponse>>(`${BASE_URL}/matiere/${matiereId}?${params}`);
}

export async function createEmploiDuTemps(data: CreateEmploiDuTempsPayload): Promise<EmploiDuTempsResponse> {
  return fetchWithAuth<EmploiDuTempsResponse>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEmploiDuTemps(id: number, data: UpdateEmploiDuTempsPayload): Promise<EmploiDuTempsResponse> {
  return fetchWithAuth<EmploiDuTempsResponse>(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEmploiDuTemps(id: number): Promise<void> {
  return fetchWithAuth<void>(`${BASE_URL}/${id}`, { method: "DELETE" });
}
