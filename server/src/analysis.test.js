import test from "node:test";
import assert from "node:assert/strict";
import { analyzeResults, validateResults } from "./analysis.js";

test("counts values and proportions", () => {
  const report = analyzeResults([{value:1},{value:1},{value:2}], 10);
  assert.equal(report.sampleSize,3);
  assert.equal(report.counts[1].count,2);
  assert.equal(report.counts[2].proportion,1/3);
});

test("rejects values outside 0-9", () => {
  assert.throws(()=>validateResults([{value:10}]),/integer from 0 to 9/);
});

test("tracks latest repeated value streak", () => {
  const report = analyzeResults([{value:3},{value:2},{value:2},{value:2}],20);
  assert.equal(report.latestObservedValue,2);
  assert.equal(report.latestValueStreak,3);
});

test("transition matrix counts adjacent observations", () => {
  const report = analyzeResults([{value:1},{value:2},{value:1}],20);
  assert.equal(report.transitions[1][2],1);
  assert.equal(report.transitions[2][1],1);
});
