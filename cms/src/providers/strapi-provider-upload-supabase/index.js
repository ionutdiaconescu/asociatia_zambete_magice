"use strict";

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

module.exports = {
  init(config) {
    const apiUrl = config.apiUrl || config.url;
    // "public" is a reserved word in strict mode; rename to isPublic
    const {
      apiKey,
      bucket,
      directory = "",
      public: isPublic = true,
      logger = console,
    } = config;

    if (!apiUrl || !apiKey || !bucket) {
      throw new Error(
        "[supabase-upload] Missing required config: apiUrl/url, apiKey, bucket.",
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

    const readFilePathToBuffer = async (file) => {
      const candidatePath =
        file.filepath || file.path || file.tmpPath || file.tempFilePath;
      if (!candidatePath) return null;

      try {
        return await fs.promises.readFile(candidatePath);
      } catch (_) {
        return null;
      }
    };

    const resolveFileBuffer = async (file) => {
      if (file.buffer) return file.buffer;

      if (file.stream && typeof file.stream.on === "function") {
        return readStreamToBuffer(file.stream);
      }

      if (typeof file.getStream === "function") {
        const maybeStream = file.getStream();
        if (maybeStream && typeof maybeStream.on === "function") {
          return readStreamToBuffer(maybeStream);
        }
      }

      return readFilePathToBuffer(file);
    };

    return {
      async upload(file) {
        try {
          const objectPath = buildObjectPath(file);

          const fileBuffer = await resolveFileBuffer(file);
          if (!fileBuffer) {
            throw new Error(
              "No upload content found (expected buffer, stream, getStream, or filepath/path).",
            );
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

          if (isPublic) {
            file.url = publicFileUrl(objectPath);
            file.previewUrl = file.url;
          } else {
            file.url = objectPath; // private path; could sign later
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
