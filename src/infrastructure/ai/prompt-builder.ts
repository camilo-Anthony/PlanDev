import type { PlanGenerationInput } from "./types";
import { PHASE_DISTRIBUTION } from "@/domain/constants";
import { getEstimationTemplate } from "@/lib/template-loader";
import { getMasterAgent } from "@/lib/prompt-loader";
import { logger } from "@/lib/logger";

/**
 * Construye el prompt del sistema usando SOLO AGENT.md
 */
export function buildSystemPrompt(): string {
  return getMasterAgent();
}

/**
 * Construye el prompt de usuario para generación de plan
 * Usa SOLO AGENT.md consolidado
 */
export function buildPlanPrompt(input: PlanGenerationInput): string {
  logger.info(`Building prompt for project: ${input.projectName} (type: ${input.projectType})`);

  // Cargar template de proyecto específico
  const estimationTemplate = getEstimationTemplate(input.projectType, input.complexity);

  if (!estimationTemplate) {
    logger.warn(`No template loaded - prompt will not include baseline guidance`);
  }

  const templateSection = estimationTemplate
    ? `
## TEMPLATE OBLIGATORIO - ESTO ES UNA ORDEN, NO UNA SUGERENCIA

${estimationTemplate}

---

# REGLA ABSOLUTA - LEE ESTO ANTES DE CONTINUAR

El template arriba especifica **"Horas base: XXh"**. 

**ESE NÚMERO ES TU OBJETIVO EXACTO. NO ES NEGOCIABLE.**

## Tolerancia MÁXIMA: ±5%

Si el template dice **85h**:
- ACEPTABLE: 81h - 89h
- RECHAZADO: 113h (+33%)
- RECHAZADO: 70h (-18%)

Si el template dice **120h**:
- ACEPTABLE: 114h - 126h  
- RECHAZADO: 199h (+66%)

## PROCESO OBLIGATORIO

**ANTES de generar:**
1. Lee "Horas base" del template
2. Calcula ±5%: [base × 0.95, base × 1.05]

**MIENTRAS generas:**
3. Mantén contador del total
4. Ajusta horas para acercarte al baseline

**DESPUÉS de generar:**
5. Suma TODAS las hoursExpected
6. ¿Dentro de ±5%? SÍ → responde | NO → AJUSTA

## EJEMPLO: Te pasaste (DEBES AJUSTAR)

\`\`\`
Template: 85h
Tus tareas: 113h (+33%) RECHAZADO

AJUSTA AHORA:
- Reduce cada tarea × 0.75 (113h → 85h)
- O elimina módulos no esenciales
- RESULTADO: 81-89h OK
\`\`\`

## ADVERTENCIA FINAL

**Tu respuesta será RECHAZADA si no cumples ±5%**

El template tiene razón - tú debes ajustarte a él.

---
`
    : "";

  logger.info(`Template section included: ${!!estimationTemplate} (${templateSection.length} chars)`);

  // Construir sección de información del proyecto
  const projectInfo = buildProjectInfo(input);

  // Ensamblar prompt: template + project info
  // (AGENT.md ya tiene todas las reglas, PERT, y formato)
  const finalPrompt = `
${templateSection}

${projectInfo}

## DISTRIBUCIÓN POR FASES (Referencia)
- Análisis: ${PHASE_DISTRIBUTION.analysis * 100}%
- Diseño: ${PHASE_DISTRIBUTION.design * 100}%
- Desarrollo: ${PHASE_DISTRIBUTION.development * 100}%
- Testing: ${PHASE_DISTRIBUTION.testing * 100}%
- Despliegue: ${PHASE_DISTRIBUTION.deployment * 100}%

Responde SOLO con JSON válido.
`;

  logger.info(`Prompt built successfully (${finalPrompt.length} chars)`);

  return finalPrompt;
}

/**
 * Construye la sección de información del proyecto
 */
function buildProjectInfo(input: PlanGenerationInput): string {
  const teamSize = (input.developers || 1) + (input.qaMembers || 0);
  const weeklyCapacity = (input.hoursPerWeek || 40) * teamSize;

  return `
## INFORMACIÓN DEL PROYECTO

**Nombre:** ${input.projectName}
**Tipo:** ${input.projectType}
**Moneda:** ${input.currency}
**Complejidad:** ${input.complexity || "medium"}

### Descripción
${input.description}

${input.objective ? `### Objetivo Principal\n${input.objective}` : ""}

### Funcionalidades Clave
${input.features.length > 0 ? input.features.map((f) => `- ${f}`).join("\n") : "No especificadas"}

### Integraciones Externas
${input.integrations.length > 0 ? input.integrations.map((i) => `- ${i}`).join("\n") : "Ninguna"}

### Stack Técnico
- Arquitectura: ${input.architecture || "No especificada"}
- Frontend: ${input.frontend || "No especificado"}
- Backend: ${input.backend || "No especificado"}
- Base de datos: ${input.database || "No especificada"}

### Contexto del Equipo
- **Equipo:** ${input.developers || 1} dev(s), ${input.qaMembers || 0} QA
- **Capacidad:** ${weeklyCapacity} horas/semana
- **Pantallas UI:** ${input.screenCount === "few" ? "Pocas" : input.screenCount === "many" ? "Muchas" : "Cantidad media"}
`;
}
