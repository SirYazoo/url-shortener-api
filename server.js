const express = require("express");
const app = express();
const urlDatabase = {};
const PORT = 3000;

app.use(express.json());

app.post("/api/shorten", (req, res) => {
  const longUrl = req.body.longUrl;
  if (!longUrl) {
    return res.status(400).json({ message: "longUrl is required" });
  }
  const shortCode = Math.random().toString(36).substring(2, 8);
  urlDatabase[shortCode] = longUrl;
  console.log(urlDatabase);
  res.status(201).json({
    message: "URL shortened successfully",
    url: `http://localhost:${PORT}/${shortCode}`,
  });
});

app.get("/:shortCode", (req, res) => {
  console.log("ShortCode endpoint was hit!");
  res.status(200).json({ status: "OK", message: "Route is wired up" });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

module.exports = app;
