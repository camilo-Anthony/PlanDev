import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";

// GET /api/projects/[id]/export/csv - Exportar tareas a CSV
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const project = await db.project.findUnique({
            where: { id },
            include: {
                config: true,
                modules: {
                    orderBy: { order: "asc" },
                    include: { tasks: { orderBy: { order: "asc" } } },
                },
            },
        });

        if (!project) {
            return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
        }

        const phaseLabels: Record<string, string> = {
            analysis: "Análisis",
            design: "Diseño",
            development: "Desarrollo",
            testing: "Pruebas",
            deployment: "Despliegue",
        };

        const roleLabels: Record<string, string> = {
            developer: "Desarrollador",
            qa: "QA",
            pm: "PM",
        };

        // Calcular tarifa por rol
        const rates: Record<string, number> = {
            developer: project.config?.developerRate || 50,
            qa: project.config?.qaRate || 40,
            pm: project.config?.pmRate || 60,
        };

        // Generar CSV
        const headers = ["Módulo", "Tarea", "Descripción", "Fase", "Horas", "Rol", "Tarifa/h", "Costo"];
        const rows: string[][] = [];

        // Orden cronológico de fases
        const PHASE_ORDER = ["analysis", "design", "development", "testing", "deployment"];

        project.modules.forEach((module) => {
            // Ordenar tareas por fase cronológicamente
            const sortedTasks = [...module.tasks].sort((a, b) => {
                return PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase);
            });

            sortedTasks.forEach((task) => {
                const rate = rates[task.role] || 50;
                // Redondear horas ANTES de calcular costo (consistente con dashboard)
                const roundedHours = Math.round(task.estimatedHours);
                const cost = roundedHours * rate;
                rows.push([
                    module.name,
                    task.name,
                    task.description || "",
                    phaseLabels[task.phase] || task.phase,
                    roundedHours.toString(),
                    roleLabels[task.role] || task.role,
                    rate.toString(),
                    cost.toString(),
                ]);
            });
        });

        // Escapar valores CSV
        const escapeCSV = (val: string) => {
            if (val.includes(",") || val.includes('"') || val.includes("\n")) {
                return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        };

        let csv = headers.map(escapeCSV).join(",") + "\n";
        csv += rows.map((row) => row.map(escapeCSV).join(",")).join("\n");

        // Agregar totales
        const totalHours = rows.reduce((sum, row) => sum + parseFloat(row[4]), 0);
        const totalCost = rows.reduce((sum, row) => sum + parseFloat(row[7]), 0);
        csv += `\n\n"Total","","","",${totalHours},"","",${totalCost}`;

        return new Response(csv, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${project.name.replace(/[^a-zA-Z0-9]/g, "_")}_tareas.csv"`,
            },
        });
    } catch (error) {
        return handleApiError(error, "Export CSV");
    }
}
