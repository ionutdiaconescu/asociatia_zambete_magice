require("dotenv").config();
console.log("DATABASE_URL =", process.env.DATABASE_URL);
console.log("POOLER_CA_B64 =", process.env.POOLER_CA_B64);
// ...existing code...
console.log("NODE_ENV =", process.env.NODE_ENV);
