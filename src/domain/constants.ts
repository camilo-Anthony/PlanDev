/**
 * Domain Constants - Constantes centralizadas de estimación
 * 
 * Todas las constantes de negocio están aquí para:
 * 1. Evitar duplicación
 * 2. Facilitar configuración futura por usuario
 * 3. Tener un único punto de verdad
 */

import type { Phase, HoursRange, PertEstimate } from "./types";

// ============================================
// LÍMITES DE PROYECTO POR COMPLEJIDAD
// ============================================

export const WEEK_LIMITS = {
    simple: 2,
    medium: 5,
    complex: 12,
} as const;

export type ComplexityLevel = keyof typeof WEEK_LIMITS;

// ============================================
// TARIFAS POR DEFECTO
// ============================================

export const DEFAULT_RATES = {
    developer: 50,
    qa: 40,
    pm: 60,
} as const;

export type RoleType = keyof typeof DEFAULT_RATES;

// ============================================
// FACTORES DE AJUSTE
// ============================================

export const COMPLEXITY_MULTIPLIERS = {
    simple: 0.85,
    medium: 1.0,
    complex: 1.25,
} as const;

export const ADJUSTMENT_FACTORS = {
    complexity: {
        simple: 0.85,
        medium: 1.0,
        complex: 1.25,
    },
    deadline: {
        flexible: 0.9,
        normal: 1.0,
        urgent: 1.3,
    },
    clientType: {
        personal: 0.9,
        startup: 1.0,
        medium: 1.15,
        enterprise: 1.35,
    },
    integrations: {
        none: 1.0,
        low: 1.1,
        medium: 1.2,
        high: 1.35,
    },
} as const;

// ============================================
// DISTRIBUCIÓN DE FASES
// ============================================

export const PHASE_DISTRIBUTION = {
    analysis: 0.10,
    design: 0.15,
    development: 0.50,
    testing: 0.15,
    deployment: 0.10,
} as const;

export const PHASE_ORDER: Phase[] = [
    "analysis",
    "design",
    "development",
    "testing",
    "deployment",
];

// ============================================
// RANGOS DE HORAS POR TIPO DE PROYECTO
// ============================================

export const PROJECT_HOUR_RANGES: Record<string, HoursRange> = {
    web: { min: 40, max: 300, typical: 120 },
    mobile: { min: 80, max: 400, typical: 180 },
    ecommerce: { min: 100, max: 500, typical: 250 },
    internal: { min: 150, max: 600, typical: 300 },
    api: { min: 60, max: 350, typical: 150 },
    other: { min: 50, max: 400, typical: 150 },
};

// ============================================
// CONTINGENCIA Y RIESGO
// ============================================

export const RISK_CONTINGENCY = {
    low: 0.10,
    medium: 0.15,
    high: 0.20,
    veryHigh: 0.30,
} as const;

// ============================================
// TABLA BASE DE ESTIMACIÓN PERT
// ============================================

export const ESTIMATION_BASE: Record<string, PertEstimate> = {
    // UI / FRONTEND
    "ui_crud_simple": { optimistic: 3, mostLikely: 4, pessimistic: 6 },
    "ui_crud_complex": { optimistic: 6, mostLikely: 10, pessimistic: 16 },
    "ui_dashboard": { optimistic: 4, mostLikely: 8, pessimistic: 14 },
    "ui_form_simple": { optimistic: 1, mostLikely: 2, pessimistic: 3 },
    "ui_form_complex": { optimistic: 3, mostLikely: 5, pessimistic: 8 },
    "ui_landing_page": { optimistic: 4, mostLikely: 6, pessimistic: 10 },
    "ui_responsive_adjustments": { optimistic: 2, mostLikely: 4, pessimistic: 6 },

    // BACKEND / API
    "api_endpoint_simple": { optimistic: 1, mostLikely: 2, pessimistic: 3 },
    "api_endpoint_complex": { optimistic: 2, mostLikely: 4, pessimistic: 8 },
    "api_crud_module": { optimistic: 3, mostLikely: 5, pessimistic: 8 },
    "api_authentication": { optimistic: 4, mostLikely: 8, pessimistic: 14 },
    "api_authorization_rbac": { optimistic: 4, mostLikely: 6, pessimistic: 10 },
    "api_file_upload": { optimistic: 2, mostLikely: 4, pessimistic: 6 },
    "api_search_filter": { optimistic: 2, mostLikely: 4, pessimistic: 8 },
    "api_pagination": { optimistic: 1, mostLikely: 2, pessimistic: 3 },

    // INTEGRACIONES
    "integration_payment_stripe": { optimistic: 8, mostLikely: 16, pessimistic: 32 },
    "integration_payment_mercadopago": { optimistic: 10, mostLikely: 20, pessimistic: 40 },
    "integration_email_simple": { optimistic: 2, mostLikely: 4, pessimistic: 6 },
    "integration_email_templates": { optimistic: 4, mostLikely: 8, pessimistic: 12 },
    "integration_sms": { optimistic: 2, mostLikely: 4, pessimistic: 8 },
    "integration_push_notifications": { optimistic: 4, mostLikely: 8, pessimistic: 14 },
    "integration_oauth_google": { optimistic: 2, mostLikely: 4, pessimistic: 8 },
    "integration_oauth_facebook": { optimistic: 3, mostLikely: 6, pessimistic: 10 },
    "integration_maps_google": { optimistic: 3, mostLikely: 6, pessimistic: 10 },
    "integration_api_externa": { optimistic: 4, mostLikely: 8, pessimistic: 16 },
    "integration_websockets": { optimistic: 6, mostLikely: 12, pessimistic: 20 },

    // BASE DE DATOS
    "db_schema_design": { optimistic: 2, mostLikely: 4, pessimistic: 8 },
    "db_migrations": { optimistic: 1, mostLikely: 2, pessimistic: 4 },
    "db_seeding": { optimistic: 1, mostLikely: 2, pessimistic: 3 },

    // DEVOPS / DEPLOY
    "devops_ci_cd_basic": { optimistic: 2, mostLikely: 4, pessimistic: 8 },
    "devops_docker": { optimistic: 2, mostLikely: 4, pessimistic: 6 },
    "devops_deploy_vercel": { optimistic: 1, mostLikely: 2, pessimistic: 4 },
    "devops_deploy_aws": { optimistic: 4, mostLikely: 8, pessimistic: 16 },
    "devops_ssl_domain": { optimistic: 1, mostLikely: 2, pessimistic: 4 },

    // QA / TESTING
    "qa_unit_tests_module": { optimistic: 2, mostLikely: 4, pessimistic: 6 },
    "qa_integration_tests": { optimistic: 3, mostLikely: 6, pessimistic: 10 },
    "qa_e2e_basic": { optimistic: 4, mostLikely: 8, pessimistic: 14 },
    "qa_manual_testing": { optimistic: 2, mostLikely: 4, pessimistic: 6 },

    // DOCUMENTACIÓN
    "docs_api": { optimistic: 2, mostLikely: 4, pessimistic: 6 },
    "docs_user_manual": { optimistic: 2, mostLikely: 4, pessimistic: 8 },
    "docs_technical": { optimistic: 2, mostLikely: 4, pessimistic: 6 },
};

// ============================================
// CONFIGURACIÓN DE IA
// ============================================

export const AI_CONFIG = {
    temperature: 0.5,
    maxTokens: 8000,
    model: "sonar",
} as const;

// ============================================
// CONFIGURACIÓN DE EQUIPO
// ============================================

export const TEAM_DEFAULTS = {
    hoursPerWeek: 40,
    teamSize: 1,
    developers: 1,
    qaMembers: 0,
    hoursPerDay: 8,
    workDays: ["L", "M", "Mi", "J", "V"],
} as const;
