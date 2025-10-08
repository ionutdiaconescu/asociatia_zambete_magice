"use strict";

// Converted to function form so we can read env for dynamic CORS origins.
module.exports = ({ env }) => [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      origin: [
        env("FRONTEND_URL", "http://localhost:5173"),
        // You can add additional allowed origins here or via CORS_EXTRA_ORIGINS
        ...(env("CORS_EXTRA_ORIGINS") || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      headers: "*",
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  {
    name: "strapi::body",
    config: {
      jsonLimit: "3mb",
      formLimit: "3mb",
      textLimit: "3mb",
      includeUnparsed: true,
    },
  },
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
