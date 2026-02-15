import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPerplexityAdapter } from "@/infrastructure/ai";
import { handleApiError } from "@/lib/error-handler";
import { logger } from "@/lib/logger";
import {
    WEEK_LIMITS,
    DEFAULT_RATES,
    TEAM_DEFAULTS,
    type ComplexityLevel,
} from "@/domain/constants";

// POST /api/projects/[id]/generate - Generar plan con IA (PERT)
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Obtener proyecto con toda su información
        const project = await db.project.findUnique({
            where: { id },
            include: {
                config: true,
                requirements: true,
                technical: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Proyecto no encontrado" },
                { status: 404 }
            );
        }

        if (!project.requirements) {
            return NextResponse.json(
                { error: "El proyecto no tiene requisitos definidos" },
                { status: 400 }
            );
        }

        // Parsear arrays desde JSON strings (SQLite)
        const userRoles = JSON.parse(project.requirements.userRoles || "[]");
        const features = JSON.parse(project.requirements.features || "[]");
        const integrations = JSON.parse(project.requirements.integrations || "[]");

        // DETECCION AUTOMATICA DE TIPO DE PROYECTO
        // Importar función de detección
        const { detectProjectType } = await import("@/lib/template-loader");

        const detected = detectProjectType({
            projectName: project.name,
            description: project.requirements.description,
            objective: project.requirements.objective || undefined,
            features,
            integrations,
        });

        logger.info(`Auto-detected project type: ${detected.type} (complexity: ${detected.complexity}, confidence: ${detected.confidence})`);

        // Generar plan con IA (PERT) usando tipo detectado
        const aiAdapter = createPerplexityAdapter();
        const plan = await aiAdapter.generatePlan({
            projectName: project.name,
            projectType: detected.type, // Usar tipo detectado en lugar de project.type
            description: project.requirements.description,
            objective: project.requirements.objective || undefined,
            userRoles,
            features,
            integrations,
            architecture: project.technical?.architecture || undefined,
            frontend: project.technical?.frontend || undefined,
            backend: project.technical?.backend || undefined,
            database: project.technical?.database || undefined,
            infrastructure: project.technical?.infrastructure || undefined,
            constraints: project.technical?.constraints || undefined,
            currency: project.currency,
            developerRate: project.config?.developerRate || DEFAULT_RATES.developer,
            qaRate: project.config?.qaRate || DEFAULT_RATES.qa,
            pmRate: project.config?.pmRate || DEFAULT_RATES.pm,
            complexity: detected.complexity, // Usar complejidad detectada
            clientType: project.config?.clientType || "startup",
            deadline: project.config?.deadline || "normal",
            budgetRange: project.config?.budgetRange || undefined,
            developers: project.config?.developers || TEAM_DEFAULTS.developers,
            qaMembers: project.config?.qaMembers || TEAM_DEFAULTS.qaMembers,
            hoursPerWeek: project.config?.hoursPerWeek || TEAM_DEFAULTS.hoursPerWeek,
            teamSize: project.config?.teamSize || TEAM_DEFAULTS.teamSize,
            // Nuevos campos para estimación precisa
            hasPayments: project.requirements.hasPayments ?? false,
            screenCount: project.requirements.screenCount || "medium",
            requirementsClarity: project.requirements.requirementsClarity || "moderate",
        });

        // Recolectar todas las tareas para validación
        const allTasks = plan.modules.flatMap((m) => m.tasks);

        // Limitar por complejidad (en semanas × capacidad)
        const complexity = (project.config?.complexity || "medium") as ComplexityLevel;
        const weeklyCapacity =
            (project.config?.hoursPerWeek || TEAM_DEFAULTS.hoursPerWeek) *
            (project.config?.teamSize || TEAM_DEFAULTS.teamSize);
        const maxWeeks = WEEK_LIMITS[complexity] || WEEK_LIMITS.medium;
        const maxHours = maxWeeks * weeklyCapacity;

        // Si excede límite, escalar proporcionalmente
        if (plan.totalHours > maxHours) {
            logger.warn(`IA excedio limite: ${plan.totalHours} h > ${maxHours} h. Escalando...`, { context: 'GeneratePlan' });
            const scaleFactor = maxHours / plan.totalHours;

            for (const mod of plan.modules) {
                for (const task of mod.tasks) {
                    task.hoursOptimistic = Math.max(1, Math.round(task.hoursOptimistic * scaleFactor * 10) / 10);
                    task.hoursMostLikely = Math.max(1, Math.round(task.hoursMostLikely * scaleFactor * 10) / 10);
                    task.hoursPessimistic = Math.max(1, Math.round(task.hoursPessimistic * scaleFactor * 10) / 10);
                    task.hoursExpected = (task.hoursOptimistic + 4 * task.hoursMostLikely + task.hoursPessimistic) / 6;
                }
            }

            // Recalcular totales
            plan.baseHours = allTasks.reduce((sum, t) => sum + t.hoursExpected, 0);
            plan.contingencyHours = 0;
            plan.totalHours = plan.baseHours;
        }

        // ===== OVERRIDE: Sin contingencia =====
        plan.contingencyPercent = 0;
        plan.contingencyHours = 0;
        plan.totalHours = plan.baseHours;
        // ======================================

        // Validar rango de horas removed - no longer needed

        // Calcular distribución por fases
        const phaseHours: Record<string, number> = {};
        allTasks.forEach((task) => {
            phaseHours[task.phase] = (phaseHours[task.phase] || 0) + Math.round(task.hoursExpected);
        });

        // Obtener nota opcional del body de la request
        let historyNote: string | undefined;
        try {
            const body = await request.json();
            historyNote = body?.note;
        } catch {
            // No body o no es JSON, continuar sin nota
        }

        // ========== GUARDAR HISTORIAL ANTES DE ELIMINAR ==========
        // Obtener módulos y propuesta actuales para guardar en historial
        const existingModules = await db.module.findMany({
            where: { projectId: id },
            include: { tasks: { orderBy: { order: "asc" } } },
            orderBy: { order: "asc" },
        });

        const existingProposal = await db.proposal.findUnique({
            where: { projectId: id },
        });

        // Solo guardar historial si hay un plan existente
        if (existingModules.length > 0 && existingProposal) {
            // Obtener la última versión del historial
            const lastHistory = await db.planHistory.findFirst({
                where: { projectId: id },
                orderBy: { version: "desc" },
            });
            const newVersion = (lastHistory?.version || 0) + 1;

            // Guardar snapshot del plan actual
            await db.planHistory.create({
                data: {
                    projectId: id,
                    modulesData: JSON.stringify(existingModules),
                    proposalData: JSON.stringify(existingProposal),
                    totalHours: existingProposal.totalHours,
                    totalCost: existingProposal.totalCost,
                    version: newVersion,
                    note: historyNote,
                },
            });

            logger.info(`Plan v${newVersion} guardado en historial`, { context: 'GeneratePlan' });
        }
        // ========================================================

        // Eliminar módulos anteriores
        await db.module.deleteMany({ where: { projectId: id } });
        await db.proposal.deleteMany({ where: { projectId: id } });

        // Guardar módulos y tareas con precisión Float
        for (let i = 0; i < plan.modules.length; i++) {
            const moduleData = plan.modules[i];
            await db.module.create({
                data: {
                    projectId: id,
                    name: moduleData.name,
                    description: moduleData.description,
                    order: i,
                    contingencyPercent: 0,
                    contingencyHours: 0,
                    tasks: {
                        create: moduleData.tasks.map((task, j) => ({
                            name: task.name,
                            description: task.description,
                            phase: task.phase,
                            role: task.role,
                            order: j,
                            // Campos PERT
                            hoursOptimistic: task.hoursOptimistic,
                            hoursMostLikely: task.hoursMostLikely,
                            hoursPessimistic: task.hoursPessimistic,
                            hoursExpected: task.hoursExpected,
                            hoursDeviation: (task.hoursPessimistic - task.hoursOptimistic) / 6,
                            estimatedHours: task.hoursExpected, // Sin redondeo agresivo
                        })),
                    },
                },
            });
        }

        // Obtener el plan de nuevo con las tareas creadas para cálculos precisos
        const freshTasks = await db.task.findMany({
            where: { module: { projectId: id } }
        });

        // Calcular costo total
        const config = project.config;
        let totalCost = 0;
        const currentPhaseHours: Record<string, number> = {};

        for (const task of freshTasks) {
            const hours = task.hoursExpected;
            currentPhaseHours[task.phase] = (currentPhaseHours[task.phase] || 0) + hours;
            const rate =
                task.role === "developer"
                    ? config?.developerRate || DEFAULT_RATES.developer
                    : task.role === "qa"
                        ? config?.qaRate || DEFAULT_RATES.qa
                        : config?.pmRate || DEFAULT_RATES.pm;
            totalCost += hours * rate;
        }

        // Sin costo de contingencia

        // Calcular duración: totalHours ÷ weeklyCapacity (ya definido arriba)
        const totalWeeks = Math.ceil(Math.round(plan.totalHours) / weeklyCapacity);
        const duration = `${totalWeeks} semanas`;

        // Guardar propuesta con contingencia
        await db.proposal.create({
            data: {
                projectId: id,
                content: plan.proposalContent,
                baseHours: Math.round(plan.baseHours),
                contingencyPercent: 0,
                contingencyHours: 0,
                totalHours: Math.round(plan.totalHours),
                totalCost: Math.round(totalCost),
                duration,
            },
        });

        // Obtener proyecto actualizado
        const updatedProject = await db.project.findUnique({
            where: { id },
            include: {
                config: true,
                requirements: true,
                technical: true,
                modules: {
                    orderBy: { order: "asc" },
                    include: {
                        tasks: { orderBy: { order: "asc" } },
                    },
                },
                proposal: true,
            },
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        return handleApiError(error, "Generate Plan");
    }
}
