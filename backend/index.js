const express = require("express");
const cors = require("cors");
require("dotenv").config();
const stripeRouter = require("./src/stripe");
const statsRouter = require("./src/stats");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", stripeRouter);
app.use("/api", statsRouter);

app.get("/", (req, res) => {
  res.send("Backend API is running!");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
