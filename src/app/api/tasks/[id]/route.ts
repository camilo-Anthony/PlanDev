import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateProjectDuration } from "@/domain/estimation";
import { handleApiError } from "@/lib/error-handler";


/**
 * Recalcula los totales del proyecto después de modificar una tarea
 */
async function recalculateProjectTotals(projectId: string) {
    const project = await db.project.findUnique({
        where: { id: projectId },
        include: {
            config: true,
            modules: { include: { tasks: true } },
            proposal: true,
        },
    });

    if (!project) return;

    const allTasks = project.modules.flatMap((m: { tasks: Array<{ estimatedHours: number; phase: string; role: string }>, contingencyPercent?: number }) => m.tasks);
    const config = project.config;
    let baseHours = 0;
    let totalCost = 0;
    const phaseHours: Record<string, number> = {};

    for (const task of allTasks) {
        const hours = Math.round(task.estimatedHours);
        baseHours += hours;
        phaseHours[task.phase] = (phaseHours[task.phase] || 0) + hours;

        const rate = task.role === "developer"
            ? (config?.developerRate || 50)
            : task.role === "qa"
                ? (config?.qaRate || 40)
                : (config?.pmRate || 60);
        totalCost += hours * rate;
    }

    // Usar porcentaje de contingencia existente o el de los módulos
    const contingencyPercent = project.proposal?.contingencyPercent
        ?? project.modules[0]?.contingencyPercent
        ?? 0.15;

    const contingencyHours = Math.round(baseHours * contingencyPercent);
    const totalHours = baseHours + contingencyHours;

    // Agregar costo de contingencia
    const avgRate = config?.developerRate || 50;
    totalCost += contingencyHours * avgRate;

    const durationCalc = calculateProjectDuration(phaseHours, config?.hoursPerWeek || 40, config?.teamSize || 1);
    const duration = `${durationCalc.totalWeeks} semanas`;

    if (project.proposal) {
        await db.proposal.update({
            where: { id: project.proposal.id },
            data: {
                baseHours,
                contingencyPercent,
                contingencyHours,
                totalHours,
                totalCost: Math.round(totalCost),
                duration
            },
        });
    }
}

// PUT /api/tasks/[id] - Actualizar tarea
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Obtener tarea actual para saber el projectId
        const existingTask = await db.task.findUnique({
            where: { id },
            include: { module: true },
        });

        const task = await db.task.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                phase: body.phase,
                estimatedHours: body.estimatedHours,
                actualHours: body.actualHours,
                role: body.role,
                order: body.order,
                status: body.status,
                dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
                completedAt: body.status === "completed" && !body.completedAt
                    ? new Date()
                    : body.completedAt ? new Date(body.completedAt) : undefined,
            },
        });

        // Auto-recalcular costos después de editar
        if (existingTask?.module?.projectId) {
            await recalculateProjectTotals(existingTask.module.projectId);
        }

        return NextResponse.json(task);
    } catch (error) {
        return handleApiError(error, "Update Task");
    }
}

// DELETE /api/tasks/[id] - Eliminar tarea
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await db.task.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error, "Delete Task");
    }
}
