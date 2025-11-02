import type { FrameThird, FrameQuadrant, HandLandmark, PositionInfo } from '../types';

/**
 * Determines which third of the frame the hand is in (left, center, right)
 * Based on the wrist landmark (index 0) x-position
 * Note: x-coordinate is mirrored to match the mirrored video display
 */
export function getFrameThird(landmarks: HandLandmark[]): FrameThird {
  if (!landmarks || landmarks.length === 0) return 'center';
  
  const wrist = landmarks[0];
  const x = 1 - wrist.x; // Mirror x-coordinate to match video display
  
  if (x < 0.33) return 'left';
  if (x > 0.67) return 'right';
  return 'center';
}

/**
 * Determines which quadrant the hand is in (up, down, left, right)
 * Based on the wrist landmark position
 * Used primarily for Pointing_Up gesture navigation
 * Returns the dominant direction based on distance from center
 */
export function getFrameQuadrant(landmarks: HandLandmark[]): FrameQuadrant {
  if (!landmarks || landmarks.length === 0) return 'up';
  
  const wrist = landmarks[0];
  const x = 1 - wrist.x; // Mirror x-coordinate to match video display
  const y = wrist.y;
  
  // Calculate distance from center (0.5, 0.5)
  const dx = x - 0.5;
  const dy = y - 0.5;
  
  // Return the direction with the larger absolute distance
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal is dominant
    return dx > 0 ? 'right' : 'left';
  } else {
    // Vertical is dominant
    return dy > 0 ? 'down' : 'up';
  }
}

/**
 * Gets comprehensive position information for a set of landmarks
 * Note: x-coordinate is mirrored to match the mirrored video display
 */
export function getPositionInfo(landmarks: HandLandmark[]): PositionInfo {
  if (!landmarks || landmarks.length === 0) {
    return {
      third: 'center',
      quadrant: 'up',
      x: 0.5,
      y: 0.5,
    };
  }
  
  const wrist = landmarks[0];
  
  return {
    third: getFrameThird(landmarks),
    quadrant: getFrameQuadrant(landmarks),
    x: 1 - wrist.x, // Mirror x-coordinate to match video display
    y: wrist.y,
  };
}

/**
 * Checks if a gesture has been stable for a certain duration
 * Helps prevent false triggers
 */
export class GestureStabilizer {
  private currentGesture: string | null = null;
  private gestureStartTime: number = 0;
  private readonly stabilityThreshold: number;
  
  constructor(stabilityThresholdMs: number = 300) {
    this.stabilityThreshold = stabilityThresholdMs;
  }
  
  isStable(gesture: string | null): boolean {
    const now = Date.now();
    
    if (gesture !== this.currentGesture) {
      this.currentGesture = gesture;
      this.gestureStartTime = now;
      return false;
    }
    
    return (now - this.gestureStartTime) >= this.stabilityThreshold;
  }
  
  reset() {
    this.currentGesture = null;
    this.gestureStartTime = 0;
  }
}

/**
 * Debouncer for gesture actions to prevent rapid-fire triggers
 */
export class ActionDebouncer {
  private lastActionTime: Map<string, number> = new Map();
  private readonly defaultCooldown: number;
  
  constructor(defaultCooldownMs: number = 500) {
    this.defaultCooldown = defaultCooldownMs;
  }
  
  canTrigger(actionKey: string, cooldown?: number): boolean {
    const now = Date.now();
    const lastTime = this.lastActionTime.get(actionKey) || 0;
    const cooldownTime = cooldown || this.defaultCooldown;
    
    if (now - lastTime >= cooldownTime) {
      this.lastActionTime.set(actionKey, now);
      return true;
    }
    
    return false;
  }
  
  reset(actionKey?: string) {
    if (actionKey) {
      this.lastActionTime.delete(actionKey);
    } else {
      this.lastActionTime.clear();
    }
  }
}

/**
 * Smooth value interpolation for slider controls
 */
export function smoothValue(
  currentValue: number,
  targetValue: number,
  smoothingFactor: number = 0.2
): number {
  return currentValue + (targetValue - currentValue) * smoothingFactor;
}

/**
 * Maps a position (0-1) to a value range
 */
export function mapPositionToValue(
  position: number,
  min: number,
  max: number
): number {
  return min + position * (max - min);
}

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
