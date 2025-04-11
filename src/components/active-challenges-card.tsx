"use client";

import { useEffect, useState } from "react";

import { Award, Calendar, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Challenge {
  id: number;
  name: string;
  description: string;
  score: number;
  kgCO2Saved: number;
  hasBeenCompleted: boolean;
  kind: "daily" | "other";
  createdAt: string;
}

interface ActiveChallengesResponse {
  challenges: Challenge[];
}

async function getActiveChallenges(): Promise<ActiveChallengesResponse> {
  try {
    const response = await fetch("/api/active-challenges");
    if (!response.ok) {
      throw new Error("Failed to fetch active challenges");
    }
    return (await response.json()) as ActiveChallengesResponse;
  } catch (error) {
    console.error("Error fetching active challenges:", error);
    return { challenges: [] };
  }
}

export default function ActiveChallengesCard() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadActiveChallenges() {
      try {
        const data = await getActiveChallenges();
        if (isMounted) {
          setChallenges(data.challenges);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in loadActiveChallenges:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadActiveChallenges();

    return () => {
      isMounted = false;
    };
  }, []);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  return (
    <Card className="w-full max-w-md border shadow-md overflow-hidden bg-white">
      <CardHeader className="py-2 border-b">
        <CardTitle className="text-center text-2xl font-bold">
          Défis en cours
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="animate-pulse space-y-4 w-full py-2">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="flex space-x-4 rounded-lg bg-gray-50 p-3"
              >
                <div className="size-12 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="space-y-1">
                    <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto size-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Award className="size-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600">
              Aucun défi en cours
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Consultez les défis disponibles pour commencer à gagner des
              points!
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                  challenge.kind === "daily" ? "bg-amber-50" : "bg-blue-50"
                }`}
              >
                {challenge.kind === "daily" ? (
                  <Calendar className="size-8 text-amber-500 shrink-0 mt-1" />
                ) : (
                  <Award className="size-8 text-blue-500 shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-800">
                      {challenge.name}
                    </h3>
                    <span className="flex items-center text-sm font-medium bg-white rounded-full px-2 py-0.5 text-gray-700 border">
                      {challenge.score} pts
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {challenge.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      Depuis le {formatDate(challenge.createdAt)}
                    </span>
                    {challenge.kgCO2Saved > 0 && (
                      <span className="font-medium text-green-600">
                        {challenge.kgCO2Saved} kg CO₂
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
