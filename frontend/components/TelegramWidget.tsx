import React, { useState } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';

interface TelegramWidgetProps {
  isOnline: boolean;
}

const TelegramWidget: React.FC<TelegramWidgetProps> = ({ isOnline }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-72 bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
          <div className="bg-brand-500 p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white">Chat with Abel</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isOnline ? 'bg-green-500 text-white' : 'bg-gray-400 text-gray-800'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-brand-600 p-1 rounded">
              <X size={18} />
            </button>
          </div>
          <div className="p-4 h-64 overflow-y-auto bg-dark-900 flex flex-col gap-3">
             <div className="self-start bg-dark-700 text-gray-200 p-2 rounded-lg rounded-tl-none max-w-[80%] text-sm">
                Hello! Welcome to Abel Accessories. How can I help you today?
             </div>
             {!isOnline && (
                <div className="self-center bg-yellow-900/30 text-yellow-500 text-xs p-2 rounded border border-yellow-800/50">
                   Abel is currently offline. Replies may be delayed.
                </div>
             )}
          </div>
          <div className="p-3 bg-dark-800 border-t border-dark-700 flex gap-2">
             <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
             />
             <button className="bg-brand-500 hover:bg-brand-600 text-white p-2 rounded-lg transition-colors">
                <Send size={18} />
             </button>
          </div>
          <div className="px-4 py-2 bg-dark-900 text-center border-t border-dark-700">
             <a href="https://t.me/@babi19ab" target="_blank" rel="noreferrer" className="text-xs text-brand-500 hover:underline">
               Open in Telegram App
             </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-dark-700' : 'bg-brand-500 hover:bg-brand-600'} text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2`}
      >
        <MessageCircle size={28} />
        {!isOpen && <span className="font-medium hidden md:inline pr-1">Chat Support</span>}
      </button>
    </div>
  );
};

export default TelegramWidget;
