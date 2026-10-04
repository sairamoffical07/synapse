import React from 'react';
import { Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { SourceCitation } from './SourceCitation';

export const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  const isThinking = message.isThinking;

  return (
    <div className={`flex items-start gap-3 text-xs leading-relaxed ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
          isUser
            ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
            : 'bg-indigo-950/40 border-indigo-800/40 text-indigo-400'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      <div
        className={`max-w-2xl rounded-xl p-4 border ${
          isUser
            ? 'bg-blue-600/15 border-blue-500/20 text-slate-100 rounded-tr-none'
            : 'bg-[#111726] border-[#26334a] text-slate-200 rounded-tl-none'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-400 mb-1.5 tracking-wider uppercase">
            <Sparkles className="w-3 h-3" />
            <span>SYNAPSE AI</span>
          </div>
        )}

        {isThinking ? (
          <div className="flex items-center gap-2 text-slate-400 py-1">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span>Analyzing your study materials & generating grounded answer...</span>
          </div>
        ) : (
          <div className="whitespace-pre-wrap space-y-2 text-slate-200">
            {message.text}
          </div>
        )}

        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceCitation sources={message.sources} />
        )}

        <div className="mt-2 text-[10px] text-slate-400 text-right">
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>
    </div>
  );
};
