import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "./generated/prisma/client.ts";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const app = express();
const PORT = 3000;

app.use(express.json());
const shortenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    success: false,
    message:
      "Too many URLs created from this IP. Please try again after 15 minutes.",
  },
});

const isValidUrl = (urlString) => {
  if (!URL.canParse(urlString)) return false;

  const url = new URL(urlString);
  return url.protocol === "http:" || url.protocol === "https:";
};

app.post("/api/shorten", shortenLimiter, async (req, res, next) => {
  try {
    const { longUrl, customCode } = req.body;
    if (!longUrl) {
      return res.status(400).json({ message: "longUrl is required" });
    }

    if (!isValidUrl(longUrl)) {
      return res.status(400).json({
        message:
          "Invalid URL format. Must be a valid http:// or https:// link.",
      });
    }

    let shortCode;
    if (customCode) {
      const sanitizedCode = customCode
        .trim()
        .toLowerCase()
        .replaceAll(/\s+/g, "-");
      const existingUrl = await prisma.url.findUnique({
        where: { shortCode: sanitizedCode },
      });

      if (existingUrl) {
        return res
          .status(409)
          .json({ message: "Custom alias is already in use" });
      }

      shortCode = sanitizedCode;
    } else {
      shortCode = Math.random().toString(36).substring(2, 8);
    }

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
  } catch (error) {
    next(error);
  }
});

app.get("/:shortCode", async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error("Critical Server Error:", err.message);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

export default app;
