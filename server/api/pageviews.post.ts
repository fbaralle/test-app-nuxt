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

    // Get visitor ID from request body or generate one
    const body = await readBody(event).catch(() => ({}));
    const visitorId =
      body?.visitorId ||
      `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Increment total views
    const currentTotal = await kv.get(VIEWS_KEY);
    const newTotal = (parseInt(currentTotal || "0", 10) + 1).toString();
    await kv.put(VIEWS_KEY, newTotal);

    // Check if this is a unique visitor (track for 24 hours)
    const visitorKey = `visitor:${visitorId}`;
    const existingVisitor = await kv.get(visitorKey);

    let isNewVisitor = false;
    if (!existingVisitor) {
      isNewVisitor = true;
      // Mark visitor as seen for 24 hours
      await kv.put(visitorKey, "1", { expirationTtl: 86400 });

      // Increment unique visitors
      const currentUnique = await kv.get(UNIQUE_KEY);
      const newUnique = (parseInt(currentUnique || "0", 10) + 1).toString();
      await kv.put(UNIQUE_KEY, newUnique);
    }

    return {
      success: true,
      totalViews: parseInt(newTotal, 10),
      isNewVisitor,
      visitorId,
    };
  } catch (e) {
    if ((e as any).statusCode) throw e;
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "KV error",
    });
  }
});
