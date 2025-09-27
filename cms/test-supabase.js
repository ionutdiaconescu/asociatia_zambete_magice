const { Client } = require("pg");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function testSupabaseConnection(password) {
  const config = {
    host: "gbzwxjdsinimqdgkvtsu.supabase.co",
    port: 5432,
    database: "postgres", // Supabase folosește întotdeauna 'postgres'
    user: "postgres", // Supabase folosește întotdeauna 'postgres'
    password: password,
    ssl: {
      rejectUnauthorized: false,
    },
  };

  console.log("\n=== TESTARE CONEXIUNE SUPABASE ===");
  console.log("Host:", config.host);
  console.log("Database:", config.database);
  console.log("User:", config.user);
  console.log(
    "Password:",
    password.substring(0, 3) + "*".repeat(password.length - 3)
  );
  console.log("====================================\n");

  const client = new Client(config);

  try {
    console.log("🔄 Se încearcă conectarea la Supabase...");
    await client.connect();
    console.log("✅ Conexiunea la Supabase a reușit!");

    // Test query
    const result = await client.query(
      "SELECT NOW() as current_time, version() as pg_version"
    );
    console.log(
      "🕐 Timpul curent din baza de date:",
      result.rows[0].current_time
    );
    console.log(
      "🗄️  Versiunea PostgreSQL:",
      result.rows[0].pg_version.split(" ")[0] +
        " " +
        result.rows[0].pg_version.split(" ")[1]
    );

    // Test să vezi ce tabele există
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("\n📋 Tabele existente în baza de date:");
    if (tables.rows.length === 0) {
      console.log("   (nicio tabelă găsită - baza de date este goală)");
    } else {
      tables.rows.forEach((row) => {
        console.log("   -", row.table_name);
      });
    }

    await client.end();
    console.log("\n✅ Conexiunea închisă cu succes");
    console.log("\n🎉 CONEXIUNEA LA SUPABASE FUNCȚIONEAZĂ!");
    console.log("💡 Poți actualiza fișierul .env cu aceste credentiale.");

    return true;
  } catch (error) {
    console.error("\n❌ Eroare la conectarea la Supabase:");
    console.error("Cod eroare:", error.code);
    console.error("Mesaj:", error.message);

    if (error.code === "ENOTFOUND") {
      console.error("🔍 Verifică hostname-ul bazei de date");
    } else if (error.code === "ECONNREFUSED") {
      console.error("🔍 Verifică portul și dacă serverul rulează");
    } else if (error.code === "28P01") {
      console.error("🔍 Parolă sau nume utilizator incorect");
      console.error(
        "💡 Verifică dacă parola a fost introdusă corect în Supabase"
      );
    } else if (error.code === "3D000") {
      console.error("🔍 Baza de date specificată nu există");
    } else if (error.code === "ETIMEDOUT") {
      console.error(
        "🔍 Conexiunea a expirat - verifică conexiunea la internet"
      );
    }

    return false;
  }
}

// Funcție pentru a actualiza .env dacă conexiunea reușește
function updateEnvFile(password) {
  const fs = require("fs");
  const path = require("path");

  const envPath = path.join(__dirname, ".env");
  let envContent = fs.readFileSync(envPath, "utf8");

  // Actualizează valorile pentru Supabase
  envContent = envContent.replace(
    /DATABASE_NAME=.*/g,
    "DATABASE_NAME=postgres"
  );
  envContent = envContent.replace(
    /DATABASE_USERNAME=.*/g,
    "DATABASE_USERNAME=postgres"
  );
  envContent = envContent.replace(
    /DATABASE_PASSWORD=.*/g,
    `DATABASE_PASSWORD=${password}`
  );

  fs.writeFileSync(envPath, envContent);
  console.log("📝 Fișierul .env a fost actualizat cu credentialele corecte!");
}

// Începe testarea
console.log("🔐 Test conexiune la Supabase PostgreSQL");
console.log("=====================================\n");

rl.question(
  "Introdu noua parolă pe care ai setat-o în Supabase: ",
  async (password) => {
    if (!password.trim()) {
      console.log("❌ Parola nu poate fi goală!");
      rl.close();
      return;
    }

    const success = await testSupabaseConnection(password.trim());

    if (success) {
      rl.question(
        "\nVrei să actualizez automat fișierul .env cu aceste credentiale? (y/n): ",
        (answer) => {
          if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
            updateEnvFile(password.trim());
            console.log(
              "\n🎯 Gata! Acum poți rula `npm run develop` pentru a porni Strapi."
            );
          } else {
            console.log("\n💡 Actualizează manual fișierul .env cu:");
            console.log("   DATABASE_NAME=postgres");
            console.log("   DATABASE_USERNAME=postgres");
            console.log(`   DATABASE_PASSWORD=${password.trim()}`);
          }
          rl.close();
        }
      );
    } else {
      console.log(
        "\n💡 Verifică parola în dashboard-ul Supabase și încearcă din nou."
      );
      rl.close();
    }
  }
);
