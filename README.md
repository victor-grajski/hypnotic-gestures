# 🎵 Hypnotic Gestures

A gesture-controlled hypnotic techno music workstation built with React, TypeScript, Tailwind CSS, shadcn/ui, Google MediaPipe, and Tone.js.

🌐 https://hypnotic-gestures.vercel.app

🎥 [Demo Video: v6 (current)](https://youtu.be/F4KugqcCxoM)

🎥 [Demo Videos: v1-v5](https://youtu.be/vhfQyS-gpL4)

## 🌟 Overview

Hypnotic Gestures is an prototype music application that lets you control a hypnotic techno beat using hand gestures detected through your webcam. It combines real-time computer vision (MediaPipe) with audio synthesis (Tone.js) to create a (hopefully) intuitive, hands-free music production experience.

For more on my process to get to this point, check out [PROCESS.md](https://github.com/victor-grajski/hypnotic-gestures/blob/main/PROCESS.md)!

### Key Features

- **Real-time Gesture Recognition**: Detects 7 different hand gestures using Google MediaPipe: "Closed_Fist", "Open_Palm", "Pointing_Up", "Thumb_Down", "Thumb_Up", "Victory", "ILoveYou"
- **4-Track Editor**: Toggle and control volume for Kick, Hi-Hat, Bass, and Lead instruments
- **ADSR Envelope Control**: Shape the sound of each instrument with attack, decay, sustain, and release parameters
- **Visual Feedback**: Live video feed with hand landmark tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A modern browser with webcam support (Chrome/Edge recommended)
- Webcam permissions for the browser

### Installation

```bash
# Clone the repository
git clone https://github.com/victor-grajski/hypnotic-gestures.git
cd hypnotic-gestures

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` in your browser and grant webcam permissions when prompted.

## 🖐️ Gesture Controls

Hypnotic Gestures recognizes 7 different hand gestures.

### Quick Reference

| Gesture | Layer 1 | Layer 2 |
|---------|--------|----------------|
| ✊ Closed Fist | Enter Panel | - |
| 🖐️ Open Palm | - | Adjust Values (Left = Decrease, Right = Increase) |
| ☝️ Pointing Up | Previous/Next Panel (Left = Previous, Right = Next) | Previous/Next Item (Left = Previous, Right = Next) |
| 👍 Thumbs Up | Play | Play |
| 👎 Thumbs Down | Pause | Pause |
| ✌️ Victory | - | Return to Layer 1 |
| 🤟 ILoveYou | Toggle Webcam Guide (Layer 1) | Toggle Item On/Off (Layer 2: Instruments Panel) |

You can also press **G** to toggle the gesture guide overlay.

## 🎹 Interface Layout

The interface supports two layout modes that you can switch between:

### Switching Layouts

Press **C** to show/hide the config panel, then use the **Layout** dropdown to switch between:
- **1+3 Grid**: Large webcam view with smaller panels below (default)
- **2x2 Grid**: Equal-sized panels in a 2×2 grid

### 1+3 Grid Layout

The 1+3 grid features a large webcam view on top with three panels below:

```
┌───────────────────────────────────────┐
│          Webcam View (Large)          │
│          + Landmarks                  │
│          + Gesture Info               │
│                                       │
├─────────────┬─────────────┬───────────┤
│  Control    │ Instruments │   ADSR    │
│  Panel      │   Panel     │  Envelope │
└─────────────┴─────────────┴───────────┘
```

### 2x2 Grid Layout

The 2x2 grid divides the interface into four equal quadrants:

```
┌──────────────────┬──────────────────┐
│  Webcam View     │  Control Panel   │
│  + Landmarks     │  + Play/Pause    │
│  + Gesture Info  │  + Volume/Tempo  │
│                  │                  │
├──────────────────┼──────────────────┤
│  Instruments     │  ADSR Envelope   │
│  + Kick Drum     │  + Attack        │
│  + Hi-Hat        │  + Decay         │
│  + Bass Synth    │  + Sustain       │
│  + Lead Synth    │  + Release       │
└──────────────────┴──────────────────┘
```

### Control Panel
- **Play/Pause**: Start or stop the track
- **Master Volume**: Control overall output level
- **Tempo**: Adjust BPM (80-180)

### Instruments Panel
- **4 Instruments**: Kick, Hi-Hat, Bass, Lead
- Each instrument has:
  - On/Off toggle
  - Volume control
  - Selection indicator

### ADSR Panel
- **ADSR Envelope Editor**: Control the sound envelope for each instrument
- Edit envelope parameters for the selected instrument:
  - Attack: How quickly the sound reaches peak volume
  - Decay: How quickly it drops to sustain level
  - Sustain: The held volume level
  - Release: How quickly the sound fades after note release
- Select an instrument first to edit its ADSR envelope

## 🎮 How to Use

1. **Grant Webcam Permissions**: Allow the browser to access your camera
2. **Wait for Model Loading**: The gesture recognition model will load (a few seconds)
3. **Position Your Hand**: Keep your hand visible in the webcam frame
4. **Start Making Music**:
   - Use **thumbs up** to start playback
   - Use **pointing up left/right** to navigate between panels (Control, Instruments, ADSR)
   - Make a **closed fist** to enter the selected panel
   - Use **pointing up left/right** again to navigate between items in the panel
   - Use **ILoveYou gesture** 🤟 to toggle the selected item on/off
   - Use **open palm left/right** to adjust volume or ADSR parameters
   - Use **victory** ✌️ gesture to return to Layer 1 (panel selection)

### Tips for Best Results

- Keep your hand at a comfortable distance from the camera
- Ensure good lighting for better gesture detection
- Hold gestures steady for ~0.5 seconds for reliable recognition
- Use the guide overlay to see position zones
- The interface also supports clicking behavior

## 🏗️ Technical Architecture

### Tech Stack

- **Frontend Framework**: React 18 + TypeScript + Vite
- **Gesture Recognition**: Google MediaPipe Gesture Recognizer
- **Audio Engine**: Tone.js
- **Component Library**: shadcn/ui
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React Context + useReducer

### Project Structure

```
src/
├── components/          # React UI components
│   ├── WebcamViewer.tsx
│   ├── ControlPanel.tsx
│   ├── InstrumentPanel.tsx
│   ├── ADSRPanel.tsx
│   ├── ConfigPanel.tsx
│   └── MinimumScreenSizeOverlay.tsx
├── context/            # State management
│   └── AppContext.tsx
├── engine/             # Core logic
│   ├── AudioEngine.ts  # Tone.js wrapper
│   └── GestureHandler.ts # Gesture-to-action mapping
├── hooks/              # Custom React hooks
│   └── useGestureRecognition.ts
├── types/              # TypeScript definitions
│   └── index.ts
├── utils/              # Helper functions
│   └── gestureUtils.ts
├── App.tsx            # Main application
└── main.tsx           # Entry point
```

### Key Components

- **AudioEngine**: Manages Tone.js instruments, effects, and transport
- **GestureHandler**: Maps detected gestures to application actions with debouncing
- **useGestureRecognition**: Custom hook for MediaPipe integration
- **AppContext**: Centralized state management with automatic audio engine sync

## 🔧 Configuration

### Gesture Debounce Timing (Adjustable via UI)

Press **C** to show the config panel, which exposes real-time debounce timing controls for each gesture:

- **👆 Pointing Up** (navigate/cycle between panels/items)
- **✊ Closed Fist** (enter panel)
- **✋ Open Palm** (adjust values)
- **👎 Thumb Down** (pause)
- **👍 Thumb Up** (play)
- **✌️ Victory** (go back to Layer 1)
- **🤟 I Love You** (toggle items)

Each gesture can be configured independently with debounce times from 100ms to 2000ms. This allows you to fine-tune responsiveness vs. accidental trigger prevention for your specific use case.

**Note**: Changes made in the config panel are not persisted between sessions. Once you find your preferred settings, edit the default values in `src/context/AppContext.tsx` to make them permanent.

### Gesture Sensitivity (Code)

Edit `src/hooks/useGestureRecognition.ts`:

```typescript
minHandDetectionConfidence: 0.5,  // Lower = more sensitive
minHandPresenceConfidence: 0.5,
minTrackingConfidence: 0.5,
```

### Audio Patterns

Edit `src/engine/AudioEngine.ts` to customize instrument patterns, sounds, and effects.

## 🐛 Known Issues & Limitations

- **MVP Status**: This is a minimum viable product with room for improvement
- **Gesture Stability**: Requires steady hand movements for reliable detection
- **Browser Support**: Best performance in Chrome (WebGL + MediaPipe). Safari and Firefox are also supported
- **Lighting Sensitivity**: Poor lighting can affect gesture recognition

## 🚀 Future Enhancements

- **Panel Carousel**: Allow for more panels by making second row scrollable with gestures
- **Pattern Recording**: Save and replay gesture settings
- **More Instruments**: Expand the instrument library
- **Sequencer**: Let musicians create custom sequences
- **Multi-Hand Support**: Use both hands for more complex control
- **Pose and Face Support**: Unlock further expression with multimodal input
- **VCV Rack Integration**: Load and control plugins via gesture
- **Effects Support**: Toggle and tweak effects like Filter and Chorus via gesture
- **Preset System**: Save and load configurations
- **Mobile Support**: Mobile-friendly layout + touch-based fallback for mobile devices
- **MIDI Output**: Export patterns to DAWs


## 🙏 Acknowledgments

- [Google MediaPipe](https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer) for gesture recognition
- [Tone.js](https://tonejs.github.io/) for web audio synthesis
- [React](https://react.dev/) + [Vite](https://vitejs.dev/) for the development experience
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for component primitives


## 📞 Support

If you encounter issues:

1. Check that your browser supports WebGL and MediaStream API
2. Ensure webcam permissions are granted
3. Try a different browser (Chrome recommended)
4. Check the browser console for error messages

---

**Built with ❤️ for the intersection of music and AI**
