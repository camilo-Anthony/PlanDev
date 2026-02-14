import Link from "next/link";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

export default function HomePage() {
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

          {/* CTA Buttons */}
          <div className="flex gap-3 sm:gap-4 justify-center pt-6 flex-wrap animate-slide-up stagger-2" style={{ opacity: 0 }}>
            <Link href="/projects/new">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg interactive"
              >
                <Rocket className="mr-2 h-5 w-5" /> Crear Proyecto
              </Button>
            </Link>
            <Link href="/projects">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg interactive"
              >
                <Folder className="mr-2 h-5 w-5" /> Mis Proyectos
              </Button>
            </Link>
          </div>
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
