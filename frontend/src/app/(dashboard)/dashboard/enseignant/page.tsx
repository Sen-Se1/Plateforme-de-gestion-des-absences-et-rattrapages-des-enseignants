"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  FileWarning, 
  CalendarCheck2, 
  BookOpen,
  RefreshCw,
  PlusCircle,
  Calendar,
  MapPin,
  Clock3
} from "lucide-react";
import { getTeacherStats } from "@/lib/api/dashboard";
import { getUpcomingRattrapages } from "@/lib/api/rattrapages";
import { Rattrapage } from "@/types/rattrapage";
import { StatCard } from "@/components/dashboard/StatCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TeacherStats } from "@/types/dashboard";

export default function TeacherDashboard() {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [upcoming, setUpcoming] = useState<Rattrapage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, upcomingData] = await Promise.all([
        getTeacherStats(),
        getUpcomingRattrapages(5)
      ]);
      setStats(statsData);
      setUpcoming(upcomingData.items || []);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération des données");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingSpinner className="min-h-[60vh]" />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Espace Enseignant</h1>
          <p className="text-slate-500 mt-1">Gérez vos absences et planifiez vos rattrapages.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadData} variant="outline" size="sm" className="gap-2">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualiser
          </Button>
          <Link href="/dashboard/absences/new">
            <Button size="sm" className="gap-2">
              <PlusCircle size={14} />
              Déclarer une Absence
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Mes Absences" 
          value={stats.absences?.total_absences || 0} 
          icon={FileWarning} 
          description={`${stats.absences?.absences_en_attente || 0} en attente de validation`}
          color="text-amber-600" 
          bg="bg-amber-50" 
        />
        <StatCard 
          title="Mes Rattrapages" 
          value={stats.rattrapages?.total_rattrapages || 0} 
          icon={CalendarCheck2} 
          description={`${stats.rattrapages?.rattrapages_valides || 0} séances confirmées`}
          color="text-primary" 
          bg="bg-primary/5" 
        />
        <StatCard 
          title="Charge de cours" 
          value={stats.cours?.total_cours_par_semaine || 0} 
          icon={BookOpen} 
          description={`Enseigne à : ${stats.cours?.groupes_enseignes?.join(", ") || "Aucun groupe"}`}
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detailed Status Breakdown */}
        <Card className="border-none shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Statut des Absences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg text-amber-700">
              <span className="text-sm font-medium">En attente</span>
              <span className="font-bold">{stats.absences?.absences_en_attente || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg text-green-700">
              <span className="text-sm font-medium">Validées</span>
              <span className="font-bold">{stats.absences?.absences_validees || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg text-red-700">
              <span className="text-sm font-medium">Rejetées</span>
              <span className="font-bold">{stats.absences?.absences_rejetees || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Rattrapages Table */}
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Rattrapages à Venir</CardTitle>
            <Link href="/dashboard/rattrapages" className="text-sm text-primary hover:underline">
              Tout voir
            </Link>
          </CardHeader>
          <CardContent>
            {upcoming.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Heure</TableHead>
                    <TableHead>Matière</TableHead>
                    <TableHead>Salle</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcoming.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400" />
                            {new Date(item.date_proposee).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock3 size={12} className="text-slate-400" />
                            {item.heure_debut} - {item.heure_fin}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.matiere?.nom || "Non spécifiée"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1 font-normal">
                          <MapPin size={10} />
                          {item.salle?.nom || "A définir"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.statut === "valide" ? "default" : "secondary"}
                          className={item.statut === "valide" ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {item.statut === "valide" ? "Confirmé" : "En attente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                <p>Aucun rattrapage programmé pour le moment.</p>
                <Link href="/dashboard/rattrapages/new">
                  <Button variant="link" className="text-primary mt-2">
                    Proposer un rattrapage
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
