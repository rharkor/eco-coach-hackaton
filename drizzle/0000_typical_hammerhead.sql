CREATE TYPE "public"."challenge_kind" AS ENUM('daily', 'other');--> statement-breakpoint
CREATE TABLE "action" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "action_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"score" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"score" integer NOT NULL,
	"has_been_completed" boolean DEFAULT false NOT NULL,
	"kind" "challenge_kind" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
