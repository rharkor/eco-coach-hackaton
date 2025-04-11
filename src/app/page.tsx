import Link from "next/link";

import { MessageSquare } from "lucide-react";

import ActiveChallengesCard from "@/components/active-challenges-card";
import CO2SavingsCard from "@/components/co2-savings-card";
import LevelProgressCard from "@/components/level-progress-card";

export default function Home() {
  return (
    <div className="flex flex-col items-center py-10 space-y-8">
      <h1 className="text-4xl font-bold">Bonjour, Louis!</h1>

      <div className="w-full max-w-md flex flex-col gap-6">
        <CO2SavingsCard />
        <LevelProgressCard />
        <ActiveChallengesCard />
      </div>

      <Link
        href="/chat"
        className="fixed bottom-3 right-3 rounded-full bg-primary/30 backdrop-blur-sm border border-primary/50 shadow-lg p-4"
      >
        <MessageSquare className="size-10 text-primary" />
      </Link>
    </div>
  );
}
