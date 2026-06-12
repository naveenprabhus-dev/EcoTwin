import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, MessageCircle, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface AICoachProps {
  userId: string;
  companionName: string;
  score: number;
}

export default function AICoach({ userId, companionName, score }: AICoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello! I'm **${companionName}**, your virtual Carbon Companion and Sustainability Coach. 🌿\n\nI can analyze your carbon breakdown, suggest personalized daily optimizations, and answer your ecological Q&As!\n\nWhat would you like to discuss today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          messages: [...messages, userMsg].map(m => ({
            role: m.sender === 'ai' ? 'assistant' : 'user',
            text: m.text
          }))
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          id: Math.random().toString(36).substring(2),
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error(data.error || 'Server returned failure');
      }
    } catch (err: any) {
      console.error('Failed to communicate with AI Coach:', err);
      // Fallback response with beautiful markdown tips
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(2),
        sender: 'ai',
        text: `### 🌿 Environmental Tip\n\nI encountered a brief connection hiccup, but let's talk conservation! Your score is **${score}/100**.\n\n* **Reduce Electricity**: Shutting down appliances saves up to 10% of monthly standby power.\n* **Travel Light**: Walking or cycling inside blocks cuts single-car commute pollutants entirely!\n\nFeel free to retry or ask another question!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    "How can I reduce my transportation emissions?",
    "Which foods have the lowest carbon footprints?",
    "Is cycling better than buses for commute metrics?",
    "How does segregating waste save atmosphere carbon?"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-[32px] overflow-hidden shadow-xs border border-art-border min-h-[580px]">
      
      {/* Sidebar - Quick Prompts */}
      <div className="md:col-span-4 bg-[#F9FAF8]/60 p-6 border-r border-art-border flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-art-olive" />
            <h3 className="font-serif italic font-bold text-art-dark text-lg">Suggested Q&A</h3>
          </div>
          <p className="text-xs text-art-olive leading-relaxed font-semibold">
            Click one of these presets to ask {companionName} for direct coaching metrics.
          </p>

          <div className="space-y-2.5 pt-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="w-full text-left text-xs bg-white border border-art-border p-3.5 rounded-xl hover:bg-art-pale hover:text-art-dark hover:border-art-sage transition-all cursor-pointer text-art-text leading-relaxed font-bold"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-art-pale border border-art-border rounded-[20px] p-4 mt-6">
          <div className="flex items-center gap-1.5 text-xs font-black text-art-dark">
            <Sparkles className="w-3.5 h-3.5 text-art-olive" />
            <span>AI Eco Coach Active</span>
          </div>
          <p className="text-[10px] text-art-olive font-bold leading-relaxed mt-1">
            Analyzing current user stats inside Gemini context to supply personalized, localized recommendations!
          </p>
        </div>
      </div>

      {/* Main Chat Feed */}
      <div className="md:col-span-8 bg-white flex flex-col h-[520px] md:h-[580px]">
        
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-art-border flex justify-between items-center bg-[#F9FAF8]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-art-pale text-art-dark rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif italic font-bold text-art-dark text-base">{companionName} Q&A Engine</h4>
              <span className="text-[10px] text-art-olive font-bold font-mono flex items-center gap-1">
                ● ACTIVE • SCORE: {score}/100
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic messages scroll area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(msg => {
            const isAI = msg.sender === 'ai';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar Icon */}
                <div className={`p-2 rounded-full h-9 w-9 flex items-center justify-center shrink-0 ${
                  isAI ? 'bg-art-pale text-art-dark border border-art-border' : 'bg-art-cream text-art-olive border border-art-border'
                }`}>
                  {isAI ? <MessageCircle className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble message content */}
                <div className="space-y-1">
                  <div className={`px-4 py-3 rounded-[20px] text-xs leading-relaxed font-sans whitespace-pre-wrap ${
                    isAI 
                      ? 'bg-art-cream text-art-dark border border-art-border rounded-tl-none font-medium' 
                      : 'bg-art-dark text-white rounded-tr-none font-semibold shadow-xs'
                  }`}>
                    {/* Simplified markdown formatter for coaching responses */}
                    {msg.text.split('\n').map((line, lineIdx) => {
                      if (line.startsWith('###')) {
                        return <h4 key={lineIdx} className="font-serif italic font-bold text-sm my-1.5 text-art-dark">{line.replace('###', '')}</h4>;
                      } else if (line.startsWith('*') || line.startsWith('-')) {
                        return (
                          <div key={lineIdx} className="flex gap-1.5 ml-2 mt-1">
                            <span className="text-art-olive font-black">•</span>
                            <span>{line.substring(2)}</span>
                          </div>
                        );
                      }
                      return <p key={lineIdx} className="mt-1 leading-relaxed">{line}</p>;
                    })}
                  </div>
                  <span className={`text-[9px] font-mono block ${isAI ? 'text-art-olive/60 text-left' : 'text-art-olive/60 text-right'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 mr-auto items-center">
              <div className="p-2 bg-art-pale text-art-dark rounded-full h-9 w-9 flex items-center justify-center animate-bounce">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-art-cream rounded-2xl px-4 py-3 border border-art-border text-xs flex items-center gap-1.5 text-art-olive">
                <span className="w-1.5 h-1.5 bg-art-sage rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-art-sage rounded-full animate-pulse" style={{ delay: '0.2s' }} />
                <span className="w-1.5 h-1.5 bg-art-sage rounded-full animate-pulse" style={{ delay: '0.4s' }} />
                <span className="font-medium">{companionName} is calculating metrics...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Text Form */}
        <div className="p-4 border-t border-art-border bg-art-cream/60">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMessage); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask ${companionName} for energy savings & footprint reduction tips...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-white font-sans text-xs px-4 py-3 rounded-xl border border-art-border focus:border-art-dark focus:outline-none text-art-dark font-medium"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className={`p-3 rounded-xl shadow-xs cursor-pointer transition-all ${
                !inputMessage.trim() || isLoading
                  ? 'bg-art-cream/40 text-art-olive/45 border border-art-border pointer-events-none'
                  : 'bg-art-dark hover:bg-art-forest text-white hover:scale-[1.02]'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
