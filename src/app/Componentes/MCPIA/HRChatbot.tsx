import { ArrowLeft, Send } from "lucide-react";
import { useState } from "react";

interface HRChatbotProps {
  onBack: () => void;
}

type MessageRole = 'user' | 'assistant';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
}
export const HRChatbot = ({ onBack }: HRChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: '¡Hola! Soy tu asistente de RRHH. ¿En qué puedo ayudarte hoy? Puedes preguntar sobre políticas de vacaciones, beneficios, o estado de tus solicitudes.' }
  ]);
  const [input, setInput] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
  const handleSend = async () => {
    if (input.trim() === '') return;

     const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
   setMessages(prev => [...prev, userMessage]);
    setInput('');

     try {
      // Send request to the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input }],
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      console.log('API response data:', data);
      
      // Add assistant message to the chat
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.result,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error('Error in chat submission:', err);
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setError(`Error: ${(err as { message?: string }).message || 'Unknown error'}`);
      } else {
        setError('Error: Unknown error');
      }
    } finally {
      setIsLoading(false);
    }
  }

   return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={20} />
        Volver
      </button>
      <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Chatbot de RRHH</h2>
      <p className="text-muted-foreground mb-8">Tu asistente virtual para consultas de Recursos Humanos.</p>
      
      <div className="bg-card rounded-lg shadow-md h-[500px] flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-muted text-foreground rounded-bl-none">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Escribiendo</span>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-error-soft text-error-soft-foreground rounded-bl-none">
                <p className="font-bold text-sm">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-border flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isLoading ? "Esperando respuesta..." : "Escribe tu pregunta..."}
            className="flex-1 bg-muted border-transparent focus:ring-2 focus:ring-primary focus:border-transparent rounded-full py-2 px-4 outline-none disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            className="bg-primary text-primary-foreground rounded-full p-3 hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};