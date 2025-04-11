import { NextResponse } from "next/server";

import { generateObject } from "ai";
import { and, eq, gte } from "drizzle-orm";
import { z } from "zod";

import db from "@/db";
import { actionTable } from "@/db/schemas/action";
import { challengeTable } from "@/db/schemas/challenge";
import { getWithTTL } from "@/lib/redis";
import { openai } from "@ai-sdk/openai";
import { logger } from "@rharkor/logger";

// Function to get the total CO2 savings for a user in the last week
async function getUserWeeklyCO2Savings(userId: string) {
  // Create a new date and manually subtract 7 days instead of using subDays
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);

  // Get all actions from the last week
  const actions = await db
    .select()
    .from(actionTable)
    .where(
      and(
        eq(actionTable.userId, userId),
        gte(actionTable.createdAt, oneWeekAgo)
      )
    );

  const completedChallenges = await db
    .select()
    .from(challengeTable)
    .where(
      and(
        eq(challengeTable.userId, userId),
        eq(challengeTable.hasBeenCompleted, true),
        gte(challengeTable.createdAt, oneWeekAgo)
      )
    );

  if (actions.length === 0 && completedChallenges.length === 0) {
    const nextActions = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        nextActions: z.string(),
      }),
      prompt:
        "Langue: Français, Vous êtes un assistant écologique, suggérez une action écologique à l'utilisateur.",
    });
    return {
      goodActions: "Aucun.e action/défi effectué.e cette semaine",
      kgCO2Saved: 0,
      nextActions: nextActions.object.nextActions,
    };
  }

  const {
    object: { goodActions, nextActions },
  } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      goodActions: z.string(),
      nextActions: z.string(),
    }),
    system: `
      Langue: Français
      Vous êtes un assistant écologique
      Voici les actions de l'utilisateur cette semaine :
      - ${actions
        .map(
          (action) =>
            `${action.action} : ${action.createdAt.toLocaleDateString()}`
        )
        .join(", ")}
      `,
    prompt: `Analysez les actions de l'utilisateur et retournez:
      1. Une liste des actions les plus impactantes (goodActions)
      2. Une liste des prochaines actions recommandées (nextActions)`,
  });

  return {
    goodActions,
    nextActions,
    kgCO2Saved: actions.reduce((acc, action) => acc + action.kgCO2Saved, 0),
  };
}

export async function GET() {
  try {
    // Hardcoded user ID for now - in a real app, you would get this from auth
    const userId = "b8931ee8-1a95-478f-b6a3-8a0b1d257743";

    // Get CO2 savings with Redis caching (1 hour TTL)
    const cacheKey = `co2-savings:${userId}`;

    //! We don't want to cache for now
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if ("" === "") {
      const data = await getUserWeeklyCO2Savings(userId);
      return NextResponse.json(data);
    }

    const data = await getWithTTL(
      cacheKey,
      () => getUserWeeklyCO2Savings(userId),
      3600 // 1 hour cache
    );

    logger.info("CO2 savings calculated", { userId, data });

    return NextResponse.json(data);
  } catch (err) {
    const error = err as Error;
    logger.error("Error calculating CO2 savings", { message: error.message });
    return NextResponse.json(
      { error: "Internal Server Error", kgCO2Saved: 0 },
      { status: 500 }
    );
  }
}
