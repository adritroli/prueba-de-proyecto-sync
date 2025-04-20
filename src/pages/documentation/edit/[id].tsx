import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DefaultLayout from "@/config/layout";
import EditorQuill from "@/components/editorQuill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronLeft, Save, Plus, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";

interface Document {
  id?: number;
  title: string;
  content: string;
  space_id: number;
  created_at?: string;
  updated_at?: string;
  created_by_username?: string;
  updated_by_username?: string;
  tags: string[];
  space_name?: string;
  space_icon?: string;
}

interface Space {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export default function EditDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewDocument = id === "new";
  
  const [document, setDocument] = useState<Document>({
    title: "",
    content: "",
    space_id: 1,
    tags: []
  });
  
  const [spaces, setSpaces] = useState<Space[]>([]); // Inicializar como array vacío
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar espacios de documentación
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/documentation/spaces');
        // Asegurarse de que response.data sea un array
        setSpaces(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error al cargar espacios:", err);
        setError("No se pudieron cargar los espacios de documentación");
        toast.error("No se pudieron cargar los espacios de documentación");
        setSpaces([]); // En caso de error, establecer como array vacío
      }
    };

    fetchSpaces();
  }, []);

  // Cargar documento si no es nuevo
  useEffect(() => {
    const fetchDocument = async () => {
      if (!isNewDocument) {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:5000/api/documentation/documents/${id}`);
          setDocument({
            id: response.data.id,
            title: response.data.title,
            content: response.data.content,
            space_id: response.data.space_id,
            created_at: response.data.created_at,
            updated_at: response.data.updated_at,
            created_by_username: response.data.created_by_username,
            updated_by_username: response.data.updated_by_username,
            tags: response.data.tags || [],
            space_name: response.data.space_name,
            space_icon: response.data.space_icon
          });
        } catch (err) {
          console.error("Error al cargar documento:", err);
          setError("No se pudo cargar el documento");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, isNewDocument]);

  const handleContentChange = (content: string) => {
    setDocument({ ...document, content });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocument({ ...document, title: e.target.value });
  };

  const handleSpaceChange = (value: string) => {
    setDocument({ ...document, space_id: parseInt(value) });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !document.tags.includes(newTag.trim())) {
      setDocument({ ...document, tags: [...document.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setDocument({ ...document, tags: document.tags.filter(t => t !== tag) });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!document.title.trim()) {
      toast.error("Por favor, ingresa un título para el documento");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let response;
      
      // Preparar datos para enviar
      const documentData = {
        title: document.title,
        content: document.content,
        space_id: document.space_id,
        tags: document.tags,
        user_id: 1 // En una implementación real, esto vendría del contexto de autenticación
      };

      if (isNewDocument) {
        // Crear nuevo documento
        response = await axios.post('http://localhost:5000/api/documentation/documents', documentData);
      } else {
        // Actualizar documento existente
        response = await axios.put(`http://localhost:5000/api/documentation/documents/${id}`, documentData);
      }

      setSaveSuccess(true);
      
      // Mostrar mensaje de éxito
      toast.success(
        isNewDocument 
          ? "El documento se ha creado correctamente" 
          : "Los cambios se han guardado correctamente"
      );
      
      // Redirigir después de guardar
      setTimeout(() => {
        navigate(`/documentation/view/${isNewDocument ? response.data.id : id}`);
      }, 1000);
    } catch (err) {
      console.error("Error al guardar documento:", err);
      setError("No se pudo guardar el documento. Por favor, inténtalo de nuevo.");
      toast.error("No se pudo guardar el documento. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando documento...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col h-full">
        <div className="border-b p-4">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/documentation">Documentación</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/documentation?space=${document.space_id}`}>
                  {Array.isArray(spaces) && spaces.find(s => s.id === document.space_id)?.name || "Espacio"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>
                  {isNewDocument ? "Nuevo documento" : "Editar documento"}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              {isNewDocument ? "Crear nuevo documento" : "Editar documento"}
            </h1>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="/documentation">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Cancelar
                </a>
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || saveSuccess}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : saveSuccess ? (
                  <>
                    <div className="h-4 w-4 mr-2">✓</div>
                    Guardado
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-6">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              {error && (
                <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del documento</Label>
                  <Input 
                    id="title" 
                    value={document.title} 
                    onChange={handleTitleChange} 
                    placeholder="Ingresa un título descriptivo"
                    className="text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="space">Espacio</Label>
                  <Select 
                    value={document.space_id?.toString()} 
                    onValueChange={handleSpaceChange}
                  >
                    <SelectTrigger id="space">
                      <SelectValue placeholder="Selecciona un espacio" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(spaces) && spaces.map(space => (
                        <SelectItem key={space.id} value={space.id.toString()}>
                          <div className="flex items-center">
                            <span className="mr-2">{space.icon}</span>
                            {space.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">Etiquetas</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {document.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button 
                          onClick={() => handleRemoveTag(tag)}
                          className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-muted"
                          title={`Eliminar etiqueta ${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Añadir etiqueta"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={handleAddTag}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Presiona Enter para añadir una etiqueta
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Contenido</Label>
                  <div className="min-h-[400px] border rounded-md">
                    <EditorQuill 
                      onSave={handleContentChange} 
                      placeholder="Escribe el contenido de tu documento aquí..."
                      initialContent={document.content}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </div>
    </DefaultLayout>
  );
}
