import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-900">
          InmoAI SaaS 🤖
        </h1>
        <p className="text-xl text-slate-600">
          Genera descripciones inmobiliarias profesionales en segundos con Inteligencia Artificial.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Comenzar Gratis
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            Ver Demo
          </Button>
        </div>

        {/* Mockup visual */}
        <Card className="mt-12 text-left shadow-2xl border-slate-200">
          <CardHeader>
            <CardTitle>Generador de Propiedades</CardTitle>
            <CardDescription>Pega los datos y obtén el copy perfecto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
            <div className="h-32 w-full bg-slate-100 rounded mt-4" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
