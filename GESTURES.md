# 🖐️ Gesture Reference Guide

This document provides a comprehensive guide to all gestures recognized by Hypnotic Gestures and their associated actions.

## Overview

Hypnotic Gestures recognizes **7 distinct hand gestures** from Google MediaPipe's gesture recognition model. Some gestures have **position-based behaviors**, meaning the action depends on where your hand is in the camera frame.

## Frame Position Zones

The camera frame is divided into zones for position-based gestures:

### Thirds (Horizontal)
```
┌─────────┬─────────┬─────────┐
│  LEFT   │ CENTER  │  RIGHT  │
│   1/3   │   1/3   │   1/3   │
└─────────┴─────────┴─────────┘
```

### Quadrants (Directional)
```
        UP
         ↑
         │
LEFT ←───┼───→ RIGHT
         │
         ↓
       DOWN
```

## Gesture Catalog

---

### 1. ✊ Closed Fist - Enter Panel

**Recognition**: Closed hand with all fingers curled into palm

**Behavior**: Navigation Layer 1 - Enter selected panel

**Action**: When in Layer 1, enter the currently selected panel to access its items (transitions to Layer 2)

**Use Case**: Primary navigation gesture for diving into Control, Instruments, or Effects panels to adjust individual items.

**Debounce**: 600ms

**Tips**:
- Use this to confirm your panel selection and access individual controls
- After entering a panel, use other gestures to navigate and adjust items
- Use Victory gesture to return to Layer 1

---

### 2. 🖐️ Open Palm - Value Adjustment

**Recognition**: Open hand with all five fingers extended and spread

**Behavior**: Position-based slider control (requires selected item)

| Position | Action | Description |
|----------|--------|-------------|
| **Left Third** | Decrease | Reduces value by 5% per trigger |
| **Center Third** | None | Neutral zone - no action |
| **Right Third** | Increase | Increases value by 5% per trigger |

**Requirements**: 
- You must have an instrument or effect selected
- The item must be turned on

**Controllable Parameters**:
- **Instruments**: Volume (0-100%)
- **Effects**: Primary parameter (usually wet/dry mix)

**Debounce**: 200ms (allows for continuous adjustment)

**Use Case**: Fine-tune volumes and effect parameters hands-free. Select an item first (with Pointing Up gesture), then use Open Palm to adjust.

**Tips**:
- Spread your fingers clearly
- Hold position for smooth continuous adjustment
- Center third is a "rest" position

---

### 3. ☝️ Pointing Up - Navigation

**Recognition**: Index finger extended upward, other fingers closed

**Behavior**: Quadrant-based navigation through selectable items

| Quadrant | Action | Description |
|----------|--------|-------------|
| **Up** | Previous Item | Move to previous instrument/effect |
| **Down** | Next Item | Move to next instrument/effect |
| **Left** | Previous Item | Same as up (alternative direction) |
| **Right** | Next Item | Same as down (alternative direction) |

**Navigation Order**:
1. Kick (instrument)
2. Hi-Hat (instrument)
3. Bass (instrument)
4. Lead (instrument)
5. Reverb (effect)
6. Delay (effect)
7. Filter (effect)

**Debounce**: 600ms

**Use Case**: Navigate through instruments and effects to select which one you want to control. The selected item will be highlighted with a border and checkmark.

**Tips**:
- Point clearly upward with index finger
- Move your hand decisively in the desired direction
- Watch for the selection highlight to confirm navigation
- Wraps around: navigating past the last item goes to the first

---

### 4. 👍 Thumbs Up - Activate

**Recognition**: Thumb extended upward, other fingers closed

**Behavior**: Turns ON the currently selected instrument or effect

**Requirements**: 
- An item must be selected (use Pointing Up to select)
- Item must currently be OFF

**Debounce**: 500ms (default)

**Use Case**: Activate instruments to add them to your beat, or turn on effects to process the audio.

**Visual Feedback**:
- Item card background becomes highlighted
- On/off toggle button fills in
- "Active" badge appears

**Tips**:
- Make a clear thumbs up gesture
- Hold for half a second for reliable detection
- If nothing happens, check that you have an item selected

---

### 5. 👎 Thumbs Down - Deactivate

**Recognition**: Thumb extended downward, other fingers closed

**Behavior**: Turns OFF the currently selected instrument or effect

**Requirements**: 
- An item must be selected (use Pointing Up to select)
- Item must currently be ON

**Debounce**: 500ms (default)

**Use Case**: Remove instruments from your beat or disable effects. Good for live performance control.

**Visual Feedback**:
- Item card background returns to normal
- On/off toggle button empties
- "Inactive" badge appears

**Tips**:
- Make a clear thumbs down gesture
- Hold steady for reliable detection
- Pair with Thumbs Up for live on/off control

---

### 6. ✌️ Victory - Reset

**Recognition**: Index and middle fingers extended in a "V" shape

**Behavior**: Resets ALL settings to defaults

**Action Details**:
- All instruments turned OFF
- All effects turned OFF
- Volumes reset to defaults
- Effect parameters reset to defaults
- Tempo reset to 128 BPM
- Playback state preserved (doesn't stop if playing)

**Debounce**: 1000ms (long cooldown to prevent accidents)

**Use Case**: Quick way to start fresh without manually turning everything off. Good for experimenting or transitioning between ideas.

**Warning**: This will reset all your current settings! There's no undo.

**Tips**:
- Use deliberately - has a longer cooldown
- Good for performance "drops" (turn everything off at once)
- Playback continues, so you can smoothly transition to silence then rebuild

---

### 7. 🤟 ILoveYou - Toggle Item

**Recognition**: Thumb, index, and pinky fingers extended (rock/love sign)

**Behavior**: Navigation Layer 2 - Toggle selected item on/off

**Actions**:
- **Instruments**: Toggle instrument on/off
- **Effects**: Toggle effect on/off
- **Control Items**: Toggle lock or recording state

**Use Case**: The primary action gesture in Layer 2. Use this to turn individual instruments and effects on or off, or to toggle control settings like lock and recording.

**Debounce**: 600ms

**Tips**:
- Only works when you're in Layer 2 (after entering a panel with Closed Fist)
- Use this to activate/deactivate items in your mix
- For instruments and effects, toggling on/off is instant
- Combine with Open Palm to adjust values before or after toggling

---

## Gesture Recognition Tips

### For Best Detection:

1. **Lighting**: Ensure good, even lighting on your hand
2. **Distance**: Keep hand ~2-3 feet from camera
3. **Clarity**: Make distinct, clear gestures (don't halfway close fist, etc.)
4. **Stability**: Hold gestures steady for 0.3-0.5 seconds
5. **Camera Angle**: Face the camera directly
6. **Background**: Simple backgrounds work better than cluttered ones

### If Gestures Aren't Detected:

1. Check that MediaPipe model has finished loading (no loading indicator)
2. Verify your hand is fully visible in the frame
3. Try making the gesture more pronounced
4. Check that the gesture indicator shows your hand is being tracked (green landmarks)
5. Look at the confidence score - should be >60% for reliable detection

### Common Mistakes:

- **Partial gestures**: Make sure all fingers are in the correct position
- **Too fast**: Moving too quickly between positions
- **Wrong zones**: Not moving hand far enough into position zones
- **Multiple hands**: System detects one hand only - use your dominant hand
- **Tilted gestures**: Keep gestures upright and clear

## Lock Mode

Press the **Lock** button in the Control Panel (or use the gesture if you configure it) to prevent accidental gesture triggers. Useful when:
- Setting up your camera
- Taking a break
- Making manual adjustments via mouse/keyboard

When locked, gestures are still detected and displayed, but no actions are performed.

## Keyboard Shortcuts

- **G**: Toggle gesture guide overlay (shows position zones and quick reference)

## Advanced: Position Calibration

The position zones are calculated relative to the wrist landmark (landmark index 0) in the MediaPipe hand model:

- **Left third**: x < 0.33
- **Center third**: 0.33 ≤ x ≤ 0.67
- **Right third**: x > 0.67
- **Quadrants**: Based on x/y distance from center (0.5, 0.5)

These thresholds can be adjusted in `src/utils/gestureUtils.ts` if you want different zone sizes.

## Troubleshooting

### Gesture detected but no action happening:
- Check if interface is locked (lock icon in control panel)
- For Open Palm: ensure an item is selected
- For Thumbs Up/Down: ensure an item is selected
- Check debounce timing - you may be triggering too quickly

### Wrong action triggered:
- You may be in the wrong position zone - enable the guide (press G)
- Hold gestures more steadily
- Slow down transitions between gestures

### Erratic behavior:
- Check lighting conditions
- Reduce background clutter
- Ensure only one hand is visible
- Try recalibrating by refreshing the page

---

**Happy gesturing! 🎵🖐️**
