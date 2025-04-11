import Link from "next/link";

import ActiveChallengesCard from "@/components/active-challenges-card";
import CO2SavingsCard from "@/components/co2-savings-card";
import LevelProgressCard from "@/components/level-progress-card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center py-10 space-y-8">
      <h1 className="text-4xl font-bold">Bonjour, Louis!</h1>

      <div className="w-full max-w-md flex flex-col gap-6">
        <CO2SavingsCard />
        <LevelProgressCard />
        <ActiveChallengesCard />
      </div>

      <Link href="/chat">
        <Button size="lg">Start</Button>
      </Link>
    </div>
  );
}
