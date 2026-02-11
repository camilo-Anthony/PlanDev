import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { logger } from "./logger";

/**
 * Standardized error response interface
 */
interface ErrorResponse {
    error: string;
    code?: string;
    details?: unknown;
}

/**
 * Type guard to check if error is a Prisma error
 */
function isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'meta' in error &&
        error.constructor.name === 'PrismaClientKnownRequestError'
    );
}

/**
 * Handles API errors with appropriate status codes and messages
 * Differentiates between validation, database, and server errors
 * 
 * @param error - The error object to handle
 * @param context - Optional context for debugging
 * @returns NextResponse with appropriate error message and status
 */
export function handleApiError(
    error: unknown,
    context?: string
): NextResponse<ErrorResponse> {
    // Log error with context
    const errorContext = context ? `[${context}]` : '';
    logger.error(`${errorContext} API Error:`, error);

    // Prisma database errors
    if (isPrismaError(error)) {
        const errorMap: Record<string, { message: string; status: number }> = {
            P2002: { message: "Ya existe un registro con estos datos", status: 409 },
            P2025: { message: "Registro no encontrado", status: 404 },
            P2003: { message: "Referencia inválida", status: 400 },
        };

        const mapped = errorMap[error.code] || {
            message: "Error de base de datos",
            status: 500,
        };

        return NextResponse.json(
            {
                error: mapped.message,
                code: error.code,
                ...(process.env.NODE_ENV === "development" && { details: error.meta }),
            },
            { status: mapped.status }
        );
    }

    // Validation errors (custom)
    if (error instanceof Error && error.name === "ValidationError") {
        return NextResponse.json(
            {
                error: error.message,
                code: "VALIDATION_ERROR",
            },
            { status: 400 }
        );
    }

    // Standard Error objects
    if (error instanceof Error) {
        // Check for specific error messages
        if (error.message.includes("API")) {
            return NextResponse.json(
                {
                    error: "Error al comunicarse con el servicio de IA",
                    ...(process.env.NODE_ENV === "development" && { details: error.message }),
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                error: error.message,
                ...(process.env.NODE_ENV === "development" && { details: error.stack }),
            },
            { status: 500 }
        );
    }

    // Unknown errors
    return NextResponse.json(
        {
            error: "Error interno del servidor",
            ...(process.env.NODE_ENV === "development" && { details: String(error) }),
        },
        { status: 500 }
    );
}
