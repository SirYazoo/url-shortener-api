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
  res.status(201).json({
    success: true,
    message: "URL shortened successfully",
    url: `http://localhost:${PORT}/${shortCode}`,
  });
});

app.get("/:shortCode", (req, res) => {
  const shortCode = req.params.shortCode;
  if (!urlDatabase[shortCode]) {
    return res.status(404).json({ message: "shortCode not found" });
  }
  const longUrl = urlDatabase[shortCode];
  res.redirect(longUrl);
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

module.exports = app;
