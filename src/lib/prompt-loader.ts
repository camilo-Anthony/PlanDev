/**
 * Prompt Loader - Carga AGENT.md maestro
 */

import fs from "fs";
import path from "path";

const ESTIMATION_DIR = path.join(process.cwd(), "src", "config", "estimation");

/**
 * Cache del AGENT.md en memoria
 */
let agentCache: string | null = null;

/**
 * Obtiene el AGENT.md maestro (consolidado)
 */
export function getMasterAgent(): string {
    // Check cache first
    if (agentCache) {
        return agentCache;
    }

    try {
        const filePath = path.join(ESTIMATION_DIR, "AGENT.md");

        if (!fs.existsSync(filePath)) {
            throw new Error(`AGENT.md not found at: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, "utf-8");

        // Cache it
        agentCache = content;

        return content;
    } catch (error) {
        console.error("Error loading AGENT.md:", error);
        throw error;
    }
}

/**
 * Limpia el cache (útil para desarrollo)
 */
export function clearPromptCache(): void {
    agentCache = null;
}

/**
 * Recarga AGENT.md (útil para desarrollo)
 */
export function reloadAgent(): string {
    agentCache = null;
    return getMasterAgent();
}
