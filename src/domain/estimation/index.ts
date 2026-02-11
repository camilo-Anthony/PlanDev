/**
 * Domain Estimation - Barrel export
 * 
 * Exporta todos los módulos del dominio de estimación
 */

// Re-export types from domain root
export type {
    Phase,
    Role,
    Complexity,
    Deadline,
    ClientType,
    RiskLevel,
    RequirementsClarity,
    PertEstimate,
    PertResult,
    EstimatedTask,
    EstimatedModule,
    HoursRange,
    EstimationFactors,
    PhaseTimelineItem,
    PhaseDistribution,
    RoleRates,
    TeamConfig,
    RiskFactors,
    ValidationResult,
    ContingencyResult,
    ProjectEstimationSummary,
} from "@/domain/types";

// PERT Calculator
export {
    calculatePertExpected,
    calculatePertDeviation,
    calculatePertResult,
    roundPertEstimate,
    applyComplexityMultiplier,
    scalePertEstimate,
    determineRiskLevel,
    calculateContingency,
    calculateContingencyFromFactors,
    validatePertEstimate,
    sumPertEstimates,
} from "./pert-calculator";

// Phase Distributor
export {
    distributeHoursByPhase,
    calculatePhasePercentages,
    calculatePhaseTimeline,
    calculateTotalDuration,
    calculateProjectDuration,
    validatePhaseDistribution,
    validateTasksConsistency,
} from "./phase-distributor";
