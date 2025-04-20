import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import hljs from "highlight.js";
import "highlight.js/styles/vs2015.css";
import "@/styles/editor.css";

// Importaciones de lenguajes
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import typescript from "highlight.js/lib/languages/typescript";

// Registrar lenguajes
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("typescript", typescript);

// Configurar el módulo de sintaxis de Quill una sola vez fuera del componente
const configureQuill = (() => {
  let configured = false;
  return () => {
    if (!configured) {
      const Syntax = Quill.import("modules/syntax") as any;
      Syntax.DEFAULTS.hljs = hljs;
      Quill.register("modules/syntax", Syntax);
      configured = true;
    }
  };
})();

// Configurar Quill una sola vez
configureQuill();

const toolbarOptions = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  ["link", "image"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ["clean"],
];

interface EditorQuillProps {
  onSave: (content: string) => void;
  placeholder?: string;
  initialContent?: string;
  buttonText?: string;
}

function EditorQuill({
  onSave,
  placeholder = "Escribe un comentario...",
  initialContent = "",
  buttonText = "Comentar",
}: EditorQuillProps) {
  const quillRef = useRef<Quill | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(initialContent);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar el editor una sola vez
  useEffect(() => {
    // Limpiar cualquier instancia anterior
    const container = editorRef.current;
    if (!container || quillRef.current || isInitialized) return;

    // Eliminar cualquier toolbar existente
    const existingToolbar = document.querySelector(".ql-toolbar");
    if (existingToolbar) {
      existingToolbar.remove();
    }

    quillRef.current = new Quill(container, {
      modules: {
        toolbar: toolbarOptions,
        syntax: true,
      },
      theme: "snow",
      placeholder,
    });

    const editor = quillRef.current;

    // Establecer el contenido inicial si existe
    if (initialContent) {
      editor.root.innerHTML = initialContent;
      setContent(initialContent);
    }

    // Marcar como inicializado
    setIsInitialized(true);

    return () => {
      if (quillRef.current) {
        // Limpiar todo al desmontar
        quillRef.current.off("text-change");
        const toolbar = document.querySelector(".ql-toolbar");
        if (toolbar) {
          toolbar.remove();
        }
        quillRef.current = null;
        setIsInitialized(false);
      }
    };
  }, [placeholder, initialContent]);

  // Manejar cambios en el editor
  useEffect(() => {
    if (!quillRef.current || !isInitialized) return;

    const handleTextChange = (_delta: any, _oldDelta: any, source: string) => {
      if (source === "user") {
        const newContent = quillRef.current?.root.innerHTML || "";
        setContent(newContent);
      }
    };

    quillRef.current.on("text-change", handleTextChange);

    return () => {
      if (quillRef.current) {
        quillRef.current.off("text-change", handleTextChange);
      }
    };
  }, [isInitialized]);

  const handleSave = () => {
    if (quillRef.current) {
      onSave(content);
      quillRef.current.setText(""); // Limpiar el editor después de guardar
      setContent("");
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-wrapper">
        <div ref={editorRef}></div>
      </div>
      <div className="editor-actions">
        <button className="save-button" onClick={handleSave}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export default EditorQuill;
