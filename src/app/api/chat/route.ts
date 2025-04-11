import { NextResponse } from "next/server";

import { streamText, tool } from "ai";
import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";

import db from "@/db";
import { actionTable } from "@/db/schemas/action";
import { challengeTable } from "@/db/schemas/challenge";
import { createResource } from "@/lib/actions/resources";
import { findRelevantContent } from "@/lib/ai/embedding";
import { openai } from "@ai-sdk/openai";
import { logger } from "@rharkor/logger";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = z
      .object({
        messages: z.array(z.any()),
      })
      .parse(await req.json());

    const userId = "b8931ee8-1a95-478f-b6a3-8a0b1d257743";

    const result = streamText({
      model: openai("gpt-4o"),
      system: `
      Langue: Français
      Vous êtes un assistant intelligent spécialisé en écologie et en développement durable.
    Votre rôle est de sensibiliser aux enjeux environnementaux et d'encourager les utilisateurs à adopter des comportements éco-responsables.
    Adoptez toujours un ton amical, encourageant et bienveillant dans vos réponses.
    Utilisez les outils à chaque requête.
    Utilisez toujours l'outil getInformation pour répondre à toute question.
    Si l'utilisateur partage des informations personnelles ou écologiques (ex : habitudes, engagements, projets), utilisez l'outil addResource pour les enregistrer.
    Si une réponse nécessite plusieurs outils, appelez-les l'un après l'autre sans répondre à l'utilisateur entre-temps.
    Soyez concis, clair et orienté vers l'action. Encouragez toujours une action écologique quand c'est pertinent.
    Vous pouvez faire preuve de créativité si l'information exacte n'est pas disponible, mais restez toujours logique écologiquement.
    Suivez strictement les instructions des outils.
    Utilisez votre raisonnement et le bon sens environnemental dans toutes les réponses.
    Ne répondez qu'en utilisant les informations récupérées via les outils.

    ## Actions
    Collectez les informations des utilisateurs et utilisez l'outil saveAction pour enregistrer dans la base de données leurs actions écologiques et leur attribuer un score dépendant du gain en kg équivalent CO2.
    Le score attribué ne doit pas dépasser 200 et tu dois afficher le score que tu attribues à l'utilisateur.
    Si l'utilisateur parle d'une action qu'il a réalisé, pose lui des questions pour savoir le gain en kg eqCO2.
    Par exemple, réduire le chauffage ou la climatisation apporte un gain de 250 à 500 kg eqCO2, ce qui donne un score de 25 à 50.
    Autre exemple : si l'utilisateur dit qu'il fait sa lessive à l'eau froide, cela correspond à un gain de 10 à 30 kg eqCO2, donc un score de 1 à 3.

    ## Défis
    Vous pouvez proposer des défis à l'utilisateur. Ces défis leur permettront de gagner des points lorsqu'ils vous indiqueront les avoir relevés.
    Utilisez l'outil saveChallenge pour enregistrer les défis dans la base de données.
    
    ## Sauvegarde mémoire
    Pensez `,
      messages,
      maxSteps: 5,
      tools: {
        addResource: tool({
          description: `ajoute une ressource à votre base de connaissances. Séparez les informations en plusieurs phrases.
            Si l'utilisateur fournit une information spontanée, utilisez cet outil sans demander de confirmation.`,
          parameters: z.object({
            content: z
              .string()
              .describe(
                "le contenu ou la ressource à ajouter à la base de connaissances"
              ),
          }),
          execute: async ({ content }) => {
            try {
              logger.info("Creating resource", { content, userId });
              const resource = await createResource({ content, userId });
              return resource;
            } catch (error) {
              logger.error("Error creating resource", { error });
              return "Erreur lors de la création de la ressource";
            }
          },
        }),
        getInformation: tool({
          description: `récupère des informations depuis votre base de connaissances pour répondre aux questions.`,
          parameters: z.object({
            question: z.string().describe("la question de l'utilisateur"),
          }),
          execute: async ({ question }) => {
            try {
              logger.info("Getting information", { question, userId });
              const relevantContent = await findRelevantContent(
                question,
                userId
              );
              return relevantContent;
            } catch (error) {
              logger.error("Error getting information", { error });
              return "Erreur lors de la récupération des informations";
            }
          },
        }),
        saveAction: tool({
          description: `enregistre une action sur le profil de l'utilisateur.`,
          parameters: z.object({
            action: z.string().describe("l'action à enregistrer"),
            score: z.number().describe("les points à attribuer"),
            kgCO2Saved: z.number().describe("le gain en kg eqCO2"),
          }),
          execute: async ({ action, score, kgCO2Saved }) => {
            try {
              logger.info("Saving action", {
                action,
                score,
                kgCO2Saved,
                userId,
              });
              await db.insert(actionTable).values({
                action,
                score,
                userId,
                kgCO2Saved,
              });
              return "Action enregistrée avec succès";
            } catch (error) {
              logger.error("Error saving action", { error });
              return "Erreur lors de l'enregistrement de l'action";
            }
          },
        }),
        retrieveActions: tool({
          description: `récupère les actions de l'utilisateur depuis la base de données. Possibilité de filtrer par période.`,
          parameters: z.object({
            userId: z.string().describe("l'identifiant de l'utilisateur"),
            startDate: z
              .string()
              .optional()
              .describe("date de début au format ISO (inclusif)"),
            endDate: z
              .string()
              .optional()
              .describe("date de fin au format ISO (inclusif)"),
          }),
          execute: async ({ userId, startDate, endDate }) => {
            try {
              logger.info("Retrieving actions", { userId, startDate, endDate });
              const query = db
                .select()
                .from(actionTable)
                .where(
                  and(
                    eq(actionTable.userId, userId),
                    startDate
                      ? gte(actionTable.createdAt, new Date(startDate))
                      : undefined,
                    endDate
                      ? lte(actionTable.createdAt, new Date(endDate))
                      : undefined
                  )
                );

              const actions = await query;
              return actions;
            } catch (error) {
              logger.error("Error retrieving actions", { error });
              return "Erreur lors de la récupération des actions";
            }
          },
        }),
        saveChallenge: tool({
          description: `enregistre un défi sur le profil de l'utilisateur.`,
          parameters: z.object({
            name: z.string().describe("le nom du défi"),
            description: z.string().describe("la description du défi"),
            score: z.number().describe("les points à attribuer"),
            kgCO2Saved: z.number().describe("le gain en kg eqCO2"),
          }),
          execute: async ({ name, description, score, kgCO2Saved }) => {
            try {
              logger.info("Saving challenge", {
                name,
                description,
                score,
                kgCO2Saved,
                userId,
              });
              await db.insert(challengeTable).values({
                name,
                description,
                score,
                userId,
                hasBeenCompleted: false,
                kind: "other",
                kgCO2Saved,
              });
              return "Challenge enregistré avec succès";
            } catch (error) {
              logger.error("Error saving challenge", { error });
              return "Erreur lors de l'enregistrement du défi";
            }
          },
        }),
        retrieveChallenges: tool({
          description: `récupère les défis de l'utilisateur depuis la base de données.`,
          parameters: z.object({
            userId: z.string().describe("l'identifiant de l'utilisateur"),
          }),
          execute: async ({ userId }) => {
            try {
              logger.info("Retrieving challenges", { userId });
              const query = db
                .select()
                .from(challengeTable)
                .where(eq(challengeTable.userId, userId));
              const challenges = await query;
              return challenges;
            } catch (error) {
              logger.error("Error retrieving challenges", { error });
              return "Erreur lors de la récupération des défis";
            }
          },
        }),
        completeChallenge: tool({
          description: `marque un défi comme terminé.`,
          parameters: z.object({
            challengeId: z.number().describe("l'identifiant du défi"),
          }),
          execute: async ({ challengeId }) => {
            try {
              logger.info("Completing challenge", { challengeId, userId });
              await db
                .update(challengeTable)
                .set({ hasBeenCompleted: true })
                .where(eq(challengeTable.id, challengeId));
              return "Défi marqué comme terminé avec succès";
            } catch (error) {
              logger.error("Error completing challenge", { error });
              return "Erreur lors de la marque du défi comme terminé";
            }
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
