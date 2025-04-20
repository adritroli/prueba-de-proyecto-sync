import { useState } from "react";
import DefaultLayout from "@/config/layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditorQuill from "@/components/editorQuill";
import { toast } from "sonner";

interface ClaimFormData {
  title: string;
  description: string;
  priority: string;
  category: string;
  impact: string;
  attachments?: FileList;
  additional_details: string;
}

export default function CreateClaimPage() {
  const [formData, setFormData] = useState<ClaimFormData>({
    title: "",
    description: "",
    priority: "",
    category: "",
    impact: "",
    additional_details: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      
      const taskData = {
        ...formData,
        project_id: 1, // ID del proyecto de reclamos
        creator_id: userData.id,
        type: "claim",
      };

      const response = await fetch("http://localhost:5000/api/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) throw new Error("Error al crear el reclamo");

      toast.success("Reclamo creado exitosamente");
      // Limpiar formulario
      setFormData({
        title: "",
        description: "",
        priority: "",
        category: "",
        impact: "",
        additional_details: "",
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear el reclamo");
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Crear Nuevo Reclamo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title">Título del Reclamo</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción del Problema</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Técnico</SelectItem>
                        <SelectItem value="billing">Facturación</SelectItem>
                        <SelectItem value="service">Servicio</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="impact">Impacto</Label>
                  <Select
                    value={formData.impact}
                    onValueChange={(value) =>
                      setFormData({ ...formData, impact: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar impacto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bajo</SelectItem>
                      <SelectItem value="medium">Medio</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Detalles Adicionales</Label>
                  <EditorQuill
                    onSave={(content) =>
                      setFormData({ ...formData, additional_details: content })
                    }
                    placeholder="Agregar detalles adicionales..."
                  />
                </div>

                <div>
                  <Label htmlFor="attachments">Archivos Adjuntos</Label>
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        attachments: e.target.files || undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="submit" className="w-32">
                  Crear Reclamo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
}
