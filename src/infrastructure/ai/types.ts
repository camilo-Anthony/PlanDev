/**
 * AI Provider Interface - Contrato para proveedores de IA
 * 
 * Define la interfaz que deben implementar todos los adaptadores de IA.
 * Facilita cambiar entre Perplexity, OpenAI, Claude, etc.
 */

import type { GeneratedPlan } from "@/domain/types";

/**
 * Datos de entrada para generar un plan de proyecto
 */
export interface PlanGenerationInput {
    projectName: string;
    projectType: string;
    description: string;
    objective?: string;
    userRoles: string[];
    features: string[];
    integrations: string[];
    architecture?: string;
    frontend?: string;
    backend?: string;
    database?: string;
    infrastructure?: string;
    constraints?: string;
    currency: string;
    developerRate: number;
    qaRate: number;
    pmRate: number;
    complexity?: string;
    clientType?: string;
    deadline?: string;
    budgetRange?: string;
    developers?: number;
    qaMembers?: number;
    hoursPerWeek?: number;
    teamSize?: number;
    hasPayments?: boolean;
    screenCount?: string;
    requirementsClarity?: string;
}

/**
 * Configuración del proveedor de IA
 */
export interface AIProviderConfig {
    apiKey: string;
    temperature?: number;
    maxTokens?: number;
    model?: string;
}

/**
 * Interfaz para proveedores de IA
 * Permite intercambiar Perplexity por OpenAI, Claude, etc.
 */
export interface IAIProvider {
    /**
     * Nombre del proveedor (para logs)
     */
    readonly name: string;

    /**
     * Genera un plan de proyecto basado en los datos de entrada
     */
    generatePlan(input: PlanGenerationInput): Promise<GeneratedPlan>;
}

/**
 * Factory para crear proveedores de IA
 */
export type AIProviderFactory = (config: AIProviderConfig) => IAIProvider;
