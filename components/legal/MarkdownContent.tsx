import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownContentProps {
  filePath: string;
}

export default function MarkdownContent({ filePath }: MarkdownContentProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(filePath)
      .then((res) => res.text())
      .then((text) => {
        // Remove any form-related HTML elements that might trigger validation
        const sanitizedText = text.replace(/<form[^>]*>.*?<\/form>/g, "");
        setContent(sanitizedText);
      })
      .catch((error) => console.error("Error loading markdown:", error))
      .finally(() => setIsLoading(false));
  }, [filePath]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="prose prose-headings:text-gray-900 prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-600 prose-a:text-orange-600 hover:prose-a:text-orange-500 prose-strong:text-gray-900 prose-ul:text-gray-600 prose-li:marker:text-gray-400 dark:prose-headings:text-white dark:prose-p:text-gray-300 dark:prose-strong:text-white dark:prose-ul:text-gray-300 dark:prose-li:marker:text-gray-500">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
