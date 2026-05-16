import React from "react";
import { Info, Target, Zap, ShieldCheck } from "lucide-react";
import Container from "@/components/ui/Container";

export default function AboutPage() {
  return (
    <div className="py-20">
      <Container>
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <h1 className="text-4xl md:text-5xl mb-6">À propos de notre vision</h1>
          <p className="text-lg text-slate-secondary leading-relaxed">
            AbsenceFlow est née d'un constat simple : la gestion manuelle des absences et des rattrapages dans l'enseignement supérieur est source d'erreurs, de stress et de perte de temps pour tous les acteurs impliqués.
          </p>
        </div>

        {/* Vision/Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 bg-blue-50 text-primary p-3 rounded-2xl h-fit">
                <Target size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Notre Mission</h3>
                <p className="text-slate-secondary leading-relaxed">
                  Digitaliser et fluidifier les processus académiques pour permettre aux enseignants de se concentrer sur la pédagogie et à l'administration de gagner en efficacité opérationnelle.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="flex-shrink-0 bg-green-50 text-success p-3 rounded-2xl h-fit">
                <Zap size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">L'Innovation IA</h3>
                <p className="text-slate-secondary leading-relaxed">
                  Nous utilisons des algorithmes intelligents pour détecter instantanément les conflits d'emploi du temps et suggérer les meilleures alternatives de rattrapage en temps réel.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 bg-red-50 text-danger p-3 rounded-2xl h-fit">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Fiabilité & Transparence</h3>
                <p className="text-slate-secondary leading-relaxed">
                  Une traçabilité complète de chaque action (déclaration, validation, modification) garantit une équité et une clarté totale pour les enseignants et les étudiants.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-100 rounded-3xl aspect-square relative overflow-hidden flex items-center justify-center p-12">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="text-center relative z-10">
              <div className="text-8xl font-bold text-primary mb-4">100%</div>
              <div className="text-xl font-poppins font-bold text-slate-primary">Digital & Intégré</div>
              <p className="mt-4 text-slate-secondary">Fini les emails perdus et les feuilles de papier.</p>
            </div>
          </div>
        </div>

        {/* Who it's for */}
        <section className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Pour qui avons-nous conçu AbsenceFlow ?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Une solution modulaire adaptée à chaque profil de l'écosystème universitaire.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { role: "Administration", desc: "Contrôle total sur les validations et vision globale de l'établissement." },
              { role: "Enseignants", desc: "Interface simple pour déclarer les absences et replanifier les cours." },
              { role: "Étudiants", desc: "Notifications instantanées et emploi du temps toujours à jour." },
              { role: "Responsables IT", desc: "Système robuste, API complète et facile à maintenir." }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
                <h4 className="text-primary-light font-bold text-lg mb-4">{item.role}</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
