// Run: node --experimental-strip-types check-network.mjs
import assert from 'node:assert/strict';
import { initialWorkspace, connectionError, removeNode, checkGraph, parseWorkspace, position, inputCount, portY } from './app/practical/graph.ts';

const initial = initialWorkspace();
assert.deepEqual(parseWorkspace(JSON.stringify(initial)), initial);
assert.match(checkGraph(initial.top), /输入未连接/);
const nodes = ['Input', 'Conv2d', 'ReLU', 'Add', 'Output'].map((kind, i) => ({ id: String(i), kind, number: String(i), x: i * 180, y: 100, params: {} }));
const graph = { nodes, edges: [] };
function connect(from, to, port = 0) {
  assert.equal(connectionError(graph, from, to, port), null);
  graph.edges.push({ id: String(graph.edges.length), from, to, port });
}
connect('0', '1'); connect('1', '2'); connect('2', '3', 0); connect('0', '3', 1); connect('3', '4');
assert.match(checkGraph(graph), /连线检查通过/);
assert.equal(inputCount('Concat'), 2);
assert.notEqual(portY('Add', 0), portY('Add', 1));
assert.match(connectionError(graph, '0', '3', 0), /已有连线/);
assert.match(connectionError(graph, '0', '0', 0), /自身/);
assert.match(connectionError(graph, 'missing', '3', 0), /不存在/);
assert.match(connectionError(graph, '4', '0', 0), /有效的输入/);
const cycle = { ...graph, edges: graph.edges.filter(e => e.to !== '1') };
assert.match(connectionError(cycle, '3', '1', 0), /循环/);
const removed = removeNode(graph, '3');
assert.equal(removed.nodes.length, 4);
assert.ok(removed.edges.every(e => e.from !== '3' && e.to !== '3'));
assert.match(checkGraph(removed), /输入未连接/);
assert.deepEqual(position(-200, 5000), { x: 20, y: 1294 });
const stale = initialWorkspace(); stale.top.edges[0].to = 'missing';
assert.throws(() => parseWorkspace(JSON.stringify(stale)), /连线数据无效/);
assert.throws(() => parseWorkspace('{'), SyntaxError);
assert.throws(() => parseWorkspace(JSON.stringify({ top: { nodes: [] } })), /画布数据无效/);
const duplicate = initialWorkspace(); duplicate.top.nodes[1].id = duplicate.top.nodes[0].id;
assert.throws(() => parseWorkspace(JSON.stringify(duplicate)), /模块数据无效/);
console.log('Network checks passed: branches, two-input ports, cycle prevention, removal, bounds and saved data validation.');

const { referenceGraphs } = await import('./app/practical/reference-data.ts');
assert.equal(referenceGraphs.top.nodes.length, 30);
assert.equal(referenceGraphs.top.edges.length, 33);
for (const reference of Object.values(referenceGraphs)) {
  const checked = { nodes: reference.nodes.map(n => ({ ...n, kind: n.id.split('[')[0], number: n.id, params: {} })), edges: [] };
  assert.equal(new Set(checked.nodes.map(n => n.id)).size, checked.nodes.length);
  for (const node of reference.nodes) assert.ok(node.x >= 0 && node.y >= 0 && node.x + 156 <= reference.width && node.y + 86 <= reference.height);
  for (const [index, e] of reference.edges.entries()) {
    assert.equal(connectionError(checked, e.from, e.to, e.port), null);
    checked.edges.push({ ...e, id: String(index) });
  }
  assert.match(checkGraph(checked), /连线检查通过/);
}
console.log('Reference answers passed: source counts, bounds, all ports, acyclic connections and output reachability.');

const { referenceSteps, buildSteps } = await import('./app/practical/reference-data.ts');
for (const [scope, steps] of Object.entries(referenceSteps)) {
  const source = referenceGraphs[scope], placed = new Set(), revealed = [];
  assert.equal(steps.length, source.nodes.length);
  for (const step of steps) {
    assert.ok(!placed.has(step.node.id));
    for (const e of step.incoming) { assert.ok(placed.has(e.from), 'Every dependency must appear before its target'); assert.equal(e.to, step.node.id); revealed.push(e); }
    if (step.node.id.startsWith('Add')) assert.equal(step.incoming.length, 2, 'Both residual branches are ready at merge');
    placed.add(step.node.id);
  }
  assert.equal(revealed.length, source.edges.length);
  assert.ok(steps[0].node.id.startsWith('Input'));
  assert.ok(steps.at(-1).node.id.startsWith('Output'));
}
assert.throws(() => buildSteps({ nodes: [{ id: 'a' }, { id: 'b' }], edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'a' }] }), /循环/);
console.log('Build animation order passed: complete node/edge coverage, dependencies before nodes and two-branch merges.');

const { resnetReferenceGraphs, resnetReferenceSteps } = await import('./app/practical/reference-data.ts');
const resnetDraft = initialWorkspace('resnet');
assert.equal(resnetDraft.top.nodes.length, 3);
assert.equal(resnetDraft.top.edges.length, 0);
assert.equal(resnetDraft.top.nodes.find(n => n.kind === 'ResLayer').number, '1006');
assert.deepEqual(parseWorkspace(JSON.stringify(resnetDraft)), resnetDraft);
const poolDraft = structuredClone(resnetDraft);
poolDraft.top.nodes.push({ id:'pool',kind:'MaxPool2d',number:'1004',x:260,y:100,params:{kernel_size:'3',stride:'2',padding:'1'} });
assert.deepEqual(parseWorkspace(JSON.stringify(poolDraft)),poolDraft);
assert.equal(initialWorkspace().top.nodes.find(n => n.kind === 'ResLayer').number, '1004');
for (const [scope, reference] of Object.entries(resnetReferenceGraphs)) {
  const checked = { nodes: reference.nodes.map(n => ({ ...n, kind:n.id.split('[')[0],number:n.id,params:{} })),edges:[] };
  for (const [i,e] of reference.edges.entries()) { assert.equal(connectionError(checked,e.from,e.to,e.port),null); checked.edges.push({...e,id:String(i)}); }
  assert.match(checkGraph(checked),/连线检查通过/);
  const seen = new Set();
  for (const step of resnetReferenceSteps[scope]) { for (const e of step.incoming) assert.ok(seen.has(e.from)); seen.add(step.node.id); }
  assert.equal(seen.size,reference.nodes.length);
}
console.log('ResNet passed: independent initial state, MaxPool serialization, complete reference graphs and build order.');

const { parameterKeys } = await import('./app/practical/graph.ts');
assert.deepEqual(parameterKeys('Conv2d'), ['in_channels','out_channels','kernel_size','stride','padding','dilation']);
assert.deepEqual(parameterKeys('MaxPool2d'), ['kernel_size','stride','padding']);
assert.deepEqual(parameterKeys('BatchNorm2d'), []);
assert.deepEqual(parameterKeys('ReLU'), []);
for (const kind of ['Input', 'Output', 'ResLayer']) assert.deepEqual(parameterKeys(kind), []);
const dilationDraft = initialWorkspace();
dilationDraft.top.nodes.find(n => n.kind === 'Conv2d').params.dilation = '2';
assert.equal(parseWorkspace(JSON.stringify(dilationDraft)).top.nodes.find(n => n.kind === 'Conv2d').params.dilation, '2');
const legacyDraft = initialWorkspace();
delete legacyDraft.top.nodes.find(n => n.kind === 'Conv2d').params.dilation;
assert.deepEqual(parseWorkspace(JSON.stringify(legacyDraft)), legacyDraft);
console.log('Platform parameter fields and legacy/dilation saved drafts passed.');
