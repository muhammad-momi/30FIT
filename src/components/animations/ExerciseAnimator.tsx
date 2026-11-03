import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Eye } from 'lucide-react';
import type { Exercise } from '../../types';

interface ExerciseAnimatorProps {
  exercise: Exercise;
  speed?: number; // 0.5, 1, 1.5
  onSpeedChange?: (speed: number) => void;
  showControls?: boolean;
  className?: string;
  autoPlay?: boolean;
}

export const ExerciseAnimator: React.FC<ExerciseAnimatorProps> = ({
  exercise,
  speed = 1,
  onSpeedChange,
  showControls = true,
  className = '',
  autoPlay = true
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0); // For replay reset

  const handleSpeedToggle = (newSpeed: number) => {
    setCurrentSpeed(newSpeed);
    if (onSpeedChange) onSpeedChange(newSpeed);
  };

  const handleReplay = () => {
    setKey(prev => prev + 1);
    setIsPlaying(true);
  };

  const animationDuration = `${2 / currentSpeed}s`;
  const playState = isPlaying ? 'running' : 'paused';

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-2xl bg-[#12151b] border border-white/10 overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 bg-[#0d0f12]/95 backdrop-blur-xl flex flex-col justify-center' : className
      }`}
    >
      {/* Top Status & Muscle Indicators */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-medium text-white/80 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse" />
          <span>{exercise.category}</span>
          <span className="text-white/40">•</span>
          <span className="text-[#a3e635]">{exercise.primaryMuscles.join(', ')}</span>
        </div>

        <div className="flex items-center gap-1 pointer-events-auto">
          {onSpeedChange && (
            <div className="flex bg-black/60 border border-white/10 rounded-lg p-0.5 text-xs text-white/70">
              {[0.5, 1, 1.5].map(s => (
                <button
                  key={s}
                  onClick={() => handleSpeedToggle(s)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition ${
                    currentSpeed === s ? 'bg-[#a3e635] text-black' : 'hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-white/70 hover:text-white transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Demonstration'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        key={key}
        className="w-full flex items-center justify-center py-6 px-4 select-none relative"
        style={{ minHeight: isFullscreen ? '70vh' : '230px' }}
      >
        <svg
          viewBox="0 0 320 240"
          className="w-full h-auto max-h-[340px] drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
          style={
            {
              '--anim-dur': animationDuration,
              '--anim-play': playState
            } as React.CSSProperties
          }
        >
          {/* Background Grid Floor */}
          <defs>
            <linearGradient id="gridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#22c55e" stop-opacity="0.2" />
              <stop offset="100%" stop-color="#0d0f12" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="limeJoint" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#bef264" />
              <stop offset="100%" stop-color="#84cc16" />
            </linearGradient>
            <filter id="jointGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Perspective Floor */}
          <ellipse cx="160" cy="215" rx="120" ry="16" fill="url(#gridGrad)" opacity="0.4" />
          <line x1="40" y1="215" x2="280" y2="215" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Render the specific exercise animation */}
          {renderExerciseSvg(exercise.id)}
        </svg>
      </div>

      {/* Bottom Controls Bar */}
      {showControls && (
        <div className="w-full bg-[#0d0f12]/80 border-t border-white/5 px-4 py-2 flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition"
            >
              {isPlaying ? <Pause size={13} className="text-[#a3e635]" /> : <Play size={13} className="text-[#a3e635]" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={handleReplay}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition"
              title="Restart Animation"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-white/50">
              <Eye size={12} className="text-[#a3e635]" />
              Form View: {getViewAngle(exercise.id)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

function getViewAngle(exerciseId: string): string {
  if (['push-ups', 'decline-push-ups', 'plank', 'superman-hold', 'superman-raises', 'towel-rows'].includes(exerciseId)) {
    return 'Side Profile';
  }
  if (['squats', 'jumping-jacks', 'high-knees', 'calf-raises', 'arm-circles', 'hip-circles'].includes(exerciseId)) {
    return 'Front Dynamic';
  }
  if (['hollow-body-hold', 'bicycle-crunches', 'dead-bugs', 'glute-bridges', 'leg-raises'].includes(exerciseId)) {
    return 'Side Supine';
  }
  return 'Side Articulated';
}

// Master Exercise SVG Dispatcher
function renderExerciseSvg(exerciseId: string): React.ReactNode {
  switch (exerciseId) {
    // PUSH-UPS
    case 'push-ups':
      return <PushUpAnimation styleClass="standard-pushup" />;
    case 'wide-push-ups':
      return <PushUpAnimation styleClass="wide-pushup" />;
    case 'diamond-push-ups':
      return <PushUpAnimation styleClass="diamond-pushup" />;
    case 'decline-push-ups':
      return <DeclinePushUpAnimation />;
    case 'archer-push-ups':
      return <ArcherPushUpAnimation />;
    case 'pike-push-ups':
      return <PikePushUpAnimation />;

    // LOWER BODY
    case 'squats':
      return <SquatAnimation />;
    case 'reverse-lunges':
      return <LungeAnimation direction="reverse" />;
    case 'lunges':
      return <LungeAnimation direction="forward" />;
    case 'bulgarian-split-squats':
      return <BulgarianSplitSquatAnimation />;
    case 'floor-split-squats':
      return <FloorSplitSquatAnimation />;
    case 'glute-bridges':
      return <GluteBridgeAnimation />;
    case 'calf-raises':
      return <CalfRaiseAnimation />;

    // CORE & HOLDS
    case 'plank':
      return <PlankAnimation />;
    case 'side-plank':
      return <SidePlankAnimation />;
    case 'hollow-body-hold':
      return <HollowBodyAnimation />;
    case 'bicycle-crunches':
      return <BicycleCrunchAnimation />;
    case 'dead-bugs':
      return <DeadBugAnimation />;
    case 'bird-dogs':
      return <BirdDogAnimation />;
    case 'leg-raises':
      return <LegRaiseAnimation />;
    case 'superman-hold':
      return <SupermanAnimation isHold={true} />;
    case 'superman-raises':
      return <SupermanAnimation isHold={false} />;
    case 'reverse-snow-angels':
      return <ReverseSnowAngelAnimation />;
    case 'towel-rows':
      return <TowelRowAnimation />;
    case 'prone-w-raises':
      return <ProneWRaiseAnimation />;

    // CARDIO
    case 'jumping-jacks':
      return <JumpingJackAnimation />;
    case 'mountain-climbers':
      return <MountainClimberAnimation />;
    case 'high-knees':
      return <HighKneesAnimation />;

    // WARMUP & STRETCHES
    case 'arm-circles':
      return <ArmCirclesAnimation />;
    case 'shoulder-rotations':
      return <ShoulderRotationsAnimation />;
    case 'hip-circles':
      return <HipCirclesAnimation />;
    case 'marching-in-place':
      return <MarchingAnimation />;
    case 'leg-swings':
      return <LegSwingsAnimation />;
    case 'chest-stretch':
      return <ChestStretchAnimation />;
    case 'shoulder-stretch':
      return <ShoulderStretchAnimation />;
    case 'quadriceps-stretch':
      return <QuadStretchAnimation />;
    case 'hamstring-stretch':
      return <HamstringStretchAnimation />;
    case 'gentle-back-stretch':
      return <BackStretchAnimation />;

    default:
      return <PushUpAnimation styleClass="standard-pushup" />;
  }
}

// -------------------------------------------------------------
// INDIVIDUAL BESPOKE ARTICULATED SVG EXERCISE ANIMATIONS
// -------------------------------------------------------------

// 1. Push-Up Family
const PushUpAnimation: React.FC<{ styleClass: string }> = ({ styleClass }) => (
  <g className="origin-bottom">
    <style>{`
      @keyframes pushupCycle {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(34px) rotate(-3deg); }
      }
      @keyframes armFlex {
        0%, 100% { d: path("M 220 160 L 225 185 L 230 215"); }
        50% { d: path("M 220 194 L 200 185 L 230 215"); }
      }
      .anim-pushup-torso {
        animation: pushupCycle var(--anim-dur) cubic-bezier(0.4, 0, 0.2, 1) infinite;
        animation-play-state: var(--anim-play);
        transform-origin: 80px 215px;
      }
      .anim-pushup-arm {
        animation: armFlex var(--anim-dur) cubic-bezier(0.4, 0, 0.2, 1) infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>

    {/* Hand placement floor mark */}
    <circle cx="230" cy="215" r="5" fill="#a3e635" filter="url(#jointGlow)" />
    <circle cx="75" cy="215" r="4" fill="#64748b" />

    {/* Moving Body Group pivoted at toes (75, 215) */}
    <g className="anim-pushup-torso">
      {/* Alignment reference guideline */}
      <line x1="75" y1="215" x2="260" y2="150" stroke="#a3e635" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

      {/* Legs & Torso */}
      <path d="M 75 215 L 140 185 L 220 160" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      {/* Head */}
      <circle cx="250" cy="150" r="14" fill="#f1f5f9" />
      {/* Shoulder Joint */}
      <circle cx="220" cy="160" r="6" fill="#a3e635" filter="url(#jointGlow)" />
      {/* Hip Joint */}
      <circle cx="140" cy="185" r="5" fill="#a3e635" />
    </g>

    {/* Arm with bending elbow */}
    <path className="anim-pushup-arm" stroke="#a3e635" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {styleClass === 'diamond-pushup' && (
      <text x="215" y="235" fill="#a3e635" fontSize="10" fontWeight="bold">♦ Hands Close</text>
    )}
  </g>
);

// 2. Decline Push-Up (Feet elevated on sturdy block)
const DeclinePushUpAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes declinePushup {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(32px) rotate(-4deg); }
      }
      @keyframes declineArm {
        0%, 100% { d: path("M 225 180 L 228 198 L 235 215"); }
        50% { d: path("M 225 208 L 205 198 L 235 215"); }
      }
      .anim-decline-body {
        animation: declinePushup var(--anim-dur) cubic-bezier(0.4, 0, 0.2, 1) infinite;
        animation-play-state: var(--anim-play);
        transform-origin: 75px 180px;
      }
      .anim-decline-arm {
        animation: declineArm var(--anim-dur) cubic-bezier(0.4, 0, 0.2, 1) infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    {/* Stable elevation block */}
    <rect x="50" y="180" width="40" height="35" rx="4" fill="#242b35" stroke="#a3e635" strokeWidth="1.5" />
    <text x="70" y="202" fill="#a3e635" fontSize="9" textAnchor="middle" fontWeight="bold">BLOCK</text>

    {/* Elevated Body */}
    <g className="anim-decline-body">
      <path d="M 75 180 L 145 180 L 225 180" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="255" cy="180" r="13" fill="#f1f5f9" />
      <circle cx="225" cy="180" r="6" fill="#a3e635" filter="url(#jointGlow)" />
      <circle cx="145" cy="180" r="5" fill="#a3e635" />
    </g>
    <path className="anim-decline-arm" stroke="#a3e635" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);

// 3. Archer Push-Up (Wide stance, alternate deep side drops)
const ArcherPushUpAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes archerMotion {
        0%, 100% { transform: translate(0, 0); }
        25% { transform: translate(-30px, 25px); }
        50% { transform: translate(0, 0); }
        75% { transform: translate(30px, 25px); }
      }
      .anim-archer-body {
        animation: archerMotion calc(var(--anim-dur) * 1.5) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    {/* Wide hand markers */}
    <circle cx="100" cy="215" r="5" fill="#a3e635" />
    <circle cx="220" cy="215" r="5" fill="#a3e635" />
    <g className="anim-archer-body">
      <ellipse cx="160" cy="170" rx="20" ry="35" fill="#f1f5f9" />
      <circle cx="160" cy="120" r="14" fill="#f1f5f9" />
      {/* Arms connecting to wide floor points */}
      <line x1="145" y1="150" x2="100" y2="215" stroke="#a3e635" strokeWidth="8" strokeLinecap="round" />
      <line x1="175" y1="150" x2="220" y2="215" stroke="#a3e635" strokeWidth="8" strokeLinecap="round" />
    </g>
  </g>
);

// 4. Pike Push-Up (High inverted V hips)
const PikePushUpAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes pikeCycle {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(18px, 22px); }
      }
      .anim-pike {
        animation: pikeCycle var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
        transform-origin: 80px 215px;
      }
    `}</style>
    {/* Hands on ground */}
    <circle cx="205" cy="215" r="5" fill="#a3e635" />
    <circle cx="90" cy="215" r="4" fill="#64748b" />
    <g className="anim-pike">
      {/* Pike Body: feet at 90, hips peaked at 145, 115, hands at 205 */}
      <path d="M 90 215 L 145 115 L 205 215" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="145" cy="115" r="6" fill="#a3e635" filter="url(#jointGlow)" />
      <circle cx="185" cy="155" r="13" fill="#f1f5f9" />
    </g>
  </g>
);

// 5. Bodyweight Squat (Hips crease, knees to 90, upright torso)
const SquatAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes squatTorso {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(45px); }
      }
      @keyframes squatLegs {
        0%, 100% { d: path("M 160 120 L 160 165 L 160 215"); }
        50% { d: path("M 160 165 L 130 190 L 160 215"); }
      }
      .anim-squat-torso {
        animation: squatTorso var(--anim-dur) cubic-bezier(0.4, 0, 0.2, 1) infinite;
        animation-play-state: var(--anim-play);
      }
      .anim-squat-legs {
        animation: squatLegs var(--anim-dur) cubic-bezier(0.4, 0, 0.2, 1) infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <path className="anim-squat-legs" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <g className="anim-squat-torso">
      <path d="M 160 120 L 160 65" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
      <circle cx="160" cy="45" r="14" fill="#f1f5f9" />
      {/* Arms extended for counter-balance */}
      <line x1="160" y1="75" x2="205" y2="75" stroke="#a3e635" strokeWidth="7" strokeLinecap="round" />
      <circle cx="160" cy="120" r="5" fill="#a3e635" filter="url(#jointGlow)" />
    </g>
  </g>
);

// 6. Lunge Animation
const LungeAnimation: React.FC<{ direction: 'forward' | 'reverse' }> = ({ direction }) => (
  <g>
    <style>{`
      @keyframes lungeCycle {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(35px); }
      }
      .anim-lunge {
        animation: lungeCycle var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <g className="anim-lunge">
      {/* Front Leg */}
      <path d="M 160 135 L 205 175 L 205 215" stroke="#a3e635" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Back Leg */}
      <path d="M 160 135 L 115 175 L 115 215" stroke="#64748b" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Torso & Head */}
      <line x1="160" y1="135" x2="160" y2="70" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
      <circle cx="160" cy="50" r="14" fill="#f1f5f9" />
      <circle cx="160" cy="135" r="5" fill="#a3e635" />
    </g>
    {direction === 'reverse' && (
      <text x="110" y="235" fill="#94a3b8" fontSize="10">← Step Back</text>
    )}
  </g>
);

// 7. Bulgarian Split Squat
const BulgarianSplitSquatAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes bssCycle {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(35px); }
      }
      .anim-bss {
        animation: bssCycle var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    {/* Stable Rear Bench */}
    <rect x="70" y="175" width="35" height="40" rx="3" fill="#242b35" stroke="#a3e635" strokeWidth="1.5" />
    <g className="anim-bss">
      {/* Back foot on bench */}
      <path d="M 160 130 L 95 160 L 90 175" stroke="#64748b" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Front working leg */}
      <path d="M 160 130 L 195 170 L 195 215" stroke="#a3e635" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Torso */}
      <line x1="160" y1="130" x2="160" y2="65" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
      <circle cx="160" cy="45" r="14" fill="#f1f5f9" />
    </g>
  </g>
);

// 8. Floor Split Squat
const FloorSplitSquatAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes fssCycle {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(36px); }
      }
      .anim-fss {
        animation: fssCycle var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <g className="anim-fss">
      <path d="M 160 130 L 200 170 L 200 215" stroke="#a3e635" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 160 130 L 120 170 L 120 215" stroke="#64748b" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="160" y1="130" x2="160" y2="65" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
      <circle cx="160" cy="45" r="14" fill="#f1f5f9" />
    </g>
  </g>
);

// 9. Glute Bridge
const GluteBridgeAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes bridgeHips {
        0%, 100% { d: path("M 80 205 L 150 205 L 210 160 L 225 215"); }
        50% { d: path("M 80 205 L 160 165 L 215 165 L 225 215"); }
      }
      .anim-bridge {
        animation: bridgeHips var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    {/* Head on floor */}
    <circle cx="70" cy="200" r="12" fill="#f1f5f9" />
    <path className="anim-bridge" stroke="#a3e635" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <text x="160" y="145" fill="#a3e635" fontSize="10" fontWeight="bold" textAnchor="middle">Squeeze Glutes</text>
  </g>
);

// 10. Calf Raises
const CalfRaiseAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes calfRise {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-22px); }
      }
      .anim-calf {
        animation: calfRise var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <g className="anim-calf">
      <line x1="160" y1="215" x2="160" y2="135" stroke="#a3e635" strokeWidth="12" strokeLinecap="round" />
      <line x1="160" y1="135" x2="160" y2="70" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
      <circle cx="160" cy="50" r="14" fill="#f1f5f9" />
      <circle cx="160" cy="180" r="6" fill="#a3e635" filter="url(#jointGlow)" />
    </g>
    <text x="160" y="235" fill="#a3e635" fontSize="10" textAnchor="middle">Rise on Toes</text>
  </g>
);

// 11. Plank Hold (Forearm plank with breathing indicator & rigid alignment)
const PlankAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes plankBreathe {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-3px); }
      }
      .anim-plank {
        animation: plankBreathe calc(var(--anim-dur) * 1.5) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    {/* Forearm on floor */}
    <line x1="220" y1="215" x2="245" y2="215" stroke="#a3e635" strokeWidth="8" strokeLinecap="round" />
    <g className="anim-plank">
      {/* Perfect straight body alignment */}
      <line x1="75" y1="215" x2="255" y2="175" stroke="#a3e635" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <path d="M 75 215 L 150 195 L 225 180" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="225" y1="180" x2="225" y2="215" stroke="#a3e635" strokeWidth="8" strokeLinecap="round" />
      <circle cx="250" cy="170" r="13" fill="#f1f5f9" />
      <circle cx="150" cy="195" r="5" fill="#a3e635" filter="url(#jointGlow)" />
    </g>
    <text x="160" y="160" fill="#a3e635" fontSize="10" textAnchor="middle" fontWeight="bold">LOCKED CORE</text>
  </g>
);

// 12. Side Plank
const SidePlankAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes sidePlankHold {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      .anim-sideplank {
        animation: sidePlankHold calc(var(--anim-dur) * 1.5) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <g className="anim-sideplank">
      <path d="M 85 215 L 160 185 L 225 160" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="225" y1="160" x2="225" y2="215" stroke="#a3e635" strokeWidth="8" strokeLinecap="round" />
      <circle cx="245" cy="145" r="13" fill="#f1f5f9" />
      {/* Top arm reaching up */}
      <line x1="225" y1="160" x2="225" y2="105" stroke="#a3e635" strokeWidth="6" strokeLinecap="round" />
      <circle cx="160" cy="185" r="5" fill="#a3e635" filter="url(#jointGlow)" />
    </g>
  </g>
);

// 13. Hollow Body Hold
const HollowBodyAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes hollowFloat {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(-2deg); }
      }
      .anim-hollow {
        animation: hollowFloat calc(var(--anim-dur) * 1.5) ease-in-out infinite;
        animation-play-state: var(--anim-play);
        transform-origin: 160px 205px;
      }
    `}</style>
    {/* Banana shape with lower back firmly anchored */}
    <g className="anim-hollow">
      <path d="M 75 165 L 125 195 L 195 195 L 245 165" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Arms extended overhead */}
      <line x1="245" y1="165" x2="275" y2="150" stroke="#a3e635" strokeWidth="7" strokeLinecap="round" />
      <circle cx="235" cy="160" r="12" fill="#f1f5f9" />
      <circle cx="160" cy="195" r="5" fill="#a3e635" filter="url(#jointGlow)" />
    </g>
    <text x="160" y="225" fill="#a3e635" fontSize="10" textAnchor="middle" fontWeight="bold">Lower Back Pressed Flat</text>
  </g>
);

// 14. Jumping Jacks (Front view with sweeping limbs)
const JumpingJackAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes jjLimbs {
        0%, 100% {
          d: path("M 160 140 L 155 215 M 160 140 L 165 215 M 160 85 L 140 135 M 160 85 L 180 135");
        }
        50% {
          d: path("M 160 140 L 115 215 M 160 140 L 205 215 M 160 85 L 120 45 M 160 85 L 200 45");
        }
      }
      .anim-jj {
        animation: jjLimbs var(--anim-dur) cubic-bezier(0.4, 0, 0.2, 1) infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    {/* Torso & Head */}
    <line x1="160" y1="140" x2="160" y2="80" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <circle cx="160" cy="60" r="14" fill="#f1f5f9" />
    <path className="anim-jj" stroke="#a3e635" strokeWidth="9" strokeLinecap="round" fill="none" />
  </g>
);

// 15. Mountain Climbers (Alternating running knees in plank)
const MountainClimberAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes mcLegLeft {
        0%, 100% { d: path("M 150 185 L 195 190 L 200 215"); }
        50% { d: path("M 150 185 L 115 195 L 85 215"); }
      }
      @keyframes mcLegRight {
        0%, 100% { d: path("M 150 185 L 115 195 L 85 215"); }
        50% { d: path("M 150 185 L 195 190 L 200 215"); }
      }
      .anim-mc-left {
        animation: mcLegLeft var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
      .anim-mc-right {
        animation: mcLegRight var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    {/* Plank hands on ground */}
    <circle cx="230" cy="215" r="5" fill="#a3e635" />
    <line x1="225" y1="170" x2="230" y2="215" stroke="#f1f5f9" strokeWidth="9" strokeLinecap="round" />
    <line x1="150" y1="185" x2="225" y2="170" stroke="#f1f5f9" strokeWidth="13" strokeLinecap="round" />
    <circle cx="245" cy="155" r="13" fill="#f1f5f9" />

    {/* Alternating Knees */}
    <path className="anim-mc-left" stroke="#a3e635" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path className="anim-mc-right" stroke="#64748b" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);

// 16. High Knees
const HighKneesAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes hkLegL {
        0%, 100% { d: path("M 160 135 L 160 175 L 160 215"); }
        50% { d: path("M 160 135 L 200 135 L 200 180"); }
      }
      @keyframes hkLegR {
        0%, 100% { d: path("M 160 135 L 120 135 L 120 180"); }
        50% { d: path("M 160 135 L 160 175 L 160 215"); }
      }
      .anim-hk-l {
        animation: hkLegL var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
      .anim-hk-r {
        animation: hkLegR var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <line x1="160" y1="135" x2="160" y2="70" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <circle cx="160" cy="50" r="14" fill="#f1f5f9" />
    <path className="anim-hk-l" stroke="#a3e635" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path className="anim-hk-r" stroke="#64748b" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);

// 17. Bicycle Crunches
const BicycleCrunchAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes bikeCrunch {
        0%, 100% { d: path("M 115 175 L 150 150 L 190 190 M 150 150 L 130 195 L 85 205"); }
        50% { d: path("M 115 175 L 150 150 L 130 195 M 150 150 L 190 190 L 235 205"); }
      }
      .anim-bike {
        animation: bikeCrunch var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <circle cx="105" cy="170" r="12" fill="#f1f5f9" />
    <path className="anim-bike" stroke="#a3e635" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);

// 18. Dead Bugs
const DeadBugAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes deadBugCycle {
        0%, 100% {
          d: path("M 160 170 L 160 120 M 160 170 L 195 145 L 195 110 M 160 170 L 125 145 L 125 110");
        }
        50% {
          d: path("M 160 170 L 220 185 M 160 170 L 100 185 M 160 170 L 160 120");
        }
      }
      .anim-deadbug {
        animation: deadBugCycle var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <line x1="120" y1="170" x2="200" y2="170" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <circle cx="110" cy="170" r="12" fill="#f1f5f9" />
    <path className="anim-deadbug" stroke="#a3e635" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);

// 19. Bird Dogs
const BirdDogAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes birdDogReach {
        0%, 100% {
          d: path("M 120 160 L 120 215 M 200 160 L 200 215");
        }
        50% {
          d: path("M 120 160 L 60 160 M 200 160 L 260 160");
        }
      }
      .anim-birddog {
        animation: birdDogReach var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    {/* Tabletop torso */}
    <line x1="120" y1="160" x2="200" y2="160" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <circle cx="215" cy="150" r="12" fill="#f1f5f9" />
    {/* Fixed limbs */}
    <line x1="120" y1="160" x2="120" y2="215" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
    <line x1="200" y1="160" x2="200" y2="215" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
    {/* Reaching limbs */}
    <path className="anim-birddog" stroke="#a3e635" strokeWidth="8" strokeLinecap="round" fill="none" />
  </g>
);

// 20. Leg Raises
const LegRaiseAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes legSwing {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(-80deg); }
      }
      .anim-legraise {
        animation: legSwing var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
        transform-origin: 180px 200px;
      }
    `}</style>
    {/* Torso flat on ground */}
    <line x1="100" y1="200" x2="180" y2="200" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <circle cx="90" cy="200" r="12" fill="#f1f5f9" />
    <g className="anim-legraise">
      <line x1="180" y1="200" x2="255" y2="200" stroke="#a3e635" strokeWidth="11" strokeLinecap="round" />
      <circle cx="180" cy="200" r="5" fill="#a3e635" filter="url(#jointGlow)" />
    </g>
  </g>
);

// 21. Superman Hold / Raises
const SupermanAnimation: React.FC<{ isHold: boolean }> = ({ isHold }) => (
  <g>
    <style>{`
      @keyframes supermanPulse {
        0%, 100% {
          d: path("M 80 195 L 130 195 L 190 195 L 240 195");
        }
        50% {
          d: path("M 70 170 L 130 195 L 190 195 L 250 170");
        }
      }
      .anim-superman {
        animation: supermanPulse ${isHold ? 'calc(var(--anim-dur) * 1.5)' : 'var(--anim-dur)'} ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <path className="anim-superman" stroke="#a3e635" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="215" cy="180" r="12" fill="#f1f5f9" />
    <text x="160" y="225" fill="#a3e635" fontSize="10" textAnchor="middle" fontWeight="bold">
      {isHold ? 'HOLD STATIC ARCH' : 'PULSE ARCH'}
    </text>
  </g>
);

// 22. Reverse Snow Angels
const ReverseSnowAngelAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes snowAngelSweep {
        0%, 100% {
          d: path("M 160 140 L 125 185 M 160 140 L 195 185");
        }
        50% {
          d: path("M 160 140 L 115 100 M 160 140 L 205 100");
        }
      }
      .anim-angel {
        animation: snowAngelSweep var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <line x1="160" y1="130" x2="160" y2="200" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <circle cx="160" cy="115" r="13" fill="#f1f5f9" />
    <path className="anim-angel" stroke="#a3e635" strokeWidth="8" strokeLinecap="round" fill="none" />
  </g>
);

// 23. Towel Rows
const TowelRowAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes towelRowCycle {
        0%, 100% {
          d: path("M 140 145 L 200 160 L 220 195");
        }
        50% {
          d: path("M 140 145 L 125 155 L 220 195");
        }
      }
      .anim-towel {
        animation: towelRowCycle var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    {/* Seated torso */}
    <line x1="140" y1="145" x2="140" y2="195" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <line x1="140" y1="195" x2="220" y2="195" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
    <circle cx="140" cy="125" r="13" fill="#f1f5f9" />
    <path className="anim-towel" stroke="#a3e635" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <text x="160" y="225" fill="#a3e635" fontSize="10" textAnchor="middle">Self-Resisted Towel Row</text>
  </g>
);

// 24. Prone W Raises
const ProneWRaiseAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes wRaiseCycle {
        0%, 100% {
          d: path("M 125 160 L 140 170 L 160 165 L 180 170 L 195 160");
        }
        50% {
          d: path("M 125 140 L 140 155 L 160 160 L 180 155 L 195 140");
        }
      }
      .anim-wraise {
        animation: wRaiseCycle var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <line x1="160" y1="155" x2="160" y2="210" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <circle cx="160" cy="140" r="12" fill="#f1f5f9" />
    <path className="anim-wraise" stroke="#a3e635" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <text x="160" y="230" fill="#a3e635" fontSize="10" textAnchor="middle">Squeeze Shoulder Blades</text>
  </g>
);

// 25. Warmup: Arm Circles
const ArmCirclesAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes circleSweepL {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .anim-circle-l {
        animation: circleSweepL var(--anim-dur) linear infinite;
        animation-play-state: var(--anim-play);
        transform-origin: 160px 105px;
      }
    `}</style>
    <line x1="160" y1="150" x2="160" y2="90" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <circle cx="160" cy="70" r="14" fill="#f1f5f9" />
    <line x1="160" y1="150" x2="145" y2="215" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
    <line x1="160" y1="150" x2="175" y2="215" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
    <g className="anim-circle-l">
      <line x1="160" y1="105" x2="110" y2="105" stroke="#a3e635" strokeWidth="7" strokeLinecap="round" />
      <line x1="160" y1="105" x2="210" y2="105" stroke="#a3e635" strokeWidth="7" strokeLinecap="round" />
    </g>
  </g>
);

// 26. Warmup: Shoulder Rotations
const ShoulderRotationsAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes shoulderRoll {
        0% { transform: translate(0, 0); }
        25% { transform: translate(3px, -5px); }
        50% { transform: translate(0, -8px); }
        75% { transform: translate(-3px, -3px); }
        100% { transform: translate(0, 0); }
      }
      .anim-sh-roll {
        animation: shoulderRoll var(--anim-dur) linear infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <line x1="160" y1="150" x2="160" y2="90" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <circle cx="160" cy="70" r="14" fill="#f1f5f9" />
    <line x1="160" y1="150" x2="145" y2="215" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
    <line x1="160" y1="150" x2="175" y2="215" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
    <g className="anim-sh-roll">
      <circle cx="135" cy="95" r="7" fill="#a3e635" filter="url(#jointGlow)" />
      <circle cx="185" cy="95" r="7" fill="#a3e635" filter="url(#jointGlow)" />
    </g>
  </g>
);

// 27. Warmup: Hip Circles
const HipCirclesAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes hipCircleSweep {
        0% { transform: translate(0, 0); }
        25% { transform: translate(12px, 0); }
        50% { transform: translate(0, 4px); }
        75% { transform: translate(-12px, 0); }
        100% { transform: translate(0, 0); }
      }
      .anim-hip-circle {
        animation: hipCircleSweep var(--anim-dur) linear infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <circle cx="160" cy="50" r="14" fill="#f1f5f9" />
    <line x1="160" y1="70" x2="160" y2="135" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <line x1="160" y1="140" x2="130" y2="215" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
    <line x1="160" y1="140" x2="190" y2="215" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
    <ellipse className="anim-hip-circle" cx="160" cy="140" rx="14" ry="8" fill="none" stroke="#a3e635" strokeWidth="4" />
  </g>
);

// 28. Warmup: Marching in Place
const MarchingAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes marchL {
        0%, 100% { d: path("M 150 140 L 150 180 L 150 215"); }
        50% { d: path("M 150 140 L 135 155 L 135 190"); }
      }
      @keyframes marchR {
        0%, 100% { d: path("M 170 140 L 185 155 L 185 190"); }
        50% { d: path("M 170 140 L 170 180 L 170 215"); }
      }
      .anim-march-l {
        animation: marchL var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
      .anim-march-r {
        animation: marchR var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <line x1="160" y1="140" x2="160" y2="75" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <circle cx="160" cy="55" r="14" fill="#f1f5f9" />
    <path className="anim-march-l" stroke="#a3e635" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path className="anim-march-r" stroke="#64748b" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);

// 29. Warmup: Leg Swings
const LegSwingsAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes legSwingPendulum {
        0%, 100% { transform: rotate(-30deg); }
        50% { transform: rotate(30deg); }
      }
      .anim-swing {
        animation: legSwingPendulum var(--anim-dur) ease-in-out infinite;
        animation-play-state: var(--anim-play);
        transform-origin: 160px 140px;
      }
    `}</style>
    <line x1="160" y1="140" x2="160" y2="70" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <circle cx="160" cy="50" r="14" fill="#f1f5f9" />
    <line x1="160" y1="140" x2="160" y2="215" stroke="#64748b" strokeWidth="11" strokeLinecap="round" />
    <g className="anim-swing">
      <line x1="160" y1="140" x2="160" y2="215" stroke="#a3e635" strokeWidth="10" strokeLinecap="round" />
    </g>
  </g>
);

// 30. Cooldown: Chest Stretch
const ChestStretchAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes chestOpen {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(-6px); }
      }
      .anim-chest-stretch {
        animation: chestOpen calc(var(--anim-dur) * 1.5) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <line x1="160" y1="145" x2="160" y2="75" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <circle cx="160" cy="55" r="14" fill="#f1f5f9" />
    <line x1="160" y1="145" x2="150" y2="215" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
    <line x1="160" y1="145" x2="170" y2="215" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
    <g className="anim-chest-stretch">
      <line x1="160" y1="95" x2="120" y2="125" stroke="#a3e635" strokeWidth="7" strokeLinecap="round" />
    </g>
  </g>
);

// 31. Cooldown: Shoulder Stretch
const ShoulderStretchAnimation: React.FC = () => (
  <g>
    <line x1="160" y1="145" x2="160" y2="75" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <circle cx="160" cy="55" r="14" fill="#f1f5f9" />
    <line x1="160" y1="145" x2="150" y2="215" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
    <line x1="160" y1="145" x2="170" y2="215" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
    {/* Arm crossed over chest */}
    <line x1="180" y1="95" x2="125" y2="95" stroke="#a3e635" strokeWidth="8" strokeLinecap="round" />
    <line x1="140" y1="115" x2="140" y2="85" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
  </g>
);

// 32. Cooldown: Quad Stretch
const QuadStretchAnimation: React.FC = () => (
  <g>
    <line x1="160" y1="140" x2="160" y2="70" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <circle cx="160" cy="50" r="14" fill="#f1f5f9" />
    {/* Standing leg */}
    <line x1="160" y1="140" x2="160" y2="215" stroke="#f1f5f9" strokeWidth="11" strokeLinecap="round" />
    {/* Bent leg held at glute */}
    <path d="M 160 140 L 140 180 L 140 150" stroke="#a3e635" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="140" cy="150" r="4" fill="#a3e635" filter="url(#jointGlow)" />
  </g>
);

// 33. Cooldown: Hamstring Stretch
const HamstringStretchAnimation: React.FC = () => (
  <g>
    {/* Hinging torso */}
    <path d="M 160 145 L 205 130" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
    <circle cx="225" cy="125" r="13" fill="#f1f5f9" />
    {/* Front heel outstretched */}
    <line x1="160" y1="145" x2="215" y2="215" stroke="#a3e635" strokeWidth="10" strokeLinecap="round" />
    {/* Back slightly bent leg */}
    <line x1="160" y1="145" x2="135" y2="215" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
  </g>
);

// 34. Cooldown: Back Stretch (Child's pose)
const BackStretchAnimation: React.FC = () => (
  <g>
    <style>{`
      @keyframes childPoseBreathe {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      .anim-childpose {
        animation: childPoseBreathe calc(var(--anim-dur) * 1.5) ease-in-out infinite;
        animation-play-state: var(--anim-play);
      }
    `}</style>
    <g className="anim-childpose">
      {/* Torso resting over folded knees, arms outstretched */}
      <path d="M 115 205 L 140 185 L 195 185 L 245 205" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="205" cy="190" r="12" fill="#f1f5f9" />
      <line x1="195" y1="185" x2="255" y2="210" stroke="#a3e635" strokeWidth="7" strokeLinecap="round" />
    </g>
    <text x="160" y="160" fill="#a3e635" fontSize="10" textAnchor="middle">Child's Pose Decompression</text>
  </g>
);
