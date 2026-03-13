"use strict";
const path = require("path");
const fs = require("fs");

// Converted to function form so we can read env for dynamic CORS origins.
module.exports = ({ env }) => {
  const uploadTmpDir = env(
    "UPLOAD_TMP_DIR",
    env(
      "STRAPI_UPLOAD_TMP_DIR",
      path.join(process.cwd(), ".tmp", "uploads", "tmp"),
    ),
  );

  // Ensure multipart temp directory exists before first upload request.
  fs.mkdirSync(uploadTmpDir, { recursive: true });

  return [
    "strapi::logger",
    "strapi::errors",
    {
      name: "strapi::cors",
      config: {
        origin: [
          "http://localhost:5173",
          "http://localhost:3000",
          "http://localhost:5174",
          env("FRONTEND_URL", "http://localhost:5173"),
          "https://zambetemagice.com",
          "https://www.zambetemagice.com",
          "https://asociatia-zambete-magice.vercel.app",
          "https://asociatia-zambete-magice.onrender.com",
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
        jsonLimit: env("BODY_JSON_LIMIT", "50mb"),
        formLimit: env("BODY_FORM_LIMIT", "50mb"),
        textLimit: env("BODY_TEXT_LIMIT", "50mb"),
        multipart: true,
        formidable: {
          uploadDir: uploadTmpDir,
          keepExtensions: true,
          maxFileSize: env.int("UPLOAD_MAX_FILE_SIZE", 100 * 1024 * 1024),
        },
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
};
