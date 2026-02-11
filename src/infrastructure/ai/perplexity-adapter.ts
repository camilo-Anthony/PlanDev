/**
 * Perplexity Adapter - Implementación del proveedor de IA para Perplexity
 * 
 * Implementa la interfaz IAIProvider para Perplexity API.
 */

import type { GeneratedPlan } from "@/domain/types";
import type { IAIProvider, PlanGenerationInput, AIProviderConfig } from "./types";
import { buildPlanPrompt, buildSystemPrompt } from "./prompt-builder";
import { AI_CONFIG } from "@/domain/constants";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

/**
 * Intenta reparar JSON truncado
 */
function tryRepairJSON(jsonStr: string): string {
    let repaired = jsonStr;

    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/]/g) || []).length;

    // Cerrar strings abiertos
    if (repaired.match(/:\s*"[^"]*$/)) {
        repaired += '"';
    }

    // Cerrar brackets
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
        repaired += "]";
    }

    // Cerrar braces
    for (let i = 0; i < openBraces - closeBraces; i++) {
        repaired += "}";
    }

    return repaired;
}

/**
 * Limpia el texto de respuesta de markdown
 */
function cleanResponseText(text: string): string {
    let cleanText = text.trim();

    if (cleanText.startsWith("```json")) {
        cleanText = cleanText.slice(7);
    } else if (cleanText.startsWith("```")) {
        cleanText = cleanText.slice(3);
    }

    if (cleanText.endsWith("```")) {
        cleanText = cleanText.slice(0, -3);
    }

    return cleanText.trim();
}

/**
 * Valida y corrige la consistencia del plan
 */
function validateAndCorrectPlan(plan: GeneratedPlan): GeneratedPlan {
    const calculatedBaseHours = plan.modules.reduce((sum, mod) =>
        sum + mod.tasks.reduce((tSum, task) => tSum + task.hoursExpected, 0),
        0
    );

    // Corregir si hay inconsistencia
    if (Math.abs(plan.baseHours - calculatedBaseHours) > 1) {
        plan.baseHours = Math.round(calculatedBaseHours);
        plan.contingencyHours = Math.round(plan.baseHours * plan.contingencyPercent);
        plan.totalHours = plan.baseHours + plan.contingencyHours;
    }

    return plan;
}

/**
 * Implementación de Perplexity como proveedor de IA
 */
export class PerplexityAdapter implements IAIProvider {
    readonly name = "Perplexity";

    private readonly apiKey: string;
    private readonly temperature: number;
    private readonly maxTokens: number;
    private readonly model: string;

    constructor(config: AIProviderConfig) {
        this.apiKey = config.apiKey;
        this.temperature = config.temperature ?? AI_CONFIG.temperature;
        this.maxTokens = config.maxTokens ?? AI_CONFIG.maxTokens;
        this.model = config.model ?? AI_CONFIG.model;
    }

    async generatePlan(input: PlanGenerationInput): Promise<GeneratedPlan> {
        const prompt = buildPlanPrompt(input);
        const systemPrompt = buildSystemPrompt();

        const response = await fetch(PERPLEXITY_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt },
                ],
                temperature: this.temperature,
                max_tokens: this.maxTokens,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Perplexity API error: ${response.status} - ${error}`);
        }

        const result = await response.json();
        const text = result.choices[0]?.message?.content || "";
        const cleanText = cleanResponseText(text);

        try {
            const plan = JSON.parse(cleanText) as GeneratedPlan;
            return validateAndCorrectPlan(plan);
        } catch {
            console.error("Initial parse failed, attempting repair...");

            try {
                const repairedText = tryRepairJSON(cleanText);
                const plan = JSON.parse(repairedText) as GeneratedPlan;
                return validateAndCorrectPlan(plan);
            } catch {
                console.error("Repair failed. Original text:", cleanText.substring(0, 500));
                throw new Error(
                    "Error parsing AI response. La respuesta fue incompleta. Intenta con un proyecto más simple."
                );
            }
        }
    }
}

/**
 * Crea una instancia del adaptador de Perplexity con configuración del entorno
 */
export function createPerplexityAdapter(): IAIProvider {
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
        throw new Error("PERPLEXITY_API_KEY environment variable is required");
    }

    return new PerplexityAdapter({
        apiKey,
        temperature: parseFloat(process.env.AI_TEMPERATURE || String(AI_CONFIG.temperature)),
        maxTokens: parseInt(process.env.AI_MAX_TOKENS || String(AI_CONFIG.maxTokens)),
        model: process.env.AI_MODEL || AI_CONFIG.model,
    });
}
