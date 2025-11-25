// import { motion } from "framer-motion";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
// import { Check, Copy, FileText, ChevronDown, ChevronUp } from "lucide-react";
// import { useState } from "react";
// import { Message as MessageType } from "@/types";
// import { cn } from "@/lib/utils";
// import { Button } from "./ui/button";

// interface MessageProps {
//   message: MessageType;
// }

// export function Message({ message }: MessageProps) {
//   const [copiedCode, setCopiedCode] = useState<string | null>(null);
//   const [isExpanded, setIsExpanded] = useState(false);

//   const copyCode = (code: string) => {
//     navigator.clipboard.writeText(code);
//     setCopiedCode(code);
//     setTimeout(() => setCopiedCode(null), 2000);
//   };

//   const isUser = message.role === "user";
//   const isSystemSummary =
//     message.role === "system" && message.metadata?.type === "auto_summary";

//   // Special rendering for auto-summary messages
//   if (isSystemSummary) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.95 }}
//         transition={{ duration: 0.3 }}
//         className="mx-auto my-6 max-w-3xl"
//       >
//         <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-lg">
//           <div className="mb-4 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="rounded-lg bg-primary/20 p-2">
//                 <FileText className="h-5 w-5 text-primary" />
//               </div>
//               <div>
//                 <h3 className="font-semibold text-foreground">
//                   📝 Conversation Summary
//                 </h3>
//                 <p className="text-xs text-muted-foreground">
//                   Auto-generated • {message.metadata.originalMessageCount}{" "}
//                   messages summarized
//                 </p>
//               </div>
//             </div>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setIsExpanded(!isExpanded)}
//               className="h-8 w-8 p-0"
//             >
//               {isExpanded ? (
//                 <ChevronUp className="h-4 w-4" />
//               ) : (
//                 <ChevronDown className="h-4 w-4" />
//               )}
//             </Button>
//           </div>

//           {isExpanded && (
//             <motion.div
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               className="prose prose-sm max-w-none overflow-hidden"
//             >
//               <div className="rounded-lg border border-border bg-card p-4">
//                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
//                   {message.content.replace("[CONVERSATION SUMMARY]\n\n", "")}
//                 </ReactMarkdown>
//               </div>
//             </motion.div>
//           )}

//           {!isExpanded && (
//             <p className="text-sm text-muted-foreground">
//               Click to view full summary
//             </p>
//           )}

//           <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
//             <span>⏱️ {new Date(message.timestamp).toLocaleString()}</span>
//             {message.metadata.tokens && (
//               <span>📊 {message.metadata.tokens} tokens</span>
//             )}
//           </div>
//         </div>
//       </motion.div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -10 }}
//       transition={{ duration: 0.3 }}
//       className={cn(
//         "flex w-full gap-4 px-6 py-4",
//         isUser ? "justify-end" : "justify-start"
//       )}
//     >
//       <div
//         className={cn(
//           "max-w-3xl rounded-xl px-6 py-4 shadow-card",
//           isUser
//             ? "gradient-primary text-primary-foreground"
//             : "bg-assistant-message border border-border"
//         )}
//       >
//         {!isUser && message.metadata && (
//           <div className="mb-2 flex items-center gap-2">
//             <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
//               {message.metadata.model}
//             </span>
//             <span className="text-xs text-muted-foreground">
//               {message.metadata.provider}
//             </span>
//           </div>
//         )}

//         <div className="prose prose-invert max-w-none">
//           {isUser ? (
//             <p className="whitespace-pre-wrap text-foreground">
//               {message.content}
//             </p>
//           ) : (
//             <ReactMarkdown
//               remarkPlugins={[remarkGfm]}
//               components={{
//                 code(props) {
//                   const { children, className, node, ...rest } = props;
//                   const match = /language-(\w+)/.exec(className || "");
//                   const codeString = String(children).replace(/\n$/, "");
//                   const isInline = !match;

//                   if (isInline) {
//                     return (
//                       <code
//                         className={cn(
//                           "rounded bg-muted px-1.5 py-0.5",
//                           className
//                         )}
//                         {...rest}
//                       >
//                         {children}
//                       </code>
//                     );
//                   }

//                   return (
//                     <div className="group relative">
//                       <button
//                         onClick={() => copyCode(codeString)}
//                         className="absolute right-2 top-2 rounded-md bg-muted p-2 opacity-0 transition-all hover:bg-muted-foreground/20 group-hover:opacity-100"
//                       >
//                         {copiedCode === codeString ? (
//                           <Check className="h-4 w-4 text-green-500" />
//                         ) : (
//                           <Copy className="h-4 w-4" />
//                         )}
//                       </button>
//                       <SyntaxHighlighter
//                         style={oneDark as any}
//                         language={match ? match[1] : "text"}
//                         PreTag="div"
//                       >
//                         {codeString}
//                       </SyntaxHighlighter>
//                     </div>
//                   );
//                 },
//               }}
//             >
//               {message.content}
//             </ReactMarkdown>
//           )}
//         </div>

//         <div className="mt-2 text-xs text-muted-foreground">
//           {new Date(message.timestamp).toLocaleTimeString()}
//         </div>
//       </div>
//     </motion.div>
//   );
// }
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Check,
  Copy,
  FileText,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check as CheckIcon,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Message as MessageType } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface MessageProps {
  message: MessageType;
  isGenerating: boolean;
  onEditMessage?: (messageId: string, newContent: string) => void;
}

// Define the structure of metadata
interface MessageMetadata {
  model: string;
  provider: string;
  type?: "auto_summary"; // Optional, if not always present
  originalMessageCount?: number;
  tokens?: number;
}

// Update the MessageType interface
interface MessageTypeWithMetadata extends Omit<MessageType, "metadata"> {
  metadata?: MessageMetadata;
}

export function Message({
  message,
  isGenerating,
  onEditMessage,
}: MessageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const messageRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToMessage = () => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  useEffect(() => {
    if (isGenerating) {
      scrollToMessage();
    }
  }, [isGenerating]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleStartEdit = () => {
    setEditedContent(message.content);
    setIsEditing(true);
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 0);
  };

  const handleSaveEdit = () => {
    if (
      onEditMessage &&
      editedContent.trim() &&
      editedContent !== message.content
    ) {
      onEditMessage(message.id, editedContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const isUser = message.role === "user";
  const isSystemSummary =
    message.role === "system" && message.metadata?.type === "auto_summary";

  // Special rendering for auto-summary messages
  if (isSystemSummary) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="mx-auto my-6 max-w-3xl"
      >
        <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/20 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  📝 Conversation Summary
                </h3>
                <p className="text-xs text-muted-foreground">
                  Auto-generated • {message.metadata.originalMessageCount}{" "}
                  messages summarized
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="prose prose-sm max-w-none overflow-hidden"
            >
              <div className="rounded-lg border border-border bg-card p-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content.replace("[CONVERSATION SUMMARY]\n\n", "")}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}

          {!isExpanded && (
            <p className="text-sm text-muted-foreground">
              Click to view full summary
            </p>
          )}

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span>⏱️ {new Date(message.timestamp).toLocaleString()}</span>
            {message.metadata.tokens && (
              <span>📊 {message.metadata.tokens} tokens</span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full gap-4 px-6 py-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-3xl rounded-xl px-6 py-4 shadow-card",
          isUser
            ? // ? "gradient-primary text-primary-foreground"
              "black text-primary-foreground border border-border group/message"
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
            <div className="relative">
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    ref={editInputRef}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        handleSaveEdit();
                      } else if (e.key === "Escape") {
                        handleCancelEdit();
                      }
                    }}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[60px]"
                    rows={Math.min(editedContent.split("\n").length + 1, 10)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleSaveEdit}
                      className="h-7"
                    >
                      <CheckIcon className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="h-7"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-foreground">
                    {message.content}
                  </p>
                </>
              )}
            </div>
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
                      <code
                        className={cn(
                          "rounded bg-muted px-1.5 py-0.5",
                          className
                        )}
                        {...rest}
                      >
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
                          <Check className="h-2 w-2 text-green-500" />
                        ) : (
                          <Copy className="h-2 w-2" />
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

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
          {isUser && onEditMessage && !isEditing && (
            <div className="flex gap-1 opacity-0 group-hover/message:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={copyMessage}
                title="Copy message"
              >
                {copiedMessage ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={handleStartEdit}
                title="Edit message"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
