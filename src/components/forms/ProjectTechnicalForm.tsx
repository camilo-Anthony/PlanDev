"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ProjectTechnicalFormProps {
    formData: {
        architecture: string;
        frontend: string;
        backend: string;
        database: string;
        infrastructure: string;
        constraints: string;
    };
    updateField: (field: string, value: string | number) => void;
}

export function ProjectTechnicalForm({ formData, updateField }: ProjectTechnicalFormProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Arquitectura</Label>
                <Select
                    value={formData.architecture}
                    onValueChange={(v) => updateField("architecture", v)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="monolith">Monolito</SelectItem>
                        <SelectItem value="microservices">Microservicios</SelectItem>
                        <SelectItem value="serverless">Serverless</SelectItem>
                        <SelectItem value="jamstack">JAMStack</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Frontend</Label>
                    <Input
                        value={formData.frontend}
                        onChange={(e) => updateField("frontend", e.target.value)}
                        placeholder="Ej: React, Next.js"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Backend</Label>
                    <Input
                        value={formData.backend}
                        onChange={(e) => updateField("backend", e.target.value)}
                        placeholder="Ej: Node.js, Python"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Base de datos</Label>
                    <Input
                        value={formData.database}
                        onChange={(e) => updateField("database", e.target.value)}
                        placeholder="Ej: PostgreSQL"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Infraestructura</Label>
                    <Input
                        value={formData.infrastructure}
                        onChange={(e) => updateField("infrastructure", e.target.value)}
                        placeholder="Ej: AWS, Vercel"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Restricciones</Label>
                <Textarea
                    value={formData.constraints}
                    onChange={(e) => updateField("constraints", e.target.value)}
                    placeholder="Notas técnicas adicionales..."
                />
            </div>
        </div>
    );
}
