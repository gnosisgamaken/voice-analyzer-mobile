/**
 * Metric education content used by the Learn More system.
 * Keeps all explanatory copy in one place for easy iteration with UX.
 */

export type CoreMetricKey =
  | 'clarity'
  | 'power'
  | 'health'
  | 'warmth'
  | 'confidence'
  | 'expressiveness';

export type MetricKey = CoreMetricKey | 'voiceIQ';

export interface MetricEducationEntry {
  name: string;
  headline: string;
  summary: string;
  whatItMeans: string;
  whyItMatters: string[];
  improvementTips: string[];
  useCases: Array<{
    title: string;
    description: string;
  }>;
  friendlyReminder: string;
}

export const metricEducationContent: Record<MetricKey, MetricEducationEntry> = {
  clarity: {
    name: 'Voice Clarity',
    headline: 'Every word should land cleanly.',
    summary:
      'Clarity blends articulation cues with spectral balance so your message cuts through rooms, calls, or crowded feeds.',
    whatItMeans:
      'We analyze articulation, spectral centroid, and harmonic-to-noise ratio to understand how intelligible you sound moment to moment.',
    whyItMatters: [
      'Clear voices reduce listener fatigue and make directions easier to follow.',
      'Strong clarity keeps remote calls and podcasts crisp even on smaller speakers.',
      'Audiences trust voices that sound precise yet effortless.',
    ],
    improvementTips: [
      'Warm up with tongue twisters or light consonant drills before a session.',
      'Keep posture tall so airflow stays steady and diction stays sharp.',
      'Reduce background noise or step closer to the mic for a cleaner signal.',
    ],
    useCases: [
      { title: 'Podcasters', description: 'Stay intelligible without over-compressing your track.' },
      { title: 'Coaches', description: 'Make directions land on the first try during classes.' },
      { title: 'Remote leaders', description: 'Run video calls that feel like in-person conversations.' },
    ],
    friendlyReminder: 'Clarity loves hydration—sip water every 20 minutes during long sessions.',
  },
  power: {
    name: 'Vocal Power',
    headline: 'Let projection feel energetic, not forced.',
    summary:
      'Power measures RMS energy and dynamic range so you know how confidently your voice carries in the room.',
    whatItMeans:
      'We look at total energy plus how evenly you sustain volume. Balanced power feels commanding without sounding harsh.',
    whyItMatters: [
      'Consistent projection keeps listeners engaged without sudden drop-offs.',
      'Healthy power prevents throat strain caused by pushing from the throat.',
      'Strong-but-controlled volume builds authority in key moments.',
    ],
    improvementTips: [
      'Breathe low—engage ribs and diaphragm before each phrase.',
      'Practice crescendo/decrescendo drills to expand dynamic control.',
      'Record in acoustically stable spaces so you do not overcompensate.',
    ],
    useCases: [
      { title: 'Presenters', description: 'Hold a room without shouting into the mic.' },
      { title: 'Trainers', description: 'Stay audible over music or group energy.' },
      { title: 'Support reps', description: 'Sound confident yet warm over the phone.' },
    ],
    friendlyReminder: 'If power dips sharply, check your posture and take a breath reset.',
  },
  health: {
    name: 'Vocal Health',
    headline: 'Your instrument should feel resilient, never raw.',
    summary:
      'Health tracks jitter, shimmer, and vocal stability—the early indicators of fatigue, strain, or overuse.',
    whatItMeans:
      'Even, steady phonation shows up as smooth micro-variations. When the score drops, something in the chain needs rest or relief.',
    whyItMatters: [
      'Healthy voices bounce back faster after heavy use.',
      'Early warnings help you avoid losing your voice during peak weeks.',
      'Listeners hear ease and confidence when your instrument is cared for.',
    ],
    improvementTips: [
      'Schedule vocal rest blocks the same way you schedule workouts.',
      'Keep humidity stable and sip room-temperature water.',
      'Use light sirens or straw phonation when warming down.',
    ],
    useCases: [
      { title: 'Touring artists', description: 'Spot fatigue signals before the next show.' },
      { title: 'Teachers', description: 'Keep your speaking voice fresh across long days.' },
      { title: 'Support pros', description: 'Maintain consistency across back-to-back calls.' },
    ],
    friendlyReminder: 'If health drops twice in a row, plan a lighter vocal day.',
  },
  warmth: {
    name: 'Warmth',
    headline: 'Invite people in with tone that feels grounded.',
    summary:
      'Warmth blends formant balance, resonance, and spectral gentleness for that “rich, approachable” signature tone.',
    whatItMeans:
      'Lower spectral slope and fuller resonances read as warmth. We track those subtleties so you can dial in the vibe you want.',
    whyItMatters: [
      'Warm tones build rapport in storytelling, coaching, or therapy.',
      'Audiences interpret warmth as empathy and emotional intelligence.',
      'Balancing warmth with clarity keeps data-heavy talks human.',
    ],
    improvementTips: [
      'Relax the jaw and tongue—tightness thins out resonance quickly.',
      'Visualize speaking “through” the cheeks to spread tone evenly.',
      'Add gentle hum drills to prime resonance before speaking.',
    ],
    useCases: [
      { title: 'Narrators', description: 'Deliver long-form content that feels intimate.' },
      { title: 'Therapists', description: 'Hold space with tone alone.' },
      { title: 'Hosts', description: 'Create a signature timbre listeners remember.' },
    ],
    friendlyReminder: 'Warmth pairs beautifully with measured pauses—let the room breathe.',
  },
  confidence: {
    name: 'Confidence',
    headline: 'Steady voices calm the room.',
    summary:
      'Confidence tracks pitch stability, resonance focus, and overall steadiness so you know when delivery feels grounded.',
    whatItMeans:
      'We analyze micro pitch wobbles and amplitude swings. The steadier the line, the more assured you sound—even if the content is complex.',
    whyItMatters: [
      'Confident delivery builds trust faster than slides or visuals.',
      'Reducing shaky onset keeps intros and conclusions strong.',
      'It is easier to persuade when your voice feels composed.',
    ],
    improvementTips: [
      'Pause before key lines to reset breath and intention.',
      'Practice reading scripts at slower tempos to iron out shakes.',
      'Keep both feet grounded; stable posture equals stable tone.',
    ],
    useCases: [
      { title: 'Executives', description: 'Deliver hard news with calm authority.' },
      { title: 'Creators', description: 'Handle livestream nerves with breathing anchors.' },
      { title: 'Interviewees', description: 'Own high-stakes conversations calmly.' },
    ],
    friendlyReminder: 'Confidence rises when you rehearse the first sentence out loud.',
  },
  expressiveness: {
    name: 'Expressiveness',
    headline: 'Dynamics keep attention without gimmicks.',
    summary:
      'Expressiveness follows pitch range, intensity shifts, and pacing so stories feel alive while staying precise.',
    whatItMeans:
      'We quantify how often you vary pitch and energy. Healthy variety keeps attention—but still respects clarity and control.',
    whyItMatters: [
      'Dynamic delivery improves retention for complex topics.',
      'Expressive voices feel more human in asynchronous media.',
      'Balanced highs and lows prevent monotony during long sessions.',
    ],
    improvementTips: [
      'Mark scripts with intentional rises, falls, and pauses.',
      'Practice reading children’s books—they demand expressive range.',
      'Record short segments and exaggerate dynamics, then dial back to taste.',
    ],
    useCases: [
      { title: 'Educators', description: 'Hold classrooms without over-teaching.' },
      { title: 'Streamers', description: 'Keep multi-hour sessions engaging.' },
      { title: 'Storytellers', description: 'Deliver arcs that feel cinematic.' },
    ],
    friendlyReminder: 'Expressiveness thrives when you breathe between ideas, not sentences.',
  },
  voiceIQ: {
    name: 'Voice IQ™',
    headline: 'Your composite snapshot of vocal readiness.',
    summary:
      'Voice IQ blends the six branded metrics into one calm signal so you instantly know how your instrument is trending.',
    whatItMeans:
      'We reweight the six pillars based on how they influence perceived quality, then add a consistency bonus when everything stays balanced.',
    whyItMatters: [
      'Gives you an at-a-glance confidence check before important work.',
      'Highlights imbalances so you know where to focus warmups.',
      'Helps track routines or habits that genuinely move the needle.',
    ],
    improvementTips: [
      'Review detailed metrics weekly to spot the one lever that needs care.',
      'Build a short ritual: hydrate, breathe, resonance warmup, articulate.',
      'Log contextual notes (sleep, allergies, travel) next to high or low scores.',
    ],
    useCases: [
      { title: 'Morning readiness', description: 'See if you are show-ready in under 30 seconds.' },
      { title: 'Coaching recaps', description: 'Share tangible progress with mentors or clients.' },
      { title: 'Habit experiments', description: 'Measure how routines, supplements, or rest affect performance.' },
    ],
    friendlyReminder: 'Voice IQ rewards balance; even small improvements across metrics add up fast.',
  },
};

export function isMetricKey(value: string): value is MetricKey {
  return value in metricEducationContent;
}
