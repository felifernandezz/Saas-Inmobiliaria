"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Check, Sparkles } from "lucide-react"; // Agregué iconos
import axios from "axios";
import ReactMarkdown from "react-markdown"; // <--- IMPORTACIÓN NUEVA

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false); // Estado para feedback de copiado

  const [formData, setFormData] = useState({
    address: "",
    features: "",
    vibe: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/v1/properties/generate", {
        address: formData.address,
        features: formData.features,
        vibe: formData.vibe,
      });
      setResult(response.data.generated_content);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el servidor. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* IZQUIERDA: INPUTS */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">InmoAI Generator</h1>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Datos de la Propiedad</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección / Título</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    placeholder="Ej: Av. Libertador 2400, Belgrano" 
                    required 
                    value={formData.address}
                    onChange={handleChange}
                    className="bg-slate-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="features">Características Principales</Label>
                  <Textarea 
                    id="features" 
                    name="features" 
                    placeholder="Ej: 3 ambientes, balcón terraza, amenities de lujo, seguridad 24hs..." 
                    className="h-32 bg-slate-50 resize-none"
                    required
                    value={formData.features}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vibe">Estilo de Venta (Vibe)</Label>
                  <Input 
                    id="vibe" 
                    name="vibe" 
                    placeholder="Ej: Lujo exclusivo, Oportunidad de inversión, Familiar" 
                    required
                    value={formData.vibe}
                    onChange={handleChange}
                    className="bg-slate-50"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 mt-2" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creando Anuncio...
                    </>
                  ) : (
                    "✨ Generar Marketing"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* DERECHA: RESULTADO (CON MARKDOWN) */}
        <div className="space-y-6">
          <div className="flex justify-between items-end h-[68px] mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Resultado</h2>
              <p className="text-slate-500 text-sm">Tu contenido listo para copiar.</p>
            </div>
          </div>

          {result ? (
            <Card className="border-blue-200 bg-white shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden flex flex-col h-[600px]">
              <div className="bg-slate-50 border-b border-slate-100 p-3 flex justify-end">
                <Button 
                  variant={copied ? "default" : "outline"} 
                  size="sm" 
                  onClick={copyToClipboard}
                  className={copied ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "¡Copiado!" : "Copiar Texto"}
                </Button>
              </div>
              
              <CardContent className="p-6 overflow-y-auto flex-1 bg-white">
                {/* AQUÍ ESTÁ LA MAGIA DEL MARKDOWN */}
                <div className="prose prose-slate prose-sm max-w-none">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-[600px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <Sparkles className="h-12 w-12 mb-4 text-slate-300" />
              <p className="font-medium">Esperando datos...</p>
              <p className="text-sm">Completa el formulario para ver la magia.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}