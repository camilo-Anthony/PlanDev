"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, UserPlus, RotateCw, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Validaciones
        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Error al crear la cuenta");
                setIsLoading(false);
                return;
            }

            // Auto login after registration
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                router.push("/login");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("Error al crear la cuenta");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold">
                        <Sparkles className="h-8 w-8 text-primary" />
                        Plan<span className="text-primary">Dev</span>
                    </Link>
                    <p className="text-muted-foreground mt-2">
                        Crea tu cuenta gratis
                    </p>
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre (opcional)</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Tu nombre"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="pl-10"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Repite la contraseña"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="pl-10"
                                    required
                                />
                            </div>
                            {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                <div className="flex items-center gap-1 text-xs text-green-500">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Las contraseñas coinciden
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-6 text-base mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                                    Creando cuenta...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Crear Cuenta
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Features */}
                    <div className="mt-6 pt-6 border-t border-border">
                        <p className="text-xs text-muted-foreground text-center mb-3">
                            Al crear una cuenta obtienes:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                                Proyectos ilimitados
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                                Generación con IA
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                                Exportación a PDF, Markdown, CSV
                            </li>
                        </ul>
                    </div>

                    {/* Login Link */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        ¿Ya tienes cuenta?{" "}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Iniciar sesión
                        </Link>
                    </p>
                </div>

                {/* Back to home */}
                <p className="text-center mt-6 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-foreground transition-colors">
                        ← Volver al inicio
                    </Link>
                </p>
            </div>
        </div>
    );
}
