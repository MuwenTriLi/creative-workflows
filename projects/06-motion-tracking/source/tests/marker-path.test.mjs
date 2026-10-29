import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleMarkerPath } from '../app/marker-path.mjs';
const path={start:1.5,fps:24,samples:Array.from({length:72},(_,i)=>({point:{x:i*2,y:i},confidence:.9,misses:i===20?1:0}))};
test('does not expose a future target before its selection time',()=>{
  assert.equal(sampleMarkerPath(path,0),null);assert.equal(sampleMarkerPath(path,1.49),null);
  assert.equal(sampleMarkerPath(path,1.5).point.x,0);
});
test('seeking and different refresh rates read the same accepted path',()=>{
  for(let i=0;i<72;i++) {
    const t=1.5+i/24;
    assert.deepEqual(sampleMarkerPath(path,t).point,{x:i*2,y:i});
    assert.deepEqual(sampleMarkerPath(path,t+1/120).point,{x:i*2,y:i});
  }
  assert.equal(sampleMarkerPath(path,4.5).point.x,142);
  assert.equal(sampleMarkerPath(path,2).point.x,24);
});
test('keeps the same bounded trail and loss status on replay',()=>{
  assert.equal(sampleMarkerPath(path,1.5+20/24).misses,1);
  const end=sampleMarkerPath(path,4.5);
  sampleMarkerPath(path,1.5);
  assert.deepEqual(sampleMarkerPath(path,4.5),end);assert.equal(end.trail.length,72);
});
