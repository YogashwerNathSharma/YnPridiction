import { useEffect, useMemo, useState } from "react";

type ResultRow = { value: number; observedAt?: string };
type Report = {
  sampleSize:number; counts:{value:number;count:number;proportion:number}[];
  historicalFrequencyRanking:{value:number;count:number;proportion:number}[];
  latestObservedValue:number|null; latestValueStreak:number;
  baselinePerNumber:number; interpretation:string; disclaimer:string;
};
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function App() {
  const [rows,setRows] = useState<ResultRow[]>([]);
  const [value,setValue] = useState("0");
  const [period,setPeriod] = useState("1 Minute");
  const [report,setReport] = useState<Report|null>(null);
  const [status,setStatus] = useState("Connecting to analysis API…");
  const [error,setError] = useState("");

  async function refresh() {
    try {
      const [r,a] = await Promise.all([fetch(API+"/api/results"),fetch(API+"/api/analysis?window=100")]);
      if (!r.ok || !a.ok) throw new Error("API request failed");
      const rd = await r.json(); const ad = await a.json();
      setRows(rd.results); setReport(ad); setStatus("Analysis API connected");
    } catch {
      setStatus("API offline — start the backend to enable live analysis");
    }
  }
  useEffect(()=>{refresh();},[]);

  async function addResult(e:React.FormEvent) {
    e.preventDefault(); setError("");
    const n = Number(value);
    if (!Number.isInteger(n) || n<0 || n>9) {setError("Enter a whole number from 0 to 9.");return;}
    try {
      const response=await fetch(API+"/api/results",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({value:n,period,observedAt:new Date().toISOString()})});
      if(!response.ok) throw new Error((await response.json()).error || "Could not save result");
      setValue("0"); await refresh();
    } catch(err) {setError(err instanceof Error?err.message:"Could not save result");}
  }
  async function clearResults() {
    if(!confirm("Clear all in-memory results?")) return;
    await fetch(API+"/api/results",{method:"DELETE"}); await refresh();
  }
  const bars = useMemo(()=>report?.counts ?? Array.from({length:10},(_,value)=>({value,count:0,proportion:0})),[report]);

  return <main className="shell">
    <header className="topbar"><div className="brand"><div className="logo">Yn</div><div><b>YnPrediction</b><span>Trend intelligence workspace</span></div></div><div className="connection"><i/> {status}</div></header>
    <section className="hero"><div><p className="eyebrow">STATISTICAL ANALYSIS • HISTORICAL DATA</p><h1>Read the trend.<br/><em>Understand the odds.</em></h1><p className="sub">Explore historical outcomes, frequencies, streaks and transitions. Every insight is descriptive—not a guaranteed next result.</p></div><div className="hero-mark"><div className="ring">0–9<span>DATA</span></div></div></section>
    <section className="grid">
      <article className="panel entry"><div className="panel-head"><div><p className="eyebrow">DATA INPUT</p><h2>Add observed result</h2></div><span className="tag">MANUAL</span></div>
        <form onSubmit={addResult}><label>Game period<select value={period} onChange={e=>setPeriod(e.target.value)}><option>30 Seconds</option><option>1 Minute</option><option>3 Minutes</option><option>5 Minutes</option></select></label><label>Result number<select value={value} onChange={e=>setValue(e.target.value)}>{Array.from({length:10},(_,i)=><option key={i} value={i}>{i}</option>)}</select></label><button className="primary">Add result <span>↗</span></button>{error&&<p className="error">{error}</p>}</form>
        <p className="hint">Starter version stores results in server memory. Restarting the API clears them; database persistence is a later milestone.</p>
      </article>
      <article className="panel summary"><p className="eyebrow">CURRENT DATASET</p><div className="metric">{report?.sampleSize ?? 0}</div><p className="muted">observations analyzed</p><div className="divider"/><div className="statline"><span>Latest observed</span><b>{report?.latestObservedValue ?? "—"}</b></div><div className="statline"><span>Current streak</span><b>{report?.latestValueStreak ?? 0}</b></div><div className="statline"><span>Uniform baseline</span><b>10% / number</b></div></article>
    </section>
    <section className="panel chart-panel"><div className="panel-head"><div><p className="eyebrow">FREQUENCY DISTRIBUTION</p><h2>Historical number frequency</h2><p className="muted">Last {Math.min(100,rows.length)} observations · empirical share by number</p></div><button className="ghost" onClick={refresh}>↻ Refresh</button></div>
      <div className="bars">{bars.map(b=><div className="bar-col" key={b.value}><div className="bar-value">{b.count}</div><div className="bar-track"><div className="bar-fill" style={{height:`${Math.max(2,b.proportion*100)}%`}}/></div><b>{b.value}</b><small>{(b.proportion*100).toFixed(1)}%</small></div>)}</div>
      <p className="callout">Frequency ranking describes what appeared in this sample. It does not mean the most frequent number is more likely in the next independent draw.</p>
    </section>
    <section className="panel history"><div className="panel-head"><div><p className="eyebrow">OBSERVATION LOG</p><h2>Recent results</h2></div><button className="ghost danger" onClick={clearResults}>Clear data</button></div>
      {rows.length===0?<div className="empty">No results yet. Add historical observations above to begin analysis.</div>:<div className="chips">{[...rows].reverse().slice(0,40).map((r,i)=><span key={i} title={r.observedAt}>{r.value}</span>)}</div>}
    </section>
    <footer><b>YnPrediction</b><span>Analysis, not assurance. Never stake money based on a statistical ranking.</span></footer>
  </main>;
}
