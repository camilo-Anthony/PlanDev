"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Layers,
    Plus,
    Trash2,
    Folder,
    Rocket,
    Clock,
    DollarSign,
    ArrowRight,
    Smartphone,
    Globe,
    ShoppingCart,
    Building,
    Plug,
    Box,
    Search,
    Grid3X3,
    List,
    Settings,
    LogOut,
    BarChart3,
    AlertTriangle,
} from "lucide-react";

interface Project {
    id: string;
    name: string;
    type: string;
    currency: string;
    createdAt: string;
    proposal: {
        totalHours: number;
        totalCost: number;
    } | null;
}

const typeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
    web: { label: "Web", icon: <Globe className="h-3 w-3" /> },
    mobile: { label: "Movil", icon: <Smartphone className="h-3 w-3" /> },
    ecommerce: { label: "E-commerce", icon: <ShoppingCart className="h-3 w-3" /> },
    internal: { label: "Interno", icon: <Building className="h-3 w-3" /> },
    api: { label: "API", icon: <Plug className="h-3 w-3" /> },
    other: { label: "Otro", icon: <Box className="h-3 w-3" /> },
};

function SkeletonCard() {
    return (
        <Card className="bg-card border-border">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="skeleton h-6 w-20 rounded" />
                    <div className="skeleton h-8 w-8 rounded" />
                </div>
                <div className="skeleton h-6 w-3/4 rounded mt-2" />
                <div className="skeleton h-4 w-1/2 rounded mt-1" />
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-4">
                    <div>
                        <div className="skeleton h-6 w-16 rounded" />
                        <div className="skeleton h-3 w-12 rounded mt-1" />
                    </div>
                    <div>
                        <div className="skeleton h-6 w-24 rounded" />
                        <div className="skeleton h-3 w-12 rounded mt-1" />
                    </div>
                </div>
                <div className="skeleton h-10 w-full rounded" />
            </CardContent>
        </Card>
    );
}

export default function ProjectsPage() {
    const { data: session } = useSession();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects");
            if (res.ok) {
                const data = await res.json();
                setProjects(data.projects || []);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
            if (res.ok) {
                setProjects((prev) => prev.filter((p) => p.id !== id));
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setDeleteTarget(null);
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency,
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("es-PE", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Dashboard stats
    const totalHours = projects.reduce((sum, p) => sum + Math.round(p.proposal?.totalHours || 0), 0);
    const totalValue = projects.reduce((sum, p) => sum + Math.round(p.proposal?.totalCost || 0), 0);
    const mainCurrency = projects[0]?.currency || "USD";

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold flex items-center gap-2">
                        <Layers className="h-6 w-6" />
                        PlanDev
                    </Link>
                    <div className="flex items-center gap-2">
                        {session?.user?.name && (
                            <span className="text-sm text-muted-foreground hidden sm:inline">
                                {session.user.name}
                            </span>
                        )}
                        <Link href="/settings">
                            <Button variant="ghost" size="icon" title="Configuración">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button variant="ghost" size="icon" title="Cerrar sesión" onClick={async () => { await signOut({ redirect: false }); window.location.href = "/"; }}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                        <Link href="/projects/new">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 interactive">
                                <Plus className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Nuevo Proyecto</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Overview */}
                {!loading && projects.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
                        <Card className="bg-card border-border">
                            <CardContent className="pt-5 pb-4 text-center">
                                <div className="text-2xl sm:text-3xl font-bold text-primary">{projects.length}</div>
                                <div className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1">
                                    <Folder className="h-3 w-3" /> Proyectos
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border">
                            <CardContent className="pt-5 pb-4 text-center">
                                <div className="text-2xl sm:text-3xl font-bold text-foreground">{totalHours}h</div>
                                <div className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1">
                                    <Clock className="h-3 w-3" /> Horas
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border">
                            <CardContent className="pt-5 pb-4 text-center">
                                <div className="text-2xl sm:text-3xl font-bold text-green-500">
                                    {formatCurrency(totalValue, mainCurrency)}
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1">
                                    <BarChart3 className="h-3 w-3" /> Valor total
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Title and Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold animate-fade-in">Mis Proyectos</h1>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar proyectos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-64"
                            />
                        </div>

                        {/* View Toggle */}
                        <div className="flex border border-border rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50"}`}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-muted" : "hover:bg-muted/50"}`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading Skeleton */}
                {loading && (
                    <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                )}

                {/* Empty State */}
                {!loading && projects.length === 0 && (
                    <Card className="bg-card border-border animate-fade-in">
                        <CardContent className="py-12 text-center text-foreground">
                            <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <h2 className="text-2xl font-bold mb-2">
                                No tienes proyectos aun
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                Crea tu primer proyecto y genera un plan con IA.
                            </p>
                            <Link href="/projects/new">
                                <Button size="lg" className="interactive">
                                    <Rocket className="mr-2 h-4 w-4" /> Crear Proyecto
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* No Results */}
                {!loading && projects.length > 0 && filteredProjects.length === 0 && (
                    <Card className="bg-card border-border animate-fade-in">
                        <CardContent className="py-12 text-center text-foreground">
                            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h2 className="text-xl font-bold mb-2">
                                Sin resultados
                            </h2>
                            <p className="text-muted-foreground">
                                No se encontraron proyectos con &quot;{searchQuery}&quot;
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Projects Grid/List */}
                {!loading && filteredProjects.length > 0 && (
                    <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                        {filteredProjects.map((project, index) => (
                            <Card
                                key={project.id}
                                className={`bg-card border-border card-interactive group animate-slide-up`}
                                style={{ opacity: 0, animationDelay: `${index * 0.05}s` }}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <Badge variant="outline" className="text-muted-foreground flex items-center gap-1">
                                            {typeConfig[project.type]?.icon || <Box className="h-3 w-3" />}
                                            {typeConfig[project.type]?.label || project.type}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteTarget({ id: project.id, name: project.name })}
                                            className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 h-8 w-8 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <CardTitle className="mt-2 text-xl">
                                        {project.name}
                                    </CardTitle>
                                    <CardDescription>
                                        Creado el {formatDate(project.createdAt)}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {project.proposal ? (
                                        <div className="flex gap-4 mb-4">
                                            <div>
                                                <div className="text-xl font-bold text-primary">
                                                    {Math.round(project.proposal.totalHours)}h
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> Horas
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xl font-bold text-green-500">
                                                    {formatCurrency(
                                                        project.proposal.totalCost,
                                                        project.currency
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3" /> Costo
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse-subtle" />
                                            Sin plan generado
                                        </div>
                                    )}

                                    <Link href={`/projects/${project.id}`}>
                                        <Button
                                            variant="outline"
                                            className="w-full hover:bg-muted interactive"
                                        >
                                            Ver Proyecto <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent className="bg-card border-border sm:max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar proyecto</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Eliminar <strong className="text-foreground">{deleteTarget?.name}</strong>? Esta acción es permanente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:flex-row gap-2">
                        <AlertDialogCancel className="flex-1">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
