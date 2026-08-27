'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

export interface ChatMarkdownProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

export function ChatMarkdown({ content, className, isUser = false }: ChatMarkdownProps) {
  if (!content) return null;

  return (
    <div
      className={cn(
        'text-xs sm:text-sm leading-relaxed max-w-none break-words overflow-hidden',
        isUser ? 'text-white' : 'text-text',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Paragraphs
          p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,

          // Headings
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-bold text-text mt-4 mb-2 first:mt-0 pb-1.5 border-b border-border/50">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold text-text mt-3.5 mb-2 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-bold text-text mt-3 mb-1.5 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-bold text-text mt-2.5 mb-1 first:mt-0">
              {children}
            </h4>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-5 sm:pl-6 space-y-1.5 my-2.5 text-text">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-5 sm:pl-6 space-y-1.5 my-2.5 text-text">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-signal-blue bg-surface-2/70 dark:bg-surface-2/40 px-4 py-2.5 my-3 rounded-r-2xl text-text leading-relaxed">
              {children}
            </blockquote>
          ),

          // Horizontal rule
          hr: () => <hr className="my-3.5 border-t border-border/80" />,

          // Emphasis
          strong: ({ children }) => (
            <strong className={cn('font-bold', isUser ? 'text-white' : 'text-text')}>
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,

          // Code
          code: ({ inline, className: codeClassName, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className={cn(
                    'px-2 py-0.5 rounded-lg font-mono text-[11px] sm:text-xs',
                    isUser
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-2 text-signal-blue border border-border/60 font-semibold'
                  )}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre
                className={cn(
                  'p-3.5 rounded-xl font-mono text-[11px] sm:text-xs overflow-x-auto my-3',
                  isUser
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-surface-2/90 border border-border text-text'
                )}
              >
                <code {...props}>{children}</code>
              </pre>
            );
          },

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'underline font-medium hover:opacity-80 transition-opacity',
                isUser ? 'text-white font-bold' : 'text-signal-blue'
              )}
            >
              {children}
            </a>
          ),

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-border">
              <table className="min-w-full divide-y divide-border text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-surface-2/80 font-bold">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-border/60">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-surface-2/30 transition-colors">{children}</tr>,
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 text-left font-bold text-text uppercase tracking-wider text-[10px]">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="px-3.5 py-2 text-text">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
