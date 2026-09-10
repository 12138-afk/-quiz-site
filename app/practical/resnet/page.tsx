import type { Metadata } from 'next';
import { ScanLine, ArrowUpRight } from 'lucide-react';
import NetworkEditor from '../network-editor';
export const metadata: Metadata = {title:'ResNet · 实操题 · 目标智能',description:'ResNet 顶层网络与 ResLayer 1006 模块搭建练习。'};
const sourceUrl='https://ai.fmaster.cn/sw/ai/#/modelTask/NN?type=0&isEdit=false&isPublicTab=false&taskTag=&curTaskTag=mmdet&name=ResNet&modelId=795&modelPath=ResNet';
const networkTable=`===================================================================================================================
Layer (type:idx)                         Kernel Shape              Input Shape               Output Shape
===================================================================================================================
ResNet                                   --                        [1, 3, 640, 640]          [1, 64, 160, 160]
├─Conv2d: 1001                           [7, 7]                    [1, 3, 640, 640]          [1, 64, 320, 320]
├─BatchNorm2d: 1002                      --                        [1, 64, 320, 320]         [1, 64, 320, 320]
├─ReLU: 1003                             --                        [1, 64, 320, 320]         [1, 64, 320, 320]
├─MaxPool2d: 1004                        3                         [1, 64, 320, 320]         [1, 64, 160, 160]
├─ResLayer: 1005                         --                        [1, 64, 160, 160]         [1, 64, 160, 160]
|   ···
├─ResLayer: 1006                         --                        [1, 64, 160, 160]         [1, 128, 80, 80]
│    └─BasicBlock: 2003                  --                        [1, 64, 160, 160]         [1, 128, 80, 80]
│    │    └─Conv2d: 3013                 [3, 3]                    [1, 64, 160, 160]         [1, 128, 80, 80]
│    │    └─BatchNorm2d: 3014            --                        [1, 128, 80, 80]          [1, 128, 80, 80]
│    │    └─ReLU: 3015                   --                        [1, 128, 80, 80]          [1, 128, 80, 80]
│    │    └─Conv2d: 3016                 [3, 3]                    [1, 128, 80, 80]          [1, 128, 80, 80]
│    │    └─BatchNorm2d: 3017            --                        [1, 128, 80, 80]          [1, 128, 80, 80]
│    │    └─Sequential: 3018             --                        [1, 64, 160, 160]         [1, 128, 80, 80]
│    │    │    └─Conv2d: 4001            [1, 1]                    [1, 64, 160, 160]         [1, 128, 80, 80]
│    │    │    └─BatchNorm2d: 4002       --                        [1, 128, 80, 80]          [1, 128, 80, 80]
│    │    └─ReLU: 3019                   --                        [1, 128, 80, 80]          [1, 128, 80, 80]
│    └─BasicBlock: 2004                  --                        [1, 128, 80, 80]          [1, 128, 80, 80]
│    │    └─Conv2d: 3020                 [3, 3]                    [1, 128, 80, 80]          [1, 128, 80, 80]
│    │    └─BatchNorm2d: 3021            --                        [1, 128, 80, 80]          [1, 128, 80, 80]
│    │    └─ReLU: 3022                   --                        [1, 128, 80, 80]          [1, 128, 80, 80]
│    │    └─Conv2d: 3023                 [3, 3]                    [1, 128, 80, 80]          [1, 128, 80, 80]
│    │    └─BatchNorm2d: 3024            --                        [1, 128, 80, 80]          [1, 128, 80, 80]
│    │    └─ReLU: 3025                   --                        [1, 128, 80, 80]          [1, 128, 80, 80]
├─ResLayer: 1007                         --                        [1, 128, 80, 80]          [1, 256, 40, 40]
|   ···
├─ResLayer: 1008                         --                        [1, 256, 40, 40]          [1, 512, 20, 20]
|   ···
===================================================================================================================`;
export default function ResNetPage(){return <div className="site-shell">
  <header className="topbar"><a href="/" className="brand"><span className="brand-mark"><ScanLine size={23}/></span>目标智能<span className="brand-divider"/>实操题</a><span className="edition">目标智能检测技术应用实践赛 · 区域赛</span></header>
  <main className="workspace practical-workspace"><nav className="practice-nav" aria-label="练习分类"><a href="/">理论练习</a><a href="/practical">实操题 · HourglassNet</a><a href="/practical/resnet" aria-current="page">实操题 · ResNet</a></nav>
    <div className="page-heading"><div><div className="eyebrow">PRACTICAL EXERCISE</div><h1>ResNet</h1><p>顶层网络 · ResLayer 1006 内部搭建</p></div><span className="type-tag">实操题 · 02</span></div>
    <NetworkEditor key="resnet" exercise="resnet" question={<div className="practical-layout"><article className="question-card practical-content">
      <p className="practical-intro">ResNet 的提出很好地解决了梯度消失的问题，使得网络的层数可以加深。其核心创新点在于残差结构的提出，即输入信号与通过卷积块后的输出信号相加，从而使得训练过程中梯度可以更好地反向传播。</p>
      <section id="modules"><h2>模块说明</h2><h3>ResLayer</h3><p>ResNet 的顶层模块，内部包含若干个残差结构 BasicBlock。</p><h3>BasicBlock</h3><p>ResNet 实现残差结构的基本单位，由两组卷积模块组成，模块的输入将与两组卷积的输出相加实现残差。部分模块会在实现残差的过程中会额外使用卷积实现分辨率的变化。</p></section>
      <section id="requirements"><h2>题目要求</h2><h3>顶层搭建</h3><ol><li>根据网络信息表，补充 ResNet 的顶层网络结构。</li><li>在搭建过程中不需要展开 ResLayer 的内部结构，直接使用 ResLayer 模块即可。</li><li>在搭建过程中允许添加以下模块，其中 + 标注的模块需要标定序号，* 标注的模块需要根据信息表配置参数：<ul className="operator-list"><li>ResLayer+</li><li>Conv2d+*</li><li>MaxPool2d+*</li><li>BatchNorm2d</li><li>ReLU</li></ul></li></ol>
      <h3>ResLayer 搭建</h3><ol><li>根据网络模块表，完成序号为 1006 的 ResLayer 模块搭建。</li><li>在搭建过程中允许添加以下模块，其中 + 标注的模块需要标定序号，* 标注的模块需要根据信息表配置参数：<ul className="operator-list"><li>Conv2d+*</li><li>BatchNorm2d</li><li>ReLU</li><li>Add*</li><li>Concat*</li></ul></li></ol></section>
      <section id="tips"><h2>Tips · 注意事项</h2><ul><li>在本题目的 ResNet 的残差设计中，激活函数在两条支路相加之后使用。</li><li>除了题目中要求的模块外，无需修改其余模块的参数。</li><li>请注意，不是所有允许添加的模块都需要使用，请根据题目要求选择合适的模块。</li><li>请勿修改题目中已经给出的模块参数，如果误操作导致修改或删除，请将其恢复原本参数设置。</li><li>请勿修改题目中已经给出的连线信息，如果误操作导致连线被删除，请重新连接原本的端口。</li><li>如果需要，可以使用复原功能恢复题目的初始状态，但所有的修改将会被清空，请谨慎使用。</li></ul></section>
      <section id="network"><h2>网络模块表</h2><p className="practical-annotation">保留平台原文。首行输出尺寸与末级 ResLayer 1008 的输出尺寸不同，请对照各层尺寸阅读。内部画布的 Input / Output 序号是本地示意标记。</p><pre className="network-table" tabIndex={0} role="region" aria-label="ResNet 网络模块表"><code>{networkTable}</code></pre></section><p className="practical-source">来源：目标智能检测技术应用实践赛平台 · ResNet · 2026-09-09</p>
    </article><aside className="practical-sidebar"><nav className="progress-card practical-outline" aria-label="本题目录"><div className="panel-heading"><h2>本题目录</h2></div><a href="#modules">模块说明</a><a href="#requirements">题目要求</a><a href="#tips">注意事项</a><a href="#network">网络模块表</a></nav><section className="progress-card practical-platform"><h2>原平台</h2><p>模型运行与官方评分请在原平台进行。</p><a className="primary-button" href={sourceUrl} target="_blank" rel="noopener noreferrer">打开原平台<ArrowUpRight size={17}/></a></section></aside></div>}/>
    <footer>目标智能检测技术应用实践赛<span>理解结构 · 动手实践</span></footer>
  </main></div>;}
