import test from "node:test";import assert from "node:assert/strict";import{analyzeResults,validateResults,walkForwardBacktest}from"./analysis.js";
test("frequency proportions",()=>{const r=analyzeResults([{value:1},{value:1},{value:2}],10);assert.equal(r.counts[1].count,2);assert.equal(r.counts[2].proportion,1/3);});
test("rejects out of range values",()=>assert.throws(()=>validateResults([{value:10}]),/integer from 0 to 9/));
test("tracks latest streak",()=>assert.equal(analyzeResults([{value:2},{value:2}],10).latestValueStreak,2));
test("counts transitions",()=>assert.equal(analyzeResults([{value:1},{value:2}],10).transitions[1][2],1));
test("walk-forward evaluates only after warmup",()=>assert.equal(walkForwardBacktest(Array.from({length:35},(_,i)=>({value:i%10})),30).evaluated,5));
