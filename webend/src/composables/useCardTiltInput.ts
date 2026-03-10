import { computed, type Ref } from 'vue'

interface TiltValue {
  x: number
  y: number
}

interface UseCardTiltInputOptions {
  gyroOrientation: Ref<TiltValue>
  gyroAvailable: Ref<boolean>
  gyroPermissionGranted: Ref<boolean>
  touchTilt: Ref<TiltValue>
  touchActive: Ref<boolean>
  mouseTilt: Ref<TiltValue>
  isHovering: Ref<boolean>
}

const TILT_EPSILON = 0.01

interface ResolveTiltInputParams {
  gyroOrientation: TiltValue
  gyroAvailable: boolean
  gyroPermissionGranted: boolean
  touchTilt: TiltValue
  touchActive: boolean
  mouseTilt: TiltValue
  isHovering: boolean
}

export type TiltInputMode = 'gyro' | 'touch' | 'mouse' | 'none'

export interface ResolvedTiltInput {
  mode: TiltInputMode
  tilt: TiltValue
}

export function resolveTiltInput(params: ResolveTiltInputParams): ResolvedTiltInput {
  const hasTouchTilt =
    params.touchActive ||
    Math.abs(params.touchTilt.x) > TILT_EPSILON ||
    Math.abs(params.touchTilt.y) > TILT_EPSILON

  if (params.gyroAvailable && params.gyroPermissionGranted) {
    return {
      mode: 'gyro',
      tilt: params.gyroOrientation
    }
  }

  if (hasTouchTilt) {
    return {
      mode: 'touch',
      tilt: params.touchTilt
    }
  }

  if (params.isHovering) {
    return {
      mode: 'mouse',
      tilt: params.mouseTilt
    }
  }

  return {
    mode: 'none',
    tilt: { x: 0, y: 0 }
  }
}

export function useCardTiltInput(options: UseCardTiltInputOptions) {
  const resolvedTiltInput = computed(() =>
    resolveTiltInput({
      gyroOrientation: options.gyroOrientation.value,
      gyroAvailable: options.gyroAvailable.value,
      gyroPermissionGranted: options.gyroPermissionGranted.value,
      touchTilt: options.touchTilt.value,
      touchActive: options.touchActive.value,
      mouseTilt: options.mouseTilt.value,
      isHovering: options.isHovering.value
    })
  )

  const currentTilt = computed<TiltValue>(() => resolvedTiltInput.value.tilt)

  const inputMode = computed<TiltInputMode>(() => resolvedTiltInput.value.mode)

  return {
    currentTilt,
    inputMode
  }
}
