export interface AssessmentField {
  key: 'pushupsMax' | 'squatsOneMin' | 'plankMaxSeconds' | 'legRaisesMax' | 'jumpingJacksOneMin';
  label: string;
  measurement: string;
  unit: string;
  iconName: string;
  instructions: string;
  formTips: string[];
}

export const ASSESSMENT_FIELDS: AssessmentField[] = [
  {
    key: 'pushupsMax',
    label: 'Push-ups',
    measurement: 'Maximum clean repetitions',
    unit: 'reps',
    iconName: 'Activity',
    instructions: 'Perform continuous clean push-ups to technical failure with chest reaching 2 inches from floor and elbows locking at top without pausing for more than 2 seconds.',
    formTips: [
      'Maintain a rigid straight line from heels to crown',
      'No resting with hips in the air or knees on the floor',
      'Only count full range of motion repetitions'
    ]
  },
  {
    key: 'squatsOneMin',
    label: 'Squats',
    measurement: 'Repetitions in 1 minute',
    unit: 'reps',
    iconName: 'Flame',
    instructions: 'Count total valid bodyweight squats completed in exactly 60 seconds with thighs reaching parallel or below.',
    formTips: [
      'Hip crease must drop parallel to knee joint',
      'Stand completely upright with hips extended at top',
      'Heels must remain glued to the ground'
    ]
  },
  {
    key: 'plankMaxSeconds',
    label: 'Plank Hold',
    measurement: 'Maximum hold duration',
    unit: 'seconds',
    iconName: 'Timer',
    instructions: 'Hold a forearm plank with strict form for as long as possible until hip collapse or posture breakdown.',
    formTips: [
      'Elbows directly under shoulders',
      'Squeeze glutes and tuck pelvis',
      'Stop the timer immediately when hips drop or pike'
    ]
  },
  {
    key: 'legRaisesMax',
    label: 'Leg Raises',
    measurement: 'Maximum controlled repetitions',
    unit: 'reps',
    iconName: 'Zap',
    instructions: 'Perform unbroken lying leg raises from horizontal to 90 degrees without letting heels touch floor or lower back peeling off.',
    formTips: [
      'Lower under control (2 seconds down)',
      'Keep legs as straight as mobility allows',
      'Stop if lower back hyperextends and loses floor contact'
    ]
  },
  {
    key: 'jumpingJacksOneMin',
    label: 'Jumping Jacks',
    measurement: 'Repetitions in 1 minute',
    unit: 'reps',
    iconName: 'HeartPulse',
    instructions: 'Complete as many rhythmic jumping jacks as possible in 60 seconds with arms touching overhead.',
    formTips: [
      'Hands must touch or reach overhead at peak',
      'Feet must jump wider than shoulder-width',
      'Land softly on balls of feet'
    ]
  }
];

export const ASSESSMENT_DAYS: Array<{ dayNumber: 1 | 10 | 20 | 30; title: string; subtitle: string }> = [
  { dayNumber: 1, title: 'Day 01 — Baseline Assessment', subtitle: 'Benchmark your starting fitness level across all 5 test disciplines' },
  { dayNumber: 10, title: 'Day 10 — Phase 1 Assessment', subtitle: 'Measure foundation endurance gains after completing Phase 1' },
  { dayNumber: 20, title: 'Day 20 — Phase 2 Assessment', subtitle: 'Test your increased pushing power, leg stamina, and core control' },
  { dayNumber: 30, title: 'Day 30 — Final Assessment', subtitle: 'The culmination of your 30-day transformation: compare directly to Day 1' }
];
