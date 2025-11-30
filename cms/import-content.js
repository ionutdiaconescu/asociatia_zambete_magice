// import-content.js
const fetch = require("node-fetch");
const fs = require("fs");

const PROD_API = "https://asociatia-zambete-magice.onrender.com/api";
const LOCAL_API = "http://localhost:10000/api";
const LOCAL_TOKEN = "TOKEN_LOCAL_ADMIN"; // Inlocuieste cu token-ul tau local

async function exportSingleType(endpoint, filename) {
  const res = await fetch(`${PROD_API}/${endpoint}`);
  const data = await res.json();
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`Exportat ${endpoint} din productie.`);
}

async function importSingleType(endpoint, filename) {
  const content = require(`./${filename}`).data;
  await fetch(`${LOCAL_API}/${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOCAL_TOKEN}`,
    },
    body: JSON.stringify({ data: content }),
  });
  console.log(`Importat ${endpoint} pe local.`);
}

async function exportCollection(endpoint, filename) {
  const res = await fetch(`${PROD_API}/${endpoint}?pagination[pageSize]=1000`);
  const data = await res.json();
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`Exportat ${endpoint} din productie.`);
}

async function importCollection(endpoint, filename) {
  const items = require(`./${filename}`).data;
  for (const item of items) {
    await fetch(`${LOCAL_API}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOCAL_TOKEN}`,
      },
      body: JSON.stringify({ data: item }),
    });
  }
  console.log(`Importat ${endpoint} pe local.`);
}

(async () => {
  // Homepage (singleType)
  await exportSingleType("homepage", "homepage-prod.json");
  await importSingleType("homepage", "homepage-prod.json");

  // Campanii (collectionType)
  await exportCollection("campaigns", "campaigns-prod.json");
  await importCollection("campaigns", "campaigns-prod.json");
})();
