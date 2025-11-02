# Process Documentation: Hypnotic Gestures Prototype

## Problem

- Long-held interest in creating hypnotic techno complicated by feeling somatically disconnected from it unlike playing guitar → Hypnotic techno production can often be disconnected from synchronous, embodied processes yet it is best experienced in a synchronous, embodied way
- How might we empower producers of hypnotic techno and related forms of music to create their music live?
- How might we unlock a new category of producers who want to create hypnotic techno and related forms of music who would otherwise not be able to?
- As much as skilled DJs know how to adapt their set to their audience, what if not just the music selection but the very music itself were co-created with the audience?
- How might solving for this use case point the way to solving general gesture-based interface challenges?

## Rationale

- Explore what's possible with the affordances and interactions like in some of my best Peacock projects
- Identify opportunity areas through a boundary exploration of what's possible in production today with CV-based, gesture-driven (i.e. AI) applications as opposed to what's in the lab
- Solving for a gesture-based music creation use case would point to generalized interaction principles (ex: selecting elements, focus management)
- Hypnotic techno's sonic palette is limited enough to support a prototypical use case
- Explore the feasibility of gestures as interaction primitives

## Hypothesis

Play and music and performance are an effective means to explore generalizable interactions, affordances, behaviors, and opportunities

## Prototype

- A simple web app that uses Google's [Gesture recognition for web](https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer/web_js) to recognize canned gestures to create a simple hypnotic techno track
- Requires webcam, Google's gesture recognition, some simple way to generate music
- Use the limited sonic palette of hypnotic techno (tempo, bass drum, hi-hat)
- Gesture-to-sound approach: canned gestures manage focus, selection, toggling, sliders
- Audio generation approach: Tone.js. Simple tool suggested by Claude
- Project structure preference: React, TS, Tailwind, shadcn/ui
- Visual feedback: Show video feed + hand landmarks + current gesture + active sounds
- Modal interaction with guides that shows you how to use it as you use it
- Feedback: borders around selected item
- Feedforward: webcam guides shown by default but can easily be turned off

## Toolchain

- Initially searched for lists of public webcams. Didn't feel that spark. Most cameras were traffic or weather-focused
- Then decided to look into what I can pull off the shelf wrt gesture recognition. Found Google's solution. Canned gestures perfect for a simple quick prototype. Supports custom gestures for future iterations so a good architectural choice if we ever wanted to take it further
- Seeing the gesture recognition API reminded me of the [Imogen Heap Tiny Desk concert](https://www.youtube.com/watch?v=3QtklTXbKUQ&pp=ygUVaW1vZ2VuIGhlYXAgdGlueSBkZXNr) YouTube serendipitously recommended to me a few days prior where she created an app that can live loop with gestures coming from custom gloves. Why not be able to use bare hands?
- Also reminded of the [Theremin](https://www.youtube.com/watch?v=-QgTF8p-284)
- Then I connected it to my own personal user problem (as seen above) and imagining I can't be the only one who's faced this consciously or unconsciously. There's generalization potential
- Also inspired by algorave and want to make that more embodied
- Started writing all this up in Notion then dropped into Cursor Plan Mode
- Design in code. So cheap and easy and fast to iterate straight in the code now. Perhaps this speaks to some skill making the thing in my head real whereas I wouldn't know how to do this for a painting idea, for example
- Claude also suggested frame position mapping. Big interaction unlock
- Cursor cloud agents ftw

## Measuring Success as Delight and Delight as Success

- [x] Am I having fun?
- [x] Does this make me smile?
- [x] Does this give me energy/life?
- [x] Does this make me dance?
- [x] Do I want to show this to others and get their feedback?

## Plan v1 from Cursor

### Architecture Overview

**Tech Stack:**

- React + TypeScript + Vite
- Tailwind CSS for styling
- shadcn/ui for pre-built components (Button, Slider, Card, Badge, Switch)
- Google MediaPipe Gesture Recognizer (Web JS)
- Tone.js for audio synthesis and playback
- Webcam access via browser MediaStream API

**Core Systems:**

1. Gesture recognition engine (MediaPipe wrapper)
2. Audio engine (Tone.js instruments + effects)
3. State management (React context for app state)
4. Interaction layer (gesture → action mapping)
5. UI feedback system (visual indicators for mode/selection)

### Implementation Steps

#### 1. Project Setup

- Initialize Vite + React + TypeScript project
- Install dependencies: `@mediapipe/tasks-vision`, `tone`, `tailwindcss`
- Configure Tailwind with 2x2 grid layout utilities
- Set up basic project structure:
  - `/src/components` - UI components
  - `/src/hooks` - Custom React hooks
  - `/src/engine` - Audio and gesture engines
  - `/src/types` - TypeScript definitions
  - `/src/utils` - Helper functions

#### 2. MediaPipe Gesture Recognition Integration

- Create `GestureRecognizer` hook (`useGestureRecognition.ts`)
- Initialize MediaPipe with model from npm package
- Access webcam via `navigator.mediaDevices.getUserMedia()`
- Run continuous gesture detection on video frames
- Return: video element ref, detected gestures, hand landmarks, frame position
- Create position detection utilities:
  - `getFrameThird()`: left/center/right detection based on hand x-position
  - `getFrameQuadrant()`: up/down/left/right detection for Pointing_Up gesture
- Handle 7 gestures: Closed_Fist, Open_Palm, Pointing_Up, Thumb_Down, Thumb_Up, Victory, ILoveYou

#### 3. Audio Engine with Tone.js

- Create `AudioEngine` class (`src/engine/AudioEngine.ts`):
  - Initialize Tone.js Transport
  - Create instruments: Kick drum (MembraneSynth), Hi-hat (MetalSynth), Bass (MonoSynth), Lead synth
  - Create effects: Filter (AutoFilter), Reverb, Delay
  - Implement methods:
    - `toggleInstrument(id, isOn)`
    - `adjustTempo(bpm)`
    - `adjustVolume(instrumentId, value)`
    - `applyEffect(effectId, params)`
    - `play()` / `pause()` / `reset()`
    - `randomize()` for ILoveYou wildcard gesture
  - Set up Transport loop for hypnotic techno patterns

#### 4. State Management

- Create app context (`AppContext.tsx`):
  - `playbackState`: 'playing' | 'paused'
  - `selectedMode`: 'navigate' | 'slider' | null
  - `selectedItem`: { type: 'instrument' | 'effect', id: string } | null
  - `instruments`: array of instrument states (on/off, volume, etc.)
  - `effects`: array of effect states (on/off, params)
  - `isLocked`: prevents accidental gesture triggers
  - `isRecording`: visual indicator for record mode
  - Actions: updatePlayback, setMode, selectItem, toggleInstrument, etc.

#### 5. Gesture-to-Action Mapping

- Create `GestureHandler` (`src/engine/GestureHandler.ts`):
  - **Closed_Fist + position**:
    - Left third → pause playback
    - Right third → play playback
    - Center → neutral (no action)
  - **Open_Palm + position** (requires selected slider-controllable item):
    - Left third → decrease value gradually
    - Right third → increase value gradually
    - Works on: tempo, volume, filter frequency
  - **Pointing_Up + quadrant**: navigate selection
    - Up → select previous row
    - Down → select next row
    - Left → select previous column
    - Right → select next column
  - **Thumb_Down**: toggle selected track/effect off
  - **Thumb_Up**: toggle selected track/effect on
  - **Victory**: reset all to defaults
  - **ILoveYou**: wildcard - randomize parameters
  - Implement debouncing to prevent rapid-fire actions

#### 6. UI Components (2x2 Grid)

**Top Left - Webcam Viewer** (`WebcamViewer.tsx`):

- Display live video feed
- Overlay hand landmarks (dots + connections)
- Show current gesture name prominently
- Modal gesture guide (appears when mode is active)
- Visual frame thirds/quadrants indicators

**Top Right - Controls** (`ControlPanel.tsx`):

- Play/Pause button (visual state reflects playback)
- Lock/Unlock toggle (prevents accidental gestures)
- Record indicator (visual only for MVP)
- Master volume slider (controllable via Open_Palm gesture)

**Bottom Left - Instruments** (`InstrumentPanel.tsx`):

- Rows of instrument cards:
  - Kick drum (on/off, volume slider)
  - Hi-hat (on/off, volume slider, pattern variation)
  - Bass synth (on/off, volume slider, filter cutoff)
  - Lead synth (on/off, volume slider, octave)
- Visual highlight for selected instrument
- On/off state clearly indicated (color change)

**Bottom Right - Effects** (`EffectsPanel.tsx`):

- Effect cards:
  - Reverb (on/off, wet/dry mix)
  - Delay (on/off, time, feedback)
  - Filter (on/off, frequency, resonance)
- Visual highlight for selected effect
- Parameter sliders (controllable via Open_Palm)

#### 7. Visual Feedback System

- **Selected Mode Indicator**:
  - Prominent banner or border color when in navigate/slider mode
  - Show which gesture is active in webcam overlay
- **Selected Item Indicator**:
  - Highlight border around selected instrument/effect card
  - Show available actions for current selection in modal guide
- **Gesture Modal Guide**:
  - Semi-transparent overlay on webcam viewer
  - Shows available gestures for current context
  - Example: "👆 Navigate | 👍 Turn On | 👎 Turn Off | ✌️ Reset"
  - Updates based on selected mode and item

#### 8. Polish & UX

- Smooth transitions for all UI state changes
- Haptic/visual feedback when gesture is recognized
- Debouncing/cooldown for gesture actions (prevent accidental rapid triggers)
- Loading state while MediaPipe model loads
- Error handling for webcam access denied
- Responsive 2x2 grid layout (min-width constraints for usability)
- Dark theme (appropriate for techno aesthetic). Pull color, spacing, and typography into a Tailwind theme file

### Key Files to Create

1. `src/App.tsx` - Main app with 2x2 grid layout
2. `src/hooks/useGestureRecognition.ts` - MediaPipe integration
3. `src/engine/AudioEngine.ts` - Tone.js audio synthesis
4. `src/engine/GestureHandler.ts` - Gesture-to-action mapping
5. `src/context/AppContext.tsx` - Global state management
6. `src/components/WebcamViewer.tsx` - Top left quadrant
7. `src/components/ControlPanel.tsx` - Top right quadrant
8. `src/components/InstrumentPanel.tsx` - Bottom left quadrant
9. `src/components/EffectsPanel.tsx` - Bottom right quadrant
10. `src/components/GestureGuide.tsx` - Modal overlay helper
11. `src/utils/gestureUtils.ts` - Position detection helpers
12. `src/types/index.ts` - TypeScript definitions

### Documentation to Include

- `README.md`:
  - Project overview and rationale
  - Quick start instructions
  - Gesture reference guide (with diagrams)
  - Technical architecture explanation
  - Future iteration ideas
- `GESTURES.md`:
  - Detailed gesture-to-action mapping
  - Position-based interaction zones
  - Context-dependent behaviors

## Insights

- I and most people have two hands! No need for y-axis frame-dependent interactions. can use just x-axis. most people naturally move to the center of the video
- Really impressed at how responsive the gesture recognizer is out of the box
- Hand position in frame dependent interaction
  - Change mode
  - Move slider up or down depending on quadrant of the screen
- Two-layer navigation
  - pointing_up to move across panels, closed_fist to select one and move into layer 2, victory to go back to layer one. once within a panel, pointing_up should cycle through the items, closed_fist should toggle on and off, open_palm adjusts values. across the board thumb_up should now play and thumb_down should now pause to free up closed_fist
  - v1 created conflict between entering a panel and toggling track https://hypnotic-gestures-kf2x0ebto-victorgrajskis-projects.vercel.app/
  - fixed in v2 by using iloveyou to toggle instead of closed_fist https://hypnotic-gestures-r6z2jnflo-victorgrajskis-projects.vercel.app/
- how to provide unintrusive feedforward? show available actions?
  - global: thumbs up/down → move to play/pause
  - layer 1: show available actions in lower left/right
  - layer 2: show available actions in lower left/right
  - v3: closer but not quite there. answer isn't coming. move onto smaller tasks and come back to it https://hypnotic-gestures-nwnjo5xg1-victorgrajskis-projects.vercel.app
- vercel deploys are serving as an excellent way to document progress
- gesture rationale
  - pointing_up to navigate: kind of like i'm pointing at something
  - closed_fist to select: kind of like i'm grabbing hold of the panel
  - open_palm to increase/decrease: kind of like i'm grabbing the slider
  - peace to exit panel: byeeee
  - thumbs up/down: play/pause duality
  - iloveyou: only one left but consistently toggles across modes
- the music piece is admittedly a bit contrived for now as this mainly became a way to explore navigating a UI with gestures. starting to get really complicated with a third layer of effects. perhaps this is a little too production-heavy and not performance-heavy enough. becoming less expressive and more like work
- consistent clockwise navigation
- v4
  - effects → ADSR. since this is becoming more DAW-like, i thought i would bring in the fundamentals of synthesis over effects. future version could have a carousel of control panels which would include effects
  - type, color, layout refinements
  - https://hypnotic-gestures-pc239s1w8-victorgrajskis-projects.vercel.app/
- [v5](http://hypnotic-gestures-nym6rcr6s-victorgrajskis-projects.vercel.app)
  - 1+3 grid by default while preserving 2x2. rationale: 1+3 centers webcam viewer also right below the webcam. wasn't hard having to look over in the 2x2 but centered is much more intuitive. also 1+3 is centered with hands. it's centered wrt to the whole body
  - gesture logic
    - 1+3: row-based. not unlike browsing a streaming app with a TV remote
    - 2x2: clockwise. betting on clock metaphor being intuitive
- [v6](https://hypnotic-gestures-am39ab2dq-victorgrajskis-projects.vercel.app/)
  - made webcam guides more prominent and explicit based on user feedback

## Time Spent

- **Wednesday**: picking prompt, diverging, narrowing, planning, firing off background agent (2 hrs)
- **Thursday**: chiseling basic functionality and layout (2.5 hrs)
- **Friday**: chiseling interaction/navigation mechanics (3 hrs)
- **Saturday**: finer-grain chiseling. swapped effects for ADSR. testing and documentation (6 hrs)

**Total**: ~13.5 hours

## Future Iterations

- Custom gestures
- Face detection
- Pose detection
- Allow custom sonic palette integrations (ex: VCV Rack)
- Morph into more of a performance tool (vision: conduct DJ set entirely with this tool)
- Music visualization
- Queue/trigger effects, samples
- Work towards something SFMOMA would show
- Two hands simultaneously? + Face? + Pose?
- Selection-dependent gestures (ex: when kick selected, navigate moves within kick. back gesture to go up)
- One gesture recognizer per hand. but then how to navigate interface when gestures conflict?
- Selection tracking UI
- Saving/loading

## Opportunity Areas Identified

- **Make a simple Theremin-like, gesture-based instrument**: This prototype got steadily less expressive. Got sucked into the trap of using all the gestures and the general DAW paradigm. Yet it does demonstrate that navigating a UI with gestures actually isn't super clunky. Fun to play with ADSR too. Sure a future version could entail a fully gesture-controlled DAW but that would be straying too far from the original intention plus a mouse is the appropriate input method for something as complex as a DAW

- **Make TV UIs navigable with gestures**: Gesture-based navigation does seem to work and didn't take long to learn. Would solve the problem of the misplaced remote!

