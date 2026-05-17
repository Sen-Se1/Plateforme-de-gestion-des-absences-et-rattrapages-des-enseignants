"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getGroupes } from "@/lib/api/groupes";
import { getTimetableByGroupe } from "@/lib/api/emploisDuTemps";
import { GroupeResponse } from "@/types/groupe";
import { EmploiDuTempsResponse } from "@/types/emploiDuTemps";
import { WeeklyTimetable } from "@/components/timetable/WeeklyTimetable";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Users, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminTimetablePage() {
  const [groups, setGroups] = useState<GroupeResponse[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [courses, setCourses] = useState<EmploiDuTempsResponse[]>([]);
  
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    setLoadingGroups(true);
    setError(null);
    try {
      const response = await getGroupes(1, 100);
      setGroups(response.items || []);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération de la liste des groupes");
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const loadTimetable = useCallback(async (groupId: number) => {
    setLoadingTimetable(true);
    setError(null);
    try {
      const response = await getTimetableByGroupe(groupId, 1, 100);
      setCourses(response.items || []);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération de l'emploi du temps");
    } finally {
      setLoadingTimetable(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleGroupSelect = (value: string | null) => {
    if (!value) {
      setSelectedGroupId("");
      setCourses([]);
      return;
    }
    setSelectedGroupId(value);
    loadTimetable(parseInt(value, 10));
  };

  const handleRefresh = () => {
    if (selectedGroupId) {
      loadTimetable(parseInt(selectedGroupId, 10));
    } else {
      loadGroups();
    }
  };

  const selectedGroup = groups.find((g) => g.id.toString() === selectedGroupId);

  if (loadingGroups) return <LoadingSpinner className="min-h-[60vh]" />;
  if (error && !selectedGroupId) return <ErrorMessage message={error} onRetry={loadGroups} />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestion des Emplois du Temps</h1>
            <p className="text-slate-500 mt-1">Consultez et exportez les plannings de cours par groupe.</p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2 bg-white border-slate-200">
          <RefreshCw size={14} className={loadingTimetable ? "animate-spin" : ""} />
          Actualiser
        </Button>
      </div>

      {/* Selector Dropdown Card */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users size={18} className="text-blue-500" />
            Sélection du Groupe
          </CardTitle>
          <CardDescription>
            Choisissez un groupe d'étudiants pour charger son emploi du temps hebdomadaire complet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Select value={selectedGroupId} onValueChange={handleGroupSelect}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-200/80">
                <span className="truncate">
                  {selectedGroup 
                    ? `👥 ${selectedGroup.nom} ${selectedGroup.departement?.nom ? `(${selectedGroup.departement.nom})` : ""}` 
                    : "Sélectionner un groupe..."}
                </span>
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    👥 {group.nom} {group.departement?.nom ? `(${group.departement.nom})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Display Area */}
      {selectedGroupId ? (
        loadingTimetable ? (
          <LoadingSpinner className="min-h-[40vh]" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => loadTimetable(parseInt(selectedGroupId, 10))} />
        ) : (
          <WeeklyTimetable
            courses={courses}
            title={`Emploi du temps - ${selectedGroup?.nom || "Groupe"}`}
            subtitle={selectedGroup?.departement?.nom ? `Département : ${selectedGroup.departement.nom}` : "Planning hebdomadaire"}
          />
        )
      ) : (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <Info size={40} className="stroke-[1.5] text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">Aucun groupe sélectionné</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Veuillez sélectionner un groupe dans la liste déroulante ci-dessus pour afficher sa grille horaire hebdomadaire.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
