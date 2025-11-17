/*
 Export legacy content tables likely left in DB after API removal.
 It inspects public schema for table names matching common patterns and dumps JSON.
*/
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { createStrapi } = require("@strapi/strapi");

const PATTERNS = [
  "%homepage%",
  "%campanie%",
  "%donatii%",
  "%donatie%",
  "%page%",
];

(async () => {
  const app = await createStrapi().load();
  try {
    const outDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outFile = path.join(outDir, `export-legacy-${stamp}.json`);

    const tablesRes = await app.db.connection
      .select("table_name")
      .from("information_schema.tables")
      .where("table_schema", "public")
      .whereNotIn("table_name", [
        // exclude known Strapi core + plugin tables prefixes - rough filter
      ])
      .andWhere(function () {
        for (const p of PATTERNS) this.orWhere("table_name", "ilike", p);
      })
      .orderBy("table_name", "asc");

    const tables = tablesRes.map((r) => r.table_name);
    console.log("Candidate tables:", tables);

    const dump = {};
    for (const t of tables) {
      try {
        const rows = await app.db.connection(t).select("*");
        dump[t] = rows;
        console.log(`Exported ${rows.length} rows from ${t}`);
      } catch (e) {
        console.warn(`Skip ${t}:`, e.message);
      }
    }

    fs.writeFileSync(outFile, JSON.stringify(dump, null, 2), "utf8");
    console.log("Written", outFile);
  } catch (err) {
    console.error("Export failed:", err);
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
})();
