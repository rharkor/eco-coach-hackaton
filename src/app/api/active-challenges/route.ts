import { NextResponse } from "next/server";

import { and, eq } from "drizzle-orm";

import db from "@/db";
import { challengeTable } from "@/db/schemas/challenge";
import { logger } from "@rharkor/logger";

// Get active challenges for a user (challenges that are not completed)
async function getActiveChallenges(userId: string) {
  try {
    const challenges = await db
      .select()
      .from(challengeTable)
      .where(
        and(
          eq(challengeTable.userId, userId),
          eq(challengeTable.hasBeenCompleted, false)
        )
      )
      .orderBy(challengeTable.createdAt);

    return challenges;
  } catch (error) {
    console.error("Error fetching active challenges:", error);
    throw error;
  }
}

export async function GET() {
  try {
    // Hardcoded user ID for now - in a real app, you would get this from auth
    const userId = "b8931ee8-1a95-478f-b6a3-8a0b1d257743";

    const challenges = await getActiveChallenges(userId);

    logger.info("Active challenges fetched", {
      userId,
      count: challenges.length,
    });

    return NextResponse.json({ challenges });
  } catch (err) {
    const error = err as Error;
    logger.error("Error fetching active challenges", {
      message: error.message,
    });
    return NextResponse.json(
      { error: "Internal Server Error", challenges: [] },
      { status: 500 }
    );
  }
}
