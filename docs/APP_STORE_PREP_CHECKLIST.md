# App Store Preparation & Accessibility Checklist

This document provides the checklists and boilerplate text required to ensure the Voice Analyzer app meets accessibility standards and is ready for a smooth App Store submission process.

## 1. Accessibility (WCAG 2.1 AA) Checklist

This checklist is based on the research findings and targets key areas for ensuring the app is usable by people with disabilities.

### 1.1. Core Principles

- [ ] **Labels & Names:** Every interactive element has a clear `accessibilityLabel`. Custom charts and visualizations have a descriptive label summarizing their content.
- [ ] **Roles & Hints:** Components have appropriate `accessibilityRole` (e.g., "button", "header", "adjustable"). Use `accessibilityHint` for non-obvious actions.
- [ ] **Dynamic Type:** All text must scale correctly with the user's system font size settings. Layouts must be flexible (`flex`) and avoid fixed heights or truncation.
- [ ] **Color & Contrast:** All text meets the 4.5:1 contrast ratio. UI information is not conveyed by color alone (e.g., use icons or text labels alongside color).
- [ ] **Focus & Navigation:** Navigation order is logical and follows visual layout. No focus traps. Test with VoiceOver/TalkBack.
- [ ] **Gestures:** All custom gestures (e.g., pinch-to-zoom on a waveform) must have an alternative control (e.g., +/- buttons).
- [ ] **Announcements:** Use `AccessibilityInfo.announceForAccessibility()` to inform users of important real-time events (e.g., "Recording started," "Clipping detected").

### 1.2. Component-Specific Actions

- [ ] **`WaveformView`:**
    - If purely decorative, mark with `accessible={false}` to be skipped by screen readers.
    - If it conveys information, provide a summary label, e.g., `accessibilityLabel="Waveform visualization of your 10-second recording."`.

- [ ] **`BrandedMetricsOverview` (Chart):**
    - The chart as a whole should have a summary label: `accessibilityLabel="Summary of your voice metrics. Clarity: 85, Power: 70..."`.
    - Each metric slice/bar within the chart should also be individually focusable, providing its own label and value: `accessibilityLabel="Clarity" accessibilityValue="85 out of 100"`.

- [ ] **Custom Sliders/Dials:**
    - Use `accessibilityRole="adjustable"`.
    - Implement `onAccessibilityAction` to respond to swipe-up/down gestures from screen readers to change the value.
    - Announce the new value after an adjustment.

## 2. App Store Submission & Privacy

This section contains the required text and justifications for App Store Connect.

### 2.1. `PrivacyInfo.xcprivacy` Manifest

This file must be included in the iOS project to declare API usage.

**Boilerplate XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>NSPrivacyAccessedAPITypes</key>
	<array>
		<dict>
			<key>NSPrivacyAccessedAPIType</key>
			<string>NSPrivacyAccessedAPICategoryMicrophone</string>
			<key>NSPrivacyAccessedAPITypeReasons</key>
			<array>
				<!-- Use the most appropriate reason code from Apple's list, e.g., for user-initiated audio capture -->
				<string>3B1D.1</string> 
                <!-- Note: As of early 2024, 3B1D.1 corresponds to "Capture audio to process on-device for a feature the user expects." Verify the latest code on Apple's developer site. -->
			</array>
		</dict>
	</array>
</dict>
</plist>
```
**User-Facing `Info.plist` String:**
- **Key:** `NSMicrophoneUsageDescription`
- **Value:** `Voice Analyzer requires microphone access to capture your voice for on-device analysis. This allows us to provide you with real-time feedback on your vocal health and performance.`

### 2.2. App Store Review Notes

Proactively provide this text in the "Notes" section of your App Store Connect submission to justify API usage.

**Template Text:**

> **Subject: Justification for Microphone and Background Audio Usage**
> 
> **Microphone Usage (`NSMicrophoneUsageDescription`):**
> This app's core functionality is to analyze a user's voice. The user explicitly presses a "Record" button to initiate audio capture. All audio processing is performed **on-device** to calculate vocal health metrics. No audio data is ever sent to our servers or any third party. The microphone is only used when the user is actively recording, and this is clearly indicated in the UI.
> 
> **Background Audio Mode (`UIBackgroundModes`):**
> We have enabled the "audio" background mode for one specific reason: to allow users to complete longer vocal exercises without interruption. For example, a user may start a 2-minute recording and then lock their screen or switch to another app. This background mode ensures the recording continues seamlessly, providing a complete analysis as the user expects. The app does not play any audio in the background and only keeps the recording session active for the duration of the user-initiated exercise. The recording status is clearly indicated to the user.
> 
> This functionality is crucial for providing a reliable and professional-grade user experience, consistent with other high-quality audio analysis and recording applications.

### 2.3. App Privacy "Nutrition Labels"

In App Store Connect, configure the privacy labels as follows:

- **Data Type:** Audio Data
- **Collected from the user:** Yes
- **Linked to the user:** Yes (as it's part of their profile and history)
- **Used for:**
    - [x] App Functionality
    - [ ] Health & Fitness (select if positioning as a health app)
- **Tracking:** No (explicitly state we do not use this data for tracking).
- **Third-Party Sharing:** No.
