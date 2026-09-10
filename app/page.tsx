'use client';
import { useState } from 'react';
import { ArrowRight, ArrowLeft, ScanLine, BookOpen, Check, RotateCcw } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import bank from './questions.json';
import { isCorrect } from './scoring';
export default function Home() {
 const [type,setType]=useState('全部题型');
 const [index,setIndex]=useState(0);
 const [selected,setSelected]=useState<Record<string,string[]>>({});
 const [submitted,setSubmitted]=useState<Record<string,string[]>>({});
 const [review,setReview]=useState<string[]|null>(null);
 const questions=bank.filter(q=>(type==='全部题型'||q.type===type)&&(!review||review.includes(q.id)));
 const q=questions[Math.min(index,questions.length-1)];
 const attempted=bank.filter(q=>submitted[q.id]);
 const wrong=attempted.filter(q=>!isCorrect(submitted[q.id],q.answer));
 const correct=attempted.length-wrong.length;
 const done=q?submitted[q.id]:undefined;
 const choice=q?selected[q.id]||[]:[];
 function choose(values:string[]){if(q&&!done)setSelected({...selected,[q.id]:values});}
 return <div className="site-shell">
 <header className="topbar"><a href="/" className="brand"><span className="brand-mark"><ScanLine size={23}/></span>目标智能<span className="brand-divider"/>理论练习</a><span className="edition">第三届应用实践赛 · 初赛</span></header>
 <main className="workspace"><nav className="practice-nav" aria-label="练习分类"><a href="/" aria-current="page">理论练习</a><a href="/practical">实操题 · HourglassNet</a><a href="/practical/resnet">实操题 · ResNet</a></nav><div className="page-heading"><div><div className="eyebrow">THEORY PRACTICE</div><h1>把每一道题，学扎实。</h1><p>第三届目标智能检测技术应用实践赛 · 初赛理论公开题库</p></div><div className="bank-count"><strong>{bank.length}</strong><span>道公开试题</span></div></div>
 <div className="practice-layout"><section className="practice-main">
 <div className="type-bar" aria-label="选择练习题型">{['全部题型','单选题','多选题','判断题'].map(t=><button key={t} aria-pressed={type===t} className={type===t?'active':''} onClick={()=>{setType(t);setIndex(0);setReview(null);}}>{t}<span>{t==='全部题型'?bank.length:bank.filter(q=>q.type===t).length}</span></button>)}</div>
 {review&&<div className="review-banner">错题回顾 · {questions.length} 道<button onClick={()=>{setReview(null);setIndex(0);}}>返回全部题目</button></div>}
 {q?<article className="question-card" key={q.id}><div className="question-meta"><div><span className="type-tag">{q.type}</span><span>{q.category}</span><span className="difficulty">{q.difficulty}</span></div><span className="question-index">{String(index+1).padStart(2,'0')} <span>/ {questions.length}</span></span></div>
 <h2>{q.text}</h2><p className="instruction">{q.type==='多选题'?'请选择所有正确选项，多选、少选均不得分。':q.type==='判断题'?'请选择正确或错误。':'请选择一个正确答案。'}</p>
 {q.type==='多选题'?<div className="options">{q.options.map(o=><label key={o.key} className={`option ${choice.includes(o.key)?'chosen':''} ${done&&q.answer.includes(o.key)?'right-option':''}`}><Checkbox disabled={!!done} checked={choice.includes(o.key)} onCheckedChange={checked=>choose(checked?[...choice,o.key]:choice.filter(v=>v!==o.key))}/><span className="option-letter">{o.key}</span><span>{o.text}</span>{done&&q.answer.includes(o.key)&&<Check size={18}/>}</label>)}</div>:<RadioGroup className="options" value={choice[0]||''} disabled={!!done} onValueChange={value=>choose([String(value)])} aria-label="答案选项">{q.options.map(o=><label key={o.key} className={`option ${choice.includes(o.key)?'chosen':''} ${done&&q.answer.includes(o.key)?'right-option':''}`}><RadioGroupItem value={o.key}/>{q.type!=='判断题'&&<span className="option-letter">{o.key}</span>}<span>{o.text}</span>{done&&q.answer.includes(o.key)&&<Check size={18}/>}</label>)}</RadioGroup>}
 {done&&<div className={`answer-panel ${isCorrect(done,q.answer)?'success':'incorrect'}`} role="status"><strong>{isCorrect(done,q.answer)?'回答正确':'回答错误'}</strong><p>正确答案：{q.answer.join('、')}<span className="your-answer">你的答案：{done.join('、')}</span></p><div className="explanation-title">题库解析</div><p>{q.explanation||'原题库未提供解析。'}</p></div>}
 <div className="question-actions"><button className="secondary-button" disabled={index===0} onClick={()=>setIndex(index-1)}><ArrowLeft size={16}/>上一题</button>{!done?<button className="primary-button" disabled={!choice.length} onClick={()=>setSubmitted({...submitted,[q.id]:[...choice]})}>提交答案<ArrowRight size={17}/></button>:<button className="primary-button" disabled={index===questions.length-1} onClick={()=>setIndex(index+1)}>下一题<ArrowRight size={17}/></button>}</div>
 <div className="source-note">来源：{q.type} · Excel 第 {q.sourceRow} 行{done&&index===questions.length-1?' · 已到最后一题，可通过答题卡回顾或完成未答题目。':''}</div></article>:<article className="question-card empty"><Check size={32}/><h2>暂时没有错题</h2><p>完成练习后，答错的题目会出现在这里。</p></article>}
 <div className="practice-note"><BookOpen size={17}/><span>答案与解析来自原始题库。练习记录仅保留在当前页面，刷新后重新开始。</span></div></section>
 <aside className="study-sidebar"><section className="progress-card"><div className="panel-heading"><h2>本次练习</h2><span className="live-dot"/></div><div className="progress-number">{attempted.length}<span>/ {bank.length}</span></div><div className="progress-track" role="progressbar" aria-label="总答题进度" aria-valuenow={attempted.length} aria-valuemin={0} aria-valuemax={bank.length}><div style={{width:`${attempted.length/bank.length*100}%`}}/></div><div className="stats"><div><strong className="green">{correct}</strong><span>答对</span></div><div><strong className="red">{wrong.length}</strong><span>答错</span></div><div><strong>{attempted.length?Math.round(correct/attempted.length*100):0}<small>%</small></strong><span>正确率</span></div></div><button className="review-button" onClick={()=>{setReview(wrong.map(q=>q.id));setType('全部题型');setIndex(0);}}><RotateCcw size={16}/>回顾错题<span>{wrong.length}<ArrowRight size={15}/></span></button></section>
 <section className="answer-map"><div className="panel-heading"><h2>答题卡</h2><span>{questions.length} 题</span></div><div className="map-legend"><span><i/>未答</span><span><i className="correct-dot"/>答对</span><span><i className="wrong-dot"/>答错</span></div><div className="number-grid">{questions.map((item,i)=><button key={item.id} aria-label={`第 ${i+1} 题，${submitted[item.id]?(isCorrect(submitted[item.id],item.answer)?'答对':'答错'):'未答'}`} aria-current={index===i?'step':undefined} className={`${index===i?'current':''} ${submitted[item.id]?(isCorrect(submitted[item.id],item.answer)?'correct':'wrong'):''}`} onClick={()=>setIndex(i)}>{i+1}</button>)}</div></section></aside></div>
 <footer>目标智能检测技术应用实践赛<span>循序练习 · 理解原理</span></footer></main></div>;
}

