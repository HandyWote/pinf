import { onMounted, onUnmounted, ref, type Ref } from 'vue'

interface TiltValue {
  x: number
  y: number
}

interface UsePointerTiltOptions {
  maxTilt?: number
}

const DEFAULT_MAX_TILT = 20

export function usePointerTilt(
  elementRef: Ref<HTMLElement | null>,
  options: UsePointerTiltOptions = {}
) {
  const tilt = ref<TiltValue>({ x: 0, y: 0 })
  const isHovering = ref(false)

  const maxTilt = options.maxTilt ?? DEFAULT_MAX_TILT
  let frameId: number | null = null
  let pendingPointer: { x: number; y: number } | null = null

  const applyTilt = () => {
    frameId = null
    if (!elementRef.value || !pendingPointer || !isHovering.value) return

    const rect = elementRef.value.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const relativeX = (pendingPointer.x - centerX) / (rect.width / 2)
    const relativeY = (pendingPointer.y - centerY) / (rect.height / 2)

    tilt.value = {
      x: -relativeY * maxTilt,
      y: relativeX * maxTilt
    }
  }

  const scheduleApplyTilt = () => {
    if (frameId !== null) return
    frameId = requestAnimationFrame(applyTilt)
  }

  const handlePointerEnter = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    isHovering.value = true
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    if (!isHovering.value) return

    pendingPointer = {
      x: event.clientX,
      y: event.clientY
    }
    scheduleApplyTilt()
  }

  const handlePointerLeave = () => {
    isHovering.value = false
    pendingPointer = null
    tilt.value = { x: 0, y: 0 }
  }

  const bindEvents = (el: HTMLElement) => {
    el.addEventListener('pointerenter', handlePointerEnter)
    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerleave', handlePointerLeave)
  }

  const unbindEvents = (el: HTMLElement) => {
    el.removeEventListener('pointerenter', handlePointerEnter)
    el.removeEventListener('pointermove', handlePointerMove)
    el.removeEventListener('pointerleave', handlePointerLeave)
  }

  onMounted(() => {
    if (elementRef.value) {
      bindEvents(elementRef.value)
    }
  })

  onUnmounted(() => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId)
      frameId = null
    }

    if (elementRef.value) {
      unbindEvents(elementRef.value)
    }
  })

  return {
    tilt,
    isHovering
  }
}
