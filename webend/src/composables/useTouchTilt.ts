import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useTouchTilt(elementRef: Ref<HTMLElement | null>) {
  const tilt = ref({ x: 0, y: 0 })
  const isActive = ref(false)

  let startX = 0
  let startY = 0

  const maxAngle = 25

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    isActive.value = true
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isActive.value || !elementRef.value) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    // 映射到倾斜角度
    const rect = elementRef.value.getBoundingClientRect()
    const maxDelta = Math.max(rect.width, rect.height) / 2

    tilt.value = {
      x: -(deltaY / maxDelta) * maxAngle,
      y: (deltaX / maxDelta) * maxAngle
    }
  }

  const handleTouchEnd = () => {
    isActive.value = false
    // 平滑复位
    const animate = () => {
      tilt.value.x *= 0.85
      tilt.value.y *= 0.85

      if (Math.abs(tilt.value.x) > 0.1 || Math.abs(tilt.value.y) > 0.1) {
        requestAnimationFrame(animate)
      } else {
        tilt.value = { x: 0, y: 0 }
      }
    }
    animate()
  }

  const bindEvents = (el: HTMLElement) => {
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: true })
    el.addEventListener('touchend', handleTouchEnd)
  }

  const unbindEvents = (el: HTMLElement) => {
    el.removeEventListener('touchstart', handleTouchStart)
    el.removeEventListener('touchmove', handleTouchMove)
    el.removeEventListener('touchend', handleTouchEnd)
  }

  onMounted(() => {
    if (elementRef.value) {
      bindEvents(elementRef.value)
    }
  })

  onUnmounted(() => {
    if (elementRef.value) {
      unbindEvents(elementRef.value)
    }
  })

  return {
    tilt,
    isActive
  }
}
