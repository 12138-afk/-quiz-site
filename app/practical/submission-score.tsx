'use client';
import { useState } from 'react';
import { Award, X } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import type { Exercise, Workspace } from './graph';
import { referenceGraphs, resnetReferenceGraphs } from './reference-data';
import { gradeWorkspace } from './grading';

export default function SubmissionScore({ workspace, exercise, disabled }: { workspace: Workspace; exercise: Exercise; disabled: boolean }) {
  const [submission, setSubmission] = useState<{ result: ReturnType<typeof gradeWorkspace>; snapshot: string } | null>(null);
  function submit() {
    setSubmission({ result: gradeWorkspace(workspace, exercise === 'resnet' ? resnetReferenceGraphs : referenceGraphs, exercise), snapshot: JSON.stringify(workspace) });
  }
  return <Dialog>
    <DialogTrigger className="primary-button" disabled={disabled} onClick={submit}><Award size={16}/>提交评分</DialogTrigger>
    <DialogContent className="exercise-modal score-modal" showCloseButton={false}>
      <div className="exercise-modal-header"><div><span className="modal-eyebrow">{exercise === 'resnet' ? 'RESNET' : 'HOURGLASSNET'} / RESULT</span><DialogTitle>提交评分结果</DialogTitle><DialogDescription>同时检查整体网络与 ResLayer 内部，两个画布各占总分的 50%。</DialogDescription></div><DialogClose className="modal-close" aria-label="关闭评分"><X size={21}/></DialogClose></div>
      <div className="exercise-modal-body">
        {submission && <>
          <div className="score-hero"><Award size={36}/><div><strong>{submission.result.score.toFixed(1)}<small> / 100</small></strong><p>本地参考评分 · {submission.result.score === 100 ? '已符合当前参考规则' : '可根据下方反馈继续完善'}</p></div></div>
          {submission.snapshot !== JSON.stringify(workspace) && <p role="status">草稿已修改，此处显示上次提交的结果。</p>}
          <p className="score-rules">每个画布：模块 40 分、连线 40 分、关键参数 20 分；缺失、重复及多余内容会影响得分。普通模块按类型和 index 匹配，Input / Output 忽略编号，Add 按下游连接识别且允许交换输入。</p>
          <div className="score-sections">{(['top', 'reslayer'] as const).map(scope => {
            const result = submission.result[scope];
            return <section className="score-section" key={scope}><h3>{scope === 'top' ? '整体网络' : 'ResLayer 内部'}<span>{result.score.toFixed(1)} 分</span></h3>
              <div className="score-breakdown">{([['模块', result.modules, 40], ['连线', result.connections, 40], ['参数', result.params, 20]] as const).map(([label, value, max]) => <div key={label}><span>{label}<b>{value.toFixed(1)} / {max}</b></span><progress aria-label={`${label}得分`} value={value} max={max}/></div>)}</div>
              {result.issues.length ? <details><summary>查看 {result.issues.length} 项改进提示</summary><ul>{result.issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul></details> : <p className="score-success">模块、连线和已检查参数均符合参考。</p>}
            </section>;
          })}</div>
          <p className="score-rules">评分在本机完成，不运行模型，不代表源平台官方成绩。{exercise === 'resnet' ? 'ResNet 结构依据题面整理，尚未核验源平台答案。' : '整体连线依据已查看的平台参考图；内部结构依据题面整理。'}参数按本地参考模板检查，未检查张量形状、ResLayer 参数及隐藏字段。</p>
          <button className="primary-button" onClick={submit}>重新提交评分</button>
        </>}
      </div>
    </DialogContent>
  </Dialog>;
}
