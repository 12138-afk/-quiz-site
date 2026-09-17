import{At as e,Lt as t,Ot as n,kt as r}from"./globals-CyGXjRNS.js";import{t as i}from"./arrow-up-right-BCrA1I9A.js";import{n as a,t as o}from"./table-copy-B_s1jGs3.js";var s=t(),c=e(),l=`https://ai.fmaster.cn/sw/ai/#/modelTask/NN?type=0&isEdit=false&isPublicTab=false&taskTag=&curTaskTag=mmdet&name=HourglassNet&modelId=796&modelPath=HourglassNet`,u=`=======================================================================================================================================
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
=======================================================================================================================================`;function d(){return(0,c.jsxs)(`div`,{className:`site-shell`,children:[(0,c.jsx)(n,{}),(0,c.jsxs)(`main`,{className:`workspace practical-workspace`,children:[(0,c.jsx)(r,{active:`hourglass`}),(0,c.jsxs)(`div`,{className:`page-heading`,children:[(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`div`,{className:`eyebrow`,children:`PRACTICAL EXERCISE`}),(0,c.jsx)(`h1`,{children:`HourglassNet`}),(0,c.jsx)(`p`,{children:`网络结构搭建 · 实操题目`})]}),(0,c.jsx)(`span`,{className:`type-tag`,children:`实操题 · 01`})]}),(0,c.jsx)(a,{question:(0,c.jsxs)(`div`,{className:`practical-layout`,children:[(0,c.jsxs)(`article`,{className:`question-card practical-content`,children:[(0,c.jsx)(`p`,{className:`practical-intro`,children:`HourglassNet 网络是人体姿态估计领域常用的网络之一，主要特点是使用对称的沙漏结构来提升模型效果。`}),(0,c.jsxs)(`section`,{id:`modules`,"aria-labelledby":`modules-heading`,children:[(0,c.jsx)(`h2`,{id:`modules-heading`,children:`模块说明`}),(0,c.jsx)(`h3`,{children:`HourglassModule`}),(0,c.jsx)(`p`,{children:`HourglassModule 是 HourglassNet 网络的核心模块，通过递归展开的方式提取不同尺度的特征。`}),(0,c.jsx)(`h3`,{children:`ResLayer`}),(0,c.jsx)(`p`,{children:`ResLayer 是 HourglassNet 网络的基本组成模块，以残差的方式提取特征。`})]}),(0,c.jsxs)(`section`,{id:`requirements`,"aria-labelledby":`requirements-heading`,children:[(0,c.jsx)(`h2`,{id:`requirements-heading`,children:`题目要求`}),(0,c.jsx)(`h3`,{children:`顶层搭建`}),(0,c.jsxs)(`ol`,{children:[(0,c.jsx)(`li`,{children:`根据网络信息表，补充 HourglassNet 的顶层网络结构。`}),(0,c.jsx)(`li`,{children:`在搭建过程中不需要展开 ResLayer 的内部结构，直接使用 ResLayer 模块即可。`}),(0,c.jsxs)(`li`,{children:[`在搭建过程中允许添加以下模块，其中 + 标注的模块需要标定序号，* 标注的模块需要根据信息表配置参数：`,(0,c.jsxs)(`ul`,{className:`operator-list`,children:[(0,c.jsx)(`li`,{children:`ResLayer+`}),(0,c.jsx)(`li`,{children:`Conv2d+*`}),(0,c.jsx)(`li`,{children:`Upsample+*`}),(0,c.jsx)(`li`,{children:`BatchNorm2d`}),(0,c.jsx)(`li`,{children:`ReLU`}),(0,c.jsx)(`li`,{children:`Add*`}),(0,c.jsx)(`li`,{children:`Concat*`})]})]})]}),(0,c.jsx)(`h3`,{children:`HourglassModule 搭建`}),(0,c.jsxs)(`ol`,{children:[(0,c.jsx)(`li`,{children:`根据网络模块表，完成序号为 1004 的 ResLayer 模块搭建。`}),(0,c.jsxs)(`li`,{children:[`在搭建过程中允许添加以下模块，其中 + 标注的模块需要标定序号，* 标注的模块需要根据信息表配置参数：`,(0,c.jsxs)(`ul`,{className:`operator-list`,children:[(0,c.jsx)(`li`,{children:`Conv2d+*`}),(0,c.jsx)(`li`,{children:`BatchNorm2d`}),(0,c.jsx)(`li`,{children:`ReLU`}),(0,c.jsx)(`li`,{children:`Add*`}),(0,c.jsx)(`li`,{children:`Concat*`})]})]})]}),(0,c.jsx)(`p`,{className:`practical-annotation`,children:`原题的小节标题为“HourglassModule 搭建”，正文指定的是 ResLayer 1004；此处保留原文。`})]}),(0,c.jsxs)(`section`,{id:`tips`,"aria-labelledby":`tips-heading`,children:[(0,c.jsx)(`h2`,{id:`tips-heading`,children:`Tips · 注意事项`}),(0,c.jsxs)(`ul`,{children:[(0,c.jsx)(`li`,{children:`在本题目的 ResLayer 的残差设计中，激活函数在两条支路相加之后使用。`}),(0,c.jsx)(`li`,{children:`除了题目中要求的模块外，无需修改其余模块的参数。`}),(0,c.jsx)(`li`,{children:`请注意，不是所有允许添加的模块都需要使用，请根据题目要求选择合适的模块。`}),(0,c.jsx)(`li`,{children:`请勿修改题目中已经给出的模块参数，如果误操作导致修改或删除，请将其恢复原本参数设置。`}),(0,c.jsx)(`li`,{children:`请勿修改题目中已经给出的连线信息，如果误操作导致连线被删除，请重新连接原本的端口。`}),(0,c.jsx)(`li`,{children:`如果需要，可以使用复原功能恢复题目的初始状态，但所有的修改将会被清空，请谨慎使用。`})]})]}),(0,c.jsxs)(`section`,{id:`network`,"aria-labelledby":`network-heading`,children:[(0,c.jsx)(`h2`,{id:`network-heading`,children:`网络模块表`}),(0,c.jsx)(`p`,{className:`practical-annotation`,children:`包含模块序号、卷积核尺寸和输入输出尺寸。表格可横向滚动，··· 为原题中的省略标记。`}),(0,c.jsxs)(`div`,{className:`network-table-wrap`,children:[(0,c.jsx)(`pre`,{className:`network-table`,tabIndex:0,role:`region`,"aria-label":`HourglassNet 网络模块表，可横向滚动`,children:(0,c.jsx)(`code`,{children:u})}),(0,c.jsx)(o,{text:u})]})]}),(0,c.jsx)(`p`,{className:`practical-source`,children:`来源：目标智能检测技术应用实践赛平台 · HourglassNet · 2026-09-07`})]}),(0,c.jsxs)(`aside`,{className:`practical-sidebar`,children:[(0,c.jsxs)(`nav`,{className:`progress-card practical-outline`,"aria-label":`本题目录`,children:[(0,c.jsx)(`div`,{className:`panel-heading`,children:(0,c.jsx)(`h2`,{children:`本题目录`})}),(0,c.jsx)(`a`,{href:`#modules`,children:`模块说明`}),(0,c.jsx)(`a`,{href:`#requirements`,children:`题目要求`}),(0,c.jsx)(`a`,{href:`#tips`,children:`注意事项`}),(0,c.jsx)(`a`,{href:`#network`,children:`网络模块表`})]}),(0,c.jsxs)(`section`,{className:`progress-card practical-platform`,children:[(0,c.jsx)(`h2`,{children:`动手搭建`}),(0,c.jsx)(`p`,{children:`关闭弹窗后，可在画布拖入模块并连线。模型运行和官方评分请在原平台进行。`}),(0,c.jsxs)(`a`,{className:`primary-button`,href:l,target:`_blank`,rel:`noopener noreferrer`,children:[`打开原平台`,(0,c.jsx)(i,{size:17})]})]})]})]})}),(0,c.jsxs)(`footer`,{children:[`目标智能检测技术应用实践赛`,(0,c.jsx)(`span`,{children:`理解结构 · 动手实践`})]})]})]})}var f=document.getElementById(`root`);f&&(0,s.createRoot)(f).render((0,c.jsx)(d,{}));