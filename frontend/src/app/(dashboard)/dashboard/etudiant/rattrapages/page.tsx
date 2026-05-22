"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar,
  BookOpen,
  MapPin,
  Clock,
  RefreshCw,
  AlertCircle,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getUpcomingRattrapages } from "@/lib/api/rattrapages";
import { RattrapageResponse } from "@/types/rattrapage";
import { formatDate, formatTime } from "@/utils/dateUtils";

export default function StudentRattrapagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;
  const role = user?.role;

  const [rattrapages, setRattrapages] = useState<RattrapageResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Auth protection
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && role !== "etudiant") {
      router.push("/dashboard");
    }
  }, [status, role, router]);

  const fetchRattrapages = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getUpcomingRattrapages(page, perPage);
      setRattrapages(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du chargement des rattrapages");
    } finally {
      setIsLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    if (status === "authenticated" && role === "etudiant") {
      fetchRattrapages();
    }
  }, [fetchRattrapages, status, role]);

  if (status === "loading" || isLoading && rattrapages.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-slate-500">Chargement des rattrapages programmés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rattrapages Prévus</h1>
          <p className="text-sm text-slate-500">Consultez les séances de rattrapage programmées pour vos groupes.</p>
        </div>
        <Button onClick={fetchRattrapages} variant="outline" className="self-start md:self-auto gap-2">
          <RefreshCw size={16} />
          <span>Actualiser</span>
        </Button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {rattrapages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <AlertCircle className="h-10 w-10 text-slate-400 mb-2" />
            <p className="text-slate-600 font-medium">Aucun rattrapage programmé</p>
            <p className="text-slate-400 text-sm text-center">Il n'y a pas de rattrapage de prévu prochainement pour vos cours.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Matière</TableHead>
                  <TableHead className="font-semibold text-slate-700">Enseignant</TableHead>
                  <TableHead className="font-semibold text-slate-700">Date</TableHead>
                  <TableHead className="font-semibold text-slate-700">Horaire</TableHead>
                  <TableHead className="font-semibold text-slate-700">Salle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rattrapages.map((rattrapage) => {
                  const teacher = rattrapage.absence?.enseignant;
                  return (
                    <TableRow key={rattrapage.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={16} className="text-slate-400" />
                          <span>{rattrapage.absence?.matiere?.nom || `ID: ${rattrapage.absence?.matiere_id}`}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                            {teacher ? `${teacher.nom[0]}${teacher.prenom[0]}` : "?"}
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {teacher ? `${teacher.nom} ${teacher.prenom}` : `ID: ${rattrapage.absence?.enseignant_id}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Calendar size={16} className="text-slate-400" />
                          <span>{formatDate(rattrapage.date_proposee)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Clock size={16} className="text-slate-400" />
                          <span>{formatTime(rattrapage.heure_debut)} - {formatTime(rattrapage.heure_fin)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MapPin size={16} className="text-slate-400" />
                          <span>{rattrapage.salle?.nom || `Salle: ${rattrapage.salle_id}`}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-white">
            <div className="text-xs text-slate-500">
              Affichage de <span className="font-semibold text-slate-700">{rattrapages.length}</span> sur{" "}
              <span className="font-semibold text-slate-700">{total}</span> séances de rattrapage.
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="gap-1"
              >
                <ChevronLeft size={16} />
                <span>Précédent</span>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                  className="w-9"
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="gap-1"
              >
                <span>Suivant</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
