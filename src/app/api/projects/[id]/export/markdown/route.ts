import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";

// GET /api/projects/[id]/export/markdown - Exportar a Markdown
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
                requirements: true,
                technical: true,
                modules: {
                    orderBy: { order: "asc" },
                    include: { tasks: { orderBy: { order: "asc" } } },
                },
                proposal: true,
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

        // Generar Markdown
        let md = `# ${project.name}\n\n`;
        md += `**Tipo:** ${project.type}\n`;
        md += `**Moneda:** ${project.currency}\n`;
        md += `**Fecha:** ${new Date(project.createdAt).toLocaleDateString("es-PE")}\n\n`;

        if (project.proposal) {
            md += `## Resumen\n\n`;
            md += `- **Horas totales:** ${project.proposal.totalHours}h\n`;
            md += `- **Costo total:** ${project.currency} ${project.proposal.totalCost.toLocaleString()}\n`;
            md += `- **Duración:** ${project.proposal.duration}\n\n`;
        }

        if (project.requirements) {
            md += `## Requisitos\n\n`;
            md += `${project.requirements.description}\n\n`;
            if (project.requirements.objective) {
                md += `**Objetivo:** ${project.requirements.objective}\n\n`;
            }
        }

        if (project.modules.length > 0) {
            md += `## Módulos y Tareas\n\n`;

            // Orden cronológico de fases
            const PHASE_ORDER = ["analysis", "design", "development", "testing", "deployment"];

            project.modules.forEach((module) => {
                // Calcular horas del módulo redondeando ANTES de sumar (consistente con dashboard)
                const moduleHours = module.tasks.reduce((sum, t) => sum + Math.round(t.estimatedHours), 0);
                md += `### ${module.name} (${moduleHours}h)\n\n`;
                if (module.description) {
                    md += `${module.description}\n\n`;
                }

                md += `| Tarea | Fase | Horas | Rol |\n`;
                md += `|-------|------|-------|-----|\n`;

                // Ordenar tareas por fase cronológicamente
                const sortedTasks = [...module.tasks].sort((a, b) => {
                    return PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase);
                });

                sortedTasks.forEach((task) => {
                    md += `| ${task.name} | ${phaseLabels[task.phase] || task.phase} | ${Math.round(task.estimatedHours)}h | ${task.role} |\n`;
                });
                md += `\n`;
            });
        }

        if (project.proposal) {
            md += `## Propuesta Comercial\n\n`;
            md += project.proposal.content;
        }

        return new Response(md, {
            headers: {
                "Content-Type": "text/markdown; charset=utf-8",
                "Content-Disposition": `attachment; filename="${project.name.replace(/[^a-zA-Z0-9]/g, "_")}.md"`,
            },
        });
    } catch (error) {
        return handleApiError(error, "Export Markdown");
    }
}
