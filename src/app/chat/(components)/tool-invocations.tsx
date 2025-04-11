import { ToolInvocation } from "ai";

export default function ToolInvocations({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toolInvocations,
}: {
  toolInvocations: ToolInvocation[];
}) {
  return null;

  /*
  if (toolInvocations.length === 0) {
    return null;
  }
  return (
    <div className="space-y-2">
      {toolInvocations.map((toolInvocation) => (
        <div
          key={toolInvocation.toolCallId}
          className="text-sm rounded-sm bg-gray-100 p-2"
        >
          {toolInvocation.toolName}
        </div>
      ))}
    </div>
  );*/
}
