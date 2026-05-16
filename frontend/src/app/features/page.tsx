import React from "react";
import { 
  ClipboardCheck, 
  Search, 
  BarChart, 
  Settings, 
  Users, 
  CalendarDays, 
  BellRing, 
  FileCheck2 
} from "lucide-react";
import Container from "@/components/ui/Container";

export default function FeaturesPage() {
  const roles = [
    {
      title: "Pour les Enseignants",
      color: "border-blue-500",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      features: [
        { icon: ClipboardCheck, title: "Déclaration d'absence", desc: "Formulaire rapide avec ajout de justificatifs numérisés." },
        { icon: CalendarDays, title: "Proposition de rattrapage", desc: "Suggérez des créneaux en fonction des disponibilités réelles." },
        { icon: Search, title: "Historique personnel", desc: "Suivez l'état de vos demandes et vos séances passées." }
      ]
    },
    {
      title: "Pour l'Administration",
      color: "border-amber-500",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      features: [
        { icon: FileCheck2, title: "Validation en un clic", desc: "Approuvez ou rejetez les demandes avec des motifs clairs." },
        { icon: Settings, title: "Gestion des ressources", desc: "Gérez les salles, les départements et les matières." },
        { icon: BarChart, title: "Statistiques globales", desc: "Analysez les taux d'absence et l'efficacité des rattrapages." }
      ]
    },
    {
      title: "Pour les Étudiants",
      color: "border-green-500",
      bg: "bg-green-50",
      iconColor: "text-green-600",
      features: [
        { icon: BellRing, title: "Alertes instantanées", desc: "Recevez des notifications dès qu'un cours est annulé ou déplacé." },
        { icon: CalendarDays, title: "Planning à jour", desc: "Consultez votre emploi du temps personnalisé en temps réel." },
        { icon: Users, title: "Gestion de groupe", desc: "Sachez exactement quels rattrapages concernent votre groupe." }
      ]
    }
  ];

  return (
    <div className="py-20 bg-white">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h1 className="text-4xl md:text-5xl mb-6">Des fonctionnalités conçues pour l'excellence</h1>
          <p className="text-lg text-slate-secondary">
            Découvrez comment AbsenceFlow transforme la gestion académique pour chaque profil utilisateur.
          </p>
        </div>

        <div className="space-y-32">
          {roles.map((role, idx) => (
            <div key={idx} className={`relative`}>
              <div className={`absolute -left-4 top-0 bottom-0 w-1 border-l-4 ${role.color} rounded-full`}></div>
              <div className="pl-8">
                <h2 className="text-3xl font-bold mb-12 flex items-center gap-4">
                  {role.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {role.features.map((f, i) => (
                    <div key={i} className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className={`p-3 rounded-xl ${role.bg} ${role.iconColor} w-fit mb-6`}>
                        <f.icon size={28} />
                      </div>
                      <h4 className="text-xl font-bold mb-3">{f.title}</h4>
                      <p className="text-slate-secondary text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Detail Section */}
        <section className="mt-40 bg-slate-50 rounded-[2.5rem] p-12 md:p-20 border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl mb-6">Un socle technique robuste et moderne</h2>
              <ul className="space-y-4">
                {[
                  "Détection automatique des conflits de planning",
                  "Gestion intelligente de la disponibilité des salles",
                  "Système de notification push et email intégré",
                  "API REST documentée pour une intégration facile",
                  "Interface responsive optimisée pour mobile et tablette"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                      <FileCheck2 size={12} />
                    </div>
                    <span className="text-slate-primary font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-inner border border-slate-200 font-mono text-xs text-slate-400 overflow-hidden h-64">
              <div className="space-y-2">
                <p className="text-blue-600">GET /api/v1/absences</p>
                <p className="text-slate-300">{"{"}</p>
                <p className="ml-4">"items": [</p>
                <p className="ml-8">{"{"} "id": 1, "status": "pending", "date": "2026-05-20" {"}"}</p>
                <p className="ml-4">],</p>
                <p className="ml-4">"total": 1</p>
                <p className="text-slate-300">{"}"}</p>
                <div className="mt-6 border-t pt-4">
                  <p className="text-green-600">POST /api/v1/rattrapages</p>
                  <p className="text-slate-300">{"{"}</p>
                  <p className="ml-4">"absence_id": 1, "salle_id": 105, "date": "2026-05-22"</p>
                  <p className="text-slate-300">{"}"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
