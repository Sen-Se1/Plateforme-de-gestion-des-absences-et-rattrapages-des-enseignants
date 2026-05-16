"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, GraduationCap } from "lucide-react";
import Container from "./Container";
import { Button } from "./button";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "Fonctionnalités", href: "/features" },
    { name: "À propos", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <Container>
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-1.5 rounded-lg text-white group-hover:bg-primary-light transition-colors">
              <GraduationCap size={24} />
            </div>
            <span className="font-poppins font-bold text-xl text-primary tracking-tight">
              Absence<span className="text-slate-primary">Flow</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-slate-secondary hover:text-primary font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Button variant="default" size="sm">
              Se connecter
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-secondary hover:text-primary p-2"
              aria-label="Menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col p-4 gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-slate-secondary hover:text-primary font-medium p-2 rounded-md hover:bg-slate-50 transition-all"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <Button variant="default" className="w-full">
                Se connecter
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
