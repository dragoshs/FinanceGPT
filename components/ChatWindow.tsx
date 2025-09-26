import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageRole } from '../types';
import { UserIcon, BotIcon, SendIcon, PaperclipIcon, MicrophoneIcon, CloseIcon } from './icons';
import { useLiveChat } from '../hooks/useLiveChat';
import { useI18n } from '../i18n';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, isPlayground: boolean, image?: { data: string, mimeType: string }) => void;
  isLoading: boolean;
  isPlaygroundMode: boolean;
  onPlaygroundModeChange: (isPlayground: boolean) => void;
  onNewMessage: (message: ChatMessage) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, isPlaygroundMode, onPlaygroundModeChange, onNewMessage }) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<{ data: string, mimeType: string, name: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const { isRecording, startConversation, stopConversation } = useLiveChat({ onNewMessage });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !isRecording) {
      onSendMessage(input.trim(), isPlaygroundMode, image || undefined);
      setInput('');
      setImage(null);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({
          data: (reader.result as string).split(',')[1],
          mimeType: file.type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopConversation();
    } else {
      startConversation();
    }
  };

  const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === MessageRole.USER;

    return (
      <div className={`flex items-start gap-4 my-5`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-500' : 'bg-teal-500'}`}>
          {isUser ? <UserIcon className="w-6 h-6 text-white" /> : <BotIcon className="w-6 h-6 text-white" />}
        </div>
        <div
          className={`p-4 rounded-lg max-w-lg shadow-sm whitespace-pre-wrap ${isUser ? 'bg-indigo-50 text-slate-700 dark:bg-indigo-900/50 dark:text-slate-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}
        >
          {message.content}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-[70vh]">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t('chat.title')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {isPlaygroundMode ? t('chat.subtitlePlayground') : t('chat.subtitleNormal')}
            </p>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('chat.playgroundLabel')}</span>
            <button onClick={() => onPlaygroundModeChange(!isPlaygroundMode)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPlaygroundMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPlaygroundMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
        {isLoading && !isRecording && (
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
        {image && (
            <div className="mb-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300 font-medium truncate pr-2">{image.name}</span>
                <button onClick={() => setImage(null)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600">
                    <CloseIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label={t('chat.attachReceipt')}
          >
              <PaperclipIcon className="w-5 h-5"/>
          </button>
          <input
            type="text"
            value={isRecording ? t('chat.listening') : input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.inputPlaceholder')}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            disabled={isLoading || isRecording}
            aria-label="Chat input"
          />
          <button
            type="button"
            onClick={handleMicClick}
            className={`p-2.5 rounded-full text-white transition-colors ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600'}`}
            aria-label={isRecording ? t('chat.stopRecording') : t('chat.startRecording')}
          >
              <MicrophoneIcon className="w-5 h-5" />
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading || isRecording}
            aria-label={t('chat.sendMessage')}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;