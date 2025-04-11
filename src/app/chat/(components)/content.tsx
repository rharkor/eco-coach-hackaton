"use client";

import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";

import ActionCard from "./action-card";
import ToolInvocations from "./tool-invocations";

export default function Content({
  placeholder,
  doneAction,
  frequentAction,
}: {
  placeholder: string;
  doneAction: string;
  frequentAction: string;
}) {
  const { messages, input, handleInputChange, handleSubmit, append } = useChat({
    maxSteps: 3,
    // initialMessages: Array.from({ length: 100 }, (_, i) => ({
    //   role: "user",
    //   content: "Salut",
    //   id: `user-${i + 1}`,
    // })),
  });

  // Function to handle clicking on an action card
  const handleActionClick = (action: string) => {
    return append({
      role: "user",
      content: action,
    });
  };

  return (
    <>
      <div className="gap-4 flex flex-col overflow-auto">
        {messages.length === 0 ? (
          <div className="space-y-4">
            {[doneAction, frequentAction, "Donne moi un nouveau défi"].map(
              (action) => (
                <ActionCard
                  key={action}
                  action={action}
                  onClick={() => void handleActionClick(action)}
                />
              )
            )}
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn("space-y-3", {
                "self-end": m.role === "user",
              })}
            >
              <ToolInvocations
                toolInvocations={m.parts
                  .filter((p) => p.type === "tool-invocation")
                  .map((p) => p.toolInvocation)}
              />
              {m.content.length > 0 && (
                <div
                  className={cn({
                    "rounded-lg p-2 px-3 bg-primary/20": m.role === "user",
                  })}
                >
                  <MemoizedMarkdown id={m.id} content={m.content} />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder={placeholder}
          rows={3}
          className="resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          autoFocus
        />
      </form>
    </>
  );
}
