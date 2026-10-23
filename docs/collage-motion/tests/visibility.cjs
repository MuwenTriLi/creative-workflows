const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
for(const [,body]of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(body.trim())new vm.Script(body);
function extract(name){const a=html.indexOf(`      function ${name}(`);assert(a>=0,name);const b=html.indexOf('\n      }',a);return html.slice(a,b+8);}
const context={state:{assets:[{name:'A',kind:'video'},{name:'B',kind:'video',hidden:true},{name:'C',kind:'video'}],rows:2,columns:2,storyboard:true,boardPage:0},unitInfo:(c,r)=>({slot:r*2+c,tileCount:4}),positiveModulo:(x,n)=>(x%n+n)%n};
vm.createContext(context);vm.runInContext(['visibleAssetIndices','assignmentFor','assignmentRankFor','exportVideoAssets'].map(extract).join('\n'),context);
const indices=()=>Array.from({length:4},(_,i)=>context.assignmentFor(i%2,Math.floor(i/2),0,0));
assert.deepEqual(indices(),[0,2,-1,-1]);
assert.equal(context.exportVideoAssets().map(a=>a.name).join(','),'A,C');
context.state.assets.reverse();assert.deepEqual(indices(),[0,2,-1,-1]);assert.equal(context.exportVideoAssets().map(a=>a.name).join(','),'C,A');
context.state.assets.forEach(a=>a.hidden=true);assert.deepEqual(indices(),[-1,-1,-1,-1]);assert.equal(context.exportVideoAssets().length,0);
context.state.assets[1].hidden=false;context.state.storyboard=false;context.state.repeatPlacementMode='sequential';assert.deepEqual(indices(),[1,1,1,1]);assert.equal(context.exportVideoAssets().map(a=>a.name).join(','),'B');
console.log('PASS: inline syntax, hidden-source exclusion, no duplicate storyboard fillers, reorder, empty board, motion placement and export source filtering.');
