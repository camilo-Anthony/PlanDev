import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";

// GET /api/shared/[token] - Obtener proyecto por token público
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        const project = await db.project.findUnique({
            where: { shareToken: token },
            include: {
                config: true,
                modules: {
                    orderBy: { order: "asc" },
                    include: {
                        tasks: {
                            orderBy: { order: "asc" },
                        },
                    },
                },
                proposal: true,
            },
        });

        if (!project) {
            return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
        }

        // Retornar datos públicos (sin tarifas sensibles)
        return NextResponse.json({
            id: project.id,
            name: project.name,
            type: project.type,
            currency: project.currency,
            modules: project.modules,
            proposal: project.proposal,
            hoursPerWeek: project.config?.hoursPerWeek || 40,
            teamSize: project.config?.teamSize || 1,
        });
    } catch (error) {
        return handleApiError(error, "Get Shared Project");
    }
}
