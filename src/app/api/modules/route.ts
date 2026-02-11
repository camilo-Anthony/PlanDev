import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";

// POST /api/modules - Crear módulo
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const moduleData = await db.module.create({
            data: {
                projectId: body.projectId,
                name: body.name,
                description: body.description || null,
                order: body.order || 0,
            },
        });

        return NextResponse.json(moduleData, { status: 201 });
    } catch (error) {
        return handleApiError(error, "Create Module");
    }
}
