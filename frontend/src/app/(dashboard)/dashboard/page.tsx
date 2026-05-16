"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { 
  FileWarning, 
  CalendarCheck2, 
  Clock, 
  Users,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Page d'accueil du Dashboard (Vue d'ensemble)
 * Affiche des statistiques rapides et les dernières activités.
 * API: Les données réelles seront récupérées via GET /api/v1/statistiques (à venir)
 */
export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const stats = [
    { title: "Absences déclarées", value: "12", icon: FileWarning, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Rattrapages validés", value: "8", icon: CalendarCheck2, color: "text-green-600", bg: "bg-green-50" },
    { title: "Heures à rattraper", value: "14h", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Étudiants impactés", value: "450", icon: Users, color: "text-primary", bg: "bg-primary/5" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Bienvenue, {user?.prenom} 👋
        </h1>
        <p className="text-slate-500 mt-2">
          Voici ce qui se passe sur votre plateforme aujourd'hui.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
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
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-green-600">
                <TrendingUp size={14} />
                <span>+12% par rapport au mois dernier</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Activités Récentes</CardTitle>
            <CardDescription>Suivez les dernières actions sur la plateforme.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { type: "absence", msg: "Déclaration d'absence par M. Dupont", date: "Il y a 2 heures", status: "En attente" },
                { type: "rattrapage", msg: "Rattrapage validé pour le Groupe L2 Info", date: "Il y a 5 heures", status: "Validé" },
                { type: "user", msg: "Nouvel étudiant inscrit dans le département Info", date: "Hier", status: "Nouveau" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 pb-6 border-b last:border-none last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    {item.type === "absence" ? <FileWarning size={18} /> : item.type === "rattrapage" ? <CalendarCheck2 size={18} /> : <Users size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 leading-none">{item.msg}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.date}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">{item.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Notifications */}
        <Card className="border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-sm font-bold text-primary">Réunion de département</p>
                <p className="text-xs text-slate-600 mt-1">Demain à 14h00 en Salle B202.</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-sm font-bold text-amber-700">Justificatif manquant</p>
                <p className="text-xs text-amber-600 mt-1">Absence du 12/05 (Dupont Jean).</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
