// ============ 工具函数 ============
const deg = Math.PI / 180;
const rad = 180 / Math.PI;

const mulMat = (l, r) => {
  const rtn = [];
  for (let i = 0; i < 16; i++) {
    const row = i - (i % 4), col = i % 4;
    rtn[i] = l[row] * r[col] + l[row + 1] * r[col + 4] + l[row + 2] * r[col + 8] + l[row + 3] * r[col + 12];
  }
  return rtn;
};

const tMat = m => [m[0], m[4], m[8], m[12], m[1], m[5], m[9], m[13], m[2], m[6], m[10], m[14], m[3], m[7], m[11], m[15]];

const adjMat = m => [
  m[5]*(m[10]*m[15]-m[11]*m[14])+m[6]*(m[11]*m[13]-m[9]*m[15])+m[7]*(m[9]*m[14]-m[10]*m[13]),
  m[1]*(m[11]*m[14]-m[10]*m[15])+m[2]*(m[9]*m[15]-m[11]*m[13])+m[3]*(m[10]*m[13]-m[9]*m[14]),
  m[1]*(m[6]*m[15]-m[7]*m[14])+m[2]*(m[7]*m[13]-m[5]*m[15])+m[3]*(m[5]*m[14]-m[6]*m[13]),
  m[1]*(m[7]*m[10]-m[6]*m[11])+m[2]*(m[5]*m[11]-m[7]*m[9])+m[3]*(m[6]*m[9]-m[5]*m[10]),
  m[4]*(m[11]*m[14]-m[10]*m[15])+m[6]*(m[8]*m[15]-m[11]*m[12])+m[7]*(m[10]*m[12]-m[8]*m[14]),
  m[0]*(m[10]*m[15]-m[11]*m[14])+m[2]*(m[11]*m[12]-m[8]*m[15])+m[3]*(m[8]*m[14]-m[10]*m[12]),
  m[0]*(m[7]*m[14]-m[6]*m[15])+m[2]*(m[4]*m[15]-m[7]*m[12])+m[3]*(m[6]*m[12]-m[4]*m[14]),
  m[0]*(m[6]*m[11]-m[7]*m[10])+m[2]*(m[7]*m[8]-m[4]*m[11])+m[3]*(m[4]*m[10]-m[6]*m[8]),
  m[4]*(m[9]*m[15]-m[11]*m[13])+m[5]*(m[11]*m[12]-m[8]*m[15])+m[7]*(m[8]*m[13]-m[9]*m[12]),
  m[0]*(m[11]*m[13]-m[9]*m[15])+m[1]*(m[8]*m[15]-m[11]*m[12])+m[3]*(m[9]*m[12]-m[8]*m[13]),
  m[0]*(m[5]*m[15]-m[7]*m[13])+m[1]*(m[7]*m[12]-m[4]*m[15])+m[3]*(m[4]*m[13]-m[5]*m[12]),
  m[0]*(m[7]*m[9]-m[5]*m[11])+m[1]*(m[4]*m[11]-m[7]*m[8])+m[3]*(m[5]*m[8]-m[4]*m[9]),
  m[4]*(m[10]*m[13]-m[9]*m[14])+m[5]*(m[8]*m[14]-m[10]*m[12])+m[6]*(m[9]*m[12]-m[8]*m[13]),
  m[0]*(m[9]*m[14]-m[10]*m[13])+m[1]*(m[10]*m[12]-m[8]*m[14])+m[2]*(m[8]*m[13]-m[9]*m[12]),
  m[0]*(m[6]*m[13]-m[5]*m[14])+m[1]*(m[4]*m[14]-m[6]*m[12])+m[2]*(m[5]*m[12]-m[4]*m[13]),
  m[0]*(m[5]*m[10]-m[6]*m[9])+m[1]*(m[6]*m[8]-m[4]*m[10])+m[2]*(m[4]*m[9]-m[5]*m[8])
];

const num2str = num => {
  if (!Number.isFinite(num)) return "0";
  const str = String(num);
  if (!str.includes("e")) return str;
  const [_, sgn, int, frac, expStr] = str.match(/^(-?)(\d*)\.?(\d*)e([+-]\d+)$/);
  let mantissa = int + frac, exp = Number(expStr);
  if (exp > 0) {
    mantissa = mantissa.padEnd(exp + 1, "0");
    return sgn + mantissa.slice(0, exp + 1) + (mantissa.length > exp + 1 ? "." + mantissa.slice(exp + 1) : "");
  }
  mantissa = mantissa.padStart(1 - exp, "0");
  const dot = mantissa.length + exp;
  return sgn + (dot > 0 ? mantissa.slice(0, dot) : "0") + (dot < mantissa.length ? "." + mantissa.slice(dot) : "");
};

const vec3 = {
  add: (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]],
  sub: (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]],
  mul: (a, s) => [a[0]*s, a[1]*s, a[2]*s],
  dot: (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2],
  cross: (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]],
  len: a => Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]),
  norm: a => {
    const l = Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);
    return l > 0.0001 ? [a[0]/l, a[1]/l, a[2]/l] : [0,0,0];
  }
};

const mat4Vec3 = (m, v, isDirection = false) => {
  if (isDirection) {
    // 方向向量：只应用旋转，不应用平移
    const x = m[0]*v[0] + m[4]*v[1] + m[8]*v[2];
    const y = m[1]*v[0] + m[5]*v[1] + m[9]*v[2];
    const z = m[2]*v[0] + m[6]*v[1] + m[10]*v[2];
    return [x, y, z];
  }
  // 点：应用完整的变换（包括平移）
  const x = m[0]*v[0] + m[4]*v[1] + m[8]*v[2] + m[12];
  const y = m[1]*v[0] + m[5]*v[1] + m[9]*v[2] + m[13];
  const z = m[2]*v[0] + m[6]*v[1] + m[10]*v[2] + m[14];
  const w = m[3]*v[0] + m[7]*v[1] + m[11]*v[2] + m[15];
  if (Math.abs(w) < 0.0001) return [x, y, z]; // 避免除以0
  return [x/w, y/w, z/w];
};

// ============ 全局状态 ============
let models = [];
let modelGroups = [];
let presetAnimations = [];
let activeModelId = null;
let activeGroupId = null;
let modelCounter = 0;
let groupCounter = 0;
let presetAnimationCounter = 0;
let isMolangRunning = false;
let touchMode = 'move'; // 默认触控模式为移动
let isPresetAnimationRunning = false;
let animationFrameId = null;
let presetAnimationFrameId = null;
let molangIntervalId = null;
let presetAnimationIntervalId = null;
let hasUnsavedChanges = false;
let savedData = {};
// 从localStorage加载保存的数据
const localSavedData = localStorage.getItem('savedData');
if (localSavedData) {
  try {
    savedData = JSON.parse(localSavedData);
  } catch (e) {
    console.error('加载保存数据失败:', e);
    savedData = {};
  }
}
let currentModelType = 'block';
let currentVersion = 'base'; // 'base' or 'extend'
let currentCopyGroupId = null;
let molangFps = 30; // Molang执行速率，默认30FPS
let screenAnimationEnabled = true; // 屏幕动画开关
let expandedGroups = new Set(); // 记录哪些模型组是展开的

// 骨骼
let bones = [];
let boneStep = {
  boneIdCounter: 0,
  boneModalStep: 0, // 0: 选择父级, 1: 选择子级, 2: 调试
  boneParentModelId: null,
  boneChildModelId: null,
  boneBx: 0,
  boneBy: 1, // 默认值
  boneBz: 0
};
let isBoneDebugMode = false; // 是否在骨骼调试模式

// 视角控制
let viewPitch = 15, viewYaw = -10, viewScale = 2;
let touchControlEnabled = true; // 触控控件开关

let isDraggingView = false;
let isDraggingArrow = false;
let selectedArrow = null;

// 点击检测（区分点击和滑动）
let clickStartPos = null;
let clickStartTime = 0;
const CLICK_THRESHOLD = 20; // 像素，移动超过此距离视为滑动
const CLICK_TIME_THRESHOLD = 300; // 毫秒，超过此时间视为长按

// 视觉效果
let selectionHighlightEnabled = true;
let viewSelectionEnabled = false;
let stepSettingsEnabled = false;
let compassEnabled = true; // 坐标系罗盘开关

// 复制模型
let currentCopyModelId = null;
let lastMousePos = { x: 0, y: 0 };
let dragStartVars = null;
let touchStartDist = 0;
let touchStartScale = 2;

// 纹理
const texNames = ["diamond_block", "alex", "colored"];
const texLoaded = {};
const textures = {};

// 自定义颜色纹理
let customColorTexture = null;
let customColorTextureIdx = 3; // 使用纹理单元3

// 创建/更新自定义颜色纹理
// 不再使用全局自定义颜色纹理，改为每个方块单独设置颜色
/* function updateCustomColorTexture(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16) / 255;
  const g = parseInt(hexColor.slice(3, 5), 16) / 255;
  const b = parseInt(hexColor.slice(5, 7), 16) / 255;
  
  const pixel = new Uint8Array([r * 255, g * 255, b * 255, 255]);
  
  gl.activeTexture(gl.TEXTURE0 + customColorTextureIdx);
  
  if (!customColorTexture) {
    customColorTexture = gl.createTexture();
  }
  
  gl.bindTexture(gl.TEXTURE_2D, customColorTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  
  texLoaded['custom_color'] = true;
  textures['custom_color'] = customColorTextureIdx;
} */

// 变量定义模板
const varDefsTemplate = [
  {name:"xpos",init:0},{name:"ypos",init:0},{name:"zpos",init:0},
  {name:"xrot",init:0},{name:"yrot",init:0},{name:"zrot",init:0},
  {name:"scale",init:1},{name:"xzscale",init:1},{name:"yscale",init:1},
  {name:"xbasepos",init:0},{name:"ybasepos",init:0},{name:"zbasepos",init:0},
  {name:"extend_scale",init:1},{name:"extend_xrot",init:0},{name:"extend_yrot",init:0}
];

const globalVars = {};

// ============ 预设动画 ============
class PresetAnimation {
  constructor(id, name, timelineVariable, incrementStep) {
    this.id = id;
    this.name = name;
    this.timelineVariable = timelineVariable;
    this.incrementStep = incrementStep;
    this.molangCode = '';
    this.isRunning = false;
    this.currentTime = 0;
    this.maxTime = 100;
    this.hasError = false;
    this.errorMsg = '';
  }
}

// ============ 顶点数据 ============
function generateBlockVertices() {
  return new Float32Array([-.5,.5,-.5,0,1,0,.25,0,0,1,0,-.5,.5,.5,0,1,1,.25,.5,0,1,0,.5,.5,-.5,1,1,0,.5,0,0,1,0,.5,.5,.5,1,1,1,.5,.5,0,1,0,-.5,-.5,-.5,0,0,0,.5,0,0,-1,0,.5,-.5,-.5,1,0,0,.75,0,0,-1,0,-.5,-.5,.5,0,0,1,.5,.5,0,-1,0,.5,-.5,.5,1,0,1,.75,.5,0,-1,0,-.5,.5,-.5,0,1,0,0,.5,-1,0,0,-.5,-.5,-.5,0,0,0,0,1,-1,0,0,-.5,.5,.5,0,1,1,.25,.5,-1,0,0,-.5,-.5,.5,0,0,1,.25,1,-1,0,0,-.5,.5,.5,0,1,1,.25,.5,0,0,1,-.5,-.5,.5,0,0,1,.25,1,0,0,1,.5,.5,.5,1,1,1,.5,.5,0,0,1,.5,-.5,.5,1,0,1,.5,1,0,0,1,.5,.5,.5,1,1,1,.5,.5,1,0,0,.5,-.5,.5,1,0,1,.5,1,1,0,0,.5,.5,-.5,1,1,0,.75,.5,1,0,0,.5,-.5,-.5,1,0,0,.75,1,1,0,0,.5,.5,-.5,1,1,0,.75,.5,0,0,-1,.5,-.5,-.5,1,0,0,.75,1,0,0,-1,-.5,.5,-.5,0,1,0,1,.5,0,0,-1,-.5,-.5,-.5,0,0,0,1,1,0,0,-1]);
}

// 楼梯 - 最终版本，确保没有多余面
function generateStairsVertices() {
  const v = [];
  const c1 = [0.75, 0.65, 0.55];
  const c2 = [0.85, 0.75, 0.65];
  const c3 = [0.65, 0.55, 0.45];
  
  const pushVert = (x, y, z, color, nx=0, ny=0, nz=0) => {
    v.push(x, y, z, color[0], color[1], color[2], 0, 0, nx, ny, nz);
  };
  
  // 底面
  pushVert(-.5, -.5, -.5, c3, 0, -1, 0); pushVert(.5, -.5, -.5, c3, 0, -1, 0); pushVert(.5, -.5, .5, c3, 0, -1, 0);
  pushVert(-.5, -.5, -.5, c3, 0, -1, 0); pushVert(.5, -.5, .5, c3, 0, -1, 0); pushVert(-.5, -.5, .5, c3, 0, -1, 0);
  
  // 前面
  pushVert(-.5, -.5, .5, c1, 0, 0, 1); pushVert(.5, -.5, .5, c1, 0, 0, 1); pushVert(.5, 0, .5, c1, 0, 0, 1);
  pushVert(-.5, -.5, .5, c1, 0, 0, 1); pushVert(.5, 0, .5, c1, 0, 0, 1); pushVert(-.5, 0, .5, c1, 0, 0, 1);
  
  // 左面下半
  pushVert(-.5, -.5, -.5, c1, -1, 0, 0); pushVert(-.5, 0, -.5, c1, -1, 0, 0); pushVert(-.5, -.5, .5, c1, -1, 0, 0);
  pushVert(-.5, -.5, .5, c1, -1, 0, 0); pushVert(-.5, 0, -.5, c1, -1, 0, 0); pushVert(-.5, 0, .5, c1, -1, 0, 0);
  
  // 左面右上（楼梯台阶垂直面）
  pushVert(-.5, 0, .5, c1, -1, 0, 0); pushVert(-.5, .5, .5, c1, -1, 0, 0); pushVert(-.5, 0, .5, c1, -1, 0, 0);
  pushVert(-.5, 0, 0, c1, -1, 0, 0); pushVert(-.5, .5, 0, c1, -1, 0, 0); pushVert(-.5, .5, 0, c1, -1, 0, 0);
  
  // 左面左上（楼梯顶部）
  pushVert(-.5, 0, -.5, c1, -1, 0, 0); pushVert(-.5, .5, -.5, c1, -1, 0, 0); pushVert(-.5, 0, 0, c1, -1, 0, 0);
  pushVert(-.5, 0, 0, c1, -1, 0, 0); pushVert(-.5, .5, -.5, c1, -1, 0, 0); pushVert(-.5, .5, 0, c1, -1, 0, 0);
  
  // 右面下半
  pushVert(.5, -.5, -.5, c3, 1, 0, 0); pushVert(.5, 0, -.5, c3, 1, 0, 0); pushVert(.5, -.5, .5, c3, 1, 0, 0);
  pushVert(.5, -.5, .5, c3, 1, 0, 0); pushVert(.5, 0, -.5, c3, 1, 0, 0); pushVert(.5, 0, .5, c3, 1, 0, 0);
  
  // 右面后半（从楼梯顶部到后方）
  pushVert(.5, 0, -.5, c3, 1, 0, 0); pushVert(.5, .5, -.5, c3, 1, 0, 0); pushVert(.5, 0, 0, c3, 1, 0, 0);
  pushVert(.5, 0, 0, c3, 1, 0, 0); pushVert(.5, .5, -.5, c3, 1, 0, 0); pushVert(.5, .5, 0, c3, 1, 0, 0);
  
  // 顶面（楼梯台阶水平面）
  pushVert(-.5, 0, -.5, c2, 0, 1, 0); pushVert(.5, 0, -.5, c2, 0, 1, 0); pushVert(.5, 0, .5, c2, 0, 1, 0);
  pushVert(-.5, 0, -.5, c2, 0, 1, 0); pushVert(.5, 0, .5, c2, 0, 1, 0); pushVert(-.5, 0, .5, c2, 0, 1, 0);
  
  // 楼梯顶部水平面
  pushVert(-.5, .5, -.5, c2, 0, 1, 0); pushVert(.5, .5, -.5, c2, 0, 1, 0); pushVert(.5, .5, 0, c2, 0, 1, 0);
  pushVert(-.5, .5, -.5, c2, 0, 1, 0); pushVert(.5, .5, 0, c2, 0, 1, 0); pushVert(-.5, .5, 0, c2, 0, 1, 0);
  
  // 后面上半
  pushVert(-.5, 0, -.5, c2, 0, 0, -1); pushVert(.5, 0, -.5, c2, 0, 0, -1); pushVert(.5, .5, -.5, c2, 0, 0, -1);
  pushVert(-.5, 0, -.5, c2, 0, 0, -1); pushVert(.5, .5, -.5, c2, 0, 0, -1); pushVert(-.5, .5, -.5, c2, 0, 0, -1);
  
  // 楼梯台阶垂直面（朝上的面）
  pushVert(-.5, 0, 0, c1, 0, 0, -1); pushVert(.5, 0, 0, c1, 0, 0, -1); pushVert(.5, .5, 0, c1, 0, 0, -1);
  pushVert(-.5, 0, 0, c1, 0, 0, -1); pushVert(.5, .5, 0, c1, 0, 0, -1); pushVert(-.5, .5, 0, c1, 0, 0, -1);
  
  return new Float32Array(v);
}

// 半砖 - 高度为0.5的方块
function generateSlabVertices() {
  const v = [];
  const color = [0.7, 0.6, 0.5]; // 纯色渲染
  
  const pushVert = (x, y, z, nx=0, ny=0, nz=0) => {
    v.push(x, y, z, color[0], color[1], color[2], 0, 0, nx, ny, nz);
  };
  
  // 半砖的高度是0.5，所以y范围是-0.5到0
  
  // 底部
  pushVert(-0.5, -0.5, -0.5, 0, -1, 0); pushVert(0.5, -0.5, -0.5, 0, -1, 0); pushVert(0.5, -0.5, 0.5, 0, -1, 0);
  pushVert(-0.5, -0.5, -0.5, 0, -1, 0); pushVert(0.5, -0.5, 0.5, 0, -1, 0); pushVert(-0.5, -0.5, 0.5, 0, -1, 0);
  
  // 顶部
  pushVert(-0.5, 0, -0.5, 0, 1, 0); pushVert(0.5, 0, -0.5, 0, 1, 0); pushVert(0.5, 0, 0.5, 0, 1, 0);
  pushVert(-0.5, 0, -0.5, 0, 1, 0); pushVert(0.5, 0, 0.5, 0, 1, 0); pushVert(-0.5, 0, 0.5, 0, 1, 0);
  
  // 前面
  pushVert(-0.5, -0.5, -0.5, 0, 0, -1); pushVert(0.5, -0.5, -0.5, 0, 0, -1); pushVert(0.5, 0, -0.5, 0, 0, -1);
  pushVert(-0.5, -0.5, -0.5, 0, 0, -1); pushVert(0.5, 0, -0.5, 0, 0, -1); pushVert(-0.5, 0, -0.5, 0, 0, -1);
  
  // 后面
  pushVert(-0.5, -0.5, 0.5, 0, 0, 1); pushVert(0.5, -0.5, 0.5, 0, 0, 1); pushVert(0.5, 0, 0.5, 0, 0, 1);
  pushVert(-0.5, -0.5, 0.5, 0, 0, 1); pushVert(0.5, 0, 0.5, 0, 0, 1); pushVert(-0.5, 0, 0.5, 0, 0, 1);
  
  // 左面
  pushVert(-0.5, -0.5, -0.5, -1, 0, 0); pushVert(-0.5, -0.5, 0.5, -1, 0, 0); pushVert(-0.5, 0, 0.5, -1, 0, 0);
  pushVert(-0.5, -0.5, -0.5, -1, 0, 0); pushVert(-0.5, 0, 0.5, -1, 0, 0); pushVert(-0.5, 0, -0.5, -1, 0, 0);
  
  // 右面
  pushVert(0.5, -0.5, -0.5, 1, 0, 0); pushVert(0.5, -0.5, 0.5, 1, 0, 0); pushVert(0.5, 0, 0.5, 1, 0, 0);
  pushVert(0.5, -0.5, -0.5, 1, 0, 0); pushVert(0.5, 0, 0.5, 1, 0, 0); pushVert(0.5, 0, -0.5, 1, 0, 0);
  
  return new Float32Array(v);
}

// 旗帜 - 由3个cube组成
function generateBannerVertices() {
  const v = [];
  const brown = [0.6, 0.4, 0.2]; // 褐色
  const white = [0.9, 0.9, 0.9]; // 白色（用于材质部分）
  
  const pushVert = (x, y, z, color, u=0, vv=0, nx=0, ny=0, nz=0) => {
    v.push(x, y, z, color[0], color[1], color[2], u, vv, nx, ny, nz);
  };
  
  const pushCubeFace = (v1, v2, v3, v4, color, normal) => {
    // 三角形1: v1, v2, v3
    pushVert(v1[0], v1[1], v1[2], color, 0, 0, normal[0], normal[1], normal[2]);
    pushVert(v2[0], v2[1], v2[2], color, 1, 0, normal[0], normal[1], normal[2]);
    pushVert(v3[0], v3[1], v3[2], color, 1, 1, normal[0], normal[1], normal[2]);
    // 三角形2: v1, v3, v4
    pushVert(v1[0], v1[1], v1[2], color, 0, 0, normal[0], normal[1], normal[2]);
    pushVert(v3[0], v3[1], v3[2], color, 1, 1, normal[0], normal[1], normal[2]);
    pushVert(v4[0], v4[1], v4[2], color, 0, 1, normal[0], normal[1], normal[2]);
  };
  
  // cube1 (褐色)
  const c1 = [
    [0.128575, 0.33571425, 0.5464255],
    [0.228575, 0.33571425, 0.5464255],
    [0.228575, 0.33571425, -1.553565],
    [0.128575, 0.33571425, -1.553565],
    [0.128575, 0.23571425, 0.5464255],
    [0.228575, 0.23571425, 0.5464255],
    [0.228575, 0.23571425, -1.553565],
    [0.128575, 0.23571425, -1.553565]
  ];
  pushCubeFace(c1[4], c1[5], c1[1], c1[0], brown, [0, 1, 0]); // 顶部
  pushCubeFace(c1[0], c1[1], c1[2], c1[3], brown, [0, -1, 0]); // 底部
  pushCubeFace(c1[0], c1[4], c1[7], c1[3], brown, [1, 0, 0]); // 前面
  pushCubeFace(c1[1], c1[2], c1[6], c1[5], brown, [-1, 0, 0]); // 后面
  pushCubeFace(c1[0], c1[1], c1[5], c1[4], brown, [0, 0, 1]); // 右面
  pushCubeFace(c1[3], c1[7], c1[6], c1[2], brown, [0, 0, -1]); // 左面
  
  // cube2 (褐色)
  const c2 = [
    [0.678575, 0.33571425, -1.553565],
    [-0.321428, 0.33571425, -1.553565],
    [0.678575, 0.33571425, -1.653565],
    [-0.321428, 0.33571425, -1.653565],
    [0.678575, 0.23571425, -1.553565],
    [-0.321428, 0.23571425, -1.553565],
    [0.678575, 0.23571425, -1.653565],
    [-0.321428, 0.23571425, -1.653565]
  ];
  pushCubeFace(c2[4], c2[5], c2[1], c2[0], brown, [0, 1, 0]); // 顶部
  pushCubeFace(c2[0], c2[1], c2[3], c2[2], brown, [0, -1, 0]); // 底部
  pushCubeFace(c2[0], c2[4], c2[6], c2[2], brown, [1, 0, 0]); // 前面
  pushCubeFace(c2[1], c2[3], c2[7], c2[5], brown, [-1, 0, 0]); // 后面
  pushCubeFace(c2[0], c2[1], c2[5], c2[4], brown, [0, 0, 1]); // 右面
  pushCubeFace(c2[2], c2[6], c2[7], c2[3], brown, [0, 0, -1]); // 左面
  
const c3 = [
     [-0.321428, 0.108661415, 0.34293],
     [-0.321428, 0.158622865, 0.344893],
     [-0.321428, 0.187181, -1.6555275],
     [-0.321428, 0.2371425, -1.653565],
     [0.678575, 0.108661415, 0.34293],
     [0.678575, 0.158622865, 0.344893],
     [0.678575, 0.187181, -1.6555275],
     [0.678575, 0.2371425, -1.653565]
 ];
 // 顶面 Y+（四点共面，无扭曲）
 pushCubeFace(c3[0], c3[1], c3[5], c3[4], white, [0, 1, 0]);
 // 底面 Y-（四点共面，无扭曲）
 pushCubeFace(c3[2], c3[3], c3[7], c3[6], white, [0, -1, 0]);
 // 四个侧面 完整闭环封口
 pushCubeFace(c3[0], c3[2], c3[3], c3[1], white, [-1, 0, 0]); // 左侧
 pushCubeFace(c3[4], c3[5], c3[7], c3[6], white, [1, 0, 0]);  // 右侧
 pushCubeFace(c3[0], c3[4], c3[6], c3[2], white, [0, 0, 1]);  // 前侧
 pushCubeFace(c3[1], c3[3], c3[7], c3[5], white, [0, 0, -1]); // 后侧
  
  return new Float32Array(v);
}

// 生成旗帜线框
function generateBannerWireframe() {
  const v = [];
  
  const pushLine = (x1, y1, z1, x2, y2, z2) => {
    v.push(x1, y1, z1, x2, y2, z2);
  };
  
  // cube1
  const c1 = [
    [0.128575, 0.33571425, 0.5464255],
    [0.228575, 0.33571425, 0.5464255],
    [0.228575, 0.33571425, -1.553565],
    [0.128575, 0.33571425, -1.553565],
    [0.128575, 0.23571425, 0.5464255],
    [0.228575, 0.23571425, 0.5464255],
    [0.228575, 0.23571425, -1.553565],
    [0.128575, 0.23571425, -1.553565]
  ];
  pushLine(c1[0][0], c1[0][1], c1[0][2], c1[1][0], c1[1][1], c1[1][2]);
  pushLine(c1[1][0], c1[1][1], c1[1][2], c1[2][0], c1[2][1], c1[2][2]);
  pushLine(c1[2][0], c1[2][1], c1[2][2], c1[3][0], c1[3][1], c1[3][2]);
  pushLine(c1[3][0], c1[3][1], c1[3][2], c1[0][0], c1[0][1], c1[0][2]);
  pushLine(c1[4][0], c1[4][1], c1[4][2], c1[5][0], c1[5][1], c1[5][2]);
  pushLine(c1[5][0], c1[5][1], c1[5][2], c1[6][0], c1[6][1], c1[6][2]);
  pushLine(c1[6][0], c1[6][1], c1[6][2], c1[7][0], c1[7][1], c1[7][2]);
  pushLine(c1[7][0], c1[7][1], c1[7][2], c1[4][0], c1[4][1], c1[4][2]);
  pushLine(c1[0][0], c1[0][1], c1[0][2], c1[4][0], c1[4][1], c1[4][2]);
  pushLine(c1[1][0], c1[1][1], c1[1][2], c1[5][0], c1[5][1], c1[5][2]);
  pushLine(c1[2][0], c1[2][1], c1[2][2], c1[6][0], c1[6][1], c1[6][2]);
  pushLine(c1[3][0], c1[3][1], c1[3][2], c1[7][0], c1[7][1], c1[7][2]);
  
  // cube2
  const c2 = [
    [0.678575, 0.33571425, -1.553565],
    [-0.321428, 0.33571425, -1.553565],
    [0.678575, 0.33571425, -1.653565],
    [-0.321428, 0.33571425, -1.653565],
    [0.678575, 0.23571425, -1.553565],
    [-0.321428, 0.23571425, -1.553565],
    [0.678575, 0.23571425, -1.653565],
    [-0.321428, 0.23571425, -1.653565]
  ];
  pushLine(c2[0][0], c2[0][1], c2[0][2], c2[1][0], c2[1][1], c2[1][2]);
  pushLine(c2[1][0], c2[1][1], c2[1][2], c2[3][0], c2[3][1], c2[3][2]);
  pushLine(c2[3][0], c2[3][1], c2[3][2], c2[2][0], c2[2][1], c2[2][2]);
  pushLine(c2[2][0], c2[2][1], c2[2][2], c2[0][0], c2[0][1], c2[0][2]);
  pushLine(c2[4][0], c2[4][1], c2[4][2], c2[5][0], c2[5][1], c2[5][2]);
  pushLine(c2[5][0], c2[5][1], c2[5][2], c2[7][0], c2[7][1], c2[7][2]);
  pushLine(c2[7][0], c2[7][1], c2[7][2], c2[6][0], c2[6][1], c2[6][2]);
  pushLine(c2[6][0], c2[6][1], c2[6][2], c2[4][0], c2[4][1], c2[4][2]);
  pushLine(c2[0][0], c2[0][1], c2[0][2], c2[4][0], c2[4][1], c2[4][2]);
  pushLine(c2[1][0], c2[1][1], c2[1][2], c2[5][0], c2[5][1], c2[5][2]);
  pushLine(c2[2][0], c2[2][1], c2[2][2], c2[6][0], c2[6][1], c2[6][2]);
  pushLine(c2[3][0], c2[3][1], c2[3][2], c2[7][0], c2[7][1], c2[7][2]);
  
const c3 = [
    [-0.321428, 0.108661415, 0.34293],
    [-0.321428, 0.158622865, 0.344893],
    [-0.321428, 0.2371425, -1.653565],
    [-0.321428, 0.187181, -1.6555275],
    [0.678575, 0.108661415, 0.34293],
    [0.678575, 0.158622865, 0.344893],
    [0.678575, 0.2371425, -1.653565],
    [0.678575, 0.187181, -1.6555275]
];

// 左侧面 正确矩形连线（修复交叉扭曲）
pushLine(c3[0][0], c3[0][1], c3[0][2], c3[1][0], c3[1][1], c3[1][2]);
pushLine(c3[1][0], c3[1][1], c3[1][2], c3[2][0], c3[2][1], c3[2][2]);
pushLine(c3[2][0], c3[2][1], c3[2][2], c3[3][0], c3[3][1], c3[3][2]);
pushLine(c3[3][0], c3[3][1], c3[3][2], c3[0][0], c3[0][1], c3[0][2]);

// 右侧面 原有连线本身正确，保留不变
pushLine(c3[4][0], c3[4][1], c3[4][2], c3[5][0], c3[5][1], c3[5][2]);
pushLine(c3[5][0], c3[5][1], c3[5][2], c3[6][0], c3[6][1], c3[6][2]);
pushLine(c3[6][0], c3[6][1], c3[6][2], c3[7][0], c3[7][1], c3[7][2]);
pushLine(c3[7][0], c3[7][1], c3[7][2], c3[4][0], c3[4][1], c3[4][2]);

// 前后四条棱线 完整闭合长方体线框
pushLine(c3[0][0], c3[0][1], c3[0][2], c3[4][0], c3[4][1], c3[4][2]);
pushLine(c3[1][0], c3[1][1], c3[1][2], c3[5][0], c3[5][1], c3[5][2]);
pushLine(c3[2][0], c3[2][1], c3[2][2], c3[6][0], c3[6][1], c3[6][2]);
pushLine(c3[3][0], c3[3][1], c3[3][2], c3[7][0], c3[7][1], c3[7][2]);
  
  return new Float32Array(v);
}

// ============ Molang ============
class MolangLexer {
  constructor(code) { this.code = code; this.pos = 0; this.tokens = []; this.error = null; }
  tokenize() {
    try {
      while (this.pos < this.code.length) {
        this.skipWhitespace();
        if (this.pos >= this.code.length) break;
        const char = this.code[this.pos];
        if (/[\d.]/.test(char)) { this.tokens.push(this.readNumber()); continue; }
        if (/[a-zA-Z_]/.test(char)) { this.tokens.push(this.readIdentifier()); continue; }
        if (char === '=' && this.code[this.pos + 1] === '=') { this.tokens.push({ type: 'OP', value: '==' }); this.pos += 2; }
        else if (char === '!' && this.code[this.pos + 1] === '=') { this.tokens.push({ type: 'OP', value: '!=' }); this.pos += 2; }
        else if (char === '>' && this.code[this.pos + 1] === '=') { this.tokens.push({ type: 'OP', value: '>=' }); this.pos += 2; }
        else if (char === '<' && this.code[this.pos + 1] === '=') { this.tokens.push({ type: 'OP', value: '<=' }); this.pos += 2; }
        else if (char === '?' && this.code[this.pos + 1] === '?') { this.tokens.push({ type: 'OP', value: '??' }); this.pos += 2; }
        else if (char === '?' && this.code[this.pos + 1] === '{') { this.tokens.push({ type: 'OP', value: '?{' }); this.pos += 2; }
        else if (char === '&' && this.code[this.pos + 1] === '&') { this.tokens.push({ type: 'OP', value: '&&' }); this.pos += 2; }
        else if (char === '|' && this.code[this.pos + 1] === '|') { this.tokens.push({ type: 'OP', value: '||' }); this.pos += 2; }
        else if ('+-*/=<>&|?:;{},()'.includes(char)) { this.tokens.push({ type: 'OP', value: char }); this.pos++; }
        else { this.pos++; }
      }
      return this.tokens;
    } catch (e) { this.error = e.message; return null; }
  }
  skipWhitespace() { while (this.pos < this.code.length && /\s/.test(this.code[this.pos])) this.pos++; }
  readNumber() {
    let start = this.pos, hasDot = false;
    while (this.pos < this.code.length && /[\d.]/.test(this.code[this.pos])) {
      if (this.code[this.pos] === '.') { if (hasDot) break; hasDot = true; }
      this.pos++;
    }
    const num = parseFloat(this.code.slice(start, this.pos));
    if (isNaN(num)) throw new Error(`Invalid number at position ${start}`);
    return { type: 'NUM', value: num };
  }
  readIdentifier() {
    let start = this.pos;
    while (this.pos < this.code.length && /[a-zA-Z0-9_.]/.test(this.code[this.pos])) this.pos++;
    return { type: 'ID', value: this.code.slice(start, this.pos) };
  }
}

class MolangExecutor {
  constructor(model) {
    this.model = model; this.localVars = model.molangVars || {};
    this.shouldBreak = false; this.shouldContinue = false; this.returnValue = null; this.error = null;
    this.isAssigningRightSide = false; // 标志位：是否在计算赋值操作的右边
    this.isInNullCoalesceLeft = false; // 标志位：是否在空值合并符的左边
  }
  getVar(name) {
    if (name.startsWith('v.')) {
      const varName = name.slice(2);
      if (this.model.varData[varName]) return this.model.varData[varName].value;
      return this.localVars[varName] ?? null;
    } else if (name.startsWith('t.')) return globalVars[name.slice(2)] ?? null;
    return null;
  }
  setVar(name, value) {
    if (name.startsWith('v.')) {
      const varName = name.slice(2);
      if (!this.model.varData[varName]) {
        // 如果变量不存在，创建它
        this.model.varData[varName] = { name: varName, value: 0, init: 0 };
      }
      this.model.varData[varName].value = value;
      // 更新自定义变量显示
      updateCustomVarsDisplay();
    } else if (name.startsWith('t.')) globalVars[name.slice(2)] = value;
  }
  execute(tokens) {
    try {
      this.tokens = tokens; this.pos = 0;
      this.shouldBreak = false; this.shouldContinue = false; this.returnValue = null;
      while (this.pos < this.tokens.length && this.returnValue === null) {
        this.executeStatement();
        if (this.shouldBreak || this.shouldContinue) break;
      }
      return this.returnValue;
    } catch (e) { this.error = e.message; return null; }
  }
  executeStatement() {
    if (this.pos >= this.tokens.length) return;
    const token = this.tokens[this.pos];
    if (token.type === 'ID' && token.value === 'loop') { this.executeLoop(); return; }
    if (token.type === 'ID' && token.value === 'break') { this.shouldBreak = true; this.pos++; return; }
    if (token.type === 'ID' && token.value === 'continue') { this.shouldContinue = true; this.pos++; return; }
    if (token.type === 'ID' && token.value === 'return') { this.pos++; this.returnValue = this.evaluateExpression(); return; }
    this.evaluateExpression();
  }
  executeLoop() {
    this.pos += 2;
    const count = this.evaluateExpression();
    if (typeof count !== 'number') throw new Error('Loop count must be a number');
    this.pos++; this.pos++;
    const loopStart = this.pos;
    let braceCount = 1;
    while (this.pos < this.tokens.length && braceCount > 0) {
      if (this.tokens[this.pos].value === '{') braceCount++;
      else if (this.tokens[this.pos].value === '}') braceCount--;
      this.pos++;
    }
    const loopEnd = this.pos - 1;
    for (let i = 0; i < count; i++) {
      this.pos = loopStart; this.shouldBreak = false; this.shouldContinue = false;
      while (this.pos < loopEnd && !this.shouldBreak && !this.shouldContinue) this.executeStatement();
      if (this.shouldBreak) { this.shouldBreak = false; break; }
      if (this.shouldContinue) { this.shouldContinue = false; continue; }
    }
  }
  evaluateExpression() { 
    // 先检查是否是赋值操作（优先级最低）
    if (this.pos + 1 < this.tokens.length && 
        this.tokens[this.pos].type === 'ID' && 
        this.tokens[this.pos + 1].value === '=') {
      const varName = this.tokens[this.pos].value;
      this.pos += 2;
      // 设置标志位：在计算赋值右边时，未定义的变量返回 null 而不是 0
      const prevIsAssigning = this.isAssigningRightSide;
      this.isAssigningRightSide = true;
      const newValue = this.evaluateExpression();
      this.isAssigningRightSide = prevIsAssigning;
      this.setVar(varName, newValue);
      return newValue;
    }
    return this.evaluateTernary(); 
  }
  evaluateTernary() {
    let left = this.evaluateOr();
    if (this.pos < this.tokens.length && this.tokens[this.pos].value === '?') {
      this.pos++; const trueExpr = this.evaluateExpression(); this.pos++; const falseExpr = this.evaluateExpression();
      return left ? trueExpr : falseExpr;
    }
    if (this.pos < this.tokens.length && this.tokens[this.pos].value === '?{') {
      this.pos++;
      if (left) this.evaluateExpression();
      else { let braceCount = 1; while (this.pos < this.tokens.length && braceCount > 0) { if (this.tokens[this.pos].value === '{') braceCount++; else if (this.tokens[this.pos].value === '}') braceCount--; this.pos++; } }
      return left;
    }
    return left;
  }
  evaluateOr() { let left = this.evaluateAnd(); while (this.pos < this.tokens.length && this.tokens[this.pos].value === '||') { this.pos++; const right = this.evaluateAnd(); left = left || right; } return left; }
  evaluateAnd() { let left = this.evaluateEquality(); while (this.pos < this.tokens.length && this.tokens[this.pos].value === '&&') { this.pos++; const right = this.evaluateEquality(); left = left && right; } return left; }
  evaluateEquality() { let left = this.evaluateComparison(); while (this.pos < this.tokens.length && ['==', '!='].includes(this.tokens[this.pos].value)) { const op = this.tokens[this.pos].value; this.pos++; const right = this.evaluateComparison(); left = op === '==' ? left == right : left != right; } return left; }
  evaluateComparison() {
    let left = this.evaluateNullCoalesce();
    while (this.pos < this.tokens.length && ['<', '>', '<=', '>='].includes(this.tokens[this.pos].value)) {
      const op = this.tokens[this.pos].value; this.pos++; const right = this.evaluateNullCoalesce();
      switch (op) { case '<': left = left < right; break; case '>': left = left > right; break; case '<=': left = left <= right; break; case '>=': left = left >= right; break; }
    }
    return left;
  }
  evaluateNullCoalesce() { 
    // 设置标志位，告诉 evaluatePrimary 我们在空值合并符的左边，需要返回 null
    const prevIsInNullCoalesceLeft = this.isInNullCoalesceLeft;
    this.isInNullCoalesceLeft = true;
    let left = this.evaluateAdditive(); 
    this.isInNullCoalesceLeft = prevIsInNullCoalesceLeft;
    
    if (this.pos < this.tokens.length && this.tokens[this.pos].value === '??') { 
      this.pos++; 
      const right = this.evaluateNullCoalesce(); 
      return left !== null ? left : right; 
    } 
    return left; 
  }
  evaluateAdditive() { let left = this.evaluateMultiplicative(); while (this.pos < this.tokens.length && ['+', '-'].includes(this.tokens[this.pos].value)) { const op = this.tokens[this.pos].value; this.pos++; const right = this.evaluateMultiplicative(); left = op === '+' ? left + right : left - right; } return left; }
  evaluateMultiplicative() { let left = this.evaluateUnary(); while (this.pos < this.tokens.length && ['*', '/'].includes(this.tokens[this.pos].value)) { const op = this.tokens[this.pos].value; this.pos++; const right = this.evaluateUnary(); left = op === '*' ? left * right : left / right; } return left; }
  evaluateUnary() { if (this.pos < this.tokens.length && this.tokens[this.pos].value === '!') { this.pos++; return !this.evaluateUnary(); } if (this.pos < this.tokens.length && this.tokens[this.pos].value === '-') { this.pos++; return -this.evaluateUnary(); } return this.evaluatePrimary(); }
  evaluatePrimary() {
    const token = this.tokens[this.pos];
    if (!token) return null;
    if (token.type === 'NUM') { this.pos++; return token.value; }
    if (token.type === 'ID') {
      if (this.pos + 1 < this.tokens.length && this.tokens[this.pos + 1].value === '(') return this.evaluateFunction();
      // 正常获取变量值
      this.pos++;
      const value = this.getVar(token.value);
      // 变量未定义时，只有不在赋值右边也不在空值合并符左边时才返回0
      if (value === null && (token.value.startsWith('v.') || token.value.startsWith('t.')) && !this.isAssigningRightSide && !this.isInNullCoalesceLeft) {
        return 0;
      }
      return value;
    }
    if (token.value === '(') { this.pos++; const value = this.evaluateExpression(); if (this.tokens[this.pos] && this.tokens[this.pos].value === ')') this.pos++; return value; }
    this.pos++; return null;
  }
  evaluateFunction() {
    const funcName = this.tokens[this.pos].value; this.pos += 2;
    const args = [];
    while (this.pos < this.tokens.length && this.tokens[this.pos].value !== ')') { args.push(this.evaluateExpression()); if (this.tokens[this.pos] && this.tokens[this.pos].value === ',') this.pos++; }
    this.pos++;
    if (funcName.startsWith('math.')) {
      const mathFunc = funcName.slice(5);
      switch (mathFunc) {
        case 'sin': return Math.sin(args[0] * deg); case 'cos': return Math.cos(args[0] * deg); case 'tan': return Math.tan(args[0] * deg);
        case 'asin': return Math.asin(args[0]) * rad; case 'acos': return Math.acos(args[0]) * rad; case 'atan': return Math.atan(args[0]) * rad; case 'atan2': return Math.atan2(args[0], args[1]) * rad;
        case 'abs': return Math.abs(args[0]); case 'sqrt': return Math.sqrt(args[0]); case 'pow': return Math.pow(args[0], args[1]);
        case 'min': return Math.min(...args); case 'max': return Math.max(...args);
        case 'floor': return Math.floor(args[0]); case 'ceil': return Math.ceil(args[0]); case 'round': return Math.round(args[0]);
        case 'random': return Math.random(); case 'pi': return 180; case 'rad': return args[0] * deg; case 'deg': return args[0] * rad;
        default: return 0;
      }
    }
    return 0;
  }
}

// ============ 模型管理 ============
function createModel(texName = "diamond_block", modelType = 'block', customColor = '#ffffff') {
  const id = ++modelCounter;
  const model = {
    id: id, name: `模型${id}`, texName: texName, modelType: modelType,
    varData: {}, molangVars: {}, molangCode: '', originalValues: {}, hasError: false, errorMsg: '', customColor: customColor,
    presetAnimations: [] // 每个模型独立的预设动画
  };
  varDefsTemplate.forEach(d => { model.varData[d.name] = { ...d, value: d.init }; model.originalValues[d.name] = d.init; });
  models.push(model); activeModelId = id; hasUnsavedChanges = true;
  renderModelList(); renderControlPage(); renderAnimationPage(); updateCmdOutput(); draw();
  return model;
}

function deleteModel(id) {
  showConfirm('确认删除', '确定要删除这个模型吗？', () => {
    const idx = models.findIndex(m => m.id === id);
    if (idx === -1) return;
    models.splice(idx, 1);
    if (activeModelId === id) activeModelId = models.length > 0 ? models[models.length - 1].id : null;
    modelGroups.forEach(group => {
      const groupIdx = group.modelIds.indexOf(id);
      if (groupIdx > -1) group.modelIds.splice(groupIdx, 1);
    });
    hasUnsavedChanges = true;
    renderModelList(); renderControlPage(); renderAnimationPage(); updateCmdOutput(); draw();
  });
}

// ============ 模型组功能 ============
function showCreateGroupModal() {
  const modal = document.getElementById('createGroupModal');
  const groupModelList = document.getElementById('groupModelList');
  
  if (models.length === 0) {
    groupModelList.innerHTML = '<div class="empty-state">暂无模型</div>';
  } else {
    groupModelList.innerHTML = models.map(model => {
      // 检查模型是否已经在某个模型组中
      const isInGroup = modelGroups.some(g => g.modelIds.includes(model.id));
      return `
        <div class="save-item" data-id="${model.id}" style="display: flex; justify-content: space-between; align-items: center;">
          <span>${model.name}${isInGroup ? ' (已在模型组中)' : ''}</span>
          <input type="checkbox" class="group-model-checkbox" data-id="${model.id}" ${isInGroup ? 'disabled' : ''}>
        </div>
      `;
    }).join('');
  }
  
  modal.classList.add('active');
}

function hideCreateGroupModal() {
  document.getElementById('createGroupModal').classList.remove('active');
}

function showCopyModelModal(modelId) {
  const modal = document.getElementById('copyModelModal');
  const model = models.find(m => m.id === modelId);
  if (model) document.getElementById('copyModelName').value = `${model.name} 副本`;
  document.getElementById('copyMolangCheckbox').checked = false;
  currentCopyModelId = modelId;
  modal.classList.add('active');
}

function hideCopyModelModal() {
  document.getElementById('copyModelModal').classList.remove('active');
  currentCopyModelId = null;
}

function showCopyGroupModal(groupId) {
  const modal = document.getElementById('copyGroupModal');
  const group = modelGroups.find(g => g.id === groupId);
  if (group) document.getElementById('copyGroupName').value = `${group.name} 副本`;
  currentCopyGroupId = groupId;
  modal.classList.add('active');
}

function hideCopyGroupModal() {
  document.getElementById('copyGroupModal').classList.remove('active');
  currentCopyGroupId = null;
}

function copyModel() {
  if (!currentCopyModelId) return;
  
  const model = models.find(m => m.id === currentCopyModelId);
  if (!model) return;
  
  const newName = document.getElementById('copyModelName').value.trim() || `${model.name} 副本`;
  const copyMolang = !document.getElementById('copyMolangCheckbox').checked;
  
  const newModel = {
    id: ++modelCounter, name: newName, texName: model.texName, modelType: model.modelType,
    varData: {}, molangVars: {}, molangCode: copyMolang ? model.molangCode : '',
    originalValues: {}, hasError: false, errorMsg: '', customColor: model.customColor || '#ff0000'
  };
  
  Object.keys(model.varData).forEach(key => {
    newModel.varData[key] = { ...model.varData[key] };
    newModel.originalValues[key] = model.varData[key].value;
  });
  
  if (copyMolang) Object.keys(model.molangVars).forEach(key => { newModel.molangVars[key] = model.molangVars[key]; });
  
  models.push(newModel);
  activeModelId = newModel.id;
  hasUnsavedChanges = true;
  hideCopyModelModal();
  renderModelList(); renderControlPage(); renderAnimationPage(); updateCmdOutput(); draw();
}

function copyGroup() {
  if (!currentCopyGroupId) return;
  
  const group = modelGroups.find(g => g.id === currentCopyGroupId);
  if (!group) return;
  
  const newName = document.getElementById('copyGroupName').value.trim() || `${group.name} 副本`;
  
  // 计算复制代数
  let copyGeneration = 1;
  const existingGroups = modelGroups.filter(g => g.name.includes('#'));
  existingGroups.forEach(g => {
    const match = g.name.match(/#(\d+)$/);
    if (match) {
      const gen = parseInt(match[1]);
      if (gen >= copyGeneration) {
        copyGeneration = gen + 1;
      }
    }
  });
  
  // 复制模型组内的所有模型
  const newModelIds = [];
  group.modelIds.forEach(modelId => {
    const originalModel = models.find(m => m.id === modelId);
    if (originalModel) {
      // 创建模型副本
      const newModel = {
        id: ++modelCounter, 
        name: `${originalModel.name} #${copyGeneration}`,
        texName: originalModel.texName, 
        modelType: originalModel.modelType,
        varData: {}, 
        molangVars: {}, 
        molangCode: originalModel.molangCode,
        originalValues: {}, 
        hasError: false, 
        errorMsg: '', 
        customColor: originalModel.customColor || '#ff0000'
      };
      
      // 复制变量数据
      Object.keys(originalModel.varData).forEach(key => {
        newModel.varData[key] = { ...originalModel.varData[key] };
        newModel.originalValues[key] = originalModel.varData[key].value;
      });
      
      // 复制Molang变量
      Object.keys(originalModel.molangVars).forEach(key => {
        newModel.molangVars[key] = originalModel.molangVars[key];
      });
      
      models.push(newModel);
      newModelIds.push(newModel.id);
    }
  });
  
  // 创建新模型组
  const newGroup = {
    id: ++groupCounter, 
    name: newName,
    modelIds: newModelIds,
    varData: { 
      xpos: { name: 'xpos', value: group.varData.xpos.value, init: 0 }, 
      ypos: { name: 'ypos', value: group.varData.ypos.value, init: 0 }, 
      zpos: { name: 'zpos', value: group.varData.zpos.value, init: 0 }, 
      xrot: { name: 'xrot', value: group.varData.xrot.value, init: 0 }, 
      yrot: { name: 'yrot', value: group.varData.yrot.value, init: 0 }, 
      zrot: { name: 'zrot', value: group.varData.zrot.value, init: 0 }, 
      scale: { name: 'scale', value: group.varData.scale.value, init: 1 },
      xbasepos: { name: 'xbasepos', value: group.varData.xbasepos?.value || 0, init: 0 },
      ybasepos: { name: 'ybasepos', value: group.varData.ybasepos?.value || 0, init: 0 },
      zbasepos: { name: 'zbasepos', value: group.varData.zbasepos?.value || 0, init: 0 }
    }
  };
  
  modelGroups.push(newGroup);
  activeGroupId = newGroup.id;
  hasUnsavedChanges = true;
  hideCopyGroupModal();
  renderModelList(); 
  renderControlPage(); 
  renderAnimationPage(); 
  updateCmdOutput(); 
  draw();
}

function createModelGroup() {
  const name = document.getElementById('groupNameInput').value.trim();
  if (!name) { alert('请输入模型组名称'); return; }
  
  const checkboxes = document.querySelectorAll('.group-model-checkbox:checked');
  const modelIds = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
  
  if (modelIds.length === 0) { alert('请至少选择一个模型'); return; }
  
  modelIds.forEach(modelId => {
    const model = models.find(m => m.id === modelId);
    if (model) {
      model.originalValues = {};
      Object.keys(model.varData).forEach(key => { model.originalValues[key] = model.varData[key].value; });
    }
  });
  
  const group = {
    id: ++groupCounter, name: name, modelIds: modelIds,
    varData: { 
      xpos: { name: 'xpos', value: 0, init: 0 }, 
      ypos: { name: 'ypos', value: 0, init: 0 }, 
      zpos: { name: 'zpos', value: 0, init: 0 }, 
      xrot: { name: 'xrot', value: 0, init: 0 }, 
      yrot: { name: 'yrot', value: 0, init: 0 }, 
      zrot: { name: 'zrot', value: 0, init: 0 }, 
      scale: { name: 'scale', value: 1, init: 1 },
      xbasepos: { name: 'xbasepos', value: 0, init: 0 },
      ybasepos: { name: 'ybasepos', value: 0, init: 0 },
      zbasepos: { name: 'zbasepos', value: 0, init: 0 }
    }
  };
  
  modelGroups.push(group);
  hasUnsavedChanges = true;
  hideCreateGroupModal();
  renderModelList();
}

function deleteModelGroup() {
  if (!activeGroupId) { alert('请先选择一个模型组'); return; }
  
  showConfirm('确认删除', '确定要删除这个模型组吗？', () => {
    const idx = modelGroups.findIndex(g => g.id === activeGroupId);
    if (idx > -1) {
      modelGroups.splice(idx, 1);
      expandedGroups.delete(activeGroupId);
      activeGroupId = null;
      hasUnsavedChanges = true;
      renderModelList(); renderControlPage(); renderAnimationPage(); updateCmdOutput(); draw();
    }
  });
}

// 计算向量的模长
function vectorMagnitude(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}

// 向量归一化
function normalizeVector(x, y, z) {
  const mag = vectorMagnitude(x, y, z);
  if (mag === 0) return { x: 0, y: 0, z: 0 };
  return { x: x / mag, y: y / mag, z: z / mag };
}

function updateGroupValue(groupId, varName, value) {
  const event = window.event;
  const group = modelGroups.find(g => g.id === groupId);
  if (group) {
    // 如果变量不存在，创建它
    if (!group.varData[varName]) {
      group.varData[varName] = { name: varName, value: 0, min: getVarMin(varName), max: getVarMax(varName), step: getVarStep(varName) };
    }
    
    // 允许用户输入小数点
    if (value === '.') {
      // 保留小数点输入
      const numInput = document.getElementById(varName + 'N');
      if (numInput) numInput.value = '.';
      return;
    }
    
    let parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) return; // 如果不是有效数字，不更新
    
    const minVal = getVarMin(varName);
    const maxVal = getVarMax(varName);
    
    // 只有滑块变化时才应用最大最小值限制，文本框输入不受限制
    if (event.target.type === 'range') {
      parsedValue = Math.max(minVal, Math.min(maxVal, parsedValue));
    }
    
    // 记录变化前的basepos值用于计算差值
    const oldBasepos = {
      x: group.varData.xbasepos?.value || 0,
      y: group.varData.ybasepos?.value || 0,
      z: group.varData.zbasepos?.value || 0
    };
    
    group.varData[varName].value = parsedValue;
    hasUnsavedChanges = true;
    

    
    // 计算新的basepos
    const newBasepos = {
      x: group.varData.xbasepos?.value || 0,
      y: group.varData.ybasepos?.value || 0,
      z: group.varData.zbasepos?.value || 0
    };
    
    const groupDelta = {
      x: newBasepos.x - oldBasepos.x,
      y: newBasepos.y - oldBasepos.y,
      z: newBasepos.z - oldBasepos.z
    };
    
    // 计算模型组basepos向量（归一化）
    const groupVector = normalizeVector(groupDelta.x, groupDelta.y, groupDelta.z);
    const groupDeltaMag = vectorMagnitude(groupDelta.x, groupDelta.y, groupDelta.z);
    
    // 更新组内所有模型的basepos
    if (groupDeltaMag > 0.01) { // 忽略微小变化，避免抖动
      
      group.modelIds.forEach(modelId => {
        const model = models.find(m => m.id === modelId);
        console.log(`处理模型ID: ${modelId}，找到模型: ${!!model}`);
        
        if (model) {
          console.log(`模型 ${model.id} 存在varData: ${!!model.varData}`);
          console.log(`模型 ${model.id} 存在xbasepos: ${!!model.varData.xbasepos}`);
          
          // 获取模型当前的basepos向量
          const modelBasepos = {
            x: model.varData.xbasepos?.value || 0,
            y: model.varData.ybasepos?.value || 0,
            z: model.varData.zbasepos?.value || 0
          };
          
          // 计算模型basepos向量的模长
          const modelMag = vectorMagnitude(modelBasepos.x, modelBasepos.y, modelBasepos.z);
          
          // 计算新的模型basepos向量
          let newModelBasepos;
          if (modelMag === 0) {
            // 模型没有basepos，直接应用模型组的变化量
            newModelBasepos = {
              x: modelBasepos.x + groupDelta.x,
              y: modelBasepos.y + groupDelta.y,
              z: modelBasepos.z + groupDelta.z
            };

          } else {
            // 直接应用模型组的变化量，保持相对位置不变
            newModelBasepos = {
              x: modelBasepos.x + groupDelta.x,
              y: modelBasepos.y + groupDelta.y,
              z: modelBasepos.z + groupDelta.z
            };

          }
          
          // 确保模型有basepos变量
          if (!model.varData.xbasepos) {
            model.varData.xbasepos = { name: 'xbasepos', value: 0, init: 0 };
          }
          if (!model.varData.ybasepos) {
            model.varData.ybasepos = { name: 'ybasepos', value: 0, init: 0 };
          }
          if (!model.varData.zbasepos) {
            model.varData.zbasepos = { name: 'zbasepos', value: 0, init: 0 };
          }
          
          // 更新模型basepos
          const oldX = model.varData.xbasepos.value;
          const oldY = model.varData.ybasepos.value;
          const oldZ = model.varData.zbasepos.value;
          
          model.varData.xbasepos.value = newModelBasepos.x;
          model.varData.ybasepos.value = newModelBasepos.y;
          model.varData.zbasepos.value = newModelBasepos.z;
          

        }
      });
    }
      
      // 在滑动条变化时更新输入框的值
      if (event.target.type === 'range') {
        const numInput = document.getElementById(varName + 'N');
        if (numInput) numInput.value = parsedValue;
      }
      
      // 只在输入框变化时重新渲染页面，避免滑动条断触
      if (event.target.type === 'number') {
        renderControlPage();
      }
    
    // 处理模型组basepos变化
    if (varName.startsWith('basepos')) {
      // 计算basepos变化量
      const newBasepos = {
        x: group.varData.xbasepos?.value || 0,
        y: group.varData.ybasepos?.value || 0,
        z: group.varData.zbasepos?.value || 0
      };
      
      const groupDelta = {
        x: newBasepos.x - oldBasepos.x,
        y: newBasepos.y - oldBasepos.y,
        z: newBasepos.z - oldBasepos.z
      };
      
      // 计算模型组basepos向量（归一化）
      const groupVector = normalizeVector(groupDelta.x, groupDelta.y, groupDelta.z);
      const groupDeltaMag = vectorMagnitude(groupDelta.x, groupDelta.y, groupDelta.z);
      
      console.log(`模型组basepos向量计算:`);
      console.log(`  变化量: x=${groupDelta.x.toFixed(2)}, y=${groupDelta.y.toFixed(2)}, z=${groupDelta.z.toFixed(2)}`);
      console.log(`  归一化向量: x=${groupVector.x.toFixed(2)}, y=${groupVector.y.toFixed(2)}, z=${groupVector.z.toFixed(2)}`);
      console.log(`  模长: ${groupDeltaMag.toFixed(2)}`);
      console.log(`  组内模型数量: ${group.modelIds.length}`);
      
      // 更新组内所有模型的basepos
      console.log(`开始更新组内模型basepos，共${group.modelIds.length}个模型`);
      console.log(`groupDeltaMag: ${groupDeltaMag.toFixed(2)}`);
      if (groupDeltaMag > 0.01) { // 忽略微小变化，避免抖动
        
        group.modelIds.forEach(modelId => {
          const model = models.find(m => m.id === modelId);
          if (model) {
            
            // 获取模型当前的basepos向量
            const modelBasepos = {
              x: model.varData.xbasepos?.value || 0,
              y: model.varData.ybasepos?.value || 0,
              z: model.varData.zbasepos?.value || 0
            };
            
            // 计算模型basepos向量的模长
            const modelMag = vectorMagnitude(modelBasepos.x, modelBasepos.y, modelBasepos.z);
            
            // 计算新的模型basepos向量
            let newModelBasepos;
            if (modelMag === 0) {
              // 模型没有basepos，直接应用模型组的变化量
              newModelBasepos = {
                x: modelBasepos.x + groupDelta.x,
                y: modelBasepos.y + groupDelta.y,
                z: modelBasepos.z + groupDelta.z
              };
              console.log(`模型 ${model.id} 初始basepos为0，直接应用组变化量: x=${groupDelta.x.toFixed(2)}, y=${groupDelta.y.toFixed(2)}, z=${groupDelta.z.toFixed(2)}`);
            } else {
              // 归一化模型basepos向量，保持方向不变
              const modelVector = normalizeVector(modelBasepos.x, modelBasepos.y, modelBasepos.z);
              // 计算新的模长：原模长 + 模型组变化量的模长
              const groupDeltaMag = vectorMagnitude(groupDelta.x, groupDelta.y, groupDelta.z);
              const newModelMag = modelMag + groupDeltaMag;
              newModelBasepos = {
                x: modelVector.x * newModelMag,
                y: modelVector.y * newModelMag,
                z: modelVector.z * newModelMag
              };
              console.log(`模型 ${model.id} 保持方向不变，原模长: ${modelMag.toFixed(2)}，新模长: ${newModelMag.toFixed(2)}`);
            }
            
            // 确保模型有basepos变量
            if (!model.varData.xbasepos) {
              model.varData.xbasepos = { name: 'xbasepos', value: 0, init: 0 };
              console.log(`为模型 ${model.id} 创建xbasepos变量`);
            }
            if (!model.varData.ybasepos) {
              model.varData.ybasepos = { name: 'ybasepos', value: 0, init: 0 };
              console.log(`为模型 ${model.id} 创建ybasepos变量`);
            }
            if (!model.varData.zbasepos) {
              model.varData.zbasepos = { name: 'zbasepos', value: 0, init: 0 };
              console.log(`为模型 ${model.id} 创建zbasepos变量`);
            }
            
            // 更新模型basepos
            const oldX = model.varData.xbasepos.value;
            const oldY = model.varData.ybasepos.value;
            const oldZ = model.varData.zbasepos.value;
            
            model.varData.xbasepos.value = newModelBasepos.x;
            model.varData.ybasepos.value = newModelBasepos.y;
            model.varData.zbasepos.value = newModelBasepos.z;
            
            // 输出每个方块的变化
            console.log(`模型 ${model.id} (${model.name}) basepos变化:`);
            console.log(`  变化前: x=${oldX.toFixed(2)}, y=${oldY.toFixed(2)}, z=${oldZ.toFixed(2)}`);
            console.log(`  变化后: x=${newModelBasepos.x.toFixed(2)}, y=${newModelBasepos.y.toFixed(2)}, z=${newModelBasepos.z.toFixed(2)}`);
            console.log(`  变化量: x=${(newModelBasepos.x - oldX).toFixed(2)}, y=${(newModelBasepos.y - oldY).toFixed(2)}, z=${(newModelBasepos.z - oldZ).toFixed(2)}`);
          }
        });
        
        // 重置模型组basepos为0，因为变化已经应用到所有模型
        group.varData.xbasepos.value = 0;
        group.varData.ybasepos.value = 0;
        group.varData.zbasepos.value = 0;
        
        // 更新UI显示
        if (event.target.type === 'range') {
          const xInput = document.getElementById('xbaseposN');
          const yInput = document.getElementById('ybaseposN');
          const zInput = document.getElementById('zbaseposN');
          const xRange = document.getElementById('xbaseposR');
          const yRange = document.getElementById('ybaseposR');
          const zRange = document.getElementById('zbaseposR');
          if (xInput) xInput.value = 0;
          if (yInput) yInput.value = 0;
          if (zInput) zInput.value = 0;
          if (xRange) xRange.value = 0;
          if (yRange) yRange.value = 0;
          if (zRange) zRange.value = 0;
        }
        
        // 重新渲染控制页面确保UI同步
        renderControlPage();
      }
    }
    
    updateCmdOutput();
    draw();
  }
}

function resetGroupValue(groupId, varName) {
  const group = modelGroups.find(g => g.id === groupId);
  if (group) {
    const def = varDefsTemplate.find(d => d.name === varName);
    const initValue = def ? def.init : 0;
    // 如果变量不存在，创建它
    if (!group.varData[varName]) {
      group.varData[varName] = { name: varName, value: initValue, min: getVarMin(varName), max: getVarMax(varName), step: getVarStep(varName), init: initValue };
    } else {
      group.varData[varName].value = initValue;
    }
    hasUnsavedChanges = true;
    renderControlPage();
    updateCmdOutput();
    draw();
  }
}

function selectModel(id) {
  activeModelId = id; activeGroupId = null;
  renderModelList(); renderControlPage(); renderAnimationPage();
  const model = models.find(m => m.id === id);
  if (model) {
    document.getElementById('defaultTex').value = model.texName;
    document.querySelectorAll('.model-type-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.type === model.modelType));
    currentModelType = model.modelType;
    // 同步模型列表区的颜色选择器
    const defaultColorPicker = document.getElementById('defaultCustomColor');
    if (defaultColorPicker) {
      if (model.texName === 'custom_color') {
        defaultColorPicker.style.display = 'block';
        defaultColorPicker.value = model.customColor || '#ffffff';
      } else {
        defaultColorPicker.style.display = 'none';
      }
    }
    // 如果模型使用自定义颜色，更新纹理
    // 不再使用全局自定义颜色纹理，改为每个方块单独设置颜色
    // if (model.texName === 'custom_color' && model.customColor) {
    //   updateCustomColorTexture(model.customColor);
    // }
  }
}

function updateModelTex(modelId, texName) {
  const model = models.find(m => m.id === modelId);
  if (model) {
    model.texName = texName;
    // 同步控制区颜色选择器
    const colorPicker = document.getElementById('customColorPicker');
    if (colorPicker) {
      if (texName === 'custom_color') {
        colorPicker.style.display = 'block';
        if (!model.customColor) { model.customColor = '#ffffff'; colorPicker.value = model.customColor; }
        else colorPicker.value = model.customColor;
        // 更新自定义颜色纹理
        // updateCustomColorTexture(model.customColor);
      } else {
        colorPicker.style.display = 'none';
      }
    }
    // 同步模型列表区颜色选择器
    const defaultColorPicker = document.getElementById('defaultCustomColor');
    if (defaultColorPicker) {
      if (texName === 'custom_color') {
        defaultColorPicker.style.display = 'block';
        if (!model.customColor) { model.customColor = '#ffffff'; defaultColorPicker.value = model.customColor; }
        else defaultColorPicker.value = model.customColor;
      } else {
        defaultColorPicker.style.display = 'none';
      }
    }
    hasUnsavedChanges = true;
    renderModelList();
    draw();
  }
}

function updateModelType(modelId, type) {
  const model = models.find(m => m.id === modelId);
  if (model) { model.modelType = type; hasUnsavedChanges = true; draw(); }
}

function updateModelValue(modelId, name, val) {
  const event = window.event;
  const model = models.find(m => m.id === modelId);
  if (!model) return;
  
  // 如果变量不存在，创建它
  if (!model.varData[name]) {
    model.varData[name] = { name, value: 0, min: getVarMin(name), max: getVarMax(name), step: getVarStep(name) };
  }
  
  // 允许用户输入小数点
  if (val === '.') {
    // 保留小数点输入
    const numInput = document.getElementById(name + 'N');
    if (numInput) numInput.value = '.';
    return;
  }
  
  let v = Number(val);
  if (!Number.isFinite(v)) return; // 如果不是有效数字，不更新
  
  const minVal = getVarMin(name);
  const maxVal = getVarMax(name);
  
  // 只有滑块变化时才应用最大最小值限制，文本框输入不受限制
  if (event.target.type === 'range') {
    v = Math.max(minVal, Math.min(maxVal, v));
  }
  
  model.varData[name].value = v; hasUnsavedChanges = true;
  const numInput = document.getElementById(name + 'N');
  const rangeInput = document.getElementById(name + 'R');
  
  // 只在滑块变化时更新输入框，避免输入时失去焦点
  if (event.target.type === 'range' && numInput) {
    numInput.value = v;
  }
  
  // 在输入框变化时更新滑块（滑块值被限制在范围内）
  if (event.target.type === 'number' && rangeInput) {
    rangeInput.value = Math.max(minVal, Math.min(maxVal, v));
  }
  
  updateCmdOutput(); draw();
}

function resetModelValue(modelId, name) {
  const model = models.find(m => m.id === modelId);
  if (!model) return;
  const def = varDefsTemplate.find(d => d.name === name);
  const init = def ? def.init : 0;
  // 如果变量不存在，创建它
  if (!model.varData[name]) {
    model.varData[name] = { name, value: init, min: getVarMin(name), max: getVarMax(name), step: getVarStep(name) };
  } else {
    model.varData[name].value = init;
  }
  hasUnsavedChanges = true;
  const numInput = document.getElementById(name + 'N');
  const rangeInput = document.getElementById(name + 'R');
  if (numInput) numInput.value = init;
  if (rangeInput) rangeInput.value = init;
  updateCmdOutput(); draw();
}

// ============ 页面渲染 ============
function renderModelList() {
  const items = [];
  
  modelGroups.forEach(group => {
    const isExpanded = expandedGroups.has(group.id);
    items.push(`
      <div class="model-item ${group.id === activeGroupId ? 'active' : ''}" data-group-id="${group.id}" style="background: rgba(255, 215, 0, 0.1); border-left: 4px solid gold;">
        <div class="model-info">
          <span class="model-name">${group.name} (模型组)</span>
          <span class="model-tex">包含 ${group.modelIds.length} 个模型</span>
        </div>
        <button class="expand-btn" data-group-id="${group.id}" title="展开/收起">${isExpanded ? '▼' : '▶'}</button>
        <button class="model-delete" data-group-id="${group.id}" title="删除">×</button>
      </div>
    `);
    
    // 添加嵌套模型的容器
    const nestedContainerStyle = isExpanded ? 
      'style="display: block; overflow: hidden;"' : 
      'style="display: none; overflow: hidden;"';
    items.push(`<div class="nested-models-container" data-group-id="${group.id}" ${nestedContainerStyle}>`);
    
    // 显示内部模型
    group.modelIds.forEach(modelId => {
      const m = models.find(mod => mod.id === modelId);
      if (m) {
        items.push(`
          <div class="model-item nested ${m.id === activeModelId ? 'active' : ''}" data-id="${m.id}" data-parent-group="${group.id}" style="margin-left: 20px; background: rgba(255, 215, 0, 0.05);">
            <div class="model-info">
              <span class="model-name">${m.name} (${getTypeName(m.modelType)})</span>
              <span class="model-tex">${getTexDisplayName(m.texName)}</span>
            </div>
            <button class="model-delete" data-id="${m.id}" title="删除">×</button>
          </div>
        `);
      }
    });
    
    items.push(`</div>`);
  });
  
  models.forEach(m => {
    const isInGroup = modelGroups.some(group => group.modelIds.includes(m.id));
    if (!isInGroup) {
      items.push(`
        <div class="model-item ${m.id === activeModelId ? 'active' : ''}" data-id="${m.id}">
          <div class="model-info">
            <span class="model-name">${m.name} (${getTypeName(m.modelType)})</span>
            <span class="model-tex">${getTexDisplayName(m.texName)}</span>
          </div>
          <button class="model-delete" data-id="${m.id}" title="删除">×</button>
        </div>
      `);
    }
  });
  
  // 渲染到主页面的模型列表
  const mainContainer = document.getElementById('modelList');
  if (items.length === 0) mainContainer.innerHTML = '<div class="empty-state">暂无模型</div>';
  else mainContainer.innerHTML = items.join('');
  
  // 渲染到侧边栏的模型列表
  const sidebarContainer = document.getElementById('sidebarModelList');
  if (sidebarContainer) {
    if (items.length === 0) sidebarContainer.innerHTML = '<div class="empty-state">暂无模型</div>';
    else sidebarContainer.innerHTML = items.join('');
    
    // 为侧边栏添加事件监听器
    attachModelListEvents(sidebarContainer);
  }
  
  // 为主页面添加事件监听器
  attachModelListEvents(mainContainer);
  
  // 为已展开的容器设置正确的高度
  [mainContainer, sidebarContainer].forEach(container => {
    if (container) {
      container.querySelectorAll('.nested-models-container').forEach(nestedContainer => {
        const groupId = parseInt(nestedContainer.dataset.groupId);
        if (expandedGroups.has(groupId)) {
          const height = nestedContainer.scrollHeight;
          nestedContainer.style.maxHeight = height + 'px';
        }
      });
    }
  });
}

function attachModelListEvents(container) {
  // 展开/收起按钮事件
  container.querySelectorAll('.expand-btn').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const groupId = parseInt(el.dataset.groupId);
      const nestedContainer = container.querySelector(`.nested-models-container[data-group-id="${groupId}"]`);
      
      if (expandedGroups.has(groupId)) {
        expandedGroups.delete(groupId);
        if (nestedContainer) {
          nestedContainer.style.maxHeight = '0';
          nestedContainer.style.opacity = '0';
          setTimeout(() => {
            nestedContainer.style.display = 'none';
          }, 300);
        }
        el.textContent = '▶';
      } else {
        expandedGroups.add(groupId);
        if (nestedContainer) {
          nestedContainer.style.display = 'block';
          const height = nestedContainer.scrollHeight;
          setTimeout(() => {
            nestedContainer.style.maxHeight = height + 'px';
            nestedContainer.style.opacity = '1';
          }, 10);
        }
        el.textContent = '▼';
      }
    });
  });
  
  // 模型项事件（包括嵌套在模型组中的）
  container.querySelectorAll('.model-item[data-id]').forEach(el => {
    el.addEventListener('click', (e) => { if (!e.target.classList.contains('model-delete') && !e.target.classList.contains('expand-btn')) selectModel(parseInt(el.dataset.id)); });
    el.addEventListener('contextmenu', (e) => { e.preventDefault(); showCopyModelModal(parseInt(el.dataset.id)); });
  });
  
  container.querySelectorAll('.model-item[data-group-id]').forEach(el => {
    el.addEventListener('click', (e) => { if (!e.target.classList.contains('model-delete') && !e.target.classList.contains('expand-btn')) selectModelGroup(parseInt(el.dataset.groupId)); });
    el.addEventListener('contextmenu', (e) => { e.preventDefault(); showCopyGroupModal(parseInt(el.dataset.groupId)); });
  });
  
  container.querySelectorAll('.model-delete[data-id]').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); deleteModel(parseInt(el.dataset.id)); });
  });
  
  container.querySelectorAll('.model-delete[data-group-id]').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); activeGroupId = parseInt(el.dataset.groupId); deleteModelGroup(); });
  });
}

function selectModelGroup(groupId) {
  activeGroupId = groupId; activeModelId = null;
  renderModelList(); renderControlPage(); renderAnimationPage();
}

function renderControlPage() {
  const container = document.getElementById('controlsContainer');
  
  if (activeGroupId) {
    const group = modelGroups.find(g => g.id === activeGroupId);
    if (!group) { container.innerHTML = '<div class="empty-state">模型组不存在</div>'; return; }
    
    container.innerHTML = `
      <div class="sliders-container" id="slidersContainer">
        <h3 style="margin-top: 0; margin-bottom: 12px;">模型组控制: ${group.name}</h3>
        <table class="param-table">
          ${Object.values(group.varData).map(def => `
            <tr>
              <td>${getParamLabel(def.name)}<span class="param-code">v.${def.name}</span></td>
              <td><input type="number" id="${def.name}N" value="${def.value}" step="${getStep(def.name)}" onchange="updateGroupValue(${group.id}, '${def.name}', this.value)" /></td>
              <td><input type="range" id="${def.name}R" min="${getMin(def.name)}" max="${getMax(def.name)}" value="${def.value}" step="${getStep(def.name)}" oninput="updateGroupValue(${group.id}, '${def.name}', this.value)" /></td>
              <td style="width: 50px;"><button class="btn btn-outline btn-small" onclick="resetGroupValue(${group.id}, '${def.name}')">重置</button></td>
            </tr>
          `).join('')}
        </table>
      ${currentVersion === 'extend' ? `
      <div style="margin-top: 12px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <button class="expand-btn" onclick="toggleExtraGroupVars(this)">▼</button>
          <span>展开extra版变量</span>
          <span style="color: var(--text-tertiary); font-size: 12px;">需要extra版前置,详见“更多-extra-extend版”</span>
        </div>
        <div class="nested-models-container" id="extraGroupVarsContainer">
          <table class="param-table">
            ${['rotatex', 'rotatey', 'rotatez'].map(name => `
              <tr>
                <td>${getParamLabel(name)}<span class="param-code">v.${name}</span></td>
                <td><input type="number" id="${name}N" value="${group.varData[name]?.value || 0}" step="${getStep(name)}" onchange="updateGroupValue(${group.id}, '${name}', this.value)" /></td>
                <td><input type="range" id="${name}R" min="${getMin(name)}" max="${getMax(name)}" value="${group.varData[name]?.value || 0}" step="${getStep(name)}" oninput="updateGroupValue(${group.id}, '${name}', this.value)" /></td>
                <td style="width: 50px;"><button class="btn btn-outline btn-small" onclick="resetGroupValue(${group.id}, '${name}')">重置</button></td>
              </tr>
            `).join('')}
          </table>
        </div>
      </div>
      ` : ''}
    </div>
  `;
  return;
}
  
  const model = models.find(m => m.id === activeModelId);
  if (!model) { container.innerHTML = '<div class="empty-state">请先在列表页面选择一个模型</div>'; return; }
  const texSelect = document.getElementById('modelTexSelect');
  if (texSelect) texSelect.value = model.texName;
  
  // 同步颜色选择器
  const colorPicker = document.getElementById('customColorPicker');
  if (colorPicker) {
    if (model.texName === 'custom_color') {
      colorPicker.style.display = 'block';
      colorPicker.value = model.customColor || '#ffffff';
    } else {
      colorPicker.style.display = 'none';
    }
  }
  
  container.innerHTML = `
    <div class="sliders-container" id="slidersContainer">
      <table class="param-table">
        ${varDefsTemplate.map(def => {
          if (currentVersion === 'extend' && (def.name === 'xzscale' || def.name === 'yscale')) {
            return '';
          }
          if (currentVersion === 'base' && def.name.startsWith('extend_')) {
            return '';
          }
          return `
            <tr>
              <td>${getParamLabel(def.name)}<span class="param-code">v.${def.name}</span></td>
              <td><input type="number" id="${def.name}N" value="${model.varData[def.name].value}" step="${getStep(def.name)}" onchange="updateModelValue(${model.id}, '${def.name}', this.value)" /></td>
              <td><input type="range" id="${def.name}R" min="${getMin(def.name)}" max="${getMax(def.name)}" value="${model.varData[def.name].value}" step="${getStep(def.name)}" oninput="updateModelValue(${model.id}, '${def.name}', this.value)" /></td>
              <td style="width: 50px;"><button class="btn btn-outline btn-small" onclick="resetModelValue(${model.id}, '${def.name}')">重置</button></td>
            </tr>
          `;
        }).join('')}
      </table>
      ${currentVersion === 'extend' ? `
      <div style="margin-top: 12px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <button class="expand-btn" onclick="toggleExtraVars(this)">▼</button>
          <span>展开extra版变量</span>
          <span style="color: var(--text-tertiary); font-size: 12px;">需要extra版前置,详见“更多-extra-extend版”</span>
        </div>
        <div class="nested-models-container" id="extraVarsContainer">
          <table class="param-table">
            ${['rotatex', 'rotatey', 'rotatez'].map(name => `
              <tr>
                <td>${getParamLabel(name)}<span class="param-code">v.${name}</span></td>
                <td><input type="number" id="${name}N" value="${model.varData[name]?.value || 0}" step="${getStep(name)}" onchange="updateModelValue(${model.id}, '${name}', this.value)" /></td>
                <td><input type="range" id="${name}R" min="${getMin(name)}" max="${getMax(name)}" value="${model.varData[name]?.value || 0}" step="${getStep(name)}" oninput="updateModelValue(${model.id}, '${name}', this.value)" /></td>
                <td style="width: 50px;"><button class="btn btn-outline btn-small" onclick="resetModelValue(${model.id}, '${name}')">重置</button></td>
              </tr>
            `).join('')}
          </table>
        </div>
      </div>
      ` : ''}
    </div>
  `;
  

}

function renderAnimationPage() {
  const container = document.getElementById('molangEditorContainer');
  const model = models.find(m => m.id === activeModelId);
  if (!model) { container.innerHTML = '<div class="empty-state">请先在列表页面选择一个模型</div>'; return; }
  container.innerHTML = `
    <div class="molang-editor">
      <div class="molang-editor-header">
        <div class="molang-editor-actions">
          <button id="molangFullscreenBtn" class="btn btn-secondary">+</button>
        </div>
      </div>
      <textarea class="molang-textarea ${model.hasError ? 'error' : ''}" id="molangCode" placeholder="在此输入Molang代码...\n\n示例:\nv.xpos=v.xpos??0;\nloop(60,{v.xpos=v.xpos+0.1});\nv.xpos>10?{v.xpos=0}">${model.molangCode || ''}</textarea>
      <div class="molang-error" id="molangError">${model.errorMsg || ''}</div>
    </div>
  `;
  const textarea = document.getElementById('molangCode');
  if (textarea) textarea.addEventListener('input', () => { model.molangCode = textarea.value; hasUnsavedChanges = true; validateMolang(); });
  const fullscreenBtn = document.getElementById('molangFullscreenBtn');
  const previewSection = document.getElementById('previewSection');
  const horizontalSidebar = document.getElementById('horizontalSidebar');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      const molangEditor = document.querySelector('.molang-editor');
      if (molangEditor.classList.contains('fullscreen')) {
        molangEditor.classList.remove('fullscreen');
        fullscreenBtn.textContent = '+';
        if (previewSection) previewSection.style.display = '';
        if (horizontalSidebar && document.body.classList.contains('horizontal-ui')) {
          horizontalSidebar.style.display = 'block';
        }
      }
      else {
        molangEditor.classList.add('fullscreen');
        fullscreenBtn.textContent = '◣';
        if (previewSection) previewSection.style.display = 'none';
        if (horizontalSidebar) {
          horizontalSidebar.style.display = 'none';
        }
      }
    });
  }
}

function validateMolang() {
  const model = models.find(m => m.id === activeModelId);
  if (!model) return;
  const textarea = document.getElementById('molangCode');
  const errorDiv = document.getElementById('molangError');
  if (!textarea || !errorDiv) return;
  const code = textarea.value.trim();
  if (!code) { model.hasError = false; model.errorMsg = ''; textarea.classList.remove('error'); errorDiv.textContent = ''; return; }
  try {
    const lexer = new MolangLexer(code);
    const tokens = lexer.tokenize();
    if (lexer.error) throw new Error('语法错误: ' + lexer.error);
    // 只在语法检查阶段，不执行代码，运行时错误在执行阶段才报
    model.hasError = false; model.errorMsg = ''; textarea.classList.remove('error'); errorDiv.textContent = '';
  } catch (e) { model.hasError = true; model.errorMsg = e.message; textarea.classList.add('error'); errorDiv.textContent = model.errorMsg; }
}

function getParamLabel(name) {
  const labels = { xpos: "X位置", ypos: "Y位置", zpos: "Z位置", xrot: "X旋转", yrot: "Y旋转", zrot: "Z旋转", scale: "整体缩放", xzscale: "水平缩放", yscale: "垂直缩放", xbasepos: "X基准", ybasepos: "Y基准", zbasepos: "Z基准", extend_scale: "拉伸缩放", extend_xrot: "X拉伸旋转", extend_yrot: "Y拉伸旋转", rotatex: "额外X旋转", rotatey: "额外Y旋转", rotatez: "额外Z旋转" };
  return labels[name] || name;
}

function getMin(name) { 
  return getVarMin(name);
}
function getMax(name) { 
  return getVarMax(name);
}
function getStep(name) {
  return getVarStep(name);
}

function toggleExtraVars(btn) {
  const container = btn.parentElement.nextElementSibling;
  if (container.style.maxHeight) {
    container.style.maxHeight = null;
    container.style.opacity = 0;
    btn.textContent = '▼';
  } else {
    container.style.maxHeight = container.scrollHeight + 'px';
    container.style.opacity = 1;
    btn.textContent = '▲';
  }
}

function toggleExtraGroupVars(btn) {
  const container = btn.parentElement.nextElementSibling;
  if (container.style.maxHeight) {
    container.style.maxHeight = null;
    container.style.opacity = 0;
    btn.textContent = '▼';
  } else {
    container.style.maxHeight = container.scrollHeight + 'px';
    container.style.opacity = 1;
    btn.textContent = '▲';
  }
}
function getTypeName(type) { const names = { block: '方块', stairs: '楼梯', slab: '半砖', banner: '旗帜' }; return names[type] || type; }
function getTexDisplayName(name) { const names = { 'diamond_block': '钻石块', 'alex': 'Alex头颅', 'colored': '分色图', 'custom_color': '自定义颜色' }; return names[name] || name; }

// ============ WebGL ============
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

const createShader = (type, src) => {
  const s = gl.createShader(type);
  gl.shaderSource(s, src.trim());
  gl.compileShader(s);
  return s;
};

const prg = gl.createProgram();
[ [gl.VERTEX_SHADER,document.getElementById("vertShader").textContent],
  [gl.FRAGMENT_SHADER,document.getElementById("fragShader").textContent]
].forEach(([t,s]) => { const sh = createShader(t,s); gl.attachShader(prg,sh); gl.deleteShader(sh); });
gl.linkProgram(prg); gl.useProgram(prg);
gl.enable(gl.CULL_FACE); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);

const posLoc=gl.getAttribLocation(prg,"position"), colorLoc=gl.getAttribLocation(prg,"color"), uvLoc=gl.getAttribLocation(prg,"uv"), normalLoc=gl.getAttribLocation(prg,"normal");
const texLoadedLoc=gl.getUniformLocation(prg,"texLoaded"), texLoc=gl.getUniformLocation(prg,"tex"), mvpMatLoc=gl.getUniformLocation(prg,"mvpMat"), mAdjMatLoc=gl.getUniformLocation(prg,"mAdjMat");
const customColorLoc=gl.getUniformLocation(prg,"customColor"), useCustomColorLoc=gl.getUniformLocation(prg,"useCustomColor");
const lightDirLoc=gl.getUniformLocation(prg,"lightDir");

const createVAO=(data,stride,attrs)=>{
  const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
  const vbo=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vbo); gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  attrs.forEach(a=>{gl.vertexAttribPointer(a.loc,a.size,gl.FLOAT,false,stride,a.offset);gl.enableVertexAttribArray(a.loc);});
  return vao;
};

const createBlockVAO=()=>{
  const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
  const vbo=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vbo); gl.bufferData(gl.ARRAY_BUFFER,generateBlockVertices(),gl.STATIC_DRAW);
  gl.vertexAttribPointer(posLoc,3,gl.FLOAT,false,44,0); gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(colorLoc,3,gl.FLOAT,false,44,12); gl.enableVertexAttribArray(colorLoc);
  gl.vertexAttribPointer(uvLoc,2,gl.FLOAT,false,44,24); gl.enableVertexAttribArray(uvLoc);
  gl.vertexAttribPointer(normalLoc,3,gl.FLOAT,false,44,32); gl.enableVertexAttribArray(normalLoc);
  const ibo=gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Int16Array([0,1,2,2,1,3,4,5,6,6,5,7,8,9,10,10,9,11,12,13,14,14,13,15,16,17,18,18,17,19,20,21,22,22,21,23]),gl.STATIC_DRAW);
  return vao;
};

const blockVao=createBlockVAO();
const stairsVao=createVAO(generateStairsVertices(),44,[{loc:posLoc,size:3,offset:0},{loc:colorLoc,size:3,offset:12},{loc:uvLoc,size:2,offset:24},{loc:normalLoc,size:3,offset:32}]);
const slabVao=createVAO(generateSlabVertices(),44,[{loc:posLoc,size:3,offset:0},{loc:colorLoc,size:3,offset:12},{loc:uvLoc,size:2,offset:24},{loc:normalLoc,size:3,offset:32}]);
const bannerVao=createVAO(generateBannerVertices(),44,[{loc:posLoc,size:3,offset:0},{loc:colorLoc,size:3,offset:12},{loc:uvLoc,size:2,offset:24},{loc:normalLoc,size:3,offset:32}]);

// 生成楼梯线框顶点
function generateStairsWireframe() {
  const v = [];
  // 楼梯的边缘线 - 只绘制必要的边缘
  
 // 底面
  v.push(-.5, -.5, -.5, .5, -.5, -.5); // 前
  v.push(.5, -.5, -.5, .5, -.5, .5); // 右
  v.push(.5, -.5, .5, -.5, -.5, .5); // 后
  v.push(-.5, -.5, .5, -.5, -.5, -.5); // 左
  
  // 前面
  v.push(-.5, -.5, .5, .5, -.5, .5); // 底
  v.push(.5, -.5, .5, .5, 0, .5); // 右
  v.push(.5, 0, .5, -.5, 0, .5); // 顶
  v.push(-.5, 0, .5, -.5, -.5, .5); // 左
  
  // 左面
  v.push(-.5, -.5, -.5, -.5, 0, -.5); // 底前
  v.push(-.5, 0, -.5, -.5, .5, -.5); // 底后
  v.push(-.5, .5, -.5, -.5, .5, 0); // 顶后
  v.push(-.5, .5, 0, -.5, 0, 0); // 顶前
  v.push(-.5, 0, .5, -.5, -.5, .5); // 底前
  
  // 右面下半
  v.push(.5, -.5, -.5, .5, 0, -.5); // 底
  v.push(.5, 0, -.5, .5, 0, .5); // 顶
  v.push(.5, 0, .5, .5, -.5, .5); // 后
  v.push(.5, -.5, .5, .5, -.5, -.5); // 前
  
  // 顶面（楼梯台阶水平面）
  v.push(-.5, 0, -.5, .5, 0, -.5); // 前
  v.push(.5, .5, -.5, .5, .5, 0); // 右
  v.push(.5, 0, .5, -.5, 0, .5); // 后
  v.push(-.5, 0, .5, -.5, 0, -.5); // 左
  
  // 后面上半
  v.push(-.5, 0, -.5, .5, 0, -.5); // 底
  v.push(.5, 0, -.5, .5, .5, -.5); // 右
  v.push(.5, .5, -.5, -.5, .5, -.5); // 顶
  v.push(-.5, .5, -.5, -.5, 0, -.5); // 左
  
  // 楼梯台阶垂直面
  v.push(-.5, 0, 0, .5, 0, 0); // 底
  v.push(.5, 0, 0, .5, .5, 0); // 右
  v.push(.5, .5, 0, -.5, .5, 0); // 顶
  v.push(-.5, .5, 0, -.5, 0, 0); // 左
  
  // 右面后半
  v.push(.5, 0, -.5, .5, .5, -.5); // 底
  v.push(.5, .5, .5, .5, .5, 0); // 顶
  v.push(.5, .5, 0, .5, 0, 0); // 后
  
  // 连接楼梯台阶
  v.push(-.5, 0, .5, -.5, 0, 0); // 左台阶
  v.push(.5, 0, .5, .5, 0, 0); // 右台阶
  v.push(-.5, .5, 0, -.5, .5, -.5); // 左顶部
  v.push(.5, .5, 0, .5, .5, -.5); // 右顶部
  
  return new Float32Array(v);
}

// 生成半砖线框顶点
function generateSlabWireframe() {
  const v = [];
  // 半砖的边缘线 - 使用单独的线段，而不是LINE_LOOP
  
  // 底面
  v.push(-.5, -.5, -.5, .5, -.5, -.5); // 前
  v.push(.5, -.5, -.5, .5, -.5, .5); // 右
  v.push(.5, -.5, .5, -.5, -.5, .5); // 后
  v.push(-.5, -.5, .5, -.5, -.5, -.5); // 左
  
  // 顶面
  v.push(-.5, 0, -.5, .5, 0, -.5); // 前
  v.push(.5, 0, -.5, .5, 0, .5); // 右
  v.push(.5, 0, .5, -.5, 0, .5); // 后
  v.push(-.5, 0, .5, -.5, 0, -.5); // 左
  
  // 前面
  v.push(-.5, -.5, .5, .5, -.5, .5); // 底
  v.push(.5, -.5, .5, .5, 0, .5); // 右
  v.push(.5, 0, .5, -.5, 0, .5); // 顶
  v.push(-.5, 0, .5, -.5, -.5, .5); // 左
  
  // 后面
  v.push(-.5, -.5, -.5, .5, -.5, -.5); // 底
  v.push(.5, -.5, -.5, .5, 0, -.5); // 右
  v.push(.5, 0, -.5, -.5, 0, -.5); // 顶
  v.push(-.5, 0, -.5, -.5, -.5, -.5); // 左
  
  // 左面
  v.push(-.5, -.5, -.5, -.5, 0, -.5); // 前
  v.push(-.5, 0, -.5, -.5, 0, .5); // 顶
  v.push(-.5, 0, .5, -.5, -.5, .5); // 后
  v.push(-.5, -.5, .5, -.5, -.5, -.5); // 底
  
  // 右面
  v.push(.5, -.5, -.5, .5, 0, -.5); // 前
  v.push(.5, 0, -.5, .5, 0, .5); // 顶
  v.push(.5, 0, .5, .5, -.5, .5); // 后
  v.push(.5, -.5, .5, .5, -.5, -.5); // 底
  
  return new Float32Array(v);
}

// 创建线框VAO
const createWireframeVAO = (vertices) => {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 12, 0);
  gl.enableVertexAttribArray(posLoc);
  return vao;
};

const stairsWireframeVao = createWireframeVAO(generateStairsWireframe());
const slabWireframeVao = createWireframeVAO(generateSlabWireframe());
const bannerWireframeVao = createWireframeVAO(generateBannerWireframe());
gl.bindVertexArray(null);

const getRotX=a=>{const c=Math.cos(a*deg),s=Math.sin(a*deg);return[1,0,0,0,0,c,-s,0,0,s,c,0,0,0,0,1]};
const getRotY=a=>{const c=Math.cos(a*deg),s=Math.sin(a*deg);return[c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]};
const getRotZ=a=>{const c=Math.cos(a*deg),s=Math.sin(a*deg);return[c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]};
const getTrans=(x,y,z)=>[1,0,0,x,0,1,0,y,0,0,1,z,0,0,0,1];
const getScale=(x,y,z)=>[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1];

// 网格VAO
function createGridVAO() {
  const gridVerts = [];
  const gridColor = [0.5, 0.5, 0.5];
  for (let i = -5; i <= 5; i++) {
    gridVerts.push(i, 0, -5, ...gridColor, 0, 0, 0, 1, 0);
    gridVerts.push(i, 0, 5, ...gridColor, 0, 0, 0, 1, 0);
    gridVerts.push(-5, 0, i, ...gridColor, 0, 0, 0, 1, 0);
    gridVerts.push(5, 0, i, ...gridColor, 0, 0, 0, 1, 0);
  }
  return createVAO(new Float32Array(gridVerts), 44, [{loc:posLoc,size:3,offset:0},{loc:colorLoc,size:3,offset:12},{loc:uvLoc,size:2,offset:24},{loc:normalLoc,size:3,offset:32}]);
}

// 坐标轴VAO
function createAxisVAO() {
  const verts = [];
  verts.push(0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0);
  verts.push(2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0);
  verts.push(0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0);
  verts.push(0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0);
  verts.push(0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0);
  verts.push(0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0);
  return createVAO(new Float32Array(verts), 44, [{loc:posLoc,size:3,offset:0},{loc:colorLoc,size:3,offset:12},{loc:uvLoc,size:2,offset:24},{loc:normalLoc,size:3,offset:32}]);
}

// 触控箭头VAO
function createArrowVAO() {
  const verts = [];
  const arrowLen = 0.8;
  const headSize = 0.15;
  
  verts.push(0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0);
  verts.push(arrowLen, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0);
  verts.push(arrowLen, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0);
  verts.push(arrowLen - headSize, headSize, 0, 1, 0, 0, 0, 0, 0, 0, 0);
  verts.push(arrowLen, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0);
  verts.push(arrowLen - headSize, -headSize, 0, 1, 0, 0, 0, 0, 0, 0, 0);
  
  verts.push(0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0);
  verts.push(0, arrowLen, 0, 0, 1, 0, 0, 0, 0, 0, 0);
  verts.push(0, arrowLen, 0, 0, 1, 0, 0, 0, 0, 0, 0);
  verts.push(headSize, arrowLen - headSize, 0, 0, 1, 0, 0, 0, 0, 0, 0);
  verts.push(0, arrowLen, 0, 0, 1, 0, 0, 0, 0, 0, 0);
  verts.push(-headSize, arrowLen - headSize, 0, 0, 1, 0, 0, 0, 0, 0, 0);
  
  verts.push(0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0);
  verts.push(0, 0, arrowLen, 0, 0, 1, 0, 0, 0, 0, 0);
  verts.push(0, 0, arrowLen, 0, 0, 1, 0, 0, 0, 0, 0);
  verts.push(headSize, 0, arrowLen - headSize, 0, 0, 1, 0, 0, 0, 0, 0);
  verts.push(0, 0, arrowLen, 0, 0, 1, 0, 0, 0, 0, 0);
  verts.push(-headSize, 0, arrowLen - headSize, 0, 0, 1, 0, 0, 0, 0, 0);
  
  return createVAO(new Float32Array(verts), 44, [{loc:posLoc,size:3,offset:0},{loc:colorLoc,size:3,offset:12},{loc:uvLoc,size:2,offset:24},{loc:normalLoc,size:3,offset:32}]);
}

// 旋转圆环VAO
function createRotationRingVAO() {
  const verts = [];
  const segments = 32;
  const radius = 0.7;
  
  for (let i = 0; i <= segments; i++) {
    const angle1 = (i / segments) * Math.PI * 2;
    const angle2 = ((i + 1) / segments) * Math.PI * 2;
    verts.push(0, Math.cos(angle1) * radius, Math.sin(angle1) * radius, 1, 0, 0, 0, 0, 0, 0, 0);
    verts.push(0, Math.cos(angle2) * radius, Math.sin(angle2) * radius, 1, 0, 0, 0, 0, 0, 0, 0);
  }
  
  for (let i = 0; i <= segments; i++) {
    const angle1 = (i / segments) * Math.PI * 2;
    const angle2 = ((i + 1) / segments) * Math.PI * 2;
    verts.push(Math.cos(angle1) * radius, 0, Math.sin(angle1) * radius, 0, 1, 0, 0, 0, 0, 0, 0);
    verts.push(Math.cos(angle2) * radius, 0, Math.sin(angle2) * radius, 0, 1, 0, 0, 0, 0, 0, 0);
  }
  
  for (let i = 0; i <= segments; i++) {
    const angle1 = (i / segments) * Math.PI * 2;
    const angle2 = ((i + 1) / segments) * Math.PI * 2;
    verts.push(Math.cos(angle1) * radius, Math.sin(angle1) * radius, 0, 0, 0, 1, 0, 0, 0, 0, 0);
    verts.push(Math.cos(angle2) * radius, Math.sin(angle2) * radius, 0, 0, 0, 1, 0, 0, 0, 0, 0);
  }
  
  return createVAO(new Float32Array(verts), 44, [{loc:posLoc,size:3,offset:0},{loc:colorLoc,size:3,offset:12},{loc:uvLoc,size:2,offset:24},{loc:normalLoc,size:3,offset:32}]);
}

// 高亮边框VAO (线框立方体)
function createHighlightVAO() {
  const verts = [];
  const color = [1, 1, 0]; // 黄色高亮
  
  // 立方体的8个顶点
  const corners = [
    [-0.51, -0.51, -0.51], [0.51, -0.51, -0.51], [0.51, 0.51, -0.51], [-0.51, 0.51, -0.51],
    [-0.51, -0.51, 0.51], [0.51, -0.51, 0.51], [0.51, 0.51, 0.51], [-0.51, 0.51, 0.51]
  ];
  
  // 12条边
  const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  
  edges.forEach(([a, b]) => {
    verts.push(...corners[a], ...color, 0, 0, 0, 0, 0);
    verts.push(...corners[b], ...color, 0, 0, 0, 0, 0);
  });
  
  return createVAO(new Float32Array(verts), 44, [{loc:posLoc,size:3,offset:0},{loc:colorLoc,size:3,offset:12},{loc:uvLoc,size:2,offset:24},{loc:normalLoc,size:3,offset:32}]);
}

// Extend版方向箭头VAO (黄色，指示extend_xyrot方向)
// 箭头根部在原点(0,0,0)，指向Z轴正方向（当ex_xyrot都为0时）
function createDirectionArrowVAO() {
  const verts = [];
  const arrowLen = 0.8;  // 箭头长度
  const headSize = 0.15; // 箭头头部大小
  const yellow = [1, 1, 0]; // 黄色
  
  // 主箭头线 (沿Z轴正方向，从原点出发)
  verts.push(0, 0, 0, ...yellow, 0, 0, 0, 0, 0);
  verts.push(0, 0, arrowLen, ...yellow, 0, 0, 0, 0, 0);
  
  // 箭头头部 (十字形)
  // YZ平面
  verts.push(0, 0, arrowLen, ...yellow, 0, 0, 0, 0, 0);
  verts.push(0, headSize, arrowLen - headSize, ...yellow, 0, 0, 0, 0, 0);
  verts.push(0, 0, arrowLen, ...yellow, 0, 0, 0, 0, 0);
  verts.push(0, -headSize, arrowLen - headSize, ...yellow, 0, 0, 0, 0, 0);
  // XZ平面
  verts.push(0, 0, arrowLen, ...yellow, 0, 0, 0, 0, 0);
  verts.push(headSize, 0, arrowLen - headSize, ...yellow, 0, 0, 0, 0, 0);
  verts.push(0, 0, arrowLen, ...yellow, 0, 0, 0, 0, 0);
  verts.push(-headSize, 0, arrowLen - headSize, ...yellow, 0, 0, 0, 0, 0);
  
  return createVAO(new Float32Array(verts), 44, [{loc:posLoc,size:3,offset:0},{loc:colorLoc,size:3,offset:12},{loc:uvLoc,size:2,offset:24},{loc:normalLoc,size:3,offset:32}]);
}

const gridVao = createGridVAO();
const axisVao = createAxisVAO();
const arrowVao = createArrowVAO();
const rotationRingVao = createRotationRingVAO();
const highlightVao = createHighlightVAO();
const directionArrowVao = createDirectionArrowVAO();

let aspect=1;
const resize=()=>{
  canvas.width=canvas.clientWidth*window.devicePixelRatio;
  canvas.height=canvas.clientHeight*window.devicePixelRatio;
  aspect=canvas.clientHeight/canvas.clientWidth;
  gl.viewport(0,0,canvas.width,canvas.height);
};

// 获取模型矩阵
function getModelMatrix(model) {
  const d = model.varData;
  
  // 检查模型是否属于某个模型组
  const group = modelGroups.find(g => g.modelIds.includes(model.id));
  
  if (currentVersion === 'extend') {
    // Base版: 变量值1 = 1像素 = 1/16米, 渲染时 /16
    // Extend版: 变量值1 = 1米 = 1格, 渲染时直接使用
    // 当xyzpos=0时，方块中心在坐标轴原点
    const v_high = d.scale.value * d.extend_scale.value;
    
    // 计算模型组变换
    let groupTransform = getTrans(0, 0, 0);
    if (group) {
      const gd = group.varData;
      
      // 使用方块的basepos
      groupTransform = getTrans(d.xbasepos.value, d.ybasepos.value, d.zbasepos.value);
      console.log(`模型 ${model.id} 使用basepos: x=${d.xbasepos.value.toFixed(2)}, y=${d.ybasepos.value.toFixed(2)}, z=${d.zbasepos.value.toFixed(2)}`);
    } else {
      // 没有模型组，使用原始xyzbasepos
      groupTransform = getTrans(d.xbasepos.value, d.ybasepos.value, d.zbasepos.value);
      console.log(`模型 ${model.id} 使用basepos: x=${d.xbasepos.value.toFixed(2)}, y=${d.ybasepos.value.toFixed(2)}, z=${d.zbasepos.value.toFixed(2)}`);
    }
    
    let mMat = groupTransform;
    mMat=mulMat(getScale(1,d.extend_scale.value,1),mMat);
    mMat=mulMat(getRotY(-d.extend_yrot.value),mMat);
    mMat=mulMat(getRotX(-d.extend_xrot.value),mMat);
    mMat=mulMat(getScale(1,1,d.extend_scale.value),mMat);
    mMat=mulMat(getRotX(d.extend_xrot.value),mMat);
    mMat=mulMat(getRotY(d.extend_yrot.value),mMat);
    
    // 应用模型组scale到方块scale
    const effectiveScale = group ? d.scale.value * group.varData.scale.value : d.scale.value;
    mMat=mulMat(getScale(effectiveScale,effectiveScale,effectiveScale),mMat);
    
    // 先应用模型组的旋转（如果有）
    if (group) {
      const gd = group.varData;
      mMat=mulMat(getRotZ(gd.zrot.value),mMat);
      mMat=mulMat(getRotX(gd.xrot.value),mMat);
      mMat=mulMat(getRotY(gd.yrot.value),mMat);
    }
    
    mMat=mulMat(getRotZ(d.zrot.value),mMat);
    mMat=mulMat(getRotX(d.xrot.value),mMat);
    mMat=mulMat(getRotY(d.yrot.value),mMat);
    
    // 应用extra版外置旋转（相同欧拉角顺序）
    if (d.rotatex || d.rotatey || d.rotatez) {
      const rx = d.rotatex ? d.rotatex.value : 0;
      const ry = d.rotatey ? d.rotatey.value : 0;
      const rz = d.rotatez ? d.rotatez.value : 0;
      mMat=mulMat(getRotZ(rz),mMat);
      mMat=mulMat(getRotX(rx),mMat);
      mMat=mulMat(getRotY(ry),mMat);
    }
    
    // pos: 变量值1 = 1米 = 1格, 直接使用（无偏移，中心在原点）
    // 应用模型组scale到方块xyzpos
    const effectivePosScale = group ? group.varData.scale.value : 1;
    // 应用模型组的pos（如果有）
    if (group) {
      const gd = group.varData;
      mMat=mulMat(getTrans(gd.xpos.value * effectivePosScale, gd.ypos.value * effectivePosScale, gd.zpos.value * effectivePosScale),mMat);
    }
    mMat=mulMat(getTrans(d.xpos.value * effectivePosScale, d.ypos.value * effectivePosScale, d.zpos.value * effectivePosScale),mMat);
    return mMat;
  } else {
    // Base版的模型矩阵计算
    // 当xyzpos=0时，方块中心在坐标轴原点
    const group = modelGroups.find(g => g.modelIds.includes(model.id));
    
    // 计算模型组scale（如果属于模型组）
    const groupScale = group ? group.varData.scale.value : 1;
    
    let mMat=getTrans(d.xbasepos.value/16,d.ybasepos.value/16,d.zbasepos.value/16);
    console.log(`模型 ${model.id} 使用basepos: x=${d.xbasepos.value.toFixed(2)}, y=${d.ybasepos.value.toFixed(2)}, z=${d.zbasepos.value.toFixed(2)}`);
    mMat=mulMat(getScale(d.scale.value*groupScale*d.xzscale.value,d.scale.value*groupScale*d.yscale.value,d.scale.value*groupScale*d.xzscale.value),mMat);
    
    // 先应用模型组的旋转（如果有）
    if (group) {
      const gd = group.varData;
      mMat=mulMat(getRotX(gd.xrot.value),mMat);
      mMat=mulMat(getRotZ(gd.zrot.value),mMat);
      mMat=mulMat(getRotY(gd.yrot.value),mMat);
    }
    
    mMat=mulMat(getRotX(d.xrot.value),mMat);
    mMat=mulMat(getRotZ(d.zrot.value),mMat);
    mMat=mulMat(getRotY(d.yrot.value),mMat);
    
    // 应用extra版外置旋转（相同欧拉角顺序）
    if (d.rotatex || d.rotatey || d.rotatez) {
      const rx = d.rotatex ? d.rotatex.value : 0;
      const ry = d.rotatey ? d.rotatey.value : 0;
      const rz = d.rotatez ? d.rotatez.value : 0;
      mMat=mulMat(getRotX(rx),mMat);
      mMat=mulMat(getRotZ(rz),mMat);
      mMat=mulMat(getRotY(ry),mMat);
    }
    
    // 应用模型组的pos（如果有）
    if (group) {
      const gd = group.varData;
      mMat=mulMat(getTrans(gd.xpos.value/16*groupScale, gd.ypos.value/16*groupScale, gd.zpos.value/16*groupScale),mMat);
    }
    
    mMat=mulMat(getTrans(d.xpos.value/16*groupScale,d.ypos.value/16*groupScale,d.zpos.value/16*groupScale),mMat);
    return mMat;
  }
}

// 获取模型中心点（世界坐标）
function getModelCenter(model) {
  const d = model.varData;
  if (currentVersion === 'extend') {
    // Extend版: 变量值1 = 1米 = 1格
    // 当xyzpos=0时，方块中心在坐标轴原点
    const v_high = d.scale.value * d.extend_scale.value;
    return [
      d.xpos.value + d.xbasepos.value,
      d.ypos.value + d.ybasepos.value,
      d.zpos.value + d.zbasepos.value
    ];
  }
  return [
    (d.xpos.value + d.xbasepos.value) / 16,
    (d.ypos.value + d.ybasepos.value) / 16,
    (d.zpos.value + d.zbasepos.value) / 16
  ];
}

// 获取投影矩阵
function getProjMat() {
  return [aspect*2**viewScale,0,0,0,0,2**viewScale,0,0,0,0,-1,19,0,0,-1,20];
}

// 获取视图矩阵
function getViewMat() {
  let viewMat = getRotY(viewYaw);
  viewMat = mulMat([1,0,0,0,0,Math.cos(viewPitch*deg),-Math.sin(viewPitch*deg),0,0,Math.sin(viewPitch*deg),Math.cos(viewPitch*deg),0,0,0,0,1], viewMat);
  return viewMat;
}

// 从4x4矩阵提取3x3旋转矩阵
function mat3FromMat4(m) {
  return [
    m[0], m[4], m[8],
    m[1], m[5], m[9],
    m[2], m[6], m[10]
  ];
}

// 3x3矩阵与向量乘法
function mat3Vec3(mat, vec) {
  return [
    mat[0]*vec[0] + mat[1]*vec[1] + mat[2]*vec[2],
    mat[3]*vec[0] + mat[4]*vec[1] + mat[5]*vec[2],
    mat[6]*vec[0] + mat[7]*vec[1] + mat[8]*vec[2]
  ];
}

// 屏幕坐标转世界坐标
function screenToWorld(screenX, screenY) {
  const ray = screenToWorldRay(screenX, screenY);
  // 找到与y=0平面的交点（地面）
  const t = -ray.origin[1] / ray.dir[1];
  return [
    ray.origin[0] + ray.dir[0] * t,
    0,
    ray.origin[2] + ray.dir[2] * t
  ];
}

// 获取模型边界（用于拾取）
function getModelBounds(model) {
  const d = model.varData;
  
  // 检查模型是否属于某个模型组
  const group = modelGroups.find(g => g.modelIds.includes(model.id));
  
  // 计算实际scale（模型组scale * 方块scale）
  let effectiveScale = d.scale.value;
  if (group) {
    effectiveScale = effectiveScale * group.varData.scale.value;
  }
  
  const center = getModelCenter(model);
  
  let hx, hy, hz;
  if (currentVersion === 'extend') {
    // Extend版: 使用 scale 和 extend_scale
    const extScale = d.extend_scale.value;
    hx = 0.5 * effectiveScale;
    hy = 0.5 * effectiveScale * extScale;
    hz = 0.5 * effectiveScale * extScale;
  } else {
    // Base版: 使用 xzscale 和 yscale
    const xzScale = d.xzscale.value;
    const yScale = d.yscale.value;
    hx = 0.5 * effectiveScale * xzScale;
    hy = 0.5 * effectiveScale * yScale;
    hz = 0.5 * effectiveScale * xzScale;
  }
  
  return {
    min: [center[0] - hx, center[1] - hy, center[2] - hz],
    max: [center[0] + hx, center[1] + hy, center[2] + hz],
    center: center
  };
}

// 射线与 AABB 相交检测
function rayAABBIntersect(rayOrigin, rayDir, boxMin, boxMax) {
  let tmin = -Infinity, tmax = Infinity;
  
  for (let i = 0; i < 3; i++) {
    if (Math.abs(rayDir[i]) < 0.0001) {
      // 射线平行于该轴，检查原点是否在边界内
      if (rayOrigin[i] < boxMin[i] || rayOrigin[i] > boxMax[i]) {
        // 射线平行于该轴且不在边界内，继续检查其他轴
        continue;
      }
    } else {
      const t1 = (boxMin[i] - rayOrigin[i]) / rayDir[i];
      const t2 = (boxMax[i] - rayOrigin[i]) / rayDir[i];
      const tEnter = Math.min(t1, t2);
      const tExit = Math.max(t1, t2);
      tmin = Math.max(tmin, tEnter);
      tmax = Math.min(tmax, tExit);
    }
  }
  
  // 如果 tmin > tmax，说明射线不与 AABB 相交
  if (tmin > tmax) return null;
  
  // 如果 tmax < 0，说明整个 AABB 在射线后方
  if (tmax < 0) return null;
  
  // 如果 tmin < 0，说明射线起点在 AABB 内部，返回 0
  if (tmin < 0) return 0;
  
  // 正常情况返回 tmin
  return tmin;
}

function draw(){
  const isDark = document.body.getAttribute('data-theme') !== 'light';
  if (isDark) gl.clearColor(0.23, 0.23, 0.23, 1);
  else gl.clearColor(1, 1, 1, 1);
  
  // 确保深度测试和背面剔始终启用
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.depthFunc(gl.LEQUAL);
  
  const projMat = [aspect*2**viewScale,0,0,0,0,2**viewScale,0,0,0,0,-1,19,0,0,-1,20];
  let vpMat = getRotY(viewYaw);
  vpMat = mulMat([1,0,0,0,0,Math.cos(viewPitch*deg),-Math.sin(viewPitch*deg),0,0,Math.sin(viewPitch*deg),Math.cos(viewPitch*deg),0,0,0,0,1], vpMat);
  vpMat = mulMat(projMat, vpMat);
  
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  
  // 设置平行光照方向（固定方向）
  gl.uniform3f(lightDirLoc, 0.5, 0.8, 1.0);
  
  // 更新坐标系罗盘
  updateCoordinateCompass(compassEnabled);
  
  // 绘制网格
  gl.bindVertexArray(gridVao);
  gl.uniform1i(texLoadedLoc, 0);
  gl.uniform1i(useCustomColorLoc, 0); // 确保网格使用默认颜色
  gl.uniformMatrix4fv(mvpMatLoc, false, tMat(vpMat));
  gl.uniformMatrix4fv(mAdjMatLoc, false, [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  gl.drawArrays(gl.LINES, 0, 44);
  
  // 绘制场景坐标轴
  gl.bindVertexArray(axisVao);
  gl.uniform1i(useCustomColorLoc, 0); // 确保坐标系使用默认颜色
  gl.uniformMatrix4fv(mvpMatLoc, false, tMat(vpMat));
  gl.drawArrays(gl.LINES, 0, 6);
  
  // 绘制模型
  models.forEach(model => {
    const mMat = getModelMatrix(model);
    let vao = blockVao;
    if (model.modelType === 'stairs') vao = stairsVao;
    else if (model.modelType === 'slab') vao = slabVao;
    else if (model.modelType === 'banner') vao = bannerVao;
    
    // 半砖、楼梯和旗帜禁用背面剔除以避免缺面
    if (model.modelType === 'stairs' || model.modelType === 'slab' || model.modelType === 'banner') {
      gl.disable(gl.CULL_FACE);
    }
    
    gl.bindVertexArray(vao);
    
    const texIdx = textures[model.texName] !== undefined ? textures[model.texName] : 0;
    const isLoaded = texLoaded[model.texName] || false;
    const useTex = model.modelType === 'block' || model.modelType === 'banner' || model.modelType === 'stairs' || model.modelType === 'slab';
    gl.uniform1i(texLoadedLoc, useTex ? (isLoaded ? 1 : 0) : 0);
    gl.uniform1i(texLoc, texIdx);
    
    // 设置自定义颜色
    if (model.modelType === 'stairs' || model.modelType === 'slab') {
      const color = model.customColor || '#ffffff';
      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;
      gl.uniform3f(customColorLoc, r, g, b);
      gl.uniform1i(useCustomColorLoc, 1);
    } else if (model.modelType === 'block') {
      // 对于普通方块，使用自定义颜色（如果有）
      if (model.customColor) {
        const color = model.customColor || '#ffffff';
        const r = parseInt(color.slice(1, 3), 16) / 255;
        const g = parseInt(color.slice(3, 5), 16) / 255;
        const b = parseInt(color.slice(5, 7), 16) / 255;
        gl.uniform3f(customColorLoc, r, g, b);
        gl.uniform1i(useCustomColorLoc, 1);
      } else {
        gl.uniform1i(useCustomColorLoc, 0);
      }
    } else {
      gl.uniform1i(useCustomColorLoc, 0);
    }
    
    gl.uniformMatrix4fv(mvpMatLoc, false, tMat(mulMat(vpMat, mMat)));
    gl.uniformMatrix4fv(mAdjMatLoc, false, adjMat(mMat));
    
    if (model.modelType === 'block') gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    else if (model.modelType === 'stairs') gl.drawArrays(gl.TRIANGLES, 0, 66);
    else if (model.modelType === 'slab') gl.drawArrays(gl.TRIANGLES, 0, 36);
    else if (model.modelType === 'banner') gl.drawArrays(gl.TRIANGLES, 0, 108);
    
    // 绘制楼梯、半砖和旗帜的边缘线
    if (model.modelType === 'stairs' || model.modelType === 'slab' || model.modelType === 'banner') {
      // 使用深度测试但启用混合，避免边缘线遮挡问题
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      // 设置边缘线颜色为黑色
      gl.uniform3f(customColorLoc, 0.0, 0.0, 0.0);
      gl.uniform1i(useCustomColorLoc, 1);
      
      // 绘制线框
      if (model.modelType === 'stairs') {
        gl.bindVertexArray(stairsWireframeVao);
        gl.drawArrays(gl.LINES, 0, 60); // 30条线 × 2个顶点
      } else if (model.modelType === 'slab') {
        gl.bindVertexArray(slabWireframeVao);
        gl.drawArrays(gl.LINES, 0, 48); // 24条线 × 2个顶点
      } else if (model.modelType === 'banner') {
        gl.bindVertexArray(bannerWireframeVao);
        gl.drawArrays(gl.LINES, 0, 72); // 36条线 × 2个顶点
      }
      
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
    }
    
    // 恢复背面剔除
    if (model.modelType === 'stairs' || model.modelType === 'slab' || model.modelType === 'banner') {
      gl.enable(gl.CULL_FACE);
    }
  });
  
  // 重置自定义颜色设置
  gl.uniform1i(useCustomColorLoc, 0);
  
  // 绘制选中模型的高光描边
  if (selectionHighlightEnabled) {
    if (activeModelId) {
      const model = models.find(m => m.id === activeModelId);
      if (model) {
        try {
          drawModelHighlight(model, vpMat);
        } catch (e) {
          console.error('绘制模型高光出错:', e);
        }
      }
    }
    else if (activeGroupId) {
      const group = modelGroups.find(g => g.id === activeGroupId);
      if (group) {
        group.modelIds.forEach(modelId => {
          const model = models.find(m => m.id === modelId);
          if (model) {
            try {
              drawModelHighlight(model, vpMat);
            } catch (e) {
              console.error('绘制模型高光出错:', e);
            }
          }
        });
      }
    }
  }
  
  // 绘制触控控件
  if (touchControlEnabled && activeModelId) {
    const model = models.find(m => m.id === activeModelId);
    if (model) {
      try {
        drawTouchControls(model, vpMat);
      } catch (e) {
        console.error('绘制触控控件出错:', e);
      }
    }
  }
  
  // 绘制骨骼调试
  if (isBoneDebugMode) {
    const parentModel = models.find(m => m.id === boneStep.boneParentModelId);
    const childModel = models.find(m => m.id === boneStep.boneChildModelId);
    
    if (parentModel && childModel) {
      // 高亮父级和子级模型
      try {
        drawModelHighlight(parentModel, vpMat);
        drawModelHighlight(childModel, vpMat);
      } catch (e) {
        console.error('绘制骨骼高亮出错:', e);
      }
      
      // 绘制连线
      try {
        drawBoneLine(parentModel, childModel, vpMat);
      } catch (e) {
        console.error('绘制骨骼连线出错:', e);
      }
    }
  }
  
  gl.flush();
}

// 绘制骨骼连线（简化版，先只高亮，之后可以改进）
function drawBoneLine(parentModel, childModel, vpMat) {
  // 暂时跳过，避免 WebGL 和 Canvas 2D 冲突
  // 功能已经基本实现，高亮已经在 draw() 中完成了
}

// 绘制模型高光描边（使用线框）
function drawModelHighlight(model, vpMat) {
  const mMat = getModelMatrix(model);
  
  gl.disable(gl.DEPTH_TEST);
  gl.bindVertexArray(highlightVao);
  gl.uniform1i(texLoadedLoc, 0);
  gl.uniformMatrix4fv(mvpMatLoc, false, tMat(mulMat(vpMat, mMat)));
  gl.uniformMatrix4fv(mAdjMatLoc, false, adjMat(mMat));
  gl.drawArrays(gl.LINES, 0, 24);
  
  // Extend版：绘制黄色箭头指示extend_xyrot旋转方向
  if (currentVersion === 'extend') {
    const d = model.varData;
    
    // 获取模型矩阵（包含xyzrot旋转）
    const mMat = getModelMatrix(model);
    
    // 计算箭头方向（使用与方块相同的欧拉角旋转顺序）
    // 方块的欧拉角顺序是：先绕X轴旋转，再绕Y轴旋转，最后绕Z轴旋转
    // 但这里我们只需要绕X轴和Y轴旋转，没有Z轴旋转
    const xRot = (d.extend_xrot ? d.extend_xrot.value : 0) * Math.PI / 180;
    const yRot = (d.extend_yrot ? d.extend_yrot.value : 0) * Math.PI / 180;
    
    // 计算旋转矩阵（先绕X轴旋转，再绕Y轴旋转）
    const cx = Math.cos(xRot), sx = Math.sin(xRot);
    const cy = Math.cos(yRot), sy = Math.sin(yRot);
    
    // 绕X轴旋转的矩阵
    const rotX = [
      1, 0, 0, 0,
      0, cx, -sx, 0,
      0, sx, cx, 0,
      0, 0, 0, 1
    ];
    
    // 绕Y轴旋转的矩阵
    const rotY = [
      cy, 0, sy, 0,
      0, 1, 0, 0,
      -sy, 0, cy, 0,
      0, 0, 0, 1
    ];
    
    // 箭头方向旋转矩阵 = 绕Y轴旋转 × 绕X轴旋转
    const dirRotMat = mulMat(rotY, rotX);
    
    // 箭头矩阵 = 模型矩阵 × 方向旋转
    // 这样箭头根部跟随方块xyzrot旋转，方向由extend_xyrot决定
    // 但箭头大小不受方块scale影响，所以需要创建一个不包含scale的模型矩阵
    const center = getModelCenter(model);
    const noScaleMat = getTrans(center[0], center[1], center[2]);
    const arrowMat = mulMat(dirRotMat, noScaleMat);
    
    gl.bindVertexArray(directionArrowVao);
    gl.uniformMatrix4fv(mvpMatLoc, false, tMat(mulMat(vpMat, arrowMat)));
    gl.uniformMatrix4fv(mAdjMatLoc, false, adjMat(arrowMat));
    gl.drawArrays(gl.LINES, 0, 10);
  }
  
  gl.enable(gl.DEPTH_TEST);
}

// 绘制触控控件
function drawTouchControls(model, vpMat) {
  const center = getModelCenter(model);
  const mMat = getModelMatrix(model);
  
  gl.disable(gl.DEPTH_TEST);
  
  if (touchMode === 'rotate') {
    gl.bindVertexArray(rotationRingVao);
    gl.uniform1i(texLoadedLoc, 0);
    gl.lineWidth(2.0);
    
    let rotMat = getTrans(center[0], center[1], center[2]);
    const xrotVal = model.varData.xrot ? model.varData.xrot.value : 0;
    const yrotVal = model.varData.yrot ? model.varData.yrot.value : 0;
    const zrotVal = model.varData.zrot ? model.varData.zrot.value : 0;
    rotMat = mulMat(getRotX(xrotVal), rotMat);
    rotMat = mulMat(getRotZ(zrotVal), rotMat);
    rotMat = mulMat(getRotY(yrotVal), rotMat);
    
    gl.uniformMatrix4fv(mvpMatLoc, false, tMat(mulMat(vpMat, rotMat)));
    gl.uniformMatrix4fv(mAdjMatLoc, false, adjMat(rotMat));
    gl.drawArrays(gl.LINES, 0, 96);
    
    if (selectedArrow) {
      gl.lineWidth(4.0);
      let startIdx, endIdx;
      switch (selectedArrow) {
        case 'x': startIdx = 0; endIdx = 32; break;
        case 'y': startIdx = 32; endIdx = 64; break;
        case 'z': startIdx = 64; endIdx = 96; break;
      }
      gl.drawArrays(gl.LINES, startIdx, endIdx - startIdx);
    }
    
    gl.lineWidth(1.0);
  } else {
    gl.bindVertexArray(arrowVao);
    gl.uniform1i(texLoadedLoc, 0);
    
    let arrowMat;
    if (touchMode === 'move') arrowMat = getTrans(center[0], center[1], center[2]);
    else {
      arrowMat = getTrans(center[0], center[1], center[2]);
      const xrotVal = model.varData.xrot ? model.varData.xrot.value : 0;
      const yrotVal = model.varData.yrot ? model.varData.yrot.value : 0;
      const zrotVal = model.varData.zrot ? model.varData.zrot.value : 0;
      arrowMat = mulMat(getRotX(xrotVal), arrowMat);
      arrowMat = mulMat(getRotZ(zrotVal), arrowMat);
      arrowMat = mulMat(getRotY(yrotVal), arrowMat);
    }
    
    gl.lineWidth(2.0);
    gl.uniformMatrix4fv(mvpMatLoc, false, tMat(mulMat(vpMat, arrowMat)));
    gl.uniformMatrix4fv(mAdjMatLoc, false, adjMat(arrowMat));
    gl.drawArrays(gl.LINES, 0, 18);
    
    if (selectedArrow) {
      gl.lineWidth(4.0);
      let startIdx, endIdx;
      switch (selectedArrow) {
        case 'x': startIdx = 0; endIdx = 6; break;
        case 'y': startIdx = 6; endIdx = 12; break;
        case 'z': startIdx = 12; endIdx = 18; break;
      }
      gl.drawArrays(gl.LINES, startIdx, endIdx - startIdx);
    }
    
    gl.lineWidth(1.0);
  }
  
  gl.enable(gl.DEPTH_TEST);
}

// ============ Blockbench风格触控系统 ============
function screenToWorldRay(screenX, screenY) {
  // 将屏幕坐标转换为 NDC 坐标 (-1 到 1)
  const ndcX = (screenX / canvas.width) * 2 - 1;
  const ndcY = -((screenY / canvas.height) * 2 - 1);
  
  // 计算相机位置（世界坐标）
  // 相机距离原点的距离
  const camDist = 19;
  
  // 相机位置 = 从原点出发，沿 viewYaw 和 viewPitch 方向的反方向
  const yawRad = viewYaw * deg;
  const pitchRad = viewPitch * deg;
  
  // 修复：相机应该从原点向外移动，而不是朝向原点
  const camX = camDist * Math.cos(pitchRad) * Math.sin(yawRad);
  const camY = camDist * Math.sin(pitchRad);
  const camZ = camDist * Math.cos(pitchRad) * Math.cos(yawRad);
  
  // 计算相机坐标系的前、右、上向量
  // 前向：从相机指向世界原点
  const forward = vec3.norm([-camX, -camY, -camZ]);
  
  // 右向量：与 forward 和 world up (0,1,0) 垂直
  const rightX = forward[2];
  const rightY = 0;
  const rightZ = -forward[0];
  const rightLen = Math.sqrt(rightX * rightX + rightZ * rightZ);
  const right = rightLen > 0.0001 ? [rightX / rightLen, 0, rightZ / rightLen] : [1, 0, 0];
  
  // 上向量：与 forward 和 right 垂直
  const up = vec3.norm([
    right[1] * forward[2] - right[2] * forward[1],
    right[2] * forward[0] - right[0] * forward[2],
    right[0] * forward[1] - right[1] * forward[0]
  ]);
  
  // 计算射线方向
  // 使用视场角和 NDC 坐标计算射线方向
  const fov = 60 * deg;
  const tanFov = Math.tan(fov / 2);
  
  // 射线方向 = forward + ndcX * tanFov * aspect * right + ndcY * tanFov * up
  const rayDir = vec3.norm([
    forward[0] + ndcX * tanFov * aspect * right[0] + ndcY * tanFov * up[0],
    forward[1] + ndcX * tanFov * aspect * right[1] + ndcY * tanFov * up[1],
    forward[2] + ndcX * tanFov * aspect * right[2] + ndcY * tanFov * up[2]
  ]);
  
  // 射线起点 = 相机位置
  const origin = [camX, camY, camZ];
  
  return { origin, dir: rayDir };
}

// 射线与线段相交检测
function rayLineIntersect(rayOrigin, rayDir, p1, p2, threshold) {
  const lineDir = vec3.sub(p2, p1);
  const lineLen = vec3.len(lineDir);
  const lineDirNorm = vec3.norm(lineDir);
  
  const w0 = vec3.sub(rayOrigin, p1);
  const a = vec3.dot(rayDir, rayDir);
  const b = vec3.dot(rayDir, lineDirNorm);
  const c = vec3.dot(lineDirNorm, lineDirNorm);
  const d = vec3.dot(rayDir, w0);
  const e = vec3.dot(lineDirNorm, w0);
  
  const denom = a * c - b * b;
  if (Math.abs(denom) < 0.0001) return null;
  
  const tc = (a * e - b * d) / denom;
  const sc = (c * d - b * e) / denom;
  
  if (tc < 0 || sc < 0 || sc > lineLen) return null;
  
  const closestOnRay = vec3.add(rayOrigin, vec3.mul(rayDir, tc));
  const closestOnLine = vec3.add(p1, vec3.mul(lineDirNorm, sc));
  const dist = vec3.len(vec3.sub(closestOnRay, closestOnLine));
  
  if (dist < threshold) return { t: tc, point: closestOnLine };
  return null;
}

// 拾取箭头
function pickArrow(screenX, screenY, model) {
  const ray = screenToWorldRay(screenX, screenY);
  const center = getModelCenter(model);
  const arrowLen = 0.8;
  
  let arrowMat;
  if (touchMode === 'move') arrowMat = getTrans(center[0], center[1], center[2]);
  else {
    arrowMat = getTrans(center[0], center[1], center[2]);
    arrowMat = mulMat(getRotX(model.varData.xrot.value), arrowMat);
    arrowMat = mulMat(getRotZ(model.varData.zrot.value), arrowMat);
    arrowMat = mulMat(getRotY(model.varData.yrot.value), arrowMat);
  }
  
  // 获取方块在屏幕上的投影中心
  const mMat = getModelMatrix(model);
  const modelCenter = getModelCenter(model);
  const modelBounds = getModelBounds(model);
  
  // 计算方块在屏幕上的投影
  const projMat = getProjMat();
  const viewMat = getViewMat();
  const mvpMat = mulMat(projMat, mulMat(viewMat, mMat));
  
  // 计算方块的8个顶点在屏幕上的投影
  const corners = [
    [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5],
    [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]
  ];
  
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  corners.forEach(corner => {
    const worldPos = mat4Vec3(mMat, corner);
    const clipPos = mat4Vec4(mvpMat, [...worldPos, 1]);
    const ndcPos = [clipPos[0]/clipPos[3], clipPos[1]/clipPos[3], clipPos[2]/clipPos[3]];
    const screenX = (ndcPos[0] + 1) * canvas.width / 2;
    const screenY = (1 - ndcPos[1]) * canvas.height / 2;
    minX = Math.min(minX, screenX);
    maxX = Math.max(maxX, screenX);
    minY = Math.min(minY, screenY);
    maxY = Math.max(maxY, screenY);
  });
  
  // 计算投影中心
  const projCenterX = (minX + maxX) / 2;
  const projCenterY = (minY + maxY) / 2;
  
  // 将箭头起点设置为投影中心
  const projCenterWorld = screenToWorld(projCenterX, projCenterY);
  
  const xStart = projCenterWorld;
  const xEnd = vec3.add(projCenterWorld, mat3Vec3(mat3FromMat4(arrowMat), [arrowLen, 0, 0]));
  const yStart = projCenterWorld;
  const yEnd = vec3.add(projCenterWorld, mat3Vec3(mat3FromMat4(arrowMat), [0, arrowLen, 0]));
  const zStart = projCenterWorld;
  const zEnd = vec3.add(projCenterWorld, mat3Vec3(mat3FromMat4(arrowMat), [0, 0, arrowLen]));
  
  const threshold = 0.15 * (2 ** viewScale);
  
  const xHit = rayLineIntersect(ray.origin, ray.dir, xStart, xEnd, threshold);
  const yHit = rayLineIntersect(ray.origin, ray.dir, yStart, yEnd, threshold);
  const zHit = rayLineIntersect(ray.origin, ray.dir, zStart, zEnd, threshold);
  
  let bestHit = null;
  let bestAxis = null;
  
  if (xHit && (!bestHit || xHit.t < bestHit.t)) { bestHit = xHit; bestAxis = 'x'; }
  if (yHit && (!bestHit || yHit.t < bestHit.t)) { bestHit = yHit; bestAxis = 'y'; }
  if (zHit && (!bestHit || zHit.t < bestHit.t)) { bestHit = zHit; bestAxis = 'z'; }
  
  return bestAxis;
}

// 拾取旋转圆环
function pickRotationRing(screenX, screenY, model) {
  const ray = screenToWorldRay(screenX, screenY);
  const center = getModelCenter(model);
  const radius = 0.7;
  
  let rotMat = getTrans(center[0], center[1], center[2]);
  rotMat = mulMat(getRotX(model.varData.xrot.value), rotMat);
  rotMat = mulMat(getRotZ(model.varData.zrot.value), rotMat);
  rotMat = mulMat(getRotY(model.varData.yrot.value), rotMat);
  
  const threshold = 0.15 * (2 ** viewScale);
  
  let bestHit = null;
  let bestAxis = null;
  
  for (let i = 0; i < 32; i++) {
    const angle1 = (i / 32) * Math.PI * 2;
    const angle2 = ((i + 1) / 32) * Math.PI * 2;
    const p1 = mat4Vec3(rotMat, [0, Math.cos(angle1) * radius, Math.sin(angle1) * radius]);
    const p2 = mat4Vec3(rotMat, [0, Math.cos(angle2) * radius, Math.sin(angle2) * radius]);
    const hit = rayLineIntersect(ray.origin, ray.dir, p1, p2, threshold);
    if (hit && (!bestHit || hit.t < bestHit.t)) { bestHit = hit; bestAxis = 'x'; }
  }
  
  for (let i = 0; i < 32; i++) {
    const angle1 = (i / 32) * Math.PI * 2;
    const angle2 = ((i + 1) / 32) * Math.PI * 2;
    const p1 = mat4Vec3(rotMat, [Math.cos(angle1) * radius, 0, Math.sin(angle1) * radius]);
    const p2 = mat4Vec3(rotMat, [Math.cos(angle2) * radius, 0, Math.sin(angle2) * radius]);
    const hit = rayLineIntersect(ray.origin, ray.dir, p1, p2, threshold);
    if (hit && (!bestHit || hit.t < bestHit.t)) { bestHit = hit; bestAxis = 'y'; }
  }
  
  for (let i = 0; i < 32; i++) {
    const angle1 = (i / 32) * Math.PI * 2;
    const angle2 = ((i + 1) / 32) * Math.PI * 2;
    const p1 = mat4Vec3(rotMat, [Math.cos(angle1) * radius, Math.sin(angle1) * radius, 0]);
    const p2 = mat4Vec3(rotMat, [Math.cos(angle2) * radius, Math.sin(angle2) * radius, 0]);
    const hit = rayLineIntersect(ray.origin, ray.dir, p1, p2, threshold);
    if (hit && (!bestHit || hit.t < bestHit.t)) { bestHit = hit; bestAxis = 'z'; }
  }
  
  return bestAxis;
}

// 箭头拖动处理
function handleArrowDrag(dx, dy, axis) {
  if (!activeModelId) return;
  const model = models.find(m => m.id === activeModelId);
  if (!model) return;
  
  const sensitivity = 0.05;
  
  switch (touchMode) {
    case 'move':
      if (axis === 'y') model.varData.ypos.value -= dy * sensitivity;
      else if (axis === 'x') model.varData.xpos.value += dx * sensitivity;
      else if (axis === 'z') model.varData.zpos.value -= dy * sensitivity;
      break;
    case 'base':
      if (axis === 'y') model.varData.ybasepos.value -= dy * sensitivity;
      else if (axis === 'x') model.varData.xbasepos.value += dx * sensitivity;
      else if (axis === 'z') model.varData.zbasepos.value -= dy * sensitivity;
      break;
    case 'scale':
      const scaleDelta = (dx - dy) * 0.01;
      if (axis === 'y') model.varData.yscale.value = Math.max(0.1, model.varData.yscale.value + scaleDelta);
      else if (axis === 'x' || axis === 'z') model.varData.xzscale.value = Math.max(0.1, model.varData.xzscale.value + scaleDelta);
      break;
  }
  
  hasUnsavedChanges = true;
  updateControlInputs();
  updateCmdOutput();
  draw();
}

// 旋转拖动处理
function handleRotateDrag(dx, dy, axis) {
  if (!activeModelId) return;
  const model = models.find(m => m.id === activeModelId);
  if (!model) return;
  
  const sensitivity = 0.5;
  
  if (axis === 'x') model.varData.xrot.value += dy * sensitivity;
  else if (axis === 'y') model.varData.yrot.value += dx * sensitivity;
  else if (axis === 'z') model.varData.zrot.value += dx * sensitivity;
  
  hasUnsavedChanges = true;
  updateControlInputs();
  updateCmdOutput();
  draw();
}

function updateControlInputs() {
  if (!activeModelId) return;
  const model = models.find(m => m.id === activeModelId);
  if (!model) return;
  varDefsTemplate.forEach(def => {
    const value = model.varData[def.name].value;
    const numInput = document.getElementById(def.name + 'N');
    const rangeInput = document.getElementById(def.name + 'R');
    if (numInput) numInput.value = value;
    if (rangeInput) rangeInput.value = value;
  });
}

// ============ 输入处理 ============
function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: (clientX - rect.left) * window.devicePixelRatio, y: (clientY - rect.top) * window.devicePixelRatio };
}

function getTouchDistance(e) {
  if (e.touches.length < 2) return 0;
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// 从鼠标位置拾取模型
function pickModel(x, y) {
  const ray = screenToWorldRay(x, y);
  
  let closestModel = null;
  let closestDistance = Infinity;
  
  models.forEach(model => {
    const bounds = getModelBounds(model);
    const t = rayAABBIntersect(ray.origin, ray.dir, bounds.min, bounds.max);
    // 只考虑正距离的交点（在相机前方），并且设置最大检测距离
    if (t !== null && t >= 0 && t < closestDistance && t < 1000) {
      closestDistance = t;
      closestModel = model;
    }
  });
  
  return closestModel;
}

// 鼠标事件
canvas.addEventListener("mousedown", e => {
  if (e.button !== 0) return;
  const pos = getCanvasPos(e);
  
  // 记录点击起始位置和时间（用于区分点击和滑动）
  clickStartPos = { x: pos.x, y: pos.y };
  clickStartTime = Date.now();
  

  
  // 准备视图拖拽（但不立即设置isDraggingView，等待mousemove确认）
  lastMousePos = pos;
  canvas.style.cursor = 'grabbing';
});

canvas.addEventListener("mousemove", e => {
  const pos = getCanvasPos(e);
  
  // 检测是否开始拖拽视图（只在鼠标按下时检测）
  if (e.buttons === 1 && clickStartPos && !isDraggingView && !isDraggingArrow) {
    const dx = pos.x - clickStartPos.x;
    const dy = pos.y - clickStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > CLICK_THRESHOLD) {
      isDraggingView = true;
    }
  }
  
  if (isDraggingView) {
    const dx = pos.x - lastMousePos.x;
    const dy = pos.y - lastMousePos.y;
    viewYaw = (viewYaw - dx * 0.3) % 360;
    viewPitch = Math.max(-89, Math.min(89, viewPitch + dy * 0.3));
    lastMousePos = pos;
    draw();
  }
});

canvas.addEventListener("mouseup", e => {
  const pos = getCanvasPos(e);
  
  // 检测是否为点击（而非滑动）
  if (clickStartPos && !isDraggingView && !isDraggingArrow) {
    const dx = pos.x - clickStartPos.x;
    const dy = pos.y - clickStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const timeDiff = Date.now() - clickStartTime;
    
    // 移动距离小且时间短，视为点击
    if (distance < CLICK_THRESHOLD && timeDiff < CLICK_TIME_THRESHOLD) {
      // 视图选中功能
      if (viewSelectionEnabled) {
        const clickedModel = pickModel(pos.x, pos.y);
        if (clickedModel) {
          selectModel(clickedModel.id);
        } else {
          // 点击空白处取消选中
          selectModel(null);
        }
      }
    }
  }
  
  isDraggingView = false;
  isDraggingArrow = false;
  selectedArrow = null;
  clickStartPos = null;
  canvas.style.cursor = 'grab';
  draw();
});

canvas.addEventListener("mouseleave", () => {
  isDraggingView = false;
  isDraggingArrow = false;
  selectedArrow = null;
  canvas.style.cursor = 'grab';
  draw();
});

canvas.addEventListener("wheel", e => { e.preventDefault(); viewScale -= e.deltaY * 0.002; viewScale = Math.max(0.5, Math.min(5, viewScale)); draw(); }, { passive: false });

// 触摸事件
canvas.addEventListener("touchstart", e => {
  if (currentVersion === 'extend') {
    // Extend版的触摸处理方式
    e.preventDefault();
    if (e.touches.length === 1) {
      const pos = getCanvasPos(e);
      
      // 记录点击起始位置和时间（用于区分点击和滑动）
      clickStartPos = { x: pos.x, y: pos.y };
      clickStartTime = Date.now();
      

      
      // 处理视图拖拽
      isDraggingView = true;
      lastMousePos = pos;
    } else if (e.touches.length === 2) {
      isDraggingView = false;
      isDraggingArrow = false;
      clickStartPos = null;
      touchStartDist = getTouchDistance(e);
      touchStartScale = viewScale;
    }
  } else {
    // Base版的触摸处理方式
    e.preventDefault();
    if (e.touches.length === 1) {
      const pos = getCanvasPos(e);
      
      // 记录点击起始位置和时间
      clickStartPos = { x: pos.x, y: pos.y };
      clickStartTime = Date.now();
      

      
      isDraggingView = true;
      lastMousePos = pos;
    } else if (e.touches.length === 2) {
      isDraggingView = false;
      isDraggingArrow = false;
      touchStartDist = getTouchDistance(e);
      touchStartScale = viewScale;
    }
  }
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  if (e.touches.length === 1) {
    const pos = getCanvasPos(e);
    
    if (isDraggingView) {
    const dx = pos.x - lastMousePos.x;
    const dy = pos.y - lastMousePos.y;
    viewYaw = (viewYaw - dx * 0.3) % 360;
    viewPitch = Math.max(-89, Math.min(89, viewPitch + dy * 0.3));
    lastMousePos = pos;
    draw();
  }
  } else if (e.touches.length === 2) {
    const dist = getTouchDistance(e);
    if (touchStartDist > 0) {
      // 修复：手指分开(dist变大)应该放大，所以用 dist / touchStartDist
      viewScale = touchStartScale * (dist / touchStartDist);
      viewScale = Math.max(0.5, Math.min(5, viewScale));
      draw();
    }
  }
}, { passive: false });

canvas.addEventListener("touchend", e => {
  if (e.touches.length === 0) { 
    // 检测是否为点击（而非滑动）
    if (clickStartPos && !isDraggingArrow) {
      const timeDiff = Date.now() - clickStartTime;
      
      // 时间短且没有发生拖拽，视为点击
      if (timeDiff < CLICK_TIME_THRESHOLD && !isDraggingView) {
        // 视图选中功能
        if (viewSelectionEnabled) {
          const clickedModel = pickModel(clickStartPos.x, clickStartPos.y);
          if (clickedModel) {
            selectModel(clickedModel.id);
          } else {
            // 点击空白处取消选中
            selectModel(null);
          }
        }
      }
    }
    
    isDraggingView = false; 
    isDraggingArrow = false;
    selectedArrow = null;
    clickStartPos = null;
    draw();
  }
  else if (e.touches.length === 1) { 
    isDraggingView = true; 
    lastMousePos = getCanvasPos(e); 
  }
});

canvas.addEventListener("touchcancel", () => { 
  isDraggingView = false; 
  isDraggingArrow = false;
  selectedArrow = null;
  draw();
});

window.addEventListener("resize", () => { resize(); draw(); });
resize();

// 加载纹理
texNames.forEach((name,i)=>{
  const img=new Image();
  img.src=`./${name}.png`;
  img.onload=()=>{
    gl.activeTexture(gl.TEXTURE0+i);
    const t=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,t);
    // 修复跨域问题和纹理参数
    img.crossOrigin = 'anonymous';
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    texLoaded[name] = true; textures[name] = i; draw();
  };
  img.onerror = () => { texLoaded[name] = false; draw(); };
});

// 初始化自定义颜色纹理（默认白色）
// updateCustomColorTexture('#ffffff');

// ============ 动画指令输出 ============
function updateCmdOutput() {
  const output = document.getElementById('cmdOutput');
  if (!output) return;
  if (models.length === 0) { output.textContent = '// 暂无模型'; return; }
  
  let outputText = '';
  
  // 输出内置变量和Molang编辑栏内容
  const commands = [];
  models.forEach((model, idx) => {
    let molang = '';
    // 只包含当前模型的变量
    Object.entries(model.varData).forEach(([key, d]) => {
      if (d.value !== d.init && d.value !== 0) molang += `v.${d.name}=${num2str(d.value)}; `;
    });
    // 只包含当前模型的 Molang 代码
    if (model.molangCode && model.molangCode.trim() && !model.hasError) {
      molang += model.molangCode.trim();
    }
    if (molang) {
      if (currentVersion === 'extend') {
        // Extend版的导出命令
        commands.push(`playanimation @e[name=${model.name}] animation.player.attack.positions _ 0 "${molang.trim()}" Extend Value`);
      } else {
        // Base版的导出命令
        const tag = idx === 0 ? "fmbe" : `fmbe_${idx}`;
        commands.push(`playanimation @e[tag=${tag}] animation.player.attack.positions _ 0 "${molang.trim()}" setValue`);
      }
    }
  });
  
  if (commands.length > 0) {
    outputText += '// 内置变量和Molang编辑栏内容\n';
    outputText += commands.join('\n\n') + '\n\n';
  }
  
  // 输出预设动画内容
  const model = getActiveModel();
  if (model && model.presetAnimations && model.presetAnimations.length > 0) {
    outputText += '// 预设动画内容\n';
    model.presetAnimations.forEach(preset => {
      if (preset.molangCode && preset.molangCode.trim() && !preset.hasError) {
        // 添加自增代码到预设动画的开头
        const fullCode = `${preset.timelineVariable}=${preset.timelineVariable}+${preset.incrementStep}; ${preset.molangCode.trim()}`;
        outputText += `// '${preset.name}'预设动画编辑栏Molang\n`;
        outputText += `// ${fullCode}\n\n`;
      }
    });
  }
  
  output.textContent = outputText || '// 所有模型使用默认值';
}

// ============ Molang 执行 ============
function toggleMolangExecution() {
  const btn = document.getElementById('molangToggleBtn');
  if (isMolangRunning) {
    stopMolangExecution();
    btn.innerHTML = '<span>▶</span> 执行';
    btn.classList.remove('running');
  } else {
    const hasErrors = models.some(m => m.hasError);
    if (hasErrors) { alert('请先修复Molang代码中的错误'); return; }
    startMolangExecution();
    btn.innerHTML = '<span>■</span> 停止';
    btn.classList.add('running');
  }
}

function startMolangExecution() {
  if (isMolangRunning) return;
  isMolangRunning = true;
  
  // 使用setInterval实现精确的FPS执行
  molangIntervalId = setInterval(() => {
    if (!isMolangRunning) return;
    
    // 执行Molang编辑栏代码
    models.forEach(model => { 
      if (model.molangCode && model.molangCode.trim()) executeModelMolang(model); 
    });
    
    // 更新错误显示
    const activeModel = models.find(m => m.id === activeModelId);
    if (activeModel) {
      const errorDiv = document.getElementById('molangError');
      const textarea = document.getElementById('molangCode');
      if (errorDiv && textarea) {
        if (activeModel.hasError) {
          textarea.classList.add('error');
          errorDiv.textContent = activeModel.errorMsg;
        } else {
          textarea.classList.remove('error');
          errorDiv.textContent = '';
        }
      }
    }
    
    updateControlInputs(); 
    updateCmdOutput(); 
    draw();
  }, 1000 / molangFps); // 使用统一的FPS
}

// ============ 预设动画执行 ============
function startPresetAnimationExecution() {
  if (isPresetAnimationRunning) return;
  isPresetAnimationRunning = true;
  
  // 使用setInterval实现精确的FPS执行
  presetAnimationIntervalId = setInterval(() => {
    if (!isPresetAnimationRunning) return;
    
    // 执行当前模型正在运行的预设动画
    const model = getActiveModel();
    if (model && model.presetAnimations) {
      model.presetAnimations.forEach(preset => {
        if (preset.isRunning) {
          executePresetAnimation(preset);
        }
      });
    }
    
    updateControlInputs(); 
    updateCmdOutput(); 
    draw();
  }, 1000 / molangFps); // 使用统一的FPS
}

function stopPresetAnimationExecution() {
  isPresetAnimationRunning = false;
  if (presetAnimationIntervalId) { 
    clearInterval(presetAnimationIntervalId); 
    presetAnimationIntervalId = null; 
  }
}

// 更新Molang执行速率
function updateMolangFps() {
  const fpsInput = document.getElementById('molangFps');
  let newFps = parseInt(fpsInput.value);
  
  // 验证FPS值
  if (isNaN(newFps) || newFps < 1) {
    newFps = 1;
  } else if (newFps > 120) {
    newFps = 120;
  }
  
  molangFps = newFps;
  fpsInput.value = molangFps;
  
  // 保存到localStorage
  localStorage.setItem('molangFps', molangFps);
  
  // 如果有循环正在运行，重启循环以应用新速率
  if (isMolangRunning) {
    stopMolangExecution();
    startMolangExecution();
    const molangBtn = document.getElementById('molangToggleBtn');
    if (molangBtn) {
      molangBtn.innerHTML = '<span>■</span> 停止';
      molangBtn.classList.add('running');
    }
  }
  
  if (isPresetAnimationRunning) {
    stopPresetAnimationExecution();
    startPresetAnimationExecution();
  }
}

function stopMolangExecution() {
  isMolangRunning = false;
  if (molangIntervalId) { 
    clearInterval(molangIntervalId); 
    molangIntervalId = null; 
  }
}

function executeModelMolang(model) {
  const code = model.molangCode || '';
  if (!code.trim()) return null;
  try {
    const lexer = new MolangLexer(code);
    const tokens = lexer.tokenize();
    if (lexer.error) { model.hasError = true; model.errorMsg = '语法错误: ' + lexer.error; return null; }
    const executor = new MolangExecutor(model);
    const result = executor.execute(tokens);
    if (executor.error) { model.hasError = true; model.errorMsg = '运行时错误: ' + executor.error; return null; }
    model.hasError = false; model.errorMsg = '';
    return result;
  } catch (e) { model.hasError = true; model.errorMsg = '错误: ' + e.message; return null; }
}

// ============ 页面切换 ============
function switchPage(pageName) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.page === pageName));
  
  // 隐藏/显示预览视图
  const previewSection = document.getElementById('previewSection');
  if (previewSection) {
    if (pageName === 'more') {
      previewSection.style.display = 'none';
      document.body.classList.add('more-page-active');
    } else {
      previewSection.style.display = '';
      document.body.classList.remove('more-page-active');
    }
  }
  
  const allPages = document.querySelectorAll('.page-content');
  
  if (screenAnimationEnabled) {
    // 启用动画模式：移除所有页面的 no-anim 类
    allPages.forEach(page => page.classList.remove('no-anim'));
    
    // 找到当前活动的页面
    const currentActivePage = Array.from(allPages).find(page => page.classList.contains('active'));
    
    if (currentActivePage) {
      // 先淡出当前页面
      currentActivePage.style.opacity = '0';
      currentActivePage.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        // 移除当前页面的 active
        allPages.forEach(page => page.classList.remove('active'));
        currentActivePage.style.opacity = '';
        currentActivePage.style.transform = '';
        
        // 显示新页面
        const targetPage = document.getElementById('page-' + pageName);
        if (targetPage) {
          // 重新添加 active，触发动画
          targetPage.classList.add('active');
        }
        
        if (pageName === 'control') renderControlPage();
        if (pageName === 'animation') renderAnimationPage();
        if (pageName === 'output') updateCmdOutput();
      }, 200); // 动画时间与 CSS 中的 transition 一致
    } else {
      // 没有当前活动页面，直接显示
      allPages.forEach(page => page.classList.remove('active'));
      const targetPage = document.getElementById('page-' + pageName);
      if (targetPage) targetPage.classList.add('active');
      if (pageName === 'control') renderControlPage();
      if (pageName === 'animation') renderAnimationPage();
      if (pageName === 'output') updateCmdOutput();
    }
  } else {
    // 禁用动画模式：添加 no-anim 类，快速切换
    allPages.forEach(page => page.classList.add('no-anim'));
    allPages.forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById('page-' + pageName);
    if (targetPage) targetPage.classList.add('active');
    if (pageName === 'control') renderControlPage();
    if (pageName === 'animation') renderAnimationPage();
    if (pageName === 'output') updateCmdOutput();
  }
}

// ============ 版本切换 ============
function switchVersion() {
  if (hasUnsavedChanges) {
    if (!confirm('当前有未保存的更改，是否继续切换版本？切换后当前版本的方块数据将不保留。')) {
      return;
    }
  }
  
  // 切换版本
  currentVersion = currentVersion === 'base' ? 'extend' : 'base';
  
  // 更新按钮文本
  const versionBtn = document.getElementById('versionSwitchBtn');
  versionBtn.textContent = `切换到${currentVersion === 'base' ? 'Extend' : 'Base'}版`;
  
  // 重置数据
  models = [];
  modelGroups = [];
  activeModelId = null;
  activeGroupId = null;
  modelCounter = 0;
  groupCounter = 0;
  hasUnsavedChanges = false;
  
  // 重新初始化
  renderModelList();
  renderControlPage();
  renderAnimationPage();
  updateCmdOutput();
  draw();
  
  alert(`已切换到${currentVersion === 'base' ? 'Base' : 'Extend'}版本`);
}

// ============ 弹窗系统 ============
let confirmCallback = null;
function showConfirm(title, message, onConfirm) {
  confirmCallback = onConfirm;
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmModal').classList.add('active');
}
function hideConfirm() { document.getElementById('confirmModal').classList.remove('active'); confirmCallback = null; }
function showSaveModal() { document.getElementById('saveNameInput').value = ''; document.getElementById('saveModal').classList.add('active'); }
function hideSaveModal() { document.getElementById('saveModal').classList.remove('active'); }
function showImportModal() {
  if (hasUnsavedChanges) {
    showConfirm('未保存的数据', '当前数据还未保存，是否继续？', () => { renderImportList(); document.getElementById('importModal').classList.add('active'); });
  } else { renderImportList(); document.getElementById('importModal').classList.add('active'); }
}
function hideImportModal() { document.getElementById('importModal').classList.remove('active'); }
function showShareModal() { document.getElementById('exportTextarea').value = generateExportData(); document.getElementById('exportModal').classList.add('active'); }
function hideShareModal() { document.getElementById('exportModal').classList.remove('active'); }

function renderImportList() {
  const container = document.getElementById('importList');
  const saves = Object.keys(savedData);
  if (saves.length === 0) { container.innerHTML = '<div class="empty-state">暂无保存的数据</div>'; return; }
  container.innerHTML = saves.map(name => {
    const version = savedData[name].version ? ` (${savedData[name].version === 'base' ? 'Base' : 'Extend'}版)` : '';
    return `<div class="save-item" data-name="${name}">${name}${version}</div>`;
  }).join('');
  container.querySelectorAll('.save-item').forEach(el => {
    el.addEventListener('click', () => { document.getElementById('importTextarea').value = JSON.stringify(savedData[el.dataset.name], null, 2); });
  });
}

// ============ 文件操作 ============
function generateExportData() {
  const data = {
    version: '1.0',
    models: models.map(m => ({ 
      id: m.id, 
      name: m.name, 
      texName: m.texName, 
      modelType: m.modelType, 
      varData: Object.fromEntries(Object.entries(m.varData).map(([k, v]) => [k, v.value])), 
      molangCode: m.molangCode,
      customColor: m.customColor
    })),
    modelGroups: modelGroups.map(g => ({
      id: g.id,
      name: g.name,
      modelIds: [...g.modelIds],
      varData: Object.fromEntries(Object.entries(g.varData).map(([k, v]) => [k, v.value]))
    }))
  };
  return JSON.stringify(data, null, 2);
}

function saveData() {
  const name = document.getElementById('saveNameInput').value.trim();
  if (!name) { alert('请输入保存名称'); return; }
  const data = {
    version: currentVersion,
    models: models.map(m => ({ id: m.id, name: m.name, texName: m.texName, modelType: m.modelType, varData: Object.fromEntries(Object.entries(m.varData).map(([k, v]) => [k, v.value])), originalValues: {...m.originalValues}, molangCode: m.molangCode, molangVars: {...m.molangVars}, customColor: m.customColor })),
    modelGroups: modelGroups.map(g => ({
      id: g.id,
      name: g.name,
      modelIds: [...g.modelIds],
      varData: Object.fromEntries(Object.entries(g.varData).map(([k, v]) => [k, v.value])),
      originalValues: {...g.originalValues}
    })),
    modelCounter: modelCounter,
    groupCounter: groupCounter
  };
  // 保存到localStorage
  let localSavedData = JSON.parse(localStorage.getItem('savedData') || '{}');
  localSavedData[name] = data;
  localStorage.setItem('savedData', JSON.stringify(localSavedData));
  
  savedData = localSavedData; hasUnsavedChanges = false; hideSaveModal(); alert('保存成功！');
}

function importData() {
  const text = document.getElementById('importTextarea').value.trim();
  if (!text) { alert('请选择或粘贴要导入的数据'); return; }
  
  // 先尝试解析为动画指令文本
  try {
    const commands = text.split(/\n\n+/).filter(cmd => cmd.trim());
    let parsedModels = []; // 临时存储解析的模型数据
    
    commands.forEach((cmd, idx) => {
        // 匹配 playanimation 指令格式，支持中文标签名和更灵活的空格处理
        const match = cmd.match(/playanimation\s+@e\[(?:name|tag)=([^\]]+)\]\s+animation\.player\.attack\.positions\s+_\s+0\s+"([^"]+)"\s*(?:Extend Value|setValue)?/i);
        if (match) {
        const [_, name, molangCode] = match;
        const modelData = {
          name: name,
          molangCode: molangCode,
          varData: {}
        };
        
        // 解析内置变量：只有内置变量名=后面是数字才是用户修改的内置变量
        // 使用正则表达式匹配所有变量赋值
        const varRegex = /v\.(\w+)\s*=\s*(-?\d+(?:\.\d+)?)/g;
        let varMatch;
        while ((varMatch = varRegex.exec(molangCode)) !== null) {
          const varName = varMatch[1];
          const varValue = varMatch[2];
          // 只有内置变量才会赋值给方块对应变量
          if (varDefsTemplate.some(d => d.name === varName)) {
            modelData.varData[varName] = { name: varName, value: parseFloat(varValue), init: varDefsTemplate.find(d => d.name === varName)?.init || 0 };
          }
        }
        
        // 从 molangCode 中移除所有内置变量的赋值语句，只保留用户自定义变量
        let filteredMolang = molangCode;
        varDefsTemplate.forEach(def => {
          // 匹配 v.变量名=数值; 的格式，支持分号和空格
          const builtinVarRegex = new RegExp(`v\\.${def.name}\\s*=\\s*(-?\\d+(?:\\.\\d+)?)\\s*;?\\s*`, 'g');
          filteredMolang = filteredMolang.replace(builtinVarRegex, '');
        });
        // 清理多余的空格和换行
        filteredMolang = filteredMolang.replace(/\s+/g, ' ').trim();
        modelData.molangCode = filteredMolang;
        
        // 调试信息
        console.log(`解析模型 ${idx + 1}:`, modelData);
        
        parsedModels.push(modelData);
      } else {
        // 调试：打印无法匹配的命令
        console.log('无法匹配的命令:', cmd);
      }
    });
    
    // 如果解析到了模型指令
    if (parsedModels.length > 0) {
      // 清空之前的模型，只保留导入的模型
      models = [];
      modelCounter = 0;
      
      // 创建新模型
      parsedModels.forEach(modelData => {
        // 调试信息
        console.log('创建模型:', modelData);
        
        const newModel = {
          id: modelCounter++,
          name: modelData.name,
          texName: 'diamond_block',
          modelType: 'block',
          varData: {},
          originalValues: {},
          molangCode: modelData.molangCode,
          molangVars: {},
          hasError: false,
          errorMsg: '',
          customColor: '#ff0000'
        };
        // 初始化所有内置变量
        varDefsTemplate.forEach(def => {
          newModel.varData[def.name] = { name: def.name, value: def.init, init: def.init };
          newModel.originalValues[def.name] = def.init;
        });
        // 应用解析的变量值
        Object.assign(newModel.varData, modelData.varData);
        
        // 调试信息
        console.log('创建的模型:', newModel);
        
        models.push(newModel);
      });
      
      activeModelId = models.length > 0 ? models[0].id : null;
      hasUnsavedChanges = false; hideImportModal(); renderModelList(); renderControlPage(); renderAnimationPage(); updateCmdOutput(); draw(); alert('导入成功！');
      return;
    }
  } catch (e) {
    // 动画指令解析失败，继续尝试 JSON 解析
    console.log('动画指令解析失败:', e);
  }
  
  // 如果没有匹配到动画指令，尝试解析为JSON数据
  try {
    const data = JSON.parse(text);
    
    // 检查版本
    if (data.version && data.version !== currentVersion) {
      if (currentVersion === 'extend' && data.version === 'base') {
        alert('Extend版无法导入Base版保存的数据');
        return;
      }
    }
    
    if (data.models) {
      models = data.models.map(m => ({ id: m.id, name: m.name, texName: m.texName, modelType: m.modelType || 'block', varData: Object.fromEntries(Object.entries(m.varData).map(([k, v]) => [k, {name: k, value: v, init: varDefsTemplate.find(d => d.name === k)?.init || 0}])), originalValues: m.originalValues || {}, molangCode: m.molangCode || '', molangVars: m.molangVars || {}, hasError: false, errorMsg: '', customColor: '#ff0000' }));
      modelCounter = data.modelCounter || models.length;
      activeModelId = models.length > 0 ? models[0].id : null;
    }
    hasUnsavedChanges = false; hideImportModal(); renderModelList(); renderControlPage(); renderAnimationPage(); updateCmdOutput(); draw(); alert('导入成功！');
  } catch (e) {
    alert('导入失败：数据格式错误');
  }
}

// ============ 主题切换 ============
function setTheme(theme) {
  const body = document.body;
  body.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.classList.toggle('active', theme === 'light');
  }
  
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.theme === theme);
  });
  
  // 显示/隐藏自定义主题设置
  const customThemeSettings = document.getElementById('customThemeSettings');
  if (customThemeSettings) {
    customThemeSettings.style.display = theme === 'custom' ? 'block' : 'none';
  }
  
  // 应用自定义主题颜色
  if (theme === 'custom') {
    applyCustomTheme();
  } else {
    // 移除自定义主题样式
    removeCustomThemeStyles();
  }
  
  draw();
}

// 应用自定义主题颜色
function applyCustomTheme() {
  const bgColor = localStorage.getItem('customBgColor') || '#1a1a1a';
  const btnColor = localStorage.getItem('customBtnColor') || '#4a90e2';
  
  // 更新颜色选择器显示
  const bgColorPicker = document.getElementById('bgColorPicker');
  const bgColorText = document.getElementById('bgColorText');
  const btnColorPicker = document.getElementById('btnColorPicker');
  const btnColorText = document.getElementById('btnColorText');
  
  if (bgColorPicker) bgColorPicker.value = bgColor;
  if (bgColorText) bgColorText.value = bgColor;
  if (btnColorPicker) btnColorPicker.value = btnColor;
  if (btnColorText) btnColorText.value = btnColor;
  
  // 更新主题预览
  const customBgColor = document.getElementById('customBgColor');
  const customBtnColor = document.getElementById('customBtnColor');
  if (customBgColor) customBgColor.style.backgroundColor = bgColor;
  if (customBtnColor) customBtnColor.style.backgroundColor = btnColor;
  
  // 创建样式表
  let style = document.getElementById('customThemeStyle');
  if (!style) {
    style = document.createElement('style');
    style.id = 'customThemeStyle';
    document.head.appendChild(style);
  }
  
  // 应用自定义样式
  style.textContent = `
    body[data-theme="custom"] {
      --bg-primary: ${bgColor};
      --bg-secondary: ${darkenColor(bgColor, 10)};
      --bg-tertiary: ${darkenColor(bgColor, 20)};
    }
    body[data-theme="custom"] {
      background-color: var(--bg-primary);
    }
    body[data-theme="custom"] .panel,
    body[data-theme="custom"] .modal-content,
    body[data-theme="custom"] .tab-bar,
    body[data-theme="custom"] .tab,
    body[data-theme="custom"] .btn-secondary,
    body[data-theme="custom"] .setting-item,
    body[data-theme="custom"] .molang-editor,
    body[data-theme="custom"] textarea,
    body[data-theme="custom"] select {
      background-color: var(--bg-secondary);
    }
    body[data-theme="custom"] .btn-primary {
      background-color: ${btnColor};
      border-color: ${btnColor};
    }
    body[data-theme="custom"] .btn-primary:hover {
      background-color: ${lightenColor(btnColor, 10)};
      border-color: ${lightenColor(btnColor, 10)};
    }
    body[data-theme="custom"] .tab.active {
      background-color: ${btnColor};
    }
    body[data-theme="custom"] .theme-preview.active {
      border-color: ${btnColor};
    }
    /* 滑动条样式 */
    body[data-theme="custom"] input[type="range"]::-webkit-slider-thumb {
      background-color: ${btnColor};
    }
    body[data-theme="custom"] input[type="range"]::-moz-range-thumb {
      background-color: ${btnColor};
    }
    body[data-theme="custom"] input[type="range"]::-ms-thumb {
      background-color: ${btnColor};
    }
    /* 顶栏和边框 */
    body[data-theme="custom"] .tab-bar {
      border-bottom-color: ${btnColor};
    }
    body[data-theme="custom"] .panel-header {
      border-bottom-color: ${btnColor};
    }
    body[data-theme="custom"] .setting-item {
      border-bottom-color: ${darkenColor(bgColor, 20)};
    }
    /* 滑块按钮 */
    body[data-theme="custom"] .slider-btn {
      background-color: ${btnColor};
    }
    body[data-theme="custom"] .slider-btn:hover {
      background-color: ${lightenColor(btnColor, 10)};
    }
    /* 输入框边框 */
    body[data-theme="custom"] input[type="text"],
    body[data-theme="custom"] input[type="number"] {
      border-color: ${btnColor};
    }
    body[data-theme="custom"] input[type="text"]:focus,
    body[data-theme="custom"] input[type="number"]:focus {
      border-color: ${lightenColor(btnColor, 10)};
    }
  `;
}

// 移除自定义主题样式
function removeCustomThemeStyles() {
  const style = document.getElementById('customThemeStyle');
  if (style) {
    style.remove();
  }
}

// 辅助函数：调整颜色亮度
function lightenColor(color, percent) {
  color = color.replace(/^#/, '');
  const num = parseInt(color, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// 辅助函数：加深颜色
function darkenColor(color, percent) {
  color = color.replace(/^#/, '');
  const num = parseInt(color, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (0x1000000 + (R > 0 ? R < 256 ? R : 255 : 0) * 0x10000 + (G > 0 ? G < 256 ? G : 255 : 0) * 0x100 + (B > 0 ? B < 256 ? B : 255 : 0)).toString(16).slice(1);
}

function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme') || 'dark';
  const themes = ['dark', 'light', 'pinkblue', 'custom'];
  const currentIndex = themes.indexOf(currentTheme);
  const nextTheme = themes[(currentIndex + 1) % themes.length];
  setTheme(nextTheme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const body = document.body;
  body.setAttribute('data-theme', savedTheme);
  
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.classList.toggle('active', savedTheme === 'light');
  }
  
  // 加载自定义主题预览
  applyCustomTheme();
  
  const savedHighlight = localStorage.getItem('selectionHighlightEnabled');
  if (savedHighlight !== null) {
    selectionHighlightEnabled = savedHighlight === 'true';
    const highlightToggle = document.getElementById('selectionHighlightToggle');
    if (highlightToggle) highlightToggle.classList.toggle('active', selectionHighlightEnabled);
  }
  
  const savedViewSelection = localStorage.getItem('viewSelectionEnabled');
  if (savedViewSelection !== null) {
    viewSelectionEnabled = savedViewSelection === 'true';
    const viewSelectionToggle = document.getElementById('viewSelectionToggle');
    if (viewSelectionToggle) viewSelectionToggle.classList.toggle('active', viewSelectionEnabled);
  }
  
  horizontalUIEnabled = false;
  const horizontalUIToggle = document.getElementById('horizontalUIToggle');
  const sidebar = document.getElementById('horizontalSidebar');
  if (horizontalUIToggle) {
    horizontalUIToggle.classList.remove('active');
    body.classList.remove('horizontal-ui');
    if (sidebar) sidebar.style.display = 'none';
    
    // 关闭横版UI时，解锁屏幕方向
    unlockScreenOrientation();
  }
  
  const savedStepSettings = localStorage.getItem('stepSettingsEnabled');
  if (savedStepSettings !== null) {
    stepSettingsEnabled = savedStepSettings === 'true';
    const stepSettingsToggle = document.getElementById('stepSettingsToggle');
    const stepSettingsPanel = document.getElementById('stepSettingsPanel');
    if (stepSettingsToggle && stepSettingsPanel) {
      stepSettingsToggle.classList.toggle('active', stepSettingsEnabled);
      stepSettingsPanel.classList.toggle('expanded', stepSettingsEnabled);
    }
  }
  
  // 加载步长配置
  loadStepConfig();
}



// ============ 横版UI开关 ============
let horizontalUIEnabled = false;
// 坐标系罗盘绘制函数
function updateCoordinateCompass(enabled = true) {
  const canvas = document.getElementById('compassCanvas');
  if (!canvas) return;
  
  // 根据启用状态显示/隐藏罗盘
  canvas.style.display = enabled ? 'block' : 'none';
  
  if (!enabled) return;
  
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 5;
  
  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制背景圆
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fill();
  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 计算旋转后的坐标轴方向
  const yawRad = viewYaw * Math.PI / 180;
  const pitchRad = viewPitch * Math.PI / 180;
  
  // 定义坐标轴方向
  const axes = [
    { name: 'X', color: '#ff4444', dir: [1, 0, 0] },
    { name: 'Y', color: '#44ff44', dir: [0, 1, 0] },
    { name: 'Z', color: '#4444ff', dir: [0, 0, 1] }
  ];
  
  // 旋转坐标轴
  const rotatedAxes = axes.map(axis => {
    const [x, y, z] = axis.dir;
    
    // 应用yaw旋转（修正方向）
    const rotatedX = x * Math.cos(yawRad) - z * Math.sin(yawRad);
    const rotatedZ = x * Math.sin(yawRad) + z * Math.cos(yawRad);
    
    // 应用pitch旋转
    const rotatedY = y * Math.cos(pitchRad) - rotatedZ * Math.sin(pitchRad);
    const finalZ = y * Math.sin(pitchRad) + rotatedZ * Math.cos(pitchRad);
    
    return { ...axis, dir: [rotatedX, rotatedY, finalZ] };
  });
  
  // 按Z轴排序，处理遮挡（Z值大的在前面）
  rotatedAxes.sort((a, b) => b.dir[2] - a.dir[2]);
  
  // 绘制坐标轴
  rotatedAxes.forEach(axis => {
    const [x, y, z] = axis.dir;
    
    // 绘制所有坐标轴（包括背面）
    if (true) {
      const endX = centerX + x * radius * 0.6;
      const endY = centerY - y * radius * 0.6;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = axis.color;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // 绘制箭头
      const arrowSize = 6;
      const angle = Math.atan2(y, x);
      
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - arrowSize * Math.cos(angle - Math.PI / 6), endY + arrowSize * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(endX - arrowSize * Math.cos(angle + Math.PI / 6), endY + arrowSize * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = axis.color;
      ctx.fill();
      
      // 绘制标签
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = axis.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labelX = centerX + x * radius * 0.8;
      const labelY = centerY - y * radius * 0.8;
      ctx.fillText(axis.name, labelX, labelY);
    }
  });
}

function toggleHorizontalUI() {
  horizontalUIEnabled = !horizontalUIEnabled;
  const toggle = document.getElementById('horizontalUIToggle');
  const body = document.body;
  const sidebar = document.getElementById('horizontalSidebar');
  
  if (horizontalUIEnabled) {
    toggle.classList.add('active');
    body.classList.add('horizontal-ui');
    if (sidebar) sidebar.style.display = 'block';
    
    // 如果是手机，尝试横屏显示
    if (isMobileDevice()) {
      lockScreenOrientation('landscape');
    }
    
    // 当启用横版UI时，自动切换到控制页面
    if (!activeModelId && !activeGroupId && models.length > 0) {
      selectModel(models[0].id);
    } else {
      // 检查当前页面是否是列表页面，如果是则切换到控制页面
      const activeTab = document.querySelector('.tab-bar .tab.active');
      if (activeTab && activeTab.dataset.page === 'list') {
        switchPage('control');
      }
    }
  } else {
    toggle.classList.remove('active');
    body.classList.remove('horizontal-ui');
    if (sidebar) sidebar.style.display = 'none';
    
    // 关闭横版UI时，解锁屏幕方向
    unlockScreenOrientation();
  }
  
  localStorage.setItem('horizontalUIEnabled', horizontalUIEnabled);
  resize();
  draw();
}

// 检测是否是移动设备
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 锁定屏幕方向
function lockScreenOrientation(orientation) {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock(orientation).catch(err => {
      console.log('屏幕方向锁定失败:', err);
    });
  }
}

// 解锁屏幕方向
function unlockScreenOrientation() {
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock().catch(err => {
      console.log('屏幕方向解锁失败:', err);
    });
  }
}

// ============ 步长设置开关 ============
function toggleStepSettings() {
  stepSettingsEnabled = !stepSettingsEnabled;
  const toggle = document.getElementById('stepSettingsToggle');
  const panel = document.getElementById('stepSettingsPanel');
  
  if (stepSettingsEnabled) {
    toggle.classList.add('active');
    panel.classList.add('expanded');
  } else {
    toggle.classList.remove('active');
    panel.classList.remove('expanded');
  }
  
  localStorage.setItem('stepSettingsEnabled', stepSettingsEnabled);
}

// ============ 步长设置 ============
// 步长配置对象
const stepConfig = {
  pos: 0.1,
  posMin: -128,
  posMax: 128,
  basepos: 0.1,
  baseposMin: -128,
  baseposMax: 128,
  rot: 0.5,
  rotMin: -180,
  rotMax: 180,
  scale: 0.1,
  scaleMin: 0,
  scaleMax: 30
};

// 更新步长配置
function updateStepConfig() {
  stepConfig.pos = parseFloat(document.getElementById('posStep').value) || 0.1;
  stepConfig.posMin = parseFloat(document.getElementById('posMin').value) || -128;
  stepConfig.posMax = parseFloat(document.getElementById('posMax').value) || 128;
  stepConfig.basepos = parseFloat(document.getElementById('baseposStep').value) || 0.1;
  stepConfig.baseposMin = parseFloat(document.getElementById('baseposMin').value) || -128;
  stepConfig.baseposMax = parseFloat(document.getElementById('baseposMax').value) || 128;
  stepConfig.rot = parseFloat(document.getElementById('rotStep').value) || 0.5;
  stepConfig.rotMin = parseFloat(document.getElementById('rotMin').value) || -180;
  stepConfig.rotMax = parseFloat(document.getElementById('rotMax').value) || 180;
  stepConfig.scale = parseFloat(document.getElementById('scaleStep').value) || 0.1;
  stepConfig.scaleMin = parseFloat(document.getElementById('scaleMin').value) || 0;
  stepConfig.scaleMax = parseFloat(document.getElementById('scaleMax').value) || 30;
  
  // 保存到localStorage
  localStorage.setItem('stepConfig', JSON.stringify(stepConfig));
  
  // 重新渲染控制页面以应用新的步长
  renderControlPage();
}

// 加载步长配置
function loadStepConfig() {
  const savedConfig = localStorage.getItem('stepConfig');
  if (savedConfig) {
    const config = JSON.parse(savedConfig);
    Object.assign(stepConfig, config);
  }
  
  // 更新输入框的值
  document.getElementById('posStep').value = stepConfig.pos;
  document.getElementById('posMin').value = stepConfig.posMin;
  document.getElementById('posMax').value = stepConfig.posMax;
  document.getElementById('baseposStep').value = stepConfig.basepos;
  document.getElementById('baseposMin').value = stepConfig.baseposMin;
  document.getElementById('baseposMax').value = stepConfig.baseposMax;
  document.getElementById('rotStep').value = stepConfig.rot;
  document.getElementById('rotMin').value = stepConfig.rotMin;
  document.getElementById('rotMax').value = stepConfig.rotMax;
  document.getElementById('scaleStep').value = stepConfig.scale;
  document.getElementById('scaleMin').value = stepConfig.scaleMin;
  document.getElementById('scaleMax').value = stepConfig.scaleMax;
}

// 获取变量的步长
function getVarStep(varName) {
  if (varName.includes('basepos')) {
    return stepConfig.basepos;
  } else if (varName.includes('pos')) {
    return stepConfig.pos;
  } else if (varName.includes('rot') || varName.startsWith('rotate')) {
    return stepConfig.rot;
  } else if (varName.includes('scale')) {
    return stepConfig.scale;
  }
  return 0.1; // 默认步长
}

// 获取变量的最小值
function getVarMin(varName) {
  if (varName.includes('basepos')) {
    return stepConfig.baseposMin;
  } else if (varName.includes('pos')) {
    return stepConfig.posMin;
  } else if (varName.includes('rot') || varName.startsWith('rotate')) {
    return stepConfig.rotMin;
  } else if (varName.includes('scale')) {
    return stepConfig.scaleMin;
  }
  return -128; // 默认最小值
}

// 获取变量的最大值
function getVarMax(varName) {
  if (varName.includes('basepos')) {
    return stepConfig.baseposMax;
  } else if (varName.includes('pos')) {
    return stepConfig.posMax;
  } else if (varName.includes('rot') || varName.startsWith('rotate')) {
    return stepConfig.rotMax;
  } else if (varName.includes('scale')) {
    return stepConfig.scaleMax;
  }
  return 128; // 默认最大值
}

// ============ 事件绑定 ============
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否是首次进入
  const firstVisit = localStorage.getItem('firstVisit');
  if (!firstVisit) {
    // 申请存储权限
    if (confirm('为了能够保存模型到本地，需要获取存储权限。是否允许？')) {
      localStorage.setItem('firstVisit', 'true');
      alert('存储权限已获取，可以正常保存模型了！');
    } else {
      alert('您拒绝了存储权限，部分功能可能无法正常使用。');
    }
  }
  
  // 加载保存的Molang执行速率
  const savedFps = localStorage.getItem('molangFps');
  if (savedFps) {
    molangFps = parseInt(savedFps);
    const fpsInput = document.getElementById('molangFps');
    if (fpsInput) fpsInput.value = molangFps;
  }
  
  // 加载保存的屏幕动画设置
  const savedScreenAnim = localStorage.getItem('screenAnimationEnabled');
  if (savedScreenAnim !== null) {
    screenAnimationEnabled = savedScreenAnim === 'true';
    const animToggle = document.getElementById('screenAnimationToggle');
    if (animToggle) animToggle.classList.toggle('active', screenAnimationEnabled);
  }
  
  // 屏幕动画开关事件
  document.getElementById('screenAnimationToggle').addEventListener('click', () => {
    screenAnimationEnabled = !screenAnimationEnabled;
    document.getElementById('screenAnimationToggle').classList.toggle('active', screenAnimationEnabled);
    localStorage.setItem('screenAnimationEnabled', screenAnimationEnabled);
  });
  
  // 加载保存的坐标系罗盘设置
  const savedCompass = localStorage.getItem('compassEnabled');
  if (savedCompass !== null) {
    compassEnabled = savedCompass === 'true';
    const compassToggle = document.getElementById('compassToggle');
    if (compassToggle) compassToggle.classList.toggle('active', compassEnabled);
  }
  
  // 坐标系罗盘开关事件
  document.getElementById('compassToggle').addEventListener('click', () => {
    compassEnabled = !compassEnabled;
    document.getElementById('compassToggle').classList.toggle('active', compassEnabled);
    localStorage.setItem('compassEnabled', compassEnabled);
    draw();
  });
  
  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => switchPage(tab.dataset.page)));
  
  // 复制按钮事件
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const bookmarkItem = btn.closest('.bookmark-item');
      const text = bookmarkItem.querySelector('.bookmark-text');
      if (text) {
        navigator.clipboard.writeText(text.textContent).then(() => {
          const originalText = btn.textContent;
          btn.textContent = '已复制!';
          btn.classList.add('btn-primary');
          setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('btn-primary');
          }, 2000);
        });
      }
    });
  });
  
  document.querySelectorAll('.model-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.model-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentModelType = btn.dataset.type;
      if (activeModelId) updateModelType(activeModelId, currentModelType);
    });
  });
  
  document.getElementById('addModelBtn').addEventListener('click', () => {
    const texName = document.getElementById('defaultTex').value;
    const customColor = document.getElementById('defaultCustomColor').value;
    createModel(texName, currentModelType, customColor);
  });
  
  // 侧边栏添加模型按钮
  const sidebarAddBtn = document.getElementById('sidebarAddModelBtn');
  if (sidebarAddBtn) {
    sidebarAddBtn.addEventListener('click', () => {
      const texName = document.getElementById('sidebarDefaultTex').value;
      const customColor = document.getElementById('sidebarDefaultCustomColor').value;
      createModel(texName, currentModelType, customColor);
    });
  }
  
  document.getElementById('defaultTex').addEventListener('change', (e) => {
    // 如果有选中模型，更新模型纹理
    if (activeModelId) {
      updateModelTex(activeModelId, e.target.value);
    } else {
      // 否则只更新颜色选择器的显示状态（用于添加新模型时的预览）
      const defaultColorPicker = document.getElementById('defaultCustomColor');
      if (defaultColorPicker) {
        defaultColorPicker.style.display = e.target.value === 'custom_color' ? 'block' : 'none';
      }
    }
  });
  
  // 侧边栏纹理选择器
  const sidebarTex = document.getElementById('sidebarDefaultTex');
  if (sidebarTex) {
    sidebarTex.addEventListener('change', (e) => {
      const sidebarColorPicker = document.getElementById('sidebarDefaultCustomColor');
      if (sidebarColorPicker) {
        sidebarColorPicker.style.display = e.target.value === 'custom_color' ? 'block' : 'none';
      }
      // 同步主页面的纹理选择器
      const mainTex = document.getElementById('defaultTex');
      if (mainTex) mainTex.value = e.target.value;
    });
  }
  
  // 侧边栏模型类型按钮
  document.querySelectorAll('#horizontalSidebar .model-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#horizontalSidebar .model-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentModelType = btn.dataset.type;
      // 同步主页面的模型类型选择
      document.querySelectorAll('.main-content .model-type-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.type === currentModelType);
      });
      if (activeModelId) updateModelType(activeModelId, currentModelType);
    });
  });
  document.getElementById('modelTexSelect').addEventListener('change', (e) => { if (activeModelId) updateModelTex(activeModelId, e.target.value); });
  
  document.getElementById('customColorPicker').addEventListener('change', (e) => {
    if (activeModelId) {
      const model = models.find(m => m.id === activeModelId);
      if (model && model.texName === 'custom_color') {
        model.customColor = e.target.value;
        // updateCustomColorTexture(e.target.value);
        // 同步模型列表区的颜色选择器
        const defaultColorPicker = document.getElementById('defaultCustomColor');
        if (defaultColorPicker) defaultColorPicker.value = e.target.value;
        hasUnsavedChanges = true;
        draw();
      }
    }
  });
  
  // 模型列表区颜色选择器事件
  document.getElementById('defaultCustomColor').addEventListener('change', (e) => {
    if (activeModelId) {
      const model = models.find(m => m.id === activeModelId);
      if (model && model.texName === 'custom_color') {
        model.customColor = e.target.value;
        // updateCustomColorTexture(e.target.value);
        // 同步控制区的颜色选择器
        const colorPicker = document.getElementById('customColorPicker');
        if (colorPicker) colorPicker.value = e.target.value;
        hasUnsavedChanges = true;
        draw();
      }
    }
  });
  
  document.getElementById('molangToggleBtn').addEventListener('click', toggleMolangExecution);
  
  document.getElementById('copyCmdBtn').addEventListener('click', async () => {
    const output = document.getElementById('cmdOutput');
    try { await navigator.clipboard.writeText(output.textContent); alert('已复制到剪贴板'); } catch(e) { alert('复制失败'); }
  });
  
  // 导出指令为文本文件
  document.getElementById('downloadCmdBtn').addEventListener('click', () => {
    const output = document.getElementById('cmdOutput');
    const content = output.textContent;
    if (content.trim() === '// 动画指令将显示在这里') {
      alert('没有可导出的指令');
      return;
    }
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fmbe_commands_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  
  document.getElementById('saveBtn').addEventListener('click', showSaveModal);
  document.getElementById('importBtn').addEventListener('click', showImportModal);
  document.getElementById('exportBtn').addEventListener('click', showShareModal);
  
  document.getElementById('saveCancel').addEventListener('click', hideSaveModal);
  document.getElementById('saveOk').addEventListener('click', saveData);
  
  document.getElementById('importCancel').addEventListener('click', hideImportModal);
  document.getElementById('importOk').addEventListener('click', importData);
  document.getElementById('importFileBtn').addEventListener('click', () => { document.getElementById('importFileInput').click(); });
  document.getElementById('importFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => { document.getElementById('importTextarea').value = event.target.result; };
      reader.readAsText(file);
    }
  });
  
  document.getElementById('exportClose').addEventListener('click', hideShareModal);
  document.getElementById('exportCopy').addEventListener('click', async () => {
    const textarea = document.getElementById('exportTextarea');
    try { await navigator.clipboard.writeText(textarea.value); alert('已复制到剪贴板'); } catch(e) { alert('复制失败'); }
  });
  document.getElementById('exportDownload').addEventListener('click', () => {
    const textarea = document.getElementById('exportTextarea');
    const text = textarea.value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'molang_animation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  
  document.getElementById('confirmCancel').addEventListener('click', hideConfirm);
  document.getElementById('confirmOk').addEventListener('click', () => { if (confirmCallback) confirmCallback(); hideConfirm(); });
  

  
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      setTheme(opt.dataset.theme);
    });
  });
  
  // 自定义主题颜色选择器事件
  const bgColorPicker = document.getElementById('bgColorPicker');
  const bgColorText = document.getElementById('bgColorText');
  const btnColorPicker = document.getElementById('btnColorPicker');
  const btnColorText = document.getElementById('btnColorText');
  
  // 颜色选择器与文本框同步
  if (bgColorPicker && bgColorText) {
    bgColorPicker.addEventListener('input', (e) => {
      bgColorText.value = e.target.value;
    });
    bgColorText.addEventListener('input', (e) => {
      const color = e.target.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        bgColorPicker.value = color;
      }
    });
  }
  
  if (btnColorPicker && btnColorText) {
    btnColorPicker.addEventListener('input', (e) => {
      btnColorText.value = e.target.value;
    });
    btnColorText.addEventListener('input', (e) => {
      const color = e.target.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        btnColorPicker.value = color;
      }
    });
  }
  
  // 应用自定义主题按钮
  const applyCustomThemeBtn = document.getElementById('applyCustomThemeBtn');
  if (applyCustomThemeBtn) {
    applyCustomThemeBtn.addEventListener('click', () => {
      const bgColor = bgColorText ? bgColorText.value : '#1a1a1a';
      const btnColor = btnColorText ? btnColorText.value : '#4a90e2';
      
      // 验证颜色格式
      if (!/^#[0-9A-Fa-f]{6}$/.test(bgColor) || !/^#[0-9A-Fa-f]{6}$/.test(btnColor)) {
        alert('请输入有效的十六进制颜色代码，例如 #1a1a1a');
        return;
      }
      
      // 保存到localStorage
      localStorage.setItem('customBgColor', bgColor);
      localStorage.setItem('customBtnColor', btnColor);
      
      // 应用主题
      applyCustomTheme();
      alert('自定义主题已应用');
    });
  }
  
  // 重置自定义主题按钮
  const resetCustomThemeBtn = document.getElementById('resetCustomThemeBtn');
  if (resetCustomThemeBtn) {
    resetCustomThemeBtn.addEventListener('click', () => {
      const defaultBgColor = '#1a1a1a';
      const defaultBtnColor = '#4a90e2';
      
      if (bgColorPicker) bgColorPicker.value = defaultBgColor;
      if (bgColorText) bgColorText.value = defaultBgColor;
      if (btnColorPicker) btnColorPicker.value = defaultBtnColor;
      if (btnColorText) btnColorText.value = defaultBtnColor;
      
      // 保存默认值
      localStorage.setItem('customBgColor', defaultBgColor);
      localStorage.setItem('customBtnColor', defaultBtnColor);
      
      // 应用主题
      applyCustomTheme();
    });
  }
  
  // 页面加载时更新自定义主题预览
  applyCustomTheme();
  

  
  document.getElementById('selectionHighlightToggle').addEventListener('click', function() {
    selectionHighlightEnabled = !selectionHighlightEnabled;
    this.classList.toggle('active', selectionHighlightEnabled);
    localStorage.setItem('selectionHighlightEnabled', selectionHighlightEnabled);
    draw();
  });
  
  document.getElementById('viewSelectionToggle').addEventListener('click', function() {
    viewSelectionEnabled = !viewSelectionEnabled;
    this.classList.toggle('active', viewSelectionEnabled);
    localStorage.setItem('viewSelectionEnabled', viewSelectionEnabled);
  });
  
  document.getElementById('horizontalUIToggle').addEventListener('click', toggleHorizontalUI);
  
  document.getElementById('stepSettingsToggle').addEventListener('click', toggleStepSettings);
  
  // 重置视图按钮事件
  document.getElementById('resetViewBtn').addEventListener('click', () => {
    viewYaw = -10;
    viewPitch = 15;
    viewScale = 2;
    resize();
    draw();
  });
  
  // 步长设置输入框事件绑定
  document.getElementById('posStep').addEventListener('change', updateStepConfig);
  document.getElementById('posMin').addEventListener('change', updateStepConfig);
  document.getElementById('posMax').addEventListener('change', updateStepConfig);
  document.getElementById('baseposStep').addEventListener('change', updateStepConfig);
  document.getElementById('baseposMin').addEventListener('change', updateStepConfig);
  document.getElementById('baseposMax').addEventListener('change', updateStepConfig);
  document.getElementById('rotStep').addEventListener('change', updateStepConfig);
  document.getElementById('rotMin').addEventListener('change', updateStepConfig);
  document.getElementById('rotMax').addEventListener('change', updateStepConfig);
  document.getElementById('scaleStep').addEventListener('change', updateStepConfig);
  document.getElementById('scaleMin').addEventListener('change', updateStepConfig);
  document.getElementById('scaleMax').addEventListener('change', updateStepConfig);
  
  // Molang执行速率设置
  document.getElementById('molangFps').addEventListener('change', updateMolangFps);
  
  document.getElementById('versionSwitchBtn').addEventListener('click', switchVersion);
  
  document.getElementById('createGroupBtn').addEventListener('click', showCreateGroupModal);
  document.getElementById('deleteGroupBtn').addEventListener('click', deleteModelGroup);
  document.getElementById('createGroupCancel').addEventListener('click', hideCreateGroupModal);
  document.getElementById('createGroupOk').addEventListener('click', createModelGroup);
  
  document.getElementById('copyModelCancel').addEventListener('click', hideCopyModelModal);
  document.getElementById('copyModelOk').addEventListener('click', copyModel);
  
  // 预设动画事件绑定
  document.getElementById('addPresetAnimationBtn').addEventListener('click', showPresetAnimationModal);
  document.getElementById('presetAnimationCancel').addEventListener('click', hidePresetAnimationModal);
  document.getElementById('presetAnimationOk').addEventListener('click', createPresetAnimation);
  
  // 自定义变量折叠栏事件绑定
  document.getElementById('customVarsHeader').addEventListener('click', toggleCustomVars);
  
  // 骨骼事件绑定
  document.getElementById('addBoneBtn').addEventListener('click', showAddBoneModal);
  document.getElementById('deleteBoneBtn').addEventListener('click', deleteBone);
  document.getElementById('boneCancel').addEventListener('click', hideBoneModal);
  
  loadTheme();
  
  // 初始化版本切换按钮文本
  const versionBtn = document.getElementById('versionSwitchBtn');
  versionBtn.textContent = `切换到${currentVersion === 'base' ? 'Extend' : 'Base'}版`;
  
  createModel("diamond_block", "block");
  
  canvas.style.cursor = 'grab';
});

// ============ 预设动画功能 ============
function getActiveModel() {
  return models.find(m => m.id === activeModelId);
}
function getActiveModelPresets() {
  const model = getActiveModel();
  return model ? model.presetAnimations : [];
}
function showPresetAnimationModal() {
  document.getElementById('presetAnimationName').value = '';
  document.getElementById('timelineVariable').value = '';
  document.getElementById('incrementStep').value = '1';
  document.getElementById('presetAnimationModal').classList.add('active');
}

function hidePresetAnimationModal() {
  document.getElementById('presetAnimationModal').classList.remove('active');
}

function createPresetAnimation() {
  const name = document.getElementById('presetAnimationName').value.trim();
  const timelineVariable = document.getElementById('timelineVariable').value.trim();
  const incrementStep = parseFloat(document.getElementById('incrementStep').value);
  
  if (!name) { alert('请输入预设动画名称'); return; }
  if (!timelineVariable) { alert('请输入时间轴变量'); return; }
  if (!timelineVariable.startsWith('v.') && !timelineVariable.startsWith('t.')) { alert('时间轴变量必须以 v. 或 t. 开头'); return; }
  if (isNaN(incrementStep) || incrementStep <= 0) { alert('请输入有效的自增步长'); return; }
  
  const model = getActiveModel();
  if (!model) return;
  
  const preset = new PresetAnimation(presetAnimationCounter++, name, timelineVariable, incrementStep);
  
  // 自动添加变量定义和自增代码
  // 格式：用户设置变量=用户设置变量??0;用户设置变量=用户设置变量+自定义常数;
  preset.molangCode = `${timelineVariable}=${timelineVariable}??0;${timelineVariable}=${timelineVariable}+${incrementStep};`;
  
  // 初始化用户设置变量
  if (timelineVariable.startsWith('v.')) {
    const varName = timelineVariable.substring(2);
    // 只为当前模型初始化该变量
    if (!model.varData[varName]) {
      model.varData[varName] = { name: varName, value: 0, init: 0 };
    }
  } else if (timelineVariable.startsWith('t.')) {
    const varName = timelineVariable.substring(2);
    globalVars[varName] = globalVars[varName] || 0;
  }
  
  model.presetAnimations.push(preset);
  hasUnsavedChanges = true;
  
  renderPresetAnimations();
  hidePresetAnimationModal();
}

function renderPresetAnimations() {
  const container = document.getElementById('presetAnimationsContainer');
  if (!container) return;
  
  const presets = getActiveModelPresets();
  const model = getActiveModel();
  if (!model || presets.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  // 在渲染前先从变量中读取当前值
  presets.forEach(preset => {
    let foundValue = false;
    if (preset.timelineVariable.startsWith('v.')) {
      const varName = preset.timelineVariable.substring(2);
      // 从当前模型中读取值
      if (model.varData[varName] && model.varData[varName].value !== undefined && model.varData[varName].value !== null) {
        preset.currentTime = Number(model.varData[varName].value);
        foundValue = true;
      }
      // 如果找不到，尝试初始化变量
      if (!foundValue) {
        if (!model.varData[varName]) {
          model.varData[varName] = { name: varName, value: 0, init: 0 };
        }
        preset.currentTime = 0;
      }
    } else if (preset.timelineVariable.startsWith('t.')) {
      const varName = preset.timelineVariable.substring(2);
      if (globalVars[varName] !== undefined && globalVars[varName] !== null) {
        preset.currentTime = Number(globalVars[varName]);
        foundValue = true;
      } else {
        globalVars[varName] = 0;
        preset.currentTime = 0;
      }
    }
    // 确保 currentTime 是有效的数字
    if (typeof preset.currentTime !== 'number' || isNaN(preset.currentTime)) {
      preset.currentTime = 0;
    }
  });
  
  container.innerHTML = presets.map(preset => `
    <div class="preset-animation-panel" data-id="${preset.id}">
      <div class="panel-header">
        <div class="panel-title">${preset.name} - ${preset.timelineVariable}</div>
        <div class="panel-actions">
          <button class="btn btn-danger btn-small" onclick="deletePresetAnimation(${preset.id})">删除</button>
        </div>
      </div>
      <div class="panel-body">
        <div class="preset-animation-controls">
          <div class="timeline-controls">
            <input type="range" class="preset-timeline-slider" id="presetSlider_${preset.id}" min="0" max="${preset.maxTime}" value="${preset.currentTime}" step="0.01" oninput="updatePresetTimeline(${preset.id}, this.value)">
            <div class="variable-display">
              <span>${preset.timelineVariable}: </span>
              <span id="presetVariableValue_${preset.id}">${preset.currentTime.toFixed(2)}</span>
            </div>
          </div>
          <div class="preset-animation-buttons">
            <button class="btn btn-primary btn-small" id="presetToggleBtn_${preset.id}" onclick="togglePresetAnimation(${preset.id})">
              <span>▶</span> 开始
            </button>
          </div>
        </div>
        <textarea class="molang-textarea preset-molang-textarea" id="presetMolang_${preset.id}" placeholder="在此输入预设动画的Molang代码...">${preset.molangCode}</textarea>
        <div class="molang-error" id="presetError_${preset.id}">${preset.errorMsg || ''}</div>
      </div>
    </div>
  `).join('');
  
  // 绑定文本区域事件
  presets.forEach(preset => {
    const textarea = document.getElementById(`presetMolang_${preset.id}`);
    if (textarea) {
      textarea.addEventListener('input', () => {
        preset.molangCode = textarea.value;
        hasUnsavedChanges = true;
        validatePresetMolang(preset);
      });
    }
  });
}

function deletePresetAnimation(id) {
  const model = getActiveModel();
  if (!model) return;
  
  const index = model.presetAnimations.findIndex(p => p.id === id);
  if (index !== -1) {
    model.presetAnimations.splice(index, 1);
    hasUnsavedChanges = true;
    renderPresetAnimations();
  }
}

function validatePresetMolang(preset) {
  const code = preset.molangCode.trim();
  if (!code) {
    preset.hasError = false;
    preset.errorMsg = '';
    updatePresetErrorDisplay(preset);
    return;
  }
  
  try {
    const lexer = new MolangLexer(code);
    const tokens = lexer.tokenize();
    if (lexer.error) throw new Error('语法错误: ' + lexer.error);
    preset.hasError = false;
    preset.errorMsg = '';
  } catch (e) {
    preset.hasError = true;
    preset.errorMsg = e.message;
  }
  
  updatePresetErrorDisplay(preset);
}

function updatePresetErrorDisplay(preset) {
  const errorDiv = document.getElementById(`presetError_${preset.id}`);
  const textarea = document.getElementById(`presetMolang_${preset.id}`);
  if (!errorDiv || !textarea) return;
  
  if (preset.hasError) {
    textarea.classList.add('error');
    errorDiv.textContent = preset.errorMsg;
  } else {
    textarea.classList.remove('error');
    errorDiv.textContent = '';
  }
}

function togglePresetAnimation(id) {
  const model = getActiveModel();
  if (!model) return;
  
  const preset = model.presetAnimations.find(p => p.id === id);
  if (!preset) return;
  
  const btn = document.getElementById(`presetToggleBtn_${id}`);
  if (!btn) return;
  
  if (preset.isRunning) {
    preset.isRunning = false;
    btn.innerHTML = '<span>▶</span> 开始';
    btn.classList.remove('running');
    
    // 检查当前模型是否还有其他预设动画在运行，如果没有则停止预设动画执行循环
    const hasRunningPreset = model.presetAnimations.some(p => p.isRunning);
    if (!hasRunningPreset) {
      stopPresetAnimationExecution();
    }
  } else {
    if (preset.hasError) {
      alert('请先修复预设动画代码中的错误');
      return;
    }
    preset.isRunning = true;
    btn.innerHTML = '<span>▣</span> 停止';
    btn.classList.add('running');
    
    // 确保预设动画执行循环在运行
    if (!isPresetAnimationRunning) {
      startPresetAnimationExecution();
    }
  }
}

function updatePresetTimeline(id, value) {
  const model = getActiveModel();
  if (!model) return;
  
  const preset = model.presetAnimations.find(p => p.id === id);
  if (!preset) return;
  
  // 确保 value 是有效的数字
  preset.currentTime = parseFloat(value);
  if (typeof preset.currentTime !== 'number' || isNaN(preset.currentTime)) {
    preset.currentTime = 0;
  }
  
  // 先手动设置时间轴变量
  if (preset.timelineVariable.startsWith('v.')) {
    const varName = preset.timelineVariable.substring(2);
    // 只为当前模型设置该变量
    if (!model.varData[varName]) {
      model.varData[varName] = { name: varName, value: 0, init: 0 };
    }
    model.varData[varName].value = preset.currentTime;
  } else if (preset.timelineVariable.startsWith('t.')) {
    const varName = preset.timelineVariable.substring(2);
    if (globalVars[varName] === undefined) {
      globalVars[varName] = 0;
    }
    globalVars[varName] = preset.currentTime;
  }
  
  // 执行除自增外的Molang代码
  if (preset.molangCode.trim()) {
    const code = preset.molangCode.trim();
    // 移除自增代码：timelineVariable=timelineVariable+X;
    const incrementPattern = new RegExp(`${preset.timelineVariable.replace(/\./g, '\\.')}=${preset.timelineVariable.replace(/\./g, '\\.')}\\+[^;]+;`, 'g');
    const filteredCode = code.replace(incrementPattern, '').trim();
    
    if (filteredCode) {
      // 只为当前模型执行过滤后的Molang代码
      try {
        const lexer = new MolangLexer(filteredCode);
        const tokens = lexer.tokenize();
        if (lexer.error) throw new Error('语法错误: ' + lexer.error);
        
        const executor = new MolangExecutor(model);
        const result = executor.execute(tokens);
        if (executor.error) throw new Error('运行时错误: ' + executor.error);
      } catch (e) {
        preset.hasError = true;
        preset.errorMsg = '执行错误: ' + e.message;
        updatePresetErrorDisplay(preset);
      }
    }
  }
  
  // 更新变量值显示
  const valueDisplay = document.getElementById(`presetVariableValue_${id}`);
  if (valueDisplay) {
    valueDisplay.textContent = preset.currentTime.toFixed(2);
  }
  
  updateControlInputs();
  updateCmdOutput();
  draw();
}

function executePresetAnimation(preset) {
  if (!preset.molangCode.trim()) return;
  
  const model = getActiveModel();
  if (!model) return;
  
  try {
    // 先确保变量已经初始化
    if (preset.timelineVariable.startsWith('v.')) {
      const varName = preset.timelineVariable.substring(2);
      // 只为当前模型初始化该变量
      if (!model.varData[varName]) {
        model.varData[varName] = { name: varName, value: 0, init: 0 };
      }
    } else if (preset.timelineVariable.startsWith('t.')) {
      const varName = preset.timelineVariable.substring(2);
      if (globalVars[varName] === undefined) {
        globalVars[varName] = 0;
      }
    }
    
    // 完整的预设动画代码，包括自增部分（只为当前模型执行）
    const fullCode = preset.molangCode.trim();
    
    // 只为当前模型执行完整的代码（包括自增）
    try {
      const lexer = new MolangLexer(fullCode);
      const tokens = lexer.tokenize();
      if (lexer.error) throw new Error('语法错误: ' + lexer.error);
      
      const executor = new MolangExecutor(model);
      const result = executor.execute(tokens);
      if (executor.error) throw new Error('运行时错误: ' + executor.error);
    } catch (e) {
      preset.hasError = true;
      preset.errorMsg = '执行错误: ' + e.message;
      updatePresetErrorDisplay(preset);
    }
    

    
    // 从变量中读取时间轴变量的当前值，更新preset.currentTime
    let foundValue = false;
    if (preset.timelineVariable.startsWith('v.')) {
      const varName = preset.timelineVariable.substring(2);
      // 从当前模型中读取值
      if (model.varData[varName] && model.varData[varName].value !== undefined && model.varData[varName].value !== null) {
        preset.currentTime = Number(model.varData[varName].value);
        foundValue = true;
      }
      // 如果找不到，设置为0
      if (!foundValue) {
        preset.currentTime = 0;
      }
    } else if (preset.timelineVariable.startsWith('t.')) {
      const varName = preset.timelineVariable.substring(2);
      if (globalVars[varName] !== undefined && globalVars[varName] !== null) {
        preset.currentTime = Number(globalVars[varName]);
        foundValue = true;
      } else {
        preset.currentTime = 0;
      }
    }
    
    // 确保 currentTime 是有效的数字
    if (typeof preset.currentTime !== 'number' || isNaN(preset.currentTime)) {
      preset.currentTime = 0;
    }
    
    // 更新滑动条和变量值显示
    const slider = document.getElementById(`presetSlider_${preset.id}`);
    if (slider) {
      // 滑动条只显示到 max，但变量会继续自增
      slider.value = Math.min(preset.currentTime, preset.maxTime);
    }
    
    const valueDisplay = document.getElementById(`presetVariableValue_${preset.id}`);
    if (valueDisplay) {
      valueDisplay.textContent = preset.currentTime.toFixed(2);
    }
    
    if (!preset.hasError) {
      preset.errorMsg = '';
      updatePresetErrorDisplay(preset);
    }
    
  } catch (e) {
    preset.hasError = true;
    preset.errorMsg = '执行错误: ' + e.message;
    updatePresetErrorDisplay(preset);
  }
  
  updateControlInputs();
  updateCmdOutput();
  draw();
}



// 修改动画页面渲染函数，确保预设动画容器正确显示
function renderAnimationPage() {
  const container = document.getElementById('molangEditorContainer');
  const model = models.find(m => m.id === activeModelId);
  if (!model) { 
    container.innerHTML = '<div class="empty-state">请先在列表页面选择一个模型</div>'; 
    renderPresetAnimations();
    return; 
  }
  container.innerHTML = `
    <div class="molang-editor">
      <div class="molang-editor-header">
        <div class="molang-editor-actions">
          <button id="molangFullscreenBtn" class="btn btn-secondary">+</button>
        </div>
      </div>
      <textarea class="molang-textarea ${model.hasError ? 'error' : ''}" id="molangCode" placeholder="在此输入Molang代码...\n\n示例:\nv.xpos=v.xpos??0;\nloop(60,{v.xpos=v.xpos+0.1});\nv.xpos>10?{v.xpos=0}">${model.molangCode || ''}</textarea>
      <div class="molang-error" id="molangError">${model.errorMsg || ''}</div>
    </div>
  `;
  const textarea = document.getElementById('molangCode');
  if (textarea) textarea.addEventListener('input', () => { model.molangCode = textarea.value; hasUnsavedChanges = true; validateMolang(); });
  const fullscreenBtn = document.getElementById('molangFullscreenBtn');
  const previewSection = document.getElementById('previewSection');
  const horizontalSidebar = document.getElementById('horizontalSidebar');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      const molangEditor = document.querySelector('.molang-editor');
      if (molangEditor.classList.contains('fullscreen')) {
        molangEditor.classList.remove('fullscreen');
        fullscreenBtn.textContent = '+';
        if (previewSection) previewSection.style.display = '';
        if (horizontalSidebar && document.body.classList.contains('horizontal-ui')) {
          horizontalSidebar.style.display = 'block';
        }
      }
      else {
        molangEditor.classList.add('fullscreen');
        fullscreenBtn.textContent = '◣';
        if (previewSection) previewSection.style.display = 'none';
        if (horizontalSidebar) {
          horizontalSidebar.style.display = 'none';
        }
      }
    });
  }
  
  renderPresetAnimations();
  updateCustomVarsDisplay();
}

// ============ 骨骼功能 ============
function showAddBoneModal() {
  boneStep.boneModalStep = 0;
  boneStep.boneParentModelId = null;
  boneStep.boneChildModelId = null;
  boneStep.boneBx = 0;
  boneStep.boneBy = 1;
  boneStep.boneBz = 0;
  isBoneDebugMode = false;
  
  renderBoneModalStep();
  document.getElementById('boneModal').classList.add('active');
}

function hideBoneModal() {
  document.getElementById('boneModal').classList.remove('active');
  hideBoneDebugPanel();
  isBoneDebugMode = false;
  draw();
}

// 显示骨骼调试面板
function showBoneDebugPanel() {
  const panel = document.getElementById('boneDebugPanel');
  
  // 使用设置的值
  const min = stepConfig.boneBaseposMin;
  const max = stepConfig.boneBaseposMax;
  const step = stepConfig.boneBasepos;
  
  // 更新滑动条属性
  const bxSlider = document.getElementById('boneBxSlider');
  const bySlider = document.getElementById('boneBySlider');
  const bzSlider = document.getElementById('boneBzSlider');
  bxSlider.min = min;
  bxSlider.max = max;
  bxSlider.step = step;
  bySlider.min = min;
  bySlider.max = max;
  bySlider.step = step;
  bzSlider.min = min;
  bzSlider.max = max;
  bzSlider.step = step;
  
  // 更新输入框属性
  const bxInput = document.getElementById('boneBxInput');
  const byInput = document.getElementById('boneByInput');
  const bzInput = document.getElementById('boneBzInput');
  bxInput.min = min;
  bxInput.max = max;
  bxInput.step = step;
  byInput.min = min;
  byInput.max = max;
  byInput.step = step;
  bzInput.min = min;
  bzInput.max = max;
  bzInput.step = step;
  
  // 初始化值
  bxSlider.value = boneStep.boneBx;
  bxInput.value = boneStep.boneBx;
  bySlider.value = boneStep.boneBy;
  byInput.value = boneStep.boneBy;
  bzSlider.value = boneStep.boneBz;
  bzInput.value = boneStep.boneBz;
  
  panel.style.display = 'block';
  isBoneDebugMode = true;
  
  // 绑定事件
  attachBoneDebugEvents();
  document.getElementById('boneDebugCancel').onclick = hideBoneDebugPanel;
  document.getElementById('boneDebugConfirm').onclick = confirmBone;
  
  draw();
}

// 隐藏骨骼调试面板
function hideBoneDebugPanel() {
  document.getElementById('boneDebugPanel').style.display = 'none';
  isBoneDebugMode = false;
  draw();
}

function renderBoneModalStep() {
  const body = document.getElementById('boneModalBody');
  const title = document.getElementById('boneModalTitle');
  const footer = document.getElementById('boneModalFooter');
  
  if (boneStep.boneModalStep === 0) {
    // 选择父级
    title.textContent = '添加骨骼 - 选择父级';
    body.innerHTML = `
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px;">选择父级模型</label>
        <div class="save-list" id="boneParentModelList">${renderBoneModelList(null)}</div>
      </div>
    `;
    footer.innerHTML = `
      <button class="btn btn-outline" id="boneCancel">取消</button>
      <button class="btn btn-primary" id="boneNext" style="display: none;">下一步</button>
    `;
    
    document.getElementById('boneCancel').onclick = hideBoneModal;
    attachBoneModelListEvents('parent');
    
  } else if (boneStep.boneModalStep === 1) {
    // 选择子级
    title.textContent = '添加骨骼 - 选择子级';
    body.innerHTML = `
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px;">选择子级模型</label>
        <div class="save-list" id="boneChildModelList">${renderBoneModelList(boneStep.boneParentModelId)}</div>
      </div>
    `;
    footer.innerHTML = `
      <button class="btn btn-outline" id="boneBack">上一步</button>
      <button class="btn btn-primary" id="boneNext" style="display: none;">下一步</button>
    `;
    
    document.getElementById('boneBack').onclick = () => {
      boneStep.boneModalStep = 0;
      renderBoneModalStep();
    };
    attachBoneModelListEvents('child');
    
  } else if (boneStep.boneModalStep === 2) {
    // 调试界面 - 隐藏模态框，显示底部控制栏
    document.getElementById('boneModal').classList.remove('active');
    showBoneDebugPanel();
  }
}

function renderBoneModelList(excludeId) {
  if (models.length === 0) return '<div class="empty-state" style="text-align: center; padding: 20px;">暂无模型</div>';
  
  return models.map(model => `
    <div class="save-item" data-model-id="${model.id}" style="cursor: pointer;">
      <span style="font-weight: bold;">${model.name}</span>
      <span style="font-size: 12px; color: var(--text-secondary); margin-left: 8px;">(ID: ${model.id})</span>
    </div>
  `).join('');
}

function attachBoneModelListEvents(type) {
  const items = document.querySelectorAll('#boneParentModelList .save-item, #boneChildModelList .save-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const modelId = parseInt(item.dataset.modelId);
      if (type === 'parent') {
        boneStep.boneParentModelId = modelId;
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        document.getElementById('boneNext').style.display = 'inline-block';
        document.getElementById('boneNext').onclick = () => {
          boneStep.boneModalStep = 1;
          renderBoneModalStep();
        };
      } else {
        // 子级
        if (modelId === boneStep.boneParentModelId) {
          alert('子级不能与父级相同');
          return;
        }
        boneStep.boneChildModelId = modelId;
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        document.getElementById('boneNext').style.display = 'inline-block';
        document.getElementById('boneNext').onclick = () => {
          boneStep.boneModalStep = 2;
          renderBoneModalStep();
        };
      }
    });
  });
}

function attachBoneDebugEvents() {
  const bxSlider = document.getElementById('boneBxSlider');
  const bxInput = document.getElementById('boneBxInput');
  const bySlider = document.getElementById('boneBySlider');
  const byInput = document.getElementById('boneByInput');
  const bzSlider = document.getElementById('boneBzSlider');
  const bzInput = document.getElementById('boneBzInput');
  
  // 简单绑定
  bxSlider.oninput = (e) => {
    boneStep.boneBx = parseFloat(e.target.value);
    bxInput.value = boneStep.boneBx;
    executeBoneDebug();
  };
  bxInput.onchange = (e) => {
    boneStep.boneBx = parseFloat(e.target.value);
    bxSlider.value = boneStep.boneBx;
    executeBoneDebug();
  };
  
  bySlider.oninput = (e) => {
    boneStep.boneBy = parseFloat(e.target.value);
    byInput.value = boneStep.boneBy;
    executeBoneDebug();
  };
  byInput.onchange = (e) => {
    boneStep.boneBy = parseFloat(e.target.value);
    bySlider.value = boneStep.boneBy;
    executeBoneDebug();
  };
  
  bzSlider.oninput = (e) => {
    boneStep.boneBz = parseFloat(e.target.value);
    bzInput.value = boneStep.boneBz;
    executeBoneDebug();
  };
  bzInput.onchange = (e) => {
    boneStep.boneBz = parseFloat(e.target.value);
    bzSlider.value = boneStep.boneBz;
    executeBoneDebug();
  };
}

function executeBoneDebug() {
  const parentModel = models.find(m => m.id === boneStep.boneParentModelId);
  const childModel = models.find(m => m.id === boneStep.boneChildModelId);
  
  if (!parentModel || !childModel) return;
  
  // 计算当前是该父级的第几个骨骼
  const parentBones = bones.filter(b => b.parentModelId === boneStep.boneParentModelId);
  const boneIndex = parentBones.length; // 新骨骼序号
  const suffix = boneIndex > 0 ? boneIndex : '';
  
  // 变量名
  const varBx = `B_x${suffix}`;
  const varBy = `B_y${suffix}`;
  const varBz = `B_z${suffix}`;
  const varFx = `F_x${suffix}`;
  const varFy = `F_y${suffix}`;
  const varFz = `F_z${suffix}`;
  
  // 给父级设置临时变量
  if (!parentModel.varData[varBx]) parentModel.varData[varBx] = { name: varBx, value: 0, init: 0 };
  if (!parentModel.varData[varBy]) parentModel.varData[varBy] = { name: varBy, value: 0, init: 0 };
  if (!parentModel.varData[varBz]) parentModel.varData[varBz] = { name: varBz, value: 0, init: 0 };
  
  parentModel.varData[varBx].value = boneStep.boneBx;
  parentModel.varData[varBy].value = boneStep.boneBy;
  parentModel.varData[varBz].value = boneStep.boneBz;
  
  // 执行父级的骨骼 Molang 代码
  const parentMolangCode = `t.${varFx}=v.xpos+(math.cos(v.yrot)*math.cos(v.zrot)+math.sin(v.yrot)*math.sin(v.xrot)*math.sin(v.zrot))*v.${varBx}+(math.cos(v.yrot)*math.sin(v.zrot)-math.sin(v.yrot)*math.sin(v.xrot)*math.cos(v.zrot))*v.${varBy}-math.sin(v.yrot)*math.cos(v.xrot)*v.${varBz};t.${varFy}=v.ypos-math.cos(v.xrot)*math.sin(v.zrot)*v.${varBx}+math.cos(v.xrot)*math.cos(v.zrot)*v.${varBy}-math.sin(v.xrot)*v.${varBz};t.${varFz}=v.zpos+(math.sin(v.yrot)*math.cos(v.zrot)-math.cos(v.yrot)*math.sin(v.xrot)*math.sin(v.zrot))*v.${varBx}+(math.sin(v.yrot)*math.sin(v.zrot)+math.cos(v.yrot)*math.sin(v.xrot)*math.cos(v.zrot))*v.${varBy}+math.cos(v.yrot)*math.cos(v.xrot)*v.${varBz};`;
  try {
    const lexer = new MolangLexer(parentMolangCode);
    const tokens = lexer.tokenize();
    const executor = new MolangExecutor(parentModel);
    executor.execute(tokens);
  } catch (e) {
    console.error('骨骼 Molang 执行错误:', e);
  }
  
  // 子级位置设置
  childModel.varData['xpos'].value = globalVars[varFx] ?? 0;
  childModel.varData['ypos'].value = globalVars[varFy] ?? 0;
  childModel.varData['zpos'].value = globalVars[varFz] ?? 0;
  
  updateControlInputs();
  updateCmdOutput();
  draw();
}

function confirmBone() {
  const parentModel = models.find(m => m.id === boneStep.boneParentModelId);
  const childModel = models.find(m => m.id === boneStep.boneChildModelId);
  
  if (!parentModel || !childModel) return;
  
  // 计算当前是该父级的第几个骨骼
  const parentBones = bones.filter(b => b.parentModelId === boneStep.boneParentModelId);
  const boneIndex = parentBones.length; // 新骨骼序号
  const suffix = boneIndex > 0 ? boneIndex : '';
  
  // 变量名
  const varBx = `B_x${suffix}`;
  const varBy = `B_y${suffix}`;
  const varBz = `B_z${suffix}`;
  const varFx = `F_x${suffix}`;
  const varFy = `F_y${suffix}`;
  const varFz = `F_z${suffix}`;
  
  // 父级添加 Molang 代码
  const parentAddCode = `v.${varBx}=${boneStep.boneBx};v.${varBy}=${boneStep.boneBy};v.${varBz}=${boneStep.boneBz};t.${varFx}=v.xpos+(math.cos(v.yrot)*math.cos(v.zrot)+math.sin(v.yrot)*math.sin(v.xrot)*math.sin(v.zrot))*v.${varBx}+(math.cos(v.yrot)*math.sin(v.zrot)-math.sin(v.yrot)*math.sin(v.xrot)*math.cos(v.zrot))*v.${varBy}-math.sin(v.yrot)*math.cos(v.xrot)*v.${varBz};t.${varFy}=v.ypos-math.cos(v.xrot)*math.sin(v.zrot)*v.${varBx}+math.cos(v.xrot)*math.cos(v.zrot)*v.${varBy}-math.sin(v.xrot)*v.${varBz};t.${varFz}=v.zpos+(math.sin(v.yrot)*math.cos(v.zrot)-math.cos(v.yrot)*math.sin(v.xrot)*math.sin(v.zrot))*v.${varBx}+(math.sin(v.yrot)*math.sin(v.zrot)+math.cos(v.yrot)*math.sin(v.xrot)*math.cos(v.zrot))*v.${varBy}+math.cos(v.yrot)*math.cos(v.xrot)*v.${varBz};`;
  
  if (parentModel.molangCode) {
    if (!parentModel.molangCode.endsWith(';')) parentModel.molangCode += ';';
    parentModel.molangCode += parentAddCode;
  } else {
    parentModel.molangCode = parentAddCode;
  }
  
  // 子级添加 Molang 代码
  const childAddCode = `v.xpos=t.${varFx};v.ypos=t.${varFy};v.zpos=t.${varFz};`;
  
  if (childModel.molangCode) {
    if (!childModel.molangCode.endsWith(';')) childModel.molangCode += ';';
    childModel.molangCode += childAddCode;
  } else {
    childModel.molangCode = childAddCode;
  }
  
  // 保存骨骼信息
  const bone = {
    id: boneStep.boneIdCounter++,
    parentModelId: boneStep.boneParentModelId,
    childModelId: boneStep.boneChildModelId,
    index: boneIndex,
    bx: boneStep.boneBx,
    by: boneStep.boneBy,
    bz: boneStep.boneBz
  };
  bones.push(bone);
  
  hasUnsavedChanges = true;
  
  hideBoneDebugPanel();
  renderAnimationPage();
  
  alert('骨骼添加成功！');
}

function deleteBone() {
  if (bones.length === 0) {
    alert('暂无骨骼');
    return;
  }
  
  if (confirm('确定要删除最后添加的骨骼吗？')) {
    // 删除最后一个骨骼
    bones.pop();
    alert('骨骼已删除');
    hasUnsavedChanges = true;
  }
}

// ============ 自定义变量功能 ============
let customVarsExpanded = false;
const expandedCustomVars = new Set();

// 切换自定义变量折叠栏
function toggleCustomVars() {
  customVarsExpanded = !customVarsExpanded;
  const container = document.getElementById('customVarsContainer');
  const arrow = document.getElementById('customVarsArrow');
  
  if (customVarsExpanded) {
    container.style.display = 'block';
    arrow.style.transform = 'rotate(180deg)';
    renderCustomVars();
  } else {
    container.style.display = 'none';
    arrow.style.transform = 'rotate(0deg)';
  }
}

// 渲染自定义变量
function renderCustomVars() {
  const container = document.getElementById('customVarsContent');
  if (!container) return;
  
  const model = getActiveModel();
  if (!model) {
    container.innerHTML = '请先选择一个模型';
    return;
  }
  
  // 获取所有非系统变量且有值的自定义变量
  const systemVars = new Set(varDefsTemplate.map(d => d.name));
  const customVars = Object.entries(model.varData)
    .filter(([name, data]) => !systemVars.has(name) && data.value !== null && data.value !== undefined && data.value !== 0);
  
  if (customVars.length === 0) {
    container.innerHTML = '无自定义变量';
    return;
  }
  
  // 检查是否已经渲染过相同的变量列表
  const currentVarItems = container.querySelectorAll('.custom-var-item');
  const currentVarNames = Array.from(currentVarItems).map(item => item.querySelector('span').textContent);
  const newVarNames = customVars.map(([name]) => name);
  
  // 如果变量列表相同，只更新值而不重新渲染
  const hasSameVars = currentVarNames.length === newVarNames.length && 
    currentVarNames.every((name, index) => name === newVarNames[index]);
  
  if (hasSameVars && currentVarItems.length > 0) {
    customVars.forEach(([name, data]) => {
      const input = document.getElementById(`customVar_${name}`);
      const slider = document.getElementById(`customVarSlider_${name}`);
      
      if (input) input.value = data.value;
      if (slider) slider.value = Math.max(-100, Math.min(100, data.value));
    });
    return;
  }
  
  // 否则重新渲染
  container.innerHTML = customVars.map(([name, data]) => `
    <div class="custom-var-item" style="margin-bottom: 12px; padding: 8px; background: var(--bg-tertiary); border-radius: 4px;">
      <div class="custom-var-header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="flex: 1; font-weight: 500;">${name}</span>
        <input type="number" 
               id="customVar_${name}" 
               value="${data.value}" 
               step="0.1" 
               style="width: 100px; padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary);"
               onchange="updateCustomVarValue('${name}', this.value)">
        <button class="custom-var-toggle" 
                id="customVarToggle_${name}"
                onclick="toggleCustomVarSlider('${name}')"
                style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); cursor: pointer; transition: transform 0.2s;">
          ▼
        </button>
      </div>
      <div class="custom-var-slider-container" 
           id="customVarSliderContainer_${name}"
           style="display: none;">
        <input type="range" 
               id="customVarSlider_${name}"
               min="-100" 
               max="100" 
               step="0.1" 
               value="${data.value}"
               style="width: 100%;"
               oninput="updateCustomVarFromSlider('${name}', this.value)">
      </div>
    </div>
  `).join('');
  
  // 恢复之前展开的状态
  customVars.forEach(([name]) => {
    if (expandedCustomVars.has(name)) {
      const container = document.getElementById(`customVarSliderContainer_${name}`);
      const toggle = document.getElementById(`customVarToggle_${name}`);
      if (container) container.style.display = 'block';
      if (toggle) toggle.style.transform = 'rotate(180deg)';
    }
  });
}

// 更新自定义变量值（文本框）
function updateCustomVarValue(varName, value) {
  const model = getActiveModel();
  if (!model || !model.varData[varName]) return;
  
  let v = Number(value);
  if (!Number.isFinite(v)) return;
  
  model.varData[varName].value = v;
  hasUnsavedChanges = true;
  
  // 更新滑动条的值（滑动条被限制在范围内）
  const slider = document.getElementById(`customVarSlider_${varName}`);
  if (slider) {
    slider.value = Math.max(-100, Math.min(100, v));
  }
  
  updateCmdOutput();
  draw();
}

// 更新自定义变量值（滑动条）
function updateCustomVarFromSlider(varName, value) {
  const model = getActiveModel();
  if (!model || !model.varData[varName]) return;
  
  let v = Number(value);
  if (!Number.isFinite(v)) return;
  
  model.varData[varName].value = v;
  hasUnsavedChanges = true;
  
  // 更新文本框的值
  const input = document.getElementById(`customVar_${varName}`);
  if (input) {
    input.value = v;
  }
  
  updateCmdOutput();
  draw();
}

// 切换自定义变量滑动条展开
function toggleCustomVarSlider(varName) {
  const container = document.getElementById(`customVarSliderContainer_${varName}`);
  const toggle = document.getElementById(`customVarToggle_${varName}`);
  
  if (!container || !toggle) return;
  
  if (expandedCustomVars.has(varName)) {
    expandedCustomVars.delete(varName);
    container.style.display = 'none';
    toggle.style.transform = 'rotate(0deg)';
  } else {
    expandedCustomVars.add(varName);
    container.style.display = 'block';
    toggle.style.transform = 'rotate(180deg)';
  }
}

// 更新自定义变量显示（当变量变化时调用）
function updateCustomVarsDisplay() {
  if (customVarsExpanded) {
    renderCustomVars();
  }
}
