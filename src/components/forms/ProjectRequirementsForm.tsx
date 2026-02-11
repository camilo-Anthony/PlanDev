"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    CreditCard,
    Map,
    Mail,
    Bell,
    MessageSquare,
    LogIn,
    Cloud,
    Calendar,
    Check,
    ChevronDown,
    ChevronUp,
    Settings2
} from "lucide-react";

interface ProjectRequirementsFormProps {
    formData: {
        description: string;
        objective: string;
        userRoles: string;
        features: string;
        integrations: string;
        hasPayments: boolean;
        screenCount: string;
        requirementsClarity: string;
    };
    updateField: (field: string, value: string | number | boolean) => void;
}

const COMMON_INTEGRATIONS = [
    { id: "stripe", label: "Stripe", icon: CreditCard },
    { id: "mercadopago", label: "MercadoPago", icon: CreditCard },
    { id: "google-maps", label: "Maps", icon: Map },
    { id: "google-auth", label: "OAuth", icon: LogIn },
    { id: "sendgrid", label: "Email", icon: Mail },
    { id: "push", label: "Push", icon: Bell },
    { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
    { id: "aws-s3", label: "Storage", icon: Cloud },
    { id: "calendar", label: "Calendar", icon: Calendar },
];

export function ProjectRequirementsForm({ formData, updateField }: ProjectRequirementsFormProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const selectedIntegrations = formData.integrations
        ? formData.integrations.split(",").map(i => i.trim().toLowerCase())
        : [];

    const toggleIntegration = (integrationId: string) => {
        const current = new Set(selectedIntegrations);
        if (current.has(integrationId)) {
            current.delete(integrationId);
        } else {
            current.add(integrationId);
        }
        updateField("integrations", Array.from(current).join(", "));
    };

    const isSelected = (id: string) => selectedIntegrations.includes(id);

    return (
        <div className="space-y-6">
            {/* 1. DESCRIPCIÓN - Lo más importante */}
            <div className="space-y-2">
                <Label className="text-base font-semibold">Descripción del proyecto *</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="¿Qué problema resuelve? ¿Para quién es? Describe las funcionalidades principales..."
                    className={`min-h-[120px] ${!formData.description ? "border-destructive/50" : ""}`}
                />
                {!formData.description && (
                    <p className="text-xs text-destructive">Este campo es requerido</p>
                )}
            </div>

            {/* 2. FUNCIONALIDADES */}
            <div className="space-y-2">
                <Label>Funcionalidades principales</Label>
                <Textarea
                    value={formData.features}
                    onChange={(e) => updateField("features", e.target.value)}
                    placeholder="Una por línea:&#10;Dashboard con estadísticas&#10;Gestión de usuarios&#10;Reportes en PDF&#10;Notificaciones por email"
                    className="min-h-[100px]"
                />
            </div>

            {/* 3. INTEGRACIONES */}
            <div className="space-y-3">
                <Label>Integraciones</Label>

                {/* Checkbox de pagos destacado */}
                <button
                    type="button"
                    onClick={() => updateField("hasPayments", !formData.hasPayments)}
                    className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-all ${formData.hasPayments ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
                        }`}
                >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${formData.hasPayments ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                        }`}>
                        {formData.hasPayments && <Check className="w-3 h-3" />}
                    </div>
                    <div className="text-left flex-1">
                        <span className="font-medium text-sm">Procesamiento de pagos</span>
                        <span className="text-xs text-muted-foreground ml-2">(Stripe, MercadoPago, PayPal)</span>
                    </div>
                </button>

                {/* Chips de integraciones */}
                <div className="flex flex-wrap gap-1.5">
                    {COMMON_INTEGRATIONS.map((integration) => {
                        const Icon = integration.icon;
                        const selected = isSelected(integration.id);
                        return (
                            <Badge
                                key={integration.id}
                                variant={selected ? "default" : "outline"}
                                className={`cursor-pointer py-1.5 px-2.5 text-xs ${selected ? "bg-primary hover:bg-primary/90" : "hover:bg-muted"
                                    }`}
                                onClick={() => toggleIntegration(integration.id)}
                            >
                                <Icon className="w-3 h-3 mr-1" />
                                {integration.label}
                            </Badge>
                        );
                    })}
                </div>
            </div>

            {/* 4. AVANZADO (colapsable) */}
            <div className="border-t pt-4">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                >
                    <Settings2 className="w-4 h-4" />
                    <span className="font-medium">Opciones avanzadas</span>
                    {showAdvanced ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                </button>

                {showAdvanced && (
                    <div className="mt-4 space-y-4 pl-4 border-l-2 border-muted">
                        <div className="space-y-2">
                            <Label className="text-sm">Objetivo principal</Label>
                            <Input
                                value={formData.objective}
                                onChange={(e) => updateField("objective", e.target.value)}
                                placeholder="Ej: Permitir a clientes reservar citas online"
                                className="text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">Tipos de usuario</Label>
                            <Input
                                value={formData.userRoles}
                                onChange={(e) => updateField("userRoles", e.target.value)}
                                placeholder="Admin, Usuario, Vendedor, Cliente"
                                className="text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">Otras integraciones</Label>
                            <Input
                                value={formData.integrations}
                                onChange={(e) => updateField("integrations", e.target.value)}
                                placeholder="API de envíos, CRM, ERP, etc."
                                className="text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
