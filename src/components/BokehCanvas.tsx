'use client';

import { useEffect, useRef } from 'react';

interface BokehCanvasProps {
  className?: string;

  /** Base fill tint. @default '#FFAAA5' */
  bgColor?: string;
  /** Accent tint mixed into the final composite. @default '#FFD198' */
  outputColor?: string;
  /** Dark edge colour for the vignette ring. @default '#4A0035' */
  vignetteColor?: string;

  /** Overall animation speed multiplier. @default 1 */
  speed?: number;

  /** Inner edge of the vignette ring (0–1). @default 0.354 */
  vignetteRadius?: number;
  /** Transition softness. @default 1 */
  vignetteFalloff?: number;
  /** Ellipse squish — 0 = circle, 1 = thin horizontal oval. @default 0.54 */
  vignetteSkew?: number;
  /** Ellipse rotation (0–1 maps to 0–360°). @default 0 */
  vignetteAngle?: number;
  /**
   * Normalised vignette centre X used as the *initial* resting position before
   * the user moves the mouse. Once the pointer moves the centre tracks the cursor.
   * @default 0.603
   */
  vignetteX?: number;
  /**
   * Normalised vignette centre Y (0 = bottom, 1 = top) — initial resting position.
   * @default 0.38
   */
  vignetteY?: number;

  /** Spatial frequency of the ripple. @default 0.35 */
  waveFrequency?: number;
  /** Ripple amplitude. @default 1.18 */
  waveAmplitude?: number;
  /** 0 = horizontal wave, 1 = vertical wave. @default 0 */
  waveRotation?: number;
  /** 0 = global (original), 1 = centred on cursor. @default 0 */
  waveMixRadius?: number;

  /** Cell scale — larger = bigger shards. @default 0.534 */
  shatterAmount?: number;
  /** Displacement strength. @default 1 */
  shatterSpread?: number;
  /** Grid rotation (0–1 maps to 0–360°). @default 0.122 */
  shatterAngle?: number;
  /** Cell elongation (0 = circles, 1 = slivers). @default 0.84 */
  shatterSkew?: number;
  /** 0 = global, 1 = centred on cursor. @default 1 */
  shatterMixRadius?: number;

  /** Blur radius. @default 0.754 */
  bokehRadius?: number;
  /** Tilt-shift balance (0 = blurred edges, 1 = blurred centre). @default 0.5 */
  bokehTilt?: number;
  /** 0 = static centre focus, 1 = follows cursor. @default 0 */
  bokehMouseTrack?: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

const VERT = /* glsl */ `#version 300 es
precision highp float;
in vec3 position;
in vec2 uv;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = uPMatrix * uMVMatrix * vec4(position, 1.0);
}`;

const FRAG_VIGNETTE = /* glsl */ `#version 300 es
precision highp float;
#define TWO_PI 6.28318530718
in vec2 vUv;
out vec4 fragColor;

uniform float uRadius;
uniform float uFalloff;
uniform float uMix;
uniform float uDisplace;
uniform float uSkew;
uniform float uAngle;
uniform vec3  uVignetteColor;
uniform float uColorAlpha;
uniform vec2 uPos;
uniform vec2 uResolution;
uniform vec3 uClearColor;

mat2 rot(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

void main() {
  vec2 uv = vUv;
  vec4 color = vec4(vec3(1.0), 0.0);
  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  float displacement = (luma - 0.5) * uDisplace * 0.5;

  vec2 ar = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 skew = vec2(uSkew, 1.0 - uSkew);
  float halfRadius = uRadius * 0.5;
  float innerEdge = halfRadius - uFalloff * halfRadius * 0.5;
  float outerEdge = halfRadius + uFalloff * halfRadius * 0.5;
  vec2 pos = uPos;
  vec2 scaledUV = uv  * ar * rot(uAngle * TWO_PI) * skew;
  vec2 scaledPos = pos * ar * rot(uAngle * TWO_PI) * skew;
  float radius = distance(scaledUV, scaledPos);
  float falloff = smoothstep(innerEdge + displacement, outerEdge + displacement, radius);
  fragColor = mix(vec4(uClearColor, 0.0), vec4(uVignetteColor, 1.0), falloff);
}`;

const FRAG_SINE = /* glsl */ `#version 300 es
precision mediump float;
#define PI  3.141592
#define PI3 1.04709283144
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D tInput;
uniform float uMixRadius;
uniform vec2 uPos;
uniform float uFrequency;
uniform float uAmplitude;
uniform float uRotation;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMousePos;
uniform float uTrackMouse;

void main() {
  vec2 uv = vUv;
  float ar = uResolution.x / uResolution.y;
  float time = uTime * 0.25;
  float freq = 20.0 * uFrequency;
  float amp = uAmplitude * 0.2;

  vec2 wc = vUv * 2.0 - 1.0;
  float waveX = sin((wc.y + uPos.y) * freq + time * PI3) * amp;
  float waveY = sin((wc.x - uPos.x) * freq + time * PI3) * amp;
  wc.xy += vec2(mix(waveX, 0.0, uRotation), mix(0.0, waveY, uRotation));
  vec2 finalUV = wc * 0.5 + 0.5;

  vec2 mPos = uPos + mix(vec2(0.0), uMousePos - 0.5, uTrackMouse);
  vec2 pos = mix(uPos, mPos, floor(uMixRadius));
  float dist = max(0.0, 1.0 - distance(uv * vec2(ar, 1.0), mPos * vec2(ar, 1.0)) * 4.0 * (1.0 - uMixRadius));
  uv = mix(uv, finalUV, dist);
  fragColor = texture(tInput, uv);
}`;

const FRAG_SHATTER = /* glsl */ `#version 300 es
precision mediump float;
#define PI 3.14159265359
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D tInput;
uniform float uAmount;
uniform float uSpread;
uniform float uAngle;
uniform float uTime;
uniform float uSkew;
uniform vec2 uPos;
uniform vec2 uResolution;
uniform float uMixRadius;
uniform int uMixRadiusInvert;
uniform int uEasing;
uniform vec2 uMousePos;
uniform float uTrackMouse;

vec2 random2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}
mat2 rot(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

void main() {
  vec2 uv = vUv;
  float ar = uResolution.x / uResolution.y;
  vec2 skew = mix(vec2(1.0), vec2(1.0, 0.0), uSkew);
  vec2 st = (uv - uPos) * vec2(ar, 1.0) * 50.0 * uAmount;
  st = st * rot(uAngle * 2.0 * PI) * skew;
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);
  float m_dist = 15.0;
  vec2 m_point;
  vec2 d;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 neighbor = vec2(float(i), float(j));
      vec2 point = random2(i_st + neighbor);
      point = 0.5 + 0.5 * sin(5.0 + uTime * 0.2 + 6.2831 * point);
      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);
      if (dist < m_dist) { m_dist = dist; m_point = point; d = diff; }
    }
  }

  vec2 offset = (m_point * 0.2 * uSpread * 2.0) - (uSpread * 0.2);
  vec2 mPos = uPos + mix(vec2(0.0), uMousePos - 0.5, uTrackMouse);
  vec2 pos = mix(uPos, mPos, floor(uMixRadius));
  float dist = max(0.0, 1.0 - distance(uv * vec2(ar, 1.0), mPos * vec2(ar, 1.0)) * 4.0 * (1.0 - uMixRadius));
  fragColor = texture(tInput, uv + offset * dist);
}`;

const FRAG_BOKEH = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

#define PI 3.14159265
#define PI2 6.28318530718
#define ITERATIONS 50.0
#define GOLDEN_ANGLE 2.39996323

uniform sampler2D tInput;
uniform sampler2D tBlueNoise;
uniform float uAmount;
uniform float uTilt;
uniform float uTime;
uniform vec2  uPos;
uniform vec2  uResolution;
uniform vec2  uMousePos;
uniform float uTrackMouse;
uniform vec2  uBlueNoiseResolution;

vec2 Sample(in float theta, inout float r) {
  r += 1.0 / r;
  return (r - 1.0) * vec2(cos(theta), sin(theta));
}
float getBlueNoiseOffset(vec2 st) {
  ivec2 sz  = ivec2(uBlueNoiseResolution);
  vec4  bn  = texelFetch(tBlueNoise,
    ivec2(fract(st * uResolution / vec2(sz) * vec2(float(sz.x) / float(sz.y), 1.0)) * vec2(sz)) % sz, 0);
  return mod((bn.r - 0.5) * PI2, PI2);
}
vec4 Bokeh(sampler2D tex, vec2 uv, float blurRadius) {
  vec3  accColor = vec3(0.0);
  vec3  accWeights = vec3(0.0);
  float accAlpha = 0.0;
  float ar = uResolution.x / uResolution.y;
  vec2  pixelSize = vec2(1.0 / ar, 1.0) * 0.04 * 0.075;
  float r = 1.0;
  float noiseOffset = (getBlueNoiseOffset(uv) - 0.5) * 0.01;
  float noiseAngle = noiseOffset * PI2;
  mat2  rotMat = mat2(cos(noiseAngle), -sin(noiseAngle), sin(noiseAngle),  cos(noiseAngle));
  for (float j = 0.0; j < GOLDEN_ANGLE * ITERATIONS; j += GOLDEN_ANGLE) {
    vec2  offset = Sample(j, r) * pixelSize;
    float jitter = 0.05 * (sin(j * 0.1) * 0.5 + 0.5);
    offset *= 1.0 + jitter * sin(j * 0.7 + noiseOffset);
    vec4  s = texture(tex, uv + rotMat * offset);
    vec3  w = vec3(5.0) + pow(s.rgb, vec3(9.0)) * 150.0;
    accAlpha   += s.a;
    accColor   += s.rgb * w;
    accWeights += w;
  }
  return vec4(accColor / accWeights, accAlpha / ITERATIONS);
}
void main() {
  if (uAmount == 0.0) { fragColor = vec4(0.0); return; }
  vec2  pos = uPos + mix(vec2(0.0), uMousePos - 0.5, uTrackMouse);
  float dis = distance(vUv, pos) * 1000.0;
  float tilt = mix(1.0 - dis * 0.001, dis * 0.001, uTilt);
  fragColor  = Bokeh(tInput, vUv, uAmount * tilt);
}`;

const FRAG_OUTPUT = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D tBgTexture;
uniform sampler2D tInput;
uniform vec3 uBgColor;
uniform vec3 uOutputColor;
uniform int uLoaded;

vec3 overlay(vec3 base, vec3 blend) {
  return mix(
    2.0 * base * blend,
    1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
    step(0.5, base)
  );
}
void main() {
  if (uLoaded != 1) {
    fragColor = vec4(197.0/255.0, 136.0/255.0, 122.0/255.0, 1.0);
    return;
  }
  vec3 bgTex = texture(tBgTexture, vUv).rgb;
  vec3 base = mix(uBgColor, overlay(uBgColor, bgTex), 0.61);
  vec3 clearColor = uOutputColor;
  vec4 inp = texture(tInput, vUv);
  vec3 blend = mix(clearColor, inp.rgb, inp.a);
  vec3 mixedColor = base * blend;

  fragColor.rgb = base * mix(vec3(1.0), blend, 0.26);
  fragColor.a = 1.0;
}`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  src: string
): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(s) ?? 'shader compile error');
  return s;
}

function linkProgram(
  gl: WebGL2RenderingContext,
  vert: string,
  frag: string
): WebGLProgram {
  const p = gl.createProgram()!;
  gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(p) ?? 'program link error');
  return p;
}

interface FBO {
  fbo: WebGLFramebuffer;
  tex: WebGLTexture;
  resize(w: number, h: number): void;
}

function makeFBO(gl: WebGL2RenderingContext, w: number, h: number): FBO {
  const tex = gl.createTexture()!;
  const fbo = gl.createFramebuffer()!;
  function upload(w: number, h: number) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      w,
      h,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex,
      0
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  upload(w, h);
  return { fbo, tex, resize: upload };
}

function makeBlueNoise(gl: WebGL2RenderingContext, size = 256): WebGLTexture {
  const data = new Uint8Array(size * size);
  for (let i = 0; i < data.length; i++) data[i] = i & 0xff;
  for (let i = data.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [data[i], data[j]] = [data[j], data[i]];
  }
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.R8,
    size,
    size,
    0,
    gl.RED,
    gl.UNSIGNED_BYTE,
    data
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return tex;
}

function makeQuadVAO(
  gl: WebGL2RenderingContext,
  prog: WebGLProgram
): WebGLVertexArrayObject {
  const positions = new Float32Array([
    -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0
  ]);
  const uvCoords = new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]);
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  const posBuf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
  const uvBuf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
  gl.bufferData(gl.ARRAY_BUFFER, uvCoords, gl.STATIC_DRAW);
  const uvLoc = gl.getAttribLocation(prog, 'uv');
  gl.enableVertexAttribArray(uvLoc);
  gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  return vao;
}

const MVP = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

function setMVP(gl: WebGL2RenderingContext, prog: WebGLProgram) {
  gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'uMVMatrix'), false, MVP);
  gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'uPMatrix'), false, MVP);
}

function bindTexUnit(
  gl: WebGL2RenderingContext,
  prog: WebGLProgram,
  name: string,
  tex: WebGLTexture,
  unit: number
) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.uniform1i(gl.getUniformLocation(prog, name), unit);
}

export default function BokehCanvas({
  className,
  bgColor = '#FFAAA5',
  outputColor = '#FFD198',
  vignetteColor = '#4A0035',
  speed = 1,
  vignetteRadius = 0.354,
  vignetteFalloff = 1,
  vignetteSkew = 0.54,
  vignetteAngle = 0,
  vignetteX = 0.603,
  vignetteY = 0.38,
  waveFrequency = 0.35,
  waveAmplitude = 1.18,
  waveRotation = 0,
  waveMixRadius = 1,
  shatterAmount = 0.534,
  shatterSpread = 1,
  shatterAngle = 0.122, // 44° (44/360 ≈ 0.122)
  shatterSkew = 0.84,
  shatterMixRadius = 1,
  bokehRadius = 0.754,
  bokehTilt = 0.5,
  bokehMouseTrack = 0
}: BokehCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
    if (!gl) {
      console.warn('WebGL2 not supported');
      return;
    }

    let progVignette: WebGLProgram,
      progSine: WebGLProgram,
      progShatter: WebGLProgram,
      progBokeh: WebGLProgram,
      progOutput: WebGLProgram;

    try {
      progVignette = linkProgram(gl, VERT, FRAG_VIGNETTE);
      progSine = linkProgram(gl, VERT, FRAG_SINE);
      progShatter = linkProgram(gl, VERT, FRAG_SHATTER);
      progBokeh = linkProgram(gl, VERT, FRAG_BOKEH);
      progOutput = linkProgram(gl, VERT, FRAG_OUTPUT);
    } catch (e) {
      console.error('Shader error:', e);
      return;
    }

    const vaoVignette = makeQuadVAO(gl, progVignette);
    const vaoSine = makeQuadVAO(gl, progSine);
    const vaoShatter = makeQuadVAO(gl, progShatter);
    const vaoBokeh = makeQuadVAO(gl, progBokeh);
    const vaoOutput = makeQuadVAO(gl, progOutput);

    const NOISE_SIZE = 256;
    const noiseTex = makeBlueNoise(gl, NOISE_SIZE);

    const bgTex = gl.createTexture()!;

    gl.bindTexture(gl.TEXTURE_2D, bgTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0xff, 0xaa, 0xa5, 0xff])
    );
    gl.bindTexture(gl.TEXTURE_2D, null);

    let bgLoaded = false;

    const img = new Image();

    img.crossOrigin = 'anonymous';
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, bgTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.bindTexture(gl.TEXTURE_2D, null);
      bgLoaded = true;
    };
    // img.src = '/bokeh-bg.png';
    // img.src = '/dirk-lach-_uamwvb8UlI-unsplash.jpg';
    img.src = '/dirk-lach-iTjW5Q5ic8s-unsplash.jpg';
    // img.src = '/chris-appano-mb_nVAy2a-8-unsplash.jpg';
    // img.src = '/ikhlas-eqL82KY9DJE-unsplash.jpg';

    // Renders at 0.5× pixel ratio (720px wide regardless of display)
    // which makes each bokeh disc cover many pixels — the signature of the look.
    const SCALE = 0.5;
    let w = Math.floor(canvas.clientWidth * SCALE) || 720;
    let h = Math.floor(canvas.clientHeight * SCALE) || 512;

    let bufA = makeFBO(gl, w, h); // ping
    let bufB = makeFBO(gl, w, h); // pong

    const resize = () => {
      if (!canvas) return;
      w = Math.max(1, Math.floor(canvas.clientWidth * SCALE));
      h = Math.max(1, Math.floor(canvas.clientHeight * SCALE));
      canvas.width = w;
      canvas.height = h;
      bufA.resize(w, h);
      bufB.resize(w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let hasMoved = false;
    let rawMouse = [vignetteX, vignetteY];
    let smMouse = [vignetteX, vignetteY];
    let paused = false;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    const onPointer = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = 1.0 - (e.clientY - r.top) / r.height;
      if (!hasMoved) {
        smMouse = [nx, ny];
        hasMoved = true;
      }
      rawMouse = [nx, ny];
    };
    const onScroll = () => {
      paused = true;
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        paused = false;
        scrollTimer = null;
      }, 150);
    };
    window.addEventListener('pointermove', onPointer);
    window.addEventListener('scroll', onScroll, {
      passive: true,
      capture: true
    });

    const cBg = hexToRgb(bgColor);
    const cOutput = hexToRgb(outputColor);
    const cVig = hexToRgb(vignetteColor);

    let elapsed = 0;
    let last = performance.now();
    let rafId = 0;

    const pass = (
      prog: WebGLProgram,
      vao: WebGLVertexArrayObject,
      target: WebGLFramebuffer | null,
      blend = false
    ) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target);
      gl.viewport(0, 0, w, h);
      if (blend) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      } else {
        gl.disable(gl.BLEND);
      }
      gl.useProgram(prog);
      setMVP(gl, prog);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindVertexArray(null);
    };

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);

      const dt = Math.min((now - last) / 1000, 0.05);

      last = now;
      if (paused) return;

      elapsed += dt * speed * 2;

      smMouse[0] += (rawMouse[0] - smMouse[0]) * 0.1;
      smMouse[1] += (rawMouse[1] - smMouse[1]) * 0.1;

      const res = [w, h] as [number, number];
      const centre = [0.5, 0.5] as [number, number];
      const sm = smMouse as [number, number];
      const cOut = cOutput as [number, number, number];

      gl.bindFramebuffer(gl.FRAMEBUFFER, bufA.fbo);
      gl.viewport(0, 0, w, h);
      gl.disable(gl.BLEND);
      gl.clearColor(cOut[0], cOut[1], cOut[2], 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(progVignette);
      setMVP(gl, progVignette);
      gl.uniform1f(
        gl.getUniformLocation(progVignette, 'uRadius'),
        vignetteRadius
      );
      gl.uniform1f(
        gl.getUniformLocation(progVignette, 'uFalloff'),
        vignetteFalloff
      );
      gl.uniform1f(gl.getUniformLocation(progVignette, 'uMix'), 1.0);
      gl.uniform1f(gl.getUniformLocation(progVignette, 'uDisplace'), 0.0);
      gl.uniform1f(gl.getUniformLocation(progVignette, 'uSkew'), vignetteSkew);
      gl.uniform1f(
        gl.getUniformLocation(progVignette, 'uAngle'),
        vignetteAngle
      );
      gl.uniform3fv(
        gl.getUniformLocation(progVignette, 'uVignetteColor'),
        cVig
      );
      gl.uniform1f(gl.getUniformLocation(progVignette, 'uColorAlpha'), 1.0);

      gl.uniform2fv(gl.getUniformLocation(progVignette, 'uPos'), sm);
      gl.uniform2fv(gl.getUniformLocation(progVignette, 'uResolution'), res);
      gl.uniform3fv(gl.getUniformLocation(progVignette, 'uClearColor'), cBg);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindVertexArray(vaoVignette);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindVertexArray(null);
      gl.disable(gl.BLEND);

      gl.useProgram(progSine);
      gl.uniform1f(
        gl.getUniformLocation(progSine, 'uFrequency'),
        waveFrequency
      );
      gl.uniform1f(
        gl.getUniformLocation(progSine, 'uAmplitude'),
        waveAmplitude
      );
      gl.uniform1f(gl.getUniformLocation(progSine, 'uRotation'), waveRotation);
      gl.uniform1f(gl.getUniformLocation(progSine, 'uTime'), elapsed);
      gl.uniform2fv(gl.getUniformLocation(progSine, 'uResolution'), res);
      gl.uniform2fv(gl.getUniformLocation(progSine, 'uPos'), centre);
      gl.uniform1f(
        gl.getUniformLocation(progSine, 'uMixRadius'),
        waveMixRadius
      );
      gl.uniform2fv(gl.getUniformLocation(progSine, 'uMousePos'), sm);
      gl.uniform1f(gl.getUniformLocation(progSine, 'uTrackMouse'), 0.0);
      bindTexUnit(gl, progSine, 'tInput', bufA.tex, 0);
      pass(progSine, vaoSine, bufB.fbo);

      gl.useProgram(progShatter);
      gl.uniform1f(
        gl.getUniformLocation(progShatter, 'uAmount'),
        shatterAmount
      );
      gl.uniform1f(
        gl.getUniformLocation(progShatter, 'uSpread'),
        shatterSpread
      );
      gl.uniform1f(gl.getUniformLocation(progShatter, 'uAngle'), shatterAngle);
      gl.uniform1f(gl.getUniformLocation(progShatter, 'uTime'), elapsed);
      gl.uniform1f(gl.getUniformLocation(progShatter, 'uSkew'), shatterSkew);
      gl.uniform2fv(gl.getUniformLocation(progShatter, 'uPos'), centre);
      gl.uniform2fv(gl.getUniformLocation(progShatter, 'uResolution'), res);
      gl.uniform1f(
        gl.getUniformLocation(progShatter, 'uMixRadius'),
        shatterMixRadius
      );
      gl.uniform1i(gl.getUniformLocation(progShatter, 'uMixRadiusInvert'), 0);
      gl.uniform1i(gl.getUniformLocation(progShatter, 'uEasing'), 0);
      gl.uniform2fv(gl.getUniformLocation(progShatter, 'uMousePos'), sm);
      gl.uniform1f(gl.getUniformLocation(progShatter, 'uTrackMouse'), 0.0);
      bindTexUnit(gl, progShatter, 'tInput', bufB.tex, 0);
      pass(progShatter, vaoShatter, bufA.fbo);

      gl.useProgram(progBokeh);
      gl.uniform1f(gl.getUniformLocation(progBokeh, 'uAmount'), bokehRadius);
      gl.uniform1f(gl.getUniformLocation(progBokeh, 'uTilt'), bokehTilt);
      gl.uniform1f(gl.getUniformLocation(progBokeh, 'uTime'), elapsed);
      gl.uniform2fv(gl.getUniformLocation(progBokeh, 'uPos'), centre);
      gl.uniform2fv(gl.getUniformLocation(progBokeh, 'uResolution'), res);
      gl.uniform2fv(gl.getUniformLocation(progBokeh, 'uMousePos'), sm);
      gl.uniform1f(
        gl.getUniformLocation(progBokeh, 'uTrackMouse'),
        bokehMouseTrack
      );
      gl.uniform2f(
        gl.getUniformLocation(progBokeh, 'uBlueNoiseResolution'),
        NOISE_SIZE,
        NOISE_SIZE
      );
      bindTexUnit(gl, progBokeh, 'tInput', bufA.tex, 0);
      bindTexUnit(gl, progBokeh, 'tBlueNoise', noiseTex, 1);
      pass(progBokeh, vaoBokeh, bufB.fbo);

      gl.useProgram(progOutput);
      gl.uniform1i(
        gl.getUniformLocation(progOutput, 'uLoaded'),
        bgLoaded ? 1 : 0
      );
      gl.uniform3fv(gl.getUniformLocation(progOutput, 'uBgColor'), cBg);
      gl.uniform3fv(gl.getUniformLocation(progOutput, 'uOutputColor'), cOutput);
      bindTexUnit(gl, progOutput, 'tBgTexture', bgTex, 0);
      bindTexUnit(gl, progOutput, 'tInput', bufB.tex, 1);
      pass(progOutput, vaoOutput, null);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
      ro.disconnect();
      for (const p of [
        progVignette,
        progSine,
        progShatter,
        progBokeh,
        progOutput
      ])
        gl.deleteProgram(p);
      gl.deleteTexture(bgTex);
      gl.deleteTexture(noiseTex);
      for (const b of [bufA, bufB]) {
        gl.deleteFramebuffer(b.fbo);
        gl.deleteTexture(b.tex);
      }
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden='true'
      role='img'
      className={className}
      style={{ display: 'block' }}
    />
  );
}
