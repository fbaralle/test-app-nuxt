// Patterns to filter out sensitive env var names
const SENSITIVE_PATTERNS = [
  /SECRET/i,
  /KEY/i,
  /TOKEN/i,
  /PASSWORD/i,
  /CREDENTIAL/i,
  /AUTH/i,
  /PRIVATE/i,
  /API_KEY/i,
  /APIKEY/i,
  /ACCESS/i,
  /BEARER/i,
  /JWT/i,
  /CERT/i,
  /SSL/i,
];

function isSensitive(name: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(name));
}

function filterEnvVarNames(names: string[]): string[] {
  return names.filter((name) => !isSensitive(name)).sort();
}

export default defineEventHandler(async () => {
  // Get all process.env keys available in the backend
  const allEnvNames = Object.keys(process.env || {});
  const filteredNames = filterEnvVarNames(allEnvNames);

  return {
    timestamp: new Date().toISOString(),
    environment: "backend",
    total: allEnvNames.length,
    filtered: filteredNames.length,
    hidden: allEnvNames.length - filteredNames.length,
    envVarNames: filteredNames,
  };
});
