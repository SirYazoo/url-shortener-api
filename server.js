const express = require("express");
const app = express();
const urlDatabase = {};
const PORT = 3000;

app.use(express.json());

app.post("/api/shorten", (req, res) => {
  console.log("Shorten endpoint was hit!");
  res.status(200).json({ status: "OK", message: "Route is wired up" });
});

app.get("/:shortCode", (req, res) => {
  console.log("ShortCode endpoint was hit!");
  res.status(200).json({ status: "OK", message: "Route is wired up" });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

module.exports = app;
