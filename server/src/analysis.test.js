import test from "node:test";
import assert from "node:assert/strict";
import {analyzeResults,validateResults,walkForwardBacktest} from "./analysis.js";

test("frequency proportions",()=>{const r=analyzeResults([{value:1},{value:1},{value:2}],10);assert.equal(r.counts[1].count,2);assert.equal(r.counts[2].proportion,1/3);});
test("rejects out of range values",()=>assert.throws(()=>validateResults([{value:10}]),/integer from 0 to 9/));
test("tracks latest streak",()=>assert.equal(analyzeResults([{value:2},{value:2}],10).latestValueStreak,2));
test("counts transitions",()=>assert.equal(analyzeResults([{value:1},{value:2}],10).transitionMatrix[1][2],1));
test("walk-forward evaluates only after warmup",()=>assert.equal(walkForwardBacktest(Array.from({length:35},(_,i)=>({value:i%10})),30).evaluated,5));
test("Bayesian posterior is normalized and non-zero",()=>{const r=analyzeResults([{value:4},{value:4}],10);assert.equal(r.bayesianPosterior.length,10);assert.ok(r.bayesianPosterior.every(x=>x.probability>0));assert.ok(Math.abs(r.bayesianPosterior.reduce((s,x)=>s+x.probability,0)-1)<1e-12);});
test("transition posterior uses only observed predecessor transitions",()=>{const r=analyzeResults([{value:3},{value:7},{value:3}],10);assert.equal(r.transitionPosterior.fromValue,3);assert.equal(r.transitionPosterior.observations,1);assert.equal(r.transitionPosterior.probabilities.length,10);});
test("Bayesian backtest exposes proper scoring metrics",()=>{const r=walkForwardBacktest(Array.from({length:40},(_,i)=>({value:i%10})),30);assert.equal(r.evaluated,10);assert.ok(Number.isFinite(r.meanLogLossBayesian));assert.ok(Number.isFinite(r.meanBrierBayesian));});
