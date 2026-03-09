"use strict";

// One-time fixer for upload plugin DB settings.
// Useful when Media Library image uploads fail with 500 due to optimization pipeline.

const { createStrapi } = require("@strapi/strapi");

(async () => {
  const app = await createStrapi().load();
  try {
    const store = app.store({
      type: "plugin",
      name: "upload",
      key: "settings",
    });

    const before = (await store.get()) || {};
    const after = {
      ...before,
      sizeOptimization: false,
      responsiveDimensions: false,
      autoOrientation: false,
      aiMetadata: false,
    };

    await store.set({ value: after });

    console.log("[fix-upload-settings] before:", before);
    console.log("[fix-upload-settings] after:", after);
    console.log("[fix-upload-settings] done");
  } catch (e) {
    console.error(
      "[fix-upload-settings] failed:",
      e && e.message ? e.message : e,
    );
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
})();
