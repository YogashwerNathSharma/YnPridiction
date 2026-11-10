const VALID_VALUES=new Set([0,1,2,3,4,5,6,7,8,9]);
const NUMBER_COUNT=10;
export function validateResults(results){
 if(!Array.isArray(results))throw new TypeError("results must be an array");
 return results.map((item,index)=>{
  const value=Number(item.value);
  if(!Number.isInteger(value)||!VALID_VALUES.has(value))throw new TypeError(`results[${index}].value must be an integer from 0 to 9`);
  const observedAt=item.observedAt?new Date(item.observedAt):null;
  if(observedAt&&Number.isNaN(observedAt.getTime()))throw new TypeError(`results[${index}].observedAt is invalid`);
  return{...item,value,observedAt};
 }).sort((a,b)=>(a.observedAt?.getTime()??0)-(b.observedAt?.getTime()??0));
}
function countNumbers(rows){const counts=Array.from({length:NUMBER_COUNT},(_,value)=>({value,count:0,proportion:0}));for(const r of rows)counts[r.value].count++;for(const c of counts)c.proportion=rows.length?c.count/rows.length:0;return counts;}
function wilson(k,n,z=1.96){if(!n)return{lower:0,upper:1};const p=k/n,z2=z*z,d=1+z2/n,c=(p+z2/(2*n))/d,m=z*Math.sqrt(p*(1-p)/n+z2/(4*n*n))/d;return{lower:Math.max(0,c-m),upper:Math.min(1,c+m)};}
function entropy(p){return-p.reduce((s,x)=>s+(x>0?x*Math.log2(x):0),0);}
function streaks(rows){if(!rows.length)return{latestObservedValue:null,latestValueStreak:0,longestStreak:0};let cur=1,longest=1;for(let i=1;i<rows.length;i++){cur=rows[i].value===rows[i-1].value?cur+1:1;longest=Math.max(longest,cur);}let latest=1;for(let i=rows.length-1;i>0&&rows[i].value===rows[i-1].value;i--)latest++;return{latestObservedValue:rows.at(-1).value,latestValueStreak:latest,longestStreak:longest};}
function posteriorFromCounts(counts,alpha=1){const total=counts.reduce((s,c)=>s+c.count,0)+alpha*NUMBER_COUNT;return counts.map(c=>({value:c.value,count:c.count,probability:(c.count+alpha)/total}));}
function transitionPosterior(rows,alpha=1){const counts=Array.from({length:NUMBER_COUNT},()=>Array(NUMBER_COUNT).fill(0));for(let i=1;i<rows.length;i++)counts[rows[i-1].value][rows[i].value]++;const latest=rows.length?rows.at(-1).value:null;const row=latest===null?null:counts[latest];const total=row?row.reduce((s,n)=>s+n,0)+alpha*NUMBER_COUNT:0;return{fromValue:latest,observations:row?row.reduce((s,n)=>s+n,0):0,probabilities:row?row.map((count,value)=>({value,count,probability:(count+alpha)/total})):[]};}
function brier(probabilities,actual){return probabilities.reduce((sum,p)=>sum+(p.probability-(p.value===actual?1:0))**2,0);}
export function walkForwardBacktest(rows,minHistory=30){
 let n=0,frequencyCorrect=0,bayesCorrect=0,frequencyLoss=0,bayesLoss=0,uniformLoss=0,bayesBrier=0,uniformBrier=0;
 for(let i=minHistory;i<rows.length;i++){
  const history=rows.slice(Math.max(0,i-100),i),actual=rows[i].value,counts=countNumbers(history);
  const frequency=[...counts].sort((a,b)=>b.count-a.count||a.value-b.value)[0];
  const posterior=posteriorFromCounts(counts,1);
  const bayes=[...posterior].sort((a,b)=>b.probability-a.probability||a.value-b.value)[0];
  n++;if(frequency.value===actual)frequencyCorrect++;if(bayes.value===actual)bayesCorrect++;
  frequencyLoss-=Math.log(Math.max(.001,counts[actual].proportion));
  bayesLoss-=Math.log(posterior[actual].probability);uniformLoss-=Math.log(.1);
  bayesBrier+=brier(posterior,actual);uniformBrier+=.9;
 }
 return{evaluated:n,frequencyTopPickAccuracy:n?frequencyCorrect/n:null,bayesianTopPickAccuracy:n?bayesCorrect/n:null,meanLogLossFrequency:n?frequencyLoss/n:null,meanLogLossBayesian:n?bayesLoss/n:null,meanLogLossUniform:n?uniformLoss/n:null,meanBrierBayesian:n?bayesBrier/n:null,meanBrierUniform:n?uniformBrier/n:null,note:"Chronological benchmark only. Bayesian smoothing avoids zero probabilities but does not create a predictive edge."};
}
export function analyzeResults(input,windowSize=100){
 const all=validateResults(input),size=Math.max(1,Math.min(10000,Number(windowSize)||100)),rows=all.slice(-size),counts=countNumbers(rows),transitions=Array.from({length:NUMBER_COUNT},()=>Array(NUMBER_COUNT).fill(0));
 for(let i=1;i<rows.length;i++)transitions[rows[i-1].value][rows[i].value]++;
 const ranking=[...counts].sort((a,b)=>b.count-a.count||a.value-b.value),top=ranking[0],bayesianPosterior=posteriorFromCounts(counts,1),bayesianRanking=[...bayesianPosterior].sort((a,b)=>b.probability-a.probability||a.value-b.value);
 const rollingWindows=[10,20,50].filter(n=>rows.length>=n).map(window=>({window,counts:countNumbers(rows.slice(-window))}));
 return{sampleSize:rows.length,requestedWindow:size,counts,historicalFrequencyRanking:ranking,bayesianPosterior,bayesianRanking,prior:{type:"symmetric Dirichlet",alphaPerNumber:1,meaning:"One pseudo-observation per number; transparent smoothing, not learned from future data."},transitionMatrix:transitions,transitionPosterior:transitionPosterior(rows),rollingWindows,...streaks(rows),baselinePerNumber:.1,topHistoricalNumber:rows.length?top.value:null,topHistoricalShare:rows.length?top.proportion:null,topHistoricalShareWilson95:wilson(top.count,rows.length),distributionEntropy:rows.length?entropy(counts.map(x=>x.proportion)):null,uniformEntropy:Math.log2(NUMBER_COUNT),walkForward:walkForwardBacktest(all),interpretation:rows.length<30?"Insufficient history for meaningful descriptive comparison. Collect more observations.":"Historical and Bayesian-smoothed estimates describe the supplied sample; neither establishes a next-round advantage.",disclaimer:"For a fair independent random draw, each number remains equally likely regardless of previous outcomes. No guaranteed prediction."};
}
