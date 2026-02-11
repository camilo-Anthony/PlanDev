import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";

// GET /api/projects/[id]/export/pdf - Exportar a HTML para PDF
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


        // Generar HTML para impresión/PDF
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} - Propuesta</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
            line-height: 1.7;
            color: #1f2937;
            max-width: 850px;
            margin: 0 auto;
            padding: 48px;
            background: #ffffff;
        }
        
        /* Header */
        .header {
            border-bottom: 3px solid #111827;
            padding-bottom: 24px;
            margin-bottom: 32px;
        }
        .header h1 {
            font-size: 2.25rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
            letter-spacing: -0.025em;
        }
        .meta {
            display: flex;
            gap: 24px;
            color: #6b7280;
            font-size: 0.9rem;
        }
        .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .meta-label {
            font-weight: 600;
            color: #374151;
        }
        
        /* Stats Grid */
        .stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin: 32px 0;
        }
        .stat {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 4px;
        }
        .stat-label {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            font-weight: 500;
        }
        
        /* Section Headers */
        h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
            margin: 40px 0 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #e5e7eb;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        h2::before {
            content: '';
            display: inline-block;
            width: 4px;
            height: 20px;
            background: #111827;
            border-radius: 2px;
        }
        
        /* Modules */
        .module {
            background: #fafafa;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin: 16px 0;
            overflow: hidden;
        }
        .module-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            background: #f3f4f6;
            border-bottom: 1px solid #e5e7eb;
        }
        .module-title {
            font-weight: 600;
            color: #111827;
            font-size: 1rem;
        }
        .module-hours {
            color: #4b5563;
            font-weight: 600;
            font-size: 0.9rem;
            background: #e5e7eb;
            padding: 4px 12px;
            border-radius: 20px;
        }
        .module-desc {
            padding: 12px 20px;
            color: #6b7280;
            font-size: 0.9rem;
            border-bottom: 1px solid #e5e7eb;
        }
        
        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            text-align: left;
            padding: 12px 20px;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            font-weight: 600;
            background: #f9fafb;
        }
        td {
            padding: 12px 20px;
            border-top: 1px solid #f3f4f6;
            font-size: 0.9rem;
        }
        tr:hover td {
            background: #fafafa;
        }
        .task-name {
            font-weight: 500;
            color: #111827;
        }
        .user-story {
            display: block;
            margin-top: 4px;
            font-size: 0.8rem;
            color: #6b7280;
            font-style: italic;
        }
        .phase {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
            background: #e5e7eb;
            color: #374151;
        }
        .hours {
            text-align: right;
            font-weight: 600;
            color: #374151;
            font-variant-numeric: tabular-nums;
        }
        
        /* Proposal Section */
        .proposal {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }
        .proposal-header {
            background: #f3f4f6;
            padding: 16px 24px;
            border-bottom: 1px solid #e5e7eb;
        }
        .proposal-header h3 {
            font-size: 1rem;
            font-weight: 600;
            color: #111827;
            margin: 0;
        }
        .proposal-content {
            padding: 24px;
        }
        .proposal-section {
            margin-bottom: 24px;
        }
        .proposal-section:last-child {
            margin-bottom: 0;
        }
        .proposal-section-title {
            font-size: 0.85rem;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #f3f4f6;
        }
        .proposal-text {
            font-size: 0.9rem;
            line-height: 1.8;
            color: #4b5563;
        }
        .proposal-highlight {
            background: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 16px 20px;
            margin: 16px 0;
            border-radius: 0 8px 8px 0;
        }
        .proposal-highlight-title {
            font-weight: 600;
            color: #166534;
            margin-bottom: 4px;
        }
        .proposal-highlight-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #15803d;
        }
        .proposal-terms {
            background: #f9fafb;
            padding: 16px 20px;
            border-radius: 8px;
            margin-top: 16px;
        }
        .proposal-terms-title {
            font-size: 0.8rem;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
        }
        .proposal-terms-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .proposal-terms-list li {
            font-size: 0.85rem;
            color: #4b5563;
            padding: 4px 0;
            padding-left: 16px;
            position: relative;
        }
        .proposal-terms-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #9ca3af;
        }
        
        /* Footer */
        .footer {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 0.8rem;
        }
        .footer-brand {
            font-weight: 600;
            color: #6b7280;
        }
        
        /* Print Styles */
        @media print {
            body {
                padding: 24px;
                max-width: 100%;
            }
            .module {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            .stats {
                grid-template-columns: repeat(4, 1fr);
            }
        }
        
        @media (max-width: 600px) {
            .stats {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <!-- HEADER -->
    <div style="display: flex; justify-content: space-between; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb;">
        <div>
            <div style="color: #6b7280; font-size: 0.85rem; margin-bottom: 4px;">Cliente:</div>
            <div style="font-weight: 600; font-size: 1.1rem; color: #111827;">${project.name}</div>
        </div>
        <div style="text-align: right;">
            <div style="color: #6b7280; font-size: 0.85rem; margin-bottom: 4px;">Freelancer:</div>
            <div style="font-weight: 600; font-size: 1.1rem; color: #111827;">${project.config?.freelancerName || "Tu Nombre"}</div>
        </div>
    </div>

    <!-- TÍTULO DE PROPUESTA -->
    <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 1.75rem; font-weight: 700; color: #111827; margin-bottom: 8px;">
            Propuesta: ${project.name}
        </h1>
        <div style="color: #6b7280; font-size: 0.9rem;">
            ${new Date(project.createdAt).toLocaleDateString("es-PE", { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
    </div>

    <!-- PROPUESTA GENERADA POR IA (contenido principal) -->
    ${project.proposal?.content ? `
    <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 32px; color: #374151; line-height: 1.8;">
        ${(() => {
                    // Función para convertir tablas markdown a HTML
                    function convertMarkdownTables(text: string): string {
                        const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g;
                        return text.replace(tableRegex, (_match, headerRow, bodyRows) => {
                            const headers = headerRow.split('|').map((h: string) => h.trim()).filter((h: string) => h);
                            const rows = bodyRows.trim().split('\n').map((row: string) =>
                                row.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell)
                            );

                            return `<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <thead>
                  <tr style="background: #e5e7eb;">
                    ${headers.map((h: string) => `<th style="padding: 10px 12px; text-align: left; border: 1px solid #d1d5db; font-weight: 600;">${h}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${rows.map((row: string[]) => `<tr>${row.map((cell: string) => `<td style="padding: 10px 12px; border: 1px solid #d1d5db;">${cell}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>`;
                        });
                    }

                    return convertMarkdownTables(project.proposal.content)
                        .replace(/^### (.+)$/gm, '<h4 style="font-size: 1rem; font-weight: 600; color: #111827; margin: 24px 0 12px 0;">$1</h4>')
                        .replace(/^## (.+)$/gm, '<h3 style="font-size: 1.1rem; font-weight: 600; color: #111827; margin: 28px 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">$1</h3>')
                        .replace(/^# (.+)$/gm, '<h2 style="font-size: 1.25rem; font-weight: 700; color: #111827; margin: 32px 0 16px 0;">$1</h2>')
                        .replace(/^\* (.+)$/gm, '<li style="padding: 4px 0; margin-left: 20px;">$1</li>')
                        .replace(/^- (.+)$/gm, '<li style="padding: 4px 0; margin-left: 20px;">$1</li>')
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n\n/g, '</p><p style="margin: 12px 0;">')
                        .replace(/\n/g, '<br>');
                })()}
    </div>
    ` : ''}

    <!-- INVERSIÓN -->
    ${project.proposal ? `
    <h2>Inversión</h2>
    
    <div style="margin-bottom: 24px;">
        <h3 style="font-size: 0.9rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
            Desglose de Costos
        </h3>
        <ul style="list-style: disc; padding-left: 24px; color: #4b5563;">
            <li style="padding: 4px 0;">Servicios Principales: Desarrollo completo del sistema (${project.proposal.totalHours} horas)</li>
            <li style="padding: 4px 0;">Duración del proyecto: ${project.proposal.duration || 'A coordinar'}</li>
        </ul>
    </div>
    
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
        <div style="font-size: 0.85rem; color: #166534; font-weight: 600; margin-bottom: 4px;">Total</div>
        <div style="font-size: 1.75rem; font-weight: 700; color: #15803d;">${project.currency} ${project.proposal.totalCost.toLocaleString()}</div>
    </div>
    
    <div style="margin-bottom: 32px;">
        <h3 style="font-size: 0.9rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
            Servicios Adicionales (Opcionales)
        </h3>
        <ul style="list-style: disc; padding-left: 24px; color: #4b5563;">
            <li style="padding: 4px 0;">Servicio de mantenimiento y soporte técnico</li>
            <li style="padding: 4px 0;">Capacitación de usuarios</li>
            <li style="padding: 4px 0;">Actualizaciones y mejoras futuras</li>
        </ul>
    </div>
    ` : ''}

    <!-- CONDICIONES -->
    <h2>Condiciones</h2>
    <ul style="list-style: disc; padding-left: 24px; color: #4b5563; margin-bottom: 32px;">
        <li style="padding: 4px 0;">El proyecto se llevará a cabo según el cronograma acordado</li>
        <li style="padding: 4px 0;">El cliente será responsable de proporcionar la información y recursos necesarios</li>
        <li style="padding: 4px 0;">Se incluye garantía de correcciones por 30 días post-entrega</li>
        <li style="padding: 4px 0;">Los cambios fuera del alcance original se cotizarán por separado</li>
    </ul>

    <!-- NOTAS FISCALES -->
    <h2>Notas Fiscales</h2>
    <ul style="list-style: disc; padding-left: 24px; color: #4b5563; margin-bottom: 32px;">
        <li style="padding: 4px 0;">El proyecto se realizará en ${project.currency}</li>
    </ul>

    <!-- PRÓXIMOS PASOS -->
    <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 32px; border-radius: 12px; text-align: center; margin-top: 40px;">
        <h2 style="color: white; border: none; margin: 0 0 16px 0; font-size: 1.25rem;">Próximos Pasos</h2>
        <p style="font-size: 0.95rem; opacity: 0.9; line-height: 1.7; margin-bottom: 16px;">
            Para comenzar, por favor confirma tu aprobación de este presupuesto para agendar la reunión de inicio y procesar el primer pago/seña.
        </p>
        <p style="font-size: 0.85rem; opacity: 0.7;">
            Esta propuesta tiene una validez de 15 días
        </p>
    </div>

    <!-- FOOTER -->
    <div class="footer">
        <span class="footer-brand">PlanDev</span> • Generado el ${new Date().toLocaleDateString("es-PE", { year: 'numeric', month: 'long', day: 'numeric' })}
    </div>

    <script>
        if (window.location.search.includes("print=true")) {
            window.print();
        }
    </script>
</body>
</html>`;

        return new Response(html, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
            },
        });
    } catch (error) {
        return handleApiError(error, "Export PDF");
    }
}