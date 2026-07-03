export function getHealthCheckUrl(apiBaseUrl: string | undefined): string {
  const normalized = (apiBaseUrl || "http://localhost:8000").replace(/\/$/, "");
  return `${normalized}/health`;
}

export async function pingHealthCheck(apiBaseUrl: string | undefined): Promise<boolean> {
  try {
    const response = await fetch(getHealthCheckUrl(apiBaseUrl), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return response.ok;
  } catch {
    return false;
  }
}
