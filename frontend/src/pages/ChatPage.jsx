import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { ChatMessage } from '../components/chat/ChatMessage';
import { SuggestedPrompts } from '../components/chat/SuggestedPrompts';
import { aiApi } from '../api/ai';

export const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello. I am Synapse AI. Ask me questions about your uploaded study materials, and I will generate grounded answers with precise document source citations.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await aiApi.sendChat(textToSend);
      if (res.success && res.data) {
        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: res.data.answer || 'No text answer returned.',
          sources: res.data.sources || [],
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setError(res.message || 'Failed to generate AI response. Make sure materials are uploaded.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: 'Conversation cleared. Ask a new question based on your uploaded study materials.',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] bg-[#111726] border border-[#26334a] rounded-xl overflow-hidden">
      {/* Workspace Header */}
      <div className="p-3.5 px-4 bg-[#0b0f17]/60 border-b border-[#26334a] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-950/50 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-200">Grounded Knowledge Workspace</h2>
            <p className="text-[10px] text-slate-400">Gemini 1.5 Flash + ChromaDB Vector RAG</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#182032] transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && (
          <ChatMessage
            message={{
              id: 'thinking',
              sender: 'ai',
              isThinking: true,
            }}
          />
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompts & Input Area */}
      <div className="p-3.5 bg-[#0b0f17]/80 border-t border-[#26334a] space-y-2">
        {error && (
          <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <SuggestedPrompts onSelectPrompt={(prompt) => handleSendMessage(prompt)} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask a question about your uploaded materials..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-[#111726] border border-[#26334a] focus:border-blue-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
          />

          <Button
            type="submit"
            variant="primary"
            disabled={!input.trim() || loading}
            isLoading={loading}
            icon={Send}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
