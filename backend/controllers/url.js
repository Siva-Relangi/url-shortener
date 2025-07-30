import { nanoid } from "nanoid";
import URL from "../models/url.js";

async function handleGetRequest(req, res) {
  const url = await URL.find({});
  if (!url) return res.status(404).json({ error: "No URLs found" });
  return res.json(url);
}

// In Controllers/url.js
async function handleGenerateShortUrl(req, res) {
  const body = req.body;
  if (!body.url) return res.status(400).json({ error: "URL is required" });

  let shortId = body.customId || nanoid(6);

  // Check if custom ID already exists
  if (body.customId) {
    const existing = await URL.findOne({ shortId: body.customId });
    if (existing) {
      return res.status(400).json({ error: "Custom ID already exists" });
    }
  }

  await URL.create({
    shortId: shortId,
    redirectUrl: body.url,
    visitHistory: [],
  });
  return res.json({ id: shortId });
}

async function handleAnalyticsRequest(req, res) {
  const shortId = req.params.shortId;
  const url = await URL.findOne({ shortId: shortId });
  if (!url) return res.status(404).json({ error: "URL not found" });
  return res.json({ Analytics: url.visitHistory.length });
}

export { handleAnalyticsRequest, handleGenerateShortUrl, handleGetRequest };
