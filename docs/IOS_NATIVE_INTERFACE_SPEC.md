# iOS Native Interface Spec (v1)

Author: Codex  
Scope: iOS 17/18 + visionOS-adjacent native experience for Voice Analyzer MVP  
Last updated: <!-- date placeholder --> November 2025

---

## 1. Experience Principles
1. **Calm Precision** – UI should feel like an Apple first-party wellness tool: sparse, confident typography, no gratuitous chrome.  
2. **Glass for Chrome, Solid for Data** – navigation, tab bars, and secondary surfaces use Liquid Glass; metrics and text-heavy cards remain solid for legibility.  
3. **Accessibility by Default** – every component responds to Dynamic Type, Reduce Motion, Reduce Transparency, and Increase Contrast without alternate builds.  
4. **Delight with Restraint** – haptics + motion punctuate key state changes (start/stop recording, milestone insights) with micro animations that respect accessibility settings.

---

## 2. Layout & Spacing System
| Token | Value | Usage |
| ----- | ----- | ----- |
| `space-xxs` | 4 pt | micro gaps between icon + text |
| `space-xs` | 8 pt | inline chips, label groupings |
| `space-sm` | 12 pt | inner padding for small cards |
| `space-md` | 16 pt | default horizontal screen margin, basic card padding |
| `space-lg` | 24 pt | vertical rhythm between sections |
| `space-xl` | 32 pt | hero spacing, between major groups |

- Screen gutters: 16 pt on iPhone, 24 pt on iPad.  
- Tap target minimum: 44 × 44 pt, enforced via hitSlop if visual size is smaller.  
- Cards (metric, insight, baseline) use 20 pt inner padding, 20 pt corner radius.  
- Glass shells use 28 pt radius to echo Apple Fitness/Health cards.  
- Nav/tab bars respect system heights (Large Title ~52 pt, standard nav 44 pt, tab bar 50 pt).

---

## 3. Typography & Iconography
| Style | UIFont Text Style | Weight | Notes |
| ----- | ----------------- | ------ | ----- |
| Display / Large Title | `.largeTitle` | Bold | Used in nav bars; shrinks to title on scroll |
| Headline / Card Title | `.title2` | Semibold | Metrics, insight titles |
| Body | `.body` | Regular | Paragraph copy & coaching text |
| Caption | `.caption1` | Medium | Eyebrow labels, chip text |
| Microcopy | `.caption2` | Regular | Helper text, tags |

- Use `UIFontMetrics` / SwiftUI `Font` so all styles respond to Dynamic Type up through Accessibility sizes.  
- Always set `adjustsFontForContentSizeCategory = true`.  
- Icons: SF Symbols only for UI chrome (tab bar, nav buttons, notification controls). Use a single treatment per context (outline or filled) for cohesion. Custom icons must match SF Symbol stroke weight and cap style.  
- Symbols scale with accompanying text style (e.g., `.symbolEffect(.scale)` or `UIImage.SymbolConfiguration(font: ...)`).  
- Include `accessibilityLabel` for symbols that are tappable (“Notifications”, “Recordings” etc.).

---

## 4. Color, Material & Elevation

### Core Palette
| Token | Light | Dark | Usage |
| ----- | ----- | ---- | ----- |
| `bg-primary` | `#F2F2F7` | `#050510` | App background |
| `bg-glass` | Linear gradient `rgba(255,255,255,0.24)` overlay on blur | `rgba(5,8,30,0.55)` | Liquid Glass containers |
| `bg-card` | `#FFFFFF` | `#101223` | Solid cards (metrics/data) |
| `text-primary` | `#000000` | `#FFFFFF` | Headings |
| `text-secondary` | `#6C6C70` | `#B0B3C7` | Body copy |
| `tint` | `#246BFD` | `#528BFF` | Emphasis (buttons, progress) |
| Metric colors | Derived from brand spec (clarity `#5A80FF`, power `#FF9F0A`, etc.) | same | Metric chips/progress |

### Materials
- **Liquid Glass – Regular:** `BlurView` with radius 30, saturation boost 1.9, overlay gradient (top highlight, bottom tint).  
- **Liquid Glass – Clear:** same blur with reduced tint, used for nav bars/tab bars.  
- **Solid Elevated:** background color + subtle drop shadow (`rgba(0,0,0,0.15)` y=4, blur 20).  
- Honor Reduce Transparency: swap blur shells for solid `bg-card` backgrounds while maintaining text contrast (>=4.5:1). Add `useReduceTransparency` hook to all Material components.
- Honor Reduce Motion: disable decorative glass effects (`glassSheen`, `glassAccent`) when enabled. Add `useReduceMotion` hook to all Material components that have animations.

---

## 5. Components

### Navigation
- React Navigation stack + tab bar.  
- Large Title header on primary tabs (Recorder, Recordings). On scroll, collapse to standard title automatically.  
- Tab bar uses Liquid Glass Clear, SF Symbols for icons, haptic `.light` on selection.  
- Provide `accessibilityRole="tab"` and `accessibilityState` for selection.

### Cards
1. **Metric Card:** solid background, icon badge, score, qualitative label. Supports Dynamic Type, Reduce Motion (no animated gradients when enabled).  
2. **Insight Card:** stacked list with badge + copy; tinted backgrounds based on tone.  
3. **Baseline Progress:** progress bar with 4px radius, displays count text; uses `tint` color.

### Controls
- **Record Button:** circular 72 pt min, spring animation on press (duration 0.3, damping 0.65). Haptic `.medium` on start, `.success` on stop.  
- **Toggle Chips:** pill buttons for filters (hydration, whisper). 12 pt padding, 999 radius.  
- **Notifications Switches:** use native `Switch` to inherit accessibility + color.

### Feedback
- Use `UIImpactFeedbackGenerator(style: .medium)` for primary taps, `UINotificationFeedbackGenerator` for success/warning states (baseline locked, recording error).  
- Visual states must have textual equivalents; do not rely solely on color/haptic.

---

## 6. Motion & Haptics Guidelines
- Default animations use UIKit spring: `duration: 0.5`, `damping: 0.8`, `response: 0.4`.  
- Reduce Motion: check `UIAccessibility.isReduceMotionEnabled`; if true, replace springs with fades or instant state changes.  
- Recording waveform animates at 60 fps; degrade to simple level bar when Reduce Motion on.  
- Lottie or heavy animations are prohibited until PCM pipeline stable.  
- Provide haptics only on meaningful events: start/stop recording, milestone unlocked, notification preference saved. Never vibrate continuously without user action.

---

## 7. Accessibility Checklist
1. **Dynamic Type:** test Small → Accessibility XXL on all screens; no clipped text.  
2. **VoiceOver:** every interactive element labelled and traited; recordings list supports rotor navigation by headings (Latest Session, Baseline, Momentum).  
3. **Reduce Motion:** disable waveform animations + parallax.  
4. **Reduce Transparency:** Material components fall back to opaque backgrounds with maintained contrast.  
5. **Color Contrast:** minimum 4.5:1 for text; 3:1 for large titles; ensure metrics on glass have tinted backdrop.  
6. **Localisation-ready:** avoid hard-coded widths; text can expand.  
7. **Hearing Accessibility:** provide visual equivalents for audio cues (e.g., a visual toast + haptic for recording transitions).

---

## 8. Implementation Notes
- Build a `DesignTokens.ts` exporting spacing, colors, radii, text styles.  
- `MaterialCard` + `LiquidGlassView` should consume tokens and check reduce-transparency hook.  
- Navigation header uses `BlurView` + gradient overlay for Liquid Glass; on Android fallback to translucent solid color.  
- Create `SFSymbol` component wrapping `react-native-sfsymbols` to provide graceful fallbacks on non-iOS platforms.
- Create `useHaptics` hook that respects user’s “System Haptics” setting and Reduce Motion (skip heavy haptics when disabled).  
- Add Storybook/Expo component screen to validate tokens before wiring into full screens.  
- Document all components in `/docs/components/README.md` once built.

---

## 9. Open Questions
1. Exact accent palette for shareable cards/social export – pending final brand direction.  
2. Do we support custom themes (e.g., Headspace-like seasonal colors) or stick to system tint?  
3. Final decision on embedding illustrations/mascots vs. purely textual UI.  
4. Interaction model for microphone calibration (coach overlay?).  
5. Asset pipeline for ElevenLabs cues (if used later) – needs load/perf guidance.

---

This spec is the source of truth for all UI work going forward. Revisions require a PR + product/design sign-off. Once tokens/components are coded, snapshot them via Playroom/Storybook and attach to this doc.
