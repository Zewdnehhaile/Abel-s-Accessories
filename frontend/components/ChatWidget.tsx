import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Bot } from 'lucide-react';
import { sendMessageToGemini } from '../services/aiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const ChatWidget: React.FC<{ isOnline: boolean }> = ({ isOnline }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! I am AB, Abel\'s AI assistant. How can I help you today?', sender: 'bot' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await sendMessageToGemini(userMsg.text);
      const botMsg: Message = { id: (Date.now() + 1).toString(), text: responseText, sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I can't connect right now.", sender: 'bot' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[var(--primary)] to-purple-600 p-4 flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-none">AB Assistant</h3>
                <span className="text-[10px] text-white/80 flex items-center gap-1 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-body)]">
             {messages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                   msg.sender === 'user' 
                     ? 'bg-[var(--primary)] text-white rounded-tr-none shadow-md font-medium' 
                     : 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border)] rounded-tl-none'
                 }`}>
                   {msg.text}
                 </div>
               </div>
             ))}
             {isTyping && (
               <div className="flex justify-start">
                 <div className="bg-[var(--bg-card)] border border-[var(--border)] p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                   <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce"></span>
                   <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                   <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                 </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[var(--bg-card)] border-t border-[var(--border)] flex gap-2">
             <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask AB anything..." 
              className="flex-1 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
             />
             <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md flex items-center justify-center"
             >
                <Send size={18} />
             </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-[var(--bg-card)] rotate-90' : 'bg-[var(--primary)] rotate-0'} text-white p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center`}
      >
        {isOpen ? <X size={28} className="text-[var(--text-main)]" /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default ChatWidget;