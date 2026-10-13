# 🎵 VIBEX — Smart AI Music Learning Platform

<div align="center">

![VIBEX Banner](https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&h=400&q=80)

**An AI-powered music mentor teaching Keyboard, Guitar, Violin, and Bansuri through real-time audio pitch/timing analysis, computer vision posture feedback, interactive instrument visualizations, and Gemini AI pedagogical coaching.**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-3.7_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_Backend-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat-square)](LICENSE)

[Features](#-key-features) • [Instruments](#-supported-instruments) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Environment Variables](#-environment-variables) • [Project Structure](#-project-structure)

</div>

---

## 🌟 Overview

**VIBEX** bridges the gap between self-taught music practice and private conservatory tutoring. Traditional apps only check whether a key was pressed; VIBEX listens to your acoustics, checks your body mechanics via camera vision, and provides real-time, encouraging guidance powered by Google Gemini AI.

Whether you're tuning your first acoustic guitar string, finding intonation on a fretless violin fingerboard, coordinating two-hand keyboard scales, or mastering Indian classical Bansuri swaras (*Sa, Re, Ga, Ma, Pa, Dha, Ni*), VIBEX provides instant, actionable feedback.

---

## 🚀 Key Features

### 🎧 1. Real-Time Audio Pitch & Rhythm Engine
- **In-Browser Pitch Detection**: Low-latency pitch tracking using Web Audio API autocorrelation and frequency estimation algorithms.
- **Tuner & Cents Precision**: Detects microtonal cents sharp/flat deviations in real time.
- **Rhythmic Timing & Metronome**: Built-in metronome with beat precision scoring and rhythmic onset evaluation.

### 👁️ 2. Computer Vision Posture & Technique Tracking
- **Camera-Based Posture Evaluation**: Analyzes hand placement, wrist curvature, and body posture directly in the browser via WebRTC.
- **Instrument-Specific Mechanics**:
  - **Guitar**: Thumb placement behind neck and fretting finger arch.
  - **Violin**: Bow-to-string angle and left wrist collapse warnings.
  - **Keyboard**: Flat finger alerts and forearm alignment.
  - **Bansuri**: Embouchure blowing angle and finger pad hole coverage checks.

### 🤖 3. Google Gemini AI Maestro
- **AI Performance Diagnosis**: Analyzes telemetry (pitch accuracy %, timing precision %, vision cues) to deliver human-like, encouraging musical feedback.
- **Interactive AI Teacher Chat**: Ask questions regarding music theory, fingerings, scales, or performance anxiety with tailored context.
- **Dynamic Micro-Exercise Generator**: Automatically builds tailored 4-bar drills targeting your exact bottleneck.

### 🎼 4. Interactive Instrument Visualizers & Animated Demos
- **Virtual Keyboard**: 88-key mapped piano visualization with finger numbering guides (1-5).
- **Interactive Guitar Fretboard**: Real-time fret markers, root notes, and scale patterns.
- **Violin Fingerboard**: Fretless tape markers with microtonal intonation guides.
- **Interactive Bansuri**: Realistic 6-hole Indian bamboo flute finger pad coverage simulator.
- **Animated Technique Demonstrations**: Visual finger-by-finger motion guides for proper articulation.

### 📚 5. Structured Curriculum & Song Arena
- **Multi-Level Curriculum**: Step-by-step progressive lessons from absolute beginner fundamentals to advanced repertoire.
- **Song Library & Practice**: Play along with guided notation, real-time score tracking, streak counters, and confetti celebrations.
- **User Progress & Analytics**: Daily practice goals, mastery ratings, and persistent streak tracking.

### 🎨 6. Elegant Multi-Theme Design
- Choose from 4 themes:
  - **Obsidian**: Sleek modern dark mode with neon accents.
  - **Zen**: Minimalist earth tones designed for focused practice.
  - **Arcade**: Retro synthwave aesthetic with vibrant game-like elements.
  - **Nordic**: Clean, calm Scandinavian palette.

---

## 🎸 Supported Instruments

| Instrument | Visualizer | Core Feedback Mechanics |
| :--- | :--- | :--- |
| **🎹 Keyboard (Piano)** | Interactive Piano | Two-hand coordination, 1-5 finger numbering, keystroke audio |
| **🎸 Guitar** | Dynamic Fretboard | Fret & string accuracy, finger arch, wrist position |
| **🎻 Violin** | Fretless Fingerboard | Microtonal pitch intonation, bow angle, wrist alignment |
| **🪈 Bansuri** | 6-Hole Flute Simulator | Hole coverage seal, breath embouchure, Indian Swara (*Sa Re Ga Ma*) |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons & Animations**: [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Audio Processing**: Web Audio API (AudioContext, AnalyserNode, Autocorrelation algorithm)
- **Vision Processing**: HTML5 WebRTC Canvas video frame analysis

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)
- **Dev Runner**: [TSX](https://github.com/privatenumber/tsx) & [esbuild](https://esbuild.github.io/)
- **AI Model**: [Google Gen AI SDK (`@google/genai`)](https://www.npmjs.com/package/@google/genai) with `gemini-3.7-flash`

---

## 📦 Project Structure

```text
VIBEX/
├── assets/                     # Static media and assets
├── src/
│   ├── components/             # React UI components
│   │   ├── AIAvatarCoach.tsx             # Interactive avatar feedback
│   │   ├── AITeacherChat.tsx             # Gemini-powered Q&A chat
│   │   ├── AnimatedDemo.tsx              # Animated technique simulations
│   │   ├── AnimatedTechniqueDemonstration.tsx
│   │   ├── HandFingerNumberingFigure.tsx # Anatomical finger numbering
│   │   ├── InteractiveBansuri.tsx        # Flute hole coverage visualizer
│   │   ├── InteractiveFretboard.tsx      # Guitar fretboard visualizer
│   │   ├── InteractiveKeyboard.tsx       # Piano keyboard visualizer
│   │   ├── InteractiveViolinFingerboard.tsx # Violin intonation visualizer
│   │   ├── LearnCurriculumView.tsx       # Step-by-step curriculum UI
│   │   ├── OnboardingFlow.tsx            # Initial goal & level setup
│   │   ├── PracticeExerciseView.tsx      # Active drill & pitch practice
│   │   ├── RealtimeAudioVisionMonitor.tsx # Audio & camera feedback HUD
│   │   ├── SmartCorrectionModal.tsx      # AI post-drill diagnostic modal
│   │   ├── SongLibraryView.tsx           # Song catalog
│   │   ├── SongPracticeView.tsx          # Real-time song play-along arena
│   │   ├── ThemeSelectorModal.tsx        # UI theme picker
│   │   └── UserProfileStats.tsx          # Practice stats & streaks
│   ├── data/
│   │   ├── curriculum.ts                 # Full lesson plans & exercise drills
│   │   └── songs.ts                      # Song library notes & tablatures
│   ├── services/
│   │   ├── audioEngine.ts                # Pitch detection, tuner, metronome
│   │   └── visionEngine.ts               # Camera posture & hand tracking
│   ├── types/
│   │   └── index.ts                      # Shared TypeScript interfaces
│   ├── App.tsx                           # Main application component
│   ├── index.css                         # Tailwind CSS & global styles
│   └── main.tsx                          # React entrypoint
├── index.html                  # HTML entry template
├── metadata.json               # App metadata
├── package.json                # Dependencies and scripts
├── server.ts                   # Express server with Gemini API routes
├── tsconfig.json               # TypeScript compiler config
├── vite.config.ts              # Vite configuration
└── .env.example                # Example environment variables
```

---

## 🚦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey) (Optional for AI mentoring; audio/visual drills work standalone with built-in fallbacks)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/vibex.git
   cd vibex
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   PORT=5000
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5000`.

---

## ⚙️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express server with Vite middleware using `tsx` |
| `npm run build` | Builds the client via `vite build` and bundles `server.ts` with `esbuild` |
| `npm run start` | Runs the production bundle from `dist/server.cjs` |
| `npm run lint` | Runs TypeScript compiler checks without emitting files |
| `npm run preview` | Previews the Vite production build locally |
| `npm run clean` | Cleans the `dist` folder |

---

## 🔐 Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | Optional* | Google Gemini API key for AI mentor chat and dynamic exercises |
| `PORT` | Optional | Port for the Express server (defaults to `5000`) |
| `APP_URL` | Optional | Hosted application URL for cloud deployments |

*\*If no API key is provided, VIBEX gracefully falls back to built-in pedagogical heuristics so you can still practice.*

---

## 🛡️ Permissions Note

VIBEX runs completely client-side for audio and vision monitoring:
- **Microphone**: Needed for real-time pitch detection, tuner, and note duration analysis.
- **Camera**: Needed for posture and hand position monitoring.
- *No audio or camera streams are recorded or stored on any external server.*

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the Apache License 2.0. See [LICENSE](LICENSE) for more information.

<div align="center">
Made with ❤️ for musicians and learners everywhere.
</div>
