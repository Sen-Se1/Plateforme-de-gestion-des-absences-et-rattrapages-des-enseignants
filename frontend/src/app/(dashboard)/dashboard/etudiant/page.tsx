"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileWarning,
  CalendarCheck2,
  BookOpen,
  RefreshCw,
  GraduationCap,
  Calendar,
  MapPin,
  Clock3,
  Search,
  Table as TableIcon
} from "lucide-react";
import { getStudentStats } from "@/lib/api/dashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { StudentStats } from "@/types/dashboard";

export default function StudentDashboard() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentStats();
      setStats(data);
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
          <h1 className="text-3xl font-bold text-slate-900">Espace Étudiant</h1>
          <p className="text-slate-500 mt-1">Suivez vos cours et vos séances de rattrapage.</p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm" className="gap-2">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualiser
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Cours / Semaine"
          value={stats.cours?.total_cours_par_semaine || 0}
          icon={BookOpen}
          description={`Groupes : ${stats.cours?.groupes_appartenance?.join(", ") || "Aucun"}`}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <StatCard
          title="Absences Profs"
          value={stats.absences_enseignants?.total || 0}
          icon={FileWarning}
          description={`${stats.absences_enseignants?.validees || 0} absences confirmées`}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatCard
          title="Rattrapages"
          value={stats.rattrapages?.total || 0}
          icon={CalendarCheck2}
          description={`${stats.rattrapages?.valides || 0} confirmés`}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          title="A venir"
          value={stats.rattrapages?.a_venir || 0}
          icon={GraduationCap}
          description="Séances programmées"
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* Upcoming Rattrapages Table */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <CalendarCheck2 size={20} />
            </div>
            <CardTitle className="text-lg">Prochaines Séances de Rattrapage</CardTitle>
          </div>
          <Link href="/dashboard/rattrapages">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-primary gap-2">
              <Search size={14} />
              Voir tout
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {stats.list_rattrapages_a_venir.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matière</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Horaire</TableHead>
                  <TableHead>Salle</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.list_rattrapages_a_venir.map((item, index) => (
                  <TableRow key={index} className="group transition-colors">
                    <TableCell className="font-bold text-slate-900">
                      {item.matiere}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(item.date_proposee).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock3 size={14} className="text-slate-400" />
                        {item.heure_debut} - {item.heure_fin}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 gap-1 font-medium">
                        <MapPin size={10} />
                        {item.salle}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-slate-200" />
              </div>
              <p className="text-slate-500 font-medium">Aucune séance de rattrapage prévue prochainement.</p>
              <p className="text-xs text-slate-400 mt-1">Vous recevrez une notification dès qu'une séance sera programmée.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
