import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Message as MessageType } from "@/types";
import { cn } from "@/lib/utils";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full gap-4 px-6 py-4 transition-smooth",
        isUser ? "justify-end" : "justify-start hover:bg-message-hover"
      )}
    >
      <div
        className={cn(
          "max-w-3xl rounded-xl px-6 py-4 shadow-card",
          isUser
            ? "gradient-primary text-primary-foreground"
            : "bg-assistant-message border border-border"
        )}
      >
        {!isUser && message.metadata && (
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {message.metadata.model}
            </span>
            <span className="text-xs text-muted-foreground">
              {message.metadata.provider}
            </span>
          </div>
        )}

        <div className="prose prose-invert max-w-none">
          {isUser ? (
            <p className="whitespace-pre-wrap text-foreground">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { children, className, node, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || "");
                  const codeString = String(children).replace(/\n$/, "");
                  const isInline = !match;

                  if (isInline) {
                    return (
                      <code className={cn("rounded bg-muted px-1.5 py-0.5", className)} {...rest}>
                        {children}
                      </code>
                    );
                  }

                  return (
                    <div className="group relative">
                      <button
                        onClick={() => copyCode(codeString)}
                        className="absolute right-2 top-2 rounded-md bg-muted p-2 opacity-0 transition-all hover:bg-muted-foreground/20 group-hover:opacity-100"
                      >
                        {copiedCode === codeString ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <SyntaxHighlighter
                        style={oneDark as any}
                        language={match ? match[1] : "text"}
                        PreTag="div"
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
}
