import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Layers, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="text-center space-y-6 animate-fade-in">
                <div className="relative">
                    <div className="text-[8rem] md:text-[12rem] font-bold text-primary/10 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Layers className="h-16 w-16 text-primary animate-pulse-subtle" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                        Página no encontrada
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        La página que buscas no existe o fue movida.
                    </p>
                </div>

                <div className="flex gap-3 justify-center flex-wrap pt-4">
                    <Link href="/">
                        <Button size="lg" className="interactive">
                            <Home className="mr-2 h-4 w-4" /> Ir al Inicio
                        </Button>
                    </Link>
                    <Link href="/projects">
                        <Button size="lg" variant="outline" className="interactive">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Mis Proyectos
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
