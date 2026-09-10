'use client';
import ExerciseDialogs from './exercise-dialogs';
import SubmissionScore from './submission-score';
import { type ReactNode, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowLeft, ArrowRight, Box, Check, Minus, Plus, RotateCcw, Save, Trash2, Undo2, Redo2 } from 'lucide-react';
import { operators, defaults, parameterKeys, initialWorkspace, connectionError, removeNode, checkGraph, parseWorkspace, position, inputCount, portY, WIDTH, HEIGHT, CANVAS_W, CANVAS_H, type Exercise, type Workspace, type Graph, type Kind, type Block } from './graph';


type Drag = { id?: string; kind: Kind; dx: number; dy: number; x: number; y: number; clientX: number; clientY: number; startX: number; startY: number; moved: boolean };
const labels: Record<string, string> = { shape: '张量尺寸', in_channels: '输入通道', out_channels: '输出通道', kernel_size: '卷积核大小', stride: '步长', padding: '填充', dilation: '膨胀率', bias: '偏置', num_features: '通道数', eps: 'ε', inplace: '原地操作', scale_factor: '放大倍数', mode: '插值方式', dim: '拼接维度', num_blocks: '残差块数量' };

export default function NetworkEditor({ question, exercise = 'hourglass' }: { question: ReactNode; exercise?: Exercise }) {
  const title = exercise === 'resnet' ? 'ResNet' : 'HourglassNet';
  const moduleNumber = exercise === 'resnet' ? '1006' : '1004';
  const STORAGE_KEY = exercise === 'resnet' ? 'resnet-workspace-v1' : 'hourglassnet-workspace-v1';
  const [workspace, setWorkspace] = useState<Workspace>(() => initialWorkspace(exercise));
  const [scope, setScope] = useState<'top' | 'reslayer'>('top');
  const [selection, setSelection] = useState<{ kind: 'node' | 'edge'; id: string } | null>(null);
  const [zoom, setZoom] = useState(0.75);
  const [status, setStatus] = useState('从左侧拖入模块；从蓝色输出端口拖到输入端口即可连接。');
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState('');
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const [wire, setWire] = useState<{ from: string; x: number; y: number } | null>(null);
  const wireRef = useRef<typeof wire>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const history = useRef<{ undo: Workspace[]; redo: Workspace[] }>({ undo: [], redo: [] });
  const [historyVersion, setHistoryVersion] = useState(0);
  const graph = workspace[scope];
  const availableOperators = operators.filter(kind => exercise === 'resnet' ? (scope === 'top' ? ['Conv2d','MaxPool2d','BatchNorm2d','ReLU','ResLayer'] : ['Conv2d','BatchNorm2d','ReLU','Add','Concat']).includes(kind) : kind !== 'MaxPool2d');
  const node = selection?.kind === 'node' ? graph.nodes.find(n => n.id === selection.id) : undefined;
  const edge = selection?.kind === 'edge' ? graph.edges.find(e => e.id === selection.id) : undefined;
  const serialized = JSON.stringify(workspace);
  const dirty = ready && saved !== serialized;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { const loaded = parseWorkspace(raw); setWorkspace(loaded); setSaved(JSON.stringify(loaded)); setStatus('已恢复本机保存的两个画布。'); }
      else setSaved(JSON.stringify(initialWorkspace(exercise)));
    } catch { setStatus('无法恢复保存内容。原记录未覆盖，可继续搭建后手动保存。'); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function commit(next: Workspace) {
    history.current.undo.push(workspace);
    if (history.current.undo.length > 50) history.current.undo.shift();
    history.current.redo = [];
    setWorkspace(next); setHistoryVersion(v => v + 1);
  }
  function updateGraph(next: Graph) { commit({ ...workspace, [scope]: next }); }
  function updateNode(changes: Partial<Block>) {
    if (node) updateGraph({ ...graph, nodes: graph.nodes.map(n => n.id === node.id ? { ...n, ...changes } : n) });
  }
  function point(clientX: number, clientY: number) {
    const el = viewport.current!, rect = el.getBoundingClientRect();
    return { x: (clientX - rect.left + el.scrollLeft) / zoom, y: (clientY - rect.top + el.scrollTop) / zoom };
  }
  function inside(clientX: number, clientY: number) {
    const rect = viewport.current!.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  }
  function startDrag(e: ReactPointerEvent<HTMLElement>, kind: Kind, block?: Block) {
    if (e.button !== 0 || !ready) return;
    e.preventDefault(); e.stopPropagation(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId);
    clearWire();
    const p = point(e.clientX, e.clientY);
    const d: Drag = { id: block?.id, kind, dx: block ? p.x - block.x : WIDTH / 2, dy: block ? p.y - block.y : HEIGHT / 2, x: block?.x ?? p.x, y: block?.y ?? p.y, clientX: e.clientX, clientY: e.clientY, startX: e.clientX, startY: e.clientY, moved: false };
    dragRef.current = d; setDrag(d);
    if (block) setSelection({ kind: 'node', id: block.id });
  }
  function moveDrag(e: ReactPointerEvent<HTMLElement>) {
    const d = dragRef.current;
    if (!d) return;
    const p = point(e.clientX, e.clientY);
    const next = { ...d, ...position(p.x - d.dx, p.y - d.dy), clientX: e.clientX, clientY: e.clientY, moved: d.moved || Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 4 };
    dragRef.current = next; setDrag(next);
  }
  function addNode(kind: Kind, x?: number, y?: number) {
    if (graph.nodes.length >= 300) { setStatus('当前画布已达 300 个模块，请删除多余模块。'); return; }
    const el = viewport.current!;
    const maxNumber = Math.max(scope === 'top' ? 1008 : 3000, ...graph.nodes.filter(n => n.kind !== 'Input' && n.kind !== 'Output').map(n => Number(n.number) || 0));
    const block: Block = { id: crypto.randomUUID(), kind, number: String(maxNumber + 1), ...position(x ?? el.scrollLeft / zoom + 100, y ?? el.scrollTop / zoom + 100 + graph.nodes.length % 5 * 24), params: { ...defaults[kind] } };
    updateGraph({ ...graph, nodes: [...graph.nodes, block] });
    setSelection({ kind: 'node', id: block.id }); setStatus(`已添加 ${kind}，可在右侧修改序号和参数。`);
  }
  function endDrag(e: ReactPointerEvent<HTMLElement>) {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null; setDrag(null);
    if (d.id && d.moved) updateGraph({ ...graph, nodes: graph.nodes.map(n => n.id === d.id ? { ...n, ...position(d.x, d.y) } : n) });
    else if (!d.id && d.moved && inside(e.clientX, e.clientY)) addNode(d.kind, d.x, d.y);
  }
  function clearWire() { wireRef.current = null; setWire(null); }
  function connect(from: string, to: string, port: number) {
    const error = connectionError(graph, from, to, port);
    if (error) { setStatus(error); return; }
    const added = { id: crypto.randomUUID(), from, to, port };
    updateGraph({ ...graph, edges: [...graph.edges, added] }); clearWire();
    setSelection({ kind: 'edge', id: added.id }); setStatus('连线已添加。输出端口可继续连接其他模块，形成分支。');
  }
  function beginWire(e: ReactPointerEvent<HTMLButtonElement>, from: Block) {
    if (e.button !== 0) return;
    e.stopPropagation(); e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId);
    const next = { from: from.id, x: from.x + WIDTH, y: from.y + HEIGHT / 2 };
    wireRef.current = next; setWire(next); setStatus('拖到目标输入端口，或单击目标输入端口完成连接；Esc 取消。');
  }
  function moveWire(e: ReactPointerEvent<HTMLElement>) {
    if (!wireRef.current) return;
    const next = { from: wireRef.current.from, ...point(e.clientX, e.clientY) };
    wireRef.current = next; setWire(next);
  }
  function endWire(e: ReactPointerEvent<HTMLButtonElement>) {
    e.stopPropagation();
    const target = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-input-node]');
    if (target && wireRef.current) connect(wireRef.current.from, target.dataset.inputNode!, Number(target.dataset.inputPort));
  }
  function removeSelected() {
    if (node) { updateGraph(removeNode(graph, node.id)); setStatus('模块和关联连线已删除，可撤销。'); }
    else if (edge) { updateGraph({ ...graph, edges: graph.edges.filter(e => e.id !== edge.id) }); setStatus('连线已删除，可撤销。'); }
    setSelection(null); clearWire();
  }
  function travel(direction: 'undo' | 'redo') {
    const stack = history.current[direction], next = stack.pop();
    if (!next) return;
    history.current[direction === 'undo' ? 'redo' : 'undo'].push(workspace);
    setWorkspace(next); setSelection(null); clearWire(); setHistoryVersion(v => v + 1); setStatus(direction === 'undo' ? '已撤销。' : '已重做。');
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, serialized); setSaved(serialized); setStatus('已保存两个画布到本机浏览器，刷新后可恢复。'); }
    catch { setStatus('保存失败：浏览器存储不可用或空间不足。请勿关闭页面。'); }
  }
  function changeScope(next: 'top' | 'reslayer') { setScope(next); setSelection(null); clearWire(); viewport.current?.scrollTo(0, 0); }
  function curve(x: number, y: number, tx: number, ty: number) { const bend = Math.max(55, Math.abs(tx - x) / 2); return `M ${x} ${y} C ${x + bend} ${y}, ${tx - bend} ${ty}, ${tx} ${ty}`; }
  const displayNodes = graph.nodes.map(n => drag?.id === n.id ? { ...n, x: drag.x, y: drag.y } : n);
  const wireSource = displayNodes.find(n => n.id === wire?.from);

  return <section className="network-editor" aria-label={`${title} 网络搭建编辑器`} data-history={historyVersion} onKeyDown={e => {
    if (e.target instanceof Element && e.target.closest('[role=dialog]')) return;
    if (e.key === 'Escape') { clearWire(); dragRef.current = null; setDrag(null); }
    if (e.target instanceof HTMLElement && e.target.closest('input,select,textarea')) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeSelected(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); travel(e.shiftKey ? 'redo' : 'undo'); }
  }}>
    <div className="editor-heading"><div><span className="editor-kicker">MODEL WORKSPACE</span><h2>网络结构搭建</h2><span>拖入模块 · 连接端口 · 编辑参数</span></div><ExerciseDialogs question={question} exercise={exercise}/></div>
    <div className="editor-body">
      <aside className="operator-palette"><h3><Box size={18}/>算子列表</h3><p>拖入画布，或点 + 添加</p>
        {[false, true].map(advanced => <section className="palette-group" key={String(advanced)} aria-label={advanced ? '进阶模块列表' : '基础算子列表'}><h4>{advanced ? '进阶模块列表' : '基础算子列表'}</h4><div className="palette-group-items">{availableOperators.filter(kind => (kind === 'ResLayer') === advanced).map(kind => <div className="palette-row" key={kind}>
          <button className="palette-drag" aria-label={`拖入 ${kind}`} onPointerDown={e => startDrag(e, kind)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={() => { dragRef.current = null; setDrag(null); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addNode(kind); } }} disabled={!ready}><Box size={16}/>{kind}</button>
          <button className="palette-add" aria-label={`添加 ${kind}`} onClick={() => addNode(kind)} disabled={!ready}><Plus size={16}/></button>
        </div>)}</div>{advanced && !availableOperators.includes('ResLayer') && <p className="palette-group-empty">当前层级无进阶模块</p>}</section>)}
        <div className="palette-hint"><strong>端口说明</strong><p><i className="port-legend input"/>左侧为输入</p><p><i className="port-legend"/>右侧为输出</p><p>Add / Concat 有两个输入。一个输出可连接多个模块。</p></div>
      </aside>
      <div className="editor-center">
        <div className="canvas-toolbar"><div className="scope-tabs" aria-label="编辑层级"><button aria-pressed={scope === 'top'} onClick={() => changeScope('top')}>{title}</button><button aria-pressed={scope === 'reslayer'} onClick={() => changeScope('reslayer')}>ResLayer [{moduleNumber}]</button></div>
          <div className="canvas-tools"><button title="撤销 (Ctrl+Z)" aria-label="撤销" disabled={!history.current.undo.length} onClick={() => travel('undo')}><Undo2 size={17}/></button><button title="重做" aria-label="重做" disabled={!history.current.redo.length} onClick={() => travel('redo')}><Redo2 size={17}/></button><button title="缩小" aria-label="缩小" disabled={zoom <= 0.4} onClick={() => setZoom(z => Math.max(0.4, +(z - 0.1).toFixed(2)))}><Minus size={17}/></button><span>{Math.round(zoom * 100)}%</span><button title="放大" aria-label="放大" disabled={zoom >= 1.5} onClick={() => setZoom(z => Math.min(1.5, +(z + 0.1).toFixed(2)))}><Plus size={17}/></button><button title="恢复当前画布起始结构（可撤销）" aria-label="恢复起始结构" onClick={() => { updateGraph(initialWorkspace(exercise)[scope]); setSelection(null); clearWire(); setStatus('已恢复当前画布起始结构，可撤销。'); }}><RotateCcw size={17}/></button></div>
        </div>
        <div ref={viewport} className="canvas-viewport" tabIndex={0} aria-label="网络画布，滚动浏览；选择模块后可用方向键移动" onPointerMove={moveWire} onPointerDown={e => { if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-plane')) { setSelection(null); clearWire(); } }}>
          <div style={{ width: CANVAS_W * zoom, height: CANVAS_H * zoom }}><div className="canvas-plane" style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${zoom})` }}>
            <svg className="connection-layer" width={CANVAS_W} height={CANVAS_H} aria-label="模块之间的连线"><defs><marker id="network-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#2563eb"/></marker></defs>
              {graph.edges.map(e => { const from = displayNodes.find(n => n.id === e.from)!, to = displayNodes.find(n => n.id === e.to)!; const d = curve(from.x + WIDTH, from.y + HEIGHT / 2, to.x, to.y + portY(to.kind, e.port)); return <g key={e.id} className={selection?.id === e.id ? 'connection selected' : 'connection'}><path d={d} markerEnd="url(#network-arrow)"/><path d={d} className="connection-hit" role="button" tabIndex={0} aria-label={`连线 ${from.kind} ${from.number} 到 ${to.kind} ${to.number} 输入 ${e.port + 1}`} onClick={() => { setSelection({ kind: 'edge', id: e.id }); clearWire(); }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelection({ kind: 'edge', id: e.id }); } }}/></g>; })}
              {wire && wireSource && <path className="wire-preview" d={curve(wireSource.x + WIDTH, wireSource.y + HEIGHT / 2, wire.x, wire.y)}/>}
            </svg>
            {displayNodes.map(n => <div key={n.id} className={`network-block ${selection?.id === n.id ? 'selected' : ''} ${n.kind === 'ResLayer' ? 'module-block' : ''} ${n.kind === 'Input' || n.kind === 'Output' ? 'terminal-block' : ''}`} style={{ left: n.x, top: n.y, width: WIDTH, height: HEIGHT }}>
              <button className="block-handle" aria-label={`${n.kind} 模块 ${n.number}`} onPointerDown={e => startDrag(e, n.kind, n)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={() => { dragRef.current = null; setDrag(null); }} onClick={() => setSelection({ kind: 'node', id: n.id })} onKeyDown={e => {
                const delta: Record<string, number[]> = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
                if (delta[e.key]) { e.preventDefault(); const [dx, dy] = delta[e.key]; updateGraph({ ...graph, nodes: graph.nodes.map(b => b.id === n.id ? { ...b, ...position(b.x + dx, b.y + dy) } : b) }); }
              }}><span><Box size={17}/>{n.kind}</span><small>[{n.number}]</small></button>
              {Array.from({ length: inputCount(n.kind) }, (_, port) => <button key={port} className="node-port input-port" style={{ top: portY(n.kind, port) - 9 }} data-input-node={n.id} data-input-port={port} aria-label={`${n.kind} ${n.number} 输入 ${port + 1}`} title={`输入 ${port + 1}`} onClick={() => { if (wireRef.current) connect(wireRef.current.from, n.id, port); else setStatus('请先选择源模块右侧的输出端口。'); }}>{inputCount(n.kind) === 2 ? port + 1 : ''}</button>)}
              {n.kind !== 'Output' && <button className="node-port output-port" aria-label={`${n.kind} ${n.number} 输出`} title="输出：拖到输入端口或单击后选择输入" onPointerDown={e => beginWire(e, n)} onPointerMove={moveWire} onPointerUp={endWire} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const next = { from: n.id, x: n.x + WIDTH, y: n.y + HEIGHT / 2 }; wireRef.current = next; setWire(next); setStatus('请选择目标输入端口。'); } }}/ >}
            </div>)}
          </div></div>
        </div>
        <div className="canvas-bottom"><span>{graph.nodes.length} 个模块 · {graph.edges.length} 条连线</span><span>{dirty ? '有未保存的修改' : '本机草稿'}</span><button className="secondary-button" onClick={() => setStatus(checkGraph(graph))}><Check size={16}/>检查连线</button><button className="secondary-button" onClick={save} disabled={!ready}><Save size={16}/>保存</button><SubmissionScore workspace={workspace} exercise={exercise} disabled={!ready}/></div>
      </div>
      <aside className="parameter-panel"><h3>{node ? `${node.kind}[${node.number}] 参数设置` : '参数列表'}</h3>{node ? <><label className="platform-param"><span>index:</span><input aria-label="index" value={node.number} maxLength={20} onChange={e => updateNode({ number: e.target.value.replace(/\D/g, '') })}/></label>
        {parameterKeys(node.kind).map(key => <label className="platform-param" key={key}><span title={labels[key] || key}>{key}:</span>{key === 'mode' || key === 'bias' || key === 'inplace' ? <select aria-label={key} value={node.params[key] ?? defaults[node.kind][key]} onChange={e => updateNode({ params: { ...node.params, [key]: e.target.value } })}>{(key === 'mode' ? ['nearest', 'bilinear', 'bicubic'] : ['false', 'true']).map(v => <option key={v}>{v}</option>)}</select> : <input aria-label={key} value={node.params[key] ?? (key === 'dilation' ? defaults.Conv2d.dilation : '')} maxLength={100} onChange={e => updateNode({ params: { ...node.params, [key]: e.target.value } })}/>}</label>)}
        {scope === 'top' && node.kind === 'ResLayer' && node.number === moduleNumber && <button className="secondary-button" onClick={() => changeScope('reslayer')}>编辑内部结构<ArrowRight size={15}/></button>}
        <p className="parameter-note">参数仅用于本地结构设计，请按题目模块表设置。</p><button className="delete-button" onClick={removeSelected}><Trash2 size={16}/>删除模块</button></> : edge ? <><div className="selected-node-name">已选择连线</div><p>{graph.nodes.find(n => n.id === edge.from)?.kind} → {graph.nodes.find(n => n.id === edge.to)?.kind} · 输入 {edge.port + 1}</p><button className="delete-button" onClick={removeSelected}><Trash2 size={16}/>删除连线</button></> : <div className="parameter-empty"><Box size={32}/><p>选择画布中的模块<br/>编辑序号和参数</p><p>选择连线可删除连接。</p></div>}
        {scope === 'reslayer' && <button className="scope-back" onClick={() => changeScope('top')}><ArrowLeft size={15}/>返回顶层结构</button>}
      </aside>
    </div>
    <div className="editor-status" role="status">{status}</div>
    <p className="editor-note">提交评分会检查两个画布，提供本地参考分数和改进提示，不运行神经网络或提供官方成绩。保存仅保留在当前浏览器。</p>
    {drag && !drag.id && <div className="palette-ghost" style={{ left: drag.clientX + 12, top: drag.clientY + 12 }}><Box size={18}/>{drag.kind}</div>}
  </section>;
}





