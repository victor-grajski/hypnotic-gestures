# 🎵 Hypnotic Gestures

A gesture-controlled techno music sequencer built with React, TypeScript, MediaPipe, and Tone.js. Control your beat with nothing but your hands!

![Hypnotic Gestures](https://img.shields.io/badge/status-MVP-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Overview

Hypnotic Gestures is an experimental music application that lets you control a techno beat sequencer using hand gestures detected through your webcam. It combines real-time computer vision (MediaPipe) with audio synthesis (Tone.js) to create an intuitive, hands-free music production experience.

### Key Features

- **Real-time Gesture Recognition**: Detects 7 different hand gestures using Google MediaPipe
- **4-Track Sequencer**: Control Kick, Hi-Hat, Bass, and Lead instruments
- **Audio Effects**: Reverb, Delay, and Filter effects with adjustable parameters
- **Position-Based Controls**: Different actions based on hand position in the frame
- **Visual Feedback**: Live video feed with hand landmark tracking
- **Dark Techno Theme**: Sleek, modern UI optimized for the techno aesthetic

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A modern browser with webcam support (Chrome/Edge recommended)
- Webcam permissions for the browser

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd hypnotic-gestures

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` in your browser and grant webcam permissions when prompted.

## 🖐️ Gesture Controls

Hypnotic Gestures recognizes 7 different hand gestures. See [GESTURES.md](./GESTURES.md) for detailed documentation.

### Quick Reference

| Gesture | Action | Position-Based |
|---------|--------|----------------|
| ✊ Closed Fist | Enter Panel (Layer 1) | - |
| 🖐️ Open Palm | Adjust Values (Layer 2) | Left = Decrease, Right = Increase |
| ☝️ Pointing Up | Navigate | Left = Previous, Right = Next |
| 👍 Thumbs Up | Play | - |
| 👎 Thumbs Down | Pause | - |
| ✌️ Victory | Return to Layer 1 | - |
| 🤟 ILoveYou | Toggle Item On/Off (Layer 2) | - |

Press **G** to toggle the gesture guide overlay.

## 🎹 Interface Layout

The interface is divided into a 2×2 grid:

```
┌──────────────────┬──────────────────┐
│  Webcam View     │  Control Panel   │
│  + Landmarks     │  + Play/Pause    │
│  + Gesture Info  │  + Volume/Tempo  │
│                  │  + Lock/Record   │
├──────────────────┼──────────────────┤
│  Instruments     │  Effects         │
│  + Kick Drum     │  + Reverb        │
│  + Hi-Hat        │  + Delay         │
│  + Bass Synth    │  + Filter        │
│  + Lead Synth    │                  │
└──────────────────┴──────────────────┘
```

### Control Panel (Top Right)
- **Play/Pause**: Start or stop the sequencer
- **Master Volume**: Control overall output level
- **Tempo**: Adjust BPM (80-180)
- **Lock**: Prevent accidental gesture triggers
- **Record**: Visual indicator (MVP - not functional yet)
- **Status Info**: Track what's active

### Instruments Panel (Bottom Left)
- **4 Instruments**: Kick, Hi-Hat, Bass, Lead
- Each instrument has:
  - On/Off toggle
  - Volume control
  - Selection indicator

### Effects Panel (Bottom Right)
- **3 Effects**: Reverb, Delay, Filter
- Each effect has:
  - On/Off toggle
  - Parameter controls (wet/dry, time, feedback, etc.)
  - Selection indicator

## 🎮 How to Use

1. **Grant Webcam Permissions**: Allow the browser to access your camera
2. **Wait for Model Loading**: The gesture recognition model will load (a few seconds)
3. **Position Your Hand**: Keep your hand visible in the webcam frame
4. **Start Making Music**:
   - Use **thumbs up** to start playback
   - Use **pointing up left/right** to navigate between panels (Control, Instruments, Effects)
   - Make a **closed fist** to enter the selected panel
   - Use **pointing up left/right** again to navigate between items in the panel
   - Use **ILoveYou gesture** 🤟 to toggle the selected item on/off
   - Use **open palm left/right** to adjust volume or effect parameters
   - Use **victory** ✌️ gesture to return to Layer 1 (panel selection)

### Tips for Best Results

- Keep your hand at a comfortable distance from the camera
- Ensure good lighting for better gesture detection
- Hold gestures steady for ~0.5 seconds for reliable recognition
- Use the guide overlay (press G) to see position zones
- Lock the interface when you want to prevent accidental triggers

## 🏗️ Technical Architecture

### Tech Stack

- **Frontend Framework**: React 18 + TypeScript + Vite
- **Gesture Recognition**: Google MediaPipe Gesture Recognizer
- **Audio Engine**: Tone.js
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: React Context + useReducer

### Project Structure

```
src/
├── components/          # React UI components
│   ├── WebcamViewer.tsx
│   ├── ControlPanel.tsx
│   ├── InstrumentPanel.tsx
│   └── EffectsPanel.tsx
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

### Gesture Sensitivity

Edit `src/hooks/useGestureRecognition.ts`:

```typescript
minHandDetectionConfidence: 0.5,  // Lower = more sensitive
minHandPresenceConfidence: 0.5,
minTrackingConfidence: 0.5,
```

### Debounce Timing

Edit `src/engine/GestureHandler.ts`:

```typescript
constructor(debounceMs: number = 500) { // Adjust timing
```

### Audio Patterns

Edit `src/engine/AudioEngine.ts` to customize instrument patterns, sounds, and effects.

## 🐛 Known Issues & Limitations

- **MVP Status**: This is a minimum viable product with room for improvement
- **Gesture Stability**: Requires steady hand movements for reliable detection
- **Browser Support**: Best performance in Chrome/Edge (WebGL + MediaPipe)
- **Lighting Sensitivity**: Poor lighting can affect gesture recognition
- **Recording Feature**: Visual indicator only - actual recording not implemented

## 🚀 Future Enhancements

- **Pattern Recording**: Save and replay gesture sequences
- **More Instruments**: Expand the instrument library
- **Custom Patterns**: Let users create custom rhythm patterns
- **MIDI Output**: Export patterns to DAWs
- **Multi-Hand Support**: Use both hands for more complex control
- **Preset System**: Save and load configurations
- **Mobile Support**: Touch-based fallback for mobile devices
- **Performance Mode**: Fullscreen mode for live performances

## 🤝 Contributing

This is an experimental project. Feel free to fork, experiment, and submit pull requests!

### Development

```bash
# Install dependencies
npm install

# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## 📜 License

MIT License - feel free to use this project for learning, experimentation, or building something amazing!

## 🙏 Acknowledgments

- [Google MediaPipe](https://mediapipe.dev/) for gesture recognition
- [Tone.js](https://tonejs.github.io/) for web audio synthesis
- [React](https://react.dev/) + [Vite](https://vitejs.dev/) for the development experience
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

If you encounter issues:

1. Check that your browser supports WebGL and MediaStream API
2. Ensure webcam permissions are granted
3. Try a different browser (Chrome/Edge recommended)
4. Check the browser console for error messages

---

**Built with ❤️ for the intersection of music, code, and gesture control**
