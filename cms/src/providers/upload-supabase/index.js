"use strict";

// Custom Supabase upload provider for Strapi v5
// Uses @supabase/supabase-js and env-driven configuration
// Required providerOptions keys: apiUrl, apiKey, bucket
// Optional: directory, public (boolean), sizeLimit

const { createClient } = require("@supabase/supabase-js");

module.exports = {
  init(config) {
    const {
      apiUrl,
      apiKey,
      bucket,
      directory = "",
      public = true,
      logger = console,
    } = config;

    if (!apiUrl || !apiKey || !bucket) {
      throw new Error(
        "[supabase-upload] Missing required config: apiUrl, apiKey, bucket.",
      );
    }

    const supabase = createClient(apiUrl, apiKey);

    const sanitizeDir = (d) => d.replace(/\\/g, "/").replace(/\/+$/g, "");
    const finalDir = directory ? sanitizeDir(directory) : "";

    const buildObjectPath = (file) => {
      const baseName = file.hash
        ? `${file.hash}${file.ext}`
        : `${Date.now()}-${file.name}`;
      return finalDir ? `${finalDir}/${baseName}` : baseName;
    };

    const publicFileUrl = (objectPath) =>
      `${apiUrl.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/${objectPath}`;

    const extractObjectPathFromUrl = (url) => {
      const marker = `/storage/v1/object/public/${bucket}/`;
      const idx = url.indexOf(marker);
      if (idx === -1) return null;
      return url.substring(idx + marker.length);
    };

    const readStreamToBuffer = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (c) => chunks.push(c));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
      });

    return {
      async upload(file) {
        try {
          const objectPath = buildObjectPath(file);

          let fileBuffer = file.buffer;
          if (!fileBuffer && file.stream) {
            fileBuffer = await readStreamToBuffer(file.stream);
          }
          if (!fileBuffer) {
            throw new Error("No buffer or stream available for upload.");
          }

          const uploadRes = await supabase.storage
            .from(bucket)
            .upload(objectPath, fileBuffer, {
              contentType: file.mime,
              upsert: true,
            });

          if (uploadRes.error) {
            throw uploadRes.error;
          }

          if (public) {
            file.url = publicFileUrl(objectPath);
            file.previewUrl = file.url;
          } else {
            file.url = objectPath; // private path; later could sign URL
          }

          file.objectPath = objectPath;
          return file;
        } catch (err) {
          logger.error(
            `[supabase-upload] upload failed: ${err.message || String(err)}`,
          );
          throw err;
        }
      },

      async uploadStream(file) {
        return this.upload(file);
      },

      async delete(file) {
        try {
          let objectPath = file.objectPath;
          if (!objectPath && file.url) {
            objectPath = extractObjectPathFromUrl(file.url);
            if (!objectPath) {
              logger.warn(
                `[supabase-upload] delete skipped for non-supabase URL: ${file.url}`,
              );
              return;
            }
          }
          if (!objectPath) {
            logger.warn(
              "[supabase-upload] delete: cannot resolve object path from file.",
            );
            return;
          }
          const delRes = await supabase.storage
            .from(bucket)
            .remove([objectPath]);
          if (
            delRes.error &&
            !/not found|no such file|does not exist/i.test(
              String(delRes.error.message || delRes.error),
            )
          ) {
            throw delRes.error;
          }
        } catch (err) {
          logger.error(
            `[supabase-upload] delete failed: ${err.message || String(err)}`,
          );
          throw err;
        }
      },
    };
  },
};
