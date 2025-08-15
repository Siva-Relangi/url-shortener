import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./connection.js";
import URL from "./models/url.js";
import urlRoute from "./routes/url.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Vite default port number
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to the URL Shortener API");
});

app.use("/url", urlRoute);

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const url = await URL.findOneAndUpdate(
    {
      shortId: shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
  res.redirect(url.redirectUrl);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
