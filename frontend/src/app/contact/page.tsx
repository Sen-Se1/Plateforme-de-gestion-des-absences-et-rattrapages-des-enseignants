"use client";

import React from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

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
            <Card className="bg-primary text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Informations de contact</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
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
            <Card className="shadow-lg border-slate-200">
              <CardContent className="pt-6">
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom</Label>
                      <Input id="nom" placeholder="Votre nom" className="rounded-xl border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="votre@email.com" className="rounded-xl border-slate-200" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sujet">Sujet</Label>
                    <Select>
                      <SelectTrigger id="sujet" className="rounded-xl border-slate-200">
                        <SelectValue placeholder="Choisir un sujet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Demande d'information</SelectItem>
                        <SelectItem value="support">Support technique</SelectItem>
                        <SelectItem value="partner">Partenariat</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Comment pouvons-nous vous aider ?" 
                      className="min-h-[150px] rounded-xl border-slate-200 resize-none"
                    />
                  </div>

                  <Button className="w-full gap-2 rounded-xl" size="lg">
                    Envoyer le message <Send size={18} />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
