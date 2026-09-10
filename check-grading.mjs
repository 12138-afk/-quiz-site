// Run: node --experimental-strip-types check-grading.mjs
import assert from 'node:assert/strict';
import { gradeWorkspace, expectedParameters } from './app/practical/grading.ts';
import { referenceGraphs, resnetReferenceGraphs } from './app/practical/reference-data.ts';
import { initialWorkspace } from './app/practical/graph.ts';

for (const [exercise, references] of [['hourglass', referenceGraphs], ['resnet', resnetReferenceGraphs]]) {
  const solved = Object.fromEntries(Object.entries(references).map(([scope, ref]) => {
    const params = expectedParameters(exercise, scope);
    return [scope, {
      nodes: ref.nodes.map((n, i) => ({ id:n.id, kind:n.id.split('[')[0], number:n.id.startsWith('Add') ? String(i + 50) : n.id.match(/\[(.*)\]/)?.[1] ?? '0', x:20,y:20,params:Object.fromEntries(Object.entries(params[n.id] ?? {}).map(([k,v]) => [k,String(v)])) })),
      edges:ref.edges.map((e,i)=>({...e,id:String(i)})),
    }];
  }));
  const grade = workspace => gradeWorkspace(workspace, references, exercise);
  assert.equal(grade(solved).score, 100);
  assert.deepEqual(grade(solved).reslayer.issues, []);
  assert.equal(grade({top:{nodes:[],edges:[]},reslayer:{nodes:[],edges:[]}}).score, 0);
  assert.ok(grade(initialWorkspace(exercise)).score < 100);
  const swapped = structuredClone(solved);
  for (const graph of Object.values(swapped)) {
    graph.nodes.reverse(); graph.edges.reverse();
    graph.nodes.filter(n=>['Input','Output'].includes(n.kind)).forEach(n=>n.number='999');
    graph.edges.filter(e=>e.to.startsWith('Add')).forEach(e=>e.port=1-e.port);
    graph.nodes.filter(n=>n.kind==='Conv2d').forEach(n=>{n.params.kernel_size=`[${n.params.kernel_size}, ${n.params.kernel_size}]`;delete n.params.dilation;});
  }
  assert.equal(grade(swapped).score,100);
  const wrong = structuredClone(solved);
  wrong.top.nodes.find(n=>n.kind==='Conv2d').params.in_channels='99';
  assert.ok(grade(wrong).score < 100);
  assert.ok(grade(wrong).top.issues.some(s=>s.includes('in_channels')));
  wrong.top.edges.pop(); assert.ok(grade(wrong).top.connections < 40);
  const extra = structuredClone(solved);
  extra.top.nodes.push({...extra.top.nodes.find(n=>n.kind==='Conv2d'),id:'duplicate'});
  assert.ok(grade(extra).top.modules < 40);
  const extraEdge = structuredClone(solved);
  extraEdge.top.edges.push({...extraEdge.top.edges[0],id:'extra'});
  assert.ok(grade(extraEdge).top.connections < 40);
  assert.equal(JSON.stringify(grade(solved)), JSON.stringify(grade(solved)));
  console.log(`${exercise}: full credit, empty/partial drafts, Add input swaps, parameter pairs, legacy dilation, wrong parameters, missing edges and duplicates passed.`);
}
