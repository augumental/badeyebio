import { useEffect, useRef } from 'react'

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uCell;
uniform float uBoost;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 cellId = floor(gl_FragCoord.xy / uCell);
  vec2 local = fract(gl_FragCoord.xy / uCell) - 0.5;
  vec2 uv = (cellId * uCell) / uRes.y;
  vec2 m = uMouse / uRes.y;

  vec2 toM = uv - m;
  float d = length(toM);
  uv += toM * 0.25 * exp(-d * 5.0);

  float t = uTime * 0.045;
  vec2 q = vec2(fbm(uv * 1.4 + vec2(t, -t)), fbm(uv * 1.4 + vec2(5.2 - t, 1.3 + t)));
  vec2 r = vec2(fbm(uv * 1.1 + q * 2.2 + vec2(1.7, 9.2) + t), fbm(uv * 1.1 + q * 2.2 + vec2(8.3, 2.8)));
  float n = fbm(uv * 1.2 + r * 1.8 + vec2(uScroll * 0.9, -uScroll * 0.6));

  n = smoothstep(0.32, 0.78, n) * uBoost;
  n += exp(-d * 9.0) * 0.18;

  float on = step(bayer8(cellId), n);
  float dotMask = 1.0 - smoothstep(0.36, 0.5, length(local));
  vec3 col = mix(vec3(0.38, 0.0, 0.01), vec3(0.95, 0.04, 0.04), clamp(n, 0.0, 1.0));
  gl_FragColor = vec4(col * on * dotMask, 1.0);
}
`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s)
    gl.deleteShader(s)
    throw new Error(`Shader compile failed: ${log}`)
  }
  return s
}

/**
 * Animated red halftone/dither field rendered with WebGL.
 * scrollRef.current: 0..(sections-1) scroll position, shifts the flow.
 * boostRef.current: brightness multiplier (used for the entrance flash).
 */
export default function DitherBackground({ scrollRef, boostRef }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) {
      console.warn('[DitherBackground] WebGL unavailable, using CSS fallback')
      canvas.classList.add('dither-fallback')
      return undefined
    }

    let program
    try {
      program = gl.createProgram()
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT))
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`Program link failed: ${gl.getProgramInfoLog(program)}`)
      }
    } catch (err) {
      console.error('[DitherBackground]', err)
      canvas.classList.add('dither-fallback')
      return undefined
    }
    gl.useProgram(program)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const u = Object.fromEntries(
      ['uRes', 'uTime', 'uMouse', 'uScroll', 'uCell', 'uBoost'].map((n) => [n, gl.getUniformLocation(program, n)]),
    )

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, tx: window.innerWidth / 2, ty: window.innerHeight / 2 }
    let scroll = 0
    let boost = 1
    let raf = 0
    let running = true
    const start = performance.now()

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    const onMove = (e) => {
      const p = e.touches ? e.touches[0] : e
      mouse.tx = p.clientX
      mouse.ty = p.clientY
    }
    const onVisibility = () => {
      running = !document.hidden
      if (running) raf = requestAnimationFrame(frame)
      else cancelAnimationFrame(raf)
    }

    function frame(now) {
      if (!running) return
      mouse.x += (mouse.tx - mouse.x) * 0.06
      mouse.y += (mouse.ty - mouse.y) * 0.06
      scroll += ((scrollRef?.current ?? 0) - scroll) * 0.05
      boost += ((boostRef?.current ?? 1) - boost) * 0.04

      gl.uniform2f(u.uRes, canvas.width, canvas.height)
      gl.uniform1f(u.uTime, (now - start) / 1000)
      gl.uniform2f(u.uMouse, mouse.x * dpr, canvas.height - mouse.y * dpr)
      gl.uniform1f(u.uScroll, scroll)
      gl.uniform1f(u.uCell, 4 * dpr)
      gl.uniform1f(u.uBoost, boost)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      document.removeEventListener('visibilitychange', onVisibility)
      gl.deleteBuffer(buf)
      gl.deleteProgram(program)
    }
  }, [scrollRef, boostRef])

  return <canvas ref={canvasRef} className="dither-bg" aria-hidden="true" />
}
