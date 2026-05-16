"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Clock,
  BookOpen,
  Bell,
  GraduationCap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EtudiantDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;
  const role = (user as any)?.role;

  useEffect(() => {
    if (status === "authenticated" && role !== "etudiant") {
      if (role === "admin_systeme" || role === "administration") router.push("/dashboard/admin");
      else if (role === "enseignant") router.push("/dashboard/enseignant");
      else router.push("/dashboard");
    }
  }, [status, role, router]);

  if (status === "loading") return <div>Chargement...</div>;
  if (!user || role !== "etudiant") return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Espace Étudiant</h1>
        <p className="text-slate-500 mt-1">Consultez vos rattrapages et votre emploi du temps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-primary text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Calendar size={32} />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Prochain Rattrapage</p>
                <p className="text-xl font-bold mt-1">Demain à 10h30</p>
                <p className="text-xs text-blue-100/80 mt-1">Génie Logiciel • Salle A12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl">
                <Bell size={32} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Notifications</p>
                <p className="text-xl font-bold mt-1">2 nouvelles</p>
                <p className="text-xs text-slate-400 mt-1">Dernière mise à jour : il y a 10 min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Séances de Rattrapage Prévues</CardTitle>
            <CardDescription>Liste des séances de rattrapage programmées pour votre groupe.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { subject: "Génie Logiciel", prof: "M. Kabbaj", date: "18 Mai 2024", time: "10h30 - 12h30", room: "Salle A12" },
                { subject: "Architecture SI", prof: "Mme. Alaoui", date: "20 Mai 2024", time: "14h00 - 16h00", room: "Amphi C" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-primary"><BookOpen size={18} /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.subject}</p>
                      <p className="text-xs text-slate-500">{item.prof}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock size={14} /> <span>{item.date} • {item.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <GraduationCap size={14} /> <span>{item.room}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Cours Annulés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-sm font-bold text-amber-800">Réseaux Mobiles</p>
                <p className="text-xs text-amber-700 mt-1">Séance du 16/05 annulée.</p>
                <p className="text-[10px] text-amber-600 mt-2">Rattrapage à venir.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
