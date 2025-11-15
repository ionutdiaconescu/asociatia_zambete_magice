"use strict";

// Converted to function form so we can read env for dynamic CORS origins.
module.exports = ({ env }) => [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::cors",
    config: {
      origin: [
        env("FRONTEND_URL", "http://localhost:5173"),
        "https://asociatia-zambete-magice.vercel.app",
        "https://asociatia-zambete-magice.onrender.com", // Add self-origin for admin
        ...(env("CORS_EXTRA_ORIGINS") || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      headers: "*",
      credentials: true, // Important pentru admin authentication
    },
  },
  "strapi::security",
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
  {
    name: "strapi::session",
    config: {
      cookie: {
        secure: false, //env.bool("SESSION_COOKIE_SECURE", true),
        sameSite: "lax",
      },
    },
  },
  "strapi::favicon",
  "strapi::public",
];
];
