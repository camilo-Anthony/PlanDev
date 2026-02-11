import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

interface UserStoryResult {
    taskId: string;
    userStory: string;
}

// POST /api/projects/[id]/generate-stories - Generar historias de usuario
export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!PERPLEXITY_API_KEY) {
            return NextResponse.json(
                { error: "API key no configurada" },
                { status: 500 }
            );
        }

        const project = await db.project.findUnique({
            where: { id },
            include: {
                requirements: true,
                modules: {
                    include: { tasks: true },
                },
            },
        });

        if (!project) {
            return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
        }

        // Preparar lista de tareas
        const allTasks = project.modules.flatMap((m: { name: string; tasks: { id: string; name: string; description: string | null }[] }) =>
            m.tasks.map((t: { id: string; name: string; description: string | null }) => ({
                id: t.id,
                name: t.name,
                description: t.description,
                moduleName: m.name,
            }))
        );

        const prompt = `Genera historias de usuario para las siguientes tareas de un proyecto de software.
Contexto del proyecto: ${project.requirements?.description || project.name}

Para cada tarea, genera una historia de usuario en formato:
"Como [rol], quiero [acción], para [beneficio]"

Tareas (indexadas desde 0):
${allTasks.map((t: { id: string; name: string; description: string | null; moduleName: string }, i: number) => `${i}. [Módulo: ${t.moduleName}] ${t.name}${t.description ? ` - ${t.description}` : ""}`).join("\n")}

Responde SOLO en formato JSON (el taskIndex debe coincidir exactamente con el número de la tarea arriba):
{
  "stories": [
    { "taskIndex": 0, "userStory": "Como usuario, quiero..." },
    { "taskIndex": 1, "userStory": "Como admin, quiero..." }
  ]
}`;

        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "sonar",
                messages: [
                    { role: "system", content: "Eres un experto en análisis de requisitos y metodologías ágiles. Responde solo en JSON válido." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || "";

        // Extraer JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No se pudo parsear la respuesta");
        }

        const parsed = JSON.parse(jsonMatch[0]);
        const stories: UserStoryResult[] = [];

        // Actualizar cada tarea con su historia
        for (const story of parsed.stories) {
            const task = allTasks[story.taskIndex];
            if (task) {
                await db.task.update({
                    where: { id: task.id },
                    data: { userStory: story.userStory },
                });
                stories.push({
                    taskId: task.id,
                    userStory: story.userStory,
                });
            }
        }

        return NextResponse.json({
            success: true,
            count: stories.length,
            stories,
        });
    } catch (error) {
        return handleApiError(error, "Generate Stories");
    }
}
