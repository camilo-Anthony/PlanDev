import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";

// GET /api/projects/[id]/history - Obtener historial de planes
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const history = await db.planHistory.findMany({
            where: { projectId: id },
            orderBy: { version: "desc" },
            select: {
                id: true,
                version: true,
                totalHours: true,
                totalCost: true,
                createdAt: true,
                note: true,
            },
        });

        return NextResponse.json(history);
    } catch (error) {
        return handleApiError(error, "Get History");
    }
}

// POST /api/projects/[id]/history - Restaurar una versión del historial
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { historyId } = await request.json();

        if (!historyId) {
            return NextResponse.json(
                { error: "historyId es requerido" },
                { status: 400 }
            );
        }

        // Obtener el snapshot del historial
        const historyEntry = await db.planHistory.findUnique({
            where: { id: historyId },
        });

        if (!historyEntry || historyEntry.projectId !== id) {
            return NextResponse.json(
                { error: "Entrada de historial no encontrada" },
                { status: 404 }
            );
        }

        // Guardar plan actual en historial antes de restaurar
        const existingModules = await db.module.findMany({
            where: { projectId: id },
            include: { tasks: { orderBy: { order: "asc" } } },
            orderBy: { order: "asc" },
        });

        const existingProposal = await db.proposal.findUnique({
            where: { projectId: id },
        });

        if (existingModules.length > 0 && existingProposal) {
            const lastHistory = await db.planHistory.findFirst({
                where: { projectId: id },
                orderBy: { version: "desc" },
            });
            const newVersion = (lastHistory?.version || 0) + 1;

            await db.planHistory.create({
                data: {
                    projectId: id,
                    modulesData: JSON.stringify(existingModules),
                    proposalData: JSON.stringify(existingProposal),
                    totalHours: existingProposal.totalHours,
                    totalCost: existingProposal.totalCost,
                    version: newVersion,
                    note: "[Auto] Guardado antes de restaurar",
                },
            });
        }

        // Eliminar plan actual
        await db.module.deleteMany({ where: { projectId: id } });
        await db.proposal.deleteMany({ where: { projectId: id } });

        // Restaurar módulos desde el snapshot
        const modules = JSON.parse(historyEntry.modulesData);
        for (const mod of modules) {
            await db.module.create({
                data: {
                    projectId: id,
                    name: mod.name,
                    description: mod.description,
                    order: mod.order,
                    contingencyPercent: mod.contingencyPercent,
                    contingencyHours: mod.contingencyHours,
                    tasks: {
                        create: mod.tasks.map((task: Record<string, unknown>) => ({
                            name: task.name,
                            description: task.description,
                            phase: task.phase,
                            role: task.role,
                            order: task.order,
                            hoursOptimistic: task.hoursOptimistic,
                            hoursMostLikely: task.hoursMostLikely,
                            hoursPessimistic: task.hoursPessimistic,
                            hoursExpected: task.hoursExpected,
                            hoursDeviation: task.hoursDeviation,
                            estimatedHours: task.estimatedHours,
                            status: task.status || "pending",
                            userStory: task.userStory,
                        })),
                    },
                },
            });
        }

        // Restaurar propuesta
        if (historyEntry.proposalData) {
            const proposal = JSON.parse(historyEntry.proposalData);
            await db.proposal.create({
                data: {
                    projectId: id,
                    content: proposal.content,
                    baseHours: proposal.baseHours,
                    contingencyPercent: proposal.contingencyPercent,
                    contingencyHours: proposal.contingencyHours,
                    totalHours: proposal.totalHours,
                    totalCost: proposal.totalCost,
                    duration: proposal.duration,
                },
            });
        }

        // Obtener proyecto actualizado
        const updatedProject = await db.project.findUnique({
            where: { id },
            include: {
                config: true,
                requirements: true,
                technical: true,
                modules: {
                    orderBy: { order: "asc" },
                    include: {
                        tasks: { orderBy: { order: "asc" } },
                    },
                },
                proposal: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: `Plan v${historyEntry.version} restaurado`,
            project: updatedProject,
        });
    } catch (error) {
        return handleApiError(error, "Restore History");
    }
}
