// Ensure PG-related env vars are set from DATABASE_URL so the pg driver
// and Strapi always see consistent credentials in the same Node process.
try {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[ensure-pg] DATABASE_URL not set, skipping");
    process.exit(0);
  }

  const parsed = new URL(url);
  const parsedUser = parsed.username || "";
  const parsedPassword = parsed.password || "";

  // Only set if not already present to avoid overwriting explicit Render vars
  if (!process.env.PGUSER) process.env.PGUSER = parsedUser;
  if (!process.env.PGPASSWORD) process.env.PGPASSWORD = parsedPassword;
  if (!process.env.DATABASE_USERNAME)
    process.env.DATABASE_USERNAME = parsedUser;
  if (!process.env.DATABASE_PASSWORD)
    process.env.DATABASE_PASSWORD = parsedPassword;

  // Masked log for visibility in Render logs
  try {
    console.log(
      "[ensure-pg] set PGUSER=",
      process.env.PGUSER || "(unset)",
      " PGPASSWORD=",
      process.env.PGPASSWORD ? "***" : "(unset)"
    );
  } catch (e) {
    // ignore
  }
} catch (e) {
  console.error("[ensure-pg] error parsing DATABASE_URL:", e && e.message);
}
