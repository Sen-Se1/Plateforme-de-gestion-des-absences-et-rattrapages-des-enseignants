"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getGroupes } from "@/lib/api/groupes";
import { getMatieres } from "@/lib/api/matieres";
import { getSalles } from "@/lib/api/salles";
import { getTimetableByGroupe, getTimetableByMatiere, getTimetableBySalle } from "@/lib/api/emploisDuTemps";
import { GroupeResponse } from "@/types/groupe";
import { MatiereResponse } from "@/types/matiere";
import { SalleResponse } from "@/types/salle";
import { EmploiDuTempsResponse } from "@/types/emploiDuTemps";
import { WeeklyTimetable } from "@/components/timetable/WeeklyTimetable";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, BookOpen, MapPin, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminTimetablePage() {
  const [groups, setGroups] = useState<GroupeResponse[]>([]);
  const [matieres, setMatieres] = useState<MatiereResponse[]>([]);
  const [salles, setSalles] = useState<SalleResponse[]>([]);
  
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedMatiereId, setSelectedMatiereId] = useState<string>("");
  const [selectedSalleId, setSelectedSalleId] = useState<string>("");
  
  const [activeTab, setActiveTab] = useState("groupe");
  const [courses, setCourses] = useState<EmploiDuTempsResponse[]>([]);
  
  const [loadingData, setLoadingData] = useState(true);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    setLoadingData(true);
    setError(null);
    try {
      const [groupsRes, matieresRes, sallesRes] = await Promise.all([
        getGroupes(1, 100),
        getMatieres(1, 100),
        getSalles(1, 100)
      ]);
      setGroups(groupsRes.items || []);
      setMatieres(matieresRes.items || []);
      setSalles(sallesRes.items || []);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération des données");
    } finally {
      setLoadingData(false);
    }
  }, []);

  const loadTimetable = useCallback(async (id: number, type: "groupe" | "matiere" | "salle") => {
    setLoadingTimetable(true);
    setError(null);
    try {
      let response;
      if (type === "groupe") {
        response = await getTimetableByGroupe(id, 1, 100);
      } else if (type === "matiere") {
        response = await getTimetableByMatiere(id, 1, 100);
      } else if (type === "salle") {
        response = await getTimetableBySalle(id, 1, 100);
      }
      setCourses(response?.items || []);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération de l'emploi du temps");
    } finally {
      setLoadingTimetable(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCourses([]);
    if (value === "groupe" && selectedGroupId) {
      loadTimetable(parseInt(selectedGroupId, 10), "groupe");
    } else if (value === "matiere" && selectedMatiereId) {
      loadTimetable(parseInt(selectedMatiereId, 10), "matiere");
    } else if (value === "salle" && selectedSalleId) {
      loadTimetable(parseInt(selectedSalleId, 10), "salle");
    }
  };

  const handleGroupSelect = (value: string | null) => {
    if (!value) {
      setSelectedGroupId("");
      setCourses([]);
      return;
    }
    setSelectedGroupId(value);
    loadTimetable(parseInt(value, 10), "groupe");
  };

  const handleMatiereSelect = (value: string | null) => {
    if (!value) {
      setSelectedMatiereId("");
      setCourses([]);
      return;
    }
    setSelectedMatiereId(value);
    loadTimetable(parseInt(value, 10), "matiere");
  };

  const handleSalleSelect = (value: string | null) => {
    if (!value) {
      setSelectedSalleId("");
      setCourses([]);
      return;
    }
    setSelectedSalleId(value);
    loadTimetable(parseInt(value, 10), "salle");
  };

  const handleRefresh = () => {
    if (activeTab === "groupe" && selectedGroupId) {
      loadTimetable(parseInt(selectedGroupId, 10), "groupe");
    } else if (activeTab === "matiere" && selectedMatiereId) {
      loadTimetable(parseInt(selectedMatiereId, 10), "matiere");
    } else if (activeTab === "salle" && selectedSalleId) {
      loadTimetable(parseInt(selectedSalleId, 10), "salle");
    } else {
      loadInitialData();
    }
  };

  const selectedGroup = groups.find((g) => g.id.toString() === selectedGroupId);
  const selectedMatiere = matieres.find((m) => m.id.toString() === selectedMatiereId);
  const selectedSalle = salles.find((s) => s.id.toString() === selectedSalleId);

  if (loadingData) return <LoadingSpinner className="min-h-[60vh]" />;
  if (error && !selectedGroupId && !selectedMatiereId && !selectedSalleId) return <ErrorMessage message={error} onRetry={loadInitialData} />;

  const getTabIcon = () => {
    if (activeTab === "groupe") return <Users size={18} className="text-blue-500" />;
    if (activeTab === "matiere") return <BookOpen size={18} className="text-indigo-500" />;
    if (activeTab === "salle") return <MapPin size={18} className="text-emerald-500" />;
    return <Calendar size={18} className="text-blue-500" />;
  };

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
            <p className="text-slate-500 mt-1">Consultez et exportez les plannings par groupe, matière ou salle.</p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2 bg-white border-slate-200">
          <RefreshCw size={14} className={loadingTimetable ? "animate-spin" : ""} />
          Actualiser
        </Button>
      </div>

      {/* Selector Dropdown Card with Tabs */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {getTabIcon()}
            Sélection de l'Emploi du Temps
          </CardTitle>
          <CardDescription>
            Basculez entre la vue par groupe d'étudiants, par matière ou par salle pour charger la grille horaire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-6 grid grid-cols-3 max-w-lg">
              <TabsTrigger value="groupe" className="gap-2"><Users size={14}/> Par Groupe</TabsTrigger>
              <TabsTrigger value="matiere" className="gap-2"><BookOpen size={14}/> Par Matière</TabsTrigger>
              <TabsTrigger value="salle" className="gap-2"><MapPin size={14}/> Par Salle</TabsTrigger>
            </TabsList>
            
            <TabsContent value="groupe" className="max-w-md m-0">
              <Select value={selectedGroupId} onValueChange={handleGroupSelect}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200/80">
                  <span className="truncate">
                    {selectedGroup 
                      ? `${selectedGroup.nom} ${selectedGroup.departement?.nom ? `(${selectedGroup.departement.nom})` : ""}` 
                      : "Sélectionner un groupe..."}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.nom} {group.departement?.nom ? `(${group.departement.nom})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>

            <TabsContent value="matiere" className="max-w-md m-0">
              <Select value={selectedMatiereId} onValueChange={handleMatiereSelect}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200/80">
                  <span className="truncate">
                    {selectedMatiere 
                      ? `${selectedMatiere.nom} ${selectedMatiere.enseignant ? `(Pr. ${selectedMatiere.enseignant.nom})` : ""}` 
                      : "Sélectionner une matière..."}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {matieres.map((matiere) => (
                    <SelectItem key={matiere.id} value={matiere.id.toString()}>
                      {matiere.nom} {matiere.enseignant ? `(Pr. ${matiere.enseignant.nom})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>

            <TabsContent value="salle" className="max-w-md m-0">
              <Select value={selectedSalleId} onValueChange={handleSalleSelect}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200/80">
                  <span className="truncate">
                    {selectedSalle 
                      ? `${selectedSalle.nom} (Capacité: ${selectedSalle.capacite})` 
                      : "Sélectionner une salle..."}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {salles.map((salle) => (
                    <SelectItem key={salle.id} value={salle.id.toString()}>
                      {salle.nom} (Cap: {salle.capacite})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Timetable Display Area */}
      {(activeTab === "groupe" ? selectedGroupId : activeTab === "matiere" ? selectedMatiereId : selectedSalleId) ? (
        loadingTimetable ? (
          <LoadingSpinner className="min-h-[40vh]" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={handleRefresh} />
        ) : (
          <WeeklyTimetable
            courses={courses}
            viewType={activeTab as any}
            title={
              activeTab === "groupe" ? `Groupe : ${selectedGroup?.nom || "Groupe"}` : 
              activeTab === "matiere" ? `Matière : ${selectedMatiere?.nom || "Matière"}` :
              `Salle : ${selectedSalle?.nom || "Salle"}`
            }
            subtitle={
              activeTab === "groupe" ? (selectedGroup?.departement?.nom ? `Département : ${selectedGroup.departement.nom}` : "") : 
              activeTab === "matiere" ? (selectedMatiere?.departement?.nom ? `Département : ${selectedMatiere.departement.nom}` : "") :
              ""
            }
          />
        )
      ) : (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <Info size={40} className="stroke-[1.5] text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">Aucune sélection</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Veuillez sélectionner une option dans la liste déroulante ci-dessus pour afficher la grille horaire hebdomadaire.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
