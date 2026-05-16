export interface Rattrapage {
  id: number;
  date_proposee: string;
  heure_debut: string;
  heure_fin: string;
  statut: "propose" | "valide" | "annule";
  matiere?: { nom: string };
  salle?: { nom: string };
}
