# Beta MVP Definition: Voice Analyzer

This document provides the structured schema of requirements that must be met to officially declare the Voice Analyzer application as a "Beta MVP." This serves as the final checklist before releasing the app to our first cohort of external testers.

## 1. Core Functionality

This section ensures the primary user value proposition is delivered reliably.

| ID | Feature | Completion Criteria | Status |
| :--- | :--- | :--- | :--- |
| **CF-01** | **Audio Recording** | 🔹 User can start, pause, resume, and stop a recording from the `MainRecordingScreen`.<br>🔹 A visual indicator (e.g., waveform, timer) confirms that audio is being captured.<br>🔹 The raw audio is successfully saved to a temporary file upon stopping. | ⏳ |
| **CF-02** | **Native Audio Pipeline** | 🔹 The app correctly uses the native audio engine (`AVAudioEngine` / `AudioRecord`) as defined in `docs/NATIVE_AUDIO_REFINEMENT_SPEC.md`.<br>🔹 The system gracefully falls back to a simulated/degraded mode if the native module fails, and informs the user.<br>🔹 Measurement Integrity Check (clipping, noise) runs on all recordings. Recordings with poor quality are flagged in the UI. | ⏳ |
| **CF-03** | **Metrics Calculation** | 🔹 Upon completion of a recording, all six Branded Metrics and the Voice IQ™ score are calculated.<br>🔹 The calculations are based on the **Health-Focused Composite Model (Model B)** as defined in `docs/BRANDED_METRICS_SCIENTIFIC_VALIDATION.md`. | ⏳ |
| **CF-04** | **Results Display** | 🔹 The calculated metrics are displayed on the `RecordingDetailsScreen`.<br>🔹 Each metric shows its score, qualitative label (e.g., "Clear," "Steady"), and a color-coded indicator.<br>🔹 The Voice IQ™ score is prominently displayed. | ✅ |
| **CF-05** | **Recording History** | 🔹 All completed recordings are listed on the `RecordingsListScreen`.<br>🔹 Each list item shows key information (e.g., date, duration, Voice IQ™ score).<br>🔹 Tapping a list item navigates to the corresponding `RecordingDetailsScreen`. | ✅ |
| **CF-06** | **Baseline & Trends** | 🔹 The app establishes a baseline after the first 5 recordings.<br>🔹 The `RecordingDetailsScreen` shows trend indicators (e.g., ↑, ↓, →) for metrics compared to the previous recording or the baseline. | ✅ |
| **CF-07** | **Insights Engine** | 🔹 The app generates at least one contextual insight per recording (e.g., "Clarity is higher than your average," "Consider rest and hydration").<br>🔹 Insights are displayed on the `RecordingDetailsScreen`. | ✅ |

---

## 2. Product & UX Polish

This section ensures the app feels stable, professional, and trustworthy to beta testers.

| ID | Aspect | Completion Criteria | Status |
| :--- | :--- | :--- | :--- |
| **UX-01** | **Design System** | 🔹 All screens and components adhere to the Liquid Glass design system (`LIQUID_GLASS_MASTER_PLAN.md`).<br>🔹 `MaterialCard` and `LiquidGlassView` are used consistently for chrome and content.<br>🔹 Typography and spacing follow the `design/tokens.ts` definitions. | ⏳ |
| **UX-02** | **Performance** | 🔹 App starts in under 3 seconds (cold start).<br>🔹 UI animations and transitions maintain a consistent 60 FPS on target devices (iPhone 12+, modern Android equivalent).<br>🔹 Metric calculation takes no more than 5 seconds for a 1-minute recording. | ⏳ |
| **UX-03** | **Stability** | 🔹 The app has a crash-free session rate of > 99% as measured by a monitoring tool (e.g., Sentry, Firebase Crashlytics).<br>🔹 All known critical bugs from internal QA have been resolved. | ⏳ |
| **UX-04** | **Accessibility (A11y)**| 🔹 The app meets the baseline accessibility requirements defined in `docs/APP_STORE_PREP_CHECKLIST.md`.<br>🔹 All interactive elements are correctly labeled for VoiceOver/TalkBack.<br>🔹 Dynamic Type is respected on all text content. | ⏳ |
| **UX-05** | **Onboarding & Education**| 🔹 A minimal onboarding flow explains what the app does and asks for necessary permissions (microphone).<br>🔹 Each metric has a user-accessible explanation (e.g., via a tooltip or modal) as defined in the roadmap. | ⏳ |

---

## 3. Launch Readiness

This section covers the final logistical steps for a beta release.

| ID | Task | Completion Criteria | Status |
| :--- | :--- | :--- | :--- |
| **LR-01** | **Build & Distribution**| 🔹 A production build of the app is successfully created for both iOS and Android.<br>🔹 The app is successfully uploaded to TestFlight (for iOS) and Google Play Console Internal/Closed Testing track (for Android). | ⏳ |
| **LR-02** | **App Store Presence**| 🔹 All required metadata (app name, description, keywords, privacy policy URL) is finalized and entered in App Store Connect and Google Play Console.<br>🔹 The `PrivacyInfo.xcprivacy` manifest is included in the iOS build.<br>🔹 The App Store Review Notes are prepared as per `docs/APP_STORE_PREP_CHECKLIST.md`. | ⏳ |
| **LR-03** | **Beta Tester Management**| 🔹 A list of at least 20-50 internal or closed beta testers has been compiled.<br>🔹 A feedback mechanism is in place (e.g., a shared document, a dedicated email address, or a service like Instabug).<br>🔹 A welcome email with instructions on how to install the app and provide feedback is drafted. | ⏳ |
| **LR-04** | **Analytics & Monitoring**| 🔹 Basic analytics (screen views, recording events) and crash reporting are integrated and confirmed to be working in production builds. | ⏳ |

---

### Definition of Done

The "Beta MVP" can be declared **complete** only when all items in all three categories are marked as `✅`. Items currently in progress are marked as `⏳`.
