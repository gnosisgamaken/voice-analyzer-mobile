# 🎯 Branded Voice Metrics Implementation Plan

**Project:** Voice Analyzer Mobile  
**Focus:** Consolidating app identity around 6 core voice metrics + Voice IQ composite score  
**Last Updated:** November 2025

---

## 📊 Executive Summary

This plan transforms our voice analyzer from a technical tool into a brand-driven coaching platform by consolidating around 6 scientifically-backed, user-friendly voice metrics that serve as both product features and brand pillars.

### The 6 Core Metrics (Brand DNA)

1. **💎 Voice Clarity** - How clear, crisp, and easy-to-understand your voice sounds
2. **⚡ Vocal Power** - The strength and projection of your voice
3. **❤️ Vocal Health** - The wellness and stamina of your voice
4. **☀️ Warmth** - The friendliness and likeability of your tone
5. **👑 Confidence** - How confident and authoritative your voice appears
6. **🔥 Expressiveness** - The degree of emotion, enthusiasm, and variation in your voice

### Voice IQ™ (Flagship Composite Metric)

A single 0-100 score combining all metrics to represent overall vocal effectiveness - our "IQ for voice."

---

## 🏗️ Technical Architecture

### Current State Analysis

**✅ Already Built:**
- Real-time audio recording & playback
- Basic acoustic feature extraction (RMS, energy, ZCR, spectral centroid, etc.)
- 5 existing metrics (Brightness, Clarity, Richness, Energy, Pitch Stability)
- Pitch detection and waveform visualization
- Storage, navigation, and UI framework

**🔄 Needs Adaptation:**
- Rebrand existing 5 metrics to align with new 6-metric system
- Add missing metric: Warmth
- Enhance Vocal Health with jitter/shimmer/HNR
- Create Voice IQ composite calculation
- Redesign UI/UX around branded metrics

**➕ New Components:**
- Metric branding system (icons, colors, qualitative labels)
- Historical trend tracking per metric
- Voice IQ dashboard
- Coaching insights tied to metrics
- Shareable metric cards

---

## 📋 Implementation Phases

### **Phase 1: Metric Calculation Engine (2-3 weeks)**

Rebuild the voice analysis engine to calculate all 6 branded metrics with scientific accuracy.

#### Sprint 1.1: Metric Mapping & Algorithm Design (3 days)

**Goal:** Map existing acoustic features to new branded metrics and design calculation algorithms.

**Tasks:**

1. **Audit Current Metrics** ✅ COMPLETED
   - Document how current 5 metrics are calculated
   - Identify reusable components
   - Location: `src/utils/enhancedAudioAnalysis.ts`

2. **Design Metric Formulas**
   - Create detailed calculation specs for each of the 6 metrics
   - Define acoustic features needed for each
   - Establish 0-100 normalization strategy
   
   **Metric Calculation Specifications:**

   | Metric | Acoustic Features | Formula/Algorithm | Normalization |
   |--------|------------------|-------------------|---------------|
   | **💎 Clarity** | Spectral Centroid, Flatness, HNR | Weighted avg: 40% centroid (high=clear), 30% flatness (low=clear), 30% HNR (high=clear) | Map to 0-100 using empirical ranges |
   | **⚡ Power** | RMS Energy, Dynamic Range, Peak dB | Power = (RMS_dB + 80) / 80 * DynamicRangeFactor | Normalize to conversational speech (50-75 dB = 40-80 score) |
   | **❤️ Health** | Jitter, Shimmer, HNR | Health = (100 - jitter*1000) * 0.4 + (100 - shimmer*100) * 0.4 + HNR/20 * 0.2 | 0-100 where 80+ is healthy |
   | **☀️ Warmth** | Formants (F1/F2), MFCCs, Spectral Slope | Warmth = F1_lowness * 0.5 + SpectralSlope_gentleness * 0.3 + MFCC_richness * 0.2 | Calibrate to natural warm voices |
   | **👑 Confidence** | Pitch Stability, Resonance, Pause Patterns | Confidence = PitchStability * 0.5 + ResonanceStrength * 0.3 + SpeechFluency * 0.2 | 0-100 (lower pitch variance = higher score) |
   | **🔥 Expressiveness** | Pitch Range, Intensity Variance, Tempo Changes | Expressiveness = PitchRange/100Hz * 40 + IntensityVariance * 30 + TempoVariability * 30 | 0-100 (higher variance = higher score) |

3. **Voice IQ Composite Formula**
   ```
   Voice IQ = (
     Clarity * 0.20 +
     Power * 0.15 +
     Health * 0.20 +
     Warmth * 0.15 +
     Confidence * 0.15 +
     Expressiveness * 0.15
   )
   
   With modifiers:
   - Consistency bonus: +5 if all metrics > 60
   - Balance penalty: -10 if any metric < 30
   ```

4. **Create Technical Specification Document**
   - File: `METRIC_CALCULATIONS_SPEC.md`
   - Include: formulas, test cases, edge cases, validation criteria

**Deliverables:**
- [x] `METRIC_CALCULATIONS_SPEC.md` - Complete technical spec
- [ ] Test data set for validation
- [ ] Mapping document: old metrics → new metrics

---

#### Sprint 1.2: Core Acoustic Feature Extraction (4 days)

**Goal:** Implement missing acoustic features needed for all 6 metrics.

**Tasks:**

1. **Enhance Pitch Detection** (Currently exists but may need refinement)
   - Location: `src/utils/audioAnalysis.ts` - `detectPitch()`
   - Ensure: 50-500 Hz range, autocorrelation accuracy
   - Add: Pitch stability variance calculation
   - Test: Male/female voices, different ages

2. **Implement Jitter & Shimmer** (NEW - for Vocal Health)
   > _Placeholder module `src/utils/voiceHealthMetrics.ts` scaffolded. DSP implementation and tests still required._
   ```typescript
   // src/utils/voiceHealthMetrics.ts
   
   export function calculateJitter(pitchPeriods: number[]): number {
     // Jitter = average absolute difference between consecutive periods
     // Normalized by average period
   }
   
   export function calculateShimmer(amplitudes: number[]): number {
     // Shimmer = average absolute difference between consecutive amplitudes
     // Normalized by average amplitude
   }
   ```
   - Reference: Standard voice pathology algorithms
   - Test: Against known jitter/shimmer samples

3. **Implement Harmonic-to-Noise Ratio (HNR)** (NEW - for Clarity & Health)
   ```typescript
   // src/utils/voiceHealthMetrics.ts
   
   export function calculateHNR(signal: Float32Array, sampleRate: number): number {
     // HNR = 10 * log10(harmonic_energy / noise_energy)
     // Use autocorrelation-based method
   }
   ```
   - Range: 0-20 dB (typical speech)
   - Higher = clearer, healthier voice

4. **Formant Extraction** (NEW - for Warmth)
   > _Scaffolded `src/utils/formantAnalysis.ts` as a placeholder pending LPC implementation._
   ```typescript
   // src/utils/formantAnalysis.ts
   
   export function extractFormants(spectrum: number[], sampleRate: number): {
     F1: number;  // First formant (250-900 Hz)
     F2: number;  // Second formant (600-3000 Hz)
     F3: number;  // Third formant (1200-4000 Hz)
   } {
     // Use Linear Predictive Coding (LPC) or peak picking
   }
   ```
   - Lower F1 = warmer voice
   - F1/F2 ratio indicates vocal warmth

5. **Dynamic Range & Intensity Tracking** (Enhance existing - for Power & Expressiveness)
   - Track RMS energy over time windows
   - Calculate variance and range
   - Detect peak vs average levels

6. **Pause & Fluency Detection** (NEW - for Confidence)
   > _Placeholder `src/utils/speechFluency.ts` created; needs silence detection logic._
   ```typescript
   // src/utils/speechFluency.ts
   
   export function analyzeFluency(energyTimeline: number[]): {
     pauseCount: number;
     pauseDuration: number;
     speechRate: number;
     fluencyScore: number;
   }
   ```
   - Detect silences (< threshold for > 200ms)
   - Too many pauses = lower confidence score

**Deliverables:**
- [ ] `src/utils/voiceHealthMetrics.ts` - Jitter, Shimmer, HNR
- [ ] `src/utils/formantAnalysis.ts` - Formant extraction
- [ ] `src/utils/speechFluency.ts` - Pause/fluency analysis
- [ ] Enhanced `audioAnalysis.ts` with dynamic range tracking
- [ ] Unit tests for each new function

---

#### Sprint 1.3: Branded Metric Calculator (3 days)

**Goal:** Create the main VoiceMetricsEngine that outputs our 6 branded metrics + Voice IQ.

**Tasks:**

1. **Create VoiceMetricsEngine Class**
   > ✅ Skeleton shipped in `src/utils/VoiceMetricsEngine.ts` – currently blends existing FFT metrics with placeholder heuristics and emits qualitative labels. Needs calibration once DSP modules land.

2. **Implement Qualitative Label System**
   ```typescript
   // src/constants/metricLabels.ts
   
   export const METRIC_LABELS = {
     clarity: [
       { min: 0, max: 30, label: 'Muffled', color: '#FF3B30' },
       { min: 30, max: 50, label: 'Unclear', color: '#FF9500' },
       { min: 50, max: 70, label: 'Clear', color: '#34C759' },
       { min: 70, max: 85, label: 'Very Clear', color: '#007AFF' },
       { min: 85, max: 100, label: 'Crystal Clear', color: '#5856D6' },
     ],
     // ... similar for all 6 metrics + Voice IQ
   };
   
   export function getMetricLabel(metricName: string, score: number): {
     label: string;
     color: string;
   }
   ```

3. **Integration with Existing Analysis Pipeline**
   - Update `enhancedAudioAnalysis.ts` to use VoiceMetricsEngine
   - Replace old 5-metric system with new 6-metric system
   - Ensure backward compatibility for stored data (migration strategy)
   - _Status:_ `useAudioRecorder` now captures pitch/energy histories and feeds provisional advanced metrics into the engine; migration + storage schema update still required.

4. **Add Metric Metadata**
   ```typescript
   // src/constants/metricDefinitions.ts
   
   export const METRIC_DEFINITIONS = {
     clarity: {
       name: 'Voice Clarity',
       icon: '💎',
       color: '#5856D6',
       tagline: 'How clear and crisp your voice sounds',
       description: 'Clarity measures how easy you are to understand...',
       benefits: 'High clarity signals intelligence and credibility...',
     },
     // ... all 6 metrics + Voice IQ
   };
   ```

**Deliverables:**
- [x] `src/utils/VoiceMetricsEngine.ts` - Main engine (placeholder heuristics)
 - [x] `src/constants/metricLabels.ts` - Label system
 - [x] `src/constants/metricDefinitions.ts` - Metadata
- [ ] Integration tests with sample audio
- [ ] Migration plan for existing user data

---

#### Sprint 1.4: Testing & Calibration (3 days)

**Goal:** Validate accuracy of all metrics against diverse voice samples.

**Tasks:**

1. **Create Test Suite**
   - Collect diverse voice samples (different genders, ages, accents)
   - Include edge cases: whispers, shouting, hoarse voices, monotone
   - Minimum 20 samples across spectrum

2. **Manual Validation**
   - Have 3+ humans rate each sample on each metric (0-100)
   - Compare human ratings to algorithm outputs
   - Adjust formulas to align with human perception

3. **Statistical Analysis**
   - Calculate correlation between algorithm and human ratings
   - Target: r > 0.75 for each metric
   - Document accuracy and limitations

4. **Calibration Tuning**
   - Fine-tune normalization ranges
   - Adjust weighting in composite formulas
   - Ensure realistic score distributions (most users 40-70 range)

5. **Performance Testing**
   - Measure calculation time per metric
   - Target: < 50ms for real-time analysis
   - Optimize bottlenecks (likely FFT operations)

**Deliverables:**
- [ ] Test audio library (20+ samples)
- [ ] Validation report with correlation scores
- [ ] Calibrated metric formulas
- [ ] Performance benchmark report
- [ ] Known limitations documentation

---

### **Phase 2: UI/UX Redesign (2-3 weeks)**

Transform the interface to showcase branded metrics as the centerpiece of user experience.

> _Status snapshot:_ Basic wiring is live (BrandedMetricsOverview component renders Voice IQ + six metrics across recording screens). Visual polish, animations, and shareable cards still to design.

#### Sprint 2.1: Design System & Branding (3 days)

**Goal:** Create comprehensive design system aligned with metric-driven brand identity.

**Tasks:**

1. **Visual Identity for Metrics**
   ```typescript
   // src/constants/brandColors.ts
   
   export const BRAND_COLORS = {
     clarity: '#5856D6',      // Purple (crystal/gem)
     power: '#FF9500',        // Orange (energy)
     health: '#FF3B30',       // Red (heart)
     warmth: '#FFCC00',       // Yellow (sun)
     confidence: '#AF52DE',   // Royal purple (crown)
     expressiveness: '#FF2D55', // Bright red (fire)
     voiceIQ: '#007AFF',      // Blue (premium/intelligence)
   };
   
   export const METRIC_GRADIENTS = {
     clarity: ['#5856D6', '#7B68EE'],
     // ... gradients for visual appeal
   };
   ```

2. **Icon System**
   - Create or source icons for each metric
   - Options: Custom SVGs, emoji, icon font (react-native-vector-icons)
   - Ensure consistent style (outlined vs filled, stroke weight)
   - File: `src/assets/icons/` or use emoji directly (💎⚡❤️☀️👑🔥)

3. **Typography Scale**
   ```typescript
   // src/constants/typography.ts
   
   export const TYPOGRAPHY = {
     voiceIQ: { size: 48, weight: '700' },      // Hero number
     metricScore: { size: 32, weight: '600' },  // Individual metric scores
     metricLabel: { size: 14, weight: '500' },  // Qualitative labels
     metricName: { size: 16, weight: '600' },   // Metric titles
     body: { size: 16, weight: '400' },         // Descriptions
   };
   ```

4. **Animation & Interaction Design**
   - Score increment animations (odometer effect)
   - Metric card tap interactions
   - Celebration animations for milestones (Voice IQ > 80)
   - Haptic feedback patterns per metric

5. **Create Figma/Sketch Mockups** (if design resources available)
   - Main dashboard with Voice IQ + 6 metrics
   - Individual metric detail screens
   - Historical trend charts
   - Recording interface with live metrics

**Deliverables:**
- [ ] `src/constants/brandColors.ts`
- [ ] `src/constants/typography.ts`
- [ ] Icon assets or emoji mapping
- [ ] Design mockups (screenshots/Figma)
- [ ] Animation specifications

---

#### Sprint 2.2: Metric Dashboard Components (4 days)

**Goal:** Build reusable UI components to display metrics beautifully.

**Tasks:**

1. **MetricCard Component**
   ```typescript
   // src/components/MetricCard.tsx
   
   interface MetricCardProps {
     metricName: 'clarity' | 'power' | 'health' | 'warmth' | 'confidence' | 'expressiveness';
     score: number;
     label: string;
     trend?: 'up' | 'down' | 'stable';
     trendValue?: number;
     onPress?: () => void;
   }
   
   export const MetricCard: React.FC<MetricCardProps> = ({ ... }) => {
     // Display:
     // - Icon (top)
     // - Score (large, center)
     // - Label (below score)
     // - Small trend indicator (+5 ↑)
     // - Background gradient based on metric color
     // - Shadow/elevation for card effect
   };
   ```
   - Use Skia for smooth gradients
   - Animated score transitions
   - Tap → navigate to metric detail screen

2. **VoiceIQDisplay Component**
   ```typescript
   // src/components/VoiceIQDisplay.tsx
   
   interface VoiceIQDisplayProps {
     score: number;
     label: string;
     previousScore?: number;
   }
   
   export const VoiceIQDisplay: React.FC<VoiceIQDisplayProps> = ({ ... }) => {
     // Hero display:
     // - Large circular progress indicator (0-100)
     // - Voice IQ number in center (48pt)
     // - Label below
     // - Change indicator if previousScore provided
     // - Celebration confetti if score > 80
   };
   ```

3. **MetricGrid Component**
   ```typescript
   // src/components/MetricGrid.tsx
   
   export const MetricGrid: React.FC<{ metrics: BrandedMetrics }> = ({ metrics }) => {
     // 2-column grid of 6 MetricCards
     // Responsive layout
     // Smooth scroll if needed
   };
   ```

4. **TrendChart Component**
   ```typescript
   // src/components/TrendChart.tsx
   
   interface TrendChartProps {
     data: Array<{ date: Date; score: number }>;
     metricName: string;
     color: string;
   }
   
   export const TrendChart: React.FC<TrendChartProps> = ({ ... }) => {
     // Line chart showing metric over time
     // X-axis: dates (7 days, 30 days, 90 days)
     // Y-axis: 0-100 score
     // Gradient fill under line
     // Dot markers for data points
   };
   ```
   - Use Skia or react-native-svg
   - Smooth animations
   - Interactive tooltips on tap

5. **ComparisonChart Component** (for future benchmarking)
   ```typescript
   // src/components/ComparisonChart.tsx
   
   // Radar/spider chart showing user's 6 metrics vs average
   // "You vs. Top Performers"
   ```

**Deliverables:**
- [ ] `src/components/MetricCard.tsx`
- [ ] `src/components/VoiceIQDisplay.tsx`
- [ ] `src/components/MetricGrid.tsx`
- [ ] `src/components/TrendChart.tsx`
- [ ] Storybook/component preview (optional)

---

#### Sprint 2.3: Screen Redesigns (5 days)

**Goal:** Rebuild main screens around metric-first user experience.

**Tasks:**

1. **Home/Dashboard Screen** (New/Redesigned)
   ```typescript
   // src/screens/DashboardScreen.tsx
   
   export const DashboardScreen: React.FC = () => {
     // Layout:
     // 1. Header: "Your Voice Profile"
     // 2. VoiceIQDisplay (hero section)
     // 3. MetricGrid (6 metrics in 2x3 grid)
     // 4. Quick actions: "Record New", "View History"
     // 5. Optional: Daily tip or insight
   };
   ```
   - Load latest recording's metrics
   - If no recordings, show "Record your first sample" CTA
   - Pull-to-refresh to recalculate from latest recording

2. **Recording Screen** (Enhanced)
   ```typescript
   // src/screens/MainRecordingScreen.tsx (existing)
   
   // Add:
   // - Live metric preview (simplified, maybe 2-3 key metrics)
   // - Voice IQ calculation post-recording
   // - Immediate metric results screen after stop
   ```
   - Show real-time Clarity + Power during recording (if performant)
   - After stop → animate to results screen with all 6 metrics

3. **Recording Results Screen** (New)
   ```typescript
   // src/screens/RecordingResultsScreen.tsx
   
   export const RecordingResultsScreen: React.FC = ({ recordingId }) => {
     // Layout:
     // 1. "Your Results" header
     // 2. VoiceIQDisplay (with celebration animation if score improved)
     // 3. MetricGrid
     // 4. Share button (screenshot of metrics)
     // 5. "Save & Continue" or "Retake"
   };
   ```
   - Auto-navigate here after recording stops
   - Compare to previous recordings
   - Option to name recording here

4. **Metric Detail Screen** (New)
   ```typescript
   // src/screens/MetricDetailScreen.tsx
   
   export const MetricDetailScreen: React.FC = ({ metricName }) => {
     // Navigate here when tapping a MetricCard
     
     // Layout:
     // 1. Large metric icon + name
     // 2. Current score (large)
     // 3. Tagline ("How clear your voice sounds")
     // 4. TrendChart (historical data)
     // 5. "What This Means" section (description)
     // 6. "How to Improve" section (coaching tips)
     // 7. Recent recordings list filtered/sorted by this metric
   };
   ```
   - Educational content per metric
   - Actionable coaching tips
   - Historical performance data

5. **Recordings List Screen** (Enhanced)
   ```typescript
   // src/screens/RecordingsListScreen.tsx (existing)
   
   // Add:
   // - Sort by: Date, Voice IQ, any specific metric
   // - Filter by: Score range, date range
   // - Display Voice IQ badge on each recording card
   ```

6. **Settings/Profile Screen** (Enhanced)
   - Add: Metric visibility toggles (hide metrics user doesn't care about)
   - Add: Benchmark preferences (compare to pros, peers, etc.)
   - Add: Coaching mode toggle (tips on/off)

**Deliverables:**
- [ ] `src/screens/DashboardScreen.tsx` (new)
- [ ] `src/screens/RecordingResultsScreen.tsx` (new)
- [ ] `src/screens/MetricDetailScreen.tsx` (new)
- [ ] Enhanced `MainRecordingScreen.tsx`
- [ ] Enhanced `RecordingsListScreen.tsx`
- [ ] Updated navigation structure

---

#### Sprint 2.4: Data Visualization & Animations (3 days)

**Goal:** Add polish with smooth animations and engaging visualizations.

**Tasks:**

1. **Score Increment Animation**
   ```typescript
   // src/components/AnimatedScore.tsx
   
   // Odometer-style number animation
   // When metric score updates, animate from old → new value
   // Use react-native-reanimated
   ```

2. **Celebration Effects**
   - Confetti animation for Voice IQ milestones (50, 70, 80, 90)
   - Haptic feedback on score reveals
   - Success checkmark animations

3. **Chart Animations**
   - Line chart draws in smoothly
   - Bars grow from 0 to final value
   - Fade-in for data points

4. **Micro-interactions**
   - MetricCard press → scale + haptic
   - Swipe gestures on trends (7d → 30d → 90d)
   - Loading states while calculating metrics

5. **Smooth Transitions**
   - Screen transitions (shared element if possible)
   - Metric updates fade rather than snap

**Deliverables:**
- [ ] `src/components/AnimatedScore.tsx`
- [ ] `src/components/CelebrationEffects.tsx`
- [ ] Animation utilities in `src/utils/animations.ts`
- [ ] Updated components with animations

---

### **Phase 3: Data Persistence & History (1 week)**

Enable tracking metrics over time for personal improvement journeys.

#### Sprint 3.1: Storage Schema Enhancement (2 days)

**Goal:** Extend storage to save metric history per recording.

**Tasks:**

1. **Update Recording Data Model**
   ```typescript
   // src/types/index.ts
   
   export interface RecordingMetadata {
     id: string;
     name: string;
     date: Date;
     duration: number;
     location?: string;
     filePath: string;
     
     // NEW: Branded metrics
     metrics: BrandedMetrics;
     
     // NEW: Historical tracking
     previousRecordingId?: string; // For comparisons
   }
   
   export interface MetricHistory {
     userId: string; // Future: multi-user support
     metricName: keyof BrandedMetrics;
     timeline: Array<{
       recordingId: string;
       date: Date;
       score: number;
     }>;
   }
   ```

2. **Storage Service Enhancement**
   ```typescript
   // src/utils/storage.ts (existing, enhance)
   
   export class StorageService {
     // Existing methods...
     
     // NEW:
     async saveMetricHistory(history: MetricHistory): Promise<void>;
     async getMetricHistory(metricName: string, days: number): Promise<MetricHistory>;
     async getVoiceIQTrend(days: number): Promise<Array<{date: Date; score: number}>>;
     async getAverageMetrics(days: number): Promise<Partial<BrandedMetrics>>;
   }
   ```

3. **Data Migration**
   - Migrate existing recordings to new schema
   - Calculate metrics retroactively if audio still available
   - Handle missing data gracefully (show "—" for old recordings)

4. **Backup & Export**
   - Export metrics as CSV/JSON
   - Backup to iCloud Drive (iOS)
   - GDPR compliance (user data export)

**Deliverables:**
- [ ] Updated type definitions
- [ ] Enhanced `storage.ts` with history methods
- [ ] Migration script for existing data
- [ ] Export functionality

---

#### Sprint 3.2: Trend Analysis & Insights (3 days)

**Goal:** Generate intelligent insights from metric trends.

**Tasks:**

1. **Trend Analysis Engine**
   ```typescript
   // src/utils/trendAnalysis.ts
   
   export function analyzeTrend(scores: number[]): {
     direction: 'improving' | 'declining' | 'stable';
     changePercent: number;
     velocity: number; // rate of change
   }
   
   export function detectMilestone(currentScore: number, previousScore: number): {
     isMilestone: boolean;
     type?: 'breakthrough' | 'threshold' | 'record';
     message?: string;
   }
   ```

2. **Insight Generator**
   ```typescript
   // src/utils/insightGenerator.ts
   
   export function generateInsights(metrics: BrandedMetrics, history: MetricHistory[]): string[] {
     // Examples:
     // - "Your Clarity improved 15% this week! 🎉"
     // - "Try working on Expressiveness to boost your Voice IQ"
     // - "You're in the top 20% for Warmth"
     // - "Record at the same time daily for better tracking"
   }
   ```
   - Rule-based initially
   - Future: ML-powered personalized coaching

3. **Progress Tracking**
   - Weekly summary notifications (optional)
   - Monthly progress reports
   - Goal setting per metric (e.g., "Reach 80 Clarity by Dec 1")

4. **Comparison Features**
   - Compare two recordings side-by-side
   - Best vs. worst recordings
   - Morning vs. evening voice patterns

**Deliverables:**
- [ ] `src/utils/trendAnalysis.ts`
- [ ] `src/utils/insightGenerator.ts`
- [ ] Insights display in Dashboard
- [ ] Comparison UI components

---

### **Phase 4: Marketing & Shareability (1 week)**

Make metrics viral through beautiful sharing features.

#### Sprint 4.1: Social Sharing Features (3 days)

**Goal:** Enable users to share their metric achievements.

**Tasks:**

1. **Share Card Generator**
   ```typescript
   // src/utils/shareCardGenerator.ts
   
   export async function generateShareCard(metrics: BrandedMetrics): Promise<string> {
     // Create image with:
     // - Voice IQ score (large)
     // - 6 metric icons + scores
     // - App branding
     // - Personal touch (user name, optional)
     // Return: URI to generated image
   }
   ```
   - Use react-native-view-shot to capture component as image
   - Or generate programmatically with Skia

2. **Share Component**
   ```typescript
   // src/components/ShareMetrics.tsx
   
   export const ShareMetrics: React.FC<{ metrics: BrandedMetrics }> = ({ ... }) => {
     const handleShare = async () => {
       const imageUri = await generateShareCard(metrics);
       await Share.share({
         message: `My Voice IQ is ${metrics.voiceIQ}! Check yours with [App Name]`,
         url: imageUri,
       });
     };
     
     // Button + preview
   };
   ```

3. **Templates**
   - Multiple share card designs (minimal, detailed, fun)
   - Hashtag suggestions (#VoiceIQ, #VocalConfidence)
   - App store link included

4. **Privacy Controls**
   - Option to hide specific metrics from share card
   - Anonymize data (no personal info unless user adds)

**Deliverables:**
- [ ] `src/utils/shareCardGenerator.ts`
- [ ] `src/components/ShareMetrics.tsx`
- [ ] 3 share card templates
- [ ] Privacy settings for sharing

---

#### Sprint 4.2: Branding Consistency (2 days)

**Goal:** Ensure all touchpoints reflect metric-driven brand identity.

**Tasks:**

1. **App Store Assets**
   - Update screenshots to showcase metrics dashboard
   - Feature Voice IQ prominently
   - Show before/after improvement stories

2. **Onboarding Flow**
   - Explain 6 metrics during first launch
   - Show sample metric results
   - Set user expectations ("Record weekly to track progress")

3. **Marketing Copy Alignment**
   - Update app description to lead with metrics
   - Feature testimonials using metric language
   - Create "How It Works" explainer with metrics

4. **In-App Branding**
   - Loading screens show metric tips
   - Error states stay on-brand
   - Empty states encourage metric improvement

5. **Help & Education**
   - FAQ about each metric
   - Video tutorials per metric (future)
   - Scientific references for credibility

**Deliverables:**
- [ ] Updated app store listing
- [ ] Onboarding screens with metric intro
- [ ] In-app educational content
- [ ] Marketing asset templates

---

### **Phase 5: Advanced Features (Optional, 2-4 weeks)**

Future enhancements to deepen metric value.

#### Potential Features:

1. **Coaching Mode**
   - Real-time feedback during recording
   - "Your Clarity just dropped - speak more clearly"
   - Post-recording actionable tips per metric

2. **Challenges & Gamification**
   - Daily challenges (e.g., "Boost your Warmth today")
   - Streaks for consistent recording
   - Achievements (badges for milestones)

3. **Benchmarking**
   - Compare your metrics to:
     - General population average
     - Your profession (sales, teaching, etc.)
     - Top performers
   - Anonymized leaderboards (opt-in)

4. **Custom Metric Weights**
   - Let users adjust Voice IQ formula based on goals
   - E.g., podcaster prioritizes Expressiveness + Clarity
   - Sales rep prioritizes Confidence + Warmth

5. **Voice Training Programs**
   - Guided 7-day / 30-day programs
   - Each day focuses on one metric
   - Exercises and drills

6. **Team/Enterprise Features**
   - Manager dashboard showing team's average Voice IQ
   - Before/after training comparisons
   - Export reports for HR/training departments

---

## 🗓️ Timeline & Resources

### Estimated Duration: 6-8 weeks

| Phase | Duration | Team Members |
|-------|----------|--------------|
| Phase 1: Metric Calculation | 2-3 weeks | 1-2 developers, 1 data scientist (part-time) |
| Phase 2: UI/UX Redesign | 2-3 weeks | 1-2 developers, 1 designer |
| Phase 3: Data & History | 1 week | 1 developer |
| Phase 4: Marketing & Sharing | 1 week | 1 developer, 1 marketer |
| Phase 5: Advanced Features | 2-4 weeks | Team (optional, ongoing) |

**Critical Path:**
1. Phase 1 Sprint 1.2 & 1.3 (calculation engine) - MUST complete first
2. Phase 2 Sprint 2.2 & 2.3 (UI components & screens) - Dependent on Phase 1
3. All other sprints can partially overlap

---

## 📊 Success Metrics

### Technical KPIs:
- [ ] All 6 metrics calculate in < 100ms total
- [ ] Voice IQ correlation with human ratings > 0.80
- [ ] 0 crashes related to metric calculations
- [ ] App size increase < 5MB from new features

### User Experience KPIs:
- [ ] 80%+ users complete first recording after onboarding
- [ ] Average session time increases by 50% (users explore metrics)
- [ ] 30%+ users record 2+ times per week (tracking trend)
- [ ] 10%+ users share their metrics on social media

### Branding KPIs:
- [ ] App store conversion rate increases by 20%
- [ ] "Voice IQ" mentioned in 50%+ of reviews
- [ ] User interviews confirm metrics are "easy to understand"
- [ ] Net Promoter Score (NPS) > 50

---

## 🚀 Quick Start Implementation

### Week 1 Action Items:

1. **Setup** (Day 1)
   - Create new branch: `feature/branded-metrics`
   - Review existing codebase (DONE - see PROJECT_STATUS.md)
   - Set up testing framework for new utilities

2. **Metric Specifications** (Day 2-3)
   - Write `METRIC_CALCULATIONS_SPEC.md`
   - Validate formulas with team/stakeholders
   - Identify any missing dependencies

3. **Begin Phase 1 Sprint 1.2** (Day 4-5)
   - Start with Jitter & Shimmer implementation
   - Test with sample audio files
   - Document any challenges

### Immediate Next Steps:

```bash
# 1. Create implementation branch
git checkout -b feature/branded-metrics

# 2. Create new directories for new utilities
mkdir -p voice-analyzer-mobile/src/utils/metrics
mkdir -p voice-analyzer-mobile/src/components/metrics

# 3. Start with spec document
touch voice-analyzer-mobile/METRIC_CALCULATIONS_SPEC.md

# 4. Create placeholder files for new utilities
touch voice-analyzer-mobile/src/utils/voiceHealthMetrics.ts
touch voice-analyzer-mobile/src/utils/formantAnalysis.ts
touch voice-analyzer-mobile/src/utils/speechFluency.ts
touch voice-analyzer-mobile/src/utils/VoiceMetricsEngine.ts
```

---

## 📚 Reference Materials

### Scientific Foundations:
- Jitter/Shimmer: Boersma, P. (1993). Accurate short-term analysis of the fundamental frequency
- HNR: de Krom, G. (1993). A cepstrum-based technique for determining HNR
- Formants: Peterson & Barney (1952). Control methods used in vowel formant studies
- Vocal warmth: Apple et al. (1979). Paralinguistic features of male and female speech

### Design Inspiration:
- Oura Ring app (sleep/readiness scores)
- Whoop fitness tracker (strain/recovery)
- Duolingo (gamification, streaks)
- Headspace (calm, encouraging coaching)

### Technical References:
- Existing codebase: `/voice-analyzer-mobile/src/utils/enhancedAudioAnalysis.ts`
- Audio feature extraction: `/voice-analyzer-mobile/src/utils/audioAnalysis.ts`
- Storage patterns: `/voice-analyzer-mobile/src/utils/storage.ts`

---

## ✅ Checklist: Pre-Implementation Review

Before starting development, ensure:

- [ ] Stakeholder buy-in on 6 metrics + Voice IQ concept
- [ ] Design mockups approved (or design-as-you-go greenlit)
- [ ] Scientific accuracy validated (formulas peer-reviewed)
- [ ] Brand naming finalized (Clarity, Warmth, etc. confirmed)
- [ ] Legal review for "Voice IQ" trademark potential
- [ ] Resource allocation confirmed (team availability)
- [ ] Testing plan in place (audio samples, user testing)
- [ ] Migration strategy for existing users documented

---

## 🎯 North Star Vision

**1 Year from Now:**

"Our app is synonymous with voice improvement. When someone says 'What's your Voice IQ?', people know exactly what they mean. Our 6 metrics—Clarity, Power, Health, Warmth, Confidence, Expressiveness—are recognized industry-wide as the standard for vocal assessment. Users track their metrics like they track steps or sleep. Sales teams use our app for training. Podcasters optimize their Expressiveness. Teachers monitor their Vocal Health. And we're the #1 voice app because we made complex voice science accessible, actionable, and aspirational through elegant branding."

**Let's build the FitBit for your voice. 🎙️**

---

## 📝 Notes & Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Nov 2025 | 6 metrics + Voice IQ composite | Balances simplicity (6 is memorable) with completeness (covers all dimensions of voice) |
| Nov 2025 | 0-100 scoring scale | Universal understanding, like grades or percentages |
| Nov 2025 | Qualitative labels (e.g., "Crystal Clear") | Makes numbers emotionally resonant and shareable |
| Nov 2025 | "Voice IQ" as flagship metric name | Instantly communicates concept, ownable, marketable |

---

**Document Version:** 1.0  
**Status:** 📋 Ready for Review & Approval  
**Next Update:** After Phase 1 Sprint 1.1 completion
