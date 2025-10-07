export default {
  routes: [
    {
      method: "GET",
      path: "/stats",
      handler: "stats.overview",
      config: { auth: false },
    },
  ],
};
