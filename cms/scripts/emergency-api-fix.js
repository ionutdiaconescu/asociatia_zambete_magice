// Emergency API endpoint to create admin token when admin panel is broken
const { createStrapi } = require("@strapi/strapi");

async function createEmergencyEndpoint() {
  console.log(
    "🚨 [EMERGENCY ENDPOINT] Creating emergency API token endpoint...\n"
  );

  try {
    const app = await createStrapi().load();

    // Add a special route that creates API token
    const router = app.server.router;

    // Emergency endpoint to list all API tokens
    router.get("/admin/emergency-tokens", async (ctx) => {
      try {
        console.log("🚨 Emergency list tokens endpoint called");

        const tokens = await app.entityService.findMany("admin::api-token", {
          populate: "*",
        });

        console.log(`📋 Found ${tokens.length} API tokens`);

        ctx.body = {
          success: true,
          count: tokens.length,
          tokens: tokens.map((token) => ({
            id: token.id,
            name: token.name,
            description: token.description,
            type: token.type,
            accessKey: token.accessKey
              ? token.accessKey.substring(0, 20) + "..."
              : "No key",
            lifespan: token.lifespan,
            lastUsedAt: token.lastUsedAt,
            createdAt: token.createdAt,
            updatedAt: token.updatedAt,
          })),
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("💥 List tokens error:", error);
        ctx.status = 500;
        ctx.body = {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    });

    // Emergency endpoint to create API token (accessible via direct URL)
    router.get("/admin/emergency-fix", async (ctx) => {
      try {
        console.log("🚨 Emergency fix endpoint called");

        // Create emergency API token
        const emergencyToken = await app.entityService.create(
          "admin::api-token",
          {
            data: {
              name: "Emergency-Admin-Token",
              description: "Emergency token created via direct endpoint",
              type: "full-access",
              accessKey: require("crypto").randomBytes(32).toString("hex"),
              lifespan: null, // unlimited
            },
          }
        );

        console.log(`✅ Emergency token created: ${emergencyToken.name}`);

        // Also fix Users & Permissions
        const roles = await app.entityService.findMany(
          "plugin::users-permissions.role"
        );
        const publicRole = roles.find((r) => r.type === "public");

        if (publicRole) {
          const publicPerms = await app.entityService.findMany(
            "plugin::users-permissions.permission",
            {
              filters: { role: publicRole.id },
            }
          );

          if (publicPerms.length === 0) {
            const basicPerms = [
              "api::campaign.campaign.find",
              "api::campaign.campaign.findOne",
              "api::homepage.homepage.find",
            ];

            for (const action of basicPerms) {
              await app.entityService.create(
                "plugin::users-permissions.permission",
                {
                  data: {
                    action: action,
                    enabled: true,
                    policy: "",
                    role: publicRole.id,
                  },
                }
              );
            }
            console.log("✅ Added public permissions");
          }
        }

        ctx.body = {
          success: true,
          message: "Emergency fix applied successfully",
          token: {
            name: emergencyToken.name,
            accessKey: emergencyToken.accessKey.substring(0, 20) + "...",
          },
          timestamp: new Date().toISOString(),
        };

        console.log("🎉 Emergency fix completed via endpoint");
      } catch (error) {
        console.error("💥 Emergency endpoint error:", error);
        ctx.status = 500;
        ctx.body = {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    });

    // Emergency endpoint to check admin panel status
    router.get("/admin/emergency-status", async (ctx) => {
      try {
        console.log("🚨 Emergency status check endpoint called");

        // Get comprehensive status
        const tokens = await app.entityService.findMany("admin::api-token");
        const adminUsers = await app.entityService.findMany("admin::user");
        const roles = await app.entityService.findMany("admin::role");
        const contentTypes = Object.keys(app.contentTypes);

        // Check admin permissions
        const superAdminRole = roles.find(
          (r) => r.code === "strapi-super-admin"
        );
        let adminPermissions = 0;
        if (superAdminRole) {
          const permissions = await app.entityService.findMany(
            "admin::permission",
            {
              filters: { role: superAdminRole.id },
            }
          );
          adminPermissions = permissions.length;
        }

        ctx.body = {
          success: true,
          status: {
            apiTokens: tokens.length,
            adminUsers: adminUsers.length,
            adminRoles: roles.length,
            contentTypes: contentTypes.length,
            adminPermissions: adminPermissions,
            database: app.db ? "Connected" : "Disconnected",
          },
          details: {
            tokens: tokens.map((t) => ({
              id: t.id,
              name: t.name,
              type: t.type,
            })),
            users: adminUsers.map((u) => ({
              id: u.id,
              firstname: u.firstname,
              email: u.email,
            })),
            roles: roles.map((r) => ({ id: r.id, name: r.name, code: r.code })),
          },
          timestamp: new Date().toISOString(),
        };

        console.log(
          `📊 Status: ${tokens.length} tokens, ${adminUsers.length} users, ${adminPermissions} permissions`
        );
      } catch (error) {
        console.error("💥 Status check error:", error);
        ctx.status = 500;
        ctx.body = {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    });

    console.log("✅ Emergency endpoint registered at: /admin/emergency-fix");
  } catch (error) {
    console.error("💥 Failed to create emergency endpoint:", error);
  }
}

module.exports = createEmergencyEndpoint;

// If run directly, just create token
if (require.main === module) {
  (async () => {
    const app = await createStrapi().load();

    const emergencyToken = await app.entityService.create("admin::api-token", {
      data: {
        name: "Direct-Emergency-Token",
        description: "Token created directly via script",
        type: "full-access",
        accessKey: require("crypto").randomBytes(32).toString("hex"),
        lifespan: null,
      },
    });

    console.log("🚨 EMERGENCY TOKEN CREATED:");
    console.log(`Name: ${emergencyToken.name}`);
    console.log(`Access Key: ${emergencyToken.accessKey}`);
    console.log(`Type: ${emergencyToken.type}`);

    process.exit(0);
  })();
}
