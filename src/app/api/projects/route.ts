import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";
import { auth } from "@/auth";

/**
 * GET /api/projects - Lista todos los proyectos del usuario con paginación
 * Query params:
 *  - page: número de página (default: 1)
 *  - limit: proyectos por página (default: 20, max: 100)
 */
export async function GET(request: Request) {
    try {
        const session = await auth();

        // Si no está autenticado, devolver vacío
        if (!session?.user?.id) {
            return NextResponse.json({
                projects: [],
                pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false },
            });
        }

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

        const skip = (page - 1) * limit;

        const [projects, total] = await Promise.all([
            db.project.findMany({
                where: { userId: session.user.id },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    proposal: {
                        select: {
                            totalHours: true,
                            totalCost: true,
                        },
                    },
                },
            }),
            db.project.count({ where: { userId: session.user.id } }),
        ]);

        return NextResponse.json({
            projects,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + projects.length < total,
            },
        });
    } catch (error) {
        return handleApiError(error, "Get Projects");
    }
}

// POST /api/projects - Crea un nuevo proyecto
export async function POST(request: Request) {
    try {
        const session = await auth();

        // Si no está autenticado, devolver error
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Parsear listas separadas por coma/línea
        const userRoles = body.userRoles
            ? body.userRoles.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [];
        const features = body.features
            ? body.features.split("\n").map((s: string) => s.trim()).filter(Boolean)
            : [];
        const integrations = body.integrations
            ? body.integrations.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [];

        // Crear proyecto con todas sus relaciones
        const project = await db.project.create({
            data: {
                userId: session.user.id,
                name: body.name,
                type: body.type || "web",
                currency: body.currency || "USD",
                language: "es",
                config: {
                    create: {
                        developerRate: body.developerRate || 50,
                        qaRate: body.qaRate || 40,
                        pmRate: body.pmRate || 60,
                        hoursPerWeek: body.hoursPerWeek || 40,
                        teamSize: body.teamSize || 1,
                        startDate: body.startDate ? new Date(body.startDate) : null,
                        freelancerName: body.freelancerName || "Tu Nombre",
                        // Nuevos campos - transformar "auto" a "medium"
                        complexity: body.complexity === "auto" ? "medium" : (body.complexity || "medium"),
                        clientType: body.clientType || "startup",
                        deadline: body.deadline || "normal",
                        budgetRange: body.budgetRange || null,
                        developers: body.developers || 1,
                        qaMembers: body.qaMembers || 0,
                    },
                },
                requirements: {
                    create: {
                        description: body.description || "",
                        objective: body.objective || null,
                        userRoles: JSON.stringify(userRoles),
                        features: JSON.stringify(features),
                        integrations: JSON.stringify(integrations),
                        // Nuevos campos para estimación
                        hasPayments: body.hasPayments || false,
                        screenCount: body.screenCount || "medium",
                        requirementsClarity: body.requirementsClarity || "moderate",
                    },
                },
                technical: {
                    create: {
                        architecture: body.architecture || null,
                        frontend: body.frontend || null,
                        backend: body.backend || null,
                        database: body.database || null,
                        infrastructure: body.infrastructure || null,
                        constraints: body.constraints || null,
                    },
                },
            },
            include: {
                config: true,
                requirements: true,
                technical: true,
            },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        return handleApiError(error, "Create Project");
    }
}

