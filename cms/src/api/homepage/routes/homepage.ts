export default {
  routes: [
    { method: "GET", path: "/homepage", handler: "homepage.find" },
    { method: "PUT", path: "/homepage", handler: "homepage.update" },
  ],
};
