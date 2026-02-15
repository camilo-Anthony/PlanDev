"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Clock,
    DollarSign,
    Calendar,
    Layers,
    ArrowLeft,
    FileText,
    Download,
    Link as LinkIcon,
    Copy,
    BookOpen,
    Trash2,
    Edit2,
    CheckCircle,
    RotateCw,
    Bot,
    Table,
    List,
    LayoutDashboard,
    Check,
    X,
    History,
    RotateCcw,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface Task {
    id: string;
    name: string;
    description: string | null;
    phase: string;
    estimatedHours: number;
    actualHours: number | null;
    role: string;
    status: string;
    dueDate: string | null;
    completedAt: string | null;
    userStory: string | null;
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
    createdAt: string;
    config: {
        developerRate: number;
        qaRate: number;
        pmRate: number;
        hoursPerWeek: number;
        teamSize: number;
        startDate: string | null;
        workDays?: string;
        hoursPerDay?: number;
    } | null;
    modules: Module[];
    proposal: {
        content: string;
        totalHours: number;
        totalCost: number;
        duration: string | null;
    } | null;
}

type ViewMode = "summary" | "tracking" | "phases" | "modules" | "roadmap" | "proposal" | "history";

interface HistoryEntry {
    id: string;
    version: number;
    totalHours: number;
    totalCost: number;
    createdAt: string;
    note: string | null;
}

const phaseLabels: Record<string, string> = {
    analysis: "Análisis",
    design: "Diseño",
    development: "Desarrollo",
    testing: "Pruebas",
    deployment: "Despliegue",
};

const phaseColors: Record<string, string> = {
    analysis: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    design: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    development: "bg-green-500/10 text-green-500 border-green-500/20",
    testing: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    deployment: "bg-red-500/10 text-red-500 border-red-500/20",
};

const roleLabels: Record<string, string> = {
    developer: "Dev",
    qa: "QA",
    pm: "PM",
};

export default function ProjectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("summary");
    const [editingTask, setEditingTask] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<Task>>({});

    // Estados para historial y diálogo de confirmación
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [regenerateNote, setRegenerateNote] = useState("");
    const [restoringHistoryId, setRestoringHistoryId] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{
        title: string;
        description: string;
        onConfirm: () => void;
        destructive?: boolean;
    } | null>(null);

    const fetchProject = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            if (res.ok) {
                setProject(await res.json());
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    const handleGenerate = async (note?: string) => {
        setGenerating(true);
        try {
            const res = await fetch(`/api/projects/${id}/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note }),
            });
            if (res.ok) {
                setProject(await res.json());
                setViewMode("summary");
                setRegenerateNote("");
                // Refrescar historial
                fetchHistory();
            } else {
                const error = await res.json();
                alert(error.error || "Error al generar");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error de conexión");
        } finally {
            setGenerating(false);
        }
    };

    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${id}/history`);
            if (res.ok) {
                setHistory(await res.json());
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    }, [id]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const restoreHistory = async (historyId: string) => {
        setConfirmAction({
            title: "Restaurar versión",
            description: "El plan actual se guardará en el historial antes de restaurar esta versión.",
            onConfirm: async () => {
                setRestoringHistoryId(historyId);
                try {
                    const res = await fetch(`/api/projects/${id}/history`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ historyId }),
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setProject(data.project);
                        setViewMode("summary");
                        fetchHistory();
                    } else {
                        const error = await res.json();
                        alert(error.error || "Error al restaurar");
                    }
                } catch (error) {
                    console.error("Error:", error);
                    alert("Error de conexión");
                } finally {
                    setRestoringHistoryId(null);
                }
            },
        });
    };

    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            if (res.ok) {
                await fetchProject();
                setEditingTask(null);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const deleteTask = async (taskId: string) => {
        setConfirmAction({
            title: "Eliminar tarea",
            description: "Esta acción es permanente y no se puede deshacer.",
            destructive: true,
            onConfirm: async () => {
                try {
                    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
                    await fetchProject();
                } catch (error) {
                    console.error("Error:", error);
                }
            },
        });
    };

    const deleteModule = async (moduleId: string) => {
        setConfirmAction({
            title: "Eliminar módulo",
            description: "Se eliminará el módulo y todas sus tareas. Esta acción es permanente.",
            destructive: true,
            onConfirm: async () => {
                try {
                    await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
                    await fetchProject();
                } catch (error) {
                    console.error("Error:", error);
                }
            },
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: project?.currency || "USD",
        }).format(amount);
    };

    const calculateStats = () => {
        if (!project?.modules) return null;
        const byPhase: Record<string, number> = {};
        const byModule: Record<string, number> = {};

        project.modules.forEach((module) => {
            let moduleHours = 0;
            module.tasks.forEach((task) => {
                // Redondear ANTES de sumar para consistencia
                const roundedHours = Math.round(task.estimatedHours);
                moduleHours += roundedHours;
                byPhase[task.phase] = (byPhase[task.phase] || 0) + roundedHours;
            });
            byModule[module.name] = moduleHours;
        });

        // Ahora totalHours será consistente con la suma de fases
        const totalHours = Object.values(byModule).reduce((sum, h) => sum + h, 0);

        return { totalHours, byPhase, byModule };
    };

    const calculateRoadmap = () => {
        if (!project?.modules || !project.config) return [];
        const hoursPerWeek = project.config.hoursPerWeek * project.config.teamSize;
        const phases = ["analysis", "design", "development", "testing", "deployment"];
        const phaseTimeline: Array<{ phase: string; hours: number; weeks: number; startWeek: number; endWeek: number }> = [];
        let currentWeek = 0;

        phases.forEach((phase) => {
            const phaseHours = project.modules.reduce(
                (sum, m) => sum + m.tasks.filter((t) => t.phase === phase).reduce((s, t) => s + Math.round(t.estimatedHours), 0),
                0
            );

            if (phaseHours > 0) {
                const weeks = Math.ceil(phaseHours / hoursPerWeek);
                const startWeek = currentWeek;
                const endWeek = startWeek + weeks;

                phaseTimeline.push({ phase, hours: phaseHours, weeks, startWeek, endWeek });
                currentWeek = endWeek;
            }
        });

        return phaseTimeline;
    };

    const stats = calculateStats();
    const roadmap = calculateRoadmap();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-foreground text-xl">Cargando...</div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-foreground text-xl">Proyecto no encontrado</div>
            </div>
        );
    }

    const totalWeeks = roadmap.reduce((max, p) => Math.max(max, p.endWeek), 0);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3">
                    {/* Top row: logo + back */}
                    <div className="flex items-center justify-between mb-2 sm:mb-0">
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                            <Link href="/" className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2 shrink-0">
                                <Layers className="h-5 w-5 sm:h-6 sm:w-6" />
                                <span className="hidden sm:inline">PlanDev</span>
                            </Link>
                            <span className="text-muted-foreground hidden sm:inline">/</span>
                            <span className="text-muted-foreground text-sm sm:text-base truncate">{project.name}</span>
                        </div>
                        <Link href="/projects" className="shrink-0">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Volver</span>
                            </Button>
                        </Link>
                    </div>
                    {/* Bottom row: action buttons */}
                    <div className="flex gap-1.5 sm:gap-2 flex-wrap text-foreground">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    disabled={generating}
                                    variant="default"
                                    size="sm"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    {generating ? <RotateCw className="h-4 w-4 animate-spin sm:mr-2" /> : <Bot className="h-4 w-4 sm:mr-2" />}
                                    <span className="hidden sm:inline">{generating ? "Generando..." : "Regenerar"}</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Regenerar el plan?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        El plan actual se guardará automáticamente en el historial antes de generar uno nuevo.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-2">
                                    <label className="text-sm font-medium mb-1 block">Nota opcional para el historial:</label>
                                    <Textarea
                                        value={regenerateNote}
                                        onChange={(e) => setRegenerateNote(e.target.value)}
                                        placeholder="Ej: Cambio de requisitos, ajuste de presupuesto..."
                                        className="h-20"
                                    />
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleGenerate(regenerateNote)}>
                                        Regenerar Plan
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        {project.modules.length > 0 && (
                            <>
                                <a href={`/api/projects/${id}/export/markdown`} download>
                                    <Button variant="outline" size="sm" title="Exportar MD" className="px-2 sm:px-3">
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                </a>
                                <a href={`/api/projects/${id}/export/csv`} download>
                                    <Button variant="outline" size="sm" title="Exportar CSV" className="px-2 sm:px-3">
                                        <Table className="h-4 w-4" />
                                    </Button>
                                </a>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    title="Compartir"
                                    className="px-2 sm:px-3"
                                    onClick={async () => {
                                        const res = await fetch(`/api/projects/${id}/share`, { method: "POST" });
                                        const data = await res.json();
                                        navigator.clipboard.writeText(data.shareUrl);
                                        alert(`Link copiado: ${data.shareUrl}`);
                                    }}
                                >
                                    <LinkIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    title="Duplicar"
                                    className="px-2 sm:px-3"
                                    onClick={() => {
                                        setConfirmAction({
                                            title: "Duplicar proyecto",
                                            description: "Se creará una copia exacta de este proyecto.",
                                            onConfirm: async () => {
                                                const res = await fetch(`/api/projects/${id}/duplicate`, { method: "POST" });
                                                const data = await res.json();
                                                window.location.href = `/projects/${data.id}`;
                                            },
                                        });
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <a href={`/api/projects/${id}/export/pdf`} target="_blank">
                                    <Button variant="outline" size="sm" title="Exportar PDF" className="px-2 sm:px-3">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </a>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setConfirmAction({
                                            title: "Generar historias de usuario",
                                            description: "Se generarán historias de usuario con IA. Esto tomará unos segundos.",
                                            onConfirm: async () => {
                                                try {
                                                    const res = await fetch(`/api/projects/${id}/generate-stories`, { method: "POST" });
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        window.location.reload();
                                                    } else {
                                                        alert("Error: " + data.error);
                                                    }
                                                } catch {
                                                    alert("Error al generar historias");
                                                }
                                            },
                                        });
                                    }}
                                >
                                    <BookOpen className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Historias IA</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                        const btn = document.activeElement as HTMLButtonElement;
                                        const originalText = btn.innerHTML;
                                        btn.innerHTML = "Recalculando...";
                                        btn.disabled = true;
                                        try {
                                            const res = await fetch(`/api/projects/${id}/recalculate`, { method: "POST" });
                                            const data = await res.json();
                                            if (data.success) {
                                                alert(`Costos actualizados:\n• Horas: ${Math.round(data.totalHours)}h\n• Costo: ${formatCurrency(data.totalCost)}\n• Duración: ${data.duration}`);
                                                await fetchProject();
                                            } else {
                                                alert("Error: " + data.error);
                                            }
                                        } catch {
                                            alert("Error al recalcular");
                                        }
                                        btn.innerHTML = originalText;
                                        btn.disabled = false;
                                    }}
                                    title="Recalcular costos y duración"
                                >
                                    <DollarSign className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Recalcular</span>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Stats */}
                {project.proposal && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 text-foreground">
                        <Card className="bg-card border-border">
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold">{Math.round(project.proposal.totalHours)}h</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-4 w-4" /> Horas totales
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border">
                            <CardContent className="pt-6">
                                {project.config && project.modules.length > 0 && (() => {
                                    const allTasks = project.modules.flatMap(m => m.tasks);

                                    // Horas base por rol (sin contingencia)
                                    const baseDevHours = allTasks.filter(t => t.role === "developer").reduce((sum, t) => sum + t.estimatedHours, 0);
                                    const baseQaHours = allTasks.filter(t => t.role === "qa").reduce((sum, t) => sum + t.estimatedHours, 0);
                                    const basePmHours = allTasks.filter(t => t.role === "pm").reduce((sum, t) => sum + t.estimatedHours, 0);
                                    const baseTotal = baseDevHours + baseQaHours + basePmHours;

                                    // Horas totales con contingencia (del proposal)
                                    const totalHoursWithContingency = project.proposal?.totalHours || baseTotal;

                                    // Distribuir contingencia proporcionalmente
                                    const contingencyFactor = baseTotal > 0 ? totalHoursWithContingency / baseTotal : 1;
                                    const devHours = Math.round(baseDevHours * contingencyFactor);
                                    const qaHours = Math.round(baseQaHours * contingencyFactor);
                                    const pmHours = Math.round(basePmHours * contingencyFactor);

                                    const allRatesZero = (project.config?.developerRate || 0) === 0 && (project.config?.qaRate || 0) === 0 && (project.config?.pmRate || 0) === 0;

                                    // Calcular costo total desde el desglose (para consistencia visual)
                                    const devCost = devHours * (project.config?.developerRate || 0);
                                    const qaCost = qaHours * (project.config?.qaRate || 0);
                                    const pmCost = pmHours * (project.config?.pmRate || 0);
                                    const calculatedTotalCost = devCost + qaCost + pmCost;

                                    return (
                                        <>
                                            <div className="text-xl sm:text-3xl font-bold text-green-500 truncate">{formatCurrency(calculatedTotalCost)}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                                                <DollarSign className="h-4 w-4" /> Costo total
                                            </div>
                                            <div className="space-y-2 text-xs border-t border-border pt-2">
                                                {/* Currency Selector */}
                                                <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
                                                    <span className="text-muted-foreground">Moneda</span>
                                                    <Select
                                                        value={project.currency}
                                                        onValueChange={async (value) => {
                                                            await fetch(`/api/projects/${id}`, {
                                                                method: "PUT",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify({ currency: value })
                                                            });
                                                            await fetch(`/api/projects/${id}/recalculate`, { method: "POST" });
                                                            await fetchProject();
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-20 h-6 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="USD">USD</SelectItem>
                                                            <SelectItem value="PEN">PEN</SelectItem>
                                                            <SelectItem value="EUR">EUR</SelectItem>
                                                            <SelectItem value="MXN">MXN</SelectItem>
                                                            <SelectItem value="COP">COP</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {allRatesZero && (
                                                    <div className="text-yellow-500 mb-2 flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" /> Configura las tarifas
                                                    </div>
                                                )}
                                                {devHours > 0 && (
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-muted-foreground">Dev {Math.round(devHours)}h x</span>
                                                        <Input
                                                            type="number"
                                                            defaultValue={project.config?.developerRate || 0}
                                                            className="w-16 h-6 text-xs text-center p-1"
                                                            placeholder="0"
                                                            onBlur={async (e) => {
                                                                await fetch(`/api/projects/${id}/config`, {
                                                                    method: "PUT",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({ developerRate: Number(e.target.value) })
                                                                });
                                                                await fetch(`/api/projects/${id}/recalculate`, { method: "POST" });
                                                                await fetchProject();
                                                            }}
                                                        />
                                                        <span className="font-medium">{formatCurrency(Math.round(devHours) * (project.config?.developerRate || 0))}</span>
                                                    </div>
                                                )}
                                                {qaHours > 0 && (
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-muted-foreground">QA {Math.round(qaHours)}h x</span>
                                                        <Input
                                                            type="number"
                                                            defaultValue={project.config?.qaRate || 0}
                                                            className="w-16 h-6 text-xs text-center p-1"
                                                            placeholder="0"
                                                            onBlur={async (e) => {
                                                                await fetch(`/api/projects/${id}/config`, {
                                                                    method: "PUT",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({ qaRate: Number(e.target.value) })
                                                                });
                                                                await fetch(`/api/projects/${id}/recalculate`, { method: "POST" });
                                                                await fetchProject();
                                                            }}
                                                        />
                                                        <span className="font-medium">{formatCurrency(Math.round(qaHours) * (project.config?.qaRate || 0))}</span>
                                                    </div>
                                                )}
                                                {pmHours > 0 && (
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-muted-foreground">PM {Math.round(pmHours)}h x</span>
                                                        <Input
                                                            type="number"
                                                            defaultValue={project.config?.pmRate || 0}
                                                            className="w-16 h-6 text-xs text-center p-1"
                                                            placeholder="0"
                                                            onBlur={async (e) => {
                                                                await fetch(`/api/projects/${id}/config`, {
                                                                    method: "PUT",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({ pmRate: Number(e.target.value) })
                                                                });
                                                                await fetch(`/api/projects/${id}/recalculate`, { method: "POST" });
                                                                await fetchProject();
                                                            }}
                                                        />
                                                        <span className="font-medium">{formatCurrency(Math.round(pmHours) * (project.config?.pmRate || 0))}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border">
                            <CardContent className="pt-6">
                                {(() => {
                                    const workDays = project.config?.workDays
                                        ? JSON.parse(project.config.workDays as string)
                                        : ["L", "M", "Mi", "J", "V"];
                                    const hoursPerDay = project.config?.hoursPerDay || 8;
                                    const teamSize = project.config?.teamSize || 1;
                                    // Usar directamente hoursPerWeek de config (consistente con calculateRoadmap)
                                    const hoursPerWeek = (project.config?.hoursPerWeek || 40) * teamSize;

                                    // Calcular duración basada en suma de tareas (sin contingencia)
                                    const taskSum = project.modules.reduce(
                                        (sum, m) => sum + m.tasks.reduce((s, t) => s + t.estimatedHours, 0),
                                        0
                                    );
                                    const roadmap = calculateRoadmap();
                                    const durationWeeks = roadmap.length > 0
                                        ? Math.max(...roadmap.map(p => p.endWeek))
                                        : Math.ceil(taskSum / hoursPerWeek);
                                    const allDays = ["L", "M", "Mi", "J", "V", "S", "D"];

                                    return (
                                        <>
                                            <div className="text-3xl font-bold text-purple-500">
                                                {project.proposal.duration || `${Math.ceil(durationWeeks)} semanas`}
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                                                <Calendar className="h-4 w-4" /> Duracion
                                            </div>
                                            <div className="space-y-3 text-xs border-t border-border pt-2">
                                                {/* Days selector */}
                                                <div className="flex flex-wrap gap-1">
                                                    {allDays.map((day) => (
                                                        <button
                                                            key={day}
                                                            onClick={async () => {
                                                                const newDays = workDays.includes(day)
                                                                    ? workDays.filter((d: string) => d !== day)
                                                                    : [...workDays, day].sort((a: string, b: string) =>
                                                                        allDays.indexOf(a) - allDays.indexOf(b)
                                                                    );
                                                                if (newDays.length === 0) return; // At least 1 day
                                                                await fetch(`/api/projects/${id}/config`, {
                                                                    method: "PUT",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({
                                                                        workDays: JSON.stringify(newDays),
                                                                        hoursPerWeek: newDays.length * hoursPerDay
                                                                    })
                                                                });
                                                                await fetch(`/api/projects/${id}/recalculate`, { method: "POST" });
                                                                await fetchProject();
                                                            }}
                                                            className={`w-7 h-7 rounded text-xs font-medium transition-colors ${workDays.includes(day)
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                                }`}
                                                        >
                                                            {day}
                                                        </button>
                                                    ))}
                                                </div>
                                                {/* Hours per day */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-muted-foreground">Horas/dia</span>
                                                    <Input
                                                        type="number"
                                                        defaultValue={hoursPerDay}
                                                        className="w-14 h-6 text-xs text-center p-1"
                                                        min="1"
                                                        max="24"
                                                        onBlur={async (e) => {
                                                            const value = Math.min(24, Math.max(1, Number(e.target.value)));
                                                            const newHoursPerWeek = workDays.length * value;
                                                            await fetch(`/api/projects/${id}/config`, {
                                                                method: "PUT",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify({
                                                                    hoursPerDay: value,
                                                                    hoursPerWeek: newHoursPerWeek
                                                                })
                                                            });
                                                            await fetch(`/api/projects/${id}/recalculate`, { method: "POST" });
                                                            await fetchProject();
                                                        }}
                                                    />
                                                </div>
                                                {/* Summary */}
                                                <div className="text-muted-foreground pt-1 border-t border-border/50">
                                                    {workDays.length}d x {hoursPerDay}h = {hoursPerWeek}h/sem
                                                    <br />
                                                    {Math.round(taskSum)}h / {Math.round(hoursPerWeek)}h = {Math.ceil(durationWeeks)} sem
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border">
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-pink-500">{project.modules.length}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Layers className="h-4 w-4" /> Módulos
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
                }

                {/* View Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {(["summary", "tracking", "phases", "modules", "roadmap", "proposal", "history"] as ViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${viewMode === mode
                                ? "bg-primary text-primary-foreground"
                                : "bg-card text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            {mode === "summary" && <><LayoutDashboard className="h-4 w-4" /> Resumen</>}
                            {mode === "tracking" && <><CheckCircle className="h-4 w-4" /> Seguimiento</>}
                            {mode === "phases" && <><List className="h-4 w-4" /> Fases</>}
                            {mode === "modules" && <><Layers className="h-4 w-4" /> Módulos</>}
                            {mode === "roadmap" && <><Calendar className="h-4 w-4" /> Roadmap</>}
                            {mode === "proposal" && <><FileText className="h-4 w-4" /> Propuesta</>}
                            {mode === "history" && <><History className="h-4 w-4" /> Historial</>}
                        </button>
                    ))}
                </div>

                {/* No plan */}
                {project.modules.length === 0 && (
                    <Card className="bg-card border-border">
                        <CardContent className="py-12 text-center text-foreground">
                            <Bot className="h-16 w-16 mx-auto mb-4 text-primary" />
                            <h2 className="text-2xl font-bold mb-2">¡Listo para generar!</h2>
                            <p className="text-muted-foreground mb-6">Haz clic en Regenerar para generar el plan.</p>
                            <Button onClick={() => handleGenerate()} disabled={generating} size="lg">
                                {generating ? "Generando..." : "Generar Plan"}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Summary */}
                {viewMode === "summary" && stats && project.modules.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-6 text-foreground">
                        <Card className="bg-card border-border">
                            <CardHeader><CardTitle>Horas por Fase</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                {/* Ordenar fases cronológicamente */}
                                {["analysis", "design", "development", "testing", "deployment"]
                                    .filter(phase => stats.byPhase[phase] > 0)
                                    .map((phase) => {
                                        const hours = stats.byPhase[phase];
                                        const barColors: Record<string, string> = {
                                            analysis: "bg-blue-500",
                                            design: "bg-purple-500",
                                            development: "bg-green-500",
                                            testing: "bg-yellow-500",
                                            deployment: "bg-red-500",
                                        };
                                        return (
                                            <div key={phase} className="flex items-center gap-3 text-sm">
                                                <span className="text-muted-foreground w-28 text-right capitalize">{phaseLabels[phase]}</span>
                                                <div className="flex-1 bg-muted rounded-full h-3">
                                                    <div className={`${barColors[phase] || "bg-primary"} h-3 rounded-full`} style={{ width: `${(hours / stats.totalHours) * 100}%` }} />
                                                </div>
                                                <span className="font-mono w-14 text-right">{Math.round(hours)}h</span>
                                            </div>
                                        );
                                    })}
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border">
                            <CardHeader><CardTitle>Horas por Módulo</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                {Object.entries(stats.byModule).map(([module, hours]) => (
                                    <div key={module} className="flex items-center gap-3 text-sm">
                                        <span className="text-muted-foreground w-28 truncate text-right">{module}</span>
                                        <div className="flex-1 bg-muted rounded-full h-3">
                                            <div className="bg-primary h-3 rounded-full" style={{ width: `${(hours / stats.totalHours) * 100}%` }} />
                                        </div>
                                        <span className="font-mono w-14 text-right">{Math.round(hours)}h</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tracking View - V3 */}
                {viewMode === "tracking" && project.modules.length > 0 && (() => {
                    const allTasks = project.modules.flatMap(m => m.tasks.map(t => ({ ...t, moduleName: m.name })));
                    const completed = allTasks.filter(t => t.status === "completed").length;
                    const inProgress = allTasks.filter(t => t.status === "in_progress").length;
                    const pending = allTasks.filter(t => t.status === "pending" || !t.status).length;
                    const progress = allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0;
                    const totalEstimated = allTasks.reduce((sum, t) => sum + Math.round(t.estimatedHours), 0);
                    const totalActual = allTasks.reduce((sum, t) => sum + Math.round(t.actualHours || 0), 0);

                    return (
                        <div className="space-y-6 text-foreground">
                            {/* Progress Overview */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                <Card className="bg-card border-border">
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-4xl font-bold text-primary">{progress}%</div>
                                        <div className="text-sm text-muted-foreground">Progreso</div>
                                        <div className="mt-2 bg-muted rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-green-500/10 border-green-500/20">
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-3xl font-bold text-green-500">{completed}</div>
                                        <div className="text-sm text-green-500/80 flex items-center justify-center gap-1"><CheckCircle className="h-4 w-4" /> Completadas</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-yellow-500/10 border-yellow-500/20">
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-3xl font-bold text-yellow-500">{inProgress}</div>
                                        <div className="text-sm text-yellow-500/80 flex items-center justify-center gap-1"><RotateCw className="h-4 w-4" /> En Progreso</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-card border-border">
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-3xl font-bold text-muted-foreground">{pending}</div>
                                        <div className="text-sm text-muted-foreground flex items-center justify-center gap-1"><Clock className="h-4 w-4" /> Pendientes</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Hours comparison */}
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <CardTitle>Horas Estimadas vs Reales</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-4 sm:gap-8">
                                        <div>
                                            <div className="text-2xl font-bold text-primary">{Math.round(totalEstimated)}h</div>
                                            <div className="text-sm text-muted-foreground">Estimadas</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-blue-500">{totalActual}h</div>
                                            <div className="text-sm text-muted-foreground">Reales</div>
                                        </div>
                                        <div>
                                            <div className={`text-2xl font-bold ${totalActual > totalEstimated ? "text-red-500" : "text-green-500"}`}>
                                                {totalActual > totalEstimated ? "+" : ""}{Math.round(totalActual - totalEstimated)}h
                                            </div>
                                            <div className="text-sm text-muted-foreground">Diferencia</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Task list with status */}
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <CardTitle>Tareas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {allTasks.map((task) => (
                                            <div key={task.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-muted/50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={task.status || "pending"}
                                                        onValueChange={(v) => updateTask(task.id, { status: v })}
                                                    >
                                                        <SelectTrigger className={`w-32 sm:w-36 border-0 text-xs sm:text-sm ${task.status === "completed" ? "bg-green-500/20 text-green-500" :
                                                            task.status === "in_progress" ? "bg-yellow-500/20 text-yellow-500" : "bg-muted text-muted-foreground"
                                                            }`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pendiente</SelectItem>
                                                            <SelectItem value="in_progress">En Progreso</SelectItem>
                                                            <SelectItem value="completed">Completada</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Badge variant="outline" className="text-muted-foreground text-xs hidden sm:inline-flex">{task.moduleName}</Badge>
                                                </div>
                                                <span className={`flex-1 text-sm sm:text-base ${task.status === "completed" ? "text-muted-foreground line-through" : ""}`}>
                                                    {task.name}
                                                </span>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <span className="text-muted-foreground font-mono text-sm">{Math.round(task.estimatedHours)}h</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="Real"
                                                        value={task.actualHours || ""}
                                                        onChange={(e) => updateTask(task.id, { actualHours: parseFloat(e.target.value) || null })}
                                                        className="w-20 text-center"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })()}

                {/* Roadmap */}
                {viewMode === "roadmap" && project.modules.length > 0 && (
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle>Roadmap del Proyecto</CardTitle>
                            <CardDescription>
                                Duración estimada: {totalWeeks} semanas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <div className="space-y-4 min-w-[500px]">
                                    {/* Timeline header */}
                                    <div className="flex gap-1 text-xs text-muted-foreground pl-24 sm:pl-32">
                                        {Array.from({ length: totalWeeks }, (_, i) => (
                                            <div key={i} className="flex-1 text-center">S{i + 1}</div>
                                        ))}
                                    </div>

                                    {/* Phases */}
                                    {roadmap.map((item) => (
                                        <div key={item.phase} className="flex items-center gap-2">
                                            <div className="w-24 sm:w-28 text-xs sm:text-sm text-muted-foreground shrink-0">{phaseLabels[item.phase]}</div>
                                            <div className="flex-1 flex gap-1">
                                                {Array.from({ length: totalWeeks }, (_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex-1 h-8 rounded ${i >= item.startWeek && i < item.endWeek
                                                            ? phaseColors[item.phase]?.split(' ')[0] || 'bg-primary'
                                                            : "bg-muted"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="w-14 sm:w-16 text-right text-xs sm:text-sm text-muted-foreground shrink-0">{Math.round(item.hours)}h</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Phases */}
                {viewMode === "phases" && project.modules.length > 0 && (
                    <div className="space-y-6">
                        {["analysis", "design", "development", "testing", "deployment"].map((phase) => {
                            const phaseTasks = project.modules.flatMap((m) =>
                                m.tasks.filter((t) => t.phase === phase).map((t) => ({ ...t, moduleName: m.name }))
                            );
                            if (phaseTasks.length === 0) return null;

                            return (
                                <Card key={phase} className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle>{phaseLabels[phase]}</CardTitle>
                                        <CardDescription>
                                            {phaseTasks.reduce((sum, t) => sum + Math.round(t.estimatedHours), 0)} horas
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {phaseTasks.map((task) => (
                                                <div key={task.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-muted/50 rounded-lg group">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant="outline" className="text-muted-foreground text-xs">{task.moduleName}</Badge>
                                                        <Badge variant="secondary" className="text-xs">{roleLabels[task.role]}</Badge>
                                                    </div>
                                                    <span className="flex-1 text-foreground text-sm sm:text-base">{task.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground font-mono text-sm">{Math.round(task.estimatedHours)}h</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => deleteTask(task.id)}
                                                            className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors h-8 w-8"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Modules with editing */}
                {viewMode === "modules" && project.modules.length > 0 && (
                    <div className="space-y-6">
                        {project.modules.map((module) => (
                            <Card key={module.id} className="bg-card border-border">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>{module.name}</CardTitle>
                                        {module.description && <CardDescription>{module.description}</CardDescription>}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteModule(module.id)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {module.tasks.map((task) => (
                                            <div key={task.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-muted/50 rounded-lg group">
                                                {editingTask === task.id ? (
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                                                        <Input
                                                            value={editValues.name || task.name}
                                                            onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                                                            className="flex-1"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <Select
                                                                value={editValues.phase || task.phase}
                                                                onValueChange={(v) => setEditValues({ ...editValues, phase: v })}
                                                            >
                                                                <SelectTrigger className="w-28 sm:w-32">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="analysis">Análisis</SelectItem>
                                                                    <SelectItem value="design">Diseño</SelectItem>
                                                                    <SelectItem value="development">Desarrollo</SelectItem>
                                                                    <SelectItem value="testing">Pruebas</SelectItem>
                                                                    <SelectItem value="deployment">Despliegue</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <Input
                                                                type="number"
                                                                value={editValues.estimatedHours || task.estimatedHours}
                                                                onChange={(e) => setEditValues({ ...editValues, estimatedHours: Number(e.target.value) })}
                                                                className="w-20"
                                                            />
                                                            <Button size="icon" onClick={() => updateTask(task.id, editValues)} className="bg-green-600 hover:bg-green-700 h-9 w-9 shrink-0">
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" onClick={() => setEditingTask(null)} className="h-9 w-9 shrink-0">
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <Badge className={phaseColors[task.phase]}>{phaseLabels[task.phase]?.split(" ")[0]}</Badge>
                                                                <span className="font-medium text-foreground">{task.name}</span>
                                                                <Badge variant="secondary" className="text-xs">{roleLabels[task.role]}</Badge>
                                                            </div>
                                                            {task.userStory && (
                                                                <div className="mt-1 ml-1 text-xs text-muted-foreground flex items-start gap-1">
                                                                    <BookOpen className="h-3 w-3 mt-0.5" />
                                                                    <span className="italic">{task.userStory}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-muted-foreground font-mono">{Math.round(task.estimatedHours)}h</span>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => { setEditingTask(task.id); setEditValues(task); }}
                                                                className="text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors h-8 w-8"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => deleteTask(task.id)}
                                                                className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors h-8 w-8"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Proposal */}
                {viewMode === "proposal" && project.proposal && (
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle>Propuesta Comercial</CardTitle>
                            <CardDescription>Texto para enviar al cliente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <pre className="whitespace-pre-wrap text-muted-foreground font-sans text-sm leading-relaxed p-4 bg-muted/30 rounded-lg">
                                {project.proposal.content}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                {/* History View */}
                {viewMode === "history" && (
                    <div className="space-y-6">
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle>Historial de Planes</CardTitle>
                                <CardDescription>Versiones anteriores generadas automáticamente</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {history.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No hay historial disponible.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {history.map((entry) => (
                                            <div key={entry.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <Badge variant="outline" className="bg-background">v{entry.version}</Badge>
                                                        <span className="text-sm text-foreground font-medium">
                                                            {new Date(entry.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {entry.note && (
                                                        <p className="text-sm text-muted-foreground mb-2 italic">
                                                            "{entry.note}"
                                                        </p>
                                                    )}
                                                    <div className="text-xs text-muted-foreground flex gap-4">
                                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {Math.round(entry.totalHours)}h</span>
                                                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {formatCurrency(entry.totalCost)}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => restoreHistory(entry.id)}
                                                    disabled={!!restoringHistoryId}
                                                >
                                                    {restoringHistoryId === entry.id ? (
                                                        <RotateCw className="h-4 w-4 animate-spin mr-2" />
                                                    ) : (
                                                        <RotateCcw className="h-4 w-4 mr-2" />
                                                    )}
                                                    Restaurar
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
            {/* Confirmation Dialog */}
            <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <AlertDialogContent className="bg-card border-border sm:max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction?.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:flex-row gap-2">
                        <AlertDialogCancel className="flex-1">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className={`flex-1 ${confirmAction?.destructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}`}
                            onClick={() => {
                                confirmAction?.onConfirm();
                                setConfirmAction(null);
                            }}
                        >
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
