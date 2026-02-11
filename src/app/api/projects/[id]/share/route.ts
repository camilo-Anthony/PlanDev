import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import { handleApiError } from "@/lib/error-handler";

// POST /api/projects/[id]/share - Generar token para compartir
export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Generar token único
        const shareToken = randomBytes(16).toString("hex");

        await db.project.update({
            where: { id },
            data: { shareToken },
        });

        const shareUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/shared/${shareToken}`;

        return NextResponse.json({ shareToken, shareUrl });
    } catch (error) {
        return handleApiError(error, "Share Project");
    }
}

// DELETE /api/projects/[id]/share - Desactivar compartir
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await db.project.update({
            where: { id },
            data: { shareToken: null },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error, "Unshare Project");
    }
}
