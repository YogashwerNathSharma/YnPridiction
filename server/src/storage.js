import mongoose from "mongoose";
import {validateResults} from "./analysis.js";

const resultSchema=new mongoose.Schema({
 value:{type:Number,required:true,min:0,max:9},
 period:{type:String,default:"1 Minute",trim:true},
 roundId:{type:String,trim:true},
 observedAt:{type:Date,default:Date.now,index:true}
},{timestamps:true});
resultSchema.index({roundId:1},{unique:true,sparse:true});
const Result=mongoose.models.Result||mongoose.model("Result",resultSchema);
let memoryRows=[];
let mongoConfigured=false;

export async function connectStorage(uri){
 mongoConfigured=Boolean(uri);
 if(!uri)return{mode:"memory",connected:false};
 await mongoose.connect(uri,{serverSelectionTimeoutMS:8000});
 return{mode:"mongodb",connected:true};
}
export function storageMode(){
 if(mongoose.connection.readyState===1)return"mongodb";
 return mongoConfigured?"mongodb-disconnected":"memory";
}
function assertStorageAvailable(){
 if(storageMode()==="mongodb-disconnected")throw new Error("MongoDB connection is unavailable; refusing to switch silently to temporary memory storage.");
}
export async function listResults(limit=10000){
 assertStorageAvailable();
 if(storageMode()==="mongodb"){
  const docs=await Result.find().sort({observedAt:1}).limit(limit).lean();
  return docs.map(({value,period,roundId,observedAt})=>({value,period,roundId,observedAt}));
 }
 return memoryRows.slice(-limit);
}
export async function addResults(input){
 assertStorageAvailable();
 const rows=validateResults(input).map(row=>({...row,observedAt:row.observedAt||new Date()}));
 if(storageMode()==="mongodb"){
  const docs=await Result.insertMany(rows,{ordered:false});
  return{added:docs.length,total:await Result.countDocuments()};
 }
 memoryRows=validateResults([...memoryRows,...rows]).slice(-10000);
 return{added:rows.length,total:memoryRows.length};
}
export async function clearResults(){
 assertStorageAvailable();
 if(storageMode()==="mongodb"){const result=await Result.deleteMany({});return{cleared:true,deleted:result.deletedCount};}
 const deleted=memoryRows.length;memoryRows=[];return{cleared:true,deleted};
}
