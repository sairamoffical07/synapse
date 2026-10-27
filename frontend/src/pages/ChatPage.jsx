import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, RotateCcw } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { ChatMessage } from '../components/chat/ChatMessage';
import { SuggestedPrompts } from '../components/chat/SuggestedPrompts';
import { aiApi } from '../api/ai';

export const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello, I’m Synapse. Ask me anything about the materials in your library and I’ll answer from those documents, citing the passages I used.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
      inputRef.current?.focus();
    }
  };

  const handleClearChat = () => {
    setError(null);
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
    // Fills the viewport below the header (4rem + 2px border), minus main's vertical padding.
    <div className="flex flex-col gap-5 h-[calc(100dvh-8rem-2px)] min-h-[32rem] lg:h-[calc(100dvh-10rem-2px)]">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="inline-block px-2 py-0.5 bg-sage border-2 border-black rounded-md text-[13px] font-bold uppercase tracking-wider text-black">
            Ask Synapse
          </p>
          <h1 className="text-3xl sm:text-4xl leading-tight text-black">Questions about your materials</h1>
          <p className="hidden sm:block text-[15px] text-gray-700">
            Answers are grounded in your library and list the passages they draw from.
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={RotateCcw} onClick={handleClearChat} aria-label="Start a new conversation">
          <span className="hidden sm:inline">New conversation</span>
        </Button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-white border-2 border-black rounded-xl shadow-brut-lg overflow-hidden">
        {/* Conversation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-7" aria-live="polite" aria-relevant="additions">
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

        {/* Composer */}
        <div className="px-3 pt-3 pb-4 sm:px-5 space-y-3 bg-yellow border-t-2 border-black">
          {error && <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert>}

          <SuggestedPrompts onSelectPrompt={(prompt) => handleSendMessage(prompt)} disabled={loading} />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 p-1.5 pl-4 bg-white border-2 border-black rounded-lg focus-within:shadow-brut transition-shadow"
          >
            <label htmlFor="chat-input" className="sr-only">Ask a question about your materials</label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              autoComplete="off"
              placeholder="Ask a question about your materials…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 min-w-0 h-10 bg-transparent text-base font-medium text-black outline-none focus-visible:outline-none disabled:text-gray-400"
            />

            <Button
              type="submit"
              variant="dark"
              disabled={!input.trim() || loading}
              isLoading={loading}
              icon={ArrowUp}
              aria-label="Send question"
            >
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
