const VIEWS_KEY = "pageviews:total";
const UNIQUE_KEY = "pageviews:unique";

export default defineEventHandler(async (event) => {
  try {
    const { env } = event.context.cloudflare;
    const kv = env?.SESSIONS;

    if (!kv) {
      throw createError({
        statusCode: 503,
        message: "SESSIONS KV binding not available",
      });
    }

    const [totalViews, uniqueVisitors] = await Promise.all([
      kv.get(VIEWS_KEY),
      kv.get(UNIQUE_KEY),
    ]);

    return {
      totalViews: parseInt(totalViews || "0", 10),
      uniqueVisitors: parseInt(uniqueVisitors || "0", 10),
    };
  } catch (e) {
    if ((e as any).statusCode) throw e;
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "KV error",
    });
  }
});
