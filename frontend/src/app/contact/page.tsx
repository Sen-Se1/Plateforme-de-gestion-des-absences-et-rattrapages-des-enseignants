"use client";

import React from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ContactPage() {
  return (
    <div className="py-20 bg-slate-50/50">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl mb-6">Contactez-nous</h1>
          <p className="text-lg text-slate-secondary">
            Une question sur la plateforme ? Notre équipe est là pour vous aider à optimiser votre établissement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="bg-primary text-white border-none">
              <h3 className="text-xl font-bold mb-6 text-white">Informations de contact</h3>
              <ul className="space-y-8">
                <li className="flex items-start gap-4">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-bold">Email</p>
                    <p className="text-blue-100 text-sm">support@absenceflow.fr</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="font-bold">Téléphone</p>
                    <p className="text-blue-100 text-sm">+33 1 23 45 67 89</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-bold">Adresse</p>
                    <p className="text-blue-100 text-sm">
                      12 Rue de l'Université<br />
                      75007 Paris, France
                    </p>
                  </div>
                </li>
              </ul>
            </Card>

            <div className="p-8 rounded-2xl bg-white border border-slate-200">
              <h4 className="font-bold mb-4">Support Technique</h4>
              <p className="text-sm text-slate-secondary leading-relaxed">
                Disponible du lundi au vendredi, de 9h00 à 18h00. Temps de réponse moyen : 4 heures.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-primary" htmlFor="nom">Nom</label>
                    <input 
                      type="text" 
                      id="nom" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-primary" htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-primary" htmlFor="sujet">Sujet</label>
                  <select 
                    id="sujet"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none bg-white"
                  >
                    <option>Demande d'information</option>
                    <option>Support technique</option>
                    <option>Partenariat</option>
                    <option>Autre</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-primary" htmlFor="message">Message</label>
                  <textarea 
                    id="message" 
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                    placeholder="Comment pouvons-nous vous aider ?"
                  ></textarea>
                </div>

                <Button className="w-full gap-2" size="lg">
                  Envoyer le message <Send size={18} />
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
