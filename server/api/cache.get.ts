const CACHE_TTL = 60; // 1 minute cache

export default defineEventHandler(async (event) => {
  const { env } = event.context.cloudflare;
  const query = getQuery(event);
  const key = (query.key as string) || "default";
  const cacheKey = `cache:${key}`;

  try {
    // Try to get from KV cache
    const cached = await env.SESSIONS.get(cacheKey);
    if (cached) {
      return {
        data: JSON.parse(cached),
        cached: true,
        key,
      };
    }

    // Generate fresh data (simulated)
    const freshData = {
      timestamp: new Date().toISOString(),
      key,
      value: `Data for ${key} generated at ${Date.now()}`,
    };

    // Store in KV with TTL
    await env.SESSIONS.put(cacheKey, JSON.stringify(freshData), {
      expirationTtl: CACHE_TTL,
    });

    return {
      data: freshData,
      cached: false,
      key,
    };
  } catch (e) {
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "Cache error",
    });
  }
});
