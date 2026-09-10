'use client';
import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Eye } from 'lucide-react';
import { parameterKeys, type Exercise, type Kind } from './graph';
import { expectedParameters } from './grading';
import { referenceGraphs, referenceSteps, resnetReferenceGraphs, resnetReferenceSteps } from './reference-data';

export default function ReferenceAnswer({ exercise = 'hourglass' }: { exercise?: Exercise }) {
  const title = exercise === 'resnet' ? 'ResNet' : 'HourglassNet';
  const moduleNumber = exercise === 'resnet' ? '1006' : '1004';
  const [scope, setScope] = useState<'top' | 'reslayer'>('top');
  const [zoom, setZoom] = useState(0.65);
  const [selected, setSelected] = useState<string | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const graph = (exercise === 'resnet' ? resnetReferenceGraphs : referenceGraphs)[scope];
  const steps = (exercise === 'resnet' ? resnetReferenceSteps : referenceSteps)[scope];
  const count = step ?? steps.length;
  const current = step ? steps[step - 1] : undefined;
  const visible = new Set(steps.slice(0, count).map(s => s.node.id));
  const visibleNodes = graph.nodes.filter(n => visible.has(n.id));
  const visibleEdges = graph.edges.filter(e => visible.has(e.from) && visible.has(e.to));
  const highlighted = selected ?? current?.node.id;
  const parameterNode = highlighted;
  const parameterKind = parameterNode?.split('[')[0] as Kind | undefined;
  const parameterValues = parameterNode ? expectedParameters(exercise, scope)[parameterNode] ?? {} : {};
  function selectNode(id: string) { setPlaying(false); setSelected(id); }
  useEffect(() => {
    if (!playing || step === null || step >= steps.length) return;
    const timer = window.setTimeout(() => {
      setStep(step + 1);
      if (step + 1 >= steps.length) setPlaying(false);
    }, 1600 / speed);
    return () => window.clearTimeout(timer);
  }, [playing, step, speed, steps.length]);
  useEffect(() => {
    if (!current || !viewport.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    viewport.current.scrollTo({ left: Math.max(0, (current.node.x + 78) * zoom - viewport.current.clientWidth / 2), top: Math.max(0, (current.node.y + 43) * zoom - viewport.current.clientHeight / 2), behavior: reduced ? 'instant' : 'smooth' });
  }, [current, zoom]);
  function seek(next: number) { setPlaying(false); setSelected(null); setStep(Math.max(0, Math.min(steps.length, next))); }
  function play() {
    setSelected(null);
    if (step === null || step >= steps.length) setStep(1);
    setPlaying(true);
  }
  const edges = selected ? visibleEdges.filter(e => e.from === selected || e.to === selected) : visibleEdges;
  const marker = `ref-arrow-${scope}`;
  function changeScope(next: 'top' | 'reslayer') { setScope(next); setSelected(null); setPlaying(false); setStep(null); viewport.current?.scrollTo(0, 0); }
  return <section className="reference-answer" aria-label="参考答案内容">
    <div className="reference-panel">
      <div className="reference-toolbar"><div className="scope-tabs" aria-label="参考答案层级"><button aria-pressed={scope === 'top'} onClick={() => changeScope('top')}>{title} 顶层</button><button aria-pressed={scope === 'reslayer'} onClick={() => changeScope('reslayer')}>ResLayer {moduleNumber} 内部</button></div><div className="reference-zoom"><button onClick={() => setZoom(z => Math.max(0.15, z - 0.15))} aria-label="缩小参考图">−</button><span>{Math.round(zoom * 100)}%</span><button onClick={() => setZoom(z => Math.min(1.5, z + 0.15))} aria-label="放大参考图">+</button><button onClick={() => { if (viewport.current) { setZoom(Math.min(1, (viewport.current.clientWidth - 20) / graph.width)); viewport.current.scrollTo(0, 0); } }}>全图</button><button onClick={() => setZoom(1)}>原大小</button></div></div>
      <div className="build-player" aria-label="参考答案搭建动画">
        <div className="build-player-controls">
          <button className="primary-button" onClick={() => playing ? setPlaying(false) : play()}>{playing ? <Pause size={17}/> : <Play size={17}/>} {playing ? '暂停' : step !== null && step < steps.length ? '继续播放' : '播放搭建顺序'}</button>
          <button className="secondary-button" onClick={() => seek(step === null ? 0 : count - 1)} disabled={step === 0}><SkipBack size={16}/>上一步</button>
          <button className="secondary-button" onClick={() => seek(step === null ? 1 : count + 1)} disabled={step === steps.length}><SkipForward size={16}/>下一步</button>
          <button className="secondary-button" onClick={() => { setSelected(null); setStep(1); setPlaying(true); }}><RotateCcw size={16}/>重新播放</button>
          <button className="secondary-button" onClick={() => { setPlaying(false); setStep(null); setSelected(null); viewport.current?.scrollTo(0, 0); }}><Eye size={16}/>完整答案</button>
          <label className="build-speed">速度<select aria-label="演示速度" value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select></label>
        </div>
        <div className="build-progress"><input aria-label="搭建步骤" type="range" min={0} max={steps.length} value={count} onChange={e => seek(Number(e.target.value))}/><span>{step === null ? '完整结构' : `第 ${count} 步`} / {steps.length} 步</span></div>
        <div className="build-step-caption" role="status"><strong>{current ? `${count === steps.length ? '搭建完成 · ' : ''}添加 ${current.node.id}` : step === 0 ? '准备搭建' : '按连接依赖逐步演示'}</strong><p>{current ? current.incoming.length ? current.incoming.map(e => `${e.from}:out0 → ${e.to}:in${e.port}`).join('；') : '放置输入模块，作为网络起点。' : '每一步显示一个模块及其输入连线；Add 等待两条分支就绪后出现。演示顺序按参考结构整理。'}</p></div>
      </div>
      <p className="reference-provenance">{exercise === 'resnet' ? '按题面整理的参考结构：依据 ResNet 网络模块表与残差说明推导，未核验平台参考答案。内部 Input / Output 及 Add[A/B] 为本地示意标记。' : scope === 'top' ? '平台参考结构：从 Edge 已展示的参考图转录，保留全部 30 个模块及 33 条连线。' : '按题面整理的内部参考：根据网络模块表及“相加后激活”要求推导，未核验平台内部参考图。'}</p>
      <p className="reference-help">点击模块查看对应参数和连线；播放时参数跟随步骤显示，点击模块会暂停播放。“全图”可查看整体结构。</p>
      <div className="reference-inspector-layout">
      <div className="reference-viewport" ref={viewport} tabIndex={0} role="region" aria-label="参考网络图，可横向滚动">
        <svg width={graph.width * zoom} height={graph.height * zoom} viewBox={`0 0 ${graph.width} ${graph.height}`} aria-label={scope === 'top' ? title + ' 顶层参考结构' : 'ResLayer ' + moduleNumber + ' 内部参考结构'}>
          <defs><marker id={marker} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#2563eb"/></marker></defs>
          {visibleEdges.map(e => {
            const from = graph.nodes.find(n => n.id === e.from)!, to = graph.nodes.find(n => n.id === e.to)!;
            const x = from.x + 156, y = from.y + 43, tx = to.x, ty = to.y + (to.id.startsWith('Add') ? 28 + e.port * 32 : 43), bend = Math.max(35, (tx - x) / 2);
            return <path className={current?.node.id === e.to ? 'reference-edge-enter' : undefined} pathLength={1} key={`${e.from}-${e.to}-${e.port}`} d={`M${x},${y} C${x + bend},${y} ${tx - bend},${ty} ${tx},${ty}`} fill="none" stroke={highlighted && (e.from === highlighted || e.to === highlighted) ? '#d97706' : '#2563eb'} strokeWidth={highlighted && (e.from === highlighted || e.to === highlighted) ? 4 : 2.5} opacity={!selected || e.from === selected || e.to === selected ? 1 : 0.2} markerEnd={`url(#${marker})`}/>;
          })}
          {visibleNodes.map(n => <g key={n.id} transform={`translate(${n.x},${n.y})`} className={`reference-node ${current?.node.id === n.id ? 'reference-node-enter' : ''}`} role="button" tabIndex={0} aria-label={`查看 ${n.id} 的参数设置和参考连线`} aria-pressed={selected === n.id} onClick={() => selectNode(n.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectNode(n.id); } }}>
            <rect width="156" height="86" rx="9" fill={n.id.startsWith('ResLayer') ? '#fffbeb' : n.id.startsWith('Input') || n.id.startsWith('Output') ? '#eafbf7' : '#fff'} stroke={highlighted === n.id ? '#d97706' : '#8cb6f9'} strokeWidth={highlighted === n.id ? 3 : 1.5}/>
            <text x="78" y="35" textAnchor="middle" fill="#28476b" fontSize="17" fontWeight="600">{n.id.split('[')[0]}</text><text x="78" y="61" textAnchor="middle" fill="#63718a" fontSize="15">{n.id.includes('[') ? `[${n.id.split('[')[1]}` : '两支路相加'}</text>
            {!n.id.startsWith('Input') && <circle cx="0" cy={n.id.startsWith('Add') ? 28 : 43} r="5" fill="white" stroke="#2563eb"/>}
            {n.id.startsWith('Add') && <><circle cx="0" cy="60" r="5" fill="white" stroke="#2563eb"/><text x="9" y="32" fontSize="11" fill="#63718a">0</text><text x="9" y="64" fontSize="11" fill="#63718a">1</text></>}
            {!n.id.startsWith('Output') && <circle cx="156" cy="43" r="5" fill="#2563eb"/>}
          </g>)}
        </svg>
      </div>
      <aside className="reference-parameters" aria-label="参考参数设置" aria-live="polite">
        <h3>{parameterNode ? `${parameterNode} 参数设置` : '参数设置'}</h3>
        {parameterNode && parameterKind ? <>
          <label><span>index:</span><input readOnly value={parameterNode.match(/\[(.*)\]/)?.[1] ?? '未指定'} /></label>
          {parameterKeys(parameterKind).map(key => <label key={key}><span>{key}:</span><input readOnly value={parameterValues[key] === undefined ? '尚未整理' : String(parameterValues[key])}/></label>)}
          {parameterKeys(parameterKind).length > 0 ? <p>只读参考。通道数、卷积核来自题面；stride、padding、dilation 和上采样倍数为按尺寸整理的本地参考值，与提交评分使用同一份参数。</p> : <p>此模块仅显示 index，没有其他参数项。</p>}
          {parameterKind === 'Add' && <p>Add 的内部标记用于示意连接关系，不要求填写 A / B。</p>}
          {parameterKind === 'ResLayer' && scope === 'top' && parameterNode === `ResLayer[${moduleNumber}]` && <button className="secondary-button" onClick={() => changeScope('reslayer')}>查看内部模块参数</button>}
        </> : <p>点击左侧网络中的模块，查看其 index 与对应参数。</p>}
      </aside>
      </div>
      {exercise === 'resnet' ? <div className="reference-explanation"><h3>ResNet 搭建要点</h3><p>顶层按 Conv2d → BatchNorm2d → ReLU → MaxPool2d → ResLayer 1005、1006、1007、1008 顺序连接。</p><p>ResLayer 1006 包含两个 BasicBlock。第一个块的主路使用 Conv2d 3013、3016，捷径使用 Conv2d 4001；两路相加后接 ReLU 3019。第二个块使用 Conv2d 3020、3023，捷径直接连接 ReLU 3019 的输出，再相加并接 ReLU 3025。</p><p>原表首行输出为 [1,64,160,160]，但末级 ResLayer 1008 输出为 [1,512,20,20]；此处按末级尺寸组织完整网络，原文保留在题目弹窗中。</p></div> : scope === 'top' ? <div className="reference-explanation"><h3>关键连接</h3><p>ResLayer[1004] 的输出分为两路，分别连接 ResLayer[2002] 和 ResLayer[2003]；各级深层分支经过 Upsample 后，与对应的浅层分支通过 Add 相加。</p><p>合并顺序：Add[0] → ResLayer[4035]；Add[1] → ResLayer[3015]；Add[2] → ResLayer[2005]；Add[3] → Conv2d[1006]。参考图展开了 HourglassModule，不能用一个 ResLayer[1005] 代替。</p></div> : <div className="reference-explanation"><h3>残差分支与参数对照</h3><p>主分支：Conv2d[3001] → BatchNorm2d[3002] → ReLU[3003] → Conv2d[3004] → BatchNorm2d[3005]。捷径分支：Conv2d[4001] → BatchNorm2d[4002]。两支路相加后，通过 ReLU[3007] 输出。</p><p>题面给出的卷积核：3001 为 3×3，3004 为 3×3，4001 为 1×1。3001 和 4001 均将 [1,128,320,320] 变为 [1,256,160,160]；3004 保持 [1,256,160,160]。Add 在此作为合并算子示意，不指定平台序号。</p></div>}
      <details className="reference-connections" open={!!selected} key={selected ?? scope}><summary>{selected ? `${selected} 的相关连线` : step === null ? '查看完整连线清单' : '查看已搭建连线'} · {edges.length} 条</summary><ol>{edges.map(e => <li key={`${e.from}-${e.to}-${e.port}`}><code>{e.from}:out0 → {e.to}:in{e.port}</code></li>)}</ol>{selected && <button className="secondary-button" onClick={() => setSelected(null)}>显示全部连线</button>}</details>
      <p className="reference-footnote">参考图只读，练习草稿保持原样。源平台端口从 0 编号：in0 / in1 对应本地画布的输入 1 / 输入 2。</p>
    </div>
  </section>;
}



