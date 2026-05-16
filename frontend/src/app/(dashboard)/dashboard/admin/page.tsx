"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  FileWarning, 
  CalendarCheck2, 
  GraduationCap,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;
  const role = (user as any)?.role;

  useEffect(() => {
    if (status === "authenticated" && role !== "admin_systeme" && role !== "administration") {
      // Redirect if not admin
      if (role === "enseignant") router.push("/dashboard/enseignant");
      else if (role === "etudiant") router.push("/dashboard/etudiant");
      else router.push("/dashboard");
    }
  }, [status, role, router]);

  if (status === "loading") return <div>Chargement...</div>;
  if (!user || (role !== "admin_systeme" && role !== "administration")) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tableau de Bord Administrateur</h1>
          <p className="text-slate-500 mt-1">Supervision globale de l'établissement.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Enseignants", value: "85", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Étudiants", value: "1,240", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Absences en attente", value: "14", icon: FileWarning, color: "text-amber-600", bg: "bg-amber-50" },
          { title: "Rattrapages ce mois", value: "42", icon: CalendarCheck2, color: "text-green-600", bg: "bg-green-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={28} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Dernières demandes de validation</CardTitle>
          <CardDescription>Actions requises pour les absences et rattrapages.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-400">
            <FileWarning size={48} className="mx-auto mb-4 opacity-20" />
            <p>Aucune demande urgente en attente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
