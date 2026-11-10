import "dotenv/config";
import express from "express";
import cors from "cors";
import { analyzeResults, validateResults } from "./analysis.js";

const app = express();
const PORT = Number(process.env.PORT || 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
let inMemoryResults = [];

app.use(cors({ origin: CLIENT_ORIGIN.split(",").map(x=>x.trim()) }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req,res) => res.json({status:"ok",service:"YnPrediction API"}));

app.get("/api/results", (_req,res) => res.json({results:inMemoryResults}));

app.post("/api/results", (req,res) => {
  try {
    const incoming = validateResults(Array.isArray(req.body) ? req.body : [req.body]);
    inMemoryResults = validateResults([...inMemoryResults, ...incoming]);
    if (inMemoryResults.length > 10000) inMemoryResults = inMemoryResults.slice(-10000);
    return res.status(201).json({added:incoming.length,total:inMemoryResults.length});
  } catch (error) {
    return res.status(400).json({error:error.message});
  }
});

app.delete("/api/results", (_req,res) => {
  inMemoryResults = [];
  res.json({cleared:true});
});

app.get("/api/analysis", (req,res) => {
  try {
    return res.json(analyzeResults(inMemoryResults, req.query.window || 100));
  } catch (error) {
    return res.status(400).json({error:error.message});
  }
});

app.use((err,_req,res,_next) => {
  console.error(err);
  res.status(500).json({error:"Internal server error"});
});

app.listen(PORT, () => console.log(`YnPrediction API listening on ${PORT}`));
