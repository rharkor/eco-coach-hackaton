"use client";

import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@ai-sdk/react";

import ActionCard from "./action-card";

export default function Content({
  placeholder,
  doneAction,
  frequentAction,
}: {
  placeholder: string;
  doneAction: string;
  frequentAction: string;
}) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 3,
  });

  // Function to handle clicking on an action card
  const handleActionClick = (action: string) => {
    handleInputChange({
      target: { value: action },
    } as React.ChangeEvent<HTMLTextAreaElement>);
  };

  return (
    <>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            {[doneAction, frequentAction, "Donne moi un nouveau défi"].map(
              (action) => (
                <ActionCard
                  key={action}
                  action={action}
                  onClick={() => handleActionClick(action)}
                />
              )
            )}
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap">
              <div>
                <div className="font-bold">{m.role}</div>
                {m.content.length > 0 ? (
                  <MemoizedMarkdown id={m.id} content={m.content} />
                ) : (
                  <span className="italic font-light">
                    {"calling tool: " +
                      m.parts
                        .filter((p) => p.type === "tool-invocation")
                        .map((p) => p.toolInvocation.toolName)
                        .join(", ")}
                  </span>
                )}
              </div>
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
        />
      </form>
    </>
  );
}
