"use strict";
const path = require("path");

module.exports = ({ env }) => {
  const useSupabase =
    !!env("SUPABASE_API_URL") &&
    !!env("SUPABASE_API_KEY") &&
    !!env("SUPABASE_BUCKET");

  if (useSupabase) {
    return {
      upload: {
        config: {
          // Use local packaged provider installed via file: dependency
          provider: "@strapi/provider-upload-supabase",
          providerOptions: {
            apiUrl: env("SUPABASE_API_URL"),
            apiKey: env("SUPABASE_API_KEY"),
            bucket: env("SUPABASE_BUCKET"),
            directory: env("SUPABASE_DIRECTORY", ""),
            public: true,
          },
          sizeLimit: Number(env("UPLOAD_SIZE_LIMIT", 100000000)),
          // Disable optimization to avoid Windows EBUSY/EPERM on temp unlink
          sizeOptimization: false,
          // Disable responsive image generation (no thumbnails/medium/large)
          breakpoints: {},
          actionOptions: {
            upload: {},
            uploadStream: {},
            delete: {},
          },
        },
      },
    };
  }

  // fallback to local provider for dev environments
  return {
    upload: {
      config: {
        provider: "local",
        providerOptions: {},
        sizeLimit: Number(env("UPLOAD_SIZE_LIMIT", 100000000)), // 100MB
        // Disable optimization to avoid Windows EBUSY/EPERM on temp unlink
        sizeOptimization: false,
        // Disable responsive image generation (no thumbnails/medium/large)
        breakpoints: {},
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
  };
};
