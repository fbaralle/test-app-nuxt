export default defineEventHandler(async (event) => {
  const { env } = event.context.cloudflare;
  const query = getQuery(event);
  const userId = (query.user_id as string) || "anonymous";
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
