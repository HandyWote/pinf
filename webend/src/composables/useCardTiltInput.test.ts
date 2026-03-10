import { describe, expect, test } from 'bun:test'
import { resolveTiltInput } from './useCardTiltInput'

describe('resolveTiltInput', () => {
  test('uses gyroscope when available and permission granted', () => {
    const result = resolveTiltInput({
      gyroOrientation: { x: 8, y: 4 },
      gyroAvailable: true,
      gyroPermissionGranted: true,
      touchTilt: { x: 10, y: 10 },
      touchActive: true,
      mouseTilt: { x: 12, y: 12 },
      isHovering: true
    })

    expect(result.mode).toBe('gyro')
    expect(result.tilt).toEqual({ x: 8, y: 4 })
  })

  test('falls back to touch before mouse when gyro is unavailable', () => {
    const result = resolveTiltInput({
      gyroOrientation: { x: 0, y: 0 },
      gyroAvailable: false,
      gyroPermissionGranted: false,
      touchTilt: { x: 6, y: -3 },
      touchActive: true,
      mouseTilt: { x: 20, y: 20 },
      isHovering: true
    })

    expect(result.mode).toBe('touch')
    expect(result.tilt).toEqual({ x: 6, y: -3 })
  })

  test('falls back to mouse on desktop when gyro and touch are unavailable', () => {
    const result = resolveTiltInput({
      gyroOrientation: { x: 0, y: 0 },
      gyroAvailable: false,
      gyroPermissionGranted: false,
      touchTilt: { x: 0, y: 0 },
      touchActive: false,
      mouseTilt: { x: -9, y: 7 },
      isHovering: true
    })

    expect(result.mode).toBe('mouse')
    expect(result.tilt).toEqual({ x: -9, y: 7 })
  })

  test('returns neutral tilt when no source is active', () => {
    const result = resolveTiltInput({
      gyroOrientation: { x: 0, y: 0 },
      gyroAvailable: false,
      gyroPermissionGranted: false,
      touchTilt: { x: 0, y: 0 },
      touchActive: false,
      mouseTilt: { x: 0, y: 0 },
      isHovering: false
    })

    expect(result.mode).toBe('none')
    expect(result.tilt).toEqual({ x: 0, y: 0 })
  })
})
