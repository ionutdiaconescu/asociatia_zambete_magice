const routes = [
  "/api",
  "/api/campaigns",
  "/api/campanie-de-donatiis",
  "/api/campanie-de-donatii",
  "/api/donatii",
  "/api/donatiis",
  "/api/homepage",
  "/api/pages",
  "/admin",
  "/",
];

const baseUrl = "https://asociatia-zambete-magice.onrender.com";

async function testRoutes() {
  console.log("=== TESTING ROUTES ===");

  for (const route of routes) {
    try {
      const response = await fetch(baseUrl + route);
      console.log(`${route}: ${response.status} ${response.statusText}`);

      if (response.status === 200) {
        const text = await response.text();
        console.log(`  Content preview: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`${route}: ERROR - ${error.message}`);
    }
  }
}

testRoutes();
