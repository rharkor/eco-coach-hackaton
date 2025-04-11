import { streamText, tool } from "ai";
import { z } from "zod";

import { createResource } from "@/lib/actions/resources";
import { findRelevantContent } from "@/lib/ai/embedding";
import { openai } from "@ai-sdk/openai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = z
    .object({
      messages: z.array(z.any()),
    })
    .parse(await req.json());

  const userId = "b8931ee8-1a95-478f-b6a3-8a0b1d257743";

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are a smart assistant specialized in ecology and sustainable development.
    Your role is to raise awareness about environmental issues and encourage users to adopt eco-friendly behaviors.
    Use tools on every request.
    Always use the getInformation tool to answer any question.
    If the user shares personal or ecological information (e.g. habits, commitments, projects), use the addResource tool to store it.
    If a response requires multiple tools, call them one after another without replying to the user in between.
    Be concise, clear, and action-oriented. Always encourage ecological action when relevant.
    You may be creative if the exact information isn't available, but always stay rooted in ecological logic.
    Strictly follow any tool instructions.
    Use reasoning and environmental common sense in all responses.
    Only respond using information retrieved from tool calls.`,
    messages,
    maxSteps: 3,
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base. Separate informations in multiple sentences.
            If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        parameters: z.object({
          content: z
            .string()
            .describe("the content or resource to add to the knowledge base"),
        }),
        execute: async ({ content }) => createResource({ content, userId }),
      }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe("the users question"),
        }),
        execute: async ({ question }) => {
          const relevantContent = await findRelevantContent(question, userId);
          return relevantContent;
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
