"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, Search, User, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Link from "next/link";

export default function TopBar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="h-20 border-b border-slate-200 bg-white sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      {/* Search / Context */}
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu size={20} />
        </Button>
        <div className="relative hidden md:block w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une absence, un groupe..." 
            className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary rounded-full">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80 rounded-xl p-2 shadow-xl border-slate-100">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-bold px-4 py-2 border-b border-slate-100 mb-2 flex justify-between items-center">
                <span>Notifications</span>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">3 nouvelles</span>
              </DropdownMenuLabel>
              <div className="space-y-1">
                {[
                  { title: "Absence déclarée", desc: "M. Dupont a déclaré une absence.", time: "Il y a 2h", type: "warning" },
                  { title: "Rattrapage validé", desc: "Votre proposition a été acceptée.", time: "Il y a 5h", type: "success" },
                  { title: "Nouveau message", desc: "L'administration vous a envoyé un message.", time: "Hier", type: "info" }
                ].map((notif, i) => (
                  <DropdownMenuItem key={i} className="rounded-lg cursor-pointer p-3 flex flex-col items-start gap-1 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm text-slate-900">{notif.title}</span>
                      <span className="text-[10px] text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{notif.desc}</p>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem className="justify-center text-primary font-bold text-xs py-2 cursor-pointer hover:bg-primary/5 rounded-lg">
              Tout marquer comme lu
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger 
            render={
              <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-1 rounded-full hover:bg-slate-50">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-bold text-slate-900 leading-none">
                    {user?.nom} {user?.prenom}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">
                    {user?.role?.replace("_", " ")}
                  </p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/5 text-primary font-bold">
                    {user?.nom?.[0]}{user?.prenom?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-slate-100">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-bold px-3 py-2 text-slate-500">Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <Link href="/dashboard/profile">
                <DropdownMenuItem className="rounded-lg cursor-pointer px-3 py-2 text-sm group">
                  <User size={16} className="mr-2 text-slate-400 group-hover:text-primary transition-colors" /> Profil
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg cursor-pointer px-3 py-2 text-sm text-red-500 focus:text-red-600 focus:bg-red-50 group"
              >
                <LogOut size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Déconnexion
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
