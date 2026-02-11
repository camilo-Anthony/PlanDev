import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        // Validaciones
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email y contraseña son requeridos" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "La contraseña debe tener al menos 6 caracteres" },
                { status: 400 }
            );
        }

        // Verificar si ya existe
        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "El email ya está registrado" },
                { status: 400 }
            );
        }

        // Crear usuario
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await db.user.create({
            data: {
                name: name || null,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        return handleApiError(error, "Register User");
    }
}
