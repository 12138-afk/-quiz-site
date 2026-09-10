import type { Metadata } from 'next';
import { ArrowUpRight, ScanLine } from 'lucide-react';
import NetworkEditor from './network-editor';


export const metadata: Metadata = {
  title: 'HourglassNet · 实操题 · 目标智能',
  description: 'HourglassNet 实操题：顶层网络搭建、ResLayer 模块搭建要求、注意事项和完整网络模块表。',
};

const sourceUrl = 'https://ai.fmaster.cn/sw/ai/#/modelTask/NN?type=0&isEdit=false&isPublicTab=false&taskTag=&curTaskTag=mmdet&name=HourglassNet&modelId=796&modelPath=HourglassNet';

// 原平台题目要求中的网络模块表，保留其省略标记和层级。
const networkTable = `=======================================================================================================================================
Layer (type:idx)                                             Kernel Shape              Input Shape               Output Shape
=======================================================================================================================================
HourglassNet                                                 --                        [1, 3, 640, 640]          [1, 256, 160, 160]
├─Conv2d: 1001                                               [7, 7]                    [1, 3, 640, 640]          [1, 128, 320, 320]
├─BatchNorm2d: 1002                                          --                        [1, 128, 320, 320]        [1, 128, 320, 320]
├─ReLU: 1003                                                 --                        [1, 128, 320, 320]        [1, 128, 320, 320]
├─ResLayer: 1004                                             --                        [1, 128, 320, 320]        [1, 256, 160, 160]
│    └─BasicBlock: 2001                                      --                        [1, 128, 320, 320]        [1, 256, 160, 160]
│    │    └─Conv2d: 3001                                     [3, 3]                    [1, 128, 320, 320]        [1, 256, 160, 160]
│    │    └─BatchNorm2d: 3002                                --                        [1, 256, 160, 160]        [1, 256, 160, 160]
│    │    └─ReLU: 3003                                       --                        [1, 256, 160, 160]        [1, 256, 160, 160]
│    │    └─Conv2d: 3004                                     [3, 3]                    [1, 256, 160, 160]        [1, 256, 160, 160]
│    │    └─BatchNorm2d: 3005                                --                        [1, 256, 160, 160]        [1, 256, 160, 160]
│    │    └─Sequential: 3006                                 --                        [1, 128, 320, 320]        [1, 256, 160, 160]
│    │    │    └─Conv2d: 4001                                [1, 1]                    [1, 128, 320, 320]        [1, 256, 160, 160]
│    │    │    └─BatchNorm2d: 4002                           --                        [1, 256, 160, 160]        [1, 256, 160, 160]
│    │    └─ReLU: 3007                                       --                        [1, 256, 160, 160]        [1, 256, 160, 160]
├─HourglassModule: 1005                                      --                        [1, 256, 160, 160]        [1, 256, 160, 160]
│    └─ResLayer: 2002                                        --                        [1, 256, 160, 160]        [1, 256, 160, 160]
│    │    ···
│    └─ResLayer: 2003                                        --                        [1, 256, 160, 160]        [1, 256, 80, 80]
│    │    ···
│    └─HourglassModule: 2004                                 --                        [1, 256, 80, 80]          [1, 256, 80, 80]
│    │    |    ···
│    │    └─ResLayer: 3012                                   --                        [1, 256, 80, 80]          [1, 256, 80, 80]
│    │    │    ···
│    │    └─ResLayer: 3013                                   --                        [1, 256, 80, 80]          [1, 384, 40, 40]
│    │    │    ···
│    │    └─HourglassModule: 3014                            --                        [1, 384, 40, 40]          [1, 384, 40, 40]
│    │    │    └─ResLayer: 4032                              --                        [1, 384, 40, 40]          [1, 384, 40, 40]
│    │    │    │    ···
│    │    │    └─ResLayer: 4033                              --                        [1, 384, 40, 40]          [1, 384, 20, 20]
│    │    │    │    ···
│    │    │    └─HourglassModule: 4034                       --                        [1, 384, 20, 20]          [1, 384, 20, 20]
│    │    │    │    └─ResLayer: 5032                         --                        [1, 384, 20, 20]          [1, 384, 20, 20]
│    │    │    │    |    ···
│    │    │    │    └─ResLayer: 5033                         --                        [1, 384, 20, 20]          [1, 512, 10, 10]
│    │    │    │    │    ···
│    │    │    │    └─ResLayer: 5034                         --                        [1, 512, 10, 10]          [1, 512, 10, 10]
│    │    │    │    │    ···
│    │    │    │    └─ResLayer: 5035                         --                        [1, 512, 10, 10]          [1, 384, 10, 10]
│    │    │    │    │    ···
│    │    │    │    └─Upsample: 5036                         --                        [1, 384, 10, 10]          [1, 384, 20, 20]
│    │    │    └─ResLayer: 4035                              --                        [1, 384, 20, 20]          [1, 384, 20, 20]
│    │    │    │    ···
│    │    │    └─Upsample: 4036                              --                        [1, 384, 20, 20]          [1, 384, 40, 40]
│    │    └─ResLayer: 3015                                   --                        [1, 384, 40, 40]          [1, 256, 40, 40]
│    │    │    ···
│    │    └─Upsample: 3016                                   --                        [1, 256, 40, 40]          [1, 256, 80, 80]
│    └─ResLayer: 2005                                        --                        [1, 256, 80, 80]          [1, 256, 80, 80]
│    │    ···
│    └─Upsample: 2006                                        --                        [1, 256, 80, 80]          [1, 256, 160, 160]
├─Conv2d: 1006                                               [3, 3]                    [1, 256, 160, 160]        [1, 256, 160, 160]
├─BatchNorm2d: 1007                                          --                        [1, 256, 160, 160]        [1, 256, 160, 160]
├─ReLU: 1008                                                 --                        [1, 256, 160, 160]        [1, 256, 160, 160]
=======================================================================================================================================`;

export default function Practical() {
  return <div className="site-shell">
    <header className="topbar">
      <a href="/" className="brand"><span className="brand-mark"><ScanLine size={23}/></span>目标智能<span className="brand-divider"/>实操题</a>
      <span className="edition">目标智能检测技术应用实践赛 · 区域赛</span>
    </header>
    <main className="workspace practical-workspace">
      <nav className="practice-nav" aria-label="练习分类"><a href="/">理论练习</a><a href="/practical" aria-current="page">实操题 · HourglassNet</a><a href="/practical/resnet">实操题 · ResNet</a></nav>
      <div className="page-heading"><div><div className="eyebrow">PRACTICAL EXERCISE</div><h1>HourglassNet</h1><p>网络结构搭建 · 实操题目</p></div><span className="type-tag">实操题 · 01</span></div>
      <NetworkEditor question={<div className="practical-layout">
        <article className="question-card practical-content">
          <p className="practical-intro">HourglassNet 网络是人体姿态估计领域常用的网络之一，主要特点是使用对称的沙漏结构来提升模型效果。</p>
          <section id="modules" aria-labelledby="modules-heading">
            <h2 id="modules-heading">模块说明</h2>
            <h3>HourglassModule</h3><p>HourglassModule 是 HourglassNet 网络的核心模块，通过递归展开的方式提取不同尺度的特征。</p>
            <h3>ResLayer</h3><p>ResLayer 是 HourglassNet 网络的基本组成模块，以残差的方式提取特征。</p>
          </section>
          <section id="requirements" aria-labelledby="requirements-heading">
            <h2 id="requirements-heading">题目要求</h2>
            <h3>顶层搭建</h3>
            <ol>
              <li>根据网络信息表，补充 HourglassNet 的顶层网络结构。</li>
              <li>在搭建过程中不需要展开 ResLayer 的内部结构，直接使用 ResLayer 模块即可。</li>
              <li>在搭建过程中允许添加以下模块，其中 + 标注的模块需要标定序号，* 标注的模块需要根据信息表配置参数：
                <ul className="operator-list"><li>ResLayer+</li><li>Conv2d+*</li><li>Upsample+*</li><li>BatchNorm2d</li><li>ReLU</li><li>Add*</li><li>Concat*</li></ul>
              </li>
            </ol>
            <h3>HourglassModule 搭建</h3>
            <ol>
              <li>根据网络模块表，完成序号为 1004 的 ResLayer 模块搭建。</li>
              <li>在搭建过程中允许添加以下模块，其中 + 标注的模块需要标定序号，* 标注的模块需要根据信息表配置参数：
                <ul className="operator-list"><li>Conv2d+*</li><li>BatchNorm2d</li><li>ReLU</li><li>Add*</li><li>Concat*</li></ul>
              </li>
            </ol>
            <p className="practical-annotation">原题的小节标题为“HourglassModule 搭建”，正文指定的是 ResLayer 1004；此处保留原文。</p>
          </section>
          <section id="tips" aria-labelledby="tips-heading">
            <h2 id="tips-heading">Tips · 注意事项</h2>
            <ul>
              <li>在本题目的 ResLayer 的残差设计中，激活函数在两条支路相加之后使用。</li>
              <li>除了题目中要求的模块外，无需修改其余模块的参数。</li>
              <li>请注意，不是所有允许添加的模块都需要使用，请根据题目要求选择合适的模块。</li>
              <li>请勿修改题目中已经给出的模块参数，如果误操作导致修改或删除，请将其恢复原本参数设置。</li>
              <li>请勿修改题目中已经给出的连线信息，如果误操作导致连线被删除，请重新连接原本的端口。</li>
              <li>如果需要，可以使用复原功能恢复题目的初始状态，但所有的修改将会被清空，请谨慎使用。</li>
            </ul>
          </section>
          <section id="network" aria-labelledby="network-heading">
            <h2 id="network-heading">网络模块表</h2>
            <p className="practical-annotation">包含模块序号、卷积核尺寸和输入输出尺寸。表格可横向滚动，··· 为原题中的省略标记。</p>
            <pre className="network-table" tabIndex={0} role="region" aria-label="HourglassNet 网络模块表，可横向滚动"><code>{networkTable}</code></pre>
          </section>
          <p className="practical-source">来源：目标智能检测技术应用实践赛平台 · HourglassNet · 2026-09-07</p>
        </article>
        <aside className="practical-sidebar">
          <nav className="progress-card practical-outline" aria-label="本题目录">
            <div className="panel-heading"><h2>本题目录</h2></div>
            <a href="#modules">模块说明</a><a href="#requirements">题目要求</a><a href="#tips">注意事项</a><a href="#network">网络模块表</a>
          </nav>
          <section className="progress-card practical-platform"><h2>动手搭建</h2><p>关闭弹窗后，可在画布拖入模块并连线。模型运行和官方评分请在原平台进行。</p><a className="primary-button" href={sourceUrl} target="_blank" rel="noopener noreferrer">打开原平台<ArrowUpRight size={17}/></a></section>
        </aside>
      </div>
      }/><footer>目标智能检测技术应用实践赛<span>理解结构 · 动手实践</span></footer>
    </main>
  </div>;
}




