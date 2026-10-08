import { getEnv, InvalidEnvError } from "@/data/env";

/**
 * Validates the configuration at start-up, so that a missing or invalid variable stops
 * the process immediately, with its name, instead of failing on the first request.
 */
export function validateConfiguration(): void {
  try {
    getEnv();
  } catch (error) {
    if (error instanceof InvalidEnvError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }
}
