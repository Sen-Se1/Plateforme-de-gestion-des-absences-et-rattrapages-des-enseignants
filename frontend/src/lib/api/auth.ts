import { fetchWithAuth } from "../api";

export interface UpdateProfileRequest {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe?: string;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<any> {
  return fetchWithAuth("/auth/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
