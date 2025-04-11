"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CO2SavingsResponse {
  kgCO2Saved: number;
  goodActions: string;
  nextActions: string;
}

async function getCO2Savings(): Promise<CO2SavingsResponse> {
  try {
    const response = await fetch("/api/co2-savings");
    if (!response.ok) {
      throw new Error("Failed to fetch CO2 savings");
    }
    return (await response.json()) as CO2SavingsResponse;
  } catch (error) {
    console.error("Error fetching CO2 savings:", error);
    return { kgCO2Saved: 0, goodActions: "", nextActions: "" };
  }
}

export default function CO2SavingsCard() {
  const [co2Saved, setCO2Saved] = useState(0);
  const [goodActions, setGoodActions] = useState("");
  const [nextActions, setNextActions] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCO2Savings() {
      try {
        const data = await getCO2Savings();
        if (isMounted) {
          setCO2Saved(data.kgCO2Saved);
          setGoodActions(data.goodActions);
          setNextActions(data.nextActions);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in loadCO2Savings:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadCO2Savings();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Card className="w-full max-w-md border-none shadow-lg overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-2xl font-bold">
          CO2 sauvé cette semaine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          {loading ? (
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-[48px] w-full bg-white/30 rounded-md mx-auto"></div>
              <div className="w-full bg-white/30 rounded-md h-[160px] mx-auto"></div>
              <div className="w-full bg-white/30 rounded-md h-[180px] mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="relative flex justify-center items-center">
                <div className="text-5xl font-extrabold w-max relative">
                  {co2Saved} kg
                  <div className="absolute -top-2 -right-10 bg-white text-primary text-xs font-bold px-2 py-1 rounded-full rotate-12">
                    CO₂
                  </div>
                </div>
              </div>
              {goodActions && (
                <div className="mt-4 h-[160px] overflow-y-auto text-lg font-medium bg-green-800/20 p-3 rounded-lg backdrop-blur-sm flex flex-col gap-1">
                  <p className=" text-lg text-start font-semibold underline">
                    Actions les plus impactantes
                  </p>
                  <p className="text-sm font-medium text-start">
                    {goodActions}
                  </p>
                </div>
              )}
              {nextActions && (
                <div className="mt-4 h-[180px] overflow-y-auto text-lg font-medium bg-green-800/20 p-3 rounded-lg backdrop-blur-sm flex flex-col gap-1">
                  <p className="text-lg text-start font-semibold underline">
                    Prochaines actions
                  </p>
                  <p className="text-sm font-medium text-start">
                    {nextActions}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
