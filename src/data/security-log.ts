import "server-only";

import { createHash } from "node:crypto";

/**
 * Security events (requirement SEC-11): one JSON object per line on standard output.
 * An event never carries a password, a token, a session identifier or an e-mail address.
 * To follow one account across events without storing its address, the e-mail is replaced
 * by a short fingerprint.
 */

type SecurityEvent =
  | "auth.sign_up.succeeded"
  | "auth.sign_up.refused"
  | "auth.sign_in.succeeded"
  | "auth.sign_in.failed"
  | "auth.sign_in.locked"
  | "auth.sign_out"
  | "account.deleted"
  | "account.delete.refused"
  | "account.delete.locked"
  | "access.denied";

type Fields = { userId?: string; account?: string; reason?: string; resource?: string };

type Sink = (line: string) => void;

let sink: Sink = (line) => console.log(line);

/** Replaces the output, for tests. Returns a function that restores the previous one. */
export function captureSecurityLog(replacement: Sink): () => void {
  const previous = sink;
  sink = replacement;
  return () => {
    sink = previous;
  };
}

/** Stable, non-reversible fingerprint of an e-mail address, short enough to read in a log. */
export function accountFingerprint(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 16);
}

export function logSecurityEvent(event: SecurityEvent, fields: Fields = {}): void {
  sink(JSON.stringify({ time: new Date().toISOString(), level: "info", event, ...fields }));
}
