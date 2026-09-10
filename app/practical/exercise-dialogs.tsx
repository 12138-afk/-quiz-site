'use client';
import type { ReactNode } from 'react';
import type { Exercise } from './graph';
import { BookOpen, GitBranch, X } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import ReferenceAnswer from './reference-answer';

export default function ExerciseDialogs({ question, exercise = 'hourglass' }: { question: ReactNode; exercise?: Exercise }) {
  return <div className="exercise-dialog-actions">
    <Dialog>
      <DialogTrigger className="secondary-button"><BookOpen size={17}/>题目要求</DialogTrigger>
      <DialogContent className="exercise-modal question-modal" showCloseButton={false}>
        <div className="exercise-modal-header"><div><span className="modal-eyebrow">{exercise === 'resnet' ? 'RESNET' : 'HOURGLASSNET'} / EXERCISE</span><DialogTitle>题目要求</DialogTitle><DialogDescription>搭建要求、模块说明与网络尺寸对照</DialogDescription></div><DialogClose className="modal-close" aria-label="关闭题目"><X size={21}/></DialogClose></div>
        <div className="exercise-modal-body">{question}</div>
      </DialogContent>
    </Dialog>
    <Dialog>
      <DialogTrigger className="primary-button"><GitBranch size={17}/>参考答案</DialogTrigger>
      <DialogContent className="exercise-modal reference-modal" showCloseButton={false}>
        <div className="exercise-modal-header"><div><span className="modal-eyebrow">{exercise === 'resnet' ? 'RESNET' : 'HOURGLASSNET'} / REFERENCE</span><DialogTitle>参考答案</DialogTitle><DialogDescription>查看结构与连线，当前练习草稿保持不变</DialogDescription></div><DialogClose className="modal-close" aria-label="关闭参考答案"><X size={21}/></DialogClose></div>
        <div className="exercise-modal-body"><ReferenceAnswer exercise={exercise}/></div>
      </DialogContent>
    </Dialog>
  </div>;
}

