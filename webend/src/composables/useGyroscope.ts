import { ref, onMounted, onUnmounted } from 'vue'

interface Orientation {
  x: number  // rotateX - beta (前后倾斜)
  y: number  // rotateY - gamma (左右倾斜)
}

export function useGyroscope() {
  const orientation = ref<Orientation>({ x: 0, y: 0 })
  const available = ref(false)
  const needsPermission = ref(false)
  const permissionGranted = ref(false)

  let animationFrameId: number | null = null
  // 平滑过滤参数
  const smoothing = 0.1
  let targetOrientation = { x: 0, y: 0 }

  const getOrientationConstructor = () => {
    if (typeof window === 'undefined') return null
    return window.DeviceOrientationEvent ?? null
  }

  const getRequestPermission = () => {
    const OrientationCtor = getOrientationConstructor() as
      | (typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<'granted' | 'denied'>
        })
      | null

    if (!OrientationCtor || typeof OrientationCtor.requestPermission !== 'function') {
      return null
    }

    return OrientationCtor.requestPermission.bind(OrientationCtor)
  }

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.beta === null || event.gamma === null) return

    // beta: -180 到 180 (前后倾斜)
    // gamma: -90 到 90 (左右倾斜)
    // 限制角度范围 ±20 度
    const maxAngle = 20
    targetOrientation.x = Math.max(-maxAngle, Math.min(maxAngle, event.beta - 45)) // 45度为自然握持角度
    targetOrientation.y = Math.max(-maxAngle, Math.min(maxAngle, event.gamma))
  }

  const smoothUpdate = () => {
    orientation.value.x += (targetOrientation.x - orientation.value.x) * smoothing
    orientation.value.y += (targetOrientation.y - orientation.value.y) * smoothing
    animationFrameId = requestAnimationFrame(smoothUpdate)
  }

  const requestPermission = async (): Promise<boolean> => {
    const request = getRequestPermission()
    if (request) {
      try {
        const permission = await request()
        permissionGranted.value = permission === 'granted'
        return permissionGranted.value
      } catch (e) {
        console.error('Gyroscope permission error:', e)
        return false
      }
    }
    // 非 iOS 13+ 设备直接可用
    permissionGranted.value = true
    return true
  }

  const start = () => {
    if (!window.DeviceOrientationEvent) {
      available.value = false
      return
    }

    available.value = true
    window.addEventListener('deviceorientation', handleOrientation)
    smoothUpdate()
  }

  const stop = () => {
    window.removeEventListener('deviceorientation', handleOrientation)
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  // 检测是否需要请求权限 (iOS 13+)
  const checkPermission = () => {
    if (getRequestPermission()) {
      needsPermission.value = true
    }
  }

  onMounted(() => {
    checkPermission()
  })

  onUnmounted(() => {
    stop()
  })

  return {
    orientation,
    available,
    needsPermission,
    permissionGranted,
    requestPermission,
    start,
    stop
  }
}
