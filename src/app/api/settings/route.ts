import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";
import { auth } from "@/auth";

/**
 * GET /api/settings - Obtener configuración del usuario actual
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        // Buscar configuración existente o devolver defaults
        let config = await db.userConfig.findUnique({
            where: { userId: session.user.id },
        });

        // Si no existe, crear con valores por defecto
        if (!config) {
            config = await db.userConfig.create({
                data: { userId: session.user.id },
            });
        }

        return NextResponse.json(config);
    } catch (error) {
        return handleApiError(error, "Get User Config");
    }
}

/**
 * PUT /api/settings - Actualizar configuración del usuario
 */
export async function PUT(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        const data = await request.json();

        // Validar que la distribución de fases sume 1.0 si se proporciona
        const phaseKeys = ["phaseAnalysis", "phaseDesign", "phaseDevelopment", "phaseTesting", "phaseDeployment"] as const;
        const providedPhases = phaseKeys.filter(k => data[k] !== undefined);

        if (providedPhases.length > 0 && providedPhases.length < 5) {
            return NextResponse.json({
                error: "Si modifica la distribución de fases, debe proporcionar todos los valores"
            }, { status: 400 });
        }

        if (providedPhases.length === 5) {
            const sum = phaseKeys.reduce((acc, k) => acc + (data[k] || 0), 0);
            if (Math.abs(sum - 1.0) > 0.01) {
                return NextResponse.json({
                    error: `La distribución de fases debe sumar 100% (actual: ${(sum * 100).toFixed(1)}%)`
                }, { status: 400 });
            }
        }

        // Upsert configuración
        const config = await db.userConfig.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                ...data,
            },
            update: data,
        });

        return NextResponse.json(config);
    } catch (error) {
        return handleApiError(error, "Update User Config");
    }
}

/**
 * DELETE /api/settings - Restablecer configuración a valores por defecto
 */
export async function DELETE() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        // Eliminar configuración actual
        await db.userConfig.deleteMany({
            where: { userId: session.user.id },
        });

        // Crear nueva con defaults
        const config = await db.userConfig.create({
            data: { userId: session.user.id },
        });

        return NextResponse.json({
            message: "Configuración restablecida a valores por defecto",
            config,
        });
    } catch (error) {
        return handleApiError(error, "Reset User Config");
    }
}
