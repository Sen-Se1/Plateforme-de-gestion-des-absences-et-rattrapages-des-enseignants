import { fetchWithAuth } from "../api";
import { Rattrapage } from "@/types/rattrapage";

export async function getUpcomingRattrapages(perPage: number = 5): Promise<{ items: Rattrapage[] }> {
  return fetchWithAuth(`/rattrapages/a-venir?per_page=${perPage}`);
}
