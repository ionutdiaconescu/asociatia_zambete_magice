"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/homepage",
      handler: "homepage.find",
      config: { policies: [], middlewares: [] },
    },
    {
      method: "PUT",
      path: "/homepage",
      handler: "homepage.update",
      config: { policies: [], middlewares: [] },
    },
  ],
};
