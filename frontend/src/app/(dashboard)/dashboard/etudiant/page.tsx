"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { getStudentStats } from "@/lib/api/dashboard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { StudentStats } from "@/types/dashboard";
import { formatDate, formatTime } from "@/utils/dateUtils";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";

function parseDateForBadge(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { day: dateStr, month: "" };
    const day = d.getDate().toString();
    const month = d.toLocaleDateString("fr-FR", { month: "short" });
    return { day, month: month.replace(".", "") };
  } catch {
    return { day: dateStr, month: "" };
  }
}

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

  // Mini Chart data calculation
  const absencesPieData = [
    { name: "Confirmées", value: stats.absences_enseignants?.validees || 0, fill: "var(--chart-3)" },
    { name: "En attente", value: stats.absences_enseignants?.en_attente || 0, fill: "var(--chart-4)" },
  ];
  const hasAbsencesData = (stats.absences_enseignants?.validees || 0) > 0 || (stats.absences_enseignants?.en_attente || 0) > 0;
  const displayAbsencesData = hasAbsencesData 
    ? absencesPieData 
    : [{ name: "Aucune", value: 1, fill: "var(--slate-100)" }];

  const rattrapagesPieData = [
    { name: "Confirmés", value: stats.rattrapages?.valides || 0, fill: "var(--chart-3)" },
    { name: "Proposés", value: stats.rattrapages?.proposes || 0, fill: "var(--chart-2)" },
  ];
  const hasRattrapagesData = (stats.rattrapages?.valides || 0) > 0 || (stats.rattrapages?.proposes || 0) > 0;
  const displayRattrapagesData = hasRattrapagesData 
    ? rattrapagesPieData 
    : [{ name: "Aucun", value: 1, fill: "var(--slate-100)" }];

  // Circular gauge for cours/semaine
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const maxCours = 10;
  const totalCours = stats.cours?.total_cours_par_semaine || 0;
  const coursPct = Math.min(100, Math.round((totalCours / maxCours) * 100));
  const coursStrokeOffset = circumference - (coursPct / 100) * circumference;

  // Circular gauge for a_venir sessions relative to total rattrapages
  const aVenirVal = stats.rattrapages?.a_venir || 0;
  const aVenirTotal = stats.rattrapages?.total || 0;
  const aVenirPct = aVenirTotal > 0 ? Math.min(100, Math.round((aVenirVal / aVenirTotal) * 100)) : 0;
  const aVenirStrokeOffset = circumference - (aVenirPct / 100) * circumference;

  // Main comparison overview data
  const overviewData = [
    { name: "Cours / Sem.", value: totalCours, fill: "var(--chart-1)" },
    { name: "Absences Profs", value: stats.absences_enseignants?.total || 0, fill: "var(--chart-5)" },
    { name: "Rattrapages", value: stats.rattrapages?.total || 0, fill: "var(--chart-3)" },
    { name: "Séances À Venir", value: aVenirVal, fill: "var(--chart-2)" },
  ];

  const overviewConfig = {
    value: {
      label: "Quantité",
    }
  } satisfies ChartConfig;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-poppins">Espace Étudiant</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Suivez vos cours et vos séances de rattrapage.</p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm" className="gap-2 shadow-sm">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualiser
        </Button>
      </div>

      {/* Modern Grid of 4 visual stats cards (without icons, using elegant gauges/mini-charts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Cours / Semaine */}
        <Card className="border-none shadow-sm flex items-center justify-between p-5 bg-white hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cours / Semaine</span>
            <span className="text-3xl font-extrabold text-slate-900 block font-poppins">{totalCours}</span>
            <span className="text-xs text-slate-500 font-medium block truncate max-w-[150px]">
              Groupes : {stats.cours?.groupes_appartenance?.join(", ") || "Aucun"}
            </span>
          </div>
          <div className="relative flex items-center justify-center w-[54px] h-[54px] shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="27" cy="27" r={radius} className="stroke-slate-100" strokeWidth="5" fill="transparent" />
              <circle
                cx="27"
                cy="27"
                r={radius}
                className="stroke-indigo-600 transition-all duration-500 ease-in-out"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={coursStrokeOffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[9px] font-extrabold text-indigo-700 font-poppins">{coursPct}%</span>
          </div>
        </Card>

        {/* Card 2: Absences Profs */}
        <Card className="border-none shadow-sm flex items-center justify-between p-5 bg-white hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Absences Profs</span>
            <span className="text-3xl font-extrabold text-slate-900 block font-poppins">{stats.absences_enseignants?.total || 0}</span>
            <span className="text-xs text-slate-500 font-medium block">
              {stats.absences_enseignants?.validees || 0} confirmées
            </span>
          </div>
          <ChartContainer config={{}} className="h-[54px] w-[54px] shrink-0">
            <PieChart width={54} height={54}>
              <Pie
                data={displayAbsencesData}
                dataKey="value"
                nameKey="name"
                innerRadius={15}
                outerRadius={25}
                strokeWidth={1.5}
                stroke="#ffffff"
              />
            </PieChart>
          </ChartContainer>
        </Card>

        {/* Card 3: Rattrapages */}
        <Card className="border-none shadow-sm flex items-center justify-between p-5 bg-white hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Rattrapages</span>
            <span className="text-3xl font-extrabold text-slate-900 block font-poppins">{stats.rattrapages?.total || 0}</span>
            <span className="text-xs text-slate-500 font-medium block">
              {stats.rattrapages?.valides || 0} confirmés
            </span>
          </div>
          <ChartContainer config={{}} className="h-[54px] w-[54px] shrink-0">
            <PieChart width={54} height={54}>
              <Pie
                data={displayRattrapagesData}
                dataKey="value"
                nameKey="name"
                innerRadius={15}
                outerRadius={25}
                strokeWidth={1.5}
                stroke="#ffffff"
              />
            </PieChart>
          </ChartContainer>
        </Card>

        {/* Card 4: À venir */}
        <Card className="border-none shadow-sm flex items-center justify-between p-5 bg-white hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">À venir</span>
            <span className="text-3xl font-extrabold text-slate-900 block font-poppins">{aVenirVal}</span>
            <span className="text-xs text-slate-500 font-medium block">Séances programmées</span>
          </div>
          <div className="relative flex items-center justify-center w-[54px] h-[54px] shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="27" cy="27" r={radius} className="stroke-slate-100" strokeWidth="5" fill="transparent" />
              <circle
                cx="27"
                cy="27"
                r={radius}
                className="stroke-sky-500 transition-all duration-500 ease-in-out"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={aVenirStrokeOffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[9px] font-extrabold text-sky-700 font-poppins">{aVenirPct}%</span>
          </div>
        </Card>
      </div>

      {/* Main Section Grid: Timeline & Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Timeline of Upcoming Makeup Sessions */}
        <Card className="border-none shadow-sm lg:col-span-2 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">Prochaines Séances de Rattrapage</CardTitle>
              <CardDescription className="text-xs mt-1">Vos séances planifiées à venir en format calendrier.</CardDescription>
            </div>
            <Link href="/dashboard/etudiant/rattrapages">
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-primary text-xs font-semibold">
                Voir tout
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="h-full flex flex-col justify-start">
            {stats.list_rattrapages_a_venir && stats.list_rattrapages_a_venir.length > 0 ? (
              <div className="space-y-4">
                {stats.list_rattrapages_a_venir.map((item, index) => {
                  const { day, month } = parseDateForBadge(item.date);
                  return (
                    <div 
                      key={index} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50/80 border border-slate-100 rounded-2xl gap-4 hover:shadow-xs transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        {/* Premium Date Calendar Badge (No Icons) */}
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center font-poppins shrink-0 shadow-xs">
                          <span className="text-lg font-extrabold text-slate-800 leading-none">{day}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none mt-1">{month}</span>
                        </div>
                        
                        {/* Session Details */}
                        <div>
                          <span className="font-bold text-slate-800 text-sm block">{item.matiere}</span>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-slate-500 font-medium mt-1">
                            <span>{formatDate(item.date, false)}</span>
                            <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300" />
                            <span>{formatTime(item.heure_debut)} - {formatTime(item.heure_fin)}</span>
                            <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300" />
                            <span>Salle {item.salle}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="self-end sm:self-auto">
                        <Badge className="bg-emerald-50 text-emerald-700 border-none hover:bg-emerald-50 text-xs px-3 py-1 font-semibold rounded-full shadow-none">
                          Confirmé
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                <p className="text-slate-500 font-medium">Aucune séance de rattrapage prévue prochainement.</p>
                <p className="text-xs text-slate-400 mt-1">Vous serez informé dès qu'un enseignant programmera un rattrapage.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right side: Academic Overview Chart */}
        <Card className="border-none shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Bilan Académique</CardTitle>
            <CardDescription className="text-xs mt-1">Comparaison des indicateurs de votre profil.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={overviewConfig} className="h-[210px] w-full">
              <BarChart data={overviewData} layout="vertical" margin={{ left: 5, right: 10, top: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-slate-100" />
                <XAxis type="number" tickLine={false} axisLine={false} className="text-slate-400 text-[10px]" />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} className="text-slate-500 font-bold text-[10px]" width={85} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ChartContainer>
            
            <div className="space-y-3 mt-6 pt-2 border-t border-slate-50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Total Cours suivis</span>
                <span className="font-bold text-slate-800">
                  {stats.cours?.matieres_suivies?.length || 0} matière(s)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Absences prof non-justifiées</span>
                <span className="font-bold text-slate-800">
                  {stats.absences_enseignants?.en_attente || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
