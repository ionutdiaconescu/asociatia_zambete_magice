const { Client } = require("pg");

async function testConnection(config) {
  console.log("\n=== TESTARE CONFIGURATIE ===");
  console.log("Host:", config.host);
  console.log("Database:", config.database);
  console.log("User:", config.user);
  console.log("Password:", config.password.substring(0, 3) + "***");
  console.log("=============================\n");

  const client = new Client(config);

  try {
    console.log("🔄 Se încearcă conectarea la baza de date...");
    await client.connect();
    console.log("✅ Conexiunea la PostgreSQL a reușit!");

    // Test query
    const result = await client.query("SELECT NOW() as current_time");
    console.log(
      "🕐 Timpul curent din baza de date:",
      result.rows[0].current_time
    );

    await client.end();
    console.log("✅ Conexiunea închisă cu succes");
  } catch (error) {
    console.error("❌ Eroare la conectarea la baza de date:");
    console.error("Cod eroare:", error.code);
    console.error("Mesaj:", error.message);

    if (error.code === "ENOTFOUND") {
      console.error("🔍 Verifică hostname-ul bazei de date");
    } else if (error.code === "ECONNREFUSED") {
      console.error("🔍 Verifică portul și dacă serverul rulează");
    } else if (error.code === "28P01") {
      console.error("🔍 Parolă sau nume utilizator incorect");
    } else if (error.code === "3D000") {
      console.error("🔍 Baza de date specificată nu există");
    }
  }
}

testConnection();

// Testează cu configurația Supabase standard
console.log("📋 TESTARE 1: Configurația actuală");
testConnection({
  host: "gbzwxjdsinimqdgkvtsu.supabase.co",
  port: 5432,
  database: "asociatia_zambete_magice",
  user: "ionutdiaconescu",
  password: "14081995.IonuttttS",
  ssl: {
    rejectUnauthorized: false,
  },
});

// Testează cu configurația Supabase corectă (probabil)
setTimeout(() => {
  console.log('\n📋 TESTARE 2: Cu database="postgres" și user="postgres"');
  testConnection({
    host: "gbzwxjdsinimqdgkvtsu.supabase.co",
    port: 5432,
    database: "postgres", // Supabase folosește întotdeauna 'postgres'
    user: "postgres", // Supabase folosește întotdeauna 'postgres'
    password: "14081995.IonuttttS", // Încearcă cu aceeași parolă
    ssl: {
      rejectUnauthorized: false,
    },
  });
}, 3000);

// Testează și alte variante comune
setTimeout(() => {
  console.log("\n📋 TESTARE 3: Fără SSL require");
  testConnection({
    host: "gbzwxjdsinimqdgkvtsu.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "14081995.IonuttttS",
    ssl: true, // SSL simplu
  });
}, 6000);
