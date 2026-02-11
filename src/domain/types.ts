/**
 * Domain Types - Tipos centralizados de PlanDev
 * 
 * Archivo único de tipos del dominio.
 * Todas las interfaces y types se definen aquí.
 */

// ============================================
// TIPOS BASE DE GENERACIÓN
// ============================================

export type Phase = "analysis" | "design" | "development" | "testing" | "deployment";
export type Role = "developer" | "qa" | "pm";
export type Complexity = "simple" | "medium" | "complex";
export type Deadline = "flexible" | "normal" | "urgent";
export type ClientType = "personal" | "startup" | "medium" | "enterprise";
export type RiskLevel = "low" | "medium" | "high" | "veryHigh";
export type RequirementsClarity = "clear" | "moderate" | "vague";
export type ScreenCount = "few" | "medium" | "many";

// ============================================
// TIPOS DE GENERACIÓN (IA)
// ============================================

export interface GeneratedTask {
    name: string;
    description: string;
    phase: Phase;
    role: Role;
    hoursOptimistic: number;
    hoursMostLikely: number;
    hoursPessimistic: number;
    hoursExpected: number;
}

export interface GeneratedModule {
    name: string;
    description: string;
    tasks: GeneratedTask[];
    contingencyPercent?: number;
}

export interface GeneratedPlan {
    modules: GeneratedModule[];
    proposalContent: string;
    baseHours: number;
    contingencyPercent: number;
    contingencyHours: number;
    totalHours: number;
    summary: {
        byPhase: Record<string, number>;
        byModule: Record<string, number>;
    };
}

// ============================================
// ESTIMACIÓN PERT
// ============================================

export interface PertEstimate {
    optimistic: number;
    mostLikely: number;
    pessimistic: number;
}

export interface PertResult extends PertEstimate {
    expected: number;
    deviation: number;
}

export interface EstimatedTask {
    name: string;
    description: string;
    phase: Phase;
    role: Role;
    estimate: PertResult;
}

export interface EstimatedModule {
    name: string;
    description: string;
    tasks: EstimatedTask[];
    totalHours: number;
    contingencyPercent: number;
}

// ============================================
// ESTIMACIÓN Y RANGOS
// ============================================

export interface HoursRange {
    min: number;
    max: number;
    typical: number;
}

export interface EstimationFactors {
    complexity: Complexity;
    deadline: Deadline;
    clientType: ClientType;
    projectType: string;
    integrationsCount: number;
    featuresCount: number;
}

export interface PhaseTimelineItem {
    phase: Phase;
    weeks: number;
    startWeek: number;
    endWeek: number;
}

export type PhaseDistribution = Record<Phase, number>;

// ============================================
// CONFIGURACIÓN DE PROYECTO
// ============================================

export interface RoleRates {
    developer: number;
    qa: number;
    pm: number;
}

export interface TeamConfig {
    developers: number;
    qaMembers: number;
    hoursPerWeek: number;
    hoursPerDay: number;
    workDays: string[];
}

export interface RiskFactors {
    integrationsCount: number;
    hasPayments: boolean;
    hasExternalApis: boolean;
    requirementsClarity: RequirementsClarity;
}

// ============================================
// RESULTADOS
// ============================================

export interface ValidationResult {
    valid: boolean;
    message?: string;
    issues?: string[];
}

export interface ContingencyResult {
    level: RiskLevel;
    percent: number;
    hours: number;
}

export interface ProjectEstimationSummary {
    baseHours: number;
    contingencyPercent: number;
    contingencyHours: number;
    totalHours: number;
    totalCost: number;
    durationWeeks: number;
    phaseDistribution: PhaseDistribution;
    phaseTimeline: PhaseTimelineItem[];
}

