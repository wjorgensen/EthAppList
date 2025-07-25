import Markdown from "@/components/Markdown";

interface MarkdownSectionProps {
  title: string;
  content: string;
}

export default function MarkdownSection({ title, content }: MarkdownSectionProps) {
  if (!content) return null;

  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {title}
      </h2>
      <Markdown content={content} />
    </section>
  );
} 