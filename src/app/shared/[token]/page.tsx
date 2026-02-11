"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    DollarSign,
    Calendar,
    Layers,
    Box,
    ClipboardList,
    Lock,
    Rocket
} from "lucide-react";

interface Task {
    id: string;
    name: string;
    phase: string;
    estimatedHours: number;
    role: string;
}

interface Module {
    id: string;
    name: string;
    description: string | null;
    tasks: Task[];
}

interface Project {
    id: string;
    name: string;
    type: string;
    currency: string;
    modules: Module[];
    hoursPerWeek: number;
    teamSize: number;
    proposal: {
        totalHours: number;
        totalCost: number;
        duration: string | null;
        content: string;
    } | null;
}

const phaseLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    analysis: { label: "Análisis", icon: <ClipboardList className="w-3 h-3" /> },
    design: { label: "Diseño", icon: <Layers className="w-3 h-3" /> },
    development: { label: "Desarrollo", icon: <Box className="w-3 h-3" /> },
    testing: { label: "Pruebas", icon: <Calendar className="w-3 h-3" /> }, // Using Calendar as placeholder or maybe CheckCircle? Let's use CheckCircle if available or just generic
    deployment: { label: "Despliegue", icon: <Rocket className="w-3 h-3" /> },
};

export default function SharedProjectPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = use(params);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/shared/${token}`);
                if (!res.ok) {
                    setError("Proyecto no encontrado o enlace expirado");
                    return;
                }
                const data = await res.json();
                setProject(data);
            } catch {
                setError("Error al cargar el proyecto");
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-foreground text-xl flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Cargando...
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="bg-destructive/10 border-destructive max-w-md">
                    <CardContent className="py-12 text-center">
                        <Lock className="h-16 w-16 mx-auto mb-4 text-destructive" />
                        <h2 className="text-xl font-bold text-foreground mb-2">{error}</h2>
                        <p className="text-muted-foreground">Este enlace no es válido o ha expirado.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Layers className="h-6 w-6" />
                        PlanDev
                        <span className="text-muted-foreground text-sm font-normal ml-2">| Vista compartida</span>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Project Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-foreground mb-2">{project.name}</h1>
                    <Badge variant="outline" className="text-muted-foreground">{project.type}</Badge>
                </div>

                {/* Stats */}
                {project.proposal && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 animate-slide-up" style={{ opacity: 0 }}>
                        <Card className="bg-card border-border card-interactive">
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-primary">{Math.round(project.proposal.totalHours)}h</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Horas totales
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border card-interactive">
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-green-500">
                                    {project.currency} {Math.round(project.proposal.totalCost).toLocaleString()}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" /> Costo total
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border card-interactive">
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-foreground">
                                    {project.proposal.duration || `${Math.ceil(project.proposal.totalHours / (project.hoursPerWeek * project.teamSize))} semanas`}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Duracion
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border card-interactive">
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-foreground">{project.modules.length}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Box className="h-3 w-3" /> Modulos
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Modules */}
                <div className="space-y-6 mb-8">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 animate-fade-in">
                        <Box className="h-6 w-6" /> Modulos y Tareas
                    </h2>
                    {(() => {
                        // Orden cronológico de fases
                        const PHASE_ORDER = ["analysis", "design", "development", "testing", "deployment"];

                        return project.modules.map((module, index) => {
                            // Calcular horas del módulo redondeando ANTES de sumar (consistente con dashboard)
                            const moduleHours = module.tasks.reduce((sum, t) => sum + Math.round(t.estimatedHours), 0);

                            // Ordenar tareas por fase cronológicamente
                            const sortedTasks = [...module.tasks].sort((a, b) => {
                                return PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase);
                            });

                            return (
                                <Card key={module.id} className="bg-card border-border card-interactive animate-slide-up" style={{ opacity: 0, animationDelay: `${index * 0.1}s` }}>
                                    <CardHeader>
                                        <CardTitle className="text-foreground flex items-center justify-between">
                                            {module.name}
                                            <span className="text-sm text-muted-foreground font-normal">
                                                {moduleHours}h
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {sortedTasks.map((task) => (
                                                <div key={task.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/30 rounded-lg">
                                                    <span className="text-foreground text-sm sm:text-base">{task.name}</span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                                                            {phaseLabels[task.phase]?.icon}
                                                            {phaseLabels[task.phase]?.label || task.phase}
                                                        </Badge>
                                                        <span className="text-primary font-mono text-sm">
                                                            {Math.round(task.estimatedHours)}h
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        });
                    })()}
                </div>

                {/* Proposal */}
                {project.proposal && (
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <ClipboardList className="h-5 w-5" /> Propuesta
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
                                {project.proposal.content}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Footer */}
            <footer className="border-t border-border py-6 mt-12 bg-card/50">
                <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
                    Generado con PlanDev
                </div>
            </footer>
        </div >
    );
}
