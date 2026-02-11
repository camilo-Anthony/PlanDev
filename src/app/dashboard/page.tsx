import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Plus,
    Folder,
    Clock,
    DollarSign,
    LayoutDashboard,
    Sparkles,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

type ProjectWithRelations = {
    id: string;
    name: string;
    type: string;
    createdAt: Date;
    proposal: { totalHours: number; totalCost: number } | null;
    modules: { tasks: { id: string }[] }[];
};

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Obtener proyectos del usuario
    const projects = (await db.project.findMany({
        where: { userId: session.user.id },
        include: {
            proposal: true,
            modules: {
                include: {
                    tasks: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    })) as ProjectWithRelations[];

    // Calcular estadísticas
    const totalProjects = projects.length;
    const totalHours = projects.reduce(
        (acc: number, p: ProjectWithRelations) => acc + (p.proposal?.totalHours || 0),
        0
    );
    const totalValue = projects.reduce(
        (acc: number, p: ProjectWithRelations) => acc + (p.proposal?.totalCost || 0),
        0
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Plan<span className="text-primary">Dev</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:block">
                            {session.user.email}
                        </span>
                        <SignOutButton />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <LayoutDashboard className="h-8 w-8 text-primary" />
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Bienvenido, {session.user.name || session.user.email}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription>Total Proyectos</CardDescription>
                                <Folder className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-3xl">{totalProjects}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription>Horas Estimadas</CardDescription>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-3xl">{Math.round(totalHours)}h</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription>Valor Total</CardDescription>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-3xl">
                                ${totalValue.toLocaleString()}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Projects Section */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Mis Proyectos</h2>
                    <Link href="/projects/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Proyecto
                        </Button>
                    </Link>
                </div>

                {projects.length === 0 ? (
                    <Card className="bg-card border-border border-dashed">
                        <CardHeader className="text-center py-12">
                            <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <CardTitle>No tienes proyectos aún</CardTitle>
                            <CardDescription className="mt-2">
                                Crea tu primer proyecto y genera un plan con IA
                            </CardDescription>
                            <Link href="/projects/new" className="mt-4 inline-block">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear Proyecto
                                </Button>
                            </Link>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((project: ProjectWithRelations) => (
                            <Link key={project.id} href={`/projects/${project.id}`}>
                                <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{project.name}</CardTitle>
                                                <CardDescription className="capitalize">
                                                    {project.type}
                                                </CardDescription>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(project.createdAt).toLocaleDateString("es")}
                                            </span>
                                        </div>
                                        <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Folder className="h-3 w-3" />
                                                {project.modules.length} módulos
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {project.proposal?.totalHours || 0}h
                                            </span>
                                            {project.proposal?.totalCost && (
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3" />
                                                    {project.proposal.totalCost.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
