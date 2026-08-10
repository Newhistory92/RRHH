"use client";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/app/util/apiClient";

interface HRChatbotProps {
  onBack: () => void;
}

type MessageRole = "user" | "assistant";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
}

interface ChatResponse {
  result: string;
}

export const HRChatbot = ({ onBack }: HRChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content:
        "¡Hola! Soy el asistente de RRHH. Puedo consultarle a la base de datos sobre empleados, estadísticas, departamentos, licencias y documentos. ¿En qué te puedo ayudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll al último mensaje cada vez que cambia la lista
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const texto = input.trim();
    if (!texto || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: texto,
    };

    // Historial actualizado que se envía al backend (todos los mensajes, incluyendo el nuevo)
    const historialActualizado = [...messages, userMsg];
    setMessages(historialActualizado);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const data = await apiClient.post<ChatResponse>("/chat", {
        messages: historialActualizado.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.result,
        },
      ]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) handleSend();
  };

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
        Chatbot de RRHH
      </h2>
      <p className="text-muted-foreground mb-8">
        Consulta datos reales de empleados, estadísticas y documentos.
      </p>

      <div className="bg-card rounded-lg shadow-md h-[500px] flex flex-col">
        {/* Historial */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-muted text-foreground rounded-bl-none">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Consultando base de datos
                  </span>
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-destructive/10 text-destructive rounded-bl-none">
                <p className="font-semibold text-sm">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={
              isLoading ? "Esperando respuesta..." : "Escribe tu pregunta..."
            }
            className="flex-1 bg-muted border-transparent focus:ring-2 focus:ring-primary focus:border-transparent rounded-full py-2 px-4 outline-none disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-primary text-primary-foreground rounded-full p-3 hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
