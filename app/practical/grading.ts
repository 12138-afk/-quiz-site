import type { Exercise, Graph, Workspace } from './graph';
import type { ReferenceGraph } from './reference-data';

type Parameters = Record<string, Record<string, number>>;
const conv = (input: number, output: number, kernel: number, stride: number, padding: number) => ({ in_channels: input, out_channels: output, kernel_size: kernel, stride, padding, dilation: 1 });
export function expectedParameters(exercise: Exercise, scope: keyof Workspace): Parameters {
  if (exercise === 'resnet') return scope === 'top' ? {
    'Conv2d[1001]': conv(3, 64, 7, 2, 3), 'MaxPool2d[1004]': { kernel_size: 3, stride: 2, padding: 1 },
  } : {
    'Conv2d[3013]': conv(64, 128, 3, 2, 1), 'Conv2d[3016]': conv(128, 128, 3, 1, 1),
    'Conv2d[4001]': conv(64, 128, 1, 2, 0), 'Conv2d[3020]': conv(128, 128, 3, 1, 1), 'Conv2d[3023]': conv(128, 128, 3, 1, 1),
  };
  return scope === 'top' ? {
    'Conv2d[1001]': conv(3, 128, 7, 2, 3), 'Conv2d[1006]': conv(256, 256, 3, 1, 1),
    ...Object.fromEntries(['5036', '4036', '3016', '2006'].map(id => [`Upsample[${id}]`, { scale_factor: 2 }])),
  } : { 'Conv2d[3001]': conv(128, 256, 3, 2, 1), 'Conv2d[3004]': conv(256, 256, 3, 1, 1), 'Conv2d[4001]': conv(128, 256, 1, 2, 0) };
}

function matchesValue(value: string | undefined, expected: number, pair: boolean) {
  if (!value?.trim()) return false;
  const parts = value.trim().replace(/^\[(.*)\]$|^\((.*)\)$/, (_, square, round) => square ?? round).split(/[,，x×\s]+/);
  return (parts.length === 1 || (pair && parts.length === 2)) && parts.every(p => p !== '' && Number.isFinite(Number(p)) && Number(p) === expected);
}

export function gradeGraph(graph: Graph, reference: ReferenceGraph, parameters: Parameters) {
  const mapping = new Map<string, string>();
  const used = new Set<string>();
  const issues: string[] = [];
  for (const node of reference.nodes) {
    const kind = node.id.split('[')[0];
    if (kind === 'Add') continue;
    const candidates = graph.nodes.filter(n => n.kind === kind && (kind === 'Input' || kind === 'Output' || `${n.kind}[${n.number}]` === node.id));
    if (candidates.length === 1) { mapping.set(node.id, candidates[0].id); used.add(candidates[0].id); }
  }
  // Add 的编号在平台和本地不同，按下游模块定位；两个输入允许互换。
  for (const node of reference.nodes.filter(n => n.id.split('[')[0] === 'Add')) {
    const destinations = reference.edges.filter(e => e.from === node.id).map(e => mapping.get(e.to)).filter(Boolean);
    const candidates = graph.nodes.filter(n => n.kind === 'Add' && !used.has(n.id) && destinations.some(to => graph.edges.some(e => e.from === n.id && e.to === to)));
    if (candidates.length === 1) { mapping.set(node.id, candidates[0].id); used.add(candidates[0].id); }
  }
  for (const n of reference.nodes) if (!mapping.has(n.id)) issues.push(`缺少或无法唯一识别 ${n.id}${n.id.startsWith('Add') ? '（请检查其下游连线）' : '（请检查类型及 index）'}`);
  const extraNodes = graph.nodes.filter(n => !used.has(n.id));
  for (const n of extraNodes) issues.push(`未匹配模块 ${n.kind}[${n.number}]，请检查编号、重复或多余模块`);
  const usedEdges = new Set<string>();
  for (const e of reference.edges) {
    const found = graph.edges.find(actual => !usedEdges.has(actual.id) && actual.from === mapping.get(e.from) && actual.to === mapping.get(e.to) && (e.to.startsWith('Add') || actual.port === e.port));
    if (found) usedEdges.add(found.id);
    else issues.push(`缺少连线 ${e.from} → ${e.to}`);
  }
  const extraEdges = graph.edges.length - usedEdges.size;
  if (extraEdges) issues.push(`有 ${extraEdges} 条多余或不符合参考结构的连线`);
  let correct = 0, total = 0;
  for (const [id, fields] of Object.entries(parameters)) {
    const node = graph.nodes.find(n => n.id === mapping.get(id));
    for (const [key, expected] of Object.entries(fields)) {
      total++;
      const value = node?.params[key] ?? (node && key === 'dilation' ? '1' : undefined);
      if (matchesValue(value, expected, ['kernel_size', 'stride', 'padding', 'dilation', 'scale_factor'].includes(key))) correct++;
      else issues.push(`${id} · ${key}：参考值 ${expected}，当前 ${node ? value || '未填写' : '模块缺失'}`);
    }
  }
  const modules = 40 * mapping.size / (reference.nodes.length + extraNodes.length);
  const connections = 40 * usedEdges.size / (reference.edges.length + extraEdges);
  const params = total ? 20 * correct / total : 20;
  return { score: modules + connections + params, modules, connections, params, issues };
}

export function gradeWorkspace(workspace: Workspace, references: Record<keyof Workspace, ReferenceGraph>, exercise: Exercise) {
  const top = gradeGraph(workspace.top, references.top, expectedParameters(exercise, 'top'));
  const reslayer = gradeGraph(workspace.reslayer, references.reslayer, expectedParameters(exercise, 'reslayer'));
  return { score: (top.score + reslayer.score) / 2, top, reslayer };
}
