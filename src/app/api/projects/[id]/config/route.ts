import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";

/**
 * PUT /api/projects/[id]/config
 * Actualizar configuración del proyecto (tarifas, etc.)
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Buscar config existente
        const existingConfig = await db.projectConfig.findUnique({
            where: { projectId: id },
        });

        if (!existingConfig) {
            return NextResponse.json(
                { error: "Configuración no encontrada" },
                { status: 404 }
            );
        }

        // Actualizar solo los campos enviados
        const updatedConfig = await db.projectConfig.update({
            where: { projectId: id },
            data: {
                developerRate: body.developerRate ?? existingConfig.developerRate,
                qaRate: body.qaRate ?? existingConfig.qaRate,
                pmRate: body.pmRate ?? existingConfig.pmRate,
                hoursPerWeek: body.hoursPerWeek ?? existingConfig.hoursPerWeek,
                teamSize: body.teamSize ?? existingConfig.teamSize,
                workDays: body.workDays ?? existingConfig.workDays,
                hoursPerDay: body.hoursPerDay ?? existingConfig.hoursPerDay,
            },
        });

        return NextResponse.json(updatedConfig);
    } catch (error) {
        return handleApiError(error, "Update Config");
    }
}
