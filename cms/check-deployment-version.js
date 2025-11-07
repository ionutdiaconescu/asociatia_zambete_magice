// Check if the latest deployment with rebuilt admin is actually live
async function checkDeploymentVersion() {
  console.log("🔍 Checking Deployment Version\n");

  // Use dynamic import for fetch
  const fetch = (await import("node-fetch")).default;

  const baseUrl = "https://asociatia-zambete-magice.onrender.com";

  try {
    // Test if emergency endpoints work (these were added in commit 289510e)
    console.log("1️⃣ Testing emergency endpoints availability...");

    const emergencyResponse = await fetch(`${baseUrl}/admin/emergency-status`);
    console.log(`Emergency Status: ${emergencyResponse.status}`);

    if (emergencyResponse.status === 200) {
      const data = await emergencyResponse.json();
      console.log("✅ Emergency endpoints are LIVE");
      console.log(`📊 System Status:`);
      console.log(`   - API Tokens: ${data.status?.apiTokens || "Unknown"}`);
      console.log(`   - Admin Users: ${data.status?.adminUsers || "Unknown"}`);
      console.log(`   - Database: ${data.status?.database || "Unknown"}`);
      console.log(`   - Timestamp: ${data.timestamp || "Unknown"}\n`);
    } else {
      console.log("❌ Emergency endpoints NOT available yet\n");
    }

    // Test admin panel response time and content
    console.log("2️⃣ Testing admin panel...");
    const adminStart = Date.now();
    const adminResponse = await fetch(`${baseUrl}/admin`);
    const adminTime = Date.now() - adminStart;

    console.log(`Admin Panel: ${adminResponse.status} (${adminTime}ms)`);

    const adminContent = await adminResponse.text();
    const hasNewBuild =
      adminContent.includes("strapi") && adminContent.includes("admin");
    console.log(
      `Admin content check: ${hasNewBuild ? "✅ Valid" : "❌ Invalid"}`
    );

    // Test if production auto-fix is running (added in commit 3658b6e)
    console.log("\n3️⃣ Testing production auto-fix...");
    const healthResponse = await fetch(`${baseUrl}/_health`);
    console.log(`Health check: ${healthResponse.status}`);

    if (healthResponse.status === 204) {
      console.log("✅ Server is running");

      // Check if we can access the built admin files
      const assetsResponse = await fetch(`${baseUrl}/admin/assets/main.css`);
      console.log(`Admin assets: ${assetsResponse.status} (CSS check)`);

      if (assetsResponse.status === 200) {
        console.log("✅ New admin build files are served");
      } else {
        console.log("⚠️ Admin build files might not be ready yet");
      }
    }
  } catch (error) {
    console.error("❌ Error checking deployment:", error.message);
  }

  console.log("\n⏰ Deployment might still be in progress...");
  console.log(
    "💡 Render deployments can take 5-15 minutes for full completion"
  );
}

checkDeploymentVersion();
