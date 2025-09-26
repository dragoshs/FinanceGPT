import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageRole } from '../types';
import { UserIcon, BotIcon, SendIcon } from './icons';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === MessageRole.USER;
    const contentWithBreaks = message.content.replace(/\n/g, '<br />');

    return (
      <div className={`flex items-start gap-4 my-5`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-500' : 'bg-teal-500'}`}>
          {isUser ? <UserIcon className="w-6 h-6 text-white" /> : <BotIcon className="w-6 h-6 text-white" />}
        </div>
        <div
          className={`p-4 rounded-lg max-w-lg shadow-sm ${isUser ? 'bg-indigo-50 text-slate-700 dark:bg-indigo-900/50 dark:text-slate-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}
          dangerouslySetInnerHTML={{ __html: contentWithBreaks }}
        >
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-[70vh]">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">FinanceGPT Assistant</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Ask me anything about your finances</p>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
        {isLoading && (
            <div className="flex items-start gap-4 my-5">
                 <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                    <BotIcon className="w-6 h-6 text-white" />
                 </div>
                 <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 shadow-sm">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-xl">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Log an expense e.g., 'spent $25 on lunch'"
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            disabled={isLoading}
            aria-label="Chat input"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading}
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;