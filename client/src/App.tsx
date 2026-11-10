import {useEffect,useMemo,useState} from "react";
type ResultRow={value:number;observedAt?:string;period?:string};
type Report={sampleSize:number;counts:{value:number;count:number;proportion:number}[];historicalFrequencyRanking:{value:number;count:number;proportion:number}[];latestObservedValue:number|null;latestValueStreak:number;baselinePerNumber:number;interpretation:string;disclaimer:string;topHistoricalNumber:number|null;topHistoricalShare:number|null;topHistoricalShareWilson95?:{lower:number;upper:number};walkForward?:{evaluated:number;frequencyTopPickAccuracy:number|null;meanLogLossFrequency:number|null;meanLogLossUniform:number|null}};
const API=import.meta.env.VITE_API_URL||"http://localhost:4000";
export default function App(){
 const[rows,setRows]=useState<ResultRow[]>([]),[value,setValue]=useState("0"),[period,setPeriod]=useState("1 Minute"),[windowSize,setWindowSize]=useState("100"),[report,setReport]=useState<Report|null>(null),[status,setStatus]=useState("Connecting to analysis API…"),[error,setError]=useState("");
 async function refresh(){try{const query="?period="+encodeURIComponent(period);const[r,a]=await Promise.all([fetch(API+"/api/results"+query),fetch(API+"/api/analysis?window="+windowSize+"&period="+encodeURIComponent(period))]);if(!r.ok||!a.ok)throw new Error("API request failed");const rd=await r.json(),ad=await a.json();setRows(rd.results);setReport(ad);setStatus("Analysis API connected");}catch{setStatus("API offline — start the backend to enable live analysis");}}
 useEffect(()=>{void refresh();},[period,windowSize]);
 async function addResult(e:React.FormEvent){e.preventDefault();setError("");const n=Number(value);if(!Number.isInteger(n)||n<0||n>9){setError("Enter a whole number from 0 to 9.");return;}try{const r=await fetch(API+"/api/results",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({value:n,period,observedAt:new Date().toISOString()})});if(!r.ok)throw new Error((await r.json()).error||"Could not save result");setValue("0");await refresh();}catch(e){setError(e instanceof Error?e.message:"Could not save result");}}
 async function clearResults(){if(!confirm("Clear all results from storage?"))return;await fetch(API+"/api/results",{method:"DELETE"});await refresh();}
 const bars=useMemo(()=>report?.counts??Array.from({length:10},(_,value)=>({value,count:0,proportion:0})),[report]);
 const leader=report?.historicalFrequencyRanking?.[0];
 return <main className="shell">
  <header className="topbar"><div className="brand"><div className="logo">Yn</div><div><b>YnPrediction</b><span>Trend intelligence workspace</span></div></div><div className="connection"><i/> {status}</div></header>
  <section className="hero"><div><p className="eyebrow">STATISTICAL ANALYSIS • HISTORICAL DATA</p><h1>Read the trend.<br/><em>Understand the odds.</em></h1><p className="sub">Explore historical outcomes, frequencies, streaks and transitions. Every insight is descriptive—not a guaranteed next result.</p></div><div className="hero-mark"><div className="ring">0–9<span>DATA</span></div></div></section>
  <section className="grid">
   <article className="panel entry"><div className="panel-head"><div><p className="eyebrow">DATA INPUT</p><h2>Add observed result</h2></div><span className="tag">MANUAL</span></div>
    <form onSubmit={addResult}><label>Game period<select value={period} onChange={e=>setPeriod(e.target.value)}><option>30 Seconds</option><option>1 Minute</option><option>3 Minutes</option><option>5 Minutes</option></select></label><label>Result number<select value={value} onChange={e=>setValue(e.target.value)}>{Array.from({length:10},(_,i)=><option key={i} value={i}>{i}</option>)}</select></label><button className="primary">Add result <span>↗</span></button>{error&&<p className="error">{error}</p>}</form>
    <p className="hint">Data is stored in MongoDB when MONGODB_URI is configured; otherwise the API uses temporary memory storage.</p>
   </article>
   <article className="panel summary"><p className="eyebrow">CURRENT DATASET</p><div className="metric">{report?.sampleSize??0}</div><p className="muted">observations in selected window</p><div className="divider"/><div className="statline"><span>Latest observed</span><b>{report?.latestObservedValue??"—"}</b></div><div className="statline"><span>Current streak</span><b>{report?.latestValueStreak??0}</b></div><div className="statline"><span>Uniform baseline</span><b>10% / number</b></div></article>
  </section>
  <section className="panel chart-panel"><div className="panel-head"><div><p className="eyebrow">FREQUENCY DISTRIBUTION</p><h2>Historical number frequency</h2><p className="muted">Last {Math.min(Number(windowSize),rows.length)} observations · empirical share</p></div><div className="filters"><select value={windowSize} onChange={e=>setWindowSize(e.target.value)} aria-label="Analysis window"><option value="10">Last 10</option><option value="20">Last 20</option><option value="50">Last 50</option><option value="100">Last 100</option><option value="500">Last 500</option></select><button className="ghost" onClick={refresh}>↻ Refresh</button></div></div>
   <div className="bars">{bars.map(b=><div className="bar-col" key={b.value}><div className="bar-value">{b.count}</div><div className="bar-track"><div className="bar-fill" style={{height:`${Math.max(2,b.proportion*100)}%`}}/></div><b>{b.value}</b><small>{(b.proportion*100).toFixed(1)}%</small></div>)}</div>
   <p className="callout">Frequency ranking describes this sample. The historical leader is not necessarily more likely in the next independent draw.</p>
  </section>
  <section className="panel"><div className="panel-head"><div><p className="eyebrow">HISTORICAL RANKING</p><h2>Most frequent in selected history</h2></div><span className="tag">DESCRIPTIVE ONLY</span></div>
   {leader?<><div className="statline"><span>Top observed number: <b>{leader.value}</b></span><b>{(leader.proportion*100).toFixed(1)}% in sample</b></div>{report?.topHistoricalShareWilson95&&<div className="statline"><span>95% Wilson interval for observed share</span><b>{(report.topHistoricalShareWilson95.lower*100).toFixed(1)}%–{(report.topHistoricalShareWilson95.upper*100).toFixed(1)}%</b></div>}</>:<p className="muted">Add results to calculate historical ranking.</p>}
   <p className="hint">{report?.interpretation??"No analysis yet."}</p>
   <div className="statline"><span>Walk-forward rounds evaluated</span><b>{report?.walkForward?.evaluated??0}</b></div>
   <div className="statline"><span>Historical frequency top-pick hit rate</span><b>{report?.walkForward?.frequencyTopPickAccuracy==null?"—":(report.walkForward.frequencyTopPickAccuracy*100).toFixed(1)+"%"}</b></div>
   <div className="statline"><span>Frequency model mean log loss</span><b>{report?.walkForward?.meanLogLossFrequency==null?"—":report.walkForward.meanLogLossFrequency.toFixed(3)}</b></div>
   <div className="statline"><span>Uniform baseline mean log loss</span><b>{report?.walkForward?.meanLogLossUniform==null?"—":report.walkForward.meanLogLossUniform.toFixed(3)}</b></div>
   <p className="hint">The backtest uses earlier observations to score later ones. This is a basic benchmark, not proof of a predictive edge. A model should only be considered informative if it repeatedly beats the baseline on unseen data.</p>
  </section>
  <section className="panel history"><div className="panel-head"><div><p className="eyebrow">OBSERVATION LOG</p><h2>Recent results</h2></div><button className="ghost danger" onClick={clearResults}>Clear all data</button></div>
   {rows.length===0?<div className="empty">No results yet for this period. Add historical observations above to begin analysis.</div>:<div className="chips">{[...rows].reverse().slice(0,40).map((r,i)=><span key={i} title={r.observedAt}>{r.value}</span>)}</div>}
  </section>
  <footer><b>YnPrediction</b><span>Analysis, not assurance. Never stake money based on a statistical ranking.</span></footer>
 </main>;
}
