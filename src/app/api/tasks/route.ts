import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";

// POST /api/tasks - Crear tarea
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const task = await db.task.create({
            data: {
                moduleId: body.moduleId,
                name: body.name,
                description: body.description || null,
                phase: body.phase || "development",
                estimatedHours: body.estimatedHours || 1,
                role: body.role || "developer",
                order: body.order || 0,
            },
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        return handleApiError(error, "Create Task");
    }
}
