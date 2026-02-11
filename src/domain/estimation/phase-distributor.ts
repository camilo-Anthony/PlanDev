/**
 * Phase Distributor - Distribución de horas por fase
 * 
 * Lógica de dominio para distribuir y calcular timeline de fases.
 */

import type {
    Phase,
    PhaseDistribution,
    PhaseTimelineItem,
    ValidationResult,
} from "@/domain/types";

import {
    PHASE_DISTRIBUTION,
    PHASE_ORDER,
} from "@/domain/constants";

// ============================================
// DISTRIBUCIÓN DE HORAS
// ============================================

/**
 * Distribuye las horas totales entre las fases según distribución estándar
 */
export function distributeHoursByPhase(totalHours: number): PhaseDistribution {
    const distribution: PhaseDistribution = {
        analysis: 0,
        design: 0,
        development: 0,
        testing: 0,
        deployment: 0,
    };

    for (const phase of PHASE_ORDER) {
        distribution[phase] = Math.round(totalHours * PHASE_DISTRIBUTION[phase]);
    }

    // Ajustar diferencia de redondeo en development
    const sum = Object.values(distribution).reduce((a, b) => a + b, 0);
    const diff = totalHours - sum;
    distribution.development += diff;

    return distribution;
}

/**
 * Calcula el porcentaje de cada fase a partir de horas reales
 */
export function calculatePhasePercentages(
    phaseHours: Partial<PhaseDistribution>
): Partial<Record<Phase, number>> {
    const total = Object.values(phaseHours).reduce((sum, h) => sum + (h || 0), 0);

    if (total === 0) return {};

    const percentages: Partial<Record<Phase, number>> = {};
    for (const [phase, hours] of Object.entries(phaseHours)) {
        percentages[phase as Phase] = (hours || 0) / total;
    }

    return percentages;
}

// ============================================
// TIMELINE
// ============================================

/**
 * Genera el timeline de fases secuencial (sin overlap)
 * 
 * @param phaseHours - Horas por fase
 * @param hoursPerWeek - Capacidad semanal del equipo
 * @param teamSize - Tamaño del equipo
 */
export function calculatePhaseTimeline(
    phaseHours: Partial<PhaseDistribution>,
    hoursPerWeek: number,
    teamSize: number
): PhaseTimelineItem[] {
    const weeklyCapacity = hoursPerWeek * teamSize;
    const timeline: PhaseTimelineItem[] = [];
    let currentWeek = 0;

    for (const phase of PHASE_ORDER) {
        const hours = phaseHours[phase] || 0;
        if (hours <= 0) continue;

        const weeks = Math.ceil(hours / weeklyCapacity);
        const startWeek = currentWeek;
        const endWeek = startWeek + weeks;

        timeline.push({
            phase,
            weeks,
            startWeek,
            endWeek,
        });

        currentWeek = endWeek;
    }

    return timeline;
}

/**
 * Calcula la duración total del proyecto en semanas
 */
export function calculateTotalDuration(timeline: PhaseTimelineItem[]): number {
    if (timeline.length === 0) return 0;
    return Math.max(...timeline.map((p) => p.endWeek));
}

/**
 * Calcula la duración del proyecto completa
 */
export function calculateProjectDuration(
    phaseHours: Partial<PhaseDistribution>,
    hoursPerWeek: number,
    teamSize: number
): {
    totalWeeks: number;
    phaseTimeline: PhaseTimelineItem[];
} {
    const phaseTimeline = calculatePhaseTimeline(phaseHours, hoursPerWeek, teamSize);
    const totalWeeks = calculateTotalDuration(phaseTimeline);

    return { totalWeeks, phaseTimeline };
}

// ============================================
// VALIDACIONES
// ============================================

/**
 * Valida la distribución de horas por fase
 * Verifica que esté dentro de rangos razonables
 */
export function validatePhaseDistribution(
    phaseHours: Partial<PhaseDistribution>,
    totalHours: number,
    tolerancePercent: number = 0.05
): ValidationResult {
    const issues: string[] = [];

    if (totalHours <= 0) {
        return { valid: false, message: "Las horas totales deben ser mayores a 0" };
    }

    for (const [phase, expectedPercent] of Object.entries(PHASE_DISTRIBUTION)) {
        const actualHours = phaseHours[phase as Phase] || 0;
        const actualPercent = actualHours / totalHours;
        const expectedHours = totalHours * expectedPercent;
        const deviation = Math.abs(actualPercent - expectedPercent);

        if (deviation > tolerancePercent && actualHours > 0) {
            issues.push(
                `Fase "${phase}": ${(actualPercent * 100).toFixed(1)}% (${actualHours}h) vs esperado ${(expectedPercent * 100).toFixed(0)}% (${expectedHours.toFixed(0)}h)`
            );
        }
    }

    return {
        valid: issues.length === 0,
        issues: issues.length > 0 ? issues : undefined,
    };
}

/**
 * Valida la consistencia entre horas de tareas y total reportado
 */
export function validateTasksConsistency(
    reportedTotal: number,
    taskHours: number[],
    tolerance: number = 0.01
): ValidationResult {
    const calculatedTotal = taskHours.reduce((sum, h) => sum + h, 0);
    const difference = Math.abs(reportedTotal - calculatedTotal);

    if (difference > tolerance) {
        return {
            valid: false,
            message: `Inconsistencia: Total reportado (${reportedTotal}h) vs suma de tareas (${calculatedTotal}h). Diferencia: ${difference.toFixed(2)}h`,
        };
    }

    return { valid: true };
}
