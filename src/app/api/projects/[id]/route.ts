import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";
import { auth } from "@/auth";

// GET /api/projects/[id] - Obtener un proyecto por ID
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        // Buscar proyecto verificando que pertenezca al usuario o sea público (shareToken)
        const project = await db.project.findUnique({
            where: { id },
            include: {
                config: true,
                requirements: true,
                technical: true,
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
            return NextResponse.json(
                { error: "Proyecto no encontrado" },
                { status: 404 }
            );
        }

        // Verificar acceso: debe ser el dueño o el proyecto debe tener shareToken activo
        if (project.userId && project.userId !== session?.user?.id && !project.shareToken) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        return NextResponse.json(project);
    } catch (error) {
        return handleApiError(error, "Get Project");
    }
}

// DELETE /api/projects/[id] - Eliminar un proyecto
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Verificar que el proyecto pertenezca al usuario
        const project = await db.project.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Proyecto no encontrado" },
                { status: 404 }
            );
        }

        if (project.userId !== session.user.id) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        await db.project.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error, "Delete Project");
    }
}

// PUT /api/projects/[id] - Actualizar un proyecto
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        // Verificar que el proyecto pertenezca al usuario
        const existingProject = await db.project.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!existingProject) {
            return NextResponse.json(
                { error: "Proyecto no encontrado" },
                { status: 404 }
            );
        }

        if (existingProject.userId !== session.user.id) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        const project = await db.project.update({
            where: { id },
            data: {
                ...(body.currency && { currency: body.currency }),
                ...(body.name && { name: body.name }),
                ...(body.type && { type: body.type }),
            },
        });

        return NextResponse.json(project);
    } catch (error) {
        return handleApiError(error, "Update Project");
    }
}

