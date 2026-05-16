"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  FileWarning, 
  CalendarCheck2, 
  Clock,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EnseignantDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;
  const role = (user as any)?.role;

  useEffect(() => {
    if (status === "authenticated" && role !== "enseignant") {
      if (role === "admin_systeme" || role === "administration") router.push("/dashboard/admin");
      else if (role === "etudiant") router.push("/dashboard/etudiant");
      else router.push("/dashboard");
    }
  }, [status, role, router]);

  if (status === "loading") return <div>Chargement...</div>;
  if (!user || role !== "enseignant") return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Espace Enseignant</h1>
          <p className="text-slate-500 mt-1">Gérez vos absences et planifiez vos rattrapages.</p>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2">
            Déclarer une absence <FileWarning size={18} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Mes Absences", value: "3", sub: "Ce semestre", icon: FileWarning, color: "text-amber-600", bg: "bg-amber-50" },
          { title: "Rattrapages", value: "2", sub: "À venir", icon: CalendarCheck2, color: "text-green-600", bg: "bg-green-50" },
          { title: "Heures à rattraper", value: "4h", sub: "Total", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={28} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Dernières Absences</CardTitle>
              <CardDescription>Historique de vos déclarations récentes.</CardDescription>
            </div>
            <Link href="/dashboard/absences" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              Tout voir <ArrowRight size={14} />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg"><BookOpen className="text-slate-400" size={18} /></div>
                  <div>
                    <p className="text-sm font-bold">Base de Données</p>
                    <p className="text-xs text-slate-500">12 Mai 2024 • 08h30 - 10h30</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">En attente</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Prochaines Séances de Rattrapage</CardTitle>
            <CardDescription>Votre planning de rattrapages validés.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-400">
              <CalendarCheck2 size={40} className="mx-auto mb-3 opacity-20" />
              <p>Aucun rattrapage prévu cette semaine.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
