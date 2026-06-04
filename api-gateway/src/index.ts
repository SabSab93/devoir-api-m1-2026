import express from "express";
import "dotenv/config";
import { createProxyMiddleware } from "http-proxy-middleware";
import { requireAuth } from "./middlewares/requireAuth";

const app = express();

const authServiceUrl = "http://localhost:3002";
const voitureServiceUrl = "http://localhost:1992";
const goSchistServiceUrl = "http://localhost:3022";

const authProxy = createProxyMiddleware({
  target: `${authServiceUrl}/auth/local`,
  changeOrigin: true,
});

const voitureProxy = createProxyMiddleware({
  target: `${voitureServiceUrl}/voitures`,
  changeOrigin: true,
});

const goSchistProxy = createProxyMiddleware({
  target: `${goSchistServiceUrl}/api/schistes`,
  changeOrigin: true,
});

app.get("/", (_req, res) => {
  res.json({ message: "API Gateway dsj" });
});

app.use("/api/voitures", requireAuth, voitureProxy);
app.use("/api/schistes", goSchistProxy);
app.use("/api/auth/local", authProxy);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
