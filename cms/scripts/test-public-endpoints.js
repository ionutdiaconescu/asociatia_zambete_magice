const baseUrl =
  process.env.PUBLIC_URL || "https://asociatia-zambete-magice.onrender.com";

(async () => {
  const fetch = (await import("node-fetch")).default;
  const tests = [
    { name: "Homepage", url: `${baseUrl}/api/homepage?populate=*` },
    {
      name: "Campaigns",
      url: `${baseUrl}/api/campaigns?populate=coverImage&sort=createdAt:desc&pagination[pageSize]=5`,
    },
    {
      name: "About page",
      url: `${baseUrl}/api/pages?filters[slug][$eq]=about&pagination[pageSize]=1`,
    },
  ];

  console.log(`\nTesting public endpoints at ${baseUrl}\n`);
  for (const t of tests) {
    try {
      const res = await fetch(t.url);
      const ct = res.headers.get("content-type") || "";
      let info = "";
      if (ct.includes("application/json")) {
        const json = await res.json();
        if (json && json.data !== undefined) {
          if (Array.isArray(json.data)) info = `data.len=${json.data.length}`;
          else if (json.data && typeof json.data === "object")
            info = `data.keys=${Object.keys(json.data).length}`;
        }
      }
      console.log(`✅ ${t.name}: ${res.status} ${res.statusText} ${info}`);
    } catch (e) {
      console.log(`❌ ${t.name}: ${e.message}`);
    }
  }
})();
