interface Favorite {
  id: number;
  user_id: string;
  coin_id: string;
  coin_name: string | null;
  coin_symbol: string | null;
  coin_image: string | null;
  created_at: number;
}

export default defineEventHandler(async (event) => {
  const { env } = event.context.cloudflare;
  const query = getQuery(event);
  const userId = (query.user_id as string) || "public";

  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC"
    )
      .bind(userId)
      .all<Favorite>();

    return { favorites: results };
  } catch (e) {
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "Database error",
    });
  }
});
