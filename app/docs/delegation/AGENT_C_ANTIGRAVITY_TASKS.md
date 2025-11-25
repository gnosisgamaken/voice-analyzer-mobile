# Agent C (Antigravity) - Integration & Insights Tasks

**Role:** Lead Architect / Product Engineer
**Focus:** Integration, Business Logic, Companion Features
**Context:** You glue the design and engineering together into a cohesive product.

## 📋 Task List

### 1. Insights Engine
- [ ] **Create `insightsEngine.ts`**
    - Path: `app/src/utils/insightsEngine.ts`
    - Specs:
        - Input: Current metrics + Historical data.
        - Output: Text strings (e.g., "Your Clarity is up 10% this week").
        - Logic: Compare current vs. baseline (first 5) vs. moving average.
- [ ] **Tagging System**
    - Implement SUCCESs tags (Simple, Unexpected, Concrete, Credible, Emotional, Stories) for insights.

### 2. Notifications
- [ ] **Implement `notificationService.ts`**
    - Path: `app/src/services/notificationService.ts`
    - Specs:
        - Schedule local notifications.
        - Triggers: "Streak kept", "New baseline established", "Weekly summary".

### 3. Orchestration & UI Wiring
- [ ] **Wire Main Recording Screen**
    - Connect `useAudioRecorder` (Agent B) to `LiquidGlassView` (Agent A).
    - Display real-time metrics from `brandedMetricsEngine`.
- [ ] **Wire Results Screen**
    - Show `Voice IQ` score with "Solid Elevated" card style.
    - Show generated Insights.

### 4. Final Review
- [ ] **Code Audit**
    - Ensure all agents followed the "Function Before Flair" principle.
    - Verify no "placeholder" code remains.
