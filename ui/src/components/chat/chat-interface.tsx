"use client";

import React, { useEffect, useRef, useState } from "react";

import { Loader2, Send } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { Document, Message as IMessage } from "@prisma/client";

import Message from "./message";
import { useToast } from "@/hooks/use-toast";
import { instance } from "@/lib/instance";

type Props = {
  currentDocument: Document;
  currentMessages: IMessage[];
};

function ChatInterface({ currentDocument, currentMessages }: Props) {
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<IMessage[]>(currentMessages);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  // Scroll to the bottom of the message container
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) {
      return;
    }

    setLoading(true);
    setInput("");

    const userMessage: IMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      createdAt: new Date(),
      documentId: currentDocument.id,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await instance.post(
        `/chat/${currentDocument.id}`,
        {
          question: input,
        },
        {
          adapter: "fetch",
          responseType: "stream",
        },
      );

      setLoading(false);

      const reader = res.data.getReader();
      const decoder = new TextDecoder();

      let assistantMessageContent = "";

      // Create and add the streaming message
      const streamingMessage: IMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        createdAt: new Date(),
        documentId: currentDocument.id,
      };

      setMessages((prev) => [...prev, streamingMessage]);

      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Update the final content of the assistant message
          setMessages((prev) =>
            prev.map((message) =>
              message.id === streamingMessage.id
                ? { ...message, content: assistantMessageContent.trim() }
                : message,
            ),
          );
          break;
        }

        assistantMessageContent += decoder.decode(value, { stream: true });

        // Update the streaming message content
        setMessages((prev) =>
          prev.map((message) =>
            message.id === streamingMessage.id
              ? { ...message, content: assistantMessageContent }
              : message,
          ),
        );
      }
    } catch (error) {
      console.error("Error processing /document request:", error);
      toast({
        title: "Error",
        description: "Something went wrong",
        duration: 1000,
        variant: "destructive",
      });
      return;
    }
  };

  return (
    <div className="flex h-[90vh] w-full flex-1 flex-col justify-between gap-2 rounded-md border">
      <div
        className="flex-1 overflow-auto scroll-smooth px-5 py-2"
        ref={scrollAreaRef}
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              isUser={message.role === "user"}
            />
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-muted p-3 text-muted-foreground">
                <div className="flex items-end space-x-1 whitespace-pre-wrap">
                  <p>Thinking</p>
                  <div className="mb-1 flex items-end space-x-1 pb-0.5">
                    <div className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]"></div>
                    <div className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]"></div>
                    <div className="size-1 animate-bounce rounded-full bg-muted-foreground"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            className="w-full"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              currentDocument
                ? "Type a message..."
                : "Please select or upload a document to start asking questions..."
            }
            disabled={loading || !currentDocument}
          />
          <Button type="submit" disabled={loading || !currentDocument}>
            {loading ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ChatInterface;
