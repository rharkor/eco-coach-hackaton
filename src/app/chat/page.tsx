import { useState } from "react";
import Link from "next/link";

import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import Content from "./(components)/content";

const frequentActions = [
  "♻️ Obtenir un défi écolo du jour",
  "🌱 J'ai fait une action écolo",
  "💡 Donne-moi un conseil pour réduire mon impact",
  "📊 Voir mon score / mes progrès",
  "🖼️ Génère une affiche inspirante",
  "🔍 Quels gestes simples puis-je faire aujourd'hui ?",
  "🎯 Fixe-moi un objectif pour cette semaine",
];

const doneActions = [
  "🚲 J'ai pris le vélo aujourd'hui",
  "🍽️ J'ai mangé végétarien",
  "🧴 J'ai évité le plastique à usage unique aujourd'hui",
  "🚿 J'ai pris une douche courte",
  "🛒 J'ai acheté en vrac",
];

const placeholders = [
  "Dis-moi ce que tu as fait aujourd'hui ou demande un nouveau défi 🌱",
  "Parle-moi de ton geste écolo ou demande un conseil 💬",
  "Tu veux un défi, un conseil, ou partager ton action ? 👇",
  "Tape ici ou choisis un bouton ci-dessus 👆",
];

export default function Chat() {
  const [apiResponse, setApiResponse] = useState("");

  const handleSuperEcoloClick = async () => {
    try {
      const response = await fetch("/api/super-ecolo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "super-ecolo" }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'appel API");
      }

      const data = await response.json() as { message: string };
      setApiResponse(data.message || "Action réussie !");
    } catch (error) {
      console.error(error);
      setApiResponse("Une erreur est survenue.");
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="relative flex justify-center items-center">
        <Link className="absolute top-0 left-0" href="/">
          <ChevronLeft />
        </Link>
        <p className="text-2xl font-bold text-center">EcoCoach</p>
        <Button onClick={handleSuperEcoloClick}>Super Ecolo</Button>
      </div>
      <div className="flex flex-col size-full justify-between gap-3 min-h-0">
        <Content
          placeholder={
            placeholders[Math.floor(Math.random() * placeholders.length)]
          }
          doneAction={
            doneActions[Math.floor(Math.random() * doneActions.length)]
          }
          frequentAction={
            frequentActions[Math.floor(Math.random() * frequentActions.length)]
          }
        />
      </div>
    </div>
  );
}
