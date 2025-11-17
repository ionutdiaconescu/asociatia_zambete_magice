"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/__ping",
      handler: "diagnostics.ping",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/__routes",
      handler: "diagnostics.routes",
      config: { auth: false },
    },
  ],
};
