// 顶层节点和边来自源平台 standardContainer 中已展示的参考图。
export type ReferenceNode = { id: string; x: number; y: number };
export type ReferenceEdge = { from: string; to: string; port: number };
export type ReferenceGraph = { nodes: ReferenceNode[]; edges: ReferenceEdge[]; width: number; height: number };
export function buildSteps(graph: ReferenceGraph) {
  const remaining = [...graph.nodes], placed = new Set<string>();
  const steps: { node: ReferenceNode; incoming: ReferenceEdge[] }[] = [];
  while (remaining.length) {
    const index = remaining.findIndex(n => graph.edges.filter(e => e.to === n.id).every(e => placed.has(e.from)));
    if (index < 0) throw new Error('参考图含循环或无效的前置模块');
    const [node] = remaining.splice(index, 1);
    steps.push({ node, incoming: graph.edges.filter(e => e.to === node.id) });
    placed.add(node.id);
  }
  return steps;
}
const topNodes: [string, number, number][] = [
  ['Input[8001]', -609, 629], ['Conv2d[1001]', -536, 629], ['Conv2d[1006]', 2433, 647],
  ['BatchNorm2d[1002]', -404, 629], ['BatchNorm2d[1007]', 2580, 647], ['ReLU[1003]', -262, 629],
  ['ReLU[1008]', 2715, 647], ['ResLayer[1004]', -126, 629], ['Output[9001]', 2869, 647],
  ['ResLayer[3012]', 160, 779], ['ResLayer[3013]', 160, 913], ['ResLayer[4032]', 296, 913],
  ['ResLayer[4033]', 296, 1053], ['ResLayer[5032]', 432, 1053], ['ResLayer[5033]', 432, 1196],
  ['ResLayer[5034]', 573, 1196], ['ResLayer[5035]', 717, 1196], ['ResLayer[4035]', 1137, 1053],
  ['ResLayer[3015]', 1540, 913], ['ResLayer[2005]', 1954, 779], ['Upsample[5036]', 855, 1196],
  ['Upsample[4036]', 1270, 1053], ['Upsample[3016]', 1680, 913], ['Upsample[2006]', 2100, 779],
  ['Add[0]', 1006, 1053], ['Add[1]', 1417, 913], ['Add[2]', 1817, 779], ['Add[3]', 2292, 647],
  ['ResLayer[2002]', 10, 629], ['ResLayer[2003]', 10, 779],
];
const topEdges: [string, string, number?][] = [
  ['Conv2d[1006]', 'BatchNorm2d[1007]'], ['BatchNorm2d[1007]', 'ReLU[1008]'], ['ReLU[1008]', 'Output[9001]'],
  ['Input[8001]', 'Conv2d[1001]'], ['Conv2d[1001]', 'BatchNorm2d[1002]'], ['BatchNorm2d[1002]', 'ReLU[1003]'], ['ReLU[1003]', 'ResLayer[1004]'],
  ['ResLayer[3013]', 'ResLayer[4032]'], ['ResLayer[3013]', 'ResLayer[4033]'], ['ResLayer[4033]', 'ResLayer[5032]'], ['ResLayer[4033]', 'ResLayer[5033]'],
  ['ResLayer[5033]', 'ResLayer[5034]'], ['ResLayer[5034]', 'ResLayer[5035]'], ['ResLayer[5035]', 'Upsample[5036]'],
  ['Upsample[5036]', 'Add[0]', 1], ['ResLayer[5032]', 'Add[0]', 0], ['Add[0]', 'ResLayer[4035]'],
  ['Upsample[4036]', 'Add[1]', 1], ['Add[1]', 'ResLayer[3015]'], ['ResLayer[4035]', 'Upsample[4036]'],
  ['Upsample[3016]', 'Add[2]', 1], ['Add[2]', 'ResLayer[2005]'], ['Upsample[2006]', 'Add[3]', 1],
  ['ResLayer[2005]', 'Upsample[2006]'], ['ResLayer[3015]', 'Upsample[3016]'], ['ResLayer[4032]', 'Add[1]', 0],
  ['ResLayer[3012]', 'Add[2]', 0], ['Add[3]', 'Conv2d[1006]'], ['ResLayer[1004]', 'ResLayer[2002]'],
  ['ResLayer[2002]', 'Add[3]', 0], ['ResLayer[1004]', 'ResLayer[2003]'], ['ResLayer[2003]', 'ResLayer[3012]'], ['ResLayer[2003]', 'ResLayer[3013]'],
];
// 内部图根据题面网络模块表及“相加后激活”说明整理，未作为平台原图转录。
const innerNodes: [string, number, number][] = [
  ['Input[8002]', 40, 180], ['Conv2d[3001]', 260, 80], ['BatchNorm2d[3002]', 480, 80],
  ['ReLU[3003]', 700, 80], ['Conv2d[3004]', 920, 80], ['BatchNorm2d[3005]', 1140, 80],
  ['Conv2d[4001]', 260, 320], ['BatchNorm2d[4002]', 700, 320], ['Add', 1360, 180],
  ['ReLU[3007]', 1580, 180], ['Output[9002]', 1800, 180],
];
const innerEdges: [string, string, number?][] = [
  ['Input[8002]', 'Conv2d[3001]'], ['Conv2d[3001]', 'BatchNorm2d[3002]'], ['BatchNorm2d[3002]', 'ReLU[3003]'],
  ['ReLU[3003]', 'Conv2d[3004]'], ['Conv2d[3004]', 'BatchNorm2d[3005]'], ['BatchNorm2d[3005]', 'Add', 0],
  ['Input[8002]', 'Conv2d[4001]'], ['Conv2d[4001]', 'BatchNorm2d[4002]'], ['BatchNorm2d[4002]', 'Add', 1], ['Add', 'ReLU[3007]'], ['ReLU[3007]', 'Output[9002]'],
];
export const referenceGraphs: Record<'top' | 'reslayer', ReferenceGraph> = {
  top: { width: 5260, height: 910, nodes: topNodes.map(([id, x, y]) => ({ id, x: id === 'Input[8001]' ? 40 : (x + 536) * 1.4 + 250, y: (y - 629) * 1.2 + 80 })), edges: topEdges.map(([from, to, port = 0]) => ({ from, to, port })) },
  reslayer: { width: 2020, height: 470, nodes: innerNodes.map(([id, x, y]) => ({ id, x, y })), edges: innerEdges.map(([from, to, port = 0]) => ({ from, to, port })) },
};

export const referenceSteps = { top: buildSteps(referenceGraphs.top), reslayer: buildSteps(referenceGraphs.reslayer) };

// ResNet references are derived from the imported question table, not a platform answer export.
const resnetTopNames = ['Input[1000]', 'Conv2d[1001]', 'BatchNorm2d[1002]', 'ReLU[1003]', 'MaxPool2d[1004]', 'ResLayer[1005]', 'ResLayer[1006]', 'ResLayer[1007]', 'ResLayer[1008]', 'Output[9001]'];
const resnetInnerNodes: [string, number, number][] = [
  ['Input[8001]',40,180], ['Conv2d[3013]',260,80], ['BatchNorm2d[3014]',480,80], ['ReLU[3015]',700,80], ['Conv2d[3016]',920,80], ['BatchNorm2d[3017]',1140,80],
  ['Conv2d[4001]',260,320], ['BatchNorm2d[4002]',920,320], ['Add[A]',1360,180], ['ReLU[3019]',1580,180],
  ['Conv2d[3020]',1800,80], ['BatchNorm2d[3021]',2020,80], ['ReLU[3022]',2240,80], ['Conv2d[3023]',2460,80], ['BatchNorm2d[3024]',2680,80],
  ['Add[B]',2900,180], ['ReLU[3025]',3120,180], ['Output[9001]',3340,180],
];
const resnetInnerEdges: [string,string,number?][] = [
  ['Input[8001]','Conv2d[3013]'],['Conv2d[3013]','BatchNorm2d[3014]'],['BatchNorm2d[3014]','ReLU[3015]'],['ReLU[3015]','Conv2d[3016]'],['Conv2d[3016]','BatchNorm2d[3017]'],['BatchNorm2d[3017]','Add[A]',0],
  ['Input[8001]','Conv2d[4001]'],['Conv2d[4001]','BatchNorm2d[4002]'],['BatchNorm2d[4002]','Add[A]',1],['Add[A]','ReLU[3019]'],
  ['ReLU[3019]','Conv2d[3020]'],['Conv2d[3020]','BatchNorm2d[3021]'],['BatchNorm2d[3021]','ReLU[3022]'],['ReLU[3022]','Conv2d[3023]'],['Conv2d[3023]','BatchNorm2d[3024]'],['BatchNorm2d[3024]','Add[B]',0],['ReLU[3019]','Add[B]',1],['Add[B]','ReLU[3025]'],['ReLU[3025]','Output[9001]'],
];
export const resnetReferenceGraphs: Record<'top'|'reslayer',ReferenceGraph> = {
  top: { width:2240,height:320,nodes:resnetTopNames.map((id,i)=>({id,x:40+i*220,y:100})),edges:resnetTopNames.slice(1).map((to,i)=>({from:resnetTopNames[i],to,port:0})) },
  reslayer: {width:3580,height:500,nodes:resnetInnerNodes.map(([id,x,y])=>({id,x,y})),edges:resnetInnerEdges.map(([from,to,port=0])=>({from,to,port}))},
};
export const resnetReferenceSteps = {top:buildSteps(resnetReferenceGraphs.top),reslayer:buildSteps(resnetReferenceGraphs.reslayer)};
