"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Send,
  Loader2,
  X,
  MessageSquare,
  Bot
} from "lucide-react";
import { toast } from "sonner";
import { ChatMessage as ChatMessageType } from "@/types/chatbot";
import { sendChatBotMessage, confirmChatBotAction } from "@/lib/api/chatbot";
import ChatMessage from "./ChatMessage";

export default function Chatbot() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const user = session.user as any;
      const firstName = user.prenom || "";
      const roleLabel = {
        admin_systeme: "Administrateur",
        administration: "Administrateur",
        enseignant: "Professeur",
        etudiant: "Étudiant",
      }[user.role as string] || "Utilisateur";

      const welcomeMsg = `Bonjour ${firstName} ! Je suis votre assistant virtuel IA. En tant que **${roleLabel}**, je peux vous aider à interroger vos cours, planifier vos rattrapages et suivre vos absences. Que puis-je faire pour vous aujourd'hui ?`;
      
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: welcomeMsg,
          timestamp: new Date(),
        },
      ]);
    }
  }, [status, session]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }
  }, [messages, isOpen]);

  if (status !== "authenticated" || !session) {
    return null;
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");

    const userMsg: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages
        .filter((msg) => msg.id !== "welcome")
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await sendChatBotMessage(userText, history);

      const botMsg: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.content,
        type: response.type,
        actionData: response.action_data ? {
          action: response.action_data.action,
          params: response.action_data.params,
        } : undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la communication avec l'assistant");
      const errorMsg: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Désolé, je rencontre des difficultés techniques actuellement. Veuillez réessayer plus tard.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async (action: string, params: Record<string, any>) => {
    setIsActionLoading(true);
    try {
      const response = await confirmChatBotAction(action, params);
      
      setMessages((prev) => {
        return prev.map((msg) => {
          if (msg.type === "confirmation") {
            return { ...msg, type: "text", actionData: undefined };
          }
          return msg;
        });
      });

      const botMsg: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.message || "Action exécutée avec succès.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      toast.success("Action exécutée avec succès");
      
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("refreshDashboardData"));
      }

    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la validation de l'action");
      
      const botMsg: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Erreur : ${error.message || "Une erreur s'est produite lors de l'exécution de l'action."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelAction = () => {
    setMessages((prev) => {
      return prev.map((msg) => {
        if (msg.type === "confirmation") {
          return { ...msg, type: "text", actionData: undefined };
        }
        return msg;
      });
    });

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: "Annuler l'action",
        timestamp: new Date(),
      },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "D'accord, j'ai annulé l'action. N'hésitez pas si vous avez d'autres demandes !",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group border border-indigo-400/20 cursor-pointer"
        aria-label="Ouvrir l'assistant virtuel"
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-20 group-hover:animate-ping"></span>
        <Bot size={22} className="relative group-hover:rotate-12 transition-transform duration-200" />
      </button>

      {/* Slide-out Sheet Panel */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[95%] sm:max-w-md h-full flex flex-col p-0 border-l border-slate-100 bg-white" showCloseButton={false}>
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                <Bot size={18} className="animate-pulse" />
              </div>
              <div>
                <SheetTitle className="text-sm font-bold text-slate-800 font-poppins flex items-center gap-1.5">
                  Assistant Virtuel IA
                </SheetTitle>
                <SheetDescription className="text-[11px] text-slate-500 font-poppins">
                  Propulsé par Groq
                </SheetDescription>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Messages Log Container */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onConfirm={handleConfirmAction}
                onCancel={handleCancelAction}
                isActionLoading={isActionLoading}
              />
            ))}
            
            {isLoading && (
              <div className="flex w-full gap-3 py-2 items-center justify-start animate-pulse">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <Bot size={15} />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-none px-4 py-2.5 flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin text-indigo-500" />
                  <span className="text-xs text-slate-500 font-poppins">L'assistant réfléchit...</span>
                </div>
              </div>
            )}
            
            <div ref={scrollRef} className="h-1" />
          </div>

          {/* Input Text Form */}
          <form onSubmit={handleSend} className="p-3.5 border-t border-slate-100 bg-white">
            <div className="relative flex items-center">
              <Input
                placeholder="Posez une question ou demandez une action..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || isActionLoading}
                className="pr-12 pl-4 py-5 bg-slate-50 border-slate-100/80 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500/30 text-xs font-poppins placeholder:text-slate-400"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading || isActionLoading}
                className="absolute right-1.5 h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-40 disabled:bg-indigo-600"
              >
                <Send size={13} />
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
