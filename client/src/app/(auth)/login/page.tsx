"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ⚠️ IMPORTANTE: FastAPI espera 'username' y 'password' en formato FORM-DATA, no JSON normal
      const params = new URLSearchParams();
      params.append('username', formData.email); // FastAPI usa 'username' para el email
      params.append('password', formData.password);

      const response = await axios.post("http://127.0.0.1:8000/api/v1/auth/login", params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Guardamos el token en el navegador
      localStorage.setItem("token", response.data.access_token);
      
      // Nos vamos al dashboard
      router.push("/dashboard");
      
    } catch (error) {
      console.error(error);
      alert("Error: Email o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa a tu cuenta de InmoAI</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="tu@email.com" 
                required 
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              Entrar
            </Button>
            
            <p className="text-center text-sm text-slate-500 mt-4">
              ¿No tienes cuenta? <Link href="/register" className="text-blue-600 hover:underline">Regístrate gratis</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}