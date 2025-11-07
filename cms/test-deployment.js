// Quick test of production deployment status
async function testDeployment() {
  console.log("🚀 Testing Production Deployment Status\n");

  const baseUrl = "https://asociatia-zambete-magice.onrender.com";

  // Use dynamic import for fetch
  const fetch = (await import("node-fetch")).default;

  const tests = [
    { name: "Health Check", url: `${baseUrl}/_health` },
    { name: "Admin Panel", url: `${baseUrl}/admin` },
    { name: "Emergency Status", url: `${baseUrl}/admin/emergency-status` },
    { name: "Emergency Tokens", url: `${baseUrl}/admin/emergency-tokens` },
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const response = await fetch(test.url);
      console.log(`✅ ${test.name}: ${response.status} ${response.statusText}`);

      if (test.name === "Emergency Status" && response.status === 200) {
        const data = await response.json();
        console.log(`   📊 API Tokens: ${data.status?.apiTokens || "Unknown"}`);
        console.log(
          `   👥 Admin Users: ${data.status?.adminUsers || "Unknown"}`
        );
        console.log(`   💾 Database: ${data.status?.database || "Unknown"}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }

  console.log("\n🎯 Deployment Test Complete");
}

testDeployment();
