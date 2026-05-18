"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getMyTimetableAsTeacher, getTimetableByMatiere } from "@/lib/api/emploisDuTemps";
import { getMatieresByEnseignant } from "@/lib/api/matieres";
import { EmploiDuTempsResponse } from "@/types/emploiDuTemps";
import { MatiereResponse } from "@/types/matiere";
import { WeeklyTimetable } from "@/components/timetable/WeeklyTimetable";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, RefreshCw, UserRound, BookOpen, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeacherTimetablePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const [activeTab, setActiveTab] = useState("personnel");
  const [matieres, setMatieres] = useState<MatiereResponse[]>([]);
  const [selectedMatiereId, setSelectedMatiereId] = useState<string>("");
  
  const [courses, setCourses] = useState<EmploiDuTempsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMatieres = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await getMatieresByEnseignant(parseInt(userId), 1, 100);
      setMatieres(response.items || []);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  const loadTimetable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (activeTab === "personnel") {
        response = await getMyTimetableAsTeacher(1, 100);
      } else if (activeTab === "matiere" && selectedMatiereId) {
        response = await getTimetableByMatiere(parseInt(selectedMatiereId), 1, 100);
      } else {
        setCourses([]);
        setLoading(false);
        return;
      }
      setCourses(response.items || []);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération de l'emploi du temps");
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedMatiereId]);

  useEffect(() => {
    if (userId) loadMatieres();
  }, [userId, loadMatieres]);

  useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCourses([]);
  };

  const handleMatiereSelect = (value: string | null) => {
    setSelectedMatiereId(value || "");
  };

  const selectedMatiere = matieres.find((m) => m.id.toString() === selectedMatiereId);

  if (loading && courses.length === 0 && !selectedMatiereId && activeTab === "matiere") {
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mon Emploi du Temps</h1>
            <p className="text-slate-500 mt-1">Consultez votre planning global ou filtrez par matière enseignée.</p>
          </div>
        </div>
        <Button onClick={loadTimetable} variant="outline" size="sm" className="gap-2 bg-white border-slate-200">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualiser
        </Button>
      </div>

      {/* Unified Tab Container Card */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TabsList className="grid grid-cols-2 max-w-sm">
                <TabsTrigger value="personnel" className="gap-2"><UserRound size={14}/> Planning Global</TabsTrigger>
                <TabsTrigger value="matiere" className="gap-2"><BookOpen size={14}/> Par Matière</TabsTrigger>
              </TabsList>

              {activeTab === "matiere" && (
                <div className="w-full sm:max-w-[280px]">
                  <Select value={selectedMatiereId} onValueChange={handleMatiereSelect}>
                    <SelectTrigger className="w-full bg-white border-slate-200">
                      <span className="truncate">
                        {selectedMatiere ? `${selectedMatiere.nom}` : "Sélectionner une de vos matières..."}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {matieres.map((matiere) => (
                        <SelectItem key={matiere.id} value={matiere.id.toString()}>
                          {matiere.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </Tabs>
        </div>

        <CardContent className="p-0">
          {/* Timetable Display Area */}
          {activeTab === "matiere" && !selectedMatiereId ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-slate-400">
              <Info size={40} className="stroke-[1.5] text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">Aucune matière sélectionnée</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Veuillez sélectionner l'une de vos matières assignées dans la liste déroulante pour afficher son planning.
              </p>
            </div>
          ) : loading ? (
            <div className="p-12"><LoadingSpinner className="min-h-[30vh]" /></div>
          ) : error ? (
            <div className="p-6"><ErrorMessage message={error} onRetry={loadTimetable} /></div>
          ) : (
            <div className="p-4 sm:p-6">
              <WeeklyTimetable
                courses={courses}
                viewType={activeTab as any}
                title={activeTab === "personnel" ? "Emploi du temps - Enseignant" : `Emploi du temps - Matière : ${selectedMatiere?.nom}`}
                subtitle={activeTab === "personnel" ? "" : (selectedMatiere?.departement?.nom ? `Département : ${selectedMatiere.departement.nom}` : "")}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
