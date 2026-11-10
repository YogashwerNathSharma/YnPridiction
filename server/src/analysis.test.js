import test from "node:test";
import assert from "node:assert/strict";
import {analyzeResults,validateResults,walkForwardBacktest} from "./analysis.js";
test("frequency proportions",()=>{const r=analyzeResults([{value:1},{value:1},{value:2}],10);assert.equal(r.counts[1].count,2);assert.equal(r.counts[2].proportion,1/3);});
test("rejects out of range",()=>assert.throws(()=>validateResults([{value:10}]),/integer from 0 to 9/));
test("latest streak",()=>{const r=analyzeResults([{value:3},{value:2},{value:2},{value:2}],20);assert.equal(r.latestValueStreak,3);});
test("transition counts",()=>{const r=analyzeResults([{value:1},{value:2},{value:1}],20);assert.equal(r.transitions[1][2],1);assert.equal(r.transitions[2][1],1);});
test("walk forward evaluates later observations only",()=>{const r=walkForwardBacktest(Array.from({length:40},(_,i)=>({value:i<30?4:i%10})),30);assert.equal(r.evaluated,10);});
