import "dotenv/config";
import express from "express";
import cors from "cors";
import {analyzeResults,validateResults} from "./analysis.js";
import {connectStorage,storageMode,listResults,addResults,clearResults} from "./storage.js";

const app=express();
const PORT=Number(process.env.PORT||4000);
const origins=(process.env.CLIENT_ORIGIN||"http://localhost:5173").split(",").map(x=>x.trim());
app.use(cors({origin:origins}));
app.use(express.json({limit:"1mb"}));

app.get("/api/health",(_req,res)=>res.json({status:"ok",service:"YnPrediction API",storage:storageMode()}));
app.get("/api/results",async(_req,res,next)=>{try{res.json({results:await listResults()});}catch(e){next(e);}});
app.post("/api/results",async(req,res,next)=>{
 try{
  const input=Array.isArray(req.body)?req.body:[req.body];
  validateResults(input);
  const result=await addResults(input);
  res.status(201).json(result);
 }catch(e){if(e.name==="ValidationError"||e.name==="TypeError"||e.code===11000)return res.status(400).json({error:e.message});next(e);}
});
app.delete("/api/results",async(_req,res,next)=>{try{res.json(await clearResults());}catch(e){next(e);}});
app.get("/api/analysis",async(req,res,next)=>{
 try{const rows=await listResults();res.json(analyzeResults(rows,req.query.window||100));}catch(e){next(e);}
});
app.use((err,_req,res,_next)=>{console.error(err);res.status(500).json({error:"Internal server error"});});

try{
 const state=await connectStorage(process.env.MONGODB_URI);
 console.log(`Storage mode: ${state.mode}`);
 app.listen(PORT,()=>console.log(`YnPrediction API listening on ${PORT}`));
}catch(error){
 console.error("MongoDB connection failed:",error.message);
 console.error("Set a valid MONGODB_URI or remove it to use temporary in-memory storage.");
 process.exit(1);
}
