require("dotenv").config();

const required = [
  "DATABASE_HOST",
  "DATABASE_PORT",
  "DATABASE_NAME",
  "DATABASE_USERNAME",
  "DATABASE_PASSWORD",
];

required.forEach((key) => {
  const value = process.env[key];
  console.log(
    `${key}: ${value === undefined || value === "" ? "❌ undefined/empty" : value}`
  );
});
