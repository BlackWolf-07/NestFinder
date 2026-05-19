import { useState, useEffect, useRef } from 'react';
import { generalAssistant } from '../api/ai';

export default function GlobalAssistant({ onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hey! I'm your NestFinder scout. Tell me what you're looking for! (e.g. 'Find a 2BHK in Mumbai under ₹45,000')" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await generalAssistant(input);
      setMessages(prev => [...prev, { role: 'ai', text: res.reply }]);
      
      if (res.filters && Object.keys(res.filters).length > 0) {
        onFilterChange(res.filters);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having a bit of trouble searching right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1000]">
      {isOpen ? (
        <div className="bg-white rounded-3xl shadow-2xl border w-[350px] sm:w-[400px] flex flex-col h-[500px] overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-primary p-5 text-white font-bold flex justify-between items-center shadow-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">🤖</div>
              NestFinder Scout
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition duration-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-secondary text-white rounded-tr-none' 
                    : 'bg-blue-50 text-secondary border border-blue-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-blue-50 p-4 rounded-2xl rounded-tl-none flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={scrollRef}></div>
          </div>

          <form onSubmit={handleSend} className="p-4 bg-gray-50 border-t flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your search request..."
              className="flex-1 p-3 bg-white border rounded-2xl outline-none focus:ring-2 focus:ring-primary text-sm shadow-inner"
            />
            <button className="bg-primary text-white p-3 rounded-2xl hover:scale-110 active:scale-95 transition shadow-lg shadow-blue-500/30">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition duration-300 group relative"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none shadow-xl">
            Ask AI Scout
          </span>
        </button>
      )}
    </div>
  );
}
