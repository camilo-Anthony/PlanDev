"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UserConfig {
    id: string;
    developerRate: number;
    qaRate: number;
    pmRate: number;
    weekLimitSimple: number;
    weekLimitMedium: number;
    weekLimitComplex: number;
    phaseAnalysis: number;
    phaseDesign: number;
    phaseDevelopment: number;
    phaseTesting: number;
    phaseDeployment: number;
    contingencyLow: number;
    contingencyMedium: number;
    contingencyHigh: number;
    contingencyVeryHigh: number;
    defaultHoursPerWeek: number;
    defaultTeamSize: number;
    aiTemperature: number;
    aiMaxTokens: number;
}

export default function SettingsPage() {
    const router = useRouter();
    const [config, setConfig] = useState<UserConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    async function fetchConfig() {
        try {
            const res = await fetch("/api/settings");
            if (res.ok) {
                const data = await res.json();
                setConfig(data);
            }
        } catch (error) {
            console.error("Error fetching config:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!config) return;
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });

            if (res.ok) {
                setMessage({ type: "success", text: "Configuración guardada correctamente" });
            } else {
                const error = await res.json();
                setMessage({ type: "error", text: error.error || "Error al guardar" });
            }
        } catch {
            setMessage({ type: "error", text: "Error de conexión" });
        } finally {
            setSaving(false);
        }
    }

    async function handleReset() {
        if (!confirm("¿Restablecer todos los valores a sus valores por defecto?")) return;
        setSaving(true);

        try {
            const res = await fetch("/api/settings", { method: "DELETE" });
            if (res.ok) {
                const data = await res.json();
                setConfig(data.config);
                setMessage({ type: "success", text: "Configuración restablecida" });
            }
        } catch {
            setMessage({ type: "error", text: "Error al restablecer" });
        } finally {
            setSaving(false);
        }
    }

    function updateField(field: keyof UserConfig, value: number) {
        if (!config) return;
        setConfig({ ...config, [field]: value });
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!config) {
        return (
            <div className="container max-w-4xl py-8">
                <p className="text-destructive">Error cargando configuración</p>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Configuración</h1>
                    <p className="text-muted-foreground">
                        Personaliza tus valores por defecto para estimaciones
                    </p>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === "success"
                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-6">
                {/* Tarifas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tarifas por Hora (USD)</CardTitle>
                        <CardDescription>
                            Valores por defecto para nuevos proyectos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Developer</Label>
                            <Input
                                type="number"
                                value={config.developerRate}
                                onChange={(e) => updateField("developerRate", parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>QA</Label>
                            <Input
                                type="number"
                                value={config.qaRate}
                                onChange={(e) => updateField("qaRate", parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>PM</Label>
                            <Input
                                type="number"
                                value={config.pmRate}
                                onChange={(e) => updateField("pmRate", parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Límites de Semanas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Límites de Semanas</CardTitle>
                        <CardDescription>
                            Máximo de semanas por nivel de complejidad
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Simple</Label>
                            <Input
                                type="number"
                                value={config.weekLimitSimple}
                                onChange={(e) => updateField("weekLimitSimple", parseInt(e.target.value) || 1)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Medio</Label>
                            <Input
                                type="number"
                                value={config.weekLimitMedium}
                                onChange={(e) => updateField("weekLimitMedium", parseInt(e.target.value) || 1)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Complejo</Label>
                            <Input
                                type="number"
                                value={config.weekLimitComplex}
                                onChange={(e) => updateField("weekLimitComplex", parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contingencia */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contingencia por Riesgo (%)</CardTitle>
                        <CardDescription>
                            Porcentaje adicional según nivel de riesgo
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-4">
                        <div className="space-y-2">
                            <Label>Bajo</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={(config.contingencyLow * 100).toFixed(0)}
                                onChange={(e) => updateField("contingencyLow", (parseFloat(e.target.value) || 0) / 100)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Medio</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={(config.contingencyMedium * 100).toFixed(0)}
                                onChange={(e) => updateField("contingencyMedium", (parseFloat(e.target.value) || 0) / 100)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Alto</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={(config.contingencyHigh * 100).toFixed(0)}
                                onChange={(e) => updateField("contingencyHigh", (parseFloat(e.target.value) || 0) / 100)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Muy Alto</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={(config.contingencyVeryHigh * 100).toFixed(0)}
                                onChange={(e) => updateField("contingencyVeryHigh", (parseFloat(e.target.value) || 0) / 100)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Equipo */}
                <Card>
                    <CardHeader>
                        <CardTitle>Equipo por Defecto</CardTitle>
                        <CardDescription>
                            Valores iniciales para nuevos proyectos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Horas por Semana</Label>
                            <Input
                                type="number"
                                value={config.defaultHoursPerWeek}
                                onChange={(e) => updateField("defaultHoursPerWeek", parseInt(e.target.value) || 40)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tamaño del Equipo</Label>
                            <Input
                                type="number"
                                value={config.defaultTeamSize}
                                onChange={(e) => updateField("defaultTeamSize", parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4 justify-end">
                    <Button variant="outline" onClick={handleReset} disabled={saving}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restablecer
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Guardar Cambios
                    </Button>
                </div>
            </div>
        </div>
    );
}
