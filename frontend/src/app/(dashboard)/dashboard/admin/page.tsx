"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  FileWarning, 
  CalendarCheck2, 
  GraduationCap,
  ShieldCheck,
  Building2,
  BookOpen,
  RefreshCw,
  Clock
} from "lucide-react";
import { getAdminStats } from "@/lib/api/dashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { AdminStats } from "@/types/dashboard";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération des statistiques");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) return <LoadingSpinner className="min-h-[60vh]" />;
  if (error) return <ErrorMessage message={error} onRetry={loadStats} />;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tableau de Bord Administrateur</h1>
            <p className="text-slate-500 mt-1">Supervision globale de l'établissement.</p>
          </div>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm" className="gap-2">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualiser
        </Button>
      </div>

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Utilisateurs" 
          value={stats.users?.total_users || 0} 
          icon={Users} 
          description={`${stats.users?.total_enseignants || 0} enseignants, ${stats.users?.total_etudiants || 0} étudiants`}
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        <StatCard 
          title="Enseignants" 
          value={stats.users?.total_enseignants || 0} 
          icon={Users} 
          color="text-indigo-600" 
          bg="bg-indigo-50" 
        />
        <StatCard 
          title="Étudiants" 
          value={stats.users?.total_etudiants || 0} 
          icon={GraduationCap} 
          color="text-purple-600" 
          bg="bg-purple-50" 
        />
        <StatCard 
          title="Staff Admin" 
          value={stats.users?.total_administrations || 0} 
          icon={ShieldCheck} 
          color="text-slate-600" 
          bg="bg-slate-50" 
        />
      </div>

      {/* Absences & Rattrapages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileWarning size={20} className="text-amber-500" />
            Statistiques des Absences
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard 
              title="Absences en attente" 
              value={stats.absences?.absences_en_attente || 0} 
              icon={FileWarning} 
              color="text-amber-600" 
              bg="bg-amber-50" 
            />
            <StatCard 
              title="Validées" 
              value={stats.absences?.absences_validees || 0} 
              icon={CalendarCheck2} 
              color="text-green-600" 
              bg="bg-green-50" 
            />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <RefreshCw size={20} className="text-primary" />
            Statistiques des Rattrapages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard 
              title="Proposés" 
              value={stats.rattrapages?.rattrapages_proposes || 0} 
              icon={BookOpen} 
              color="text-primary" 
              bg="bg-primary/5" 
            />
            <StatCard 
              title="Confirmés" 
              value={stats.rattrapages?.rattrapages_valides || 0} 
              icon={CalendarCheck2} 
              color="text-green-600" 
              bg="bg-green-50" 
            />
          </div>
        </div>
      </div>

      {/* Infrastructure */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 size={20} className="text-slate-500" />
          Infrastructure & Emploi du Temps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Salles de cours" 
            value={stats.salles_et_cours?.total_salles || 0} 
            icon={Building2} 
            color="text-slate-700" 
            bg="bg-slate-100" 
          />
          <StatCard 
            title="Matières" 
            value={stats.salles_et_cours?.total_matieres || 0} 
            icon={BookOpen} 
            color="text-blue-700" 
            bg="bg-blue-100" 
          />
          <StatCard 
            title="Groupes" 
            value={stats.salles_et_cours?.total_groupes || 0} 
            icon={Users} 
            color="text-indigo-700" 
            bg="bg-indigo-100" 
          />
          <StatCard 
            title="Cours / Semaine" 
            value={stats.salles_et_cours?.total_cours_par_semaine || 0} 
            icon={Clock} 
            color="text-purple-700" 
            bg="bg-purple-100" 
          />
        </div>
      </div>
    </div>
  );
}
