"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Info,
    ListTodo,
    Settings,
    ArrowLeft,
    ArrowRight,
    Rocket,
} from "lucide-react";
import { ProjectInfoForm } from "@/components/forms/ProjectInfoForm";
import { ProjectRequirementsForm } from "@/components/forms/ProjectRequirementsForm";
import { ProjectTechnicalForm } from "@/components/forms/ProjectTechnicalForm";

type Step = "info" | "requirements" | "technical";

const STEPS: { id: Step; title: string; icon: React.ReactNode }[] = [
    { id: "info", title: "Informacion", icon: <Info className="w-4 h-4" /> },
    { id: "requirements", title: "Requisitos", icon: <ListTodo className="w-4 h-4" /> },
    { id: "technical", title: "Tecnico", icon: <Settings className="w-4 h-4" /> },
];

// TEMPLATE_ICONS removed - no longer needed with auto-detection

const INITIAL_FORM_DATA = {
    name: "",
    type: "web",
    currency: "USD",
    description: "",
    objective: "",
    userRoles: "",
    features: "",
    integrations: "",
    architecture: "",
    frontend: "",
    backend: "",
    database: "",
    infrastructure: "",
    constraints: "",
    developerRate: 0,
    qaRate: 0,
    pmRate: 0,
    hoursPerWeek: 40,
    teamSize: 1,
    startDate: "",
    freelancerName: "",
    complexity: "auto",
    clientType: "startup",
    deadline: "normal",
    budgetRange: "",
    developers: 1,
    qaMembers: 0,
    // Nuevos campos para mejor estimación
    hasPayments: false,
    screenCount: "medium",
    requirementsClarity: "moderate",
};

export default function NewProjectPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>("info"); // Empezar en "info" en lugar de "template"
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    const updateField = (field: string, value: string | number | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const project = await response.json();
                router.push(`/projects/${project.id}`);
            } else {
                const errorData = await response.json();
                console.error("Error creating project:", errorData);
                alert(`Error: ${errorData.error}\n${errorData.details?.map((d: { field: string; message: string }) => `${d.field}: ${d.message}`).join('\n') || ''}`);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // getTemplateIcon removed - no longer needed with auto-detection

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-border bg-background/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold flex items-center gap-2">
                        <Rocket className="h-6 w-6" />
                        PlanDev
                    </Link>
                    <Link href="/projects">
                        <Button variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-0">
                        {STEPS.map((step, index) => {
                            const stepIndex = STEPS.findIndex((s) => s.id === currentStep);
                            const isCompleted = index < stepIndex;
                            const isCurrent = step.id === currentStep;

                            return (
                                <div key={step.id} className="flex items-center">
                                    <button
                                        onClick={() => setCurrentStep(step.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isCurrent
                                            ? "bg-primary text-primary-foreground"
                                            : isCompleted
                                                ? "bg-primary/20 text-primary"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            }`}
                                    >
                                        <span
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent
                                                ? "bg-primary-foreground text-primary"
                                                : isCompleted
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted-foreground/30"
                                                }`}
                                        >
                                            {isCompleted ? "✓" : index + 1}
                                        </span>
                                        <span className="hidden md:inline">{step.title}</span>
                                    </button>
                                    {index < STEPS.length - 1 && (
                                        <div className={`w-8 h-0.5 ${isCompleted ? "bg-primary" : "bg-muted"}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Template step removed - AI auto-detects project type */}

                {/* Form Card for all steps */}
                {(
                    <Card className="max-w-3xl mx-auto bg-card border-border">
                        {/* Step: Info */}
                        {currentStep === "info" && (
                            <>
                                <CardHeader>
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <Info className="h-6 w-6" /> Información del Proyecto
                                    </CardTitle>
                                    <CardDescription>
                                        Datos básicos para identificar tu proyecto
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ProjectInfoForm
                                        formData={formData}
                                        updateField={updateField}
                                        hasTemplate={false}
                                        templateName={undefined}
                                    />
                                    <div className="flex justify-end pt-6">
                                        <Button onClick={() => setCurrentStep("requirements")} disabled={!formData.name}>
                                            Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </>
                        )}

                        {/* Step: Requirements */}
                        {currentStep === "requirements" && (
                            <>
                                <CardHeader>
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <ListTodo className="h-6 w-6" /> Requisitos del Proyecto
                                    </CardTitle>
                                    <CardDescription>Describe lo que el cliente necesita</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ProjectRequirementsForm formData={formData} updateField={updateField} />
                                    <div className="flex justify-between pt-6">
                                        <Button variant="ghost" onClick={() => setCurrentStep("info")}>
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                                        </Button>
                                        <Button onClick={() => setCurrentStep("technical")} disabled={!formData.description}>
                                            Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </>
                        )}

                        {/* Step: Technical */}
                        {currentStep === "technical" && (
                            <>
                                <CardHeader>
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <Settings className="h-6 w-6" /> Configuración Técnica
                                    </CardTitle>
                                    <CardDescription>Stack tecnológico y arquitectura</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ProjectTechnicalForm formData={formData} updateField={updateField} />
                                    <div className="flex justify-between pt-6">
                                        <Button variant="ghost" onClick={() => setCurrentStep("requirements")}>
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                                        </Button>
                                        <Button onClick={handleSubmit} disabled={isLoading} className="px-8">
                                            {isLoading ? (
                                                <span className="flex items-center gap-2">Creando...</span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Rocket className="h-4 w-4" /> Crear y Generar Plan
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
}
