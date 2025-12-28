"use client";

import React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Check, Sparkles, PlusCircle, LogOut, Upload, X, ImageIcon } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { FileText } from 'lucide-react';



interface Property {
    id: number;
    address: string;
    features: string;
    vibe: string;
    generated_content: string;
}

// Función para limpiar la respuesta de la IA antes de convertirla a objeto
const cleanAIResponse = (text: string) => {
    try {
        // 1. Quitamos los bloques de código ```json y ```
        let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        // 2. Intentamos convertir
        return JSON.parse(cleanText);
    } catch (e) {
        // Fallback: si falla, devolvemos un objeto básico con todo el texto
        return {
            title: "Propiedad Generada",
            short_description: "Resumen generado automáticamente.",
            full_description: text, // Aquí va todo el texto original
            highlights: ["Consultar detalles", "Oportunidad"],
            instagram_copy: ""
        };
    }
};

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<Property[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // ESTADOS NUEVOS PARA IMAGEN
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        address: "",
        features: "",
        vibe: "",
    });

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            headers: { Authorization: `Bearer ${token}` }
        };
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        } else {
            fetchHistory();
        }
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/v1/properties/", getAuthHeaders());
            setHistory(res.data);
        } catch (error) {
            console.error("Error cargando historial:", error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                localStorage.removeItem("token");
                router.push("/login");
            }
        }
    };

    const loadProperty = (item: Property) => {
        setSelectedId(item.id);
        setResult(item.generated_content);
        setFormData({
            address: item.address,
            features: item.features,
            vibe: item.vibe,
        });
        setSelectedFiles([]);
        setPreviewUrls([]);
    };

    const logout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);

            // Agregamos a los que ya había (o reemplazamos, según prefieras. Aquí sumamos)
            const newFiles = [...selectedFiles, ...filesArray];
            setSelectedFiles(newFiles);

            // Generamos previews para los nuevos
            const newUrls = filesArray.map(file => URL.createObjectURL(file));
            setPreviewUrls([...previewUrls, ...newUrls]);
        }
    };

    // CAMBIO 3: Borrar una imagen específica
    const removeImage = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newUrls = previewUrls.filter((_, i) => i !== index);

        // Liberar memoria de la URL borrada
        URL.revokeObjectURL(previewUrls[index]);

        setSelectedFiles(newFiles);
        setPreviewUrls(newUrls);
    };

    // Limpieza total (resetForm)
    const resetForm = () => {
        setFormData({ address: "", features: "", vibe: "" });
        setResult(null);
        setSelectedId(null);
        setSelectedFiles([]);
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setPreviewUrls([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const data = new FormData();
            data.append("address", formData.address);
            data.append("features", formData.features);
            data.append("vibe", formData.vibe);

            // CAMBIO 4: Append de múltiples archivos con la misma key "images"
            if (selectedFiles.length > 0) {
                selectedFiles.forEach((file) => {
                    data.append("images", file);
                });
            }

            const response = await axios.post(
                "http://127.0.0.1:8000/api/v1/properties/generate",
                data,
                getAuthHeaders()
            );
            const newProp = response.data;

            // USAMOS LA FUNCIÓN DE LIMPIEZA
            const parsedData = cleanAIResponse(newProp.generated_content);

            // Guardamos el JSON stringify limpio para que el estado 'result' sea consistente
            setResult(JSON.stringify(parsedData));

            setSelectedId(newProp.id);

            setHistory([newProp, ...history]);

        } catch (error) {
            console.error("Error:", error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                alert("Tu sesión expiró.");
                router.push("/login");
            } else {
                alert("Error al conectar con el servidor.");
            }
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

            {/* SIDEBAR */}
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
                        Historial
                    </h3>
                    {history.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => loadProperty(item)}
                            className={`w-full text-left p-3 rounded-lg text-sm transition-all ${selectedId === item.id
                                ? "bg-blue-50 text-blue-700 border border-blue-100"
                                : "text-slate-600 hover:bg-slate-50 border border-transparent"
                                }`}
                        >
                            <div className="font-medium truncate">{item.address}</div>
                            <div className="text-xs text-slate-400 truncate mt-1">
                                {item.vibe || "General"}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-100">
                    <Button onClick={logout} variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                    <div className="space-y-6">
                        <div className="lg:hidden mb-6 flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-slate-900">InmoAI Generator</h1>
                            <Button onClick={logout} size="sm" variant="ghost">Salir</Button>
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
                                            className="h-24 resize-none"
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

                                    {/* ZONA DE CARGA DE IMAGEN */}
                                    <div className="space-y-2">
                                        <Label>Fotos de la Propiedad (Sube varias)</Label>

                                        {/* Grid de Previews */}
                                        {previewUrls.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2 mb-2">
                                                {previewUrls.map((url, index) => (
                                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                                        <Image
                                                            src={url}
                                                            alt="Preview"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white p-1 rounded-full transition-colors"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Botón de Carga */}
                                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="flex flex-col items-center text-slate-400">
                                                {previewUrls.length > 0 ? (
                                                    <>
                                                        <PlusCircle className="h-8 w-8 mb-2 text-blue-500" />
                                                        <span className="text-sm font-medium text-blue-600">Agregar más fotos</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="h-8 w-8 mb-2" />
                                                        <span className="text-sm font-medium">Click para subir fotos</span>
                                                        <span className="text-xs mt-1">Sube cocina, baño y frente</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                        {loading ? "Analizando con Visión..." : "Generar con IA"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {result ? (
                            <Card className="border-blue-200 bg-white shadow-lg h-[600px] flex flex-col">
                                <div className="bg-slate-50 border-b border-slate-100 p-3 flex justify-between items-center px-4">
                                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Resultado IA</span>

                                    <div className="flex gap-2">


                                        {/* Botón existente de Copiar */}
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
                                </div>

                                <CardContent className="flex-1 overflow-y-auto p-6">
                                    <div className="prose prose-slate prose-sm max-w-none">
                                        {result && (() => {
                                            const data = cleanAIResponse(result);
                                            return (
                                                <>
                                                    <h2 className="text-xl font-bold mb-2">{data.title}</h2>
                                                    <div className="flex gap-2 mb-4 flex-wrap">
                                                        {data.highlights?.map((h: string, i: number) => (
                                                            <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{h}</span>
                                                        ))}
                                                    </div>
                                                    <p className="font-medium text-slate-600 mb-4">{data.short_description}</p>
                                                    <div className="whitespace-pre-wrap">{data.full_description}</div>

                                                    <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                        <h4 className="font-bold text-sm text-slate-500 uppercase mb-2">Instagram Copy</h4>
                                                        <p className="text-slate-600 italic">{data.instagram_copy}</p>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="h-[600px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <Sparkles className="h-12 w-12 mb-4 opacity-20" />
                                <p>Genera una propiedad para ver el resultado</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}