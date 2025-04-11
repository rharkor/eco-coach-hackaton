import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";

import db from "@/db";
import { actionTable } from "@/db/schemas/action";
import { challengeTable } from "@/db/schemas/challenge";
import { logger } from "@rharkor/logger";

// Define level thresholds
const levels = [
  { level: 1, threshold: 0, title: "Débutant Éco" },
  { level: 2, threshold: 100, title: "Éco-Curieux" },
  { level: 3, threshold: 250, title: "Éco-Engagé" },
  { level: 4, threshold: 500, title: "Éco-Champion" },
  { level: 5, threshold: 1000, title: "Master Écologique" },
  { level: 6, threshold: 2000, title: "Héros Planétaire" },
];

async function getUserTotalScore(userId: string) {
  try {
    // Get all actions for the user
    const actions = await db
      .select()
      .from(actionTable)
      .where(eq(actionTable.userId, userId));

    // Get all completed challenges for the user
    const completedChallenges = await db
      .select()
      .from(challengeTable)
      .where(eq(challengeTable.userId, userId));

    // Calculate total score
    const actionScore = actions.reduce((acc, action) => acc + action.score, 0);
    const challengeScore = completedChallenges.reduce(
      (acc, challenge) =>
        acc + (challenge.hasBeenCompleted ? challenge.score : 0),
      0
    );

    const totalScore = actionScore + challengeScore;

    // Determine current level and next level
    let currentLevel = levels[0];
    let nextLevel = levels[1];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (totalScore >= levels[i].threshold) {
        currentLevel = levels[i];
        nextLevel = i < levels.length - 1 ? levels[i + 1] : levels[i];
        break;
      }
    }

    // Calculate progress percentage to next level
    const currentThreshold = currentLevel.threshold;
    const nextThreshold = nextLevel.threshold;
    const scoreInLevel = totalScore - currentThreshold;
    const levelRange = nextThreshold - currentThreshold;
    const progressPercentage =
      currentLevel === nextLevel
        ? 100
        : Math.min(Math.floor((scoreInLevel / levelRange) * 100), 99);

    return {
      totalScore,
      currentLevel: currentLevel.level,
      levelTitle: currentLevel.title,
      nextLevel: nextLevel.level,
      nextLevelTitle: nextLevel.title,
      progressPercentage,
      pointsToNextLevel:
        nextThreshold - totalScore > 0 ? nextThreshold - totalScore : 0,
      actionScore,
      challengeScore,
    };
  } catch (error) {
    console.error("Error calculating user level:", error);
    throw error;
  }
}

export async function GET() {
  try {
    // Hardcoded user ID for now - in a real app, you would get this from auth
    const userId = "b8931ee8-1a95-478f-b6a3-8a0b1d257743";

    const data = await getUserTotalScore(userId);

    logger.info("User level calculated", { userId, data });

    return NextResponse.json(data);
  } catch (err) {
    const error = err as Error;
    logger.error("Error calculating user level", { message: error.message });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
