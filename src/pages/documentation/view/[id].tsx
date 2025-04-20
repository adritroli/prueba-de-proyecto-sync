import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import DefaultLayout from "@/config/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronLeft, Edit, Clock, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ErrorBoundary } from "@/components/errorBoundary";
import "highlight.js/styles/vs2015.css";
import hljs from 'highlight.js';
import axios from "axios";
import { toast } from "sonner";

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

export default function ViewDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/documentation/documents/${id}`);
        setDocument({
          ...response.data,
          tags: response.data.tags || [] // Asegurar que tags sea un array
        });
      } catch (err) {
        console.error("Error al cargar documento:", err);
        setError("No se pudo cargar el documento");
        toast.error("Error al cargar el documento");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  useEffect(() => {
    // Resaltar bloques de código después de que el contenido se cargue
    if (document?.content && contentRef.current) {
      const codeBlocks = contentRef.current.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [document?.content]);

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

  if (error || !document) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-destructive text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error || "No se pudo cargar el documento"}</p>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <ErrorBoundary>
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
                    {document.space_name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>{document.title}</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
                <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>Creado por {document.created_by_username}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Actualizado {new Date(document.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 ml-2">
                    {document.tags && document.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <a href="/documentation">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Volver
                  </a>
                </Button>
                <Button asChild>
                  <a href={`/documentation/edit/${document.id}`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <Card className=" mx-auto">
              <CardContent className="p-6">
                <div 
                  ref={contentRef}
                  className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none ql-editor"
                  dangerouslySetInnerHTML={{ __html: document?.content || '' }}
                />
              </CardContent>
            </Card>
          </ScrollArea>
        </div>
      </DefaultLayout>
    </ErrorBoundary>
  );
}
