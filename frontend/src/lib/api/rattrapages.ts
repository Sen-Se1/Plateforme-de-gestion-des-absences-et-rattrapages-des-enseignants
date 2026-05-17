import { fetchWithAuth } from "../api";
import { Rattrapage } from "@/types/rattrapage";

const BASE_URL = "/rattrapages";

export async function getUpcomingRattrapages(perPage: number = 5): Promise<{ items: Rattrapage[] }> {
  return fetchWithAuth<{ items: Rattrapage[] }>(`${BASE_URL}/a-venir?per_page=${perPage}`);
}
