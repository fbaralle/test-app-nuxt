export default defineEventHandler(async (event) => {
  let env;
  try {
    env = event.context.cloudflare?.env;
  } catch {
    // Local dev without Cloudflare bindings
  }

  if (!env?.DB) {
    throw createError({
      statusCode: 503,
      message: "D1 database binding not available",
    });
  }

  const query = getQuery(event);
  const userId = (query.user_id as string) || "public";
  const coinId = query.coin_id as string;

  if (!coinId) {
    throw createError({
      statusCode: 400,
      message: "coin_id is required",
    });
  }

  try {
    await env.DB.prepare(
      "DELETE FROM favorites WHERE user_id = ? AND coin_id = ?"
    )
      .bind(userId, coinId)
      .run();

    return { success: true, coin_id: coinId };
  } catch (e) {
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "Database error",
    });
  }
});
