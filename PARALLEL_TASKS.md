# Parallel Development Task Lists

**Date:** November 16, 2025  
**Current Status:** Week 3 complete - UI components for branded metrics implemented  
**Goal:** Advance to Week 4-5 completion in parallel

---

## 🤖 Agent 1 (Current Agent) - Integration & Live Features

**Focus:** Integrate branded metrics into live recording and add companion features

### Task 1.1: Integrate Branded Metrics into Live Recording Flow
- [ ] Update `useAudioRecorder` hook to calculate branded metrics from VoiceMetrics
  - Import `calculateBrandedMetrics` from brandedMetricsEngine
  - Add brandedMetrics to VoiceSample type
  - Calculate on each audio frame update
- [ ] Update `MainRecordingScreen` to display live branded metrics
  - Replace old BrandedMetricsOverview with new BrandedMetricCard components
  - Show Voice IQ at top (hero position)
  - Show 6 metrics in 2x3 grid below
- [ ] Update `RecordingDetailsScreen` to show branded metrics for saved recordings
  - Add Voice IQ display
  - Add all 6 metric cards
  - Show historical comparison if baseline exists
- [ ] Test live metrics update during recording
  - Verify calculations work in real-time
  - Check performance (should maintain 60fps)

**Estimated Time:** 2-3 hours  
**Deliverable:** Live branded metrics displaying during and after recording

---

### Task 1.2: Historical Tracking & Baselines (Week 5)
- [ ] Create baseline establishment system
  - Add `baselineMetrics.ts` utility
  - Store first 5 recordings as baseline
  - Calculate average for each metric
  - Save to AsyncStorage/IndexedDB
- [ ] Implement trend tracking
  - Add `trendTracking.ts` utility
  - Calculate 7-day and 30-day averages
  - Detect improvements/declines (±3 point threshold)
  - Store trend history
- [ ] Update UI to show trends
  - Add trend indicators to metric cards
  - Show "vs baseline" comparisons
  - Add sparkline graphs (mini 7-day charts)
- [ ] Add baseline UI
  - "Building your baseline... 3 of 5 recordings complete" message
  - Progress indicator
  - Explanation of why baseline matters

**Estimated Time:** 3-4 hours  
**Deliverable:** Baseline system and trend tracking working

---

### Task 1.3: Session State Management
- [ ] Add session info card with dynamic copywriting
  - Use SESSION_COPY from MainRecordingScreen
  - Update based on recording state
  - Add visual state indicators (dots, colors)
- [ ] Implement recording metadata
  - Add timestamps
  - Add session duration
  - Add recording quality indicators
- [ ] Create recording list enhancements
  - Show Voice IQ in list items
  - Sort by date/Voice IQ/metrics
  - Add filters (last 7 days, high scores, etc.)

**Estimated Time:** 2 hours  
**Deliverable:** Better session management and list navigation

---

## 🔧 Agent 2 (GPT-5.1 Codex) - Educational Content & Microcopy

**Focus:** Implement Week 4 microcopy system and educational content

### Task 2.1: Metric Explanations & Educational Modals
- [ ] Create `MetricExplanationModal.tsx` component
  - Full-screen or sheet modal
  - Metric icon, name, and detailed description
  - "Why it matters" section
  - "How to improve" tips
  - Example use cases (podcasters, singers, presenters)
  - Close/dismiss interaction
- [ ] Add "Learn more" buttons to all metric cards
  - Tap metric card → open explanation modal
  - Smooth transition animation
  - Pass metric name as parameter
- [ ] Create educational content for each metric
  - **Clarity:** "Articulation, spectral balance, noise reduction tips"
  - **Power:** "Projection, volume consistency, breathing techniques"
  - **Health:** "Vocal strain indicators, hydration, rest importance"
  - **Warmth:** "Tone quality, resonance, emotional connection"
  - **Confidence:** "Steadiness, pitch control, reducing nervousness"
  - **Expressiveness:** "Dynamic range, storytelling, engagement"
  - **Voice IQ:** "Composite score explanation, balanced voice"
- [ ] Add to navigation and test interactions

**Estimated Time:** 3-4 hours  
**Deliverable:** Interactive educational system for all metrics

---

### Task 2.2: Microcopy System Implementation
- [ ] Create `microcopy.ts` utility with all copywriting
  - Empty states
  - Post-recording messages
  - Milestone celebrations
  - Behavioral suggestions
  - Error/warning messages
- [ ] Implement empty state messages
  - First-time user: "Your voice has a story. Ready for the next chapter?"
  - No recordings: "Tap record to discover your vocal signature"
  - No baseline yet: "Record 5 sessions to establish your vocal baseline"
- [ ] Add post-recording insights
  - High clarity: "Clarity: 87. Your voice cuts through noise—clear, confident, unmistakable."
  - Low health: "Health is lower than usual. Consider rest and hydration."
  - Improvement: "Your clarity improved 8 points. Whatever you're doing is working."
- [ ] Implement milestone messages
  - 3-day streak: "3 days strong. Consistency is power."
  - 7-day streak: "7 days of healthy voice. That's a Milestone Moment."
  - Personal best: "Personal Best: Clarity 92. Your highest score yet!"
  - All metrics healthy: "Resilience streak! All metrics in healthy range."
- [ ] Add behavioral suggestions (gentle coaching)
  - Low Power: "Warm up your voice before speaking."
  - Great Clarity: "Your articulation is sharp today."
  - Low Health: "Consider hydration – it helps Vocal Health."

**Estimated Time:** 2-3 hours  
**Deliverable:** Complete microcopy system with UX copywriting principles

---

### Task 2.3: Notification System & Gentle Nudges (Week 7)
- [ ] Create `notificationService.ts`
  - Request notification permissions
  - Schedule personalized notifications
  - Handle notification interactions
- [ ] Implement notification types
  - **Value-forward:** "Your voice story has a new chapter." (weekly check-in)
  - **Celebration:** "You've kept your clarity strong for 7 days."
  - **Gentle reminder:** "It's been a week since your last check-in. Want to see what changed?"
  - **Milestone:** "Personal best unlocked! Check your Voice IQ."
- [ ] Add notification settings screen
  - Toggle notifications on/off
  - Frequency selection (daily/weekly/off)
  - Time preference
  - "Fewer notifications" quick toggle
  - Preview examples
- [ ] Implement smart scheduling
  - Don't notify during recording
  - Respect user's time zone
  - Adaptive timing (when user typically records)
  - No spam (max 1 per day)

**Estimated Time:** 3-4 hours  
**Deliverable:** Respectful notification system with user control

---

### Task 2.4: Insights Engine (Week 6)
- [ ] Create `insightsEngine.ts`
  - Pattern detection algorithms
  - Insight generation rules
  - Personalization logic
- [ ] Implement insight categories
  - **What's Improving:** "Your Clarity improved 12% this week"
  - **What to Watch:** "Expressiveness has decreased – feeling tired?"
  - **Streaks:** "Power consistently strong for 5 days"
  - **Correlations:** "Your Voice IQ is highest in the morning"
- [ ] Add insights display to screens
  - Insights card on RecordingDetails
  - Weekly summary on RecordingsList
  - Scrollable insights carousel
- [ ] Create insight templates with copywriting
  - Gain framing: "You can gain 15 points in Health with rest"
  - Celebration: "Warmth reached personal best!"
  - Curiosity: "Want to see your weekly trend?"

**Estimated Time:** 3-4 hours  
**Deliverable:** Intelligent insights engine with pattern detection

---

## 📋 Coordination Strategy

### Git Workflow
1. **Agent 1** works on `feature/live-metrics-integration` branch
2. **Agent 2** works on `feature/educational-content` branch
3. Merge to `main` after each task completion
4. Communicate merge points to avoid conflicts

### Shared Files (Coordination Required)
- `app/src/types/index.ts` - Both may need to update types
- `app/src/constants/index.ts` - Both may add constants
- `app/src/screens/MainRecordingScreen.tsx` - Agent 1 priority
- `app/src/screens/RecordingDetailsScreen.tsx` - Agent 1 priority

### Independent Files (No Conflicts)
- Agent 1: `useAudioRecorder.ts`, `baselineMetrics.ts`, `trendTracking.ts`
- Agent 2: `MetricExplanationModal.tsx`, `microcopy.ts`, `insightsEngine.ts`, `notificationService.ts`

---

## 🎯 Success Criteria

**After Agent 1 Tasks:**
- ✅ Live branded metrics display during recording
- ✅ Baseline system established (first 5 recordings)
- ✅ Trend tracking working (vs baseline)
- ✅ Historical comparison on details screen

**After Agent 2 Tasks:**
- ✅ Educational modals for all 7 metrics
- ✅ Complete microcopy system (empty states, insights, milestones)
- ✅ Notification system with user preferences
- ✅ Insights engine generating personalized messages

**Combined Result:**
- Users see live branded metrics while recording
- Educational content helps them understand metrics
- Microcopy makes the app feel supportive and calm
- Insights and notifications build long-term engagement
- **Roadmap Status: Week 7 complete (ahead of schedule!)**

---

## 📊 Time Estimates

| Agent | Tasks | Estimated Time | Deliverables |
|-------|-------|----------------|--------------|
| Agent 1 | 3 task groups | 7-9 hours | Live metrics, baselines, trends |
| Agent 2 | 4 task groups | 11-15 hours | Education, microcopy, notifications, insights |

**Total Parallel Time:** ~15 hours (vs 26 hours sequential)  
**Time Saved:** ~11 hours (42% reduction)

---

## 🚀 Next Steps After Parallel Work

Once both agents complete their tasks:
1. Merge both branches to main
2. Test integrated experience end-to-end
3. Fix any integration bugs
4. Move to **Phase 3: Engagement & Retention** (Week 7-8)
   - Shareable metric cards
   - Social features
   - Export functionality
5. Then **Phase 4: Design System** (Week 9-10)
   - Liquid Glass implementation
   - iOS 26 design polish

---

**Current Position:** Week 3 Complete  
**Target Position:** Week 7 Complete  
**Acceleration:** 4 weeks of work in parallel = 2 weeks calendar time
