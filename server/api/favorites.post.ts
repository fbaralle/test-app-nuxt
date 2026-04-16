export default defineEventHandler(async (event) => {
  const { env } = event.context.cloudflare;

  try {
    const body = await readBody(event);
    const { user_id = "public", coin_id, coin_name, coin_symbol, coin_image } = body;

    if (!coin_id) {
      throw createError({
        statusCode: 400,
        message: "coin_id is required",
      });
    }

    await env.DB.prepare(
      "INSERT OR IGNORE INTO favorites (user_id, coin_id, coin_name, coin_symbol, coin_image, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(user_id, coin_id, coin_name || null, coin_symbol || null, coin_image || null, Date.now())
      .run();

    return { success: true, coin_id };
  } catch (e) {
    if ((e as any).statusCode) throw e;
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "Database error",
    });
  }
});
