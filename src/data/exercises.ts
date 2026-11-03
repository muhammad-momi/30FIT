import type { Exercise } from '../types';

export const EXERCISES: Record<string, Exercise> = {
  // PUSH-UPS & VARIATIONS
  'push-ups': {
    id: 'push-ups',
    name: 'Push-ups',
    category: 'Upper Body',
    primaryMuscles: ['Chest', 'Arms'],
    supportingMuscles: ['Shoulders', 'Core'],
    difficulty: 'Beginner',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 10,
    unit: 'reps',
    restRecommendation: 60,
    instructions: {
      startingPosition: 'High plank position with hands slightly wider than shoulder-width, fingers pointing forward, core tight, and body forming a straight line from heels to crown.',
      movement: 'Lower your chest under control until your elbows reach approximately 90 degrees, keeping elbows at a 45-degree angle to your ribs. Press firmly through palms to return to top.',
      breathing: 'Inhale smoothly on the descent; exhale forcefully as you press upward.',
      commonMistakes: [
        'Flaring elbows out at 90 degrees (strains shoulders)',
        'Sagging hips or arching lower back',
        'Poking head forward rather than lowering the full chest'
      ]
    }
  },

  'wide-push-ups': {
    id: 'wide-push-ups',
    name: 'Wide Push-ups',
    category: 'Upper Body',
    primaryMuscles: ['Chest'],
    supportingMuscles: ['Shoulders', 'Arms', 'Core'],
    difficulty: 'Intermediate',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 10,
    unit: 'reps',
    restRecommendation: 60,
    instructions: {
      startingPosition: 'Plank position with hands placed significantly wider than shoulders (about 1.5x shoulder width), hands angled slightly outward.',
      movement: 'Lower chest toward the floor with control, feeling an intense pectoral stretch, then press back up keeping body locked.',
      breathing: 'Inhale down; exhale as you drive through your hands to lockout.',
      commonMistakes: [
        'Over-flaring elbows perpendicular to body',
        'Cutting depth short due to excessive hand width',
        'Losing core tension'
      ]
    }
  },

  'diamond-push-ups': {
    id: 'diamond-push-ups',
    name: 'Diamond Push-ups',
    category: 'Upper Body',
    primaryMuscles: ['Arms'],
    supportingMuscles: ['Chest', 'Shoulders', 'Core'],
    difficulty: 'Intermediate',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 10,
    unit: 'reps',
    restRecommendation: 60,
    instructions: {
      startingPosition: 'Plank stance with index fingers and thumbs touching beneath your chest to form a diamond or triangle shape.',
      movement: 'Lower your sternum toward your hands, tucking elbows tight against your ribs to maximize triceps recruitment, then press up forcefully.',
      breathing: 'Inhale lowering down; exhale pressing up.',
      commonMistakes: [
        'Allowing elbows to flare outward away from ribs',
        'Rounding upper spine or collapsing hips',
        'Putting hands too high above shoulder level'
      ]
    }
  },

  'decline-push-ups': {
    id: 'decline-push-ups',
    name: 'Decline Push-ups',
    category: 'Upper Body',
    primaryMuscles: ['Chest', 'Shoulders'],
    supportingMuscles: ['Arms', 'Core'],
    difficulty: 'Intermediate',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 10,
    unit: 'reps',
    restRecommendation: 60,
    hasEquipmentAlternative: true,
    equipmentAlternativeNotice: 'Requires a stable low elevation (e.g. solid step or low sturdy block). Alternative: slow-tempo regular push-ups with 3-second descent.',
    alternativeExerciseId: 'push-ups',
    instructions: {
      startingPosition: 'Feet elevated on a stable low surface (sturdy bottom step or 6-12 inch platform), hands planted firmly on the floor shoulder-width apart.',
      movement: 'Lower chest until chin or chest gently touches or hovers above the floor, maintaining a rigid straight line from toes to shoulders, then push back up.',
      breathing: 'Inhale down; exhale up.',
      commonMistakes: [
        'Using an unstable chair or slippery surface (safety risk)',
        'Hyperextending lumbar spine (keep glutes and core squeezed)',
        'Incomplete range of motion'
      ]
    }
  },

  'archer-push-ups': {
    id: 'archer-push-ups',
    name: 'Archer Push-ups',
    category: 'Upper Body',
    primaryMuscles: ['Chest', 'Arms'],
    supportingMuscles: ['Shoulders', 'Core'],
    difficulty: 'Advanced',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 6,
    unit: 'reps',
    restRecommendation: 90,
    instructions: {
      startingPosition: 'Wide push-up stance with fingers pointing outward. Feet slightly wider than hip-width for balance.',
      movement: 'Lower body toward one arm while keeping the other arm straight and extending out like an archer drawing a bow. Push back up to center and alternate to the opposite side.',
      breathing: 'Inhale lowering to the working side; exhale pressing back to center.',
      commonMistakes: [
        'Bending both arms equally instead of keeping assistant arm straight',
        'Rotating torso sideways instead of keeping chest parallel to floor',
        'Dropping hips'
      ]
    }
  },

  'pike-push-ups': {
    id: 'pike-push-ups',
    name: 'Pike Push-ups',
    category: 'Upper Body',
    primaryMuscles: ['Shoulders', 'Arms'],
    supportingMuscles: ['Core', 'Back'],
    difficulty: 'Intermediate',
    isTimed: false,
    defaultSets: 2,
    defaultRepsOrDuration: 8,
    unit: 'reps',
    restRecommendation: 60,
    instructions: {
      startingPosition: 'Downward dog / pike stance with hips pushed high into the air, torso and arms in a straight diagonal line, looking back at feet.',
      movement: 'Bend elbows and lower crown of head slightly forward of your hands (forming a tripod), then press up and back through shoulders to return to high pike.',
      breathing: 'Inhale lowering forward; exhale pressing up and back.',
      commonMistakes: [
        'Dropping hips into a regular push-up stance',
        'Lowering head directly between hands rather than slightly forward',
        'Flaring elbows outward'
      ]
    }
  },

  // LEGS & LOWER BODY
  'squats': {
    id: 'squats',
    name: 'Squats',
    category: 'Lower Body',
    primaryMuscles: ['Legs', 'Glutes'],
    supportingMuscles: ['Core', 'Calves'],
    difficulty: 'Beginner',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 15,
    unit: 'reps',
    restRecommendation: 60,
    instructions: {
      startingPosition: 'Stand tall with feet shoulder-width apart, toes turned slightly outward 10-15 degrees, arms clasped at chest or out for counterbalance.',
      movement: 'Hinge hips back and bend knees, sitting down until thighs are parallel to the floor or slightly below. Keep chest upright and knees tracking over toes. Drive through mid-foot and heels to stand.',
      breathing: 'Inhale on the descent; exhale standing up tall.',
      commonMistakes: [
        'Knees caving inward (valgus collapse)',
        'Heels lifting off the ground',
        'Rounding lower back or collapsing chest'
      ]
    }
  },

  'reverse-lunges': {
    id: 'reverse-lunges',
    name: 'Reverse Lunges',
    category: 'Lower Body',
    primaryMuscles: ['Legs', 'Glutes'],
    supportingMuscles: ['Core', 'Calves'],
    difficulty: 'Beginner',
    isTimed: false,
    defaultSets: 2,
    defaultRepsOrDuration: 10,
    unit: 'reps',
    restRecommendation: 60,
    instructions: {
      startingPosition: 'Stand tall with feet hip-width apart and hands on hips or at chest.',
      movement: 'Step one foot backward, lowering your rear knee smoothly toward the floor until both front and back knees form 90-degree angles. Press through the front heel to return to standing.',
      breathing: 'Inhale stepping back; exhale pushing through front foot to stand.',
      commonMistakes: [
        'Taking too short a step, causing front knee to push excessively past toes',
        'Slamming back knee into the hard floor',
        'Leaning torso excessively forward or twisting'
      ]
    }
  },

  'lunges': {
    id: 'lunges',
    name: 'Lunges',
    category: 'Lower Body',
    primaryMuscles: ['Legs', 'Glutes'],
    supportingMuscles: ['Core', 'Calves'],
    difficulty: 'Intermediate',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 12,
    unit: 'reps',
    restRecommendation: 60,
    instructions: {
      startingPosition: 'Standing tall with shoulders back and core engaged.',
      movement: 'Step forward smoothly into a lunge until both knees reach 90 degrees. Decelerate under control, then drive forcefully off the front foot back to the starting position.',
      breathing: 'Inhale lunging forward; exhale driving back to starting position.',
      commonMistakes: [
        'Letting front heel lift off the ground',
        'Wobbling side to side due to placing feet on a tightrope line',
        'Bending torso forward over front thigh'
      ]
    }
  },

  'bulgarian-split-squats': {
    id: 'bulgarian-split-squats',
    name: 'Bulgarian Split Squats',
    category: 'Lower Body',
    primaryMuscles: ['Legs', 'Glutes'],
    supportingMuscles: ['Core', 'Calves'],
    difficulty: 'Advanced',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 10,
    unit: 'reps',
    restRecommendation: 60,
    hasEquipmentAlternative: true,
    equipmentAlternativeNotice: 'Requires a stable rear foot support (low sturdy stool or couch edge). Alternative: Floor Split Squats with both feet on the floor.',
    alternativeExerciseId: 'floor-split-squats',
    instructions: {
      startingPosition: 'Stand two paces in front of a low sturdy elevation. Rest top of rear foot on elevation, torso upright.',
      movement: 'Lower straight down by flexing front knee and hip until front thigh is parallel to floor. Drive through front heel to rise.',
      breathing: 'Inhale down; exhale driving up through front foot.',
      commonMistakes: [
        'Putting weight on back foot instead of front leg (front leg does 85% of work)',
        'Using an unstable rear surface',
        'Front heel lifting off floor'
      ]
    }
  },

  'floor-split-squats': {
    id: 'floor-split-squats',
    name: 'Floor Split Squats',
    category: 'Lower Body',
    primaryMuscles: ['Legs', 'Glutes'],
    supportingMuscles: ['Core', 'Calves'],
    difficulty: 'Beginner',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 10,
    unit: 'reps',
    restRecommendation: 60,
    instructions: {
      startingPosition: 'Stand in a split stance with feet hip-width apart horizontally and 3 feet apart front-to-back, both feet on the flat floor.',
      movement: 'Drop straight down until both knees reach 90 degrees. Drive through the front heel to return to top without moving your feet.',
      breathing: 'Inhale lowering; exhale pressing to top.',
      commonMistakes: [
        'Leaning forward onto toes',
        'Narrow stance causing loss of balance',
        'Incomplete depth'
      ]
    }
  },

  'glute-bridges': {
    id: 'glute-bridges',
    name: 'Glute Bridges',
    category: 'Lower Body',
    primaryMuscles: ['Glutes'],
    supportingMuscles: ['Legs', 'Core'],
    difficulty: 'Beginner',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 15,
    unit: 'reps',
    restRecommendation: 45,
    instructions: {
      startingPosition: 'Lie flat on back with knees bent at 90 degrees, feet flat on the floor hip-width apart, arms by sides.',
      movement: 'Drive through heels to lift hips upward until knees, hips, and shoulders form a straight line. Squeeze glutes hard at top for 1 full second, then lower with control.',
      breathing: 'Exhale driving hips up; inhale lowering down.',
      commonMistakes: [
        'Overarching lumbar spine at top instead of squeezing glutes',
        'Pushing from toes rather than mid-foot and heels',
        'Rushing repetitions without top contraction'
      ]
    }
  },

  'calf-raises': {
    id: 'calf-raises',
    name: 'Calf Raises',
    category: 'Lower Body',
    primaryMuscles: ['Calves'],
    supportingMuscles: ['Legs'],
    difficulty: 'Beginner',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 20,
    unit: 'reps',
    restRecommendation: 45,
    instructions: {
      startingPosition: 'Stand upright with feet hip-width apart, knees slightly soft, fingertips touching a wall for light balance if needed.',
      movement: 'Raise heels as high as possible onto the balls of your feet, squeezing calves tightly at peak height for 1 second, then lower down slowly under control.',
      breathing: 'Exhale rising onto toes; inhale lowering heels.',
      commonMistakes: [
        'Bouncing quickly at the bottom without muscle control',
        'Rolling ankles outward instead of pushing through big toe joints',
        'Bending knees to generate momentum'
      ]
    }
  },

  // CORE & POSTERIOR CHAIN
  'plank': {
    id: 'plank',
    name: 'Plank',
    category: 'Core',
    primaryMuscles: ['Core'],
    supportingMuscles: ['Shoulders', 'Glutes'],
    difficulty: 'Beginner',
    isTimed: true,
    defaultSets: 3,
    defaultRepsOrDuration: 30,
    unit: 'seconds',
    restRecommendation: 60,
    instructions: {
      startingPosition: 'Rest on forearms with elbows directly under shoulders, forearms parallel, legs extended back with feet hip-width apart.',
      movement: 'Lock your entire body into an immovable board: tuck pelvis slightly, brace abdominals as if taking a punch, squeeze glutes, and push floor away through elbows.',
      breathing: 'Breathe steadily and diaphragmatically while maintaining full core brace.',
      commonMistakes: [
        'Allowing lower back to sag and belly to drop',
        'Piking hips into the air to relieve core tension',
        'Holding your breath'
      ]
    }
  },

  'side-plank': {
    id: 'side-plank',
    name: 'Side Plank',
    category: 'Core',
    primaryMuscles: ['Core'],
    supportingMuscles: ['Shoulders', 'Glutes'],
    difficulty: 'Intermediate',
    isTimed: true,
    defaultSets: 2,
    defaultRepsOrDuration: 20,
    unit: 'seconds',
    restRecommendation: 45,
    instructions: {
      startingPosition: 'Lie on your side with elbow directly under shoulder, feet stacked or staggered for stability.',
      movement: 'Lift hips off the floor until body forms a straight diagonal line from head to ankles. Hold strong, engaging obliques and glutes.',
      breathing: 'Steady controlled breaths into ribs.',
      commonMistakes: [
        'Allowing hips to drop toward the floor',
        'Rotating top shoulder forward',
        'Shrugging supporting shoulder into the neck'
      ]
    }
  },

  'hollow-body-hold': {
    id: 'hollow-body-hold',
    name: 'Hollow Body Hold',
    category: 'Core',
    primaryMuscles: ['Core'],
    supportingMuscles: ['Legs'],
    difficulty: 'Advanced',
    isTimed: true,
    defaultSets: 4,
    defaultRepsOrDuration: 30,
    unit: 'seconds',
    restRecommendation: 60,
    instructions: {
      startingPosition: 'Lie on back, press lumbar spine flat into the floor, arms extended overhead by ears and legs straight out.',
      movement: 'Lift shoulders and legs 4-6 inches off the floor while maintaining continuous contact between lower back and floor, creating a gentle banana shape.',
      breathing: 'Shallow rhythmic breathing while keeping core firmly braced.',
      commonMistakes: [
        'Allowing lower back to peel off the ground (reduces core benefit and stresses spine)',
        'Tucking chin too aggressively into throat',
        'Bending knees (bend knees only if scaling down)'
      ]
    }
  },

  'bicycle-crunches': {
    id: 'bicycle-crunches',
    name: 'Bicycle Crunches',
    category: 'Core',
    primaryMuscles: ['Core'],
    supportingMuscles: ['Legs'],
    difficulty: 'Beginner',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 20,
    unit: 'reps',
    restRecommendation: 45,
    instructions: {
      startingPosition: 'Lie on back with hands behind ears, knees bent at 90 degrees above hips.',
      movement: 'Rotate torso to bring right elbow toward left knee as right leg extends straight out at 45 degrees. Pause briefly, then smoothly alternate sides like pedaling a bicycle.',
      breathing: 'Exhale with each diagonal crunch; inhale transitioning through center.',
      commonMistakes: [
        'Yanking neck with hands (keep fingertips light)',
        'Pedaling rapidly without deliberate abdominal contraction',
        'Allowing elbows to wrap in front of eyes'
      ]
    }
  },

  'dead-bugs': {
    id: 'dead-bugs',
    name: 'Dead Bugs',
    category: 'Core',
    primaryMuscles: ['Core'],
    supportingMuscles: ['Shoulders', 'Legs'],
    difficulty: 'Beginner',
    isTimed: false,
    defaultSets: 2,
    defaultRepsOrDuration: 10,
    unit: 'reps',
    restRecommendation: 45,
    instructions: {
      startingPosition: 'Lie flat on back with arms reaching straight toward ceiling and knees bent at 90 degrees directly over hips.',
      movement: 'Glue your lower back to the floor. Simultaneously lower right arm overhead and left leg straight toward floor until hovering just above ground. Return and repeat with left arm and right leg.',
      breathing: 'Exhale as limbs extend outward; inhale drawing them back to 90 degrees.',
      commonMistakes: [
        'Arching lower back off the ground as limbs extend',
        'Moving limbs too quickly without stabilization',
        'Bending the extended leg instead of reaching long'
      ]
    }
  },

  'bird-dogs': {
    id: 'bird-dogs',
    name: 'Bird Dogs',
    category: 'Core',
    primaryMuscles: ['Core', 'Back'],
    supportingMuscles: ['Glutes', 'Shoulders'],
    difficulty: 'Beginner',
    isTimed: false,
    defaultSets: 2,
    defaultRepsOrDuration: 10,
    unit: 'reps',
    restRecommendation: 45,
    instructions: {
      startingPosition: 'Tabletop position on hands and knees with wrists under shoulders and knees under hips, spine neutral.',
      movement: 'Simultaneously reach right arm forward and kick left leg straight back until parallel to floor. Hold for 1 second with square hips, then return and alternate.',
      breathing: 'Exhale reaching out; inhale returning to quadruped.',
      commonMistakes: [
        'Rotating hips sideways or tilting pelvis',
        'Kicking leg higher than hip height causing lumbar hyperextension',
        'Dropping head toward chest'
      ]
    }
  },

  'leg-raises': {
    id: 'leg-raises',
    name: 'Leg Raises',
    category: 'Core',
    primaryMuscles: ['Core'],
    supportingMuscles: ['Legs'],
    difficulty: 'Intermediate',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 10,
    unit: 'reps',
    restRecommendation: 60,
    instructions: {
      startingPosition: 'Lie flat on back with legs straight, arms by sides or hands resting lightly under lower glutes for pelvic support.',
      movement: 'Engage core to lift straight legs up to 90 degrees. Lower them slowly with control until heels hover just above floor without touching.',
      breathing: 'Inhale lowering legs; exhale pulling legs upward with lower abdominals.',
      commonMistakes: [
        'Swinging legs with momentum',
        'Letting lower back arch heavily on descent',
        'Bending knees excessively'
      ]
    }
  },

  'superman-hold': {
    id: 'superman-hold',
    name: 'Superman Hold',
    category: 'Core',
    primaryMuscles: ['Back', 'Glutes'],
    supportingMuscles: ['Shoulders', 'Legs'],
    difficulty: 'Beginner',
    isTimed: true,
    defaultSets: 2,
    defaultRepsOrDuration: 20,
    unit: 'seconds',
    restRecommendation: 45,
    instructions: {
      startingPosition: 'Lie face down on stomach with arms extended straight overhead and legs straight back.',
      movement: 'Simultaneously lift chest, arms, and thighs off the floor by contracting erector spinae, glutes, and upper back. Hold this flying position steadily.',
      breathing: 'Maintain controlled breaths without holding breath.',
      commonMistakes: [
        'Craning neck backwards to look up (keep neck aligned with spine)',
        'Bending knees instead of lifting from glutes and hips',
        'Jerking body abruptly'
      ]
    }
  },

  'superman-raises': {
    id: 'superman-raises',
    name: 'Superman Raises',
    category: 'Core',
    primaryMuscles: ['Back', 'Glutes'],
    supportingMuscles: ['Shoulders'],
    difficulty: 'Beginner',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 12,
    unit: 'reps',
    restRecommendation: 45,
    instructions: {
      startingPosition: 'Prone position face down on the mat, arms reaching forward and legs extended.',
      movement: 'Lift chest, arms, and thighs together smoothly off the floor, pause at peak contraction for 1 second, then lower gently back down to tap and repeat.',
      breathing: 'Exhale lifting up; inhale lowering down.',
      commonMistakes: [
        'Using ballistic momentum rather than muscle control',
        'Hyperextending neck',
        'Failing to squeeze glutes at the top'
      ]
    }
  },

  'reverse-snow-angels': {
    id: 'reverse-snow-angels',
    name: 'Reverse Snow Angels',
    category: 'Upper Body',
    primaryMuscles: ['Back', 'Shoulders'],
    supportingMuscles: ['Core', 'Glutes'],
    difficulty: 'Intermediate',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 12,
    unit: 'reps',
    restRecommendation: 45,
    instructions: {
      startingPosition: 'Lie face down with forehead resting lightly on towel or hovering, arms down by your thighs with palms facing down.',
      movement: 'Squeeze shoulder blades and lift hands off floor. Sweep arms in a wide horizontal arc all the way overhead like making a snow angel, keeping hands elevated, then sweep back to thighs.',
      breathing: 'Inhale sweeping overhead; exhale sweeping down to thighs.',
      commonMistakes: [
        'Letting hands drop and scrape along the floor',
        'Shrugging shoulders into ears',
        'Arching lower back excessively'
      ]
    }
  },

  'towel-rows': {
    id: 'towel-rows',
    name: 'Towel Rows',
    category: 'Upper Body',
    primaryMuscles: ['Back', 'Arms'],
    supportingMuscles: ['Core', 'Shoulders'],
    difficulty: 'Intermediate',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 8,
    unit: 'reps',
    restRecommendation: 60,
    hasEquipmentAlternative: true,
    equipmentAlternativeNotice: 'Performed using a standard household bath towel looped around your own foot while seated or standing for self-resisted rowing. NEVER anchor to doors or furniture! Complete zero-equipment alternative: Prone W Raises or Reverse Snow Angels.',
    alternativeExerciseId: 'prone-w-raises',
    instructions: {
      startingPosition: 'Sit tall on floor with legs extended, loop a household bath towel around the ball of one foot holding both towel ends with hands, chest proud.',
      movement: 'Pull towel handles back by driving elbows past ribs and squeezing shoulder blades, while simultaneously resisting with your own leg. Slowly extend arms under leg resistance.',
      breathing: 'Exhale rowing back; inhale returning under controlled resistance.',
      commonMistakes: [
        'Anchoring towel to furniture or door handles (unsafe)',
        'Rounding upper spine and slouching',
        'Not providing active leg resistance'
      ]
    }
  },

  'prone-w-raises': {
    id: 'prone-w-raises',
    name: 'Prone W Raises',
    category: 'Upper Body',
    primaryMuscles: ['Back', 'Shoulders'],
    supportingMuscles: ['Core'],
    difficulty: 'Beginner',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 12,
    unit: 'reps',
    restRecommendation: 45,
    instructions: {
      startingPosition: 'Lie face down, arms bent at elbows with thumbs pointing upward to form a "W" shape with your head and torso.',
      movement: 'Lift forearms, elbows, and chest slightly off floor by driving elbows down and back, powerfully retracting shoulder blades. Hold for 2 seconds, then lower with control.',
      breathing: 'Exhale lifting and squeezing; inhale releasing down.',
      commonMistakes: [
        'Lifting from wrists rather than engaging scapulae',
        'Tensing neck and upper traps',
        'Rushing repetitions'
      ]
    }
  },

  // CARDIO & CONDITIONING
  'jumping-jacks': {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    category: 'Cardio',
    primaryMuscles: ['Cardio', 'Calves'],
    supportingMuscles: ['Shoulders', 'Legs', 'Full Body'],
    difficulty: 'Beginner',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 20,
    unit: 'reps',
    restRecommendation: 45,
    instructions: {
      startingPosition: 'Stand tall with feet together and arms resting comfortably by your sides.',
      movement: 'Jump feet out wider than shoulder-width while sweeping arms overhead in a smooth arc. Quickly jump feet back together as arms return to sides in a rhythmic cadence.',
      breathing: 'Breathe rhythmically in sync with your jumping pattern.',
      commonMistakes: [
        'Landing stiff-legged with locked knees (land softly on balls of feet)',
        'Flapping arms with bent elbows instead of full extension',
        'Slapping feet loudly onto hard ground'
      ]
    }
  },

  'mountain-climbers': {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    category: 'Cardio',
    primaryMuscles: ['Core', 'Cardio'],
    supportingMuscles: ['Shoulders', 'Legs'],
    difficulty: 'Beginner',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 20,
    unit: 'reps',
    restRecommendation: 45,
    instructions: {
      startingPosition: 'High plank position with hands under shoulders, core braced, and feet hip-width apart.',
      movement: 'Drive one knee forward toward chest without letting hips bounce up, then rapidly switch legs in a running motion while maintaining a flat back.',
      breathing: 'Breathe steadily and continuously throughout the set.',
      commonMistakes: [
        'Bouncing hips high in the air',
        'Weight shifting back behind shoulders',
        'Rounding spine'
      ]
    }
  },

  'high-knees': {
    id: 'high-knees',
    name: 'High Knees',
    category: 'Cardio',
    primaryMuscles: ['Cardio', 'Legs'],
    supportingMuscles: ['Core', 'Calves'],
    difficulty: 'Intermediate',
    isTimed: true,
    defaultSets: 3,
    defaultRepsOrDuration: 30,
    unit: 'seconds',
    restRecommendation: 45,
    instructions: {
      startingPosition: 'Stand tall with chest proud and feet hip-width apart.',
      movement: 'Run in place, driving knees up to hip height rapidly while pumping arms vigorously with opposite arm and leg coordination. Land lightly on balls of feet.',
      breathing: 'Deep rhythmic breathing.',
      commonMistakes: [
        'Leaning torso backwards instead of staying upright with slight forward lean',
        'Barely lifting feet off floor (aim for parallel thighs)',
        'Heavy stomping landings'
      ]
    }
  },

  // WARM-UP & MOBILITY MOVEMENTS
  'arm-circles': {
    id: 'arm-circles',
    name: 'Arm Circles',
    category: 'Stretching',
    primaryMuscles: ['Shoulders', 'Mobility'],
    supportingMuscles: ['Arms'],
    difficulty: 'Beginner',
    isTimed: true,
    defaultSets: 1,
    defaultRepsOrDuration: 30,
    unit: 'seconds',
    restRecommendation: 15,
    instructions: {
      startingPosition: 'Stand tall with feet hip-width apart, arms extended horizontally straight out to sides at shoulder height.',
      movement: 'Rotate arms in smooth circles, starting small and gradually expanding diameter. Switch direction halfway through.',
      breathing: 'Even, relaxed breaths.',
      commonMistakes: [
        'Dropping arms below shoulder height',
        'Shrugging neck',
        'Moving erratically'
      ]
    }
  },

  'shoulder-rotations': {
    id: 'shoulder-rotations',
    name: 'Shoulder Rotations',
    category: 'Stretching',
    primaryMuscles: ['Shoulders', 'Mobility'],
    supportingMuscles: ['Back'],
    difficulty: 'Beginner',
    isTimed: true,
    defaultSets: 1,
    defaultRepsOrDuration: 30,
    unit: 'seconds',
    restRecommendation: 15,
    instructions: {
      startingPosition: 'Stand tall with arms relaxed or fingertips touching top of shoulders.',
      movement: 'Roll shoulders up toward ears, back, and down in large circular motions to mobilize the shoulder blades. Reverse after 15 seconds.',
      breathing: 'Inhale rolling up; exhale dropping down and back.',
      commonMistakes: [
        'Rushing the circle without exploring full range of motion',
        'Tensing the jaw or neck'
      ]
    }
  },

  'hip-circles': {
    id: 'hip-circles',
    name: 'Hip Circles',
    category: 'Stretching',
    primaryMuscles: ['Mobility', 'Core'],
    supportingMuscles: ['Glutes'],
    difficulty: 'Beginner',
    isTimed: true,
    defaultSets: 1,
    defaultRepsOrDuration: 30,
    unit: 'seconds',
    restRecommendation: 15,
    instructions: {
      startingPosition: 'Stand with feet wider than shoulder-width, hands resting on hips.',
      movement: 'Rotate hips in wide circular loops as if using a hula hoop, mobilizing hips and lower lumbar. Reverse direction smoothly.',
      breathing: 'Relaxed and fluid breathing.',
      commonMistakes: [
        'Bending knees excessively instead of isolating hip rotation',
        'Moving too fast'
      ]
    }
  },

  'marching-in-place': {
    id: 'marching-in-place',
    name: 'Marching in Place',
    category: 'Stretching',
    primaryMuscles: ['Mobility', 'Cardio'],
    supportingMuscles: ['Legs', 'Core'],
    difficulty: 'Beginner',
    isTimed: true,
    defaultSets: 1,
    defaultRepsOrDuration: 60,
    unit: 'seconds',
    restRecommendation: 15,
    instructions: {
      startingPosition: 'Stand tall, shoulders back, arms relaxed by sides.',
      movement: 'March deliberately in place, lifting alternating knees to waist height while swinging opposite arms with rhythm.',
      breathing: 'Steady deep breathing to raise core body temperature.',
      commonMistakes: [
        'Slouching forward',
        'Dropping knees below 45 degrees'
      ]
    }
  },

  'leg-swings': {
    id: 'leg-swings',
    name: 'Leg Swings',
    category: 'Stretching',
    primaryMuscles: ['Mobility', 'Legs'],
    supportingMuscles: ['Glutes'],
    difficulty: 'Beginner',
    isTimed: true,
    defaultSets: 1,
    defaultRepsOrDuration: 30,
    unit: 'seconds',
    restRecommendation: 15,
    instructions: {
      startingPosition: 'Stand tall beside a wall or chair for light balance support.',
      movement: 'Swing one leg forward and backward in a smooth pendulum arc, gradually increasing height and stretching hamstrings and hip flexors. Switch sides halfway.',
      breathing: 'Smooth rhythmic breaths.',
      commonMistakes: [
        'Hyperextending spine on backswing',
        'Forcing excessive range of motion before muscles are warm'
      ]
    }
  },

  // COOLDOWN STRETCHES
  'chest-stretch': {
    id: 'chest-stretch',
    name: 'Chest Stretch',
    category: 'Stretching',
    primaryMuscles: ['Chest', 'Shoulders'],
    supportingMuscles: ['Arms'],
    difficulty: 'Beginner',
    isTimed: true,
    defaultSets: 1,
    defaultRepsOrDuration: 40,
    unit: 'seconds',
    restRecommendation: 10,
    instructions: {
      startingPosition: 'Stand tall, interlace fingers behind your lower back or rest forearm against a wall corner.',
      movement: 'Gently pull shoulders back, expand chest, and lift hands slightly away from lower back until a pleasant opening stretch is felt across pecs.',
      breathing: 'Inhale expanding chest; exhale releasing tension.',
      commonMistakes: [
        'Arching lower back excessively',
        'Straining shoulder joints with excessive force'
      ]
    }
  },

  'shoulder-stretch': {
    id: 'shoulder-stretch',
    name: 'Shoulder Stretch',
    category: 'Stretching',
    primaryMuscles: ['Shoulders'],
    supportingMuscles: ['Back'],
    difficulty: 'Beginner',
    isTimed: true,
    defaultSets: 1,
    defaultRepsOrDuration: 40,
    unit: 'seconds',
    restRecommendation: 10,
    instructions: {
      startingPosition: 'Stand or sit tall with shoulders relaxed down.',
      movement: 'Bring one arm across your chest horizontally. Use opposite forearm to gently hug it closer to your body, feeling rear deltoid stretch. Switch arms halfway.',
      breathing: 'Deep slow breaths into back of shoulders.',
      commonMistakes: [
        'Shrugging the stretched shoulder up into ear',
        'Twisting torso with the arm'
      ]
    }
  },

  'quadriceps-stretch': {
    id: 'quadriceps-stretch',
    name: 'Quadriceps Stretch',
    category: 'Stretching',
    primaryMuscles: ['Legs'],
    supportingMuscles: ['Glutes'],
    difficulty: 'Beginner',
    isTimed: true,
    defaultSets: 1,
    defaultRepsOrDuration: 40,
    unit: 'seconds',
    restRecommendation: 10,
    instructions: {
      startingPosition: 'Stand tall on one foot, place hand on wall for stability if needed.',
      movement: 'Bend opposite knee and grasp top of foot with hand, pulling heel toward glute while keeping knees aligned and hips tucked forward. Switch sides halfway.',
      breathing: 'Slow controlled breaths.',
      commonMistakes: [
        'Allowing knee to flare out to side',
        'Arching lower back instead of tucking pelvis'
      ]
    }
  },

  'hamstring-stretch': {
    id: 'hamstring-stretch',
    name: 'Hamstring Stretch',
    category: 'Stretching',
    primaryMuscles: ['Legs'],
    supportingMuscles: ['Calves', 'Back'],
    difficulty: 'Beginner',
    isTimed: true,
    defaultSets: 1,
    defaultRepsOrDuration: 40,
    unit: 'seconds',
    restRecommendation: 10,
    instructions: {
      startingPosition: 'Extend one leg forward with heel on floor and toes pointed upward, opposite knee slightly bent.',
      movement: 'Hinge hips backward with a flat back, reaching chest toward front toe until hamstring stretch is felt. Switch sides halfway.',
      breathing: 'Exhale sinking slightly deeper into hip hinge.',
      commonMistakes: [
        'Rounding upper back instead of hinging at hips',
        'Locking out knee rigidly'
      ]
    }
  },

  'gentle-back-stretch': {
    id: 'gentle-back-stretch',
    name: 'Gentle Back Stretch',
    category: 'Stretching',
    primaryMuscles: ['Back'],
    supportingMuscles: ['Core', 'Shoulders'],
    difficulty: 'Beginner',
    isTimed: true,
    defaultSets: 1,
    defaultRepsOrDuration: 45,
    unit: 'seconds',
    restRecommendation: 10,
    instructions: {
      startingPosition: 'Kneel on floor, sit hips back onto heels, and reach arms forward onto floor in child\'s pose.',
      movement: 'Rest forehead gently on floor or mat. Walk fingertips forward to elongate spine, allowing lower back and lats to decompress.',
      breathing: 'Deep expansive diaphragmatic breaths into lower back.',
      commonMistakes: [
        'Holding tension in shoulders or neck',
        'Lifting hips high off heels'
      ]
    }
  }
};
