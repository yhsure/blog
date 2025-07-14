/**
 * Hardware acceleration detection based on GPU capabilities
 * Used to conditionally disable expensive visual effects on weaker hardware
 */

interface HardwareCapabilities {
  hasGoodGPU: boolean
  gpuTier: 'high' | 'medium' | 'low' | 'unknown'
  vendor: string
  renderer: string
  isIntegrated: boolean
  hasMajorPerformanceCaveat: boolean
}

let hardwareCapabilities: HardwareCapabilities | null = null
let animationHasPlayed = false

// Patterns that indicate software or very weak renderers
const WEAK_RENDERERS = [
  'swiftshader',
  'llvmpipe',
  'software',
  'microsoft basic render driver',
  'google swiftshader',
  'angle (intel, intel(r) hd graphics',
  'angle (intel, intel(r) uhd graphics',
  'virtualbox',
  'vmware',
  'parallels',
]

// Patterns that identify a decent or strong GPU
const GOOD_GPU_PATTERNS = [
  /nvidia.*geforce.*[1-9][0-9]{2}/i,
  /nvidia.*rtx/i,
  /amd.*radeon.*[1-9][0-9]{2}/i,
  /apple.*m[1-9]/i,
  /apple.*gpu/i,
  /mali.*g[7-9][0-9]/i,
  /adreno.*[5-9][0-9]{2}/i,
]

function detectHardwareCapabilities(): HardwareCapabilities {
  const canvas = document.createElement('canvas')
  let gl: WebGLRenderingContext | null = null
  let vendor = ''
  let renderer = ''
  let hasMajorPerformanceCaveat = false

  try {
    gl = canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true }) as WebGLRenderingContext
    if (!gl) {
      hasMajorPerformanceCaveat = true
      gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext
    }
  } catch (_) {
    gl = null
  }

  if (gl) {
    try {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || ''
        renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
      }
    } catch (_) {
      /* extension blocked */
    }
  } else {
    // No WebGL at all – assume software rendering
    hasMajorPerformanceCaveat = true
  }

  canvas.remove()

  const rendererLower = renderer.toLowerCase()
  const vendorLower = vendor.toLowerCase()

  const isWeakRenderer = !gl || WEAK_RENDERERS.some((w) => rendererLower.includes(w))
  const isIntegrated = /intel.*hd|intel.*uhd|intel.*iris|amd.*vega/.test(rendererLower) && !/apple/.test(vendorLower)
  const hasGoodGPU = GOOD_GPU_PATTERNS.some((p) => p.test(renderer) || p.test(vendor))

  let gpuTier: 'high' | 'medium' | 'low' | 'unknown' = 'unknown'
  if (isWeakRenderer || hasMajorPerformanceCaveat) {
    gpuTier = 'low'
  } else if (hasGoodGPU) {
    gpuTier = 'high'
  } else if (isIntegrated) {
    gpuTier = 'low'
  } else {
    gpuTier = 'medium'
  }

  const result: HardwareCapabilities = {
    hasGoodGPU: gpuTier === 'high' || gpuTier === 'medium',
    gpuTier,
    vendor,
    renderer,
    isIntegrated,
    hasMajorPerformanceCaveat,
  }

  return result
}

function getHardwareCapabilities(): HardwareCapabilities {
  if (!hardwareCapabilities) {
    try {
      const cached = sessionStorage.getItem('hardwareCapabilities')
      if (cached) {
        hardwareCapabilities = JSON.parse(cached)
      }
    } catch (_) {}
    if (!hardwareCapabilities) {
      hardwareCapabilities = detectHardwareCapabilities()
      try {
        sessionStorage.setItem('hardwareCapabilities', JSON.stringify(hardwareCapabilities))
      } catch (_) {}
    }
  }
  return hardwareCapabilities!
}

function applyHardwareClasses() {
  const caps = getHardwareCapabilities()
  document.body.classList.remove('hw-accel-good', 'hw-accel-poor')
  const cls = caps.hasGoodGPU ? 'hw-accel-good' : 'hw-accel-poor'
  document.body.classList.add(cls)

  if (caps.hasGoodGPU) {
    if (!animationHasPlayed) {
      // first load – play animation
      document.body.classList.add('animation-ready')
      document.body.classList.remove('animation-static')
    } else {
      // subsequent navigation – keep final state
      document.body.classList.remove('animation-ready')
      document.body.classList.add('animation-static')
    }
  } else {
    // poor hardware: no animation at all
    document.body.classList.remove('animation-ready', 'animation-static')
  }

  document.dispatchEvent(new CustomEvent('hardwaredetected', { detail: caps }))
}

function init() {
  applyHardwareClasses()
  setupAnimationEndListener()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

document.addEventListener('nav', () => {
  applyHardwareClasses()
  setupAnimationEndListener()
})
;(window as any).getHardwareCapabilities = getHardwareCapabilities 

function markAnimationPlayed() {
  if (animationHasPlayed) return
  animationHasPlayed = true
  document.body.classList.remove('animation-ready')
  document.body.classList.add('animation-static')
}

function setupAnimationEndListener() {
  const el = document.getElementById('dappled-light')
  if (!el) return
  el.addEventListener('animationend', markAnimationPlayed, { once: true })
} 