"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Check, Sparkles, History, PlusCircle } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

// Definimos el tipo de dato que viene del backend
interface Property {
  id: number;
  address: string;
  features: string;
  vibe: string;
  generated_content: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Estado para el historial
  const [history, setHistory] = useState<Property[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    address: "",
    features: "",
    vibe: "",
  });

  // 1. Cargar historial al iniciar
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/v1/properties/");
      setHistory(res.data);
    } catch (error) {
      console.error("Error cargando historial:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Cargar una propiedad del historial en el formulario
  const loadProperty = (prop: Property) => {
    setFormData({
      address: prop.address,
      features: prop.features,
      vibe: prop.vibe || "", // Manejar nulls antiguos
    });
    setResult(prop.generated_content);
    setSelectedId(prop.id);
  };

  const resetForm = () => {
    setFormData({ address: "", features: "", vibe: "" });
    setResult(null);
    setSelectedId(null);
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
      
      const newProp = response.data;
      setResult(newProp.generated_content);
      setSelectedId(newProp.id);
      
      // Actualizamos el historial automáticamente
      setHistory([newProp, ...history]);
      
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el servidor.");
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
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* SIDEBAR - HISTORIAL */}
      <aside className="w-80 bg-white border-r border-slate-200 hidden lg:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-blue-700 mb-6">
            <Sparkles className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight">InmoAI</span>
          </div>
          <Button onClick={resetForm} variant="outline" className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Propiedad
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
            Historial Reciente
          </h3>
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => loadProperty(item)}
              className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                selectedId === item.id 
                  ? "bg-blue-50 text-blue-700 border border-blue-100" 
                  : "text-slate-600 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <div className="font-medium truncate">{item.address}</div>
              <div className="text-xs text-slate-400 truncate mt-1">
                {item.vibe || "Sin estilo definido"}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* FORMULARIO */}
          <div className="space-y-6">
            <div className="lg:hidden mb-6">
              {/* Header móvil simplificado */}
              <h1 className="text-2xl font-bold text-slate-900">InmoAI Generator</h1>
            </div>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  {selectedId ? "Editando Propiedad" : "Nueva Propiedad"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      placeholder="Ej: Av. Libertador 2400" 
                      required 
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="features">Características</Label>
                    <Textarea 
                      id="features" 
                      name="features" 
                      placeholder="Ej: 3 ambientes, balcón..." 
                      className="h-28 resize-none"
                      required
                      value={formData.features}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vibe">Vibe / Estilo</Label>
                    <Input 
                      id="vibe" 
                      name="vibe" 
                      placeholder="Ej: Lujo, Oportunidad" 
                      required
                      value={formData.vibe}
                      onChange={handleChange}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {loading ? "Generando..." : "Generar con IA"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* RESULTADO */}
          <div className="space-y-6">
            {result ? (
              <Card className="border-blue-200 bg-white shadow-lg h-[600px] flex flex-col">
                <div className="bg-slate-50 border-b border-slate-100 p-3 flex justify-between items-center px-4">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Resultado IA</span>
                  <Button 
                    variant={copied ? "default" : "ghost"} 
                    size="sm" 
                    onClick={copyToClipboard}
                    className={copied ? "bg-green-600" : "text-slate-500"}
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                </div>
                <CardContent className="p-6 overflow-y-auto flex-1 prose prose-slate prose-sm max-w-none">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </CardContent>
              </Card>
            ) : (
              <div className="h-[400px] lg:h-[600px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                <History className="h-10 w-10 mb-3 opacity-20" />
                <p>Selecciona una propiedad del historial o crea una nueva.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}