import test from 'node:test';
import assert from 'node:assert/strict';
import { exportFramePlan } from '../app/export-timing.mjs';
for (const seconds of [4, 4.01, 7.45, 0.005, 25]) test(`complete ${seconds} s timeline without gaps`, () => {
 const plan=exportFramePlan(seconds,60);
 assert.equal(plan.length,Math.ceil(seconds*60-1e-8));
 assert.equal(plan[0].timestamp,0);
 for(let i=0;i<plan.length;i++){assert.ok(plan[i].duration>0); if(i)assert.equal(plan[i-1].timestamp+plan[i-1].duration,plan[i].timestamp);}
 assert.equal(plan.at(-1).timestamp+plan.at(-1).duration,Math.round(seconds*1e6));
});
test('reject unknown duration and invalid fps',()=>{for(const d of [0,-1,NaN,Infinity])assert.throws(()=>exportFramePlan(d)); for(const f of [0,29.97,121])assert.throws(()=>exportFramePlan(4,f));});
