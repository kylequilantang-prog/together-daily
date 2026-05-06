'use strict';

const STORAGE_KEY = 'kyle_jyselle_system_v1';
const WEDDING_DATE = new Date(2027, 8, 22); // September 22, 2027 — Andalusia, Spain

const KYLE_WHY = "I want to look good and be good — so when I show up to clients, when I show up at work, when I walk into a room, people treat me differently. I want to show everyone I'm not playing games. And most of all, I want to feel good in my own body.";
const KYLE_ANCHORS = [
  "Treated differently when I show up",
  "Not playing games",
  "Feel good in my own body"
];

// Floor logic: any item with type 'walk' or 'walk_jog' satisfies the 10-min floor.
const ITEMS = {
  kyle: [
    { id: 'walk_morning', label: 'Morning walk', cue: 'after coffee · 5–10 min', type: 'walk' },
    { id: 'walk_10am',    label: '10 AM break walk', cue: 'work break · 10 min', type: 'walk' },
    { id: 'walk_3pm',     label: '3 PM break walk', cue: 'work break · 10 min', type: 'walk' },
    { id: 'walk_dinner',  label: 'Post-dinner walk with Jyselle', cue: 'talking walk', type: 'walk' },
    { id: 'strength',     label: 'Strength session complete', cue: 'all 5 exercises checked below', type: 'strength' }
  ],
  jyselle: [
    { id: 'walk_morning',  label: 'Morning movement', cue: 'after coffee · gentle 5–10 min walk', type: 'walk' },
    { id: 'walk_10am',     label: '10 AM break walk', cue: 'work break · just 10 min', type: 'walk' },
    { id: 'walk_3pm',      label: '3 PM break walk', cue: 'work break · just 10 min', type: 'walk' },
    { id: 'walk_dinner',   label: 'Post-dinner walk with Kyle', cue: 'time to talk and connect', type: 'walk' },
    { id: 'walk_jog',      label: 'Walk-jog session (optional)', cue: 'when energy is good · only when it feels right', type: 'walk_jog' },
    { id: 'strength',      label: 'Light strength session complete', cue: 'all 5 moves below · short and gentle', type: 'strength' }
  ]
};

const STRENGTH_SESSIONS = {
  // Kyle — knee + shoulder safe, dumbbell-based
  kyle: {
    1: {
      name: 'Push focus',
      warmup: '2 min walk in place + 10 arm circles each direction',
      exercises: [
        { id: 'goblet_squat',   name: 'Goblet squat to chair',            detail: '2 sets × 10 reps · light dumbbell, sit to chair, stand. No deep squat.' },
        { id: 'incline_pushup', name: 'Incline push-up (hands on bench)', detail: '2 sets × 8 reps · easier on shoulder than floor.' },
        { id: 'rdl',            name: 'Romanian deadlift',                detail: '2 sets × 10 reps · light dumbbells, hinge at hips, soft knees.' },
        { id: 'glute_bridge',   name: 'Glute bridge',                     detail: '2 sets × 12 reps · feet flat, drive through heels.' },
        { id: 'deadbug',        name: 'Dead bug',                         detail: '2 sets × 8 reps each side · core, knee-friendly.' }
      ]
    },
    4: {
      name: 'Pull focus',
      warmup: '2 min walk in place + 10 cat-cows + 10 hip circles each side',
      exercises: [
        { id: 'db_row',     name: 'One-arm dumbbell row',           detail: '2 sets × 10 reps each side · braced on bench. Strong back protects shoulder.' },
        { id: 'step_up',    name: 'Step-up (low step, no jump)',    detail: '2 sets × 8 reps each leg · controlled, no impact. Sub split squat if knee bothers.' },
        { id: 'suitcase',   name: 'Suitcase carry',                 detail: '2 sets × 30 sec each side · walk holding one heavy dumbbell. Anti-rotation core.' },
        { id: 'hip_thrust', name: 'Hip thrust (shoulders on bench)', detail: '2 sets × 10 reps · glutes, knee-friendly.' },
        { id: 'bird_dog',   name: 'Bird dog',                        detail: '2 sets × 8 reps each side · spinal stability.' }
      ]
    }
  },
  // Jyselle — beginner-friendly, bodyweight, with "what this is for" cues
  jyselle: {
    1: {
      name: 'Gentle full-body (Mon)',
      warmup: '2 min slow walk in place + 5 shoulder rolls + 5 gentle squats (no weight)',
      exercises: [
        { id: 'chair_squat',     name: 'Chair squat',              detail: '2 sets × 8 reps · stand up from chair, sit down. No weight needed. This is your legs and butt.' },
        { id: 'wall_pushup',     name: 'Wall push-up',             detail: '2 sets × 8 reps · stand arm\'s length from wall, push in and out. This builds chest and arm strength gently.' },
        { id: 'glute_bridge_j',  name: 'Glute bridge',             detail: '2 sets × 10 reps · lay on back, lift hips. This wakes up your butt — most important muscle for posture.' },
        { id: 'standing_row',    name: 'Standing band row (or air row)', detail: '2 sets × 10 reps · pull elbows back, squeeze shoulder blades. If no band, just mimic the motion. This is your back.' },
        { id: 'seated_march',    name: 'Seated march',             detail: '2 sets × 10 reps each leg · sit tall, lift one knee at a time. Easy core work, no floor needed.' }
      ]
    },
    4: {
      name: 'Gentle full-body (Thu)',
      warmup: '2 min slow walk in place + 5 cat-cows + 5 hip circles each side',
      exercises: [
        { id: 'sit_to_stand',     name: 'Sit-to-stand',           detail: '2 sets × 8 reps · same as chair squat but slower on the way down. Counts the legs differently.' },
        { id: 'incline_pushup_j', name: 'Counter push-up',        detail: '2 sets × 8 reps · push-up against kitchen counter (lower than wall). Slightly harder than wall push-up.' },
        { id: 'side_step',        name: 'Side steps',              detail: '2 sets × 10 each side · small steps side to side. Outer hips and balance.' },
        { id: 'hip_hinge',        name: 'Hip hinge (no weight)',   detail: '2 sets × 8 reps · push hips back, hands on thighs, soft knees. This teaches you to bend safely from the hips.' },
        { id: 'standing_balance', name: 'Standing balance',        detail: '2 sets × 20 sec each foot · stand on one leg near a wall (use it if needed). Surprisingly tiring, builds ankle and core.' }
      ]
    }
  }
};

const COPY = {
  kyle: {
    phaseTag: 'Phase 1 · Habit Installation',
    floorMet: '<strong>Floor met today.</strong> The system held. Anything else is bonus.',
    floorPending: '<strong>The floor:</strong> a 10-minute walk. That\'s the whole contract.',
    missWarning: '<strong>Heads up.</strong> Yesterday\'s floor wasn\'t met. The rule is: <em>never miss twice</em>. A 10-minute walk today protects the system. Doesn\'t matter when. Doesn\'t matter how slow.',
    reviewSub: 'Pairs with your Smaller Circle Review. No judgment — just observation.',
    workedPlaceholder: 'The walk after dinner with Jyselle on Wednesday felt easy. The 3pm break walk became automatic this week.',
    brokePlaceholder: 'Skipped Thursday strength — long day at CCS. Caught back up Friday with just the floor walk.',
    tweakPlaceholder: 'Move strength to Tuesday on weeks I have a Thursday meeting. Lay out gym clothes the night before.'
  },
  jyselle: {
    phaseTag: 'Phase 1 · Just Showing Up',
    floorMet: '<strong>You did it.</strong> Today\'s 10-min walk is in the books. That\'s a win — small things, every day.',
    floorPending: '<strong>Today\'s floor:</strong> just one 10-minute walk. That\'s all. You don\'t need to feel ready.',
    missWarning: '<strong>Hey, just a heads up.</strong> Yesterday\'s walk didn\'t happen — totally okay, it happens. The only rule is: <em>never miss twice in a row</em>. A slow 10-minute walk today, even just around the block, keeps the streak alive. You\'ve got this.',
    reviewSub: 'A gentle Sunday check-in. No grading. Just noticing.',
    workedPlaceholder: 'I felt good walking with Kyle after dinner. The 10am walk was nice fresh air during a heavy work day.',
    brokePlaceholder: 'Was tired Thursday and skipped the strength moves — that\'s okay, I still got my walks in.',
    tweakPlaceholder: 'Maybe lay out walking shoes by the door so it\'s easier in the morning. Keep strength session shorter if I\'m drained.'
  }
};

const PRINCIPLES_HTML = `
  <div class="principles">
    <div class="principles-title">The system, in seven lines</div>
    <div class="principle-list">
      <div class="principle"><strong>Systems &gt; Goals</strong>Win every day you do the thing.</div>
      <div class="principle"><strong>The Floor</strong>10-min walk daily. Non-negotiable.</div>
      <div class="principle"><strong>Two-minute start</strong>Just put on shoes. Begin.</div>
      <div class="principle"><strong>Stack on existing cues</strong>Coffee · breaks · dinner.</div>
      <div class="principle"><strong>Identity</strong>"I'm someone who walks daily."</div>
      <div class="principle"><strong>Never miss twice</strong>One off day fine. Two is a pattern.</div>
      <div class="principle"><strong>Phase 1 = install</strong>First 6 weeks: just show up.</div>
    </div>
  </div>
`;
