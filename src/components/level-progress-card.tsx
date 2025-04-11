"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserLevelResponse {
  totalScore: number;
  currentLevel: number;
  levelTitle: string;
  nextLevel: number;
  nextLevelTitle: string;
  progressPercentage: number;
  pointsToNextLevel: number;
  actionScore: number;
  challengeScore: number;
}

async function getUserLevel(): Promise<UserLevelResponse> {
  try {
    const response = await fetch("/api/user-level");
    if (!response.ok) {
      throw new Error("Failed to fetch user level data");
    }
    return (await response.json()) as UserLevelResponse;
  } catch (error) {
    console.error("Error fetching user level:", error);
    return {
      totalScore: 0,
      currentLevel: 1,
      levelTitle: "Débutant Éco",
      nextLevel: 2,
      nextLevelTitle: "Éco-Curieux",
      progressPercentage: 0,
      pointsToNextLevel: 100,
      actionScore: 0,
      challengeScore: 0,
    };
  }
}

export default function LevelProgressCard() {
  const [levelData, setLevelData] = useState<UserLevelResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUserLevel() {
      try {
        const data = await getUserLevel();
        if (isMounted) {
          setLevelData(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in loadUserLevel:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadUserLevel();

    return () => {
      isMounted = false;
    };
  }, []);

  // Function to determine badge color based on level
  const getBadgeColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-gray-200 text-gray-800";
      case 2:
        return "bg-green-200 text-green-800";
      case 3:
        return "bg-blue-200 text-blue-800";
      case 4:
        return "bg-purple-200 text-purple-800";
      case 5:
        return "bg-amber-200 text-amber-800";
      case 6:
        return "bg-rose-200 text-rose-800";
      case 7:
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Function to determine progress bar color based on level
  const getProgressColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-gray-500";
      case 2:
        return "bg-green-500";
      case 3:
        return "bg-blue-500";
      case 4:
        return "bg-purple-500";
      case 5:
        return "bg-amber-500";
      case 6:
        return "bg-rose-500";
      case 7:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="w-full max-w-md border shadow-md overflow-hidden bg-white">
      <CardHeader className="py-2 border-b">
        <CardTitle className="text-center text-2xl font-bold">
          Mon Niveau
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="animate-pulse space-y-4 w-full">
            <div className="flex justify-between">
              <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-4 w-full bg-gray-200 rounded-full"></div>
            <div className="h-12 w-3/4 bg-gray-200 rounded-md mx-auto"></div>
          </div>
        ) : (
          levelData && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(
                      levelData.currentLevel
                    )}`}
                  >
                    Niveau {levelData.currentLevel}
                  </span>
                  <h3 className="mt-1 text-xl font-bold">
                    {levelData.levelTitle}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">
                    {levelData.totalScore}
                  </span>
                  <p className="text-xs text-gray-500">points totaux</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-gray-600">
                      Progression
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-gray-600">
                      {levelData.progressPercentage}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${levelData.progressPercentage}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${getProgressColor(
                      levelData.currentLevel
                    )}`}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Niveau {levelData.currentLevel}</span>
                  <span>Niveau {levelData.nextLevel}</span>
                </div>
              </div>

              {/* Points needed for next level */}
              {levelData.currentLevel !== levelData.nextLevel && (
                <div className="mt-4 px-4 py-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">
                      {levelData.pointsToNextLevel} points
                    </span>{" "}
                    nécessaires pour atteindre le niveau {levelData.nextLevel}
                  </p>
                </div>
              )}

              {/* Score breakdown */}
              <div className="mt-6 grid grid-cols-2 gap-2">
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-green-600 font-medium">Actions</p>
                  <p className="text-lg font-bold text-green-700">
                    {levelData.actionScore}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-blue-600 font-medium">Défis</p>
                  <p className="text-lg font-bold text-blue-700">
                    {levelData.challengeScore}
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
