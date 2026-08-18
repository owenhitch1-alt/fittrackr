/**
 * Exercise descriptions and step-by-step instructions for all built-in exercises.
 * Keyed by exercise ID. Custom exercises that are not present here gracefully
 * receive undefined, which the UI handles with safe defaults.
 *
 * @typedef {{ description: string, instructions: string[] }} ExerciseContent
 * @type {Record<string, ExerciseContent>}
 */
export const exerciseDescriptions = {

  // ── CHEST (25) ──────────────────────────────────────────────────────────────

  'barbell-bench-press': {
    description: 'A compound chest exercise pressing a barbell from the chest while lying flat on a bench.',
    instructions: [
      'Lie flat on the bench with feet on the floor and eyes directly under the bar.',
      'Grip the bar slightly wider than shoulder-width, unrack it and hold it above your chest.',
      'Lower the bar under control to your mid-chest, keeping your elbows at about 45–75 degrees.',
      'Press the bar back up to the starting position and repeat.',
    ],
  },

  'incline-barbell-bench-press': {
    description: 'A barbell pressing movement performed on an inclined bench to emphasise the upper chest.',
    instructions: [
      'Set the bench to a 30–45 degree incline and lie back with feet flat on the floor.',
      'Grip the bar slightly wider than shoulder-width and unrack it above your upper chest.',
      'Lower the bar to your upper chest under control.',
      'Press the bar back up until your arms are fully extended and repeat.',
    ],
  },

  'decline-barbell-bench-press': {
    description: 'A barbell pressing movement on a declined bench that targets the lower portion of the chest.',
    instructions: [
      'Set the bench to a 15–30 degree decline and secure your legs under the pads.',
      'Grip the bar slightly wider than shoulder-width and unrack it above your lower chest.',
      'Lower the bar under control to the lower portion of your chest.',
      'Press the bar back to the starting position and repeat.',
    ],
  },

  'floor-press': {
    description: 'A pressing exercise performed lying on the floor that limits range of motion and reduces shoulder stress.',
    instructions: [
      'Lie flat on the floor with a barbell or dumbbells held at chest height.',
      'Keep your upper arms resting on the floor and your feet flat.',
      'Press the weight upward until your arms are fully extended.',
      'Lower the weight until your triceps touch the floor, then press again.',
    ],
  },

  'dumbbell-bench-press': {
    description: 'A chest pressing exercise using dumbbells that allows a greater range of motion than the barbell version.',
    instructions: [
      'Lie flat on a bench holding a dumbbell in each hand at chest level.',
      'Keep your feet flat on the floor and your back slightly arched.',
      'Press the dumbbells upward until your arms are extended, allowing them to move slightly inward at the top.',
      'Lower the dumbbells under control back to chest level and repeat.',
    ],
  },

  'incline-dumbbell-press': {
    description: 'A dumbbell press on an inclined bench that places extra emphasis on the upper chest.',
    instructions: [
      'Set the bench to a 30–45 degree incline and sit back holding a dumbbell in each hand.',
      'Position the dumbbells at chest level with palms facing forward.',
      'Press the dumbbells upward until your arms are nearly fully extended.',
      'Lower them under control back to chest level and repeat.',
    ],
  },

  'decline-dumbbell-press': {
    description: 'A dumbbell pressing movement on a decline bench that targets the lower chest.',
    instructions: [
      'Set the bench to a 15–30 degree decline and secure your legs under the pads.',
      'Hold a dumbbell in each hand at lower chest level with palms facing forward.',
      'Press the dumbbells upward until your arms are extended.',
      'Lower them under control back to the starting position and repeat.',
    ],
  },

  'dumbbell-flye': {
    description: 'An isolation exercise that stretches and squeezes the chest using a wide arc motion with dumbbells.',
    instructions: [
      'Lie flat on a bench holding a dumbbell in each hand above your chest with arms slightly bent.',
      'Lower the dumbbells out to the sides in a wide arc, feeling a stretch across your chest.',
      'Bring the dumbbells back together above your chest using a squeezing motion.',
      'Repeat while keeping a slight bend in your elbows throughout.',
    ],
  },

  'incline-dumbbell-flye': {
    description: 'A chest fly movement on an inclined bench targeting the upper chest through a stretching arc.',
    instructions: [
      'Set the bench to a 30–45 degree incline and hold a dumbbell in each hand above your upper chest.',
      'Lower the dumbbells out to the sides in a controlled arc with a slight bend in the elbows.',
      'Bring the dumbbells back together at the top, squeezing your upper chest.',
      'Repeat for the desired number of reps.',
    ],
  },

  'dumbbell-pullover': {
    description: 'An exercise that stretches the chest and lats by lowering a dumbbell in an arc behind the head while lying on a bench.',
    instructions: [
      'Lie perpendicular across a bench, supporting your upper back, with feet flat on the floor.',
      'Hold a single dumbbell with both hands above your chest, arms slightly bent.',
      'Lower the dumbbell back and down in an arc behind your head until you feel a stretch.',
      'Pull it back over your chest and repeat.',
    ],
  },

  'cable-crossover': {
    description: 'A cable machine exercise that targets the chest through a crossing motion, providing constant tension throughout.',
    instructions: [
      'Stand in the centre of a cable machine with handles set at shoulder height or above.',
      'Hold a handle in each hand with arms wide and a slight bend at the elbows.',
      'Pull the handles together in front of you, crossing them slightly and squeezing your chest.',
      'Return to the starting position under control and repeat.',
    ],
  },

  'low-to-high-cable-flye': {
    description: 'A cable fly variation with the cables set low that emphasises the upper chest through an upward-crossing motion.',
    instructions: [
      'Set the cable pulleys to the lowest position and attach single handles.',
      'Stand in the centre and hold a handle in each hand, palms facing up.',
      'Pull the handles upward and across your body, meeting in front of your upper chest.',
      'Return slowly to the starting position and repeat.',
    ],
  },

  'high-to-low-cable-flye': {
    description: 'A cable fly with cables set high that emphasises the lower chest through a downward-crossing motion.',
    instructions: [
      'Set the cable pulleys to the highest position and attach single handles.',
      'Stand in the centre holding a handle in each hand with a slight bend in the elbows.',
      'Pull the handles downward and across your body toward your hips, squeezing your lower chest.',
      'Return slowly to the starting position and repeat.',
    ],
  },

  'cable-chest-press': {
    description: 'A pressing movement performed at a cable machine that provides constant tension across the chest.',
    instructions: [
      'Set the pulleys to chest height, attach handles, and stand facing away from the machine.',
      'Hold a handle in each hand at chest level with elbows bent.',
      'Press both handles forward until your arms are extended.',
      'Return slowly to the starting position and repeat.',
    ],
  },

  'chest-press-machine': {
    description: 'A machine-based chest press that guides the pressing movement for consistent chest loading.',
    instructions: [
      'Adjust the seat so the handles are at chest height and sit with your back against the pad.',
      'Grip the handles and press forward until your arms are almost fully extended.',
      'Return under control to the starting position without releasing all the tension.',
      'Repeat for the desired number of reps.',
    ],
  },

  'pec-deck-machine': {
    description: 'An isolation machine exercise that squeezes the chest together through an arc motion.',
    instructions: [
      'Adjust the seat and pads so the handles are at chest height and your forearms rest on the pads.',
      'Sit upright and bring your forearms together in front of you, squeezing your chest.',
      'Return slowly to the starting position, feeling a stretch across the chest.',
      'Repeat while keeping controlled movement throughout.',
    ],
  },

  'smith-machine-bench-press': {
    description: 'A bench press variation using the Smith machine that guides the bar path for added stability.',
    instructions: [
      'Position a bench beneath the Smith machine bar so the bar aligns with your mid-chest.',
      'Lie back and grip the bar slightly wider than shoulder-width.',
      'Unhook the bar, lower it to your chest under control, then press it back up.',
      'Re-hook the bar at the end of your set.',
    ],
  },

  'smith-machine-incline-press': {
    description: 'An incline press using the Smith machine that guides the bar path to target the upper chest.',
    instructions: [
      'Set the bench to a 30–45 degree incline and position it under the Smith machine.',
      'Lie back so the bar aligns with your upper chest and grip slightly wider than shoulder-width.',
      'Unhook the bar, lower it to your upper chest, then press back up.',
      'Re-hook the bar at the end of the set.',
    ],
  },

  'push-up': {
    description: 'A fundamental bodyweight pressing exercise that works the chest, shoulders, and triceps.',
    instructions: [
      'Start in a plank position with hands placed slightly wider than shoulder-width.',
      'Lower your chest toward the floor, keeping your body in a straight line from head to heels.',
      'Push back up until your arms are fully extended.',
      'Repeat while keeping your core engaged throughout.',
    ],
  },

  'wide-grip-push-up': {
    description: 'A push-up variation with a wider hand placement that increases the stretch across the chest.',
    instructions: [
      'Start in a plank position with hands placed significantly wider than shoulder-width.',
      'Lower your chest toward the floor while keeping your body straight.',
      'Push back up to the starting position, squeezing your chest at the top.',
      'Repeat for the desired number of reps.',
    ],
  },

  'decline-push-up': {
    description: 'A push-up with feet elevated on a surface, shifting more load to the upper chest and shoulders.',
    instructions: [
      'Place your feet on an elevated surface such as a bench and assume a push-up position.',
      'Lower your chest toward the floor while keeping your body in a straight line.',
      'Push back up until your arms are fully extended.',
      'Repeat for the desired number of reps.',
    ],
  },

  'weighted-push-up': {
    description: 'A standard push-up performed with added resistance such as a weight plate on the back.',
    instructions: [
      'Have a partner place a weight plate between your shoulder blades or use a weighted vest.',
      'Assume a standard push-up position with hands slightly wider than shoulder-width.',
      'Lower your chest toward the floor while maintaining a rigid body position.',
      'Push back up to the starting position and repeat.',
    ],
  },

  'chest-dip': {
    description: 'A dipping movement that targets the lower chest by leaning the torso forward during the dip.',
    instructions: [
      'Grip the parallel dip bars and support your bodyweight with arms extended.',
      'Lean your torso slightly forward throughout the movement.',
      'Lower yourself by bending your elbows until your upper arms are at least parallel to the floor.',
      'Press back up to the starting position and repeat.',
    ],
  },

  'landmine-chest-press': {
    description: 'A landmine pressing exercise that works the chest through an angled pressing arc created by the barbell pivot.',
    instructions: [
      'Set up a barbell in a landmine attachment or corner, and hold the sleeve end with both hands at chest height.',
      'Stand with a slight bend in your knees and your core braced.',
      'Press the barbell forward and upward in an arc until your arms are extended.',
      'Lower it back to chest height under control and repeat.',
    ],
  },

  'resistance-band-chest-press': {
    description: 'A chest pressing exercise using a resistance band that can be performed anywhere.',
    instructions: [
      'Anchor the resistance band behind you at chest height and hold an end in each hand.',
      'Stand in a staggered stance facing away from the anchor point.',
      'Press your hands forward until your arms are extended.',
      'Return slowly to the starting position and repeat.',
    ],
  },

  // ── BACK (32) ───────────────────────────────────────────────────────────────

  'barbell-deadlift': {
    description: 'A fundamental compound exercise that builds strength across the entire posterior chain by pulling a barbell from the floor.',
    instructions: [
      'Stand with feet hip-width apart and the barbell over your mid-foot.',
      'Hinge at the hips and bend your knees to grip the bar just outside your legs.',
      'Brace your core, take a deep breath, and drive through your heels to stand upright.',
      'Lower the bar back to the floor under control and repeat.',
    ],
  },

  'sumo-deadlift': {
    description: 'A deadlift variation with a wide stance and hands inside the legs that shifts load to the inner thighs and hips.',
    instructions: [
      'Stand with feet wider than shoulder-width and toes pointed outward, bar over mid-foot.',
      'Hinge at the hips and grip the bar just inside your legs.',
      'Brace your core and drive through your heels and hips to stand upright.',
      'Lower the bar back to the floor under control and repeat.',
    ],
  },

  'trap-bar-deadlift': {
    description: 'A deadlift variation using a hex or trap bar that places the load at your sides, reducing spinal stress.',
    instructions: [
      'Step inside the trap bar with feet hip-width apart and the weight centred.',
      'Hinge at the hips and bend your knees to grip the handles.',
      'Brace your core and drive through your heels to stand tall.',
      'Lower the bar back to the floor under control and repeat.',
    ],
  },

  'deficit-deadlift': {
    description: 'A deadlift performed from a slight elevation to increase range of motion and build strength off the floor.',
    instructions: [
      'Stand on a small platform or plates so you start the pull below normal floor level.',
      'Hinge at the hips and grip the bar with your preferred stance.',
      'Drive through your heels to stand, keeping the bar close to your legs.',
      'Lower the bar to the floor under control and repeat.',
    ],
  },

  'snatch-grip-deadlift': {
    description: 'A deadlift variation using a very wide snatch grip that increases range of motion and upper back demand.',
    instructions: [
      'Stand with feet hip-width apart and grip the bar very wide, just inside the rings.',
      'Hinge at the hips, keeping your back flat and chest up.',
      'Drive through your heels to stand tall with the bar staying close to your legs.',
      'Lower back to the floor under control and repeat.',
    ],
  },

  'barbell-bent-over-row': {
    description: 'A compound rowing movement pulling a barbell to the lower chest or abdomen to build upper and mid back thickness.',
    instructions: [
      'Stand with feet shoulder-width apart, hinge forward to about 45 degrees, and grip the bar slightly wider than shoulder-width.',
      'Retract your shoulder blades and pull the bar to your lower chest or stomach.',
      'Lower the bar under control back to the starting position.',
      'Repeat while keeping your back flat and torso angle consistent.',
    ],
  },

  'pendlay-row': {
    description: 'A strict bent-over row where the bar starts and returns to the floor each rep, allowing heavier loads.',
    instructions: [
      'Stand with feet shoulder-width apart and hinge until your torso is nearly parallel to the floor.',
      'Grip the bar just outside shoulder-width with it resting on the floor.',
      'Explosively row the bar to your lower chest, then return it fully to the floor.',
      'Reset briefly between reps and repeat.',
    ],
  },

  'seal-row': {
    description: 'A chest-supported row on a raised bench that eliminates lower back involvement and isolates the back.',
    instructions: [
      'Lie face down on a bench raised high enough that the barbell hangs below it.',
      'Grip the bar with an overhand grip and let it hang at full arm extension.',
      'Row the bar up toward the bench, leading with your elbows.',
      'Lower the bar back to the starting position under control and repeat.',
    ],
  },

  't-bar-row': {
    description: 'A rowing exercise using a T-bar or landmine setup that allows heavy loading with a supported torso.',
    instructions: [
      'Stand over the bar or on the foot platform with the bar between your legs.',
      'Hinge forward and grip the handles, keeping your back flat.',
      'Row the weight toward your chest by driving your elbows back.',
      'Lower under control back to the starting position and repeat.',
    ],
  },

  'incline-barbell-row': {
    description: 'A row performed with the chest against an inclined bench to support the torso and isolate the back.',
    instructions: [
      'Set a bench to a 30–45 degree incline and lie face down on it holding a barbell.',
      'Let the bar hang at full extension below the bench.',
      'Pull the bar upward toward the bench by driving your elbows back.',
      'Lower the bar back down under control and repeat.',
    ],
  },

  'landmine-row': {
    description: 'A row using the landmine attachment that allows a natural arcing pull to target the mid back.',
    instructions: [
      'Load one end of the barbell into a landmine attachment and stand over the bar.',
      'Hinge forward and grip the sleeve end with one or both hands.',
      'Row the bar toward your hip or chest by driving your elbow back.',
      'Lower the bar back to the starting position under control and repeat.',
    ],
  },

  'single-arm-dumbbell-row': {
    description: 'A unilateral row with a dumbbell that isolates each side of the back independently.',
    instructions: [
      'Place one knee and hand on a bench for support with a dumbbell in your free hand.',
      'Let the dumbbell hang at full arm extension below your shoulder.',
      'Row the dumbbell upward toward your hip, keeping your elbow close to your body.',
      'Lower back to the starting position and repeat, then switch sides.',
    ],
  },

  'chest-supported-dumbbell-row': {
    description: 'A row with the chest resting on an inclined bench, removing lower back stress and isolating the back.',
    instructions: [
      'Set a bench to a low incline and lie face down holding a dumbbell in each hand.',
      'Let the dumbbells hang below the bench at full arm extension.',
      'Row both dumbbells upward by driving your elbows back and squeezing your shoulder blades.',
      'Lower back to the starting position under control and repeat.',
    ],
  },

  'seated-cable-row': {
    description: 'A pulling exercise using a cable machine with a seated position, targeting the mid back.',
    instructions: [
      'Sit at a cable row machine with feet on the footrests and knees slightly bent.',
      'Grip the handle and sit upright with a neutral spine.',
      'Pull the handle toward your lower chest or abdomen, squeezing your shoulder blades together.',
      'Extend your arms fully under control and repeat.',
    ],
  },

  'cable-single-arm-row': {
    description: 'A unilateral cable row that allows independent focus on each side of the back.',
    instructions: [
      'Sit or stand at a cable machine and grip a single handle with one hand.',
      'Pull the handle toward your hip or lower chest, driving your elbow back.',
      'Extend your arm fully under control to the starting position.',
      'Repeat for the desired reps, then switch to the other arm.',
    ],
  },

  'lat-pulldown': {
    description: 'A cable machine exercise that pulls a bar down to the chest to develop the latissimus dorsi.',
    instructions: [
      'Sit at the lat pulldown machine and grip the bar just wider than shoulder-width.',
      'Lean back slightly and pull the bar down toward your upper chest.',
      'Squeeze your lats at the bottom, then let the bar rise under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'wide-grip-lat-pulldown': {
    description: 'A lat pulldown with a wider grip that increases the stretch on the lats.',
    instructions: [
      'Sit at a lat pulldown machine and grip the bar significantly wider than shoulder-width.',
      'Lean back slightly and pull the bar down to your upper chest.',
      'Squeeze your lats at the bottom of the movement.',
      'Let the bar rise under control and repeat.',
    ],
  },

  'close-grip-lat-pulldown': {
    description: 'A lat pulldown with a narrow parallel or supinated grip that involves the biceps more actively.',
    instructions: [
      'Sit at the lat pulldown machine and attach a close-grip handle.',
      'Grip the handle and sit upright with a slight lean back.',
      'Pull the handle down toward your chest, driving your elbows toward your sides.',
      'Return to the starting position under control and repeat.',
    ],
  },

  'straight-arm-pulldown': {
    description: 'A cable exercise that isolates the lats by keeping the arms straight and pulling the bar down.',
    instructions: [
      'Stand facing a high cable machine and grip the bar or rope with both hands.',
      'Keep your arms straight with just a slight bend at the elbows.',
      'Pull the bar down toward your thighs in an arc by contracting your lats.',
      'Return slowly to the starting position and repeat.',
    ],
  },

  'machine-row': {
    description: 'A rowing motion performed on a machine that guides the path and provides back support.',
    instructions: [
      'Adjust the seat so the handles align with your mid-chest and sit with your chest against the pad.',
      'Grip the handles and pull them toward you by driving your elbows back.',
      'Squeeze your shoulder blades together at the end of the movement.',
      'Return to the starting position under control and repeat.',
    ],
  },

  'machine-pulldown': {
    description: 'A lat pulldown motion performed on a dedicated pulldown machine for guided back development.',
    instructions: [
      'Sit at the machine and adjust the knee pad to secure your legs.',
      'Grip the handles or bar and pull downward toward your chest.',
      'Squeeze your lats and shoulder blades at the bottom of the movement.',
      'Return to the starting position under control and repeat.',
    ],
  },

  'pull-up': {
    description: 'A bodyweight exercise pulling the body up until the chin clears the bar, building the lats and biceps.',
    instructions: [
      'Hang from a pull-up bar with hands slightly wider than shoulder-width, palms facing away.',
      'Engage your shoulder blades and pull your chest toward the bar.',
      'Continue until your chin clears the bar, then lower yourself under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'chin-up': {
    description: 'A pull-up variation with a supinated grip that increases bicep involvement.',
    instructions: [
      'Hang from a bar with hands shoulder-width apart, palms facing toward you.',
      'Pull yourself upward until your chin clears the bar.',
      'Lower yourself under control back to a full hang.',
      'Repeat for the desired number of reps.',
    ],
  },

  'wide-grip-pull-up': {
    description: 'A pull-up performed with hands set wider than shoulder-width to increase lat engagement.',
    instructions: [
      'Hang from a bar with hands well wider than shoulder-width, palms facing away.',
      'Pull your chest toward the bar by driving your elbows down and out.',
      'Continue until your chin clears the bar, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'neutral-grip-pull-up': {
    description: 'A pull-up with palms facing each other using parallel handles, easier on the wrists and shoulders.',
    instructions: [
      'Grip parallel handles or a neutral-grip bar with palms facing each other.',
      'Hang with arms fully extended, then pull your chest toward the handles.',
      'Continue until your chin is level with or above the handles.',
      'Lower yourself under control and repeat.',
    ],
  },

  'assisted-pull-up': {
    description: 'A pull-up performed with machine assistance or a resistance band to help complete the movement.',
    instructions: [
      'Set the assistance weight on a machine or loop a resistance band over the bar and place your knee or foot in it.',
      'Grip the bar with hands slightly wider than shoulder-width.',
      'Pull yourself upward until your chin clears the bar.',
      'Lower under control and repeat.',
    ],
  },

  'ring-row': {
    description: 'A bodyweight rowing exercise using gymnastic rings that can be scaled by adjusting body angle.',
    instructions: [
      'Set the rings to a height that suits your strength level and grip one in each hand.',
      'Walk your feet forward and lean back so your body forms a diagonal plank.',
      'Pull your chest up to the rings by driving your elbows back.',
      'Lower under control back to the starting position and repeat.',
    ],
  },

  'suspension-trainer-row': {
    description: 'A rowing movement using a suspension trainer that is adjustable by changing body angle.',
    instructions: [
      'Hold the suspension trainer handles with palms facing each other and lean back.',
      'Keep your body in a straight line from head to heels.',
      'Pull your chest up to your hands by driving your elbows back.',
      'Lower under control to the starting position and repeat.',
    ],
  },

  'good-morning': {
    description: 'A hip hinge exercise with a barbell on the back that strengthens the hamstrings and lower back.',
    instructions: [
      'Place a barbell on your upper back and stand with feet shoulder-width apart.',
      'Keep your back flat and hinge at the hips, lowering your torso forward.',
      'Lower until you feel a hamstring stretch, then drive your hips forward to return to standing.',
      'Repeat while keeping your back neutral throughout.',
    ],
  },

  'back-extension': {
    description: 'A lower back and glute exercise performed on a hyperextension bench.',
    instructions: [
      'Position yourself face down on a hyperextension bench with your hips on the pad.',
      'Cross your arms over your chest or hold a weight plate.',
      'Lower your upper body toward the floor, then raise it back until your body forms a straight line.',
      'Repeat for the desired number of reps.',
    ],
  },

  'reverse-hyperextension': {
    description: 'A glute and lower back exercise performed lying face down on a raised surface, raising the legs.',
    instructions: [
      'Lie face down on a high bench or hyperextension machine with your legs hanging off the edge.',
      'Hold the handles for stability and squeeze your glutes to raise your legs.',
      'Lift until your legs are roughly parallel to the floor, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'cable-pull-through': {
    description: 'A hip hinge movement using a cable machine that develops the glutes and hamstrings.',
    instructions: [
      'Attach a rope to a low cable pulley and stand facing away from the machine.',
      'Straddle the cable and hinge forward at the hips, letting the rope pull between your legs.',
      'Drive your hips forward to stand upright, squeezing your glutes at the top.',
      'Hinge back down under control and repeat.',
    ],
  },

  // ── SHOULDERS (20) ──────────────────────────────────────────────────────────

  'barbell-overhead-press': {
    description: 'A fundamental standing pressing exercise that builds shoulder strength and mass.',
    instructions: [
      'Stand with feet shoulder-width apart and grip the barbell just outside shoulder-width.',
      'Hold the bar at shoulder height with elbows slightly in front of the bar.',
      'Press the bar directly overhead until your arms are fully extended.',
      'Lower the bar back to shoulder height under control and repeat.',
    ],
  },

  'seated-barbell-overhead-press': {
    description: 'An overhead barbell press performed seated, reducing lower body involvement for focused shoulder work.',
    instructions: [
      'Sit on an adjustable bench with back support and grip the bar at shoulder height.',
      'Brace your core and press the bar straight overhead until your arms are extended.',
      'Lower the bar back to shoulder height under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'dumbbell-shoulder-press': {
    description: 'A shoulder press using dumbbells that allows independent arm movement and a greater range of motion.',
    instructions: [
      'Stand or sit holding a dumbbell in each hand at shoulder height with palms facing forward.',
      'Press both dumbbells overhead until your arms are fully extended.',
      'Lower them back to shoulder height under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'seated-dumbbell-press': {
    description: 'A dumbbell shoulder press performed seated to stabilise the lower body and focus on shoulder strength.',
    instructions: [
      'Sit on a bench with back support holding a dumbbell in each hand at shoulder height.',
      'Brace your core and press both dumbbells overhead until your arms are extended.',
      'Lower them back to shoulder height under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'arnold-press': {
    description: 'A rotational dumbbell pressing exercise that starts with palms facing you and rotates to palms forward during the press.',
    instructions: [
      'Sit holding dumbbells at shoulder height with palms facing toward you and elbows in front.',
      'Press the dumbbells upward while rotating your palms outward so they face forward at the top.',
      'Lower the dumbbells and rotate back to the starting position.',
      'Repeat for the desired number of reps.',
    ],
  },

  'lateral-raise': {
    description: 'An isolation exercise raising dumbbells out to the sides to target the lateral deltoid.',
    instructions: [
      'Stand holding a dumbbell in each hand at your sides with a slight bend in the elbows.',
      'Raise both dumbbells out to your sides until they are at shoulder height.',
      'Pause briefly at the top, then lower them under control.',
      'Repeat while avoiding swinging or using momentum.',
    ],
  },

  'dumbbell-front-raise': {
    description: 'An isolation exercise raising dumbbells to the front to target the anterior deltoid.',
    instructions: [
      'Stand holding a dumbbell in each hand at the front of your thighs.',
      'Raise one or both dumbbells forward to shoulder height with arms nearly straight.',
      'Pause briefly at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'rear-delt-flye': {
    description: 'An isolation exercise targeting the posterior deltoid by raising dumbbells out and back from a hinged position.',
    instructions: [
      'Hinge forward at the hips or sit on the edge of a bench, holding a dumbbell in each hand.',
      'Let the dumbbells hang with a slight bend in your elbows.',
      'Raise both dumbbells out and back in a wide arc until they are at shoulder height.',
      'Lower them under control and repeat.',
    ],
  },

  'cable-lateral-raise': {
    description: 'A lateral raise using a cable machine that provides constant tension throughout the movement.',
    instructions: [
      'Stand beside a low cable pulley and hold the handle with the arm farthest from the machine.',
      'Keep a slight bend in your elbow and raise your arm out to the side to shoulder height.',
      'Lower the handle under control back to your side.',
      'Repeat for the desired reps, then switch sides.',
    ],
  },

  'cable-front-raise': {
    description: 'A front raise performed with a cable machine for consistent tension targeting the front deltoid.',
    instructions: [
      'Stand facing away from a low cable pulley and hold the handle with one hand.',
      'Raise the handle forward to shoulder height with your arm nearly straight.',
      'Lower under control back to the starting position.',
      'Repeat for the desired reps, then switch sides.',
    ],
  },

  'cable-rear-delt-flye': {
    description: 'A cable machine rear delt fly that keeps constant tension on the posterior deltoid.',
    instructions: [
      'Stand at the centre of a cable machine with cables set at shoulder height.',
      'Hold the left handle with your right hand and the right handle with your left hand, crossing them.',
      'Pull both handles outward and back until your arms are wide, squeezing your rear delts.',
      'Return slowly to the crossed starting position and repeat.',
    ],
  },

  'face-pull': {
    description: 'A cable exercise pulling toward the face to strengthen the rear delts and external rotators.',
    instructions: [
      'Attach a rope to a high cable pulley and stand facing the machine.',
      'Hold the rope ends and pull them toward your face, separating your hands as you pull.',
      'Finish with your elbows high and hands beside your ears, squeezing your rear delts.',
      'Return slowly to the starting position and repeat.',
    ],
  },

  'machine-shoulder-press': {
    description: 'A shoulder press on a dedicated machine that guides the pressing path for consistent deltoid loading.',
    instructions: [
      'Adjust the seat so the handles are at shoulder height and sit with your back against the pad.',
      'Grip the handles and press upward until your arms are almost fully extended.',
      'Lower under control back to the starting position.',
      'Repeat for the desired number of reps.',
    ],
  },

  'machine-lateral-raise': {
    description: 'A lateral raise performed on a machine with consistent resistance throughout the arc.',
    instructions: [
      'Sit at the lateral raise machine and position your arms against the arm pads.',
      'Raise your arms out to the sides until they are at shoulder height.',
      'Lower slowly back to the starting position.',
      'Repeat for the desired number of reps.',
    ],
  },

  'smith-machine-overhead-press': {
    description: 'An overhead press using the Smith machine that guides the bar path for added stability.',
    instructions: [
      'Position a bench under the Smith machine and adjust the bar to shoulder height.',
      'Sit and grip the bar slightly wider than shoulder-width.',
      'Unhook the bar and press it straight overhead until your arms are extended.',
      'Lower back to shoulder height under control and repeat.',
    ],
  },

  'push-press': {
    description: 'An explosive overhead pressing exercise that uses a leg drive to accelerate the bar past the sticking point.',
    instructions: [
      'Hold the bar at shoulder height in a front rack or clean grip position.',
      'Dip slightly at the knees, then explosively drive through your legs to initiate the press.',
      'Press the bar overhead until your arms are fully locked out.',
      'Lower the bar back to your shoulders and repeat.',
    ],
  },

  'landmine-press': {
    description: 'A pressing exercise using the landmine attachment that works the shoulder through an angled pressing arc.',
    instructions: [
      'Load one end of the barbell into a landmine attachment and stand facing it.',
      'Hold the sleeve end with one or both hands at shoulder height.',
      'Press the bar upward and forward in an arc until your arm is extended.',
      'Lower under control back to shoulder height and repeat.',
    ],
  },

  'pike-push-up': {
    description: 'A bodyweight exercise in a pike position that loads the shoulders like an overhead press.',
    instructions: [
      'Start in a high plank position, then walk your feet in and raise your hips to form an inverted V.',
      'Keep your arms shoulder-width apart and lower your head toward the floor.',
      'Push back up until your arms are extended.',
      'Repeat for the desired number of reps.',
    ],
  },

  'handstand-push-up': {
    description: 'An advanced bodyweight shoulder exercise performed inverted against a wall.',
    instructions: [
      'Kick up into a handstand position facing a wall with hands about 6–12 inches from it.',
      'Slowly lower your head toward the floor, keeping your core braced.',
      'Press back up to the full handstand position.',
      'Repeat with control for the desired number of reps.',
    ],
  },

  'band-pull-apart': {
    description: 'A shoulder health exercise pulling a resistance band apart to strengthen the rear delts and upper back.',
    instructions: [
      'Hold a resistance band with both hands in front of you at shoulder height, arms extended.',
      'Pull the band apart by moving your hands outward until the band touches your chest.',
      'Squeeze your shoulder blades together at the end of the movement.',
      'Return to the starting position under control and repeat.',
    ],
  },

  // ── TRAPS (10) ──────────────────────────────────────────────────────────────

  'barbell-shrug': {
    description: 'A classic trap exercise elevating the shoulders while holding a barbell to build the upper trapezius.',
    instructions: [
      'Stand holding a barbell in front of you with an overhand grip at arm\'s length.',
      'Shrug your shoulders straight up toward your ears as high as possible.',
      'Pause briefly at the top, then lower your shoulders under control.',
      'Repeat while keeping your arms straight.',
    ],
  },

  'dumbbell-shrug': {
    description: 'A shrug variation using dumbbells held at the sides to develop the upper trapezius.',
    instructions: [
      'Stand holding a dumbbell in each hand at your sides with arms straight.',
      'Shrug both shoulders upward toward your ears as high as possible.',
      'Pause briefly at the top, then lower under control.',
      'Repeat without rolling the shoulders.',
    ],
  },

  'cable-shrug': {
    description: 'A shrug performed with a cable machine that provides constant tension on the traps throughout the movement.',
    instructions: [
      'Stand holding the cable handle with an overhand grip in front of you.',
      'Shrug your shoulders upward toward your ears against the cable tension.',
      'Pause at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'machine-shrug': {
    description: 'A trap isolation exercise using a dedicated shrug machine for guided resistance and comfortable loading.',
    instructions: [
      'Stand or sit at the shrug machine and grip the handles.',
      'Shrug your shoulders straight upward as high as possible.',
      'Pause at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'smith-machine-shrug': {
    description: 'A barbell shrug performed using the Smith machine, which guides the bar path and allows heavier loads.',
    instructions: [
      'Set the Smith machine bar to a comfortable standing height and grip it with both hands.',
      'Shrug your shoulders straight up toward your ears as high as possible.',
      'Pause briefly at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'trap-bar-shrug': {
    description: 'A shrug using the trap bar where the weight is held at the sides, reducing wrist strain.',
    instructions: [
      'Step inside the trap bar, grip the handles and stand upright.',
      'Shrug both shoulders upward toward your ears as high as possible.',
      'Pause briefly at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'rack-pull': {
    description: 'A partial deadlift starting from a rack with the bar above the knees, focusing on upper back and trap strength.',
    instructions: [
      'Set the safety bars in a power rack so the bar is at or just above knee height.',
      'Grip the bar with a conventional or mixed grip and set your back flat.',
      'Drive through your heels to stand upright, pulling the bar close to your thighs.',
      'Lower back to the rack under control and repeat.',
    ],
  },

  'behind-the-back-shrug': {
    description: 'A shrug holding the barbell behind the body that targets the mid-traps through a slightly different angle.',
    instructions: [
      'Hold a barbell behind your back at arm\'s length with an overhand grip.',
      'Shrug your shoulders straight upward as high as possible.',
      'Pause briefly at the top, then lower under control.',
      'Repeat while keeping the bar close to your body.',
    ],
  },

  'upright-row': {
    description: 'A pulling exercise bringing a barbell upward along the front of the body to develop the traps and lateral deltoids.',
    instructions: [
      'Stand holding a barbell or dumbbells in front of you with an overhand grip.',
      'Pull the weight upward close to your body until it reaches chin height, with elbows leading.',
      'Pause briefly at the top, then lower under control.',
      'Repeat while keeping the bar close to your torso.',
    ],
  },

  'dumbbell-upright-row': {
    description: 'An upright row using dumbbells that allows a more natural hand path, reducing wrist and shoulder stress.',
    instructions: [
      'Stand holding a dumbbell in each hand in front of your thighs, palms facing you.',
      'Pull both dumbbells upward close to your body until they reach chin height with elbows leading.',
      'Pause briefly at the top, then lower under control.',
      'Repeat with a controlled tempo.',
    ],
  },

  // ── ARMS — BICEPS (15) ──────────────────────────────────────────────────────

  'barbell-curl': {
    description: 'The classic bicep curl using a barbell for maximum loading and bilateral development.',
    instructions: [
      'Stand holding a barbell with an underhand grip, hands shoulder-width apart.',
      'Keep your elbows at your sides and curl the bar toward your chest.',
      'Squeeze your biceps at the top of the movement.',
      'Lower the bar under control back to the starting position and repeat.',
    ],
  },

  'ez-bar-curl': {
    description: 'A bicep curl using an EZ curl bar that reduces wrist strain through an angled grip.',
    instructions: [
      'Stand holding an EZ bar on the angled grips with an underhand grip.',
      'Keep your elbows fixed at your sides and curl the bar toward your chest.',
      'Squeeze your biceps at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'dumbbell-curl': {
    description: 'A bicep curl using dumbbells that allows independent arm movement and wrist supination.',
    instructions: [
      'Stand holding a dumbbell in each hand at your sides, palms facing forward.',
      'Keep your elbows at your sides and curl both dumbbells toward your shoulders.',
      'Squeeze your biceps at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'alternating-dumbbell-curl': {
    description: 'A dumbbell curl alternating one arm at a time to allow focus on each bicep individually.',
    instructions: [
      'Stand holding a dumbbell in each hand at your sides, palms facing forward.',
      'Curl one dumbbell toward your shoulder while keeping the other arm still.',
      'Lower the first dumbbell and immediately curl the other.',
      'Continue alternating for the desired number of reps per arm.',
    ],
  },

  'hammer-curl': {
    description: 'A bicep curl with a neutral grip that emphasises the brachialis and brachioradialis for arm thickness.',
    instructions: [
      'Stand holding a dumbbell in each hand with palms facing each other.',
      'Keep your elbows at your sides and curl both dumbbells toward your shoulders.',
      'Squeeze at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'incline-dumbbell-curl': {
    description: 'A bicep curl performed on an inclined bench that stretches the long head of the bicep for a fuller contraction.',
    instructions: [
      'Sit on an inclined bench set to about 45 degrees and hold a dumbbell in each hand.',
      'Let your arms hang naturally with palms facing forward.',
      'Curl both dumbbells toward your shoulders without moving your elbows.',
      'Lower under control back to the hanging position and repeat.',
    ],
  },

  'concentration-curl': {
    description: 'An isolation curl performed while seated with the elbow braced on the thigh for maximum bicep focus.',
    instructions: [
      'Sit on a bench with legs apart and hold a dumbbell in one hand.',
      'Rest your elbow on the inside of your thigh and let the dumbbell hang.',
      'Curl the dumbbell toward your shoulder, squeezing your bicep at the top.',
      'Lower under control and repeat, then switch arms.',
    ],
  },

  'spider-curl': {
    description: 'A preacher-style curl performed lying face down on an inclined bench to isolate the bicep at full extension.',
    instructions: [
      'Lie face down on a 45-degree inclined bench holding a barbell or dumbbells.',
      'Let your arms hang down with palms facing up.',
      'Curl the weight toward your shoulders, squeezing your biceps.',
      'Lower back to full extension under control and repeat.',
    ],
  },

  'preacher-curl': {
    description: 'A bicep curl with the upper arm supported on a preacher bench pad to eliminate swinging and isolate the bicep.',
    instructions: [
      'Sit at a preacher bench and drape your upper arms over the pad.',
      'Hold an EZ bar or dumbbell with an underhand grip.',
      'Curl the weight toward your shoulders, keeping your upper arms on the pad.',
      'Lower under control back to full extension and repeat.',
    ],
  },

  'drag-curl': {
    description: 'A bicep curl variation where the bar is dragged up the torso by driving the elbows back, increasing peak contraction.',
    instructions: [
      'Stand holding a barbell in front of your thighs with an underhand grip.',
      'Drag the bar upward close to your body by driving your elbows back and up.',
      'Continue until the bar is at upper chest level and your elbows are high.',
      'Lower the bar back down along the same path and repeat.',
    ],
  },

  'cable-curl': {
    description: 'A bicep curl using a cable machine for constant tension throughout the range of motion.',
    instructions: [
      'Stand facing a low cable pulley and grip the bar or handle with an underhand grip.',
      'Keep your elbows at your sides and curl the handle toward your shoulders.',
      'Squeeze your biceps at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'cable-hammer-curl': {
    description: 'A hammer curl using a rope cable attachment that provides constant tension on the brachialis and brachioradialis.',
    instructions: [
      'Stand facing a low cable pulley with a rope attachment and grip one end in each hand.',
      'Keep your palms facing each other and curl the rope toward your shoulders.',
      'Squeeze your biceps and brachialis at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'machine-curl': {
    description: 'A bicep curl performed on a dedicated curl machine for guided, isolated bicep development.',
    instructions: [
      'Sit at the curl machine and position your upper arms on the pad.',
      'Grip the handles with an underhand grip.',
      'Curl the handles toward your shoulders, squeezing your biceps.',
      'Lower under control back to full extension and repeat.',
    ],
  },

  'reverse-curl': {
    description: 'A curl variation using an overhand grip that targets the brachioradialis and forearm muscles.',
    instructions: [
      'Stand holding a barbell or dumbbells with an overhand grip, palms facing down.',
      'Keep your elbows at your sides and curl the weight toward your shoulders.',
      'Squeeze at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'resistance-band-curl': {
    description: 'A bicep curl using a resistance band that provides increasing tension as the band stretches.',
    instructions: [
      'Stand on the centre of a resistance band and hold an end in each hand, palms facing forward.',
      'Keep your elbows at your sides and curl both hands toward your shoulders.',
      'Squeeze your biceps at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  // ── ARMS — TRICEPS (15) ─────────────────────────────────────────────────────

  'close-grip-bench-press': {
    description: 'A pressing exercise using a narrow grip on the barbell that shifts emphasis to the triceps.',
    instructions: [
      'Lie flat on a bench and grip the barbell with hands about shoulder-width apart or slightly closer.',
      'Unrack the bar and lower it to your mid-chest, keeping your elbows close to your sides.',
      'Press the bar back up until your arms are fully extended.',
      'Repeat for the desired number of reps.',
    ],
  },

  'skull-crusher': {
    description: 'A lying tricep extension where a barbell or EZ bar is lowered toward the forehead to target the triceps.',
    instructions: [
      'Lie on a flat bench holding a barbell or EZ bar above your chest with arms extended.',
      'Bend your elbows to lower the bar toward your forehead or just behind your head.',
      'Extend your elbows to press the bar back to the starting position.',
      'Repeat for the desired number of reps.',
    ],
  },

  'ez-bar-skull-crusher': {
    description: 'A skull crusher performed with an EZ curl bar for a more comfortable grip and wrist position.',
    instructions: [
      'Lie on a flat bench and hold an EZ bar above your chest with arms extended.',
      'Bend your elbows to lower the bar toward your forehead or just behind your head.',
      'Extend your elbows to return the bar to the starting position.',
      'Repeat for the desired number of reps.',
    ],
  },

  'dumbbell-overhead-tricep-extension': {
    description: 'A tricep extension with a dumbbell held overhead with both hands, targeting the long head of the tricep.',
    instructions: [
      'Stand or sit holding a single dumbbell with both hands above your head.',
      'Bend your elbows to lower the dumbbell behind your head.',
      'Extend your elbows to press the dumbbell back overhead.',
      'Repeat for the desired number of reps.',
    ],
  },

  'tricep-kickback': {
    description: 'A tricep isolation exercise extending the arm back from a hinged position with a dumbbell.',
    instructions: [
      'Hinge forward at the hips holding a dumbbell in one hand, with your upper arm parallel to the floor.',
      'Keep your upper arm still and straighten your elbow to extend the dumbbell behind you.',
      'Pause at full extension, then lower the dumbbell under control.',
      'Repeat for the desired reps, then switch arms.',
    ],
  },

  'cable-tricep-pushdown': {
    description: 'A tricep exercise at the cable machine pushing a bar or handle downward with the arms.',
    instructions: [
      'Stand at a high cable pulley and grip a straight bar or angled bar with an overhand grip.',
      'Keep your elbows at your sides and push the bar downward until your arms are fully extended.',
      'Squeeze your triceps at the bottom, then allow the bar to rise under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'cable-rope-pushdown': {
    description: 'A tricep pushdown using a rope attachment that allows the wrists to rotate at the bottom for a harder squeeze.',
    instructions: [
      'Stand at a high cable and grip the rope attachment with both hands, thumbs up.',
      'Keep your elbows at your sides and push the rope downward, spreading the ends apart at the bottom.',
      'Squeeze your triceps fully at the bottom, then let the rope rise under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'cable-overhead-tricep-extension': {
    description: 'A tricep extension using a cable set behind the body that targets the long head of the triceps.',
    instructions: [
      'Attach a rope to a high cable pulley and stand facing away from the machine.',
      'Hold the rope behind your head with both hands and elbows pointing forward.',
      'Extend your elbows to press the rope forward and up.',
      'Lower back to the starting position under control and repeat.',
    ],
  },

  'single-arm-cable-pushdown': {
    description: 'A unilateral tricep pushdown using a single cable handle for independent arm development.',
    instructions: [
      'Stand at a high cable pulley and grip a single handle with one hand.',
      'Keep your elbow at your side and push the handle downward until your arm is fully extended.',
      'Squeeze your tricep at the bottom, then return under control.',
      'Repeat for the desired reps, then switch arms.',
    ],
  },

  'machine-tricep-extension': {
    description: 'A tricep extension performed on a machine that guides the movement for isolated tricep loading.',
    instructions: [
      'Sit at the tricep extension machine and position your upper arms on the pad.',
      'Grip the handles and extend your elbows to push the handles downward or forward.',
      'Squeeze your triceps at full extension, then return under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'tricep-dip': {
    description: 'A bodyweight dip performed on parallel bars with an upright torso to emphasise the triceps.',
    instructions: [
      'Grip the parallel bars and support your bodyweight with arms extended and torso upright.',
      'Bend your elbows to lower yourself while keeping your body vertical.',
      'Lower until your upper arms are roughly parallel to the floor, then press back up.',
      'Repeat for the desired number of reps.',
    ],
  },

  'bench-dip': {
    description: 'A dip with hands on a bench and feet on the floor that uses bodyweight to target the triceps.',
    instructions: [
      'Sit on the edge of a bench with hands gripping the edge beside your hips.',
      'Slide your hips off the bench and lower yourself by bending your elbows.',
      'Press back up until your arms are extended.',
      'Repeat for the desired number of reps, keeping your back close to the bench.',
    ],
  },

  'diamond-push-up': {
    description: 'A push-up with hands forming a diamond shape beneath the chest to heavily target the triceps.',
    instructions: [
      'Start in a push-up position with your hands close together under your chest, forming a diamond shape.',
      'Lower your chest toward your hands, keeping your elbows close to your body.',
      'Press back up to the starting position.',
      'Repeat for the desired number of reps.',
    ],
  },

  'close-grip-push-up': {
    description: 'A push-up with a narrow hand position that increases tricep demand compared to a standard push-up.',
    instructions: [
      'Assume a push-up position with hands placed directly under your shoulders or slightly inside.',
      'Lower your chest toward the floor, keeping your elbows close to your sides.',
      'Push back up to the starting position.',
      'Repeat for the desired number of reps.',
    ],
  },

  'overhead-tricep-extension': {
    description: 'A tricep extension performed overhead with a dumbbell, barbell, or cable to target the long head.',
    instructions: [
      'Stand or sit holding a weight overhead with arms extended.',
      'Bend your elbows to lower the weight behind your head without moving your upper arms.',
      'Extend your elbows to return to the starting position.',
      'Repeat for the desired number of reps.',
    ],
  },

  // ── LEGS (40) ───────────────────────────────────────────────────────────────

  'back-squat': {
    description: 'The foundational barbell squat with the bar on the upper back, developing the quads, glutes, and overall leg strength.',
    instructions: [
      'Place the barbell on your upper back and stand with feet shoulder-width apart.',
      'Brace your core, take a breath, and squat down by pushing your knees out and sitting back.',
      'Descend until your thighs are at least parallel to the floor.',
      'Drive through your heels to stand back up and repeat.',
    ],
  },

  'front-squat': {
    description: 'A squat with the barbell held across the front of the shoulders that places greater emphasis on the quads.',
    instructions: [
      'Position the barbell in the front rack on your front deltoids, crossing your arms or using a clean grip.',
      'Stand with feet shoulder-width apart and squat down, keeping your torso as upright as possible.',
      'Descend until your thighs are parallel to the floor or below.',
      'Drive through your heels to stand and repeat.',
    ],
  },

  'goblet-squat': {
    description: 'A beginner-friendly squat holding a dumbbell or kettlebell at the chest that naturally encourages an upright torso.',
    instructions: [
      'Hold a kettlebell or dumbbell vertically at your chest with both hands.',
      'Stand with feet shoulder-width apart and toes slightly turned out.',
      'Squat down until your elbows touch the inside of your knees if possible.',
      'Drive through your heels to stand back up and repeat.',
    ],
  },

  'sumo-squat': {
    description: 'A squat with a wide stance and turned-out toes that emphasises the inner thighs and glutes.',
    instructions: [
      'Stand with feet significantly wider than shoulder-width and toes pointed well outward.',
      'Hold a dumbbell or kettlebell in front of you or place hands on your hips.',
      'Squat down, pushing your knees out in line with your toes.',
      'Drive through your heels to stand and repeat.',
    ],
  },

  'box-squat': {
    description: 'A squat that uses a box or bench as a target, teaching depth consistency and encouraging a more vertical shin.',
    instructions: [
      'Place a box or bench behind you and stand in your squat stance in front of it.',
      'Squat down by sitting back until you make contact with the box.',
      'Pause briefly on the box, then drive through your heels to stand.',
      'Repeat for the desired number of reps.',
    ],
  },

  'pause-squat': {
    description: 'A squat with a deliberate pause at the bottom position to eliminate stretch reflex and build strength from the hole.',
    instructions: [
      'Perform a back squat and descend to your normal depth.',
      'Pause at the bottom for 2–3 seconds without relaxing, keeping tension in your legs.',
      'Drive through your heels to stand and return to the starting position.',
      'Repeat for the desired number of reps.',
    ],
  },

  'overhead-squat': {
    description: 'An advanced squat holding a barbell locked out overhead that demands significant mobility and full-body stability.',
    instructions: [
      'Press or snatch a barbell overhead with a wide grip and lock your arms straight.',
      'Stand with feet shoulder-width apart and maintain the bar directly above your head.',
      'Squat down while keeping the bar stable overhead until your thighs are parallel.',
      'Stand back up and repeat with controlled, careful movement.',
    ],
  },

  'zercher-squat': {
    description: 'An unusual squat variation with the barbell held in the crooks of the elbows, demanding a very upright torso.',
    instructions: [
      'Lift the barbell from a rack into the crooks of your elbows, crossing your forearms.',
      'Stand with feet shoulder-width apart and hold the bar against your torso.',
      'Squat down while keeping your chest up and elbows lifted.',
      'Drive back up to standing and repeat.',
    ],
  },

  'hack-squat-barbell': {
    description: 'A barbell squat holding the bar behind the body at arm\'s length that targets the quads with an upright position.',
    instructions: [
      'Hold a barbell behind your legs at arm\'s length with an overhand grip.',
      'Stand with feet shoulder-width apart and squat down, keeping your torso upright.',
      'Descend until your thighs are parallel to the floor.',
      'Drive through your heels to stand and repeat.',
    ],
  },

  'hack-squat-machine': {
    description: 'A machine-based squat that guides the pressing path at an angle, emphasising the quads.',
    instructions: [
      'Position yourself on the hack squat machine with your back against the pad and shoulders under the handles.',
      'Release the safety and lower by bending your knees to the desired depth.',
      'Press through your heels to extend your legs back to the starting position.',
      'Repeat for the desired number of reps.',
    ],
  },

  'leg-press': {
    description: 'A machine-based pressing exercise that develops the quads, glutes, and hamstrings without spinal loading.',
    instructions: [
      'Sit in the leg press machine with your feet shoulder-width apart on the platform.',
      'Release the safety and lower the platform by bending your knees toward your chest.',
      'Press the platform away by extending your legs, stopping just short of locking your knees.',
      'Repeat for the desired number of reps.',
    ],
  },

  'smith-machine-squat': {
    description: 'A squat performed in the Smith machine with a guided bar path for stability.',
    instructions: [
      'Position the Smith machine bar on your upper back and stand with feet slightly forward.',
      'Unhook the bar and squat down until your thighs are parallel to the floor.',
      'Drive through your heels to stand and re-hook the bar at the end of the set.',
      'Repeat for the desired number of reps.',
    ],
  },

  'leg-extension': {
    description: 'An isolation exercise on a machine that extends the knee to target the quadriceps.',
    instructions: [
      'Sit in the leg extension machine with the pad against your lower shins.',
      'Extend your legs to lift the weight until your knees are straight.',
      'Pause at the top, then lower under control back to the starting position.',
      'Repeat for the desired number of reps.',
    ],
  },

  'sissy-squat': {
    description: 'A challenging quad isolation exercise leaning back and allowing the knees to travel forward without lifting the heels.',
    instructions: [
      'Stand with feet together and hold something for balance.',
      'Rise onto your toes and lean your torso back while bending your knees forward.',
      'Lower until your knees are close to the floor, feeling an intense quad stretch.',
      'Drive back up through your quads to the starting position and repeat.',
    ],
  },

  'bulgarian-split-squat': {
    description: 'A unilateral lower body exercise with the rear foot elevated on a bench, heavily loading the front leg.',
    instructions: [
      'Stand facing away from a bench and place the top of your rear foot on it.',
      'Hop your front foot forward to a comfortable distance.',
      'Lower your rear knee toward the floor by bending both knees.',
      'Drive through your front heel to return to the starting position and repeat, then switch legs.',
    ],
  },

  'split-squat': {
    description: 'A lunge-like movement with both feet stationary, working each leg independently for unilateral strength.',
    instructions: [
      'Stand in a staggered stance with one foot forward and one foot back.',
      'Lower your rear knee toward the floor by bending both knees.',
      'Keep your front knee tracking over your foot and torso upright.',
      'Press through your front heel to return to standing and repeat, then switch legs.',
    ],
  },

  'reverse-lunge': {
    description: 'A lunge stepping backward that reduces knee stress compared to a forward lunge.',
    instructions: [
      'Stand with feet together and step one foot back to a comfortable lunge length.',
      'Lower your rear knee toward the floor, keeping your front shin vertical.',
      'Push through your front heel to bring your rear foot back to the starting position.',
      'Repeat on the same leg or alternate legs for the desired reps.',
    ],
  },

  'forward-lunge': {
    description: 'A lunge stepping forward that builds unilateral leg strength and improves balance.',
    instructions: [
      'Stand with feet together and step one foot forward to a comfortable lunge length.',
      'Lower your rear knee toward the floor, keeping your front shin as vertical as possible.',
      'Push through your front heel to return to the starting position.',
      'Repeat on the same leg or alternate legs for the desired reps.',
    ],
  },

  'walking-lunge': {
    description: 'A dynamic lunge variation where you step forward continuously for distance or reps.',
    instructions: [
      'Stand with feet together and step forward with one foot into a lunge.',
      'Lower your rear knee close to the floor, then push off your rear foot to bring it forward into the next lunge.',
      'Continue walking forward for the desired distance or number of reps.',
      'Keep your torso upright throughout.',
    ],
  },

  'lateral-lunge': {
    description: 'A side-stepping lunge that targets the inner thigh and glutes through a lateral movement.',
    instructions: [
      'Stand with feet together and take a wide step out to one side.',
      'Shift your weight onto that leg and push your hips back as you bend the knee.',
      'Keep the opposite leg straight and your torso upright.',
      'Push back through your heel to return to standing, then repeat on the other side.',
    ],
  },

  'curtsy-lunge': {
    description: 'A lunge variation where the stepping leg crosses behind the body, targeting the glutes from a different angle.',
    instructions: [
      'Stand with feet hip-width apart and step one foot diagonally back behind and across your other leg.',
      'Lower your rear knee toward the floor as in a standard lunge.',
      'Drive through your front heel to return to standing.',
      'Repeat on the same leg or alternate sides for the desired reps.',
    ],
  },

  'step-up': {
    description: 'A unilateral exercise stepping up onto a box or bench to develop leg strength and stability.',
    instructions: [
      'Stand in front of a box or bench and place one foot fully on the surface.',
      'Drive through your raised heel to step up and bring your trailing foot to meet it.',
      'Step back down with the same foot and lower the other foot to the floor.',
      'Repeat on the same leg or alternate for the desired reps.',
    ],
  },

  'barbell-lunge': {
    description: 'A lunge performed with a barbell on the back for added resistance to challenge leg strength.',
    instructions: [
      'Place the barbell on your upper back as in a squat.',
      'Step forward or backward into a lunge, lowering your rear knee toward the floor.',
      'Drive through your front heel to return to standing.',
      'Repeat on the same leg or alternate for the desired reps.',
    ],
  },

  'romanian-deadlift': {
    description: 'A hip hinge movement with a barbell targeting the hamstrings and glutes without the bar touching the floor.',
    instructions: [
      'Stand holding a barbell at hip height with feet hip-width apart.',
      'Hinge at the hips and lower the bar along your legs, keeping your back flat.',
      'Lower until you feel a good stretch in your hamstrings, typically around mid-shin.',
      'Drive your hips forward to return to standing and repeat.',
    ],
  },

  'dumbbell-rdl': {
    description: 'A Romanian deadlift performed with dumbbells for a more natural grip position and similar hamstring focus.',
    instructions: [
      'Stand holding a dumbbell in each hand in front of your thighs.',
      'Hinge at the hips and lower the dumbbells along your legs, keeping your back flat.',
      'Lower until you feel a stretch in your hamstrings, then drive your hips forward to stand.',
      'Repeat for the desired number of reps.',
    ],
  },

  'stiff-leg-deadlift': {
    description: 'A deadlift variation with straighter legs than the RDL, emphasising the lower hamstrings through greater range of motion.',
    instructions: [
      'Hold a barbell or dumbbells and stand with a slight bend in your knees.',
      'Hinge at the hips and lower the weight close to your legs with minimal knee bend.',
      'Lower until you feel a strong hamstring stretch, then stand by driving your hips forward.',
      'Repeat for the desired number of reps.',
    ],
  },

  'lying-leg-curl': {
    description: 'A hamstring isolation exercise performed lying face down on a leg curl machine.',
    instructions: [
      'Lie face down on the leg curl machine and position the pad against the back of your ankles.',
      'Curl your legs upward toward your glutes against the resistance.',
      'Squeeze your hamstrings at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'seated-leg-curl': {
    description: 'A hamstring isolation exercise performed sitting on a leg curl machine.',
    instructions: [
      'Sit on the leg curl machine with the top pad resting on your thighs and the ankle pad behind your ankles.',
      'Curl your legs downward against the resistance.',
      'Squeeze your hamstrings at the bottom, then return under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'nordic-hamstring-curl': {
    description: 'An advanced bodyweight hamstring exercise resisting gravity as you lower your torso toward the floor.',
    instructions: [
      'Kneel on a mat with your ankles secured under something fixed or held by a partner.',
      'Keeping your body straight from knee to head, slowly lower your torso toward the floor.',
      'Resist the descent as long as possible, then catch yourself and push back up.',
      'Repeat for the desired number of reps.',
    ],
  },

  'glute-ham-raise': {
    description: 'An advanced exercise on a GHD machine that works the hamstrings and glutes together.',
    instructions: [
      'Position yourself on the GHD machine with your thighs on the pad and feet secured.',
      'Lower your torso toward the floor until your body is roughly parallel to the ground.',
      'Use your hamstrings and glutes to pull your torso back upright.',
      'Repeat for the desired number of reps.',
    ],
  },

  'calf-raise': {
    description: 'A bodyweight or weighted exercise rising onto the toes to target the gastrocnemius and soleus.',
    instructions: [
      'Stand with the balls of your feet on an elevated surface such as a step or plate.',
      'Lower your heels below the step until you feel a stretch in your calves.',
      'Rise up as high as possible onto your toes, squeezing your calves at the top.',
      'Lower under control and repeat.',
    ],
  },

  'seated-calf-raise': {
    description: 'A calf raise performed seated on a machine that isolates the soleus more than the standing version.',
    instructions: [
      'Sit at the seated calf raise machine with the pad resting on your lower thighs and balls of your feet on the platform.',
      'Lower your heels toward the floor to feel a stretch in your calves.',
      'Rise as high as possible onto your toes, squeezing your calves at the top.',
      'Lower under control and repeat.',
    ],
  },

  'leg-press-calf-raise': {
    description: 'A calf raise performed on the leg press machine using the platform for resistance.',
    instructions: [
      'Sit in the leg press machine with the balls of your feet at the bottom of the platform.',
      'Keep your legs nearly straight and lower the platform by pointing your toes away.',
      'Push through the balls of your feet to raise the platform by extending your ankles.',
      'Lower under control and repeat.',
    ],
  },

  'single-leg-calf-raise': {
    description: 'A unilateral calf raise that allows greater range of motion and corrects strength imbalances between legs.',
    instructions: [
      'Stand on one foot with the ball of your foot on an elevated surface.',
      'Lower your heel as far as possible to stretch the calf.',
      'Rise as high as possible onto your toes, squeezing your calf at the top.',
      'Lower under control and repeat, then switch legs.',
    ],
  },

  'single-leg-press': {
    description: 'A leg press performed one leg at a time to address strength imbalances and increase unilateral demand.',
    instructions: [
      'Sit in the leg press machine and place one foot in the centre of the platform.',
      'Lower the platform by bending your knee toward your chest.',
      'Press through your heel to extend your leg and push the platform away.',
      'Repeat for the desired reps, then switch legs.',
    ],
  },

  'wall-sit': {
    description: 'A static isometric exercise holding a seated position against a wall to develop quad endurance.',
    instructions: [
      'Stand with your back flat against a wall and walk your feet forward.',
      'Slide down until your thighs are parallel to the floor and your knees are at 90 degrees.',
      'Hold this position for the desired duration while breathing normally.',
      'Stand up at the end of the set.',
    ],
  },

  'jump-squat': {
    description: 'An explosive squat variation jumping out of the bottom position to develop lower body power.',
    instructions: [
      'Stand with feet shoulder-width apart and perform a squat to at least parallel.',
      'From the bottom of the squat, explode upward and jump as high as possible.',
      'Land softly with bent knees to absorb the impact.',
      'Immediately descend into the next squat and repeat.',
    ],
  },

  'landmine-squat': {
    description: 'A squat using the landmine attachment where the bar is held at the chest, encouraging an upright torso.',
    instructions: [
      'Load one end of a barbell into a landmine attachment and hold the sleeve end at chest height.',
      'Stand with feet shoulder-width apart and squat down, keeping the bar close.',
      'Descend until your thighs are parallel to the floor, then drive back up.',
      'Repeat for the desired number of reps.',
    ],
  },

  'resistance-band-squat': {
    description: 'A squat performed with a resistance band to add accommodating resistance that increases as you stand.',
    instructions: [
      'Step on the centre of a resistance band with feet shoulder-width apart and hold the ends at your shoulders.',
      'Squat down to parallel, keeping your knees in line with your toes.',
      'Drive back up through your heels against the band\'s resistance.',
      'Repeat for the desired number of reps.',
    ],
  },

  'trap-bar-jump': {
    description: 'An explosive jump exercise using a trap bar to develop lower body power safely.',
    instructions: [
      'Step inside a loaded trap bar and grip the handles, lowering into a partial squat.',
      'Explosively drive through your legs and jump as high as possible while holding the bar.',
      'Land softly with bent knees and immediately reset for the next rep.',
      'Repeat for the desired number of reps.',
    ],
  },

  // ── GLUTES (20) ─────────────────────────────────────────────────────────────

  'barbell-hip-thrust': {
    description: 'A primary glute exercise driving the hips upward with a barbell across the hips and shoulders on a bench.',
    instructions: [
      'Sit with your upper back against a bench and a padded barbell resting across your hips.',
      'Plant your feet hip-width apart with knees at 90 degrees.',
      'Drive your hips upward by squeezing your glutes until your body forms a straight line.',
      'Lower under control and repeat.',
    ],
  },

  'dumbbell-hip-thrust': {
    description: 'A hip thrust using a dumbbell instead of a barbell for a more accessible loading option.',
    instructions: [
      'Sit with your upper back against a bench and a dumbbell resting across your hips.',
      'Plant your feet hip-width apart with knees at 90 degrees.',
      'Drive your hips upward by squeezing your glutes until your body is flat.',
      'Lower under control and repeat.',
    ],
  },

  'single-leg-hip-thrust': {
    description: 'A unilateral hip thrust performed one leg at a time to isolate each glute and correct imbalances.',
    instructions: [
      'Sit with your upper back against a bench and extend one leg out straight.',
      'Drive your hips upward using only the grounded leg, squeezing the glute at the top.',
      'Keep your hips level and avoid rotating.',
      'Lower under control and repeat, then switch legs.',
    ],
  },

  'glute-bridge': {
    description: 'A floor-based hip movement that targets the glutes and hamstrings without a bench.',
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Drive your heels into the floor and raise your hips toward the ceiling by squeezing your glutes.',
      'Hold briefly at the top, then lower your hips under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'weighted-glute-bridge': {
    description: 'A glute bridge with added weight such as a barbell or dumbbell placed on the hips.',
    instructions: [
      'Lie on your back with knees bent and a weight resting across your hips.',
      'Drive your heels into the floor and raise your hips toward the ceiling.',
      'Squeeze your glutes fully at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'banded-glute-bridge': {
    description: 'A glute bridge with a resistance band above the knees that activates the hip abductors alongside the glutes.',
    instructions: [
      'Lie on your back with knees bent and a resistance band just above your knees.',
      'Drive your heels into the floor and raise your hips, pushing your knees slightly outward against the band.',
      'Squeeze your glutes at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'cable-kickback': {
    description: 'A glute isolation exercise extending the leg behind the body against cable resistance.',
    instructions: [
      'Attach an ankle cuff to a low cable and fasten it to your ankle.',
      'Stand facing the machine and hold the frame for balance.',
      'Extend your leg behind you, squeezing your glute at the top.',
      'Return under control and repeat, then switch legs.',
    ],
  },

  'donkey-kickback': {
    description: 'A glute exercise on hands and knees driving the heel toward the ceiling.',
    instructions: [
      'Begin on hands and knees with your back flat.',
      'Keeping your knee bent at 90 degrees, raise one leg behind you until your thigh is parallel to the floor.',
      'Squeeze your glute at the top, then lower under control.',
      'Repeat for the desired reps, then switch legs.',
    ],
  },

  'machine-glute-kickback': {
    description: 'A glute extension performed on a dedicated machine that isolates the glute through a guided kickback motion.',
    instructions: [
      'Position yourself on the machine with your hip against the pad and foot on the kicking platform.',
      'Extend your leg back by squeezing your glute to press the platform away.',
      'Pause at full extension, then return under control.',
      'Repeat for the desired reps, then switch legs.',
    ],
  },

  'hip-abduction-machine': {
    description: 'A machine exercise that pushes the legs apart to target the outer glutes and hip abductors.',
    instructions: [
      'Sit in the hip abduction machine with pads against the outside of your knees.',
      'Push your knees outward against the pads as wide as possible.',
      'Squeeze your outer glutes at the end of the movement.',
      'Return under control to the starting position and repeat.',
    ],
  },

  'seated-hip-abduction': {
    description: 'A hip abduction exercise performed seated using a band or machine to target the outer glutes.',
    instructions: [
      'Sit on a bench with a resistance band looped just above your knees.',
      'Push both knees outward as far as possible against the band\'s resistance.',
      'Hold briefly at the end, then return to the starting position under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'cable-hip-abduction': {
    description: 'A standing hip abduction using a cable machine that provides constant tension on the outer glutes.',
    instructions: [
      'Attach a cuff to a low cable and fasten it to your ankle.',
      'Stand sideways to the machine and lift your leg out to the side against the cable resistance.',
      'Squeeze your outer glute at the top of the movement.',
      'Return under control and repeat, then switch sides.',
    ],
  },

  'banded-hip-abduction': {
    description: 'A resistance band hip abduction exercise targeting the outer glutes and hip stabilisers.',
    instructions: [
      'Stand with a resistance band looped just above your knees.',
      'Shift your weight onto one leg and lift the other leg out to the side against the band.',
      'Squeeze your outer glute at the top, then lower under control.',
      'Repeat for the desired reps, then switch sides.',
    ],
  },

  'single-leg-rdl': {
    description: 'A Romanian deadlift on one leg that targets the hamstrings and glutes while developing balance.',
    instructions: [
      'Stand on one leg holding a dumbbell or barbell.',
      'Hinge at the hip and lower the weight toward the floor while extending the free leg behind you.',
      'Lower until your torso is roughly parallel to the floor, then drive your hip forward to stand.',
      'Repeat for the desired reps, then switch legs.',
    ],
  },

  'frog-pump': {
    description: 'A glute activation exercise lying on your back with the soles of your feet together, pumping the hips upward.',
    instructions: [
      'Lie on your back and bring the soles of your feet together, letting your knees fall out to the sides.',
      'Drive your hips toward the ceiling by squeezing your glutes.',
      'Hold briefly at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'smith-machine-hip-thrust': {
    description: 'A hip thrust using the Smith machine for stable, controllable loading of the glutes.',
    instructions: [
      'Position a bench under the Smith machine and sit with your upper back against it.',
      'Set the bar to rest across your hips with a pad for comfort and plant your feet.',
      'Drive your hips upward, squeezing your glutes until your body is flat.',
      'Lower under control and repeat.',
    ],
  },

  'lateral-band-walk': {
    description: 'A banded exercise stepping sideways against resistance to activate the hip abductors and outer glutes.',
    instructions: [
      'Place a resistance band just above your knees and stand with feet shoulder-width apart.',
      'Keep your knees slightly bent and step to one side while maintaining tension in the band.',
      'Bring the trailing foot in to reduce the gap, then take another step in the same direction.',
      'After the desired reps, repeat in the opposite direction.',
    ],
  },

  'monster-walk': {
    description: 'A resistance band exercise walking forward and backward in a wide stance to activate the glutes and hips.',
    instructions: [
      'Place a resistance band just above your knees and stand in a wide, semi-squat stance.',
      'Take forward steps diagonally, keeping your knees pushed outward against the band.',
      'Walk backward in the same fashion to return to the starting point.',
      'Continue for the desired number of steps.',
    ],
  },

  'resistance-band-hip-thrust': {
    description: 'A hip thrust with a resistance band across the hips providing accommodating resistance.',
    instructions: [
      'Sit with your upper back against a bench and a resistance band anchored in front of you across your hips.',
      'Plant your feet hip-width apart with knees bent.',
      'Drive your hips upward by squeezing your glutes against the band\'s resistance.',
      'Lower under control and repeat.',
    ],
  },

  'prone-leg-curl': {
    description: 'A hamstring curl performed face down on a bench or machine, also working the glutes.',
    instructions: [
      'Lie face down on a leg curl machine or bench with the pad behind your ankles.',
      'Curl your legs upward toward your glutes against the resistance.',
      'Squeeze your hamstrings at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  // ── CORE (27) ───────────────────────────────────────────────────────────────

  'crunch': {
    description: 'A core exercise curling the upper body toward the knees from a lying position to target the rectus abdominis.',
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Place your hands lightly behind your head or crossed on your chest.',
      'Curl your shoulders up toward your knees, contracting your abs.',
      'Lower under control and repeat without letting your head drop to the floor between reps.',
    ],
  },

  'sit-up': {
    description: 'A core exercise sitting fully upright from a lying position, working the hip flexors and abs together.',
    instructions: [
      'Lie on your back with knees bent, feet anchored, and hands crossed on your chest or behind your head.',
      'Lift your torso all the way up until your elbows meet your knees.',
      'Lower back down under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'weighted-sit-up': {
    description: 'A sit-up performed while holding a weight plate or dumbbell to increase core resistance.',
    instructions: [
      'Lie on your back with knees bent and hold a weight plate at your chest or overhead.',
      'Lift your torso fully upright as in a standard sit-up.',
      'Lower back down under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'decline-sit-up': {
    description: 'A sit-up performed on a decline bench that increases the range of motion and difficulty.',
    instructions: [
      'Secure your feet on a decline bench and lie back.',
      'Place your hands behind your head or on your chest.',
      'Sit fully upright by contracting your abs and hip flexors.',
      'Lower back under control and repeat.',
    ],
  },

  'bicycle-crunch': {
    description: 'A rotational crunch alternating elbow-to-opposite-knee to target the obliques and rectus abdominis.',
    instructions: [
      'Lie on your back with hands behind your head and legs raised, knees bent at 90 degrees.',
      'Bring one knee toward your chest while rotating the opposite elbow toward it.',
      'Simultaneously extend the other leg.',
      'Switch sides in a pedalling motion and continue alternating.',
    ],
  },

  'reverse-crunch': {
    description: 'A core exercise lifting the hips and knees toward the chest to target the lower abs.',
    instructions: [
      'Lie on your back with knees bent at 90 degrees and arms flat on the floor.',
      'Lift your hips and draw your knees toward your chest.',
      'Pause briefly at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'leg-raise': {
    description: 'A core exercise raising straight legs from a lying position to target the lower abs and hip flexors.',
    instructions: [
      'Lie flat on your back with legs extended and hands under your hips or at your sides.',
      'Keeping your legs straight, raise them to 90 degrees.',
      'Lower them under control without letting your heels touch the floor.',
      'Repeat for the desired number of reps.',
    ],
  },

  'hanging-leg-raise': {
    description: 'A core exercise hanging from a bar and raising straight legs to target the lower abs.',
    instructions: [
      'Hang from a pull-up bar with a shoulder-width grip.',
      'Keeping your legs straight, raise them in front of you to at least hip height.',
      'Lower them under control without swinging.',
      'Repeat for the desired number of reps.',
    ],
  },

  'hanging-knee-raise': {
    description: 'A modified hanging leg raise bringing the knees up toward the chest for an easier variation.',
    instructions: [
      'Hang from a pull-up bar with a shoulder-width grip.',
      'Draw your knees up toward your chest by contracting your abs.',
      'Lower your legs under control without swinging.',
      'Repeat for the desired number of reps.',
    ],
  },

  'ab-wheel-rollout': {
    description: 'A challenging core exercise rolling an ab wheel forward from kneeling to full extension and back.',
    instructions: [
      'Kneel on the floor and grip the ab wheel handles.',
      'Roll the wheel forward, extending your hips and arms while keeping your core braced.',
      'Extend as far as you can while maintaining a flat back.',
      'Pull the wheel back to the starting position and repeat.',
    ],
  },

  'cable-crunch': {
    description: 'A weighted crunch using a rope cable attachment to add resistance to the crunch movement.',
    instructions: [
      'Kneel in front of a high cable pulley and hold the rope with both hands behind your head.',
      'Crunch downward, bringing your elbows toward your knees.',
      'Squeeze your abs at the bottom, then return under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'cable-woodchop': {
    description: 'A rotational core exercise pulling a cable in a diagonal chopping motion to target the obliques.',
    instructions: [
      'Set the cable to a high position and stand sideways to the machine, holding the handle with both hands.',
      'Pull the handle diagonally downward and across your body by rotating your torso.',
      'Follow through until your hands reach the opposite hip area.',
      'Return slowly to the starting position and repeat, then switch sides.',
    ],
  },

  'machine-crunch': {
    description: 'A crunch exercise performed on a dedicated abs machine with guided resistance.',
    instructions: [
      'Sit at the crunch machine and hold the handles with your elbows on the pads.',
      'Crunch forward by contracting your abs to pull the weight down.',
      'Squeeze your abs at the bottom, then return under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  'plank': {
    description: 'An isometric core exercise holding a rigid body position supported on the forearms and toes.',
    instructions: [
      'Lie face down and place your forearms on the floor with elbows under your shoulders.',
      'Lift your hips to form a straight line from head to heels.',
      'Keep your core braced, glutes squeezed, and breathe normally.',
      'Hold for the desired duration.',
    ],
  },

  'side-plank': {
    description: 'An isometric exercise working the obliques by holding a rigid body position supported on one forearm and feet.',
    instructions: [
      'Lie on your side and place your forearm on the floor with your elbow under your shoulder.',
      'Lift your hips to form a straight line from head to feet.',
      'Keep your body stacked and breathe normally.',
      'Hold for the desired duration, then switch sides.',
    ],
  },

  'hollow-body-hold': {
    description: 'A gymnastics-based core exercise pressing the lower back to the floor while raising the arms and legs slightly.',
    instructions: [
      'Lie on your back and extend your arms overhead and legs straight.',
      'Press your lower back firmly into the floor.',
      'Raise your arms, shoulders, and legs slightly off the floor to create a hollow shape.',
      'Hold while breathing normally for the desired duration.',
    ],
  },

  'dead-bug': {
    description: 'A core stability exercise extending opposite arm and leg while keeping the lower back pressed to the floor.',
    instructions: [
      'Lie on your back with arms extended toward the ceiling and knees bent at 90 degrees.',
      'Press your lower back into the floor and brace your core.',
      'Slowly lower one arm overhead while extending the opposite leg toward the floor.',
      'Return to the starting position and repeat on the opposite side.',
    ],
  },

  'russian-twist': {
    description: 'A rotational core exercise twisting the torso from side to side while seated with feet raised.',
    instructions: [
      'Sit on the floor with knees bent, feet raised slightly, and torso leaned back at 45 degrees.',
      'Hold your hands together or grip a weight.',
      'Rotate your torso to one side, then the other in a controlled twisting motion.',
      'Continue alternating for the desired number of reps.',
    ],
  },

  'oblique-crunch': {
    description: 'A crunch with a lateral component targeting the oblique muscles on the side of the torso.',
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Place one hand behind your head and the other flat on the floor.',
      'Crunch upward and to the side, bringing your elbow toward the opposite knee.',
      'Lower under control and repeat, then switch sides.',
    ],
  },

  'pallof-press': {
    description: 'An anti-rotation cable core exercise pressing a handle away from the body while resisting rotational forces.',
    instructions: [
      'Stand sideways to a cable machine set at chest height and hold the handle at your chest.',
      'Brace your core and press the handle straight out in front of you.',
      'Hold for a second, then return the handle to your chest.',
      'Repeat for the desired reps, then switch sides.',
    ],
  },

  'landmine-rotation': {
    description: 'A rotational core exercise using the landmine that builds oblique strength through a wide swinging arc.',
    instructions: [
      'Stand holding the barbell sleeve end with both hands in front of your chest.',
      'Rotate your torso and swing the bar to one side in an arc while keeping arms extended.',
      'Rotate back through centre and continue to the other side.',
      'Continue rotating alternately for the desired number of reps.',
    ],
  },

  'dragon-flag': {
    description: 'An advanced core exercise lowering a rigid body from vertical to near-horizontal while gripping a bench.',
    instructions: [
      'Lie on a bench and grip the edges above your head for stability.',
      'Press your shoulder blades into the bench and raise your legs and hips to form a vertical line.',
      'Lower your body in a rigid line toward the bench as slowly as possible.',
      'Return to vertical under control and repeat.',
    ],
  },

  'v-up': {
    description: 'A core exercise simultaneously raising the arms and legs to meet in the middle in a V shape.',
    instructions: [
      'Lie flat on your back with arms extended overhead and legs straight.',
      'Simultaneously raise your arms and legs to meet above your hips.',
      'Reach your hands toward your toes at the top.',
      'Lower back to the floor under control and repeat.',
    ],
  },

  'flutter-kick': {
    description: 'A core and hip flexor exercise alternating small leg kicks from a lying position.',
    instructions: [
      'Lie on your back with legs extended and hands under your hips.',
      'Raise both legs slightly off the floor.',
      'Alternate kicking your legs up and down in small rapid movements.',
      'Continue for the desired duration while keeping your lower back pressed to the floor.',
    ],
  },

  'copenhagen-plank': {
    description: 'An advanced adductor and oblique exercise performing a side plank with the top foot on an elevated surface.',
    instructions: [
      'Position your body in a side plank with your upper foot resting on a bench.',
      'Lift your lower leg to meet the upper leg or let it hang for an easier version.',
      'Hold your body in a rigid straight line while engaging your adductors.',
      'Hold for the desired duration, then switch sides.',
    ],
  },

  'stir-the-pot': {
    description: 'A core stability exercise performing circular arm movements on a stability ball from a plank position.',
    instructions: [
      'Kneel behind a stability ball and place your forearms on it, extending into a plank position.',
      'While maintaining a rigid body, use your forearms to stir circles on the ball.',
      'Keep your hips level and core braced throughout.',
      'Continue for the desired duration or number of circles in each direction.',
    ],
  },

  'toe-touch-crunch': {
    description: 'A crunch reaching the hands up toward the toes with legs raised to intensify upper ab contraction.',
    instructions: [
      'Lie on your back and raise your legs straight toward the ceiling.',
      'Raise your arms toward the ceiling and crunch upward, reaching your hands toward your toes.',
      'Squeeze your abs fully at the top, then lower under control.',
      'Repeat for the desired number of reps.',
    ],
  },

  // ── FULL BODY (22) ──────────────────────────────────────────────────────────

  'power-clean': {
    description: 'An Olympic lifting movement pulling the barbell from the floor to the front rack position in one explosive motion.',
    instructions: [
      'Stand with feet hip-width apart and grip the bar just outside your legs.',
      'Drive through your legs and extend your hips explosively to pull the bar upward.',
      'As the bar reaches hip height, drop under it by pulling your elbows through to catch in a front rack.',
      'Stand upright to complete the lift and lower the bar back to the floor.',
    ],
  },

  'hang-power-clean': {
    description: 'A power clean performed from the hanging position above the knee, focusing on the explosive hip extension.',
    instructions: [
      'Hold the barbell at hip or knee height with a clean grip.',
      'Hinge slightly and then explode through your hips to pull the bar upward.',
      'Drop under the bar and catch it in a partial front squat position.',
      'Stand upright to complete the lift and reset to the hang position.',
    ],
  },

  'hang-power-snatch': {
    description: 'An explosive pulling movement from the hang position catching the bar overhead with arms locked out.',
    instructions: [
      'Hold the barbell at hip or knee height with a wide snatch grip.',
      'Explode through your hips and pull the bar upward close to your body.',
      'Drop under the bar and catch it overhead with arms locked out in a partial squat.',
      'Stand upright to complete the lift.',
    ],
  },

  'clean-and-jerk': {
    description: 'A two-part Olympic lift pulling the bar to the shoulders and then pressing it overhead.',
    instructions: [
      'Perform a power or full clean to bring the bar to the front rack on your shoulders.',
      'Dip your knees slightly and explosively drive upward to press the bar overhead.',
      'Split or press your feet into position as the bar rises and lock your arms out.',
      'Stand with the bar locked overhead to complete the lift.',
    ],
  },

  'barbell-snatch': {
    description: 'An Olympic lifting movement pulling the barbell from the floor to overhead in one continuous explosive motion.',
    instructions: [
      'Grip the bar very wide and stand with feet hip-width apart.',
      'Explosively pull the bar from the floor, extending through the hips and shrugging.',
      'Drop under the bar in a squat while receiving it overhead with arms locked out.',
      'Stand upright to complete the lift.',
    ],
  },

  'thruster': {
    description: 'A combination front squat and overhead press performed in one fluid movement for full body conditioning.',
    instructions: [
      'Hold the barbell or dumbbells in the front rack position at shoulder height.',
      'Squat down until your thighs are parallel to the floor.',
      'Explosively drive up and use the momentum to press the bar overhead.',
      'Lock out your arms overhead, then bring the bar back to the rack and repeat.',
    ],
  },

  'dumbbell-thruster': {
    description: 'A thruster variation using dumbbells that allows more natural hand positioning.',
    instructions: [
      'Hold a dumbbell in each hand at shoulder height.',
      'Squat down until your thighs are parallel to the floor.',
      'Drive upward explosively and use the momentum to press both dumbbells overhead.',
      'Lower the dumbbells back to shoulder height and immediately squat into the next rep.',
    ],
  },

  'burpee': {
    description: 'A high-intensity full body exercise combining a squat, push-up, and jump.',
    instructions: [
      'Stand upright, then squat down and place your hands on the floor.',
      'Jump or step your feet back into a push-up position.',
      'Perform one push-up, then jump your feet back toward your hands.',
      'Stand and jump upward, clapping overhead, then repeat.',
    ],
  },

  'turkish-get-up': {
    description: 'A full body exercise moving from lying flat on the floor to standing while holding a kettlebell overhead.',
    instructions: [
      'Lie on your back holding a kettlebell in one hand with your arm extended toward the ceiling.',
      'Roll onto your elbow, then push onto your hand while sweeping the opposite leg under your body.',
      'Rise to a kneeling position, then stand upright while keeping the kettlebell locked overhead.',
      'Reverse each step to return to the floor and repeat.',
    ],
  },

  'kettlebell-swing': {
    description: 'A dynamic hip hinge using a kettlebell to develop explosive power in the posterior chain.',
    instructions: [
      'Stand with feet shoulder-width apart and the kettlebell on the floor in front of you.',
      'Hike the kettlebell back between your legs, hinging at the hips with a flat back.',
      'Drive your hips explosively forward to swing the kettlebell up to chest or eye height.',
      'Let it swing back between your legs and repeat in a continuous motion.',
    ],
  },

  'kettlebell-clean': {
    description: 'A pulling movement bringing the kettlebell from a swing position to the rack position at the shoulder.',
    instructions: [
      'Start with the kettlebell on the floor in front of you and grip the handle.',
      'Hike it back between your legs and then drive your hips forward explosively.',
      'Guide the kettlebell in a tight arc to land softly in the rack position at your shoulder.',
      'Lower it back and repeat.',
    ],
  },

  'kettlebell-snatch': {
    description: 'An explosive kettlebell exercise pulling the bell from a swing and locking it out overhead in one motion.',
    instructions: [
      'Begin with the kettlebell on the floor and grip it with one hand.',
      'Hike it between your legs and explosively drive your hips forward.',
      'Guide the kettlebell overhead in an arc, punching your arm up to receive it locked out at the top.',
      'Lower it under control and repeat.',
    ],
  },

  'medicine-ball-slam': {
    description: 'A power exercise slamming a medicine ball into the floor with full force from overhead.',
    instructions: [
      'Stand with feet shoulder-width apart holding a medicine ball overhead.',
      'Brace your core and slam the ball into the floor as hard as possible.',
      'Catch the ball on the bounce or pick it up, then lift it overhead again.',
      'Repeat for the desired number of reps.',
    ],
  },

  'medicine-ball-wall-ball': {
    description: 'A squat-and-throw combination exercise throwing a medicine ball against a target on a wall.',
    instructions: [
      'Stand facing a wall about one metre away holding the medicine ball at chest height.',
      'Squat down until your thighs are parallel to the floor.',
      'Drive upward explosively and throw the ball to a target high on the wall.',
      'Catch the ball and immediately descend into the next squat.',
    ],
  },

  'box-jump': {
    description: 'An explosive plyometric exercise jumping onto a box from a standing position to develop lower body power.',
    instructions: [
      'Stand facing a box with feet shoulder-width apart.',
      'Swing your arms and bend your knees slightly, then jump explosively onto the box.',
      'Land softly with both feet on the box, absorbing the impact through bent knees.',
      'Step down carefully and repeat.',
    ],
  },

  'broad-jump': {
    description: 'An explosive horizontal jump for distance, developing lower body power through a powerful push-off.',
    instructions: [
      'Stand with feet shoulder-width apart and swing your arms back.',
      'Explosively swing your arms forward and jump as far forward as possible.',
      'Land softly on both feet with bent knees to absorb the impact.',
      'Reset and repeat for the desired number of jumps.',
    ],
  },

  'man-maker': {
    description: 'A complex dumbbell exercise combining a push-up, rows, and a squat clean and press.',
    instructions: [
      'Hold a dumbbell in each hand and begin in a push-up position.',
      'Perform one push-up, then row one dumbbell to your hip, then the other.',
      'Jump your feet toward your hands, then perform a squat clean and press.',
      'Lower the dumbbells and repeat the sequence.',
    ],
  },

  'devils-press': {
    description: 'A challenging combination of a dumbbell burpee followed by a swing bringing the dumbbells overhead.',
    instructions: [
      'Hold a dumbbell in each hand and perform a burpee, placing the dumbbells on the floor.',
      'As you return to standing, swing both dumbbells out and up in an arc to overhead.',
      'Lock out your arms overhead, then lower the dumbbells and repeat.',
      'Continue for the desired number of reps.',
    ],
  },

  'sandbag-clean': {
    description: 'A full body pulling movement lifting a sandbag from the floor to the shoulder in one explosive motion.',
    instructions: [
      'Stand over a sandbag with feet shoulder-width apart.',
      'Grip the bag firmly and explosively drive your hips to pull it upward.',
      'Guide it to rest on one or both shoulders by dropping under and rotating.',
      'Lower the bag and repeat.',
    ],
  },

  'battle-rope-slam': {
    description: 'A high-intensity power exercise slamming battle ropes into the ground repeatedly to build upper body and core endurance.',
    instructions: [
      'Stand with feet shoulder-width apart holding the ends of the battle ropes.',
      'Raise both ropes overhead by extending your arms.',
      'Slam the ropes down forcefully into the floor.',
      'Immediately raise them again and repeat as fast as possible.',
    ],
  },

  'sandbag-squat': {
    description: 'A squat performed holding a sandbag at the chest or on the shoulders to develop leg strength with an unstable load.',
    instructions: [
      'Hold a sandbag at chest height or across the shoulders and stand with feet shoulder-width apart.',
      'Brace your core and squat down until your thighs are at least parallel to the floor.',
      'Drive through your heels to stand back up.',
      'Repeat for the desired number of reps.',
    ],
  },

  'dumbbell-complex': {
    description: 'A sequence of multiple dumbbell exercises performed back to back without rest to challenge endurance and strength.',
    instructions: [
      'Choose a set of dumbbells and a sequence of 4–6 exercises such as curl, press, row, and squat.',
      'Perform a set number of reps of the first exercise, then immediately move to the next without resting.',
      'Complete the full sequence before resting.',
      'Repeat for the desired number of rounds.',
    ],
  },

  // ── CONDITIONING (19) ───────────────────────────────────────────────────────

  'farmers-carry': {
    description: 'A loaded carry exercise walking a distance with heavy weights in each hand to develop grip, core, and overall strength.',
    instructions: [
      'Pick up a heavy dumbbell, kettlebell, or farmer\'s carry handle in each hand.',
      'Stand tall with shoulders back and walk forward at a controlled pace.',
      'Keep your core braced and avoid leaning to either side.',
      'Walk the desired distance or for the desired time.',
    ],
  },

  'suitcase-carry': {
    description: 'A unilateral carry exercise holding a heavy weight in one hand that challenges anti-lateral flexion core stability.',
    instructions: [
      'Pick up a heavy dumbbell, kettlebell, or handle in one hand.',
      'Stand tall and walk forward, resisting the urge to lean toward the weighted side.',
      'Keep your core braced and shoulders level.',
      'Walk the desired distance, then switch sides.',
    ],
  },

  'overhead-carry': {
    description: 'A loaded carry with weight held overhead that challenges shoulder stability and core strength.',
    instructions: [
      'Press a dumbbell or kettlebell overhead and lock your arm straight.',
      'Stand tall and walk forward, keeping the weight stable directly above your shoulder.',
      'Keep your core braced and your arm locked out throughout.',
      'Walk the desired distance, then switch sides.',
    ],
  },

  'yoke-carry': {
    description: 'A strongman-style carry using a yoke loaded on the upper back for maximum lower body and core loading.',
    instructions: [
      'Step under the yoke and position it across your upper back.',
      'Lift the yoke by standing upright, taking short, quick steps.',
      'Walk the desired distance as fast as possible while maintaining balance.',
      'Rack the yoke at the end of the carry.',
    ],
  },

  'sled-push': {
    description: 'A conditioning exercise pushing a loaded sled forward using your legs and hips.',
    instructions: [
      'Place your hands on the sled upright handles and lean your body at an angle.',
      'Drive through your legs in a sprint-like motion to push the sled forward.',
      'Maintain a strong core and keep your back flat.',
      'Push for the desired distance or time.',
    ],
  },

  'sled-pull': {
    description: 'A conditioning exercise pulling a loaded sled toward you using a rope or harness.',
    instructions: [
      'Attach a rope to a loaded sled and move away until the rope is taut.',
      'Pull the rope hand over hand to drag the sled toward you, or walk backward with a harness.',
      'Keep a strong posture and drive through your legs.',
      'Pull for the desired distance.',
    ],
  },

  'sled-drag': {
    description: 'A lower body conditioning exercise dragging a sled behind you while walking or running.',
    instructions: [
      'Attach a harness or rope to a sled and walk or run away from it.',
      'Drive your legs to drag the sled, maintaining an upright or slightly forward-leaning posture.',
      'Keep your core braced and arms pumping.',
      'Drag for the desired distance or time.',
    ],
  },

  'battle-rope-waves': {
    description: 'A conditioning exercise creating continuous waves in the battle ropes using alternating arm movements.',
    instructions: [
      'Stand with feet shoulder-width apart holding the ends of the battle ropes.',
      'Rapidly raise and lower one arm while doing the opposite with the other to create alternating waves.',
      'Keep a stable base with slightly bent knees and a braced core.',
      'Continue at maximum intensity for the desired duration.',
    ],
  },

  'tire-flip': {
    description: 'A full body strength and conditioning exercise flipping a large tyre by driving through the hips and legs.',
    instructions: [
      'Grip the underside of the tyre and drive it up using your legs and hips, keeping your back flat.',
      'As the tyre rises, transition your hands to push it forward.',
      'Push it over to land flat on the ground.',
      'Walk to the other side and repeat.',
    ],
  },

  'jump-rope': {
    description: 'A cardiovascular conditioning exercise jumping over a swinging rope with single or double leg jumps.',
    instructions: [
      'Hold the rope handles with relaxed arms and the rope behind your feet.',
      'Swing the rope over your head and jump as it reaches your feet.',
      'Land softly on the balls of your feet and maintain a consistent rhythm.',
      'Continue for the desired duration.',
    ],
  },

  'plate-carry': {
    description: 'A conditioning exercise carrying weight plates for distance to develop grip, shoulders, and core endurance.',
    instructions: [
      'Hold a weight plate in each hand at your sides or at chest height.',
      'Stand tall with shoulders back and walk forward at a steady pace.',
      'Keep your core braced and maintain good posture throughout.',
      'Walk the desired distance.',
    ],
  },

  'sandbag-carry': {
    description: 'A loaded carry using a sandbag on the shoulder or in a bear-hug position to develop full body conditioning.',
    instructions: [
      'Pick up a sandbag and place it on your shoulder or hold it in front of your chest.',
      'Stand tall and walk forward at a controlled pace.',
      'Keep your core braced to support the uneven load.',
      'Walk the desired distance, then set the bag down.',
    ],
  },

  'kettlebell-complex': {
    description: 'A series of kettlebell exercises performed in sequence without setting the bell down to challenge strength endurance.',
    instructions: [
      'Choose a sequence of 4–6 exercises such as swing, clean, press, and squat.',
      'Perform the desired reps of each exercise without setting the kettlebell down.',
      'Move from one exercise to the next as smoothly as possible.',
      'Rest after completing the full sequence and repeat for the desired number of rounds.',
    ],
  },

  'sprint': {
    description: 'A short maximal effort run to develop speed and explosive conditioning.',
    instructions: [
      'Stand at the starting position in an athletic stance.',
      'Drive off explosively with your legs and pump your arms to reach maximum speed.',
      'Maintain top speed for the desired distance, keeping your body tall and relaxed.',
      'Decelerate gradually and walk back to recover before the next sprint.',
    ],
  },

  'hill-sprint': {
    description: 'A conditioning exercise sprinting up an incline to increase resistance and metabolic demand.',
    instructions: [
      'Stand at the bottom of a hill in an athletic stance.',
      'Drive off explosively and sprint uphill at maximum effort.',
      'Maintain strong arm drive and a forward lean into the hill.',
      'Walk back down to recover and repeat for the desired number of sprints.',
    ],
  },

  'agility-ladder': {
    description: 'A footwork drill using an agility ladder to improve coordination, speed, and lower body conditioning.',
    instructions: [
      'Lay an agility ladder flat on the floor and stand at one end.',
      'Perform the chosen ladder pattern such as single steps, lateral runs, or in-and-out jumps.',
      'Move through each rung with quick, controlled foot placement.',
      'Walk back to the start and repeat for the desired number of runs.',
    ],
  },

  'medicine-ball-throw': {
    description: 'A power exercise throwing a medicine ball against a wall or to a partner to develop explosive upper body power.',
    instructions: [
      'Stand facing a wall or partner holding a medicine ball at chest height.',
      'Explosively push the ball toward the target using your arms and chest.',
      'Catch the ball or collect the rebound.',
      'Repeat for the desired number of throws.',
    ],
  },

  'weighted-vest-walk': {
    description: 'A low-intensity loaded walk wearing a weighted vest that adds resistance for endurance conditioning.',
    instructions: [
      'Put on a weighted vest and adjust it to fit securely.',
      'Walk at a steady, controlled pace over the desired distance or time.',
      'Maintain good posture with shoulders back and core engaged.',
      'Cool down and remove the vest at the end.',
    ],
  },

  'prowler-push': {
    description: 'A conditioning exercise pushing a Prowler sled with hands on the upright posts using explosive leg drive.',
    instructions: [
      'Grip the upright handles of the Prowler and lean forward.',
      'Drive through your legs in short, powerful strides to push the sled.',
      'Maintain a flat back and drive your arms to contribute to the push.',
      'Push for the desired distance or time.',
    ],
  },

  // ── EXTRAS (5) ──────────────────────────────────────────────────────────────

  'incline-hammer-curl': {
    description: 'A hammer curl performed on an inclined bench that stretches the long head of the brachialis for a fuller contraction.',
    instructions: [
      'Sit on an inclined bench set to about 45 degrees and hold a dumbbell in each hand, palms facing each other.',
      'Let your arms hang naturally with a neutral grip.',
      'Curl both dumbbells toward your shoulders without moving your elbows.',
      'Lower under control and repeat.',
    ],
  },

  'dumbbell-rear-delt-row': {
    description: 'A row targeting the posterior deltoid by pulling the elbow high and wide from a hinged position.',
    instructions: [
      'Hinge forward at the hips holding a dumbbell in each hand.',
      'Pull each dumbbell upward and out to the side with your elbows flaring wide.',
      'Squeeze your rear delts at the top of the movement.',
      'Lower under control and repeat.',
    ],
  },

  'cable-face-pull-external-rotation': {
    description: 'A face pull variation with added external rotation at the top to target the rotator cuff and rear delts.',
    instructions: [
      'Attach a rope to a high cable pulley and hold the ends with both hands.',
      'Pull the rope toward your face, keeping your elbows high.',
      'As you reach the end of the pull, rotate your forearms upward so your fists point toward the ceiling.',
      'Return under control and repeat.',
    ],
  },

  'barbell-hip-hinge': {
    description: 'A foundational movement teaching the hip hinge pattern with a barbell to prepare for deadlifts and RDLs.',
    instructions: [
      'Hold a barbell in front of your thighs with a shoulder-width grip.',
      'Push your hips back and hinge forward, keeping your back flat and the bar close to your legs.',
      'Lower until you feel a hamstring stretch, then drive your hips forward to return to standing.',
      'Repeat while focusing on the hip hinge pattern.',
    ],
  },

  'hollow-body-rock': {
    description: 'A gymnastics core exercise rocking back and forth in a hollow body position to develop core tension.',
    instructions: [
      'Lie on your back and press your lower back into the floor.',
      'Raise your arms, shoulders, and straight legs to create a hollow body position.',
      'Gently rock forward and backward while maintaining the hollow shape.',
      'Continue rocking for the desired duration without breaking the position.',
    ],
  },

}
