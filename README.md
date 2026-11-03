# 30FIT — Your 30-Day Bodyweight Challenge
> **Build Strength. Build Discipline.**

A premium, local-first, offline-first Progressive Web App (PWA) designed for MacBook, Android phones, and modern browsers. 100% private, zero backend dependencies, zero tracking, zero accounts, and zero cloud lock-in.

---

## ⚡ Core Philosophy & Architecture

- **100% Offline-First**: Once installed or opened, all exercise demonstrations, instructions, timers, sound effects, and workout records function completely without internet or cellular connectivity.
- **Local-First Storage**: Powered by IndexedDB via Dexie.js. Your workout records, benchmark assessments, and personal preferences remain on your device.
- **Zero Third-Party Tracking**: No accounts, no sign-ups, no Google Analytics, no external API requests, no CDN dependencies, and no remote fonts.
- **Native System Typography**: Uses the native OS font stack for instant zero-latency rendering.
- **Synthesized Audio**: Web Audio API generates audio tones directly on hardware without downloading external sound files.

---

## 🚀 Features

### 1. 30-Day Structured Bodyweight Programme
- **Phase 1: Foundation & Endurance (Days 1–10)**: Build core stability, joint integrity, and movement consistency with full-body circuits and active recovery.
- **Phase 2: Strength Development (Days 11–20)**: Diamond push-ups, decline push-ups, lunges, hollow body holds, and conditioning intervals.
- **Phase 3: Advanced Bodyweight Strength (Days 21–30)**: Archer push-ups, Bulgarian split squats, self-resisted towel rows, leg raises, and the Day 30 Final Assessment.
- **No-Equipment Alternatives**: Built-in safe bodyweight alternatives for decline push-ups (slow tempo push-ups), Bulgarian split squats (floor split squats), and towel rows (prone W raises).

### 2. Articulated 2D Vector Exercise Demonstrations
- **38 Bespoke Animated Human Movements**: Dedicated inline SVG and CSS keyframe animations showing actual biomechanical joint articulation (head, torso, shoulders, arms, hips, thighs, knees, and ankles).
- **Interactive Controls**: Play, Pause, Replay, Speed Multiplier (0.5×, 1×, 1.5×), and Fullscreen demonstration mode.
- **Comprehensive Form Cues**: Starting posture, movement execution, breathing cadence, common mistakes, and target muscles.

### 3. Active Workout Engine & Timers
- **Workout Stopwatch**: Tracks total duration, active time, rest time, and sets remaining.
- **Smart Rest Timer**: Presets (30s, 45s, 60s, 90s, 120s, custom) with countdown ring, 3-2-1 sound beeps, and haptic feedback.
- **Timed Hold Mode**: Countdown ring for planks, hollow body holds, high knees, and superman holds with auto-completion.
- **Screen Wake Lock**: Prevents phone or laptop displays from sleeping during active sessions.
- **Session Safety**: Pause, resume, undo completed sets, and partial session save on exit.

### 4. Milestone Assessments
- Benchmark tests on **Day 1 (Baseline)**, **Day 10 (Phase 1)**, **Day 20 (Phase 2)**, and **Day 30 (Final)**.
- Compares Push-ups, Squats in 1 min, Plank hold duration, Leg raises, and Jumping Jacks with numerical gains and percentage improvements.

### 5. Progress Analytics & Native SVG Charts
- Native SVG bar and line charts for daily consistency, repetition volume, and workout duration.
- 30-Day interactive consistency matrix.
- Editable workout history to correct mistakenly entered reps or times.

### 6. Backup & Restore
- **Export JSON Backup**: Full snapshot of your workout records, assessments, and preferences with timestamped filename.
- **Import JSON Backup**: Validates and restores complete history across devices.
- **Export CSV**: Spreadsheet-ready file of all training sessions.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4
- **Database**: IndexedDB via Dexie.js
- **PWA / Service Worker**: vite-plugin-pwa + Workbox
- **Icons**: Lucide React (bundled locally)
- **Audio**: Web Audio API (offline synthesis)
- **Screen**: Screen Wake Lock API

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Production Build
```bash
npm run build
```
Creates the production-optimized static bundle in `dist/` with precached service worker (`sw.js`).

### 4. Preview Production Build
```bash
npm run preview
```

---

## 📱 PWA Installation Instructions

### Chrome on Android:
1. Open the hosted URL or `localhost` in Chrome.
2. Tap the three dots (**⋮**) in the top right.
3. Select **Install app** or **Add to Home screen**.
4. The 30FIT icon will appear on your home screen and open in standalone fullscreen mode without browser bars.

### macOS (Chrome / Safari):
- **Chrome**: Click the **Install 30FIT** icon in the address bar.
- **Safari**: Choose **File** → **Add to Dock**.
- 30FIT will open as a native Mac window in your Applications and Dock.

---

## 🔒 Privacy & Security

30FIT does not connect to any servers, cloud services, analytics providers, or remote font CDNs. All data remains strictly on your local device.
