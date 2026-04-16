export default defineEventHandler(async (event) => {
  const { env } = event.context.cloudflare;
  const query = getQuery(event);
  const exportId = query.id as string;

  if (!exportId) {
    // List recent exports
    try {
      const list = await env.WEBFLOW_CLOUD_MEDIA.list({ prefix: "exports/", limit: 10 });
      const exports = list.objects.map((obj) => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded.toISOString(),
      }));
      return { exports };
    } catch (e) {
      throw createError({
        statusCode: 500,
        message: e instanceof Error ? e.message : "R2 error",
      });
    }
  }

  // Get specific export
  try {
    const object = await env.WEBFLOW_CLOUD_MEDIA.get(`exports/${exportId}`);
    if (!object) {
      throw createError({
        statusCode: 404,
        message: "Export not found",
      });
    }

    const data = await object.text();
    return {
      id: exportId,
      data: JSON.parse(data),
      metadata: {
        size: object.size,
        uploaded: object.uploaded.toISOString(),
      },
    };
  } catch (e) {
    if ((e as any).statusCode) throw e;
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "R2 error",
    });
  }
});
