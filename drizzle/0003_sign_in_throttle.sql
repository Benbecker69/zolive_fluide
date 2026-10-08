CREATE TABLE "sign_in_throttles" (
	"account" text PRIMARY KEY NOT NULL,
	"failures" integer NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	"locked_until" timestamp with time zone,
	CONSTRAINT "sign_in_throttles_failures_not_negative" CHECK ("sign_in_throttles"."failures" >= 0)
);
