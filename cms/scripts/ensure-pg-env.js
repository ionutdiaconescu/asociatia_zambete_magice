// Setează doar DATABASE_USERNAME și DATABASE_PASSWORD din DATABASE_URL
try {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[ensure-pg] DATABASE_URL not set, skipping");
    process.exit(0);
  }

  const parsed = new URL(url);
  const parsedUser = parsed.username || "";
  const parsedPassword = parsed.password || "";

  if (!process.env.DATABASE_USERNAME)
    process.env.DATABASE_USERNAME = parsedUser;
  if (!process.env.DATABASE_PASSWORD)
    process.env.DATABASE_PASSWORD = parsedPassword;

  // Log pentru vizibilitate
  try {
    console.log(
      "[ensure-pg] set DATABASE_USERNAME=",
      process.env.DATABASE_USERNAME || "(unset)",
      " DATABASE_PASSWORD=",
      process.env.DATABASE_PASSWORD ? "***" : "(unset)"
    );
  } catch (e) {
    // ignore
  }
} catch (e) {
  console.error("[ensure-pg] error parsing DATABASE_URL:", e && e.message);
}
