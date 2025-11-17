"use strict";

module.exports = {
  async ping(ctx) {
    ctx.body = { ok: true, ts: new Date().toISOString() };
  },

  async routes(ctx) {
    try {
      const stack =
        (strapi.server && strapi.server.router && strapi.server.router.stack) ||
        [];
      const items = [];
      for (const layer of stack) {
        try {
          const methods = (layer.methods || []).filter(Boolean);
          const path = layer.path || layer.regexp?.toString?.() || "";
          if (methods.length && path) {
            items.push({ methods, path });
          }
        } catch (_) {}
      }
      ctx.body = { ok: true, count: items.length, routes: items };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { ok: false, error: e.message };
    }
  },
};
