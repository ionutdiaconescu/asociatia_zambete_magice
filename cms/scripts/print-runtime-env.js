// Prints runtime view of relevant env vars (masked) so we can see if any override exists in Render
const mask = (s) => (s ? s.replace(/:[^:@]+@/, ":***@") : s);
console.log("[runtime-env] DATABASE_URL=", mask(process.env.DATABASE_URL));
console.log(
  "[runtime-env] DB_USER envs: DATABASE_USERNAME=",
  process.env.DATABASE_USERNAME || "(unset)",
  " DATABASE_USER=",
  process.env.DATABASE_USER || "(unset)",
  " PGUSER=",
  process.env.PGUSER || "(unset)"
);
console.log("[runtime-env] PORT=", process.env.PORT || "(unset)");
console.log(
  "[runtime-env] DATABASE_SSL=",
  process.env.DATABASE_SSL || "(unset)"
);
console.log("[runtime-env] any other DB envs:");
[
  "DB_USER",
  "DB_USERNAME",
  "DATABASE_USERNAME",
  "DATABASE_PASSWORD",
  "PGPASSWORD",
  "PGHOST",
  "PGPORT",
  "PGDATABASE",
].forEach((k) => console.log(k, "=", process.env[k] || "(unset)"));
