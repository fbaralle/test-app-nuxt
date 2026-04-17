interface FeatureFlags {
  [key: string]: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  dark_mode: true,
  show_favorites: true,
  show_exports: true,
  show_page_views: true,
  experimental_features: false,
};

export default defineEventHandler(async (event) => {
  try {
    const { env } = event.context.cloudflare;
    const kv = env?.FLAGS;

    if (!kv) {
      throw createError({
        statusCode: 503,
        message: "FLAGS KV binding not available",
      });
    }

    const body = await readBody(event);
    const { flag, value } = body as { flag: string; value: boolean };

    if (!flag || typeof value !== "boolean") {
      throw createError({
        statusCode: 400,
        message: "flag (string) and value (boolean) are required",
      });
    }

    if (!(flag in DEFAULT_FLAGS)) {
      throw createError({
        statusCode: 400,
        message: `Unknown flag: ${flag}`,
      });
    }

    await kv.put(`flag:${flag}`, String(value));

    return { success: true, flag, value };
  } catch (e) {
    if ((e as any).statusCode) throw e;
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "KV error",
    });
  }
});
