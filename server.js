const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/api/shorten", async (req, res) => {
  const longUrl = req.body.longUrl;
  if (!longUrl) {
    return res.status(400).json({ message: "longUrl is required" });
  }
  const shortCode = Math.random().toString(36).substring(2, 8);
  await prisma.url.create({
    data: {
      shortCode: shortCode,
      longUrl: longUrl,
    },
  });
  res.status(201).json({
    success: true,
    message: "URL shortened successfully",
    url: `http://localhost:${PORT}/${shortCode}`,
  });
});

app.get("/:shortCode", async (req, res) => {
  const shortCode = req.params.shortCode;
  const urlRecord = await prisma.url.findUnique({
    where: {
      shortCode: shortCode,
    },
  });
  if (!urlRecord) {
    return res.status(404).json({ message: "URL not found" });
  }
  const longUrl = urlRecord.longUrl;
  await prisma.url.update({
    where: {
      shortCode: shortCode,
    },
    data: {
      clicks: { increment: 1 },
    },
  });
  res.redirect(longUrl);
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

module.exports = app;
