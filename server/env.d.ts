/// <reference types="@cloudflare/workers-types" />

declare module "h3" {
  interface H3EventContext {
    cloudflare: {
      env: {
        DB: D1Database;
        SESSIONS: KVNamespace;
        FLAGS: KVNamespace;
        WEBFLOW_CLOUD_MEDIA: R2Bucket;
      };
    };
  }
}

export {};
