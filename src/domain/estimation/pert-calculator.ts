/**
 * PERT Calculator - Cálculos de estimación PERT
 * 
 * Lógica de dominio pura para cálculos PERT.
 * No depende de infraestructura (DB, APIs, etc.)
 */

import type {
    PertEstimate,
    PertResult,
    RiskFactors,
    RiskLevel,
    ContingencyResult,
} from "@/domain/types";

import {
    RISK_CONTINGENCY,
    COMPLEXITY_MULTIPLIERS,
    type ComplexityLevel,
} from "@/domain/constants";

// ============================================
// CÁLCULOS PERT BÁSICOS
// ============================================

/**
 * Calcula el valor esperado usando la fórmula PERT
 * E = (O + 4M + P) / 6
 */
export function calculatePertExpected(estimate: PertEstimate): number {
    const { optimistic, mostLikely, pessimistic } = estimate;
    return (optimistic + 4 * mostLikely + pessimistic) / 6;
}

/**
 * Calcula la desviación estándar PERT
 * σ = (P - O) / 6
 */
export function calculatePertDeviation(estimate: PertEstimate): number {
    return (estimate.pessimistic - estimate.optimistic) / 6;
}

/**
 * Calcula todos los valores PERT a partir de una estimación de 3 puntos
 */
export function calculatePertResult(estimate: PertEstimate): PertResult {
    return {
        ...estimate,
        expected: calculatePertExpected(estimate),
        deviation: calculatePertDeviation(estimate),
    };
}

/**
 * Redondea una estimación PERT a un decimal
 */
export function roundPertEstimate(estimate: PertEstimate): PertEstimate {
    return {
        optimistic: Math.round(estimate.optimistic * 10) / 10,
        mostLikely: Math.round(estimate.mostLikely * 10) / 10,
        pessimistic: Math.round(estimate.pessimistic * 10) / 10,
    };
}

// ============================================
// APLICACIÓN DE FACTORES
// ============================================

/**
 * Aplica multiplicador de complejidad a una estimación PERT
 */
export function applyComplexityMultiplier(
    estimate: PertEstimate,
    complexity: ComplexityLevel
): PertEstimate {
    const multiplier = COMPLEXITY_MULTIPLIERS[complexity];
    return roundPertEstimate({
        optimistic: estimate.optimistic * multiplier,
        mostLikely: estimate.mostLikely * multiplier,
        pessimistic: estimate.pessimistic * multiplier,
    });
}

/**
 * Escala una estimación PERT por un factor dado
 */
export function scalePertEstimate(
    estimate: PertEstimate,
    factor: number
): PertEstimate {
    return roundPertEstimate({
        optimistic: Math.max(1, estimate.optimistic * factor),
        mostLikely: Math.max(1, estimate.mostLikely * factor),
        pessimistic: Math.max(1, estimate.pessimistic * factor),
    });
}

// ============================================
// CONTINGENCIA Y RIESGO
// ============================================

/**
 * Determina el nivel de riesgo basado en factores del proyecto
 */
export function determineRiskLevel(factors: RiskFactors): RiskLevel {
    let riskScore = 0;

    // Más integraciones = más riesgo
    if (factors.integrationsCount >= 5) riskScore += 2;
    else if (factors.integrationsCount >= 2) riskScore += 1;

    // Pagos = alto riesgo
    if (factors.hasPayments) riskScore += 2;

    // APIs externas = riesgo moderado
    if (factors.hasExternalApis) riskScore += 1;

    // Requisitos vagos = alto riesgo
    if (factors.requirementsClarity === "vague") riskScore += 2;
    else if (factors.requirementsClarity === "moderate") riskScore += 1;

    if (riskScore >= 5) return "veryHigh";
    if (riskScore >= 3) return "high";
    if (riskScore >= 1) return "medium";
    return "low";
}

/**
 * Calcula la contingencia en horas basada en el nivel de riesgo
 */
export function calculateContingency(
    baseHours: number,
    riskLevel: RiskLevel
): ContingencyResult {
    const percent = RISK_CONTINGENCY[riskLevel];
    return {
        level: riskLevel,
        percent,
        hours: Math.round(baseHours * percent),
    };
}

/**
 * Calcula la contingencia basada en factores de riesgo
 */
export function calculateContingencyFromFactors(
    baseHours: number,
    factors: RiskFactors
): ContingencyResult {
    const riskLevel = determineRiskLevel(factors);
    return calculateContingency(baseHours, riskLevel);
}

// ============================================
// VALIDACIONES
// ============================================

/**
 * Valida que una estimación PERT sea consistente
 * - O <= M <= P
 * - P no debe ser más de 3x O (sobreestimación)
 * - Valores mínimos razonables
 */
export function validatePertEstimate(estimate: PertEstimate): {
    valid: boolean;
    issues: string[];
} {
    const issues: string[] = [];
    const { optimistic, mostLikely, pessimistic } = estimate;

    if (optimistic < 0.5) {
        issues.push("El valor optimista es demasiado bajo (mínimo 0.5h)");
    }

    if (optimistic > mostLikely) {
        issues.push("El valor optimista no puede ser mayor que el más probable");
    }

    if (mostLikely > pessimistic) {
        issues.push("El valor más probable no puede ser mayor que el pesimista");
    }

    if (pessimistic > optimistic * 3) {
        issues.push("El valor pesimista es muy alto (máximo 3x del optimista)");
    }

    return {
        valid: issues.length === 0,
        issues,
    };
}

/**
 * Suma múltiples estimaciones PERT
 */
export function sumPertEstimates(estimates: PertEstimate[]): PertResult {
    const sum: PertEstimate = {
        optimistic: 0,
        mostLikely: 0,
        pessimistic: 0,
    };

    for (const est of estimates) {
        sum.optimistic += est.optimistic;
        sum.mostLikely += est.mostLikely;
        sum.pessimistic += est.pessimistic;
    }

    return calculatePertResult(roundPertEstimate(sum));
}
