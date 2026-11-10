const VALID_VALUES = new Set([0,1,2,3,4,5,6,7,8,9]);
export function validateResults(results) {
 if(!Array.isArray(results)) throw new TypeError("results must be an array");
 return results.map((item,index)=>{
  const value=Number(item.value);
  if(!Number.isInteger(value)||!VALID_VALUES.has(value)) throw new TypeError(`results[${index}].value must be an integer from 0 to 9`);
  const observedAt=item.observedAt?new Date(item.observedAt):null;
  if(observedAt&&Number.isNaN(observedAt.getTime())) throw new TypeError(`results[${index}].observedAt is invalid`);
  return {...item,value,observedAt};
 }).sort((a,b)=>(a.observedAt?.getTime()??0)-(b.observedAt?.getTime()??0));
}
function countNumbers(rows){
 const counts=Array.from({length:10},(_,value)=>({value,count:0,proportion:0}));
 for(const row of rows) counts[row.value].count++;
 for(const row of counts) row.proportion=rows.length?row.count/rows.length:0;
 return counts;
}
function wilsonInterval(successes,n,z=1.96){
 if(!n)return{lower:0,upper:1};
 const p=successes/n,z2=z*z,d=1+z2/n,center=(p+z2/(2*n))/d;
 const margin=z*Math.sqrt(p*(1-p)/n+z2/(4*n*n))/d;
 return{lower:Math.max(0,center-margin),upper:Math.min(1,center+margin)};
}
function entropy(probs){return -probs.reduce((s,p)=>s+(p>0?p*Math.log2(p):0),0);}
function streaks(rows){
 if(!rows.length)return{latestObservedValue:null,latestValueStreak:0,longestStreak:0};
 let current=1,longest=1;
 for(let i=1;i<rows.length;i++){current=rows[i].value===rows[i-1].value?current+1:1;longest=Math.max(longest,current);}
 let latestValueStreak=1;
 for(let i=rows.length-1;i>0&&rows[i].value===rows[i-1].value;i--)latestValueStreak++;
 return{latestObservedValue:rows.at(-1).value,latestValueStreak,longestStreak:longest};
}
export function walkForwardBacktest(rows,minHistory=30){
 let evaluated=0,modelCorrect=0,modelLogLoss=0,uniformLogLoss=0;
 for(let i=minHistory;i<rows.length;i++){
  const history=rows.slice(Math.max(0,i-100),i),counts=countNumbers(history);
  const predicted=[...counts].sort((a,b)=>b.proportion-a.proportion||a.value-b.value)[0].value;
  const actual=rows[i].value;evaluated++;
  if(predicted===actual)modelCorrect++;
  modelLogLoss-=Math.log(Math.max(0.001,counts[actual].proportion));
  uniformLogLoss-=Math.log(0.1);
 }
 return{evaluated,frequencyTopPickAccuracy:evaluated?modelCorrect/evaluated:null,
  meanLogLossFrequency:evaluated?modelLogLoss/evaluated:null,
  meanLogLossUniform:evaluated?uniformLogLoss/evaluated:null,
  note:"Chronological benchmark only; compare on unseen rounds and do not infer a profitable edge from a small sample."};
}
export function analyzeResults(input,windowSize=100){
 const results=validateResults(input),size=Math.max(1,Math.min(10000,Number(windowSize)||100)),window=results.slice(-size);
 const counts=countNumbers(window),transitions=Array.from({length:10},()=>Array(10).fill(0));
 for(let i=1;i<window.length;i++)transitions[window[i-1].value][window[i].value]++;
 const ranking=[...counts].sort((a,b)=>b.count-a.count||a.value-b.value),top=ranking[0];
 return{
  sampleSize:window.length,requestedWindow:size,counts,historicalFrequencyRanking:ranking,transitions,...streaks(window),
  baselinePerNumber:0.1,topHistoricalNumber:window.length?top.value:null,
  topHistoricalShare:window.length?top.proportion:null,
  topHistoricalShareWilson95:wilsonInterval(top.count,window.length),
  distributionEntropy:window.length?entropy(counts.map(x=>x.proportion)):null,
  uniformEntropy:Math.log2(10),walkForward:walkForwardBacktest(results),
  interpretation:window.length<30?"Insufficient history for meaningful descriptive comparison. Collect more observations.":"Historical frequency is descriptive and does not establish a next-round advantage.",
  disclaimer:"For a fair independent random draw, each number remains equally likely regardless of previous outcomes. No guaranteed prediction."
 };
}
