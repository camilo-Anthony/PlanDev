"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, LogIn, RotateCw, Mail, Lock, AlertCircle } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/projects";
    const error = searchParams.get("error");

    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormError(null);

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setFormError("Email o contraseña incorrectos");
                setIsLoading(false);
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setFormError("Error al iniciar sesión");
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md relative z-10">
            {/* Logo */}
            <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold">
                    <Sparkles className="h-8 w-8 text-primary" />
                    Plan<span className="text-primary">Dev</span>
                </Link>
                <p className="text-muted-foreground mt-2">
                    Inicia sesión en tu cuenta
                </p>
            </div>

            {/* Card */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
                {/* Error Message */}
                {(error || formError) && (
                    <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span className="text-sm">{formError || "Error de autenticación"}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
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
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-6 text-base"
                    >
                        {isLoading ? (
                            <>
                                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                                Iniciando sesión...
                            </>
                        ) : (
                            <>
                                <LogIn className="mr-2 h-4 w-4" />
                                Iniciar Sesión
                            </>
                        )}
                    </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">o continuar con</span>
                    </div>
                </div>

                {/* Google Login */}
                <Button
                    type="button"
                    variant="outline"
                    className="w-full py-6 text-base"
                    onClick={() => signIn("google", { callbackUrl })}
                >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Continuar con Google
                </Button>

                {/* Register Link */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    ¿No tienes cuenta?{" "}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                        Crear cuenta
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
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 pointer-events-none" />

            <Suspense fallback={
                <div className="w-full max-w-md flex items-center justify-center">
                    <RotateCw className="h-8 w-8 animate-spin text-primary" />
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}
