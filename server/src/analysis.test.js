import test from "node:test";
import assert from "node:assert/strict";
import {analyzeResults,validateResults,walkForwardBacktest} from "./analysis.js";

test("counts values and empirical proportions",()=>{
 const r=analyzeResults([{value:1},{value:1},{value:2}],10);
 assert.equal(r.sampleSize,3);assert.equal(r.counts[1].count,2);assert.equal(r.counts[2].proportion,1/3);
});
test("rejects values outside 0-9",()=>assert.throws(()=>validateResults([{value:10}]),/integer from 0 to 9/));
test("tracks most recent streak",()=>{
 const r=analyzeResults([{value:3},{value:2},{value:2},{value:2}],20);
 assert.equal(r.latestObservedValue,2);assert.equal(r.latestValueStreak,3);
});
test("transition matrix counts adjacent outcomes",()=>{
 const r=analyzeResults([{value:1},{value:2},{value:1}],20);
 assert.equal(r.transitions[1][2],1);assert.equal(r.transitions[2][1],1);
});
test("walk-forward test only evaluates after minimum history",()=>{
 const rows=Array.from({length:40},(_,i)=>({value:i<30?4:(i%10)}));
 const r=walkForwardBacktest(rows,30);assert.equal(r.evaluated,10);
});
