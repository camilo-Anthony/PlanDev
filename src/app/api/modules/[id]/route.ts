import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";

// PUT /api/modules/[id] - Actualizar módulo
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const moduleData = await db.module.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                order: body.order,
            },
        });

        return NextResponse.json(moduleData);
    } catch (error) {
        return handleApiError(error, "Update Module");
    }
}

// DELETE /api/modules/[id] - Eliminar módulo
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await db.module.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error, "Delete Module");
    }
}
