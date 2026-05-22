"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getMyTimetableAsStudent } from "@/lib/api/emploisDuTemps";
import { EmploiDuTempsResponse } from "@/types/emploiDuTemps";
import { WeeklyTimetable } from "@/components/timetable/WeeklyTimetable";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentTimetablePage() {
  const [courses, setCourses] = useState<EmploiDuTempsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTimetable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyTimetableAsStudent(1, 100);
      setCourses(response.items || []);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération de votre emploi du temps");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  if (loading) return <LoadingSpinner className="min-h-[60vh]" />;
  if (error) return <ErrorMessage message={error} onRetry={loadTimetable} />;

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
            <p className="text-slate-500 mt-1">Consultez votre planning hebdomadaire de cours et exportez-le en PDF.</p>
          </div>
        </div>
        <Button onClick={loadTimetable} variant="outline" size="sm" className="gap-2 bg-white border-slate-200">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualiser
        </Button>
      </div>

      {/* Timetable Grid Card */}
      <WeeklyTimetable
        courses={courses}
        title={courses.length > 0 ? `Groupe : ${courses[0].groupe?.nom || ""}` : "Mon Groupe"}
        subtitle={courses.length > 0 ? `Département : ${courses[0].matiere?.departement?.nom || ""}` : ""}
      />
    </div>
  );
}
