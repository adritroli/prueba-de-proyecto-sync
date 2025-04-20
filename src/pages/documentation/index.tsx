import { useState, useEffect } from "react";
import DefaultLayout from "@/config/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Search, Book, FolderPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BsThreeDots } from "react-icons/bs";
import axios from "axios";
import { toast } from "sonner"
import { useNavigate, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/errorBoundary";

interface Document {
  id: number;
  title: string;
  content: string;
  space_id: number;
  created_at: string;
  updated_at: string;
  created_by_username: string;
  updated_by_username: string;
  tags: string[];
  space_name: string;
  space_icon: string;
}

interface Space {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export default function DocumentationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSpaceId = queryParams.get('space') ? parseInt(queryParams.get('space') as string) : null;

  const [spaces, setSpaces] = useState<Space[]>([]); // Inicializar como array vacío
  const [documents, setDocuments] = useState<Document[]>([]); // Inicializar como array vacío
  const [selectedSpace, setSelectedSpace] = useState<number | null>(initialSpaceId);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceDescription, setNewSpaceDescription] = useState("");
  const [newSpaceIcon, setNewSpaceIcon] = useState("📄");
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);

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
        toast.error("No se pudieron cargar los espacios de documentación", {
          description: "Error al cargar los espacios de documentación",
        });
        setSpaces([]); // En caso de error, establecer como array vacío
      }
    };

    fetchSpaces();
  }, []);

  // Cargar documentos
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/documentation/documents', {
          params: { space_id: selectedSpace }
        });
        // Asegurarse de que response.data sea un array
        setDocuments(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error al cargar documentos:", error);
        toast.error("Error al cargar los documentos");
        setDocuments([]); // En caso de error, establecer como array vacío
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [selectedSpace]);

  // Filtrar documentos por búsqueda
  const filteredDocuments = Array.isArray(documents) 
    ? documents.filter(doc => {
        if (!doc) return false;
        return doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               doc.tags?.some(tag => tag?.toLowerCase().includes(searchQuery.toLowerCase()));
      })
    : [];

  const handleSpaceSelect = (spaceId: number | null) => {
    setSelectedSpace(spaceId);
    
    // Actualizar la URL con el parámetro de espacio seleccionado
    if (spaceId) {
      navigate(`/documentation?space=${spaceId}`);
    } else {
      navigate('/documentation');
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) {
      toast.error("El nombre del espacio es obligatorio", {
        description: "El nombre del espacio es obligatorio",
      });
      return;
    }

    try {
      setIsCreatingSpace(true);
      
      const response = await axios.post('http://localhost:5000/api/documentation/spaces', {
        name: newSpaceName.trim(),
        description: newSpaceDescription.trim(),
        icon: newSpaceIcon,
        user_id: 1 // En una implementación real, esto vendría del contexto de autenticación
      });
      
      // Añadir el nuevo espacio a la lista
      setSpaces([...spaces, response.data]);
      
      // Limpiar el formulario
      setNewSpaceName("");
      setNewSpaceDescription("");
      setNewSpaceIcon("📄");
      
      // Cerrar el diálogo
      document.getElementById("close-dialog-button")?.click();
      
      toast.success("Espacio creado correctamente", {
        description: "Espacio creado: El espacio de documentación se ha creado correctamente",
      });
    } catch (err) {
      console.error("Error al crear espacio:", err);
      setError("No se pudo crear el espacio de documentación");
      toast.error("No se pudo crear el espacio de documentación", {
        description: "No se pudo crear el espacio de documentación",
      });
    } finally {
      setIsCreatingSpace(false);
    }
  };

  return (
    <ErrorBoundary>
      <DefaultLayout>
        <div className="flex h-full">
          {/* Sidebar con espacios */}
          <div className="w-64 border-r p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Espacios</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="Crear espacio">
                    <FolderPlus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear nuevo espacio</DialogTitle>
                    <DialogDescription>
                      Los espacios te ayudan a organizar tu documentación por temas o proyectos.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="space-name">Nombre del espacio *</label>
                      <Input 
                        id="space-name" 
                        value={newSpaceName}
                        onChange={(e) => setNewSpaceName(e.target.value)}
                        placeholder="Ej: Guías de usuario"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="space-description">Descripción</label>
                      <Input 
                        id="space-description" 
                        value={newSpaceDescription}
                        onChange={(e) => setNewSpaceDescription(e.target.value)}
                        placeholder="Ej: Documentación para usuarios finales"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="space-icon">Icono</label>
                      <Input 
                        id="space-icon" 
                        value={newSpaceIcon}
                        onChange={(e) => setNewSpaceIcon(e.target.value)}
                        placeholder="Emoji (📄, 📚, etc.)"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      id="close-dialog-button" 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setNewSpaceName("");
                        setNewSpaceDescription("");
                        setNewSpaceIcon("📄");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      onClick={handleCreateSpace}
                      disabled={isCreatingSpace}
                    >
                      {isCreatingSpace ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creando...
                        </>
                      ) : "Crear espacio"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <Button
              variant={selectedSpace === null ? "secondary" : "ghost"}
              className="justify-start mb-1"
              onClick={() => handleSpaceSelect(null)}
            >
              <Book className="h-4 w-4 mr-2" />
              Todos los documentos
            </Button>
            
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {Array.isArray(spaces) && spaces.map(space => (
                  <Button
                    key={space.id}
                    variant={selectedSpace === space.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleSpaceSelect(space.id)}
                  >
                    <span className="mr-2">{space.icon}</span>
                    {space.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Contenido principal */}
          <div className="flex-1 flex flex-col h-full">
            <div className="border-b p-4">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">
                  {selectedSpace 
                    ? Array.isArray(spaces) && spaces.find(s => s.id === selectedSpace)?.name || "Documentación" 
                    : "Toda la documentación"}
                </h1>
                <Button asChild>
                  <a href="/documentation/create">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nuevo documento
                  </a>
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar documentos..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Cargando documentos...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-destructive text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Reintentar</Button>
                  </div>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <h2 className="text-xl font-bold mb-2">No hay documentos</h2>
                    {searchQuery ? (
                      <p className="text-muted-foreground mb-4">
                        No se encontraron documentos que coincidan con "{searchQuery}".
                      </p>
                    ) : (
                      <p className="text-muted-foreground mb-4">
                        {selectedSpace 
                          ? "Este espacio aún no tiene documentos. ¡Crea el primero!" 
                          : "No hay documentos disponibles. ¡Crea el primero!"}
                      </p>
                    )}
                    <Button asChild>
                      <a href="/documentation/create">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Crear documento
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments.map(doc => (
                    <Card key={doc.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center mb-1">
                            <span className="mr-2">{doc.space_icon}</span>
                            <span className="text-sm text-muted-foreground">{doc.space_name}</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <BsThreeDots className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <a href={`/documentation/edit/${doc.id}`} className="cursor-pointer">
                                  Editar
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardTitle className="text-lg">
                          <a 
                            href={`/documentation/view/${doc.id}`}
                            className="hover:underline"
                          >
                            {doc.title}
                          </a>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex flex-wrap gap-1 mb-3">
                          {doc.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Avatar className="h-5 w-5 mr-1">
                              <AvatarImage src={`https://avatar.vercel.sh/${doc.created_by_username}.png`} />
                              <AvatarFallback>{doc.created_by_username.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {doc.created_by_username}
                          </div>
                          <div>
                            {new Date(doc.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DefaultLayout>
    </ErrorBoundary>
  );
}
