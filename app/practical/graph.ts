export const operators = ['Conv2d', 'MaxPool2d', 'Upsample', 'BatchNorm2d', 'ReLU', 'Add', 'Concat', 'ResLayer'] as const;
export type Exercise = 'hourglass' | 'resnet';
export type Kind = typeof operators[number] | 'Input' | 'Output';
export type Block = { id: string; kind: Kind; number: string; x: number; y: number; params: Record<string, string> };
export type Edge = { id: string; from: string; to: string; port: number };
export type Graph = { nodes: Block[]; edges: Edge[] };
export type Workspace = { top: Graph; reslayer: Graph };
export const WIDTH = 156, HEIGHT = 86, CANVAS_W = 2200, CANVAS_H = 1400;
export const defaults: Record<Kind, Record<string, string>> = {
  MaxPool2d: { kernel_size: '3', stride: '2', padding: '1' },
  Input: { shape: '1, 3, 640, 640' }, Output: { shape: '1, 256, 160, 160' },
  Conv2d: { in_channels: '256', out_channels: '256', kernel_size: '3', stride: '1', padding: '1', dilation: '1', bias: 'false' },
  Upsample: { scale_factor: '2', mode: 'nearest' }, BatchNorm2d: { num_features: '256', eps: '0.00001' },
  ReLU: { inplace: 'false' }, Add: {}, Concat: { dim: '1' }, ResLayer: { in_channels: '256', out_channels: '256', stride: '1', num_blocks: '1' },
};
// Keep legacy saved parameters readable; expose the fields shown by the platform.
export function parameterKeys(kind: Kind): string[] {
  if (kind === 'Conv2d') return ['in_channels', 'out_channels', 'kernel_size', 'stride', 'padding', 'dilation'];
  if (kind === 'MaxPool2d') return ['kernel_size', 'stride', 'padding'];
  if (['BatchNorm2d', 'ReLU', 'Input', 'Output', 'ResLayer'].includes(kind)) return [];
  return Object.keys(defaults[kind]);
}
export function inputCount(kind: Kind) { return kind === 'Input' ? 0 : kind === 'Add' || kind === 'Concat' ? 2 : 1; }
export function portY(kind: Kind, port: number) { return inputCount(kind) === 2 ? 28 + port * 32 : HEIGHT / 2; }
export function position(x: number, y: number) { return { x: Math.max(20, Math.min(CANVAS_W - WIDTH - 20, x)), y: Math.max(20, Math.min(CANVAS_H - HEIGHT - 20, y)) }; }
export function initialWorkspace(exercise: Exercise = 'hourglass'): Workspace {
  const node = (id: string, kind: Kind, number: string, x: number, y: number, params = {}): Block => ({ id, kind, number, x, y, params: { ...defaults[kind], ...params } });
  const edge = (from: string, to: string): Edge => ({ id: `${from}-${to}`, from, to, port: 0 });
  if (exercise === 'resnet') return {
    top: { nodes: [node('input', 'Input', '1000', 40, 180), node('res1', 'ResLayer', '1006', 700, 180, { in_channels: '64', out_channels: '128', stride: '2', num_blocks: '2' }), node('output', 'Output', '9001', 1350, 180, { shape: '1, 512, 20, 20' })], edges: [] },
    reslayer: { nodes: [node('res-input', 'Input', '8001', 40, 180, { shape: '1, 64, 160, 160' }), node('res-output', 'Output', '9001', 1800, 680, { shape: '1, 128, 80, 80' })], edges: [] },
  };
  return {
    top: { nodes: [
      node('input', 'Input', '8001', 40, 140), node('conv1', 'Conv2d', '1001', 250, 140, { in_channels: '3', out_channels: '128', kernel_size: '7', stride: '2', padding: '3' }),
      node('bn1', 'BatchNorm2d', '1002', 460, 140, { num_features: '128' }), node('relu1', 'ReLU', '1003', 670, 140),
      node('res1', 'ResLayer', '1004', 880, 140, { in_channels: '128', out_channels: '256', stride: '2' }),
      node('conv2', 'Conv2d', '1006', 460, 480), node('bn2', 'BatchNorm2d', '1007', 670, 480), node('relu2', 'ReLU', '1008', 880, 480), node('output', 'Output', '9001', 1090, 480),
    ], edges: [edge('input', 'conv1'), edge('conv1', 'bn1'), edge('bn1', 'relu1'), edge('relu1', 'res1'), edge('conv2', 'bn2'), edge('bn2', 'relu2'), edge('relu2', 'output')] },
    reslayer: { nodes: [node('res-input', 'Input', '8001', 40, 220, { shape: '1, 128, 320, 320' }), node('res-output', 'Output', '9001', 1300, 220)], edges: [] },
  };
}
export function connectionError(graph: Graph, from: string, to: string, port: number): string | null {
  const source = graph.nodes.find(n => n.id === from), target = graph.nodes.find(n => n.id === to);
  if (!source || !target) return '模块不存在。';
  if (from === to) return '不能连接模块自身。';
  if (source.kind === 'Output' || !Number.isInteger(port) || port < 0 || port >= inputCount(target.kind)) return '请选择输出端口和有效的输入端口。';
  if (graph.edges.some(e => e.to === to && e.port === port)) return '该输入端口已有连线，请先删除原连线。';
  const stack = [to], visited = new Set<string>();
  while (stack.length) {
    const id = stack.pop()!;
    if (id === from) return '这条连线会形成循环，请调整连接方向。';
    if (visited.has(id)) continue;
    visited.add(id);
    stack.push(...graph.edges.filter(e => e.from === id).map(e => e.to));
  }
  return null;
}
export function removeNode(graph: Graph, id: string): Graph { return { nodes: graph.nodes.filter(n => n.id !== id), edges: graph.edges.filter(e => e.from !== id && e.to !== id) }; }
export function checkGraph(graph: Graph): string {
  if (graph.nodes.some(n => !n.number) || new Set(graph.nodes.map(n => n.number)).size !== graph.nodes.length) return '请为每个模块设置不重复的序号。';
  const missing = graph.nodes.filter(n => Array.from({ length: inputCount(n.kind) }, (_, port) => port).some(port => !graph.edges.some(e => e.to === n.id && e.port === port)));
  if (missing.length) return `尚有 ${missing.length} 个模块的输入未连接：${missing.map(n => `${n.kind}[${n.number}]`).join('、')}`;
  const outputs = graph.nodes.filter(n => n.kind === 'Output');
  if (!outputs.length || !graph.nodes.some(n => n.kind === 'Input')) return '需要保留 Input 和 Output 模块。';
  const reachable = new Set(outputs.map(n => n.id)), stack = [...reachable];
  while (stack.length) {
    const current = stack.pop();
    for (const e of graph.edges.filter(e => e.to === current)) if (!reachable.has(e.from)) { reachable.add(e.from); stack.push(e.from); }
  }
  if (reachable.size !== graph.nodes.length) return '存在未通向 Output 的模块，请继续连线或删除多余模块。';
  return '连线检查通过。此检查不验证张量尺寸、模型运行或官方评分。';
}

export function parseWorkspace(text: string): Workspace {
  if (text.length > 2_000_000) throw new Error('保存内容过大');
  const data = JSON.parse(text);
  for (const key of ['top', 'reslayer']) {
    const g = data?.[key];
    if (!g || !Array.isArray(g.nodes) || !Array.isArray(g.edges) || g.nodes.length > 300 || g.edges.length > 1200) throw new Error('画布数据无效');
    const ids = new Set<string>(), edgeIds = new Set<string>();
    for (const n of g.nodes) {
      if (!n || typeof n.id !== 'string' || ids.has(n.id) || ![...operators, 'Input', 'Output'].includes(n.kind) || typeof n.number !== 'string' || n.number.length > 20 || !Number.isFinite(n.x) || !Number.isFinite(n.y) || n.x < 0 || n.y < 0 || n.x > CANVAS_W - WIDTH || n.y > CANVAS_H - HEIGHT || !n.params || typeof n.params !== 'object' || Array.isArray(n.params) || Object.entries(n.params).some(([k, v]) => !Object.hasOwn(defaults[n.kind as Kind], k) || typeof v !== 'string' || v.length > 100)) throw new Error('模块数据无效');
      ids.add(n.id);
    }
    const validated: Graph = { nodes: g.nodes, edges: [] };
    for (const e of g.edges) {
      if (!e || typeof e.id !== 'string' || edgeIds.has(e.id) || connectionError(validated, e.from, e.to, e.port)) throw new Error('连线数据无效');
      edgeIds.add(e.id); validated.edges.push(e);
    }
  }
  return { top: data.top, reslayer: data.reslayer };
}

