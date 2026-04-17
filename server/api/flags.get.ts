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
      return {
        error: "FLAGS KV binding not available",
        flags: DEFAULT_FLAGS,
      };
    }

    // Get all flags from KV
    const flags: FeatureFlags = { ...DEFAULT_FLAGS };

    for (const key of Object.keys(DEFAULT_FLAGS)) {
      const value = await kv.get(`flag:${key}`);
      if (value !== null) {
        flags[key] = value === "true";
      }
    }

    return { flags };
  } catch (e) {
    // Return default flags on error (e.g., local dev without bindings)
    return {
      error: e instanceof Error ? e.message : "KV error",
      flags: DEFAULT_FLAGS,
    };
  }
});
