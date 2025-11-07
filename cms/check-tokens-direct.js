// Direct database check for API tokens - bypasses web interface
const { createStrapi } = require("@strapi/strapi");

async function checkTokensDirect() {
  console.log(
    "🔍 [DIRECT CHECK] Checking API tokens directly in database...\n"
  );

  try {
    // Load Strapi without starting the server
    const strapi = await createStrapi().load();

    console.log("✅ Strapi loaded successfully");
    console.log("✅ Database connected\n");

    // 1. Check API tokens
    console.log("1️⃣ Checking API Tokens:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const tokens = await strapi.entityService.findMany("admin::api-token", {
      populate: "*",
    });

    console.log(`📊 Total API Tokens: ${tokens.length}`);

    if (tokens.length > 0) {
      tokens.forEach((token, index) => {
        console.log(`\n  Token ${index + 1}:`);
        console.log(`    ID: ${token.id}`);
        console.log(`    Name: ${token.name}`);
        console.log(`    Type: ${token.type}`);
        console.log(
          `    Description: ${token.description || "No description"}`
        );
        console.log(
          `    Access Key: ${token.accessKey ? token.accessKey.substring(0, 20) + "..." : "No key"}`
        );
        console.log(`    Lifespan: ${token.lifespan || "Unlimited"}`);
        console.log(`    Created: ${token.createdAt}`);
        console.log(`    Last Used: ${token.lastUsedAt || "Never"}`);
      });
    } else {
      console.log("  ❌ No API tokens found in database");
    }

    // 2. Check admin users
    console.log("\n\n2️⃣ Checking Admin Users:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const adminUsers = await strapi.entityService.findMany("admin::user");
    console.log(`📊 Total Admin Users: ${adminUsers.length}`);

    if (adminUsers.length > 0) {
      adminUsers.forEach((user, index) => {
        console.log(`\n  User ${index + 1}:`);
        console.log(`    ID: ${user.id}`);
        console.log(`    Email: ${user.email}`);
        console.log(`    Name: ${user.firstname} ${user.lastname}`);
        console.log(`    Active: ${user.isActive ? "Yes" : "No"}`);
        console.log(`    Created: ${user.createdAt}`);
      });
    }

    // 3. Check admin roles and permissions
    console.log("\n\n3️⃣ Checking Admin Roles & Permissions:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const roles = await strapi.entityService.findMany("admin::role");
    console.log(`📊 Total Admin Roles: ${roles.length}`);

    for (const role of roles) {
      console.log(`\n  Role: ${role.name} (${role.code})`);

      const permissions = await strapi.entityService.findMany(
        "admin::permission",
        {
          filters: { role: role.id },
        }
      );

      console.log(`    Permissions: ${permissions.length}`);
    }

    // 4. Test creating a new token
    console.log("\n\n4️⃣ Creating Test Token:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    try {
      const testToken = await strapi.entityService.create("admin::api-token", {
        data: {
          name: `Test-Token-${Date.now()}`,
          description: "Test token created via direct script",
          type: "full-access",
          accessKey: require("crypto").randomBytes(32).toString("hex"),
          lifespan: null,
        },
      });

      console.log("✅ Test token created successfully:");
      console.log(`    Name: ${testToken.name}`);
      console.log(`    Access Key: ${testToken.accessKey}`);
      console.log(`    ID: ${testToken.id}`);

      // Verify it was saved
      const allTokensAfter =
        await strapi.entityService.findMany("admin::api-token");
      console.log(`📊 Total tokens after creation: ${allTokensAfter.length}`);
    } catch (createError) {
      console.error("❌ Failed to create test token:", createError.message);
    }

    console.log("\n🎉 Direct database check completed!");
  } catch (error) {
    console.error("💥 Error during direct check:", error);
  } finally {
    process.exit(0);
  }
}

// Run the check
checkTokensDirect().catch(console.error);
