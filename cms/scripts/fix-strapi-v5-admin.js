// Fix pentru admin panel în Strapi v5 - force bootstrap configuration
const { createStrapi } = require("@strapi/strapi");

async function bootstrapStrapiv5AdminFix() {
  const strapi = await createStrapi();
  await strapi.start();

  try {
    console.log("🔧 Applying Strapi v5 admin panel fixes...");
    
    // Verifică configurația admin
    console.log("Admin config:", strapi.admin?.config);
    console.log("Admin routes:", Object.keys(strapi.admin?.routes || {}));
    
    // Verifică plugin-urile
    console.log("Available plugins:", Object.keys(strapi.plugins || {}));
    console.log("Content Manager plugin:", !!strapi.plugins['content-manager']);
    console.log("Upload plugin:", !!strapi.plugins['upload']);
    console.log("Content Type Builder plugin:", !!strapi.plugins['content-type-builder']);
    
    // Verifică middleware-urile
    console.log("Middlewares:", strapi.config.get('middlewares', []));
    
    console.log("✅ Strapi v5 diagnostic complete");
    
  } catch (error) {
    console.error("❌ Error in Strapi v5 fix:", error);
  } finally {
    await strapi.destroy();
  }
}

bootstrapStrapiv5AdminFix().catch(console.error);