// components/Markdown.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

type Props = { content: string };

export default function Markdown({ content }: Props) {
  return (
    <article className="prose prose-slate max-w-none dark:prose-invert">
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,           // remove if you *never* allow raw HTML
          rehypeSanitize,      // keep things safe
        ]}
        components={{
          // tweak individual tags if you want custom Tailwind classes
          a: ({node, ...props}) => (
            <a {...props} className="text-blue-500 hover:underline" />
          ),
        }}
      />
    </article>
  );
} 