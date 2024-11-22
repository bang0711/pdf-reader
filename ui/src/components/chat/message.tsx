import { Message as IMessage } from "@prisma/client";

import React from "react";

type Props = {
  isUser: boolean;
  message: IMessage;
};

function Message({ message, isUser }: Props) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <div
          className={`mt-1 text-xs ${
            isUser ? "text-primary-foreground/70" : "text-muted-foreground/70"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export default Message;
