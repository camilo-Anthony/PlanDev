import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";

// POST /api/projects/[id]/duplicate - Duplicar proyecto
export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Obtener proyecto original con todas sus relaciones
        const original = await db.project.findUnique({
            where: { id },
            include: {
                config: true,
                requirements: true,
                technical: true,
                modules: {
                    include: { tasks: true },
                },
                proposal: true,
            },
        });

        if (!original) {
            return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
        }

        // Crear copia del proyecto
        const newProject = await db.project.create({
            data: {
                name: `${original.name} (copia)`,
                type: original.type,
                currency: original.currency,
                language: original.language,
                config: original.config ? {
                    create: {
                        developerRate: original.config.developerRate,
                        qaRate: original.config.qaRate,
                        pmRate: original.config.pmRate,
                        hoursPerWeek: original.config.hoursPerWeek,
                        teamSize: original.config.teamSize,
                    },
                } : undefined,
                requirements: original.requirements ? {
                    create: {
                        description: original.requirements.description,
                        objective: original.requirements.objective,
                        userRoles: original.requirements.userRoles,
                        features: original.requirements.features,
                        integrations: original.requirements.integrations,
                    },
                } : undefined,
                technical: original.technical ? {
                    create: {
                        architecture: original.technical.architecture,
                        frontend: original.technical.frontend,
                        backend: original.technical.backend,
                        database: original.technical.database,
                        infrastructure: original.technical.infrastructure,
                        constraints: original.technical.constraints,
                    },
                } : undefined,
                modules: {
                    create: original.modules.map((module) => ({
                        name: module.name,
                        description: module.description,
                        order: module.order,
                        tasks: {
                            create: module.tasks.map((task) => ({
                                name: task.name,
                                description: task.description,
                                userStory: task.userStory,
                                phase: task.phase,
                                estimatedHours: task.estimatedHours,
                                role: task.role,
                                order: task.order,
                            })),
                        },
                    })),
                },
                proposal: original.proposal ? {
                    create: {
                        content: original.proposal.content,
                        totalHours: original.proposal.totalHours,
                        totalCost: original.proposal.totalCost,
                        duration: original.proposal.duration,
                    },
                } : undefined,
            },
        });

        return NextResponse.json({ id: newProject.id, name: newProject.name });
    } catch (error) {
        return handleApiError(error, "Duplicate Project");
    }
}
