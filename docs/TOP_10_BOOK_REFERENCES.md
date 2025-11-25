# 📚 Top 10 Book References for Voice Analyzer Mobile

**Purpose:** Deep research spine for metric validation, user education, copywriting, and engagement strategy  
**Date:** November 17, 2025  
**Status:** Knowledge Foundation for Implementation

---

## Overview

These 10 books form the intellectual backbone of Voice Analyzer. They span:
- **Acoustic Metrics & Science** (books 1-5)
- **Practical Vocal Health** (book 6)
- **Performance & Professional Voice** (book 7)
- **Behavior & Communication** (books 8-10)

Each book directly informs specific parts of the app: metric definitions, user education, copywriting tone, engagement strategy, and habit formation.

---

## 🔬 Acoustic Metrics & Science Foundation

### 1. The Acoustic Analysis of Speech
**Authors:** Kent & Read  
**ISBN:** 978-0750697704  
**Key Chapters:** Spectral analysis, jitter/shimmer, formants, pitch extraction  
**Read Time:** 8-10 weeks (dense technical reference)

#### Why Feed It In

This is the **definitive reference** for how speech scientists compute and interpret acoustic measures. It provides rigorous definitions for every metric you calculate:

- **Spectral Centroid:** "The center of mass of the spectrum" (page ~145)
- **Spectral Flatness:** Wiener entropy measure for noise-like vs. tonal content
- **Jitter/Shimmer:** Period disturbance measures (clinical gold standard)
- **Harmonic-to-Noise Ratio (HNR):** Energy in harmonic vs. noise components
- **Formants:** Resonance peaks from source-filter theory

#### Implementation Points

**In-App "How We Measure" Sections:**
```
"Clarity is based on spectral centroid and harmonic content.
A clear voice has energy concentrated in distinct harmonic peaks 
(high HNR), not spread across noise (high flatness)."
```

**Metric Justification:**
- Use Kent & Read definitions verbatim to build credibility
- Reference page numbers in advanced tooltips for users who dig deeper
- Cite them in any "research" or "press" materials

**Engineer Notes:**
- Validates your FFT-based feature extraction approach
- Informs normalization ranges (e.g., typical spectral centroid: 1-5 kHz)
- Guides error handling (when metrics are unreliable—humidity, background noise)

**Recommended Chapters to Deep Dive:**
- Ch. 5: Spectral Analysis (FFT, windowing, frequency bins)
- Ch. 7: Temporal Measures (jitter, shimmer, period disturbances)
- Ch. 8: Harmonic Analysis (pitch, HNR, formants)

---

### 2. Clinical Measurement of Speech and Voice
**Authors:** Baken & Orlikoff  
**ISBN:** 978-1597566742 (3rd ed.)  
**Key Chapters:** Measurement protocols, normalization, reliability, instrumentation  
**Read Time:** 6-8 weeks (clinical practitioner focus)

#### Why Feed It In

This book bridges **acoustics and clinical practice**. While Kent & Read is theoretical, Baken & Orlikoff explains how to actually *use* measurements in real-world settings:

- **Normalization:** How to account for age, sex, recording environment
- **Reliability:** Measurement error, test-retest stability
- **Clinical Thresholds:** What ranges indicate dysphonia or pathology
- **Instrumentation:** Microphone placement, sampling rate, background noise

#### Implementation Points

**Voice Health Metric Calibration:**
```typescript
// From Baken & Orlikoff Ch. 4: typical ranges by sex/age
const VOCAL_HEALTH_BASELINE = {
  adult_male: { jitter_max: 1.04, shimmer_max: 3.81, HNR_min: 12 },
  adult_female: { jitter_max: 1.23, shimmer_max: 4.15, HNR_min: 12 },
  child: { jitter_max: 1.86, shimmer_max: 5.5, HNR_min: 10 },
};
```

**User Communication:**
```
"Vocal Health measures stability and noise levels in your voice.
Healthy voices show low jitter (< 1%) and good harmonic clarity."
```

**In-App Disclaimers:**
- "Voice Analyzer is not a diagnostic tool. If you have persistent hoarseness 
  or pain, consult an SLP or ENT."
- Ground this in clinical ethics from Baken & Orlikoff's ethical framework

**Recommended Chapters:**
- Ch. 3: Recording & Preprocessing (microphone, noise floor, normalization)
- Ch. 4: Normative Data (typical ranges by demographic)
- Ch. 5: Perceptual Measures (how acoustics relate to what listeners hear)
- Ch. 6: Reliability & Validity (error bounds for your metrics)

---

### 3. Speech and Voice Science: Anatomy, Physiology, Acoustics & Perception
**Author:** Alison Behrman  
**ISBN:** 978-0323530613  
**Key Chapters:** Source-filter theory, formants, perception, clinical overview  
**Read Time:** 6-8 weeks (textbook, modern approach)

#### Why Feed It In

Modern, accessible textbook that connects **physiology → acoustics → perception**. Perfect for your "Learn More" layer, because it explains *why* metrics matter:

- **Why Spectral Centroid Matters:** Relates to vocal tract shape and articulation precision
- **Why Pitch Stability Matters:** Reflects laryngeal control and breath management
- **Why Power Matters:** Links to subglottal pressure, respiratory support, projection
- **Why Warmth Matters:** Relates to formant frequencies (F1, F2) and resonance

#### Implementation Points

**In-App Educational Content:**

Example for "Clarity" Learn More section:
```
"Your Clarity measures how 'pure' your vocal signal is.

The Physics:
When you speak, vocal folds vibrate (source) and your vocal tract 
(mouth, throat) resonates like an instrument (filter).
Clear voices have strong, distinct resonance peaks (formants).
Unclear voices have energy scattered across noise.

What Affects It:
- Tension: Too tight? → unclear
- Hydration: Dry vocal folds? → breathy
- Articulation: Lazy? → muffled
- Microphone distance: Too close/far? → distorted
"
```

**Metric Naming Rationale:**
- Use Behrman's framework to justify why you call it "Clarity" not "Spectral Flatness"
- Cite her source-filter model in technical documentation

**Recommended Chapters:**
- Ch. 3: Acoustic Theory (source-filter, formants, harmonics)
- Ch. 4: Perception (how ears hear voice; loudness, pitch, quality)
- Ch. 5: Normal Voice (typical voice parameters)
- Ch. 6: Voice Disorders (dysphonia, pathology, red flags)

---

### 4. Principles of Voice Production
**Author:** Ingo R. Titze  
**ISBN:** 978-0895294517  
**Key Chapters:** Phonation theory, biomechanics, vocal efficiency  
**Read Time:** 8-12 weeks (advanced, physics-heavy)

#### Why Feed It In

The **most rigorous physical science** of voice production. Titze is the founder of the National Center for Voice and Speech and pioneer of vocology. Use for:

- **Advanced Explanations:** For users who want deep dive ("Why does hydration help?")
- **Efficiency Coaching:** Science-backed tips on efficient voice production
- **Power Metric:** Grounded in subglottal pressure physics
- **Health Metric:** Links to tissue stress, recovery, injury risk

#### Implementation Points

**Advanced User Tooltips (Optional):**
```
"Power measures your vocal projection capability.
Technically: it reflects subglottal pressure, vocal fold closure, 
and energy transfer. Think of it as the 'efficiency' of your 
voice production—more power with less strain is ideal.

Tip from Titze: Semi-occluded vocal tract exercises 
(straw phonation) improve efficiency and reduce strain."
```

**Injury Prevention Copy:**
```
"If Power is very high AND Health is low, consider rest.
Consistently high effort + poor vocal efficiency = risk of injury."
```

**Recommended Chapters:**
- Ch. 2: Vocal Fold Mechanics (tissue biomechanics, stress/strain)
- Ch. 3: Phonation Theory (pressure requirements, efficiency)
- Ch. 4: Optimal Pitch & Loudness (physiology of comfortable vs. strained)
- Ch. 6: Voice Disorders from a Physics Perspective (why strain leads to pathology)

---

### 5. Your Voice: An Inside View
**Author:** Scott McCoy  
**ISBN:** 978-1619281929  
**Key Chapters:** Vocal pedagogy, anatomy, acoustic science for singers & speakers  
**Read Time:** 6-8 weeks (practitioner-friendly)

#### Why Feed It In

Bridges anatomy, acoustics, and **practical pedagogy**. McCoy is a voice teacher + scientist, so he translates measurements into actionable insights:

- **Clarity → Articulation & Tract Shape:** How to improve clarity (vowel precision, jaw opening)
- **Power → Support & Breath:** How to project (subglottal pressure, posture, breath)
- **Warmth → Resonance & Relaxation:** How to deepen tone (pharyngeal constriction, jaw tension)
- **Confidence → Pitch Control & Vibrato:** How to steady pitch (laryngeal stability, breath control)

#### Implementation Points

**Actionable Tips in App:**

Example for low Clarity:
```
"Your Clarity is lower than usual. Here's why and what helps:

1. Articulation Check
   Speak slowly and exaggerate mouth movements.
   Clear speakers enunciate each consonant crisply.

2. Hydration
   Drink water. Dry vocal folds → breathy, unclear tone.

3. Jaw Tension
   Relax your jaw. Tight jaw = muffled sound.
   Try humming with an open mouth.

4. Microphone Distance
   Not too close (plosives), not too far (too quiet).
   Ideal: 6-12 inches from your mouth.
"
```

**Metric-Specific Coaching:**
- Use McCoy's pedagogy to convert each metric into 2-3 concrete tips
- Reference which exercises improve which metrics (from McCoy's drills)

**For Singers vs. Speakers:**
- McCoy covers both contexts—acknowledge in app that advice varies by use case
- "If you're a public speaker..." vs. "If you're a singer..."

**Recommended Chapters:**
- Ch. 2: Anatomy for Singers (larynx, vocal folds, tract)
- Ch. 3: Acoustics for Singers (source-filter, resonance, formants)
- Ch. 4: Onset & Offset (efficient phonation start/stop)
- Ch. 5: Vibrato (pitch stability vs. vibrato oscillation)
- Ch. 7: Pedagogy (exercises for warmth, clarity, support, power)

---

## 🏥 Practical Vocal Health

### 6. The Voice Book: Caring For, Protecting, and Improving Your Voice
**Authors:** DeVore & Cookman  
**ISBN:** 978-0306446771  
**Key Chapters:** Vocal hygiene, exercises, injury prevention, lifestyle  
**Read Time:** 3-4 weeks (accessible, practical)

#### Why Feed It In

**The most user-friendly vocal health reference.** Perfect for your in-app tips, warnings, and milestone advice:

- **Safe Advice:** Evidence-based vocal hygiene (hydration, rest, warm-up)
- **Exercise Library:** 20+ simple drills to improve voice (no singing required)
- **Lifestyle Factors:** Sleep, stress, caffeine, allergy effects on voice
- **Injury Prevention:** Red flags, when to see a doctor, recovery protocols
- **Age-Specific:** Tips for children, aging voice, post-surgery recovery

#### Implementation Points

**In-App Health Tips (Weekly):**

Example notification:
```
"Vocal Health Tip: Stay hydrated.
Dehydration = breathy, fatigued voice.
Drink 8+ glasses of water daily, especially before speaking.
(Avoid caffeine and alcohol—they dry you out.)"
```

**Low Health Score Response:**

```typescript
const LOW_HEALTH_ADVICE = {
  rest: "Consider vocal rest—a few hours of minimal talking helps recovery.",
  hydration: "Drink water. Dry vocal folds fatigue quickly.",
  sleep: "Get 7-9 hours tonight. Sleep supports vocal recovery.",
  warmup: "Gentle humming or sirens for 2-3 minutes before speaking.",
  posture: "Stand tall, relax shoulders. Good posture = better breath support.",
};
```

**Milestone Celebration:**
```
"🎉 7 Days of Healthy Voice!
You've maintained strong vocal health. Keep it up:
- Stay hydrated
- Warm up before important calls/presentations
- Take breaks during long speaking sessions
"
```

**Red Flag Warnings (from DeVore & Cookman Ch. 6):**
```
If you experience any of these for > 2 weeks, consult an SLP or ENT:
- Persistent hoarseness
- Pain while speaking
- Loss of vocal range
- Chronic cough
```

**Recommended Chapters:**
- Ch. 1: Anatomy Basics (accessible overview)
- Ch. 2: Vocal Hygiene (water, sleep, alcohol, caffeine, smoking)
- Ch. 3: Exercises (10 simple drills anyone can do)
- Ch. 4: Lifestyle (stress, posture, breathing, sleep)
- Ch. 5: Voice Problems (common issues and solutions)
- Ch. 6: When to See a Doctor (red flags)

---

## 🎤 Professional & Performance Voice

### 7. The Vocal Athlete: Application and Technique for the Hybrid Singer
**Authors:** LeBorgne & Rosenberg  
**ISBN:** 978-1944883522  
**Key Chapters:** Contemporary commercial music (CCM), hybrid singers, stamina, recovery  
**Read Time:** 5-6 weeks (specialized, but accessible)

#### Why Feed It In

Modern singers often blend styles (pop, rock, R&B, country, musical theater). LeBorgne & Rosenberg cover:

- **Stamina & Recovery:** How singers maintain energy over long performances
- **Style-Specific Technique:** Different demands of belt vs. legit vs. CCM
- **Vocal Load Management:** How much is too much? When to rest?
- **Performance Anxiety:** Mental strategies for consistent vocal delivery

#### Implementation Points

**Advanced User Segment (Professional Voice Users):**

If your app identifies a user as a "Singer" or "Professional Speaker," offer style-specific tips:

```typescript
const PROFESSIONAL_TIPS = {
  singer_belt: {
    clarity: "High-belt singers need crisp articulation. Try 'ng' on a descending scale.",
    power: "Belt power comes from breath support + laryngeal positioning. Avoid tension.",
    warmth: "Legit singers use more open throat; belters use twang. Know your style.",
    health: "Belting fatigues vocal folds. Recovery time is crucial.",
  },
  public_speaker: {
    clarity: "Enunciation matters in large rooms. Slow + crisp = heard clearly.",
    power: "Projection = breath support, not just loudness. Use your body.",
    confidence: "Steady pitch = confident delivery. Practice on familiar topics.",
    health: "Long presentations = fatigue. Hydrate between sessions.",
  },
};
```

**Stamina & Recovery Insights:**

```
"You've recorded 5 times today—that's vocal load.
Recovery tip from LeBorgne: 
- Hydrate heavily
- Minimize speaking for 2-3 hours
- Do gentle, warm stretches tomorrow
"
```

**Recommended Chapters:**
- Ch. 2: The Hybrid Voice (mixing styles, technique demands)
- Ch. 3: Vocal Load Management (how much is too much?)
- Ch. 4: Recovery & Injury Prevention (rest, rehab, return to singing)
- Ch. 5: Performance Strategies (mental game, consistency, anxiety)
- Ch. 6: Special Populations (aging singers, post-surgery, atypical voices)

---

## 💡 Behavior, Communication & Habit Formation

### 8. Nudge: Improving Decisions about Health, Wealth, and Happiness
**Authors:** Thaler & Sunstein  
**ISBN:** 978-0300122618  
**Key Concepts:** Choice architecture, defaults, libertarian paternalism, behavioral economics  
**Read Time:** 3-4 weeks (accessible, highly applicable)

#### Why Feed It In

Foundational framework for designing your engagement and notification system without being manipulative:

- **Choice Architecture:** How to structure defaults so users make good voice choices
- **Libertarian Paternalism:** Guide without forcing ("nudge, don't mandate")
- **Incentive Design:** Make good choices easy, bad choices noticeable
- **Feedback Loops:** Real-time info increases better decisions

#### Implementation Points

**App Design Choices (from Nudge principles):**

1. **Default to Healthy Baseline**
   ```typescript
   // When user records, show comparison to their baseline
   // NOT comparison to "ideal" (which creates shame)
   // This is a nudge toward consistency, not perfection
   ```

2. **Make Good Choices Easy**
   ```
   // One-tap access to "Voice Health Tips"
   // One-tap to log hydration/sleep (factors affecting voice)
   // Reminders that feel like suggestions, not demands
   ```

3. **Opt-In, Not Opt-Out**
   ```typescript
   // Don't auto-enable notifications
   // Ask: "Would you like gentle reminders to check in?"
   // This respects autonomy (Thaler's core principle)
   ```

4. **Feedback Without Shame**
   ```
   // ❌ "Your voice is bad today. You failed."
   // ✅ "Your clarity is lower today. Rest helps—want tips?"
   // Nudge frames low scores as information, not judgment
   ```

**Notification Design (from Nudge Ch. 8: Save More Tomorrow):**

```typescript
const NUDGE_COPY = {
  low_power: {
    immediate: "Your Power is low. Want a quick tip?",
    followup: "Check in tomorrow—recovery is fast.",
  },
  streak_milestone: {
    3_days: "3 days of consistent voice care. You're building a habit.",
    7_days: "A week of strong voice metrics. You've got this.",
  },
  contextual: {
    before_meeting: "Big presentation coming? Want pre-talk tips?",
    after_heavy_use: "You've spoken a lot today. Hydrate & rest.",
  },
};
```

**Recommended Chapters:**
- Ch. 1: Biases & Heuristics (why people make voice-care mistakes)
- Ch. 2: Anchors (how to set healthy baselines, not perfectionist goals)
- Ch. 3: Availability Bias (making info about voice health salient)
- Ch. 4: Overconfidence (gently challenging "I'm fine" when metrics say otherwise)
- Ch. 8: Saving & Investing (habit formation as "saving for future health")

---

### 9. Atomic Habits: Tiny Changes, Remarkable Results
**Author:** James Clear  
**ISBN:** 978-0735211292  
**Key Concepts:** Habit loops, identity, environment design, tiny increments  
**Read Time:** 3-4 weeks (highly applicable, engaging)

#### Why Feed It In

Translates engagement psychology into concrete habits. Your app goal is habit formation ("users check in 3x/week"), and Atomic Habits is the playbook:

- **Habit Loop:** Cue → Craving → Response → Reward
- **Identity Over Willpower:** "I'm someone who cares for my voice" > "I should check my voice"
- **Environment Design:** Make voice checking easy, barriers low
- **1% Improvements:** Small, consistent wins compound

#### Implementation Points

**Habit Loop Design:**

```typescript
const VOICE_HABIT_LOOP = {
  cue: "Push notification: 'Want to check your voice?'",
  craving: "Curiosity: 'What changed since yesterday?'",
  response: "Tap app → do 30-second recording",
  reward: "See new metric, streak continues, maybe small celebration",
};
```

**Identity Framing (from Clear):**

```
// ❌ Extrinsic motivation (weak, temporary)
"Check your voice to get a better Voice IQ score."

// ✅ Identity framing (strong, lasting)
"You're someone who cares for your vocal health.
That's why you check in. It's part of who you are."
```

**Environment Design (from Clear Ch. 5):**

```typescript
// Make checking in frictionless
- App icon on home screen (not buried in folders)
- Quick-start: Open app → instant record button visible
- No long setup; no complicated onboarding
- Streak counter visible on home screen (makes habit visible)

// Make neglecting voice obvious
- Streak counter shows when broken
- "It's been 3 days" notification (gentle reminder)
- Not punitive, just factual
```

**Milestone Celebrations (from Clear's "reward" phase):**

```
"1 week streak 🎉"
→ Unlock "You're building a habit"
→ Psychological reward: identity reinforcement

"30 days consistent checks"
→ "7 out of 7 days healthy vocal metrics"
→ Reward: Beautiful shareable card of your progress
```

**Tiny Increments Philosophy:**

```
Not: "Improve your voice dramatically"
Yes: "Your clarity improved 2 points this week.
     That's 100+ points a year if you keep it up."
```

**Recommended Chapters:**
- Ch. 1: The Surprising Power of Tiny Changes (1% = compound results)
- Ch. 2: How Habits Work (the habit loop)
- Ch. 3: The Best Version of Yourself (identity-based habits)
- Ch. 4: The Man Who Didn't Look Right (environment design)
- Ch. 5: Make It Obvious (cues and visibility)
- Ch. 6: Make It Attractive (why voice checking becomes desirable)
- Ch. 7: Make It Easy (friction reduction)
- Ch. 8: Make It Satisfying (rewards and streaks)

---

### 10. Made to Stick: Why Some Ideas Survive and Others Die
**Authors:** Chip Heath & Dan Heath  
**ISBN:** 978-0385516686  
**Key Concepts:** SUCCESs framework, memorable messaging, story-driven communication  
**Read Time:** 3-4 weeks (highly applicable, practical examples)

#### Why Feed It In

Your app's success depends on users *remembering and acting on* insights. Made to Stick teaches you how to make your copywriting, metric names, and tips "sticky":

- **SUCCESs Framework:** Simple, Unexpected, Concrete, Credible, Emotional, Stories
- **Metric Naming:** Why "Voice Clarity" sticks, but "Spectral Flatness" doesn't
- **Microcopy:** How to make tips memorable, not forgotten
- **Differentiation:** Why users choose your app vs. competitors

#### Implementation Points

**Applying SUCCESs to Metric Names:**

| Metric | Why It Sticks |
|--------|---------------|
| **Clarity** | Simple (1 word) + Concrete (easy to imagine clear voice) |
| **Power** | Simple + Unexpected (power = vocal projection, not volume alone) |
| **Warmth** | Concrete (you feel warm) + Emotional (warmth = safe, appealing) |
| **Health** | Simple + Credible (doctor-approved concept) |
| **Confidence** | Emotional (aspiration) + Story (confident speakers succeed) |
| **Expressiveness** | Story (expressive = interesting) + Concrete (varied pitch/pace) |

**Contrast: Bad Naming (doesn't stick):**
```
❌ "Spectral Centroid: 2100 Hz"
✅ "Clarity: 82 / 100 — Your voice cuts through"

❌ "Harmonic-to-Noise Ratio: 14 dB"
✅ "Vocal Health: 76 — Strong and steady"
```

**Microcopy: Making Tips Sticky (SUCCESs framework):**

```
Low Clarity Alert (applying SUCCESs):

Simple: "Your clarity dropped."
Unexpected: "But here's the good news: it's usually fixable in minutes."
Concrete: "Try this: Speak slowly and exaggerate your lip movements for 1 minute."
Credible: "(This is from voice therapy research.)"
Emotional: "Clear voices get heard. You can do this."
Story: "Professional speakers do this before big talks."

Result: User remembers and actually does the exercise.
```

**Metric Story Cards (from Heath's storytelling framework):**

Instead of just showing a number:
```
Today: Clarity 79

THE STORY:
Your voice today is clear and confident.
You're projecting well—great for meetings or public speaking.

THE CONTEXT:
This is 6 points higher than your baseline (73).
Likely reasons: You slept well, you're hydrated, you warmed up.

THE ACTIONABLE INSIGHT:
Whatever you're doing, keep it up.
(Today: Good sleep + hydration + light warm-up = success.)
```

**Memorable Taglines (from Made to Stick examples):**

For your app:
```
❌ "Voice Analyzer: Measure Your Acoustic Parameters"
✅ "Voice Analyzer: Know Your Voice"
(Simpler, more emotional, easier to remember)

❌ "Optimize Your Vocal Performance Metrics"
✅ "Your voice is unique. Let's understand it."
(Story-driven, personal, memorable)
```

**Recommended Chapters:**
- Ch. 1: Simple (core message first, then details)
- Ch. 2: Unexpected (surprise makes people pay attention)
- Ch. 3: Concrete (specific details stick, abstract concepts fade)
- Ch. 4: Credible (why people trust your measurements)
- Ch. 5: Emotional (emotional > rational for memory)
- Ch. 6: Stories (narrative is the most memorable format)
- Ch. 7: What Sticks? (quiz on which messages stick—great patterns)

---

## 🎯 Integration Roadmap

### Phase 1: Foundation (Week 1-2)
- **Primary:** Kent & Read, Baken & Orlikoff
- **Task:** Validate metric definitions, set normalization ranges
- **Output:** `brandedMetricsEngine.ts` with research citations

### Phase 2: User Education (Week 3-4)
- **Primary:** Behrman, McCoy, DeVore & Cookman
- **Task:** Write "Learn More" tooltips, health tips, exercise library
- **Output:** In-app educational content + microcopry

### Phase 3: Engagement & Habit (Week 5-8)
- **Primary:** Thaler & Sunstein, Clear, Heath & Heath
- **Task:** Design notifications, milestone logic, copywriting
- **Output:** Engagement system + all microcopy refined

### Phase 4: Advanced Features (Week 9-12)
- **Primary:** Titze, LeBorgne & Rosenberg
- **Task:** Professional voice tier, advanced insights, performance coaching
- **Output:** Segmented experience (casual vs. pro users)

---

## 📖 How to Use These References in Code

### Example: Citing Sources in Comments

```typescript
/**
 * calculateClarity()
 * 
 * Based on:
 * - Kent & Read (1992): "The Acoustic Analysis of Speech", Ch. 5-8
 * - Behrman (2013): "Speech and Voice Science", Ch. 3-4
 * 
 * Clarity combines three measures:
 * 1. Spectral Centroid (concentration of energy): indicates articulation precision
 * 2. Spectral Flatness (Wiener entropy): low = tonal/clear, high = noise/unclear
 * 3. Harmonic-to-Noise Ratio (HNR): ratio of harmonic to noise energy
 * 
 * Typical ranges (Baken & Orlikoff, Table 4.1):
 * - Adult: HNR 12-20 dB
 * - Dysphonic: HNR < 8 dB
 */
export function calculateClarity(features: AudioFeatures): number {
  // ...implementation
}
```

### Example: In-App Attribution

```
"How We Measure Clarity"

Clarity measures how clear and intelligible your voice is.
It combines three acoustic measures from speech science:

1. **Spectral Energy Distribution** (Kent & Read, 1992)
   How concentrated your voice energy is in distinct tones.

2. **Harmonic Clarity** (Baken & Orlikoff, 1999)
   The ratio of clear, harmonic sound to background noise.

3. **Vocal Efficiency** (McCoy, 2016)
   How little wasted energy you use to produce sound.

Together, these give you a number from 0-100:
- 0-30: Unclear, breathy, hard to understand
- 31-60: Adequate, understandable, but some effort to listen
- 61-80: Clear, easy to understand, confident
- 81-100: Crystal clear, effortless to listen to

**References:**
- Kent, R. D., & Read, C. (1992). The Acoustic Analysis of Speech. Singular Publishing Group.
- Baken, R. J., & Orlikoff, R. F. (1999). Clinical Measurement of Speech and Voice. Singular Publishing Group.
- McCoy, S. (2016). Your Voice: An Inside View. Plural Publishing.
```

---

## 📊 Reference Quick Reference

| Book | Author(s) | Best For | Chapters to Read | Priority |
|------|-----------|----------|------------------|----------|
| Acoustic Analysis of Speech | Kent & Read | Metric validation | 5, 7, 8 | 🔴 Critical |
| Clinical Measurement | Baken & Orlikoff | Clinical grounding | 3, 4, 5, 6 | 🔴 Critical |
| Speech and Voice Science | Behrman | User education | 3, 4, 5, 6 | 🟡 High |
| Principles of Voice Production | Titze | Advanced insights | 2, 3, 4, 6 | 🟡 High |
| Your Voice: Inside View | McCoy | Practical tips | 2, 3, 4, 5, 7 | 🟡 High |
| The Voice Book | DeVore & Cookman | Health tips | 2, 3, 4, 5, 6 | 🟢 Medium |
| The Vocal Athlete | LeBorgne & Rosenberg | Professional users | 2, 3, 4, 5, 6 | 🟢 Medium |
| Nudge | Thaler & Sunstein | Engagement design | 1, 2, 3, 4, 8 | 🔴 Critical |
| Atomic Habits | Clear | Habit formation | 1, 2, 3, 4, 5, 6, 7, 8 | 🔴 Critical |
| Made to Stick | Heath & Heath | Copywriting | 1, 2, 3, 4, 5, 6 | 🟡 High |

---

## 🚀 Next Steps

1. **Immediate:** Download books 1, 2, 8, 9 (critical path)
2. **Week 1:** Extract key sections into shared notes
3. **Week 2:** Create metric definitions with citations
4. **Week 3:** Draft in-app educational content
5. **Week 4+:** Integrate into engagement and copywriting systems

---

## 📝 Implementation Checklist

- [ ] Download and read priority books (1, 2, 8, 9)
- [ ] Extract key findings into shared documentation
- [ ] Create `RESEARCH_CITATIONS.md` in docs folder
- [ ] Add citation comments to metric engine code
- [ ] Draft "How We Measure" sections for each metric
- [ ] Integrate research-backed tips into notification system
- [ ] Prepare "About Our Science" section for app
- [ ] Validate metric ranges against clinical literature
- [ ] Test user education copy with sample users
- [ ] Create "References" page for app (credits & sources)

---

**Document Version:** 1.0  
**Last Updated:** November 17, 2025  
**Status:** 🟢 Ready for Implementation  
**Owner:** Product & Research Team
