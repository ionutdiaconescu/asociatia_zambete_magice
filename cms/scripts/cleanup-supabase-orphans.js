"use strict";

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const { createStrapi } = require("@strapi/strapi");

function hasFlag(args, flag) {
  return args.includes(flag);
}

function getArgValue(args, key, defaultValue) {
  const prefix = `${key}=`;
  const found = args.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : defaultValue;
}

function normalizePrefix(input) {
  return String(input || "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}

function safeParseInt(value, fallback) {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : fallback;
}

function extractObjectPathFromUrl(url, bucket) {
  if (!url || typeof url !== "string") return null;

  const markers = [
    `/storage/v1/object/public/${bucket}/`,
    `/storage/v1/object/sign/${bucket}/`,
    `/storage/v1/object/authenticated/${bucket}/`,
  ];

  for (const marker of markers) {
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const raw = url.slice(idx + marker.length);
      const pathOnly = raw.split("?")[0];
      try {
        return decodeURIComponent(pathOnly);
      } catch (_) {
        return pathOnly;
      }
    }
  }

  return null;
}

function collectReferencedPaths(files, bucket) {
  const refs = new Set();

  const addPath = (maybePath) => {
    if (!maybePath || typeof maybePath !== "string") return;
    refs.add(maybePath.replace(/^\/+/, ""));
  };

  const addUrl = (maybeUrl) => {
    const p = extractObjectPathFromUrl(maybeUrl, bucket);
    if (p) addPath(p);
  };

  for (const file of files) {
    addUrl(file.url);
    addUrl(file.previewUrl);

    const providerMeta = file.provider_metadata || file.providerMetadata;
    if (providerMeta && typeof providerMeta === "object") {
      addPath(providerMeta.objectPath);
      addPath(providerMeta.path);
      addUrl(providerMeta.url);
    }

    if (file.formats && typeof file.formats === "object") {
      for (const fmt of Object.values(file.formats)) {
        if (!fmt || typeof fmt !== "object") continue;
        addUrl(fmt.url);
        addUrl(fmt.previewUrl);
        addPath(fmt.path);
        addPath(fmt.objectPath);
      }
    }
  }

  return refs;
}

function isFolderItem(item) {
  // Supabase list() returns null id for folders.
  return !item || item.id === null;
}

async function listStoragePathsRecursively(supabase, bucket, startPrefix) {
  const allFiles = [];
  const queue = [normalizePrefix(startPrefix)];

  while (queue.length > 0) {
    const currentPrefix = queue.shift();
    let offset = 0;

    for (;;) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(currentPrefix, {
          limit: 1000,
          offset,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) {
        throw new Error(
          `[storage-list] prefix="${currentPrefix}" offset=${offset}: ${error.message}`,
        );
      }

      if (!Array.isArray(data) || data.length === 0) {
        break;
      }

      for (const item of data) {
        const itemPath = currentPrefix
          ? `${currentPrefix}/${item.name}`
          : item.name;
        if (isFolderItem(item)) {
          queue.push(itemPath);
        } else {
          allFiles.push(itemPath);
        }
      }

      if (data.length < 1000) break;
      offset += 1000;
    }
  }

  return allFiles;
}

async function fetchAllUploadFiles(strapi) {
  const pageSize = 200;
  const out = [];
  let start = 0;

  for (;;) {
    const batch = await strapi.entityService.findMany("plugin::upload.file", {
      fields: [
        "id",
        "url",
        "previewUrl",
        "provider",
        "provider_metadata",
        "formats",
      ],
      start,
      limit: pageSize,
      publicationState: "preview",
    });

    if (!Array.isArray(batch) || batch.length === 0) break;
    out.push(...batch);

    if (batch.length < pageSize) break;
    start += pageSize;
  }

  return out;
}

(async () => {
  const args = process.argv.slice(2);
  const shouldDelete = hasFlag(args, "--delete");

  const apiUrl = process.env.SUPABASE_API_URL;
  const apiKey = process.env.SUPABASE_API_KEY;
  const bucket = getArgValue(
    args,
    "--bucket",
    process.env.SUPABASE_BUCKET || "uploads",
  );
  const prefix = normalizePrefix(
    getArgValue(args, "--prefix", process.env.SUPABASE_DIRECTORY || ""),
  );
  const maxDelete = Math.max(
    1,
    safeParseInt(getArgValue(args, "--max-delete", "500"), 500),
  );

  if (!apiUrl || !apiKey) {
    console.error(
      "Missing SUPABASE_API_URL or SUPABASE_API_KEY in environment.",
    );
    process.exit(1);
  }

  const supabase = createClient(apiUrl, apiKey, {
    auth: { persistSession: false },
  });

  console.log("[orphans] mode:", shouldDelete ? "DELETE" : "DRY-RUN");
  console.log("[orphans] bucket:", bucket);
  console.log("[orphans] prefix:", prefix || "<root>");

  const strapi = await createStrapi().load();

  try {
    const uploadFiles = await fetchAllUploadFiles(strapi);
    const referencedPaths = collectReferencedPaths(uploadFiles, bucket);

    const storagePaths = await listStoragePathsRecursively(
      supabase,
      bucket,
      prefix,
    );
    const storageSet = new Set(storagePaths);

    const orphanCandidates = storagePaths.filter(
      (p) => !referencedPaths.has(p),
    );
    const missingInStorage = [...referencedPaths].filter((p) => {
      if (prefix) {
        // If a prefix is enforced, ignore refs outside that prefix in this check.
        if (!p.startsWith(`${prefix}/`) && p !== prefix) return false;
      }
      return !storageSet.has(p);
    });

    const report = {
      generatedAt: new Date().toISOString(),
      mode: shouldDelete ? "delete" : "dry-run",
      bucket,
      prefix,
      strapiUploadRows: uploadFiles.length,
      referencedPathsCount: referencedPaths.size,
      storagePathsCount: storagePaths.length,
      orphanCandidatesCount: orphanCandidates.length,
      missingInStorageCount: missingInStorage.length,
      orphanCandidatesSample: orphanCandidates.slice(0, 200),
      missingInStorageSample: missingInStorage.slice(0, 200),
    };

    const reportPath = path.join(
      process.cwd(),
      "backups",
      `storage-orphans-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
    );
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log("[orphans] strapi upload rows:", uploadFiles.length);
    console.log("[orphans] referenced paths:", referencedPaths.size);
    console.log("[orphans] storage paths under prefix:", storagePaths.length);
    console.log("[orphans] orphan candidates:", orphanCandidates.length);
    console.log(
      "[orphans] missing in storage (referenced but absent):",
      missingInStorage.length,
    );
    console.log("[orphans] report:", reportPath);

    if (!shouldDelete) {
      console.log("\nDry-run complete. No files were deleted.");
      console.log("Run with --delete to remove orphan candidates.");
      return;
    }

    if (orphanCandidates.length === 0) {
      console.log("\nNo orphan candidates to delete.");
      return;
    }

    const toDelete = orphanCandidates.slice(0, maxDelete);
    const deleteChunks = chunk(toDelete, 100);

    let deletedCount = 0;
    for (const filesChunk of deleteChunks) {
      const { error } = await supabase.storage.from(bucket).remove(filesChunk);
      if (error) {
        throw new Error(`[storage-delete] ${error.message}`);
      }
      deletedCount += filesChunk.length;
      console.log(
        `[orphans] deleted chunk: +${filesChunk.length} (total ${deletedCount})`,
      );
    }

    console.log("\nDelete complete.");
    console.log("[orphans] requested delete count:", toDelete.length);
    console.log("[orphans] deleted count:", deletedCount);

    if (orphanCandidates.length > maxDelete) {
      console.log(
        `[orphans] ${orphanCandidates.length - maxDelete} orphan candidates remain (max-delete=${maxDelete}).`,
      );
    }
  } catch (err) {
    console.error("[orphans] failed:", err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
})();
