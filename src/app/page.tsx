"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  Rocket,
  Bot,
  FileText,
  CheckCircle2,
  Folder,
  Zap,
  RotateCw
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [quickMode, setQuickMode] = useState(false);
  const [quickData, setQuickData] = useState({ name: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);

  const handleQuickCreate = async () => {
    if (!quickData.name || !quickData.description) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickData),
      });
      if (res.ok) {
        const project = await res.json();
        router.push(`/projects/${project.id}`);
      }
    } catch (error) {
      console.error(error);
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6">
          <div className="inline-block animate-fade-in">
            <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 flex items-center gap-2 w-fit mx-auto">
              <Sparkles className="h-4 w-4" /> Asistente IA para Planificacion
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-slide-up">
            Plan
            <span className="text-primary">
              Dev
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up stagger-1" style={{ opacity: 0 }}>
            Transforma los requisitos de tu cliente en un plan de proyecto
            completo con estimaciones de tiempo, costos y propuestas listas para
            enviar.
          </p>

          {/* Quick Create Form */}
          {quickMode ? (
            <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-6 text-left space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Creacion Rapida
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setQuickMode(false)}>
                  X
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Nombre del proyecto</Label>
                <Input
                  value={quickData.name}
                  onChange={(e) => setQuickData({ ...quickData, name: e.target.value })}
                  placeholder="Ej: Sistema de Reservas"
                />
              </div>
              <div className="space-y-2">
                <Label>Que necesita el cliente?</Label>
                <Textarea
                  value={quickData.description}
                  onChange={(e) => setQuickData({ ...quickData, description: e.target.value })}
                  placeholder="Describe brevemente el proyecto..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleQuickCreate}
                  disabled={!quickData.name || !quickData.description || isCreating}
                  className="flex-1"
                >
                  {isCreating ? (
                    <><RotateCw className="mr-2 h-4 w-4 animate-spin" /> Creando...</>
                  ) : (
                    <><Rocket className="mr-2 h-4 w-4" /> Crear y Generar</>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Usa valores por defecto. <Link href="/projects/new" className="text-primary hover:underline">Modo avanzado</Link>
              </p>
            </div>
          ) : (
            <div className="flex gap-4 justify-center pt-6 flex-wrap animate-slide-up stagger-2" style={{ opacity: 0 }}>
              <Button
                size="lg"
                onClick={() => setQuickMode(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg interactive"
              >
                <Zap className="mr-2 h-5 w-5" /> Crear Rapido
              </Button>
              <Link href="/projects/new">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg interactive"
                >
                  <Rocket className="mr-2 h-5 w-5" /> Modo Avanzado
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  size="lg"
                  variant="ghost"
                  className="px-8 py-6 text-lg interactive"
                >
                  <Folder className="mr-2 h-5 w-5" /> Mis Proyectos
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          <Card className="bg-card border-border card-interactive animate-slide-up stagger-1" style={{ opacity: 0 }}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <CardTitle>Entrada Inteligente</CardTitle>
              <CardDescription>
                Ingresa los requisitos del cliente, stack tecnico y
                configuracion del equipo.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border card-interactive animate-slide-up stagger-2" style={{ opacity: 0 }}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <Bot className="h-6 w-6" />
              </div>
              <CardTitle>Generacion con IA</CardTitle>
              <CardDescription>
                La IA genera modulos, tareas, estimaciones de tiempo y costos
                automaticamente.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border card-interactive animate-slide-up stagger-3" style={{ opacity: 0 }}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <CardTitle>Exportacion Lista</CardTitle>
              <CardDescription>
                Exporta a Markdown, PDF o CSV y envia la propuesta directamente
                al cliente.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Preview */}
        <div className="mt-24 text-center animate-fade-in stagger-4" style={{ opacity: 0 }}>
          <div className="inline-flex flex-wrap justify-center gap-12 px-8 py-6 rounded-2xl bg-card border border-border">
            <div>
              <div className="text-3xl font-bold">5 min</div>
              <div className="text-sm text-muted-foreground">
                para generar un plan
              </div>
            </div>
            <div className="border-l border-border hidden md:block" />
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">automatizado con IA</div>
            </div>
            <div className="border-l border-border hidden md:block" />
            <div>
              <div className="text-3xl font-bold">3 formatos</div>
              <div className="text-sm text-muted-foreground">de exportacion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12 bg-card/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>
            PlanDev 2026 - Planificacion de proyectos potenciada por IA
          </p>
        </div>
      </footer>
    </div>
  );
}
