import Link from "next/link";

import CO2SavingsCard from "@/components/co2-savings-card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center py-10 space-y-8">
      <h1 className="text-4xl font-bold">Bonjour, Louis!</h1>
      <CO2SavingsCard />
      <Link href="/chat">
        <Button size="lg">Start</Button>
      </Link>
    </div>
  );
}
