import DefaultLayout from "@/config/layout"
import { useState } from "react";
import ReactPlayer from "react-player";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CANALES_STREAMING = [
  {
    nombre: "Twitch Gaming",
    url: "https://www.twitch.tv/twitch",
    imagen: "https://static-cdn.jtvnw.net/jtv_user_pictures/twitch-profile_image-8a8c5be2e3b64a9a-300x300.png"
  },
  {
    nombre: "prueba",
    url: "https://www.twitch.tv/esl_csgo",
    imagen: "https://static-cdn.jtvnw.net/jtv_user_pictures/esl_csgo-profile_image-49a81b819dbd3ef7-300x300.png"
  },
  // Puedes agregar más canales aquí
];

export default function CalendarPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");

  const handlePlay = (url?: string) => {
    const urlToPlay = url || videoUrl;
    if (urlToPlay) {
      setCurrentUrl(urlToPlay);
      setVideoUrl(urlToPlay);
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Reproductor de Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Ingrese la URL del video..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={() => handlePlay()}>Reproducir</Button>
              </div>

              <div className="aspect-video bg-black/5 rounded-lg overflow-hidden">
                {currentUrl ? (
                  <ReactPlayer
                    url={currentUrl}
                    width="100%"
                    height="100%"
                    controls
                    playing
                    config={{
                      youtube: {
                        playerVars: { showinfo: 1 }
                      },
                      file: {
                        attributes: {
                          controlsList: 'nodownload'
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Ingrese una URL para reproducir el video
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Canales Destacados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {CANALES_STREAMING.map((canal) => (
                  <button
                    key={canal.url}
                    className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg transition-colors"
                    onClick={() => handlePlay(canal.url)}
                  >
                    <img 
                      src={canal.imagen} 
                      alt={canal.nombre}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <h3 className="font-medium">{canal.nombre}</h3>
                      <p className="text-sm text-muted-foreground truncate">{canal.url}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}
