'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useChat, { UIMessage } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { Message, SupportedModel, supportedModels } from '@repo/api';
import { ArrowUp, Check, Copy, Loader, LoaderCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github.css'; // o cualquier tema
import 'github-markdown-css/github-markdown-light.css';
import { useIsMobile } from '@/hooks/use-mobile';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import rehypeSanitize from 'rehype-sanitize';
// `rehype-katex` does not import the CSS for you
import 'katex/dist/katex.min.css';
import { ResponsiveSelect } from './responsive-select';
import { useSidebar } from './ui/sidebar';

// Custom Copy Button Component
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        bg-transparent 
        border-none 
        cursor-pointer 
        p-1
        inline-flex 
        items-center 
        justify-center
      `}
    >
      {copied ? (
        <Check size={16} color="#22c55e" /> // Green color when copied
      ) : (
        <Copy size={16} color="#94a3b8" /> // Default color
      )}
    </button>
  );
};

export default function ChatInterface({
  thread,
  history,
}: {
  thread?: string;
  history?: Message[];
}) {
  const [textareaHeight, setTextareaHeight] = useState(24); // Add this line
  const {
    messages,
    addMessage,
    inputValue,
    setInputValue,
    loading,
    hasTyped,
    setHasTyped,
    selectedModel,
    setSelectedModel,
  } = useChat({ thread, history });

  const { state: sidebarState } = useSidebar();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // Focus the textarea on component mount (only on desktop)
  useEffect(() => {
    console.log(isMobile);
    if (textareaRef.current && typeof isMobile !== 'undefined' && !isMobile) {
      textareaRef.current.focus();
    }
  }, [isMobile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Only allow input changes when not streaming
    if (!loading) {
      setInputValue(newValue);

      if (newValue.trim() !== '' && !hasTyped) {
        setHasTyped(true);
      } else if (newValue.trim() === '' && hasTyped) {
        setHasTyped(false);
      }

      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        const newHeight = Math.max(24, Math.min(textarea.scrollHeight, 320));
        textarea.style.height = `${newHeight}px`;
        setTextareaHeight(newHeight);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMessage({
      role: 'user',
      content: inputValue,
    });
    setInputValue('');
    // Reset textarea height to default
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    // Reset the textarea height state to default
    setTextareaHeight(24);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Cmd+Enter on both mobile and desktop
    if (!loading && e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      setInputValue(inputValue + '\n');
      return;
    }

    // Only handle regular Enter key (without Shift) on desktop
    if (!loading && !isMobile && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const renderMessage = (message: UIMessage, index: number) => {
    return (
      <div
        key={index}
        className={cn(
          'flex flex-col',
          message.role === 'user' ? 'items-end' : 'items-start',
        )}
      >
        <div
          className={cn(
            'w-full max-w-4xl px-4 py-2 rounded-2xl',
            message.role === 'user'
              ? 'bg-white border border-gray-200 rounded-br-none'
              : 'text-gray-900',
          )}
        >
          {message.role === 'user' && message.content && (
            <span>
              {message.content.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < message.content.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </span>
          )}
          {message.role === 'assistant' && !message.content && (
            <>
              <LoaderCircle className="h-5 w-5 animate-spin" />
            </>
          )}
          {message.role === 'assistant' && message.content && (
            <>
              <div className={cn('markdown-body')}>
                <Markdown
                  rehypePlugins={[
                    rehypeSanitize,
                    rehypeHighlight,
                    rehypeRaw,
                    rehypeKatex,
                  ]}
                  remarkPlugins={[remarkMath]}
                  components={{
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    code: ({ node, className, children, ...props }) => {
                      // Properly extract text content from children
                      const getText = (children: React.ReactNode): string => {
                        if (typeof children === 'string') return children;
                        if (Array.isArray(children)) {
                          return children
                            .map((child) =>
                              typeof child === 'string'
                                ? child
                                : getText(child.props?.children),
                            )
                            .join('');
                        }
                        return '';
                      };

                      const code = getText(children).replace(/\n$/, '');

                      const inline = !className?.includes('language-');

                      // If the code block is a single line, don't show the copy button
                      if (inline) {
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }

                      return (
                        <div style={{ position: 'relative' }}>
                          <div className="absolute top-0 right-0">
                            <CopyButton text={code} />
                          </div>
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </div>
                      );
                    },
                  }}
                >
                  {message.content}
                </Markdown>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add new useEffect for auto-scrolling
  const autoScroll = useRef<boolean>(true);

  // Add new useEffect for initial render scroll
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []); // Empty dependency array for initial render only

  // Existing useEffect for auto-scrolling during chat
  useEffect(() => {
    if (!messagesEndRef.current) return;
    if (autoScroll.current && loading) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    autoScroll.current = true;
  }, [loading]);

  const onManualScroll = () => {
    autoScroll.current = false;
  };

  return (
    <div className="flex flex-col overflow-hidden h-full">
      {/* Chat messages */}
      <div
        className={`flex-grow pt-12 px-4`}
        style={{ paddingBottom: `${textareaHeight + 104}px` }}
        onWheel={onManualScroll}
        onTouchMove={onManualScroll}
      >
        {messages.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <div key={index}>
                <div className="pt-4 flex flex-col justify-start">
                  {renderMessage(message, index)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <h1
              className={cn(
                'text-2xl font-semibold mb-8 text-gray-500 sm:text-gray-900',
              )}
            >
              Start chatting
            </h1>
            <div className="hidden sm:block w-full max-w-2xl">
              <form onSubmit={handleSubmit} className="w-full">
                <div
                  className={cn(
                    'relative w-full rounded-3xl border border-gray-200 bg-white/70 backdrop-blur-sm p-3 cursor-text',
                    loading && 'opacity-80',
                  )}
                >
                  <div className="pb-12">
                    <Textarea
                      ref={textareaRef}
                      placeholder={
                        loading ? 'Waiting for response...' : 'Ask Anything'
                      }
                      className="min-h-[24px] max-h-[320px] w-full rounded-3xl border-0 bg-transparent text-gray-900 placeholder:text-gray-400 placeholder:text-base focus-visible:ring-0 focus-visible:ring-offset-0 text-base pl-2 pr-4 pt-0 pb-0 resize-none overflow-y-auto leading-tight"
                      value={inputValue}
                      disabled={loading}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                    />
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Select
                          value={selectedModel}
                          onValueChange={(value) =>
                            setSelectedModel(value as SupportedModel)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger className="h-8 text-sm bg-transparent focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {supportedModels.map((model) => (
                                <SelectItem key={model.key} value={model.key}>
                                  <span>{model.displayName}</span>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        className={cn(
                          'rounded-full h-8 w-8 border-0 flex-shrink-0 transition-all duration-200',
                          hasTyped
                            ? 'bg-black scale-110 hover:bg-slate-900 cursor-pointer'
                            : 'bg-gray-200',
                        )}
                        disabled={!inputValue.trim() || loading}
                      >
                        <ArrowUp
                          className={cn(
                            'h-4 w-4 transition-colors',
                            hasTyped ? 'text-white' : 'text-gray-500',
                          )}
                        />
                        <span className="sr-only">Submit</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Text area */}
      
        <div
          className={cn(
            'fixed bottom-0 left-0 right-0 p-4',
            !isMobile && sidebarState === 'expanded' ? 'pl-[17rem]' : '',
            messages.length > 0 || isMobile ? '' : 'hidden'
          )}
        >
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto ">
            <div
              className={cn(
                'relative w-full rounded-3xl border border-gray-200 bg-white/70 backdrop-blur-sm p-3 cursor-text ',
                loading && 'opacity-80',
              )}
            >
              <div className="pb-12">
                <Textarea
                  ref={textareaRef}
                  placeholder={
                    loading ? 'Waiting for response...' : 'Ask Anything'
                  }
                  className="min-h-[24px] max-h-[320px] w-full rounded-3xl border-0 bg-transparent text-gray-900 placeholder:text-gray-400 placeholder:text-base focus-visible:ring-0 focus-visible:ring-offset-0 text-base pl-2 pr-4 pt-0 pb-0 resize-none overflow-y-auto leading-tight"
                  value={inputValue}
                  disabled={loading}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    // Ensure the textarea is scrolled into view when focused
                    if (textareaRef.current) {
                      textareaRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      });
                    }
                  }}
                />
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ResponsiveSelect
                      value={selectedModel}
                      onValueChange={(value) =>
                        setSelectedModel(value as SupportedModel)
                      }
                      options={supportedModels.map((model) => ({
                        value: model.key,
                        label: model.displayName,
                      }))}
                      disabled={loading}
                      triggerClassName="h-8 text-sm bg-transparent focus:ring-0"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    size="icon"
                    className={cn(
                      'rounded-full h-8 w-8 border-0 flex-shrink-0 transition-all duration-200',
                      hasTyped
                        ? 'bg-black scale-110 hover:bg-slate-900 cursor-pointer'
                        : 'bg-gray-200',
                    )}
                    disabled={!inputValue.trim() || loading}
                  >
                    <ArrowUp
                      className={cn(
                        'h-4 w-4 transition-colors',
                        hasTyped ? 'text-white' : 'text-gray-500',
                      )}
                    />
                    <span className="sr-only">Submit</span>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>

    </div>
  );
}
