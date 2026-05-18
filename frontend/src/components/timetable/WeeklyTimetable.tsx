"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Calendar, AlertTriangle, Printer, UserRound, MapPin, Clock } from "lucide-react";
import { EmploiDuTempsResponse } from "@/types/emploiDuTemps";
import {
  DAYS_OF_WEEK,
  DEFAULT_TIME_SLOTS,
  buildTimetableGrid,
  getDayName,
} from "@/utils/timetableUtils";
import { exportTimetableToPDF } from "@/utils/pdfExport";

interface WeeklyTimetableProps {
  courses: EmploiDuTempsResponse[];
  title?: string;
  subtitle?: string;
  showDayFilter?: boolean;
  onDayChange?: (day: number | null) => void;
  viewType?: "groupe" | "matiere" | "salle" | "personnel";
}

export function WeeklyTimetable({
  courses,
  title = "Emploi du temps",
  subtitle,
  showDayFilter = true,
  onDayChange,
  viewType = "groupe",
}: WeeklyTimetableProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const handleDayChange = (value: string | null) => {
    const dayVal = value === null || value === "all" ? null : parseInt(value, 10);
    setSelectedDay(dayVal);
    if (onDayChange) {
      onDayChange(dayVal);
    }
  };

  const columns = [0, 1, 2, 3, 4, 5];
  if (courses.some((c) => c.jour_semaine === 6)) {
    columns.push(6);
  }

  const displayedDays = selectedDay !== null ? [selectedDay] : columns;

  const timetableGrid = buildTimetableGrid(courses, DEFAULT_TIME_SLOTS);

  const handleExportPDF = async () => {
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-emploi.pdf`;
    await exportTimetableToPDF("timetable-capture-container", filename);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Controls Header - Excluded from PDF export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {showDayFilter && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jour:</span>
              <Select value={selectedDay === null ? "all" : selectedDay.toString()} onValueChange={handleDayChange}>
                <SelectTrigger className="w-[180px] bg-white border-slate-200">
                  <span className="truncate">
                    {selectedDay === null ? "Toute la semaine" : `${DAYS_OF_WEEK[selectedDay]}`}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toute la semaine</SelectItem>
                  {DAYS_OF_WEEK.map((day, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button variant="outline" size="sm" onClick={handlePrint} className="bg-white border-slate-200 gap-1.5 text-slate-700">
            <Printer size={16} />
            <span>Imprimer</span>
          </Button>
          <Button size="sm" onClick={handleExportPDF} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors">
            <Download size={16} />
            <span>Exporter en PDF</span>
          </Button>
        </div>
      </div>

      {/* Timetable Capture Area */}
      <Card id="timetable-capture-container" className="overflow-hidden border border-slate-200/80 shadow-sm bg-white">
        <CardHeader className="border-b-2 border-slate-800 bg-white pb-6 pt-6 text-center rounded-t-xl print:border-b-2 print:border-black">
          <div className="flex flex-col items-center justify-center w-full">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 print:text-black">
              Institut Supérieur des Études Technologiques de Tozeur
            </h2>
            
            <div className="w-full max-w-3xl h-[2px] bg-slate-800 my-4 print:bg-black"></div>
            
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight print:text-black">
              {title}
            </h1>
            
            <div className="w-full max-w-3xl h-[2px] bg-slate-800 my-4 print:bg-black"></div>
            
            {subtitle && (
              <p className="text-base md:text-lg font-bold text-slate-800 mb-1 print:text-black">
                {subtitle}
              </p>
            )}
            
            <p className="text-sm font-semibold text-slate-600 print:text-black">
              Emploi du temps
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <Calendar size={48} className="stroke-[1.5] mb-3 text-slate-300" />
              <p className="text-sm font-medium">Aucun cours programmé pour cet emploi du temps.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left min-w-[800px] table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="w-28 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-100 text-center">
                    Horaire
                  </th>
                  {displayedDays.map((dayIdx) => (
                    <th
                      key={dayIdx}
                      className="p-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center border-r border-slate-100 last:border-r-0"
                    >
                      {getDayName(dayIdx)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEFAULT_TIME_SLOTS.map((slot, slotIdx) => (
                  <tr key={slotIdx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/20 transition-colors">
                    {/* Time Slot Header */}
                    <td className="p-3 text-center border-r border-slate-100 font-medium text-slate-600 bg-slate-50/30">
                      <div className="text-xs font-semibold text-slate-800">{slot.label}</div>
                      <div className="text-[10px] text-slate-400 mt-1 tracking-tight">
                        {slot.start} - {slot.end}
                      </div>
                    </td>

                    {/* Day Cells */}
                    {displayedDays.map((dayIdx) => {
                      const cellData = timetableGrid[slotIdx]?.[dayIdx];
                      if (!cellData || !cellData.render) return null;

                      const cellCourses = cellData.courses || [];
                      const hasConflict = cellCourses.length > 1;

                      return (
                        <td
                          key={dayIdx}
                          rowSpan={cellData.rowSpan > 1 ? cellData.rowSpan : undefined}
                          className={`p-2 border-r border-slate-100 last:border-r-0 align-top ${cellData.rowSpan === 1 ? 'h-28' : ''} ${
                            hasConflict ? "bg-red-50/10" : ""
                          }`}
                        >
                          {hasConflict && (
                            <div className="flex items-center gap-1 text-[10px] text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded border border-red-100 mb-1">
                              <AlertTriangle size={11} className="shrink-0 animate-bounce" />
                              <span className="truncate">Conflit ({cellCourses.length})</span>
                            </div>
                          )}

                          {cellCourses.map((course) => {
                            const formatCardTime = (t: string) => {
                              if (!t) return "";
                              const parts = t.split(":");
                              return `${parts[0].padStart(2, "0")}h${parts[1].padStart(2, "0")}`;
                            };
                            
                            const cardMinHeight = cellData.rowSpan > 1 
                              ? `calc(var(--row-height, 7rem) * ${cellData.rowSpan} + ${cellData.rowSpan - 1}px - 1rem)` 
                              : undefined;
                            
                            const firstSlot = DEFAULT_TIME_SLOTS[slotIdx];
                            const lastSlot = DEFAULT_TIME_SLOTS[slotIdx + cellData.rowSpan - 1];
                            const isExactMatch = 
                              formatCardTime(course.heure_debut) === formatCardTime(firstSlot?.start || "") && 
                              formatCardTime(course.heure_fin) === formatCardTime(lastSlot?.end || "");
                            
                            return (
                              <div
                                key={course.id}
                                style={{ minHeight: cardMinHeight }}
                                className={`course-card p-2.5 rounded-lg border text-left shadow-sm transition-all duration-200 relative group flex flex-col ${cellData.rowSpan > 1 ? 'h-full' : ''} ${
                                  course.rattrapage_id
                                    ? "bg-amber-50/70 border-amber-200 hover:bg-amber-50"
                                    : "bg-blue-50/40 border-blue-100 hover:bg-blue-50/60"
                                } mb-1.5 last:mb-0`}
                              >
                                <div className="font-bold text-slate-800 text-xs md:text-sm leading-snug line-clamp-2">
                                  {viewType === "matiere"
                                    ? course.groupe?.nom || "Groupe inconnu"
                                    : viewType === "salle" || viewType === "personnel"
                                      ? `${course.matiere?.nom || "Matière"} (${course.groupe?.nom || "Groupe"})`
                                      : course.matiere?.nom || "Matière inconnue"}
                                </div>
                                
                                {!isExactMatch && (
                                  <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-semibold text-blue-700/80 mt-1">
                                    <Clock size={11} className="shrink-0" />
                                    <span>{formatCardTime(course.heure_debut)} - {formatCardTime(course.heure_fin)}</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-slate-500 mt-1.5 font-medium flex-1">
                                  <UserRound size={12} className="shrink-0 text-slate-400" />
                                  <span className="truncate">
                                    {course.matiere?.enseignant
                                      ? `${course.matiere.enseignant.prenom} ${course.matiere.enseignant.nom}`
                                      : "Non assigné"}
                                  </span>
                                </div>
                                
                                <div className="flex flex-wrap items-center justify-between gap-1.5 mt-2.5">
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] md:text-[10px] font-semibold px-1.5 py-0.5 border-slate-200 bg-white text-slate-700 shrink-0 gap-1 inline-flex items-center"
                                  >
                                    <MapPin size={10} className="text-slate-400" />
                                    <span className="truncate max-w-[90px]">{course.salle?.nom || "N/A"}</span>
                                  </Badge>
                                  
                                  {course.rattrapage_id && (
                                    <span className="text-[8px] md:text-[9px] font-bold text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                      Rattrapage
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      
      {/* CSS style targeting print layout specifically */}
      <style jsx global>{`
        #timetable-capture-container {
          --row-height: 7rem;
        }
        @media print {
          @page {
            size: landscape;
            margin: 5mm;
          }
          body * {
            visibility: hidden;
          }
          #timetable-capture-container, #timetable-capture-container * {
            visibility: visible;
          }
          #timetable-capture-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            --row-height: 4.5rem !important;
          }
          #timetable-capture-container .overflow-x-auto {
            overflow: visible !important;
          }
          #timetable-capture-container .h-28 {
            height: var(--row-height) !important;
          }
          #timetable-capture-container .course-card {
            padding: 0.4rem !important;
          }
          #timetable-capture-container .course-card .text-xs {
            font-size: 0.65rem !important;
            line-height: 0.9rem !important;
          }
          #timetable-capture-container .course-card .mt-1\\.5 {
            margin-top: 0.2rem !important;
          }
          #timetable-capture-container .course-card .mt-2\\.5 {
            margin-top: 0.3rem !important;
          }
        }
      `}</style>
    </div>
  );
}
