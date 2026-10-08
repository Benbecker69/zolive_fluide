/**
 * Runs once when the server starts. Node.js-only work lives in a separate module,
 * loaded on demand, so that it is never bundled for another runtime.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateConfiguration } = await import("./instrumentation-node");
    validateConfiguration();
  }
}
