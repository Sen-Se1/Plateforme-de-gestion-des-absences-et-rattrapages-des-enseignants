import React from "react";
import LoginForm from "@/components/auth/LoginForm";
import Container from "@/components/ui/Container";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

/**
 * Page de connexion (Login)
 * Cette page permet à tous les types d'utilisateurs (admin, enseignant, etudiant) 
 * de s'authentifier.
 * API: POST /api/v1/auth/login
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden py-20">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-light rounded-full blur-[120px]" />
      </div>

      <Container className="relative z-10 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 mb-8 group">
          <span className="font-poppins font-bold text-3xl text-primary tracking-tight">
            Lo<span className="text-slate-primary">Go</span>
          </span>
        </Link>
        
        <LoginForm />

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Vous n'avez pas de compte ?{" "}
            <Link href="/contact" className="text-primary font-bold hover:underline">
              Contactez l'administration
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
