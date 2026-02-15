/**
 * Template Loader - Carga templates de estimación
 */

import fs from "fs";
import path from "path";
import { logger } from "@/lib/logger";

const TEMPLATES_DIR = path.join(process.cwd(), "src", "config", "estimation", "templates");

/**
 * Mapeo de tipos de proyecto a templates
 */
const PROJECT_TYPE_TO_TEMPLATE: Record<string, string> = {
    // Portfolio
    "portfolio": "portfolio-simple.md",
    "portafolio": "portfolio-simple.md",
    "portfolio-simple": "portfolio-simple.md",
    "portfolio-complex": "portfolio-complex.md",

    // E-commerce
    "ecommerce": "ecommerce-basic.md",
    "ecommerce-basic": "ecommerce-basic.md",
    "tienda": "ecommerce-basic.md",
    "shop": "ecommerce-basic.md",

    // SaaS
    "saas": "saas-mvp.md",
    "saas-mvp": "saas-mvp.md",

    // Landing Page
    "landing": "landing-page.md",
    "landing-page": "landing-page.md",
    "landing page": "landing-page.md",

    // Mobile App
    "mobile": "mobile-app.md",
    "mobile-app": "mobile-app.md",
    "app-movil": "mobile-app.md",
    "app movil": "mobile-app.md",

    // Internal System (ampliado)
    "internal": "internal-system.md",
    "internal-system": "internal-system.md",
    "sistema-interno": "internal-system.md",
    "sistema interno": "internal-system.md",
    "sistema": "internal-system.md",
    "crud": "internal-system.md",
    "admin": "internal-system.md",
    "backoffice": "internal-system.md",
    "back-office": "internal-system.md",
    "dashboard": "internal-system.md",
    "gestión": "internal-system.md",
    "gestion": "internal-system.md",
    "management": "internal-system.md",

    // Web App
    "web-app": "web-app.md",
    "webapp": "web-app.md",
    "app-web": "web-app.md",
    "app web": "web-app.md",
};

/**
 * Detecta automáticamente el tipo de proyecto y complejidad
 * basándose en descripción, features e integraciones
 */
export function detectProjectType(input: {
    projectName?: string;
    description: string;
    features: string[];
    integrations: string[];
    objective?: string;
}): { type: string; complexity: string; confidence: string } {
    // Combinar todo el texto para análisis
    const fullText = `
        ${input.projectName || ''} 
        ${input.description} 
        ${input.objective || ''} 
        ${input.features.join(' ')} 
        ${input.integrations.join(' ')}
    `.toLowerCase();

    logger.info(`Auto-detecting project type for: "${input.projectName || 'Unnamed'}"`);

    // 1. Landing Page (muy específico)
    if (
        fullText.includes('landing') ||
        fullText.includes('aterrizaje') ||
        fullText.includes('campaña') ||
        (fullText.includes('página') && fullText.includes('marketing'))
    ) {
        logger.info(`Detected: Landing Page (12h)`);
        return { type: 'landing-page', complexity: 'low', confidence: 'high' };
    }

    // 2. Internal Systems (antes de "app" genérico)
    if (
        fullText.includes('hotel') ||
        fullText.includes('reservas') ||
        fullText.includes('gestión') ||
        fullText.includes('gestion') ||
        fullText.includes('sistema') ||
        fullText.includes('crud') ||
        fullText.includes('admin') ||
        fullText.includes('dashboard') ||
        fullText.includes('backoffice') ||
        fullText.includes('management')
    ) {
        logger.info(`Detected: Internal System (120h)`);
        return { type: 'internal-system', complexity: 'medium', confidence: 'high' };
    }

    // 3. Portfolio (con detección de complejidad)
    if (fullText.includes('portfolio') || fullText.includes('portafolio')) {
        const isComplex =
            fullText.includes('cms') ||
            fullText.includes('blog') ||
            fullText.includes('admin') ||
            fullText.includes('multi-idioma') ||
            fullText.includes('galería dinámica');

        if (isComplex) {
            logger.info(`Detected: Portfolio Complex (85h)`);
            return { type: 'portfolio-complex', complexity: 'high', confidence: 'high' };
        } else {
            logger.info(`Detected: Portfolio Simple (25h)`);
            return { type: 'portfolio-simple', complexity: 'low', confidence: 'high' };
        }
    }

    // 4. E-commerce
    if (
        fullText.includes('tienda') ||
        fullText.includes('ecommerce') ||
        fullText.includes('shop') ||
        fullText.includes('carrito') ||
        fullText.includes('productos') ||
        fullText.includes('checkout')
    ) {
        logger.info(`Detected: E-commerce (150h)`);
        return { type: 'ecommerce-basic', complexity: 'medium', confidence: 'high' };
    }

    // 5. SaaS
    if (
        fullText.includes('saas') ||
        fullText.includes('suscripción') ||
        fullText.includes('subscription') ||
        fullText.includes('multi-tenant') ||
        fullText.includes('planes') ||
        fullText.includes('membresías')
    ) {
        logger.info(`Detected: SaaS MVP (320h)`);
        return { type: 'saas-mvp', complexity: 'high', confidence: 'high' };
    }

    // 6. Mobile App
    if (
        fullText.includes('móvil') ||
        fullText.includes('movil') ||
        fullText.includes('mobile') ||
        fullText.includes('react native') ||
        fullText.includes('ios') ||
        fullText.includes('android')
    ) {
        logger.info(`Detected: Mobile App (200h)`);
        return { type: 'mobile-app', complexity: 'medium', confidence: 'high' };
    }

    // 7. Web App (genérico)
    if (
        fullText.includes('app web') ||
        fullText.includes('webapp') ||
        fullText.includes('plataforma') ||
        fullText.includes('aplicación web')
    ) {
        logger.info(`Detected: Web App (180h)`);
        return { type: 'web-app', complexity: 'medium', confidence: 'medium' };
    }

    // Default: Web App (con baja confianza)
    logger.warn(`No specific match - defaulting to Web App (180h)`);
    return { type: 'web-app', complexity: 'medium', confidence: 'low' };
}

/**
 * Determina qué template usar basado en el tipo de proyecto y complejidad
 */
export function selectTemplate(projectType: string, complexity?: string): string | null {
    const normalizedType = projectType.toLowerCase().trim();

    // Mapeo directo (primera prioridad)
    if (PROJECT_TYPE_TO_TEMPLATE[normalizedType]) {
        return PROJECT_TYPE_TO_TEMPLATE[normalizedType];
    }

    // Lógica basada en palabras clave (orden importa - de más específico a más genérico)

    // 1. Landing pages (muy específico)
    if (normalizedType.includes("landing")) {
        return "landing-page.md";
    }

    // 2. Internal systems (ANTES de verificar "app" genérico)
    if (
        normalizedType.includes("internal") ||
        normalizedType.includes("interno") ||
        normalizedType.includes("crud") ||
        normalizedType.includes("admin") ||
        normalizedType.includes("sistema") ||
        normalizedType.includes("gestión") ||
        normalizedType.includes("gestion") ||
        normalizedType.includes("management") ||
        normalizedType.includes("backoffice") ||
        normalizedType.includes("dashboard")
    ) {
        return "internal-system.md";
    }

    // 3. Portfolio
    if (normalizedType.includes("portfolio") || normalizedType.includes("portafolio")) {
        return complexity === "high" ? "portfolio-complex.md" : "portfolio-simple.md";
    }

    // 4. E-commerce
    if (normalizedType.includes("ecommerce") || normalizedType.includes("tienda") || normalizedType.includes("shop")) {
        return "ecommerce-basic.md";
    }

    // 5. SaaS
    if (normalizedType.includes("saas") || normalizedType.includes("suscripción") || normalizedType.includes("subscription")) {
        return "saas-mvp.md";
    }

    // 6. Mobile/Web apps (después de verificar internal)
    if (normalizedType.includes("mobile") || normalizedType.includes("movil")) {
        return "mobile-app.md";
    }

    if (normalizedType.includes("app")) {
        // Si contiene "web" → web-app
        if (normalizedType.includes("web")) {
            return "web-app.md";
        }
        // Si solo dice "app" sin más contexto → web-app por defecto
        return "web-app.md";
    }

    // Default: web app para proyectos genéricos
    logger.warn(`No specific match for "${projectType}", using default: web-app.md`);
    return "web-app.md";
}

/**
 * Carga el contenido de un template
 */
export function loadTemplate(templateName: string): string | null {
    try {
        const templatePath = path.join(TEMPLATES_DIR, templateName);

        if (!fs.existsSync(templatePath)) {
            console.warn(`Template not found: ${templatePath}`);
            return null;
        }

        return fs.readFileSync(templatePath, "utf-8");
    } catch (error) {
        console.error(`Error loading template ${templateName}:`, error);
        return null;
    }
}

/**
 * Obtiene el template apropiado para un proyecto
 */
export function getEstimationTemplate(projectType: string, complexity?: string): string | null {
    const templateName = selectTemplate(projectType, complexity);

    if (!templateName) {
        console.warn(`No template found for project type: ${projectType}`);
        return null;
    }

    logger.info(`Loading template: ${templateName} for project type: ${projectType}`);

    const templateContent = loadTemplate(templateName);

    if (templateContent) {
        // Extraer horas base del template para logging
        const baseHoursMatch = templateContent.match(/Horas base:\*\*\s*(\d+)h/);
        const baseHours = baseHoursMatch ? baseHoursMatch[1] : 'unknown';

        logger.info(`Template loaded: ${templateName} (${baseHours}h baseline, ${templateContent.length} chars)`);

        // Verificar que el template tiene contenido sustancial
        if (templateContent.length < 100) {
            console.warn(`Template seems too short (${templateContent.length} chars)`);
        }
    } else {
        console.error(`Failed to load template: ${templateName}`);
    }

    return templateContent;
}

/**
 * Lista todos los templates disponibles
 */
export function listAvailableTemplates(): string[] {
    try {
        if (!fs.existsSync(TEMPLATES_DIR)) {
            return [];
        }

        return fs.readdirSync(TEMPLATES_DIR)
            .filter(file => file.endsWith(".md") && file !== "README.md");
    } catch (error) {
        console.error("Error listing templates:", error);
        return [];
    }
}
