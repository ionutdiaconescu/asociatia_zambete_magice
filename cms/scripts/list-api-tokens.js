#!/usr/bin/env node
"use strict";
// List admin API tokens with details (read-only)
const { createStrapi } = require("@strapi/strapi");

async function listTokens() {
  const app = await createStrapi().load();
  try {
    const tokens = await app.entityService.findMany("admin::api-token", {
      limit: -1,
    });
    console.log(`Found ${tokens.length} admin API tokens:`);
    for (const t of tokens) {
      console.log(
        `- id=${t.id} name='${t.name}' type=${t.type} lifespan=${t.lifespan} createdAt=${t.createdAt || "n/a"} description='${t.description || ""}'`
      );
    }
  } catch (e) {
    console.error("Error listing tokens:", e && e.message ? e.message : e);
  } finally {
    await app.destroy();
  }
}

if (require.main === module) listTokens();

module.exports = listTokens;
