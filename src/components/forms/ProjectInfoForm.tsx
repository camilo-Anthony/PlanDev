"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface ProjectInfoFormProps {
    formData: {
        name: string;
        type: string;
        complexity: string;
    };
    updateField: (field: string, value: string | number) => void;
    hasTemplate?: boolean; // Si viene de plantilla
    templateName?: string; // Nombre de la plantilla seleccionada
}

export function ProjectInfoForm({
    formData,
    updateField,
    hasTemplate = false,
    templateName
}: ProjectInfoFormProps) {
    return (
        <div className="space-y-6">
            {/* Nombre del proyecto - siempre visible */}
            <div className="space-y-2">
                <Label className="text-base font-semibold">Nombre del proyecto *</Label>
                <Input
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Ej: Sistema de Reservas para Hotel"
                    className={`text-lg ${!formData.name ? "border-destructive/50 focus:border-destructive" : ""}`}
                />
                {!formData.name && (
                    <p className="text-xs text-destructive">Este campo es requerido</p>
                )}
            </div>

            {/* Mensaje informativo sobre detección automática */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-primary">
                            Detección Automática Activada
                        </p>
                        <p className="text-xs text-muted-foreground">
                            La IA analizará tu descripción y features para detectar automáticamente el tipo de proyecto
                            (landing page, portfolio, sistema interno, e-commerce, etc.) y su complejidad.
                            No necesitas seleccionar nada manualmente.
                        </p>
                    </div>
                </div>
            </div>

            {/* Si viene de plantilla: mostrar info de plantilla */}
            {hasTemplate && templateName && (
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Plantilla seleccionada</p>
                            <p className="font-medium">{templateName}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            Auto-detectado
                        </Badge>
                    </div>
                </div>
            )}
        </div>
    );
}
