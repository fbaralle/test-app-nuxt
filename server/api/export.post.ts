export default defineEventHandler(async (event) => {
  let env;
  try {
    env = event.context.cloudflare?.env;
  } catch {
    // Local dev without Cloudflare bindings
  }

  if (!env?.MEDIA) {
    throw createError({
      statusCode: 503,
      message: "R2 storage binding not available",
    });
  }

  try {
    const body = await readBody(event);
    const exportId = `export-${Date.now()}`;
    const exportData = {
      id: exportId,
      createdAt: new Date().toISOString(),
      data: body,
    };

    await env.MEDIA.put(
      `exports/${exportId}`,
      JSON.stringify(exportData),
      {
        httpMetadata: {
          contentType: "application/json",
        },
      }
    );

    return {
      success: true,
      id: exportId,
      url: `/api/export?id=${exportId}`,
    };
  } catch (e) {
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "R2 error",
    });
  }
});
