import React from "react";
import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";
import Container from "./Container";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-1 rounded-md text-white">
                <GraduationCap size={20} />
              </div>
              <span className="font-poppins font-bold text-xl text-white tracking-tight">
                Absence<span className="text-primary-light">Flow</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              La solution complète pour la gestion des absences et l'organisation des rattrapages au sein de votre établissement.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Navigation</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/" className="hover:text-primary-light transition-colors">Accueil</Link></li>
              <li><Link href="/features" className="hover:text-primary-light transition-colors">Fonctionnalités</Link></li>
              <li><Link href="/about" className="hover:text-primary-light transition-colors">À propos</Link></li>
              <li><Link href="/contact" className="hover:text-primary-light transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Solution</h4>
            <ul className="space-y-4 text-sm">
              <li>Gestion des Absences</li>
              <li>Planning des Rattrapages</li>
              <li>Notifications en Temps Réel</li>
              <li>Tableaux de Bord</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary-light" />
                <span>contact@absenceflow.univ.fr</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary-light" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-primary-light" />
                <span>Université de Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} AbsenceFlow. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Mentions Légales</Link>
            <Link href="#" className="hover:text-white transition-colors">Confidentialité</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
