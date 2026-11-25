/**
 * BITMAP sports provider configuration.
 * Live data will be enabled after a sports API is connected.
 */
export const SPORTS_PROVIDER_CONFIG = {
  mode: "unconfigured",
  basePath: "/api/sports",
  refreshIntervalMs: 30_000,
} as const;

export function isLiveSportsConfigured(): boolean {
  return false;
}

export const SPORTS_PROVIDER_MESSAGE =
  "Live football data is not connected. Configure a licensed sports API before enabling live scores.";
