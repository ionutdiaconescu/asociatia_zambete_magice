#!/usr/bin/env node

console.log("=== DIAGNOSTIC STRAPI DB CONNECTION ===\n");

// 1. Test încărcare .env
require("dotenv").config();
console.log("1. TEST ÎNCĂRCARE .ENV:");
const dbVars = {
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PORT: process.env.DATABASE_PORT,
  DATABASE_NAME: process.env.DATABASE_NAME,
  DATABASE_USERNAME: process.env.DATABASE_USERNAME,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD ? "***SET***" : "MISSING",
};
console.log(JSON.stringify(dbVars, null, 2));
console.log("");

// 2. Test citire config database.js
console.log("2. TEST CITIRE CONFIG DATABASE.JS:");
try {
  const databaseConfig = require("./config/database.js");
  console.log("✅ Fișierul se încarcă");

  // Test cu { env } (metoda oficială Strapi)
  const strapiEnv = (key, defaultValue) => {
    const value = process.env[key];
    return value !== undefined ? value : defaultValue;
  };
  strapiEnv.int = (key, defaultValue) => {
    const value = process.env[key];
    return value !== undefined ? parseInt(value, 10) : defaultValue;
  };

  const config = databaseConfig({ env: strapiEnv });
  console.log("Config generat:");
  console.log(JSON.stringify(config, null, 2));

  // Verifică structura
  if (config.connection && config.connection.client) {
    console.log("✅ Structura config este corectă");
  } else {
    console.log("❌ Structura config este greșită");
    console.log("  - connection:", !!config.connection);
    console.log(
      "  - connection.client:",
      config.connection ? config.connection.client : "N/A"
    );
  }
} catch (err) {
  console.log("❌ Eroare la încărcarea config:", err.message);
}
console.log("");

// 3. Test conexiune directă cu pg
console.log("3. TEST CONEXIUNE DIRECTĂ CU PG:");
try {
  const { Client } = require("pg");

  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
  });

  client
    .connect()
    .then(() => {
      console.log("✅ Conexiune directă cu pg REUȘITĂ");
      return client.query("SELECT version()");
    })
    .then((result) => {
      console.log(
        "✅ Query test reușit:",
        result.rows[0].version.substring(0, 50) + "..."
      );
      return client.end();
    })
    .then(() => {
      console.log("✅ Conexiune închisă cu succes");
      testStrapiDirect();
    })
    .catch((err) => {
      console.log("❌ Eroare conexiune pg:", err.message);
      testStrapiDirect();
    });
} catch (err) {
  console.log("❌ Eroare la încărcarea pg:", err.message);
  testStrapiDirect();
}

// 4. Test Strapi direct (fără wrapper)
function testStrapiDirect() {
  console.log("\n4. TEST STRAPI DIRECT:");

  try {
    // Simulează ce face Strapi intern
    const databaseConfig = require("./config/database.js");
    const strapiEnv = (key, defaultValue) => {
      const value = process.env[key];
      return value !== undefined ? value : defaultValue;
    };
    strapiEnv.int = (key, defaultValue) => {
      const value = process.env[key];
      return value !== undefined ? parseInt(value, 10) : defaultValue;
    };

    const config = databaseConfig({ env: strapiEnv });

    // Simulează ce face Strapi la getDialect
    console.log("Testez destructuring ca în Strapi...");

    if (config && config.connection && config.connection.client) {
      const { client } = config.connection;
      console.log("✅ Destructuring reușit, client:", client);
    } else {
      console.log("❌ Destructuring eșuat");
      console.log("config:", !!config);
      console.log("config.connection:", config ? !!config.connection : "N/A");
      console.log(
        "config.connection.client:",
        config && config.connection ? config.connection.client : "N/A"
      );
    }
  } catch (err) {
    console.log("❌ Eroare test Strapi:", err.message);
    console.log(err.stack);
  }

  console.log("\n=== DIAGNOSTIC COMPLET ===");
}
