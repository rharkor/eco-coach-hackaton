"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function SuperEcolo() {
  const [_apiResponse, setApiResponse] = useState("");
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

      const data = (await response.json()) as { message: string };
      setApiResponse(data.message || "Action réussie !");
    } catch (error) {
      console.error(error);
      setApiResponse("Une erreur est survenue.");
    }
  };

  return (
    <Button
      onClick={() => void handleSuperEcoloClick()}
      className="absolute right-0 top-1/2 -translate-y-1/2"
      size={"sm"}
    >
      Super Ecolo
    </Button>
  );
}
