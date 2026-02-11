import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";


/**
 * POST /api/projects/[id]/recalculate
 * Recalcula costos, horas totales y duración basado en las tareas actuales
 */
export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Obtener proyecto con todas las tareas
        const project = await db.project.findUnique({
            where: { id },
            include: {
                config: true,
                modules: {
                    include: {
                        tasks: true,
                    },
                },
                proposal: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Proyecto no encontrado" },
                { status: 404 }
            );
        }

        // Obtener todas las tareas
        const allTasks = project.modules.flatMap(m => m.tasks);

        if (allTasks.length === 0) {
            return NextResponse.json(
                { error: "El proyecto no tiene tareas" },
                { status: 400 }
            );
        }

        // Calcular totales
        const config = project.config;
        let baseHours = 0;
        let totalCost = 0;
        const phaseHours: Record<string, number> = {};

        for (const task of allTasks) {
            const hours = task.estimatedHours;
            baseHours += hours;

            // Acumular horas por fase
            phaseHours[task.phase] = (phaseHours[task.phase] || 0) + hours;

            // Calcular costo según rol
            const rate =
                task.role === "developer"
                    ? (config?.developerRate || 50)
                    : task.role === "qa"
                        ? (config?.qaRate || 40)
                        : (config?.pmRate || 60);

            totalCost += hours * rate;
        }

        // Sin contingencia - totalHours = baseHours
        const contingencyPercent = 0;
        const contingencyHours = 0;
        const totalHours = Math.round(baseHours);

        // Calcular duración: totalHours ÷ (hoursPerWeek × teamSize)
        const hoursPerWeek = config?.hoursPerWeek || 40;
        const teamSize = config?.teamSize || 1;
        const weeklyCapacity = hoursPerWeek * teamSize;
        const totalWeeks = Math.ceil(totalHours / weeklyCapacity);
        const duration = `${totalWeeks} semanas`;

        // Actualizar propuesta existente o crear nueva
        if (project.proposal) {
            await db.proposal.update({
                where: { id: project.proposal.id },
                data: {
                    baseHours,
                    contingencyPercent,
                    contingencyHours,
                    totalHours,
                    totalCost: Math.round(totalCost),
                    duration,
                },
            });
        } else {
            await db.proposal.create({
                data: {
                    projectId: id,
                    content: "Propuesta generada automáticamente",
                    baseHours,
                    contingencyPercent,
                    contingencyHours,
                    totalHours,
                    totalCost: Math.round(totalCost),
                    duration,
                },
            });
        }

        // Retornar datos actualizados
        return NextResponse.json({
            success: true,
            totalHours,
            totalCost: Math.round(totalCost),
            duration,
            phaseHours,
        });
    } catch (error) {
        return handleApiError(error, "Recalculate Costs");
    }
}
