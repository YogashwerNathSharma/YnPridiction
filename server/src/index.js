import "dotenv/config";import express from"express";import cors from"cors";import{analyzeResults,validateResults}from"./analysis.js";
const app=express(),PORT=Number(process.env.PORT||4000),origins=(process.env.CLIENT_ORIGIN||"http://localhost:5173").split(",").map(x=>x.trim());let inMemoryResults=[];
app.use(cors({origin:origins}));app.use(express.json({limit:"1mb"}));
app.get("/api/health",(_q,s)=>s.json({status:"ok",service:"YnPrediction API"}));
app.get("/api/results",(_q,s)=>s.json({results:inMemoryResults}));
app.post("/api/results",(q,s)=>{try{const values=validateResults(Array.isArray(q.body)?q.body:[q.body]);inMemoryResults=validateResults([...inMemoryResults,...values]).slice(-10000);s.status(201).json({added:values.length,total:inMemoryResults.length});}catch(e){s.status(400).json({error:e.message});}});
app.delete("/api/results",(_q,s)=>{inMemoryResults=[];s.json({cleared:true});});
app.get("/api/analysis",(q,s)=>{try{s.json(analyzeResults(inMemoryResults,q.query.window||100));}catch(e){s.status(400).json({error:e.message});}});
app.listen(PORT,()=>console.log(`YnPrediction API listening on ${PORT}`));
